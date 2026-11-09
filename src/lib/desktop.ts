import type {
  DesktopSystemInfo,
  EscrowReceiptPayload,
  ServiceProbeResult,
} from "../../electron/services";
import type { ElectronDesktopBridge } from "../../electron/preload";

declare global {
  interface Window {
    electronAPI?: ElectronDesktopBridge;
  }
}

export type { DesktopSystemInfo, EscrowReceiptPayload, ServiceProbeResult };

const FALLBACK_CLUSTER: ServiceProbeResult[] = [
  {
    id: "fiverr-api-gateway",
    name: "API Gateway (Edge Router)",
    port: 8080,
    category: "GATEWAY",
    status: "UP",
    latencyMs: 4,
    swaggerUrl: "http://localhost:8080/swagger-ui/index.html",
    description: "Spring Cloud Gateway • JWT Verification, Redis Rate Limiter & CORS",
  },
  {
    id: "fiverr-auth-service",
    name: "Auth & IAM Service",
    port: 8081,
    category: "MICROSERVICE",
    status: "UP",
    latencyMs: 6,
    swaggerUrl: "http://localhost:8081/swagger-ui/index.html",
    dddRepository: "domain/repository/AccountRepository.java",
    description: "Identity Registration, BCrypt Credentials, JWT Access & Refresh Tokens",
  },
  {
    id: "fiverr-user-service",
    name: "User & Seller Level Service",
    port: 8082,
    category: "MICROSERVICE",
    status: "UP",
    latencyMs: 5,
    swaggerUrl: "http://localhost:8082/swagger-ui/index.html",
    dddRepository: "domain/repository/UserProfileRepository.java",
    description: "Freelancer Profiles, Skills, Seller Level Evaluation (Top Rated / Pro)",
  },
  {
    id: "fiverr-gig-service",
    name: "Gig & 3-Tier Catalog Service",
    port: 8083,
    category: "MICROSERVICE",
    status: "UP",
    latencyMs: 7,
    swaggerUrl: "http://localhost:8083/swagger-ui/index.html",
    dddRepository: "domain/repository/GigRepository.java",
    description: "3-Tier Pricing Packages (Basic, Standard, Premium) & Full-Text Search",
  },
  {
    id: "fiverr-order-service",
    name: "Order Lifecycle Saga Service",
    port: 8084,
    category: "MICROSERVICE",
    status: "UP",
    latencyMs: 6,
    swaggerUrl: "http://localhost:8084/swagger-ui/index.html",
    dddRepository: "domain/repository/OrderRepository.java",
    description: "Order State Machine (IN_PROGRESS, DELIVERED, REVISION, COMPLETED)",
  },
  {
    id: "fiverr-payment-service",
    name: "Payment & Escrow Ledger Service",
    port: 8085,
    category: "MICROSERVICE",
    status: "UP",
    latencyMs: 8,
    swaggerUrl: "http://localhost:8085/swagger-ui/index.html",
    dddRepository: "domain/repository/EscrowPaymentRepository.java",
    description: "Escrow Deposit Ledger, 5.5% Service Fee, Seller Wallet & Withdrawals",
  },
  {
    id: "fiverr-messaging-service",
    name: "Real-Time Messaging Service",
    port: 8086,
    category: "MICROSERVICE",
    status: "UP",
    latencyMs: 5,
    swaggerUrl: "http://localhost:8086/swagger-ui/index.html",
    dddRepository: "domain/repository/ConversationRepository.java",
    description: "Buyer-Seller Chat Threads, File Attachments & Custom Milestone Offers",
  },
  {
    id: "fiverr-review-service",
    name: "3-Criteria Review Service",
    port: 8087,
    category: "MICROSERVICE",
    status: "UP",
    latencyMs: 6,
    swaggerUrl: "http://localhost:8087/swagger-ui/index.html",
    dddRepository: "domain/repository/ReviewRepository.java",
    description: "Verified Buyer Reviews (Communication, Service as Described, Recommend)",
  },
  {
    id: "fiverr-notification-service",
    name: "Multi-Channel Notification Service",
    port: 8088,
    category: "MICROSERVICE",
    status: "UP",
    latencyMs: 5,
    swaggerUrl: "http://localhost:8088/swagger-ui/index.html",
    dddRepository: "domain/repository/NotificationRepository.java",
    description: "Kafka Event-Driven In-App, Email & Push Alerts for Escrow Lifecycle",
  },
];

export const desktopClient = {
  isElectron(): boolean {
    return typeof window !== "undefined" && Boolean(window.electronAPI?.isElectron);
  },

  getPlatform(): string {
    if (typeof window !== "undefined" && window.electronAPI?.platform) {
      return window.electronAPI.platform;
    }
    return "darwin";
  },

  async getSystemInfo(): Promise<DesktopSystemInfo> {
    if (typeof window !== "undefined" && window.electronAPI) {
      return window.electronAPI.getSystemInfo();
    }
    return {
      appName: "FIVERREX Desktop",
      appVersion: "1.0.0",
      electronVersion: "34.0.0",
      chromeVersion: "132.0.0",
      nodeVersion: "22.21.0",
      v8Version: "13.2",
      platform: "darwin (macOS)",
      arch: "arm64",
      hostname: "fiverrex-workstation.local",
      cpus: 10,
      totalMemoryGb: 32,
      freeMemoryGb: 14.5,
      userDataPath: "~/Library/Application Support/FIVERREX Desktop",
    };
  },

  async probeClusterHealth(host?: string): Promise<ServiceProbeResult[]> {
    if (typeof window !== "undefined" && window.electronAPI) {
      return window.electronAPI.probeClusterHealth(host);
    }
    return FALLBACK_CLUSTER;
  },

  async notify(title: string, body: string): Promise<boolean> {
    if (typeof window !== "undefined" && window.electronAPI) {
      return window.electronAPI.showNativeNotification({ title, body });
    }
    return false;
  },

  async exportEscrowReceipt(
    payload: EscrowReceiptPayload
  ): Promise<{ saved: boolean; filePath?: string }> {
    if (typeof window !== "undefined" && window.electronAPI) {
      return window.electronAPI.exportEscrowReceipt(payload);
    }
    // Browser fallback download
    if (typeof window !== "undefined") {
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `FIVERREX-Escrow-Receipt-${payload.orderNumber.replace("#", "")}.json`;
      a.click();
      URL.revokeObjectURL(url);
      return { saved: true, filePath: a.download };
    }
    return { saved: false };
  },

  async selectDeliverableFiles(): Promise<string[]> {
    if (typeof window !== "undefined" && window.electronAPI) {
      return window.electronAPI.selectDeliverableFiles();
    }
    return [`deliverable-release-bundle-${Date.now().toString().slice(-4)}.zip (18.4 MB)`];
  },

  async openExternal(url: string): Promise<void> {
    if (typeof window !== "undefined" && window.electronAPI) {
      await window.electronAPI.openExternalUrl(url);
      return;
    }
    if (typeof window !== "undefined") {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  },

  async storeGet<T>(key: string, defaultValue: T): Promise<T> {
    if (typeof window !== "undefined" && window.electronAPI) {
      return window.electronAPI.storeGet(key, defaultValue);
    }
    if (typeof window !== "undefined") {
      try {
        const raw = window.localStorage.getItem(`fiverrex_desktop_${key}`);
        return raw ? (JSON.parse(raw) as T) : defaultValue;
      } catch {
        return defaultValue;
      }
    }
    return defaultValue;
  },

  async storeSet(key: string, value: unknown): Promise<void> {
    if (typeof window !== "undefined" && window.electronAPI) {
      await window.electronAPI.storeSet(key, value);
    }
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(`fiverrex_desktop_${key}`, JSON.stringify(value));
      } catch {
        // ignore
      }
    }
  },

  async windowControl(
    action: "minimize" | "maximize" | "close" | "reload" | "devtools"
  ): Promise<void> {
    if (typeof window !== "undefined" && window.electronAPI) {
      await window.electronAPI.windowControl(action);
    }
  },

  onNavigateShortcut(callback: (route: string) => void): () => void {
    if (typeof window !== "undefined" && window.electronAPI) {
      return window.electronAPI.onNavigateShortcut(callback);
    }
    return () => {};
  },
};

