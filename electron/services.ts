import fs from "node:fs";
import path from "node:path";
import net from "node:net";
import os from "node:os";

export interface ServiceProbeResult {
  id: string;
  name: string;
  port: number;
  category: "GATEWAY" | "MICROSERVICE" | "FRONTEND" | "INFRASTRUCTURE";
  status: "UP" | "DOWN";
  latencyMs: number;
  swaggerUrl?: string;
  dddRepository?: string;
  description: string;
}

export interface DesktopSystemInfo {
  appName: string;
  appVersion: string;
  electronVersion: string;
  chromeVersion: string;
  nodeVersion: string;
  v8Version: string;
  platform: string;
  arch: string;
  hostname: string;
  cpus: number;
  totalMemoryGb: number;
  freeMemoryGb: number;
  userDataPath: string;
}

export interface EscrowReceiptPayload {
  orderNumber: string;
  orderId: string;
  gigTitle: string;
  packageTier: string;
  buyerName: string;
  sellerName: string;
  amount: number;
  serviceFee: number;
  totalEscrow: number;
  status: string;
  escrowStatus: string;
  gatewayChargeId: string;
  createdAt: string;
  completedAt?: string;
}

export const FIVERREX_CLUSTER_TARGETS: Array<{
  id: string;
  name: string;
  port: number;
  category: "GATEWAY" | "MICROSERVICE" | "FRONTEND" | "INFRASTRUCTURE";
  swaggerUrl?: string;
  dddRepository?: string;
  description: string;
}> = [
  {
    id: "fiverr-api-gateway",
    name: "API Gateway (Edge Router)",
    port: 8080,
    category: "GATEWAY",
    swaggerUrl: "http://localhost:8080/swagger-ui/index.html",
    description: "Spring Cloud Gateway • JWT Verification, Redis Rate Limiter & CORS",
  },
  {
    id: "fiverr-auth-service",
    name: "Auth & IAM Service",
    port: 8081,
    category: "MICROSERVICE",
    swaggerUrl: "http://localhost:8081/swagger-ui/index.html",
    dddRepository: "domain/repository/AccountRepository.java",
    description: "Identity Registration, BCrypt Credentials, JWT Access & Refresh Tokens",
  },
  {
    id: "fiverr-user-service",
    name: "User & Seller Level Service",
    port: 8082,
    category: "MICROSERVICE",
    swaggerUrl: "http://localhost:8082/swagger-ui/index.html",
    dddRepository: "domain/repository/UserProfileRepository.java",
    description: "Freelancer Profiles, Skills, Seller Level Evaluation (Top Rated / Pro)",
  },
  {
    id: "fiverr-gig-service",
    name: "Gig & 3-Tier Catalog Service",
    port: 8083,
    category: "MICROSERVICE",
    swaggerUrl: "http://localhost:8083/swagger-ui/index.html",
    dddRepository: "domain/repository/GigRepository.java",
    description: "3-Tier Pricing Packages (Basic, Standard, Premium) & Full-Text Search",
  },
  {
    id: "fiverr-order-service",
    name: "Order Lifecycle Saga Service",
    port: 8084,
    category: "MICROSERVICE",
    swaggerUrl: "http://localhost:8084/swagger-ui/index.html",
    dddRepository: "domain/repository/OrderRepository.java",
    description: "Order State Machine (IN_PROGRESS, DELIVERED, REVISION, COMPLETED)",
  },
  {
    id: "fiverr-payment-service",
    name: "Payment & Escrow Ledger Service",
    port: 8085,
    category: "MICROSERVICE",
    swaggerUrl: "http://localhost:8085/swagger-ui/index.html",
    dddRepository: "domain/repository/EscrowPaymentRepository.java",
    description: "Escrow Deposit Ledger, 5.5% Service Fee, Seller Wallet & Withdrawals",
  },
  {
    id: "fiverr-messaging-service",
    name: "Real-Time Messaging Service",
    port: 8086,
    category: "MICROSERVICE",
    swaggerUrl: "http://localhost:8086/swagger-ui/index.html",
    dddRepository: "domain/repository/ConversationRepository.java",
    description: "Buyer-Seller Chat Threads, File Attachments & Custom Milestone Offers",
  },
  {
    id: "fiverr-review-service",
    name: "3-Criteria Review Service",
    port: 8087,
    category: "MICROSERVICE",
    swaggerUrl: "http://localhost:8087/swagger-ui/index.html",
    dddRepository: "domain/repository/ReviewRepository.java",
    description: "Verified Buyer Reviews (Communication, Service as Described, Recommend)",
  },
  {
    id: "fiverr-notification-service",
    name: "Multi-Channel Notification Service",
    port: 8088,
    category: "MICROSERVICE",
    swaggerUrl: "http://localhost:8088/swagger-ui/index.html",
    dddRepository: "domain/repository/NotificationRepository.java",
    description: "Kafka Event-Driven In-App, Email & Push Alerts for Escrow Lifecycle",
  },
  {
    id: "fiverr-web",
    name: "Next.js 15 Web Portal",
    port: 3000,
    category: "FRONTEND",
    description: "Web Companion Marketplace (Next.js 15 App Router)",
  },
  {
    id: "fiverr-postgres",
    name: "PostgreSQL 16 Cluster",
    port: 5432,
    category: "INFRASTRUCTURE",
    description: "8 Isolated Microservice Databases with Flyway Schema Migrations",
  },
  {
    id: "fiverr-redis",
    name: "Redis 7.4 Cache & Rate Limiter",
    port: 6379,
    category: "INFRASTRUCTURE",
    description: "Distributed Cache for Gig Catalog & API Gateway Token Bucket",
  },
  {
    id: "fiverr-kafka",
    name: "Apache Kafka Event Mesh (KRaft)",
    port: 9092,
    category: "INFRASTRUCTURE",
    description: "Asynchronous Order, Escrow, Review & Notification Event Bus",
  },
];

export function checkTcpPort(
  port: number,
  host = "127.0.0.1",
  timeoutMs = 600
): Promise<{ open: boolean; latencyMs: number }> {
  return new Promise((resolve) => {
    const start = Date.now();
    const socket = new net.Socket();
    let settled = false;

    const finish = (open: boolean) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve({ open, latencyMs: Math.max(1, Date.now() - start) });
    };

    socket.setTimeout(timeoutMs);
    socket.once("connect", () => finish(true));
    socket.once("timeout", () => finish(false));
    socket.once("error", () => finish(false));

    socket.connect(port, host);
  });
}

export async function probeClusterServices(host = "127.0.0.1"): Promise<ServiceProbeResult[]> {
  const results = await Promise.all(
    FIVERREX_CLUSTER_TARGETS.map(async (target) => {
      const probe = await checkTcpPort(target.port, host, 550);
      return {
        ...target,
        status: probe.open ? ("UP" as const) : ("DOWN" as const),
        latencyMs: probe.open ? probe.latencyMs : 0,
      };
    })
  );
  return results;
}

export function getSystemDiagnostics(userDataPath: string, appVersion = "1.0.0"): DesktopSystemInfo {
  return {
    appName: "FIVERREX Desktop",
    appVersion,
    electronVersion: process.versions.electron || "34.0.0",
    chromeVersion: process.versions.chrome || "132.0.0",
    nodeVersion: process.versions.node || process.version,
    v8Version: process.versions.v8 || "13.2",
    platform: `${os.platform()} (${os.release()})`,
    arch: os.arch(),
    hostname: os.hostname(),
    cpus: os.cpus().length,
    totalMemoryGb: Number((os.totalmem() / 1024 ** 3).toFixed(1)),
    freeMemoryGb: Number((os.freemem() / 1024 ** 3).toFixed(1)),
    userDataPath,
  };
}

export class DesktopJsonStore {
  private readonly filePath: string;
  private cache: Record<string, unknown> = {};

  constructor(storageDir: string, fileName = "fiverrex-desktop-store.json") {
    this.filePath = path.join(storageDir, fileName);
    this.load();
  }

  private load(): void {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, "utf-8");
        this.cache = JSON.parse(raw);
      }
    } catch {
      this.cache = {};
    }
  }

  private persist(): void {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.filePath, JSON.stringify(this.cache, null, 2), "utf-8");
    } catch {
      // ignore disk errors in restricted environments
    }
  }

  public get<T = unknown>(key: string, defaultValue?: T): T {
    if (key in this.cache) {
      return this.cache[key] as T;
    }
    return defaultValue as T;
  }

  public set(key: string, value: unknown): void {
    this.cache[key] = value;
    this.persist();
  }

  public getAll(): Record<string, unknown> {
    return { ...this.cache };
  }
}

export function formatEscrowReceiptMarkdown(receipt: EscrowReceiptPayload): string {
  return [
    `# FIVERREX OFFICIAL ESCROW LEDGER RECEIPT`,
    ``,
    `- **Order Number**: \`${receipt.orderNumber}\``,
    `- **Order UUID**: \`${receipt.orderId}\``,
    `- **Escrow Charge Reference**: \`${receipt.gatewayChargeId}\``,
    `- **Issued At**: ${new Date().toISOString()}`,
    ``,
    `## 1. Parties & Service Package`,
    `- **Gig Title**: ${receipt.gigTitle}`,
    `- **Selected Tier**: ${receipt.packageTier} Package`,
    `- **Buyer**: ${receipt.buyerName}`,
    `- **Verified Seller**: ${receipt.sellerName}`,
    ``,
    `## 2. Escrow Financial Breakdown (\`fiverr-payment-service\`)`,
    `| Line Item | Amount (USD) |`,
    `|---|---|`,
    `| Package Subtotal | $${receipt.amount.toFixed(2)} |`,
    `| Escrow Protection & Platform Fee (5.5%) | $${receipt.serviceFee.toFixed(2)} |`,
    `| **Total Locked in Escrow** | **$${receipt.totalEscrow.toFixed(2)}** |`,
    ``,
    `## 3. Saga Lifecycle State`,
    `- **Order Saga Status (\`fiverr-order-service\`)**: \`${receipt.status}\``,
    `- **Escrow Ledger Status (\`fiverr-payment-service\`)**: \`${receipt.escrowStatus}\``,
    `- **Created Timestamp**: ${receipt.createdAt}`,
    receipt.completedAt ? `- **Completed Timestamp**: ${receipt.completedAt}` : null,
    ``,
    `---`,
    `*Verified by FIVERREX Desktop (Electron) • Domain-Driven Design & Hexagonal Architecture Ecosystem*`,
  ]
    .filter(Boolean)
    .join("\n");
}
