export type SellerLevel = "Top Rated Seller" | "Level 2 Seller" | "Level 1 Seller" | "Pro Verified";
export type PackageTierName = "Basic" | "Standard" | "Premium";
export type OrderStatus = "IN_PROGRESS" | "DELIVERED" | "REVISION_REQUESTED" | "COMPLETED" | "CANCELLED";

export interface PackageTier {
  tier: PackageTierName;
  title: string;
  description: string;
  price: number;
  deliveryDays: number;
  revisions: number | "Unlimited";
  features: string[];
}

export interface ReviewItem {
  id: string;
  buyerName: string;
  buyerCountry: string;
  buyerAvatar: string;
  ratingOverall: number;
  communicationRating: number;
  serviceAsDescribedRating: number;
  recommendRating: number;
  comment: string;
  packageOrdered: PackageTierName;
  priceRange: string;
  createdAt: string;
  sellerResponse?: string;
}

export type GigReview = ReviewItem;

export interface GigSeller {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  level: SellerLevel;
  tagline: string;
  country: string;
  memberSince: string;
  avgResponseTime: string;
  lastDelivery: string;
  languages: string[];
  bio: string;
}

export interface Gig {
  id: string;
  title: string;
  slug: string;
  category: string;
  subcategory: string;
  thumbnailUrl: string;
  galleryUrls: string[];
  seller: GigSeller;
  rating: number;
  reviewCount: number;
  ordersInQueue: number;
  startingPrice: number;
  tags: string[];
  description: string;
  highlights: string[];
  packages: Record<PackageTierName, PackageTier>;
  reviews: ReviewItem[];
  criteriaAverages: {
    communication: number;
    serviceAsDescribed: number;
    recommend: number;
  };
}

export interface Order {
  id: string;
  orderNumber: string;
  gigId: string;
  gigTitle: string;
  gigThumbnail: string;
  packageTier: PackageTierName;
  buyerName: string;
  buyerUsername: string;
  sellerName: string;
  sellerUsername: string;
  sellerLevel: SellerLevel;
  amount: number;
  serviceFee: number;
  totalEscrow: number;
  status: OrderStatus;
  dueDate: string;
  createdAt: string;
  deliveredAt?: string;
  completedAt?: string;
  revisionsUsed: number;
  revisionsAllowed: number | "Unlimited";
  requirements: string;
  deliveryNote?: string;
  deliveryAttachments?: string[];
  buyerId?: string;
  sellerId?: string;
  escrowReference?: string;
}

export interface SellerDashboardStats {
  escrowPendingBalance: number;
  availableForWithdrawal: number;
  clearedThisMonth: number;
  activeOrdersCount: number;
  activeOrdersValue: number;
  sellerLevel: SellerLevel;
  nextEvaluationDate: string;
  metrics: {
    inboxResponseRate: number;
    onTimeDeliveryRate: number;
    orderCompletionRate: number;
    overallRating: number;
  };
}

export interface MessageItem {
  id: string;
  sender: "buyer" | "seller";
  senderName: string;
  text: string;
  timestamp: string;
  customOffer?: {
    offerId?: string;
    gigId?: string;
    title: string;
    packageTier: PackageTierName;
    price: number;
    deliveryDays: number;
    revisions: number;
    status: "PENDING" | "ACCEPTED";
  };
}

export interface Conversation {
  id: string;
  buyerId?: string;
  sellerId?: string;
  gigId?: string;
  participantName: string;
  participantUsername: string;
  participantAvatar: string;
  participantRole: "Buyer" | "Seller";
  participantLevel?: SellerLevel;
  online: boolean;
  relatedGigTitle: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: MessageItem[];
}

export interface AuthAccountDto {
  id: string;
  username: string;
  email: string;
  roles: string[];
  status: string;
  emailVerified: boolean;
  lastLoginAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  account: AuthAccountDto;
  sellerId: string;
  profileId: string;
  displayName: string;
  avatarUrl: string;
}

export interface UserProfileDto {
  id: string;
  accountId: string;
  username: string;
  displayName: string;
  headline: string;
  bio: string;
  avatarUrl: string;
  country: string;
  languages: string[];
  skills: string[];
  hourlyRate: number;
  seller: boolean;
  sellerLevel: string;
  availabilityStatus: string;
  completedOrdersCount: number;
  ratingAverage: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface NotificationItem {
  id: string;
  recipientUserId: string;
  type: string;
  title: string;
  message: string;
  channel: string;
  read: boolean;
  readAt?: string | null;
  createdAt: string;
}

export interface EscrowTransactionItem {
  id: string;
  orderId: string;
  buyerId: string;
  sellerId: string;
  grossAmount: number;
  platformFee: number;
  sellerNetPayout: number;
  gatewayChargeId: string;
  status: "HELD" | "RELEASED" | "REFUNDED";
  createdAt: string;
  updatedAt: string;
}

export interface SellerWalletItem {
  sellerId: string;
  availableBalance: number;
  withdrawnTotal: number;
  createdAt: string;
  updatedAt: string;
}

export interface GatewayStatusInfo {
  service: string;
  brand: string;
  status: string;
  swaggerUi: string;
  openApiDocs: string;
  timestamp: string;
  routes: string[];
}

const GATEWAY_URL_STORAGE_KEY = "fiverrex_gateway_url";

export function getApiGatewayUrl(): string {
  if (typeof window !== "undefined") {
    try {
      const saved = window.localStorage.getItem(GATEWAY_URL_STORAGE_KEY);
      if (saved && saved.trim()) return saved.trim().replace(/\/+$/, "");
    } catch {
      // ignore
    }
  }
  return "http://localhost:8080/api/v1";
}

export function setApiGatewayUrl(url: string): void {
  if (typeof window === "undefined") return;
  try {
    const cleaned = url.trim().replace(/\/+$/, "");
    window.localStorage.setItem(GATEWAY_URL_STORAGE_KEY, cleaned);
    window.dispatchEvent(new CustomEvent("fiverrex-gateway-change", { detail: cleaned }));
  } catch {
    // ignore
  }
}

export const API_GATEWAY_URL = "http://localhost:8080/api/v1";

export const GATEWAY_ROOT_URL = "http://localhost:8080";

const SESSION_STORAGE_KEY = "fiverrex_session";

export const DEFAULT_AUTH_ACCOUNTS: AuthAccountDto[] = [
  {
    id: "33333333-3333-3333-3333-333333333333",
    username: "jordan_taylor",
    email: "jordan@fiverrex.club",
    roles: ["BUYER", "SELLER"],
    status: "ACTIVE",
    emailVerified: true,
  },
  {
    id: "11111111-1111-1111-1111-111111111111",
    username: "alex_architect",
    email: "alex@fiverrex.club",
    roles: ["BUYER", "SELLER"],
    status: "ACTIVE",
    emailVerified: true,
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    username: "elena_ai",
    email: "elena@fiverrex.club",
    roles: ["BUYER", "SELLER"],
    status: "ACTIVE",
    emailVerified: true,
  },
];

const ACCOUNT_PROFILE_META: Record<
  string,
  { displayName: string; avatarUrl: string; profileId: string; sellerId: string }
> = {
  "11111111-1111-1111-1111-111111111111": {
    displayName: "Alex Rivera",
    avatarUrl:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80",
    profileId: "aaaaaaaa-1111-1111-1111-111111111111",
    sellerId: "11111111-1111-1111-1111-111111111111",
  },
  "22222222-2222-2222-2222-222222222222": {
    displayName: "Elena Vance",
    avatarUrl:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=250&q=80",
    profileId: "aaaaaaaa-2222-2222-2222-222222222222",
    sellerId: "22222222-2222-2222-2222-222222222222",
  },
  "33333333-3333-3333-3333-333333333333": {
    displayName: "Jordan Taylor",
    avatarUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80",
    profileId: "aaaaaaaa-3333-3333-3333-333333333333",
    sellerId: "11111111-1111-1111-1111-111111111111",
  },
};

export function getDefaultAuthSession(): AuthSession {
  const defaultAccount = DEFAULT_AUTH_ACCOUNTS[0];
  const meta = ACCOUNT_PROFILE_META[defaultAccount.id];
  return {
    accessToken: "",
    refreshToken: "",
    account: defaultAccount,
    sellerId: meta.sellerId,
    profileId: meta.profileId,
    displayName: meta.displayName,
    avatarUrl: meta.avatarUrl,
  };
}

export function getAuthSession(): AuthSession {
  if (typeof window === "undefined") {
    return getDefaultAuthSession();
  }
  try {
    const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return getDefaultAuthSession();
    const parsed = JSON.parse(raw) as AuthSession;
    if (!parsed?.account?.id) return getDefaultAuthSession();
    return parsed;
  } catch {
    return getDefaultAuthSession();
  }
}

export function setAuthSession(session: AuthSession): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    window.dispatchEvent(new CustomEvent("fiverrex-session-change", { detail: session }));
  } catch {
    // ignore storage quota errors
  }
}

export function clearAuthSession(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    window.dispatchEvent(
      new CustomEvent("fiverrex-session-change", { detail: getDefaultAuthSession() })
    );
  } catch {
    // ignore
  }
}

export function buildSessionForAccount(
  account: AuthAccountDto,
  accessToken = "",
  refreshToken = ""
): AuthSession {
  const meta = ACCOUNT_PROFILE_META[account.id] || {
    displayName: account.username
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" "),
    avatarUrl:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80",
    profileId: "aaaaaaaa-3333-3333-3333-333333333333",
    sellerId: "11111111-1111-1111-1111-111111111111",
  };
  return {
    accessToken,
    refreshToken,
    account,
    sellerId: meta.sellerId,
    profileId: meta.profileId,
    displayName: meta.displayName,
    avatarUrl: meta.avatarUrl,
  };
}

// ============================================================================
// Saved Gigs / Wishlist Persistence (localStorage + CustomEvent sync)
// ============================================================================

const SAVED_GIGS_STORAGE_KEY = "fiverrex_saved_gigs";
const DEFAULT_SAVED_GIG_IDS = ["gig-101", "gig-103"];

export function getSavedGigIds(): string[] {
  if (typeof window === "undefined") {
    return DEFAULT_SAVED_GIG_IDS;
  }
  try {
    const raw = window.localStorage.getItem(SAVED_GIGS_STORAGE_KEY);
    if (!raw) return DEFAULT_SAVED_GIG_IDS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(String) : DEFAULT_SAVED_GIG_IDS;
  } catch {
    return DEFAULT_SAVED_GIG_IDS;
  }
}

export function isGigSaved(gigId: string): boolean {
  const saved = getSavedGigIds();
  return saved.includes(gigId);
}

export function toggleSavedGigId(gigId: string): string[] {
  if (typeof window === "undefined") return DEFAULT_SAVED_GIG_IDS;
  const current = getSavedGigIds();
  const next = current.includes(gigId)
    ? current.filter((id) => id !== gigId)
    : [...current, gigId];
  try {
    window.localStorage.setItem(SAVED_GIGS_STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent("fiverrex-favorites-change", { detail: next }));
  } catch {
    // ignore storage quota errors
  }
  return next;
}

export function clearSavedGigs(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SAVED_GIGS_STORAGE_KEY, JSON.stringify([]));
    window.dispatchEvent(new CustomEvent("fiverrex-favorites-change", { detail: [] }));
  } catch {
    // ignore
  }
}

export const SEED_USER_PROFILES: UserProfileDto[] = [
  {
    id: "aaaaaaaa-1111-1111-1111-111111111111",
    accountId: "11111111-1111-1111-1111-111111111111",
    username: "alex_architect",
    displayName: "Alex Rivera",
    headline: "Principal Distributed Systems & Java DDD Architect",
    bio: "Former Staff Engineer specializing in Java 21, Spring Boot 3, Domain-Driven Design (DDD), Hexagonal Ports & Adapters, Apache Kafka, and Kubernetes Helm infrastructure. Over 180 enterprise systems delivered with 100% on-time completion.",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80",
    country: "United States",
    languages: ["English (Fluent)", "Spanish (Native)"],
    skills: ["Java 21", "Spring Boot 3", "DDD Hexagonal", "Apache Kafka", "Kubernetes", "PostgreSQL"],
    hourlyRate: 185,
    seller: true,
    sellerLevel: "Top Rated Seller",
    availabilityStatus: "AVAILABLE",
    completedOrdersCount: 248,
    ratingAverage: 5.0,
    createdAt: "2021-03-15T10:00:00Z",
  },
  {
    id: "aaaaaaaa-2222-2222-2222-222222222222",
    accountId: "22222222-2222-2222-2222-222222222222",
    username: "elena_ai",
    displayName: "Sophia Chen",
    headline: "Staff Frontend Engineer & Next.js 15 Product Architect",
    bio: "Ex-Shopify & Vercel ecosystem specialist crafting ultra-fast Next.js 15 App Router applications with TypeScript, Tailwind CSS, interactive escrow workspaces, and seamless REST/GraphQL API integrations.",
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80",
    country: "Canada",
    languages: ["English (Native)", "Mandarin (Fluent)"],
    skills: ["Next.js 15", "React 19", "TypeScript", "Tailwind CSS", "Design Systems", "Vercel"],
    hourlyRate: 165,
    seller: true,
    sellerLevel: "Pro Verified",
    availabilityStatus: "AVAILABLE",
    completedOrdersCount: 184,
    ratingAverage: 4.9,
    createdAt: "2022-01-10T10:00:00Z",
  },
  {
    id: "aaaaaaaa-4444-4444-4444-444444444444",
    accountId: "22222222-2222-2222-2222-222222222222",
    username: "dr_aryan_ai",
    displayName: "Dr. Aryan Mehta",
    headline: "AI Research Scientist & Production LLM / RAG Architect",
    bio: "PhD in Machine Learning with 8+ years deploying low-latency AI agents, semantic search engines, pgvector pipelines, and multi-agent LangGraph workflows for global enterprises.",
    avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=250&q=80",
    country: "Singapore",
    languages: ["English (Native)", "Hindi (Native)"],
    skills: ["AI Agents", "LangChain", "OpenAI", "pgvector", "Python", "RAG Pipelines"],
    hourlyRate: 210,
    seller: true,
    sellerLevel: "Top Rated Seller",
    availabilityStatus: "AVAILABLE",
    completedOrdersCount: 312,
    ratingAverage: 4.9,
    createdAt: "2020-08-20T10:00:00Z",
  },
  {
    id: "aaaaaaaa-5555-5555-5555-555555555555",
    accountId: "11111111-1111-1111-1111-111111111111",
    username: "claire_studio",
    displayName: "Claire Dubois",
    headline: "Creative Director & Enterprise Figma Design Systems Lead",
    bio: "Paris-based product designer helping high-growth startups craft memorable brand identities and scalable Figma component libraries with multi-theme design tokens.",
    avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=250&q=80",
    country: "France",
    languages: ["English (Fluent)", "French (Native)"],
    skills: ["Figma", "Design Systems", "UI/UX", "Brand Identity", "Interactive Prototyping"],
    hourlyRate: 145,
    seller: true,
    sellerLevel: "Level 2 Seller",
    availabilityStatus: "AVAILABLE",
    completedOrdersCount: 142,
    ratingAverage: 4.9,
    createdAt: "2022-05-12T10:00:00Z",
  },
  {
    id: "aaaaaaaa-6666-6666-6666-666666666666",
    accountId: "11111111-1111-1111-1111-111111111111",
    username: "marcus_sre",
    displayName: "Viktor Lindqvist",
    headline: "CNCF Kubestronaut & Principal Kubernetes / DevOps SRE",
    bio: "Certified Kubernetes Security Specialist (CKS, CKA, CKAD) helping teams migrate from Docker Compose to zero-downtime Kubernetes clusters with Helm v3, Kustomize, ArgoCD, and NetworkPolicies.",
    avatarUrl: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=250&q=80",
    country: "Sweden",
    languages: ["English (Fluent)", "Swedish (Native)"],
    skills: ["Kubernetes", "Helm v3", "Kustomize", "GitHub Actions", "Terraform", "Prometheus"],
    hourlyRate: 175,
    seller: true,
    sellerLevel: "Top Rated Seller",
    availabilityStatus: "AVAILABLE",
    completedOrdersCount: 196,
    ratingAverage: 5.0,
    createdAt: "2020-11-04T10:00:00Z",
  },
  {
    id: "aaaaaaaa-7777-7777-7777-777777777777",
    accountId: "22222222-2222-2222-2222-222222222222",
    username: "sofia_fintech",
    displayName: "Enzo Moretti",
    headline: "3D Motion Director & Fintech Product Launch Specialist",
    bio: "Creating high-impact 4K 60fps SaaS product launch films, 3D interactive walkthroughs, and motion design systems for YCombinator startups and global fintech teams.",
    avatarUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=250&q=80",
    country: "Italy",
    languages: ["English (Fluent)", "Italian (Native)"],
    skills: ["After Effects", "3D Motion", "SaaS Explainers", "Cinema 4D", "Sound Design"],
    hourlyRate: 140,
    seller: true,
    sellerLevel: "Level 2 Seller",
    availabilityStatus: "AVAILABLE",
    completedOrdersCount: 97,
    ratingAverage: 4.8,
    createdAt: "2022-07-19T10:00:00Z",
  },
  {
    id: "aaaaaaaa-3333-3333-3333-333333333333",
    accountId: "33333333-3333-3333-3333-333333333333",
    username: "jordan_taylor",
    displayName: "Jordan Taylor",
    headline: "VP of Engineering & Full-Stack Cloud Architect",
    bio: "Enterprise engineering leader and verified FIVERREX dual Buyer/Seller building cloud-native marketplaces and financial escrow platforms.",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80",
    country: "United States",
    languages: ["English (Native)"],
    skills: ["System Architecture", "Spring Boot", "Next.js", "Escrow Systems", "Cloud Native"],
    hourlyRate: 160,
    seller: true,
    sellerLevel: "Pro Verified",
    availabilityStatus: "AVAILABLE",
    completedOrdersCount: 64,
    ratingAverage: 4.95,
    createdAt: "2023-02-01T10:00:00Z",
  },
];

const USERNAME_ALIASES: Record<string, string> = {
  alex_ddd_arch: "alex_architect",
  sophia_ui_craft: "elena_ai",
  k8s_viktor: "marcus_sre",
  motion_enzo: "sofia_fintech",
};

export function resolveCanonicalUsername(username: string): string {
  const clean = (username || "").trim().replace(/^@/, "").toLowerCase();
  return USERNAME_ALIASES[clean] || clean;
}

export const CATEGORIES = [
  "All Categories",
  "AI Services",
  "Programming & Tech",
  "Graphics & Design",
  "Digital Marketing",
  "Video & Animation",
  "Writing & Translation",
  "Cloud & DevOps",
] as const;

export const SEED_GIGS: Gig[] = [
  {
    id: "gig-101",
    title: "I will architect and build a production Spring Boot 3 microservices ecosystem on Kubernetes",
    slug: "architect-spring-boot-3-microservices-kubernetes",
    category: "Programming & Tech",
    subcategory: "Backend & Cloud Architecture",
    thumbnailUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1000&q=80",
    galleryUrls: [
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
    ],
    seller: {
      id: "11111111-1111-1111-1111-111111111111",
      username: "alex_architect",
      displayName: "Alex Rivera",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80",
      level: "Top Rated Seller",
      tagline: "Principal Distributed Systems & Java DDD Architect",
      country: "United States",
      memberSince: "Mar 2021",
      avgResponseTime: "1 hour",
      lastDelivery: "about 3 hours ago",
      languages: ["English (Fluent)", "Spanish (Native)"],
      bio: "Former Staff Engineer specializing in Java 21, Spring Boot 3, Domain-Driven Design (DDD), Hexagonal Ports & Adapters, Apache Kafka, and Kubernetes Helm infrastructure. Over 180 enterprise systems delivered with 100% on-time completion.",
    },
    rating: 5.0,
    reviewCount: 248,
    ordersInQueue: 7,
    startingPrice: 195,
    tags: ["Spring Boot", "Microservices", "DDD", "Kubernetes", "Apache Kafka"],
    description:
      "Need a rock-solid, cloud-native backend built with clean Domain-Driven Design (DDD) and Hexagonal Architecture? I will design and implement your Java 21 + Spring Boot 3 microservices with strict layer isolation, PostgreSQL persistence, Redis caching, Kafka event streaming, and complete Kubernetes + Helm deployment manifests.",
    highlights: [
      "Strict DDD & Hexagonal Architecture (domain/repository, application/usecase, infrastructure/persistence)",
      "Spring Cloud Gateway with JWT security, rate limiting, and circuit breakers",
      "Event-driven choreography/orchestration with Apache Kafka KRaft mode",
      "Production-ready Helm charts, HorizontalPodAutoscalers, and GitHub Actions CI/CD",
    ],
    packages: {
      Basic: {
        tier: "Basic",
        title: "Core DDD Microservice",
        description: "1 production Spring Boot 3 microservice with DDD Hexagonal layers, PostgreSQL, and Docker.",
        price: 195,
        deliveryDays: 3,
        revisions: 2,
        features: [
          "1 Spring Boot 3 + Java 21 Service",
          "Strict DDD Hexagonal Architecture",
          "PostgreSQL + Flyway Migrations",
          "OpenAPI / Swagger Documentation",
          "Unit & Integration Test Suite (85%+)",
        ],
      },
      Standard: {
        tier: "Standard",
        title: "Multi-Service + Kafka Event Mesh",
        description: "3 microservices + API Gateway + JWT Auth + Kafka event-driven communication + Docker Compose.",
        price: 490,
        deliveryDays: 7,
        revisions: 5,
        features: [
          "3 DDD Microservices + API Gateway",
          "JWT Authentication & RBAC",
          "Apache Kafka Event Producers/Consumers",
          "Redis Distributed Caching",
          "Complete Docker Compose Stack",
        ],
      },
      Premium: {
        tier: "Premium",
        title: "Full Enterprise Cloud Ecosystem",
        description: "Complete microservices platform + Next.js frontend integration + Kubernetes & Helm v3 infra.",
        price: 1250,
        deliveryDays: 14,
        revisions: "Unlimited",
        features: [
          "Up to 8 DDD Microservices + Gateway",
          "Escrow Ledger & Saga Orchestration",
          "Kubernetes StatefulSets & HPA Manifests",
          "Helm v3 Production Chart + Ingress TLS",
          "GitHub Actions CI/CD & Architecture Docs",
        ],
      },
    },
    criteriaAverages: {
      communication: 5.0,
      serviceAsDescribed: 5.0,
      recommend: 4.9,
    },
    reviews: [
      {
        id: "rev-1",
        buyerName: "Marcus Vance",
        buyerCountry: "United Kingdom",
        buyerAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
        ratingOverall: 5.0,
        communicationRating: 5.0,
        serviceAsDescribedRating: 5.0,
        recommendRating: 5.0,
        comment:
          "Unbelievable code quality. Every single microservice followed strict DDD Hexagonal rules with domain repositories cleanly separated from infrastructure adapters. Deployed straight to our EKS cluster via Helm on day one!",
        packageOrdered: "Premium",
        priceRange: "Over $1,000",
        createdAt: "2 days ago",
        sellerResponse: "Thank you Marcus! It was a pleasure architecting your fintech escrow platform.",
      },
      {
        id: "rev-2",
        buyerName: "Elena Rostova",
        buyerCountry: "Germany",
        buyerAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
        ratingOverall: 5.0,
        communicationRating: 5.0,
        serviceAsDescribedRating: 5.0,
        recommendRating: 4.9,
        comment:
          "Alex delivered our Order and Payment escrow services ahead of schedule. The Kafka event flow between services is rock solid and well-tested.",
        packageOrdered: "Standard",
        priceRange: "$400-$600",
        createdAt: "1 week ago",
      },
    ],
  },
  {
    id: "gig-102",
    title: "I will design and develop a high-converting Next.js 15 SaaS or Marketplace web app",
    slug: "design-develop-nextjs-15-saas-marketplace-web-app",
    category: "Programming & Tech",
    subcategory: "Full-Stack Web Development",
    thumbnailUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1000&q=80",
    galleryUrls: [
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
    ],
    seller: {
      id: "22222222-2222-2222-2222-222222222222",
      username: "elena_ai",
      displayName: "Sophia Chen",
      avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80",
      level: "Pro Verified",
      tagline: "Staff Frontend Engineer & Product Designer",
      country: "Canada",
      memberSince: "Jan 2022",
      avgResponseTime: "30 mins",
      lastDelivery: "about 1 hour ago",
      languages: ["English (Native)", "Mandarin (Fluent)"],
      bio: "Ex-Shopify & Vercel ecosystem specialist crafting ultra-fast Next.js 15 App Router applications with TypeScript, Tailwind CSS, and seamless REST/GraphQL API integrations.",
    },
    rating: 4.9,
    reviewCount: 184,
    ordersInQueue: 5,
    startingPrice: 150,
    tags: ["Next.js 15", "React 19", "TypeScript", "Tailwind CSS", "Marketplace"],
    description:
      "Transform your startup vision into a blazing-fast, responsive Next.js 15 application. I build pixel-perfect marketplaces, dashboards, and AI SaaS platforms with full TypeScript safety and clean API integration.",
    highlights: [
      "Next.js 15 App Router with Server & Client Components",
      "Custom Tailwind CSS design system with responsive breakpoints",
      "Interactive checkout flows, escrow dashboards, and real-time chat UI",
      "Standalone Docker build ready for Kubernetes or Vercel deployment",
    ],
    packages: {
      Basic: {
        tier: "Basic",
        title: "Landing Page + Core UI",
        description: "Up to 3 responsive Next.js 15 pages with custom Tailwind styling and interactive components.",
        price: 150,
        deliveryDays: 2,
        revisions: 3,
        features: [
          "3 Next.js 15 App Router Pages",
          "Responsive Mobile & Desktop UI",
          "TypeScript + Tailwind CSS",
          "SEO Metadata Optimization",
        ],
      },
      Standard: {
        tier: "Standard",
        title: "Full Marketplace Frontend",
        description: "5-7 pages including Catalog, Detail View, Order Workspace, Seller Studio, and API Client.",
        price: 380,
        deliveryDays: 5,
        revisions: 5,
        features: [
          "6 Complete Marketplace Views",
          "3-Tier Package Selector & Checkout",
          "Interactive Order & Escrow Timeline",
          "Typed REST API Client Integration",
          "Multi-stage Production Dockerfile",
        ],
      },
      Premium: {
        tier: "Premium",
        title: "Enterprise SaaS + Custom Design System",
        description: "Full-scale web platform with real-time messaging, analytics studio, and E2E testing.",
        price: 890,
        deliveryDays: 10,
        revisions: "Unlimited",
        features: [
          "12+ Custom Pages & Modals",
          "Real-time Inbox & Custom Offers",
          "Full Figma Design System Included",
          "Performance Optimization (98+ Lighthouse)",
          "CI/CD Pipeline + Kubernetes Manifests",
        ],
      },
    },
    criteriaAverages: {
      communication: 5.0,
      serviceAsDescribed: 4.9,
      recommend: 4.9,
    },
    reviews: [
      {
        id: "rev-3",
        buyerName: "David Kim",
        buyerCountry: "South Korea",
        buyerAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
        ratingOverall: 5.0,
        communicationRating: 5.0,
        serviceAsDescribedRating: 5.0,
        recommendRating: 5.0,
        comment:
          "Sophia's UI work looks like it came straight from a Series B startup design team. The 3-tier package selector and order workspace work flawlessly.",
        packageOrdered: "Standard",
        priceRange: "$300-$500",
        createdAt: "5 days ago",
      },
    ],
  },
  {
    id: "gig-103",
    title: "I will build a custom RAG AI Agent with LangChain, OpenAI, and Vector Databases",
    slug: "build-custom-rag-ai-agent-langchain-openai-vector-db",
    category: "AI Services",
    subcategory: "AI Agents & LLM Integration",
    thumbnailUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1000&q=80",
    galleryUrls: [
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1200&q=80",
    ],
    seller: {
      id: "22222222-2222-2222-2222-222222222222",
      username: "dr_aryan_ai",
      displayName: "Dr. Aryan Mehta",
      avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=250&q=80",
      level: "Top Rated Seller",
      tagline: "AI Research Scientist & Production LLM Architect",
      country: "Singapore",
      memberSince: "Aug 2020",
      avgResponseTime: "1 hour",
      lastDelivery: "about 5 hours ago",
      languages: ["English (Native)", "Hindi (Native)"],
      bio: "PhD in Machine Learning with 8+ years deploying low-latency AI agents, semantic search engines, and multi-agent workflows for global enterprises.",
    },
    rating: 4.9,
    reviewCount: 312,
    ordersInQueue: 9,
    startingPrice: 220,
    tags: ["AI Agent", "RAG", "OpenAI", "LangChain", "pgvector"],
    description:
      "Deploy hallucination-free AI agents grounded in your company's private knowledge base. I build end-to-end Retrieval-Augmented Generation (RAG) pipelines with tool-calling, streaming responses, and evaluation guardrails.",
    highlights: [
      "Hybrid semantic + keyword retrieval with PostgreSQL pgvector or Pinecone",
      "Multi-step tool calling for order lookup, CRM actions, and automated support",
      "Token budget controls, prompt caching, and latency optimization",
      "REST/SSE streaming endpoints ready for web and mobile apps",
    ],
    packages: {
      Basic: {
        tier: "Basic",
        title: "RAG Prototype API",
        description: "Document ingestion pipeline + vector search + streaming chat endpoint.",
        price: 220,
        deliveryDays: 3,
        revisions: 2,
        features: [
          "PDF/Markdown Ingestion Pipeline",
          "Vector Database Setup (pgvector)",
          "Streaming Chat API Endpoint",
          "Source Citation Tracking",
        ],
      },
      Standard: {
        tier: "Standard",
        title: "Production Tool-Calling Agent",
        description: "Multi-tool AI agent integrated with your backend APIs, auth, and conversation memory.",
        price: 540,
        deliveryDays: 6,
        revisions: 4,
        features: [
          "Up to 5 Custom Function Tools",
          "Redis Session & Memory Persistence",
          "Hallucination Guardrails & Eval Suite",
          "Dockerized Microservice Deployment",
        ],
      },
      Premium: {
        tier: "Premium",
        title: "Enterprise Multi-Agent Platform",
        description: "Autonomous supervisor + worker agents, analytics dashboard, and fine-tuned embeddings.",
        price: 1150,
        deliveryDays: 12,
        revisions: "Unlimited",
        features: [
          "Multi-Agent Orchestration Graph",
          "Custom Admin & Observability UI",
          "Role-Based Access Control on Docs",
          "Load Tested & Kubernetes Ready",
        ],
      },
    },
    criteriaAverages: {
      communication: 4.9,
      serviceAsDescribed: 5.0,
      recommend: 4.9,
    },
    reviews: [
      {
        id: "rev-4",
        buyerName: "Liam O'Connor",
        buyerCountry: "Ireland",
        buyerAvatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=200&q=80",
        ratingOverall: 5.0,
        communicationRating: 5.0,
        serviceAsDescribedRating: 5.0,
        recommendRating: 5.0,
        comment:
          "Cut our customer support ticket volume by 68% in the first two weeks. Dr. Aryan's RAG pipeline cites exact documentation pages with sub-second latency.",
        packageOrdered: "Premium",
        priceRange: "Over $1,000",
        createdAt: "4 days ago",
      },
    ],
  },
  {
    id: "gig-104",
    title: "I will design a complete brand identity, Figma UI kit, and interactive design system",
    slug: "design-brand-identity-figma-ui-kit-design-system",
    category: "Graphics & Design",
    subcategory: "UI/UX & Brand Identity",
    thumbnailUrl: "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=1000&q=80",
    galleryUrls: [
      "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?auto=format&fit=crop&w=1200&q=80",
    ],
    seller: {
      id: "11111111-1111-1111-1111-111111111111",
      username: "claire_studio",
      displayName: "Claire Dubois",
      avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=250&q=80",
      level: "Level 2 Seller",
      tagline: "Creative Director & Design Systems Lead",
      country: "France",
      memberSince: "May 2022",
      avgResponseTime: "2 hours",
      lastDelivery: "about 6 hours ago",
      languages: ["English (Fluent)", "French (Native)"],
      bio: "Paris-based product designer helping tech startups craft memorable brand identities and scalable Figma component libraries with design tokens.",
    },
    rating: 4.9,
    reviewCount: 142,
    ordersInQueue: 4,
    startingPrice: 120,
    tags: ["Figma", "UI/UX", "Design System", "Branding", "Prototyping"],
    description:
      "Elevate your product with an cohesive brand identity and developer-ready Figma design system. Includes auto-layout components, dark/light mode variables, and interactive user flow prototypes.",
    highlights: [
      "Complete Figma Token Architecture (Colors, Typography, Spacing, Shadows)",
      "50+ Auto-Layout Components with Variant States",
      "Clickable High-Fidelity Prototype for Investor Demos",
      "Developer Handoff Specs aligned with Tailwind CSS",
    ],
    packages: {
      Basic: {
        tier: "Basic",
        title: "Starter Brand + 3 Screens",
        description: "Logo exploration, color/type tokens, and 3 key product screens in Figma.",
        price: 120,
        deliveryDays: 3,
        revisions: 3,
        features: [
          "Brand Color & Typography Guide",
          "3 High-Fidelity UI Screens",
          "Editable Figma Source File",
        ],
      },
      Standard: {
        tier: "Standard",
        title: "Product UI Kit + 10 Screens",
        description: "10 responsive screens + reusable Figma component library + interactive prototype.",
        price: 290,
        deliveryDays: 6,
        revisions: 5,
        features: [
          "10 Desktop & Mobile Screens",
          "35+ Auto-Layout Components",
          "Interactive Clickable Prototype",
          "Tailwind CSS Token Mapping",
        ],
      },
      Premium: {
        tier: "Premium",
        title: "Full Enterprise Design System",
        description: "25+ screens, complete multi-theme variable system, brand book, and motion specs.",
        price: 680,
        deliveryDays: 10,
        revisions: "Unlimited",
        features: [
          "25+ Screens Across All Flows",
          "Light & Dark Mode Figma Variables",
          "Complete Brand Guidelines PDF",
          "Live Handoff Workshop with Devs",
        ],
      },
    },
    criteriaAverages: {
      communication: 5.0,
      serviceAsDescribed: 4.9,
      recommend: 4.8,
    },
    reviews: [],
  },
  {
    id: "gig-105",
    title: "I will automate your Kubernetes cluster, Helm charts, Ingress TLS, and GitHub Actions CI/CD",
    slug: "automate-kubernetes-cluster-helm-charts-github-actions",
    category: "Cloud & DevOps",
    subcategory: "Kubernetes & Infrastructure as Code",
    thumbnailUrl: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&w=1000&q=80",
    galleryUrls: [
      "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&w=1200&q=80",
    ],
    seller: {
      id: "11111111-1111-1111-1111-111111111111",
      username: "marcus_sre",
      displayName: "Viktor Lindqvist",
      avatarUrl: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=250&q=80",
      level: "Top Rated Seller",
      tagline: "CNCF Kubestronaut & Principal SRE",
      country: "Sweden",
      memberSince: "Nov 2020",
      avgResponseTime: "1 hour",
      lastDelivery: "about 2 hours ago",
      languages: ["English (Fluent)", "Swedish (Native)"],
      bio: "Certified Kubernetes Security Specialist (CKS, CKA, CKAD) helping teams migrate from Docker Compose to zero-downtime Kubernetes clusters with Helm, Kustomize, and NetworkPolicies.",
    },
    rating: 5.0,
    reviewCount: 196,
    ordersInQueue: 6,
    startingPrice: 175,
    tags: ["Kubernetes", "Helm", "Kustomize", "DevOps", "Zero Downtime"],
    description:
      "Stop worrying about production outages. I will package your microservices into hardened Kubernetes manifests and Helm v3 charts with StatefulSets, HorizontalPodAutoscalers, PodDisruptionBudgets, and zero-trust NetworkPolicies.",
    highlights: [
      "Complete Kustomize & Helm v3 Chart hierarchy (dev / staging / prod values)",
      "StatefulSets for PostgreSQL, Redis, and Apache Kafka KRaft mode",
      "Liveness & Readiness probes tuned for Spring Boot Actuator & Next.js",
      "Zero-trust NetworkPolicies and PodDisruptionBudgets for HA",
    ],
    packages: {
      Basic: {
        tier: "Basic",
        title: "K8s Manifests for 3 Services",
        description: "Deployments, Services, ConfigMaps, and Ingress for up to 3 workloads.",
        price: 175,
        deliveryDays: 2,
        revisions: 2,
        features: [
          "Deployments, Services & HPA",
          "NGINX Ingress with TLS",
          "Liveness & Readiness Probes",
        ],
      },
      Standard: {
        tier: "Standard",
        title: "Full Cluster + StatefulSets + Helm",
        description: "Up to 10 services + Postgres/Redis/Kafka StatefulSets + reusable Helm v3 chart.",
        price: 420,
        deliveryDays: 5,
        revisions: 4,
        features: [
          "10 Microservice Workloads + HPAs",
          "Postgres, Redis & Kafka StatefulSets",
          "Umbrella Helm v3 Chart + Kustomize",
          "NetworkPolicies & PodDisruptionBudgets",
        ],
      },
      Premium: {
        tier: "Premium",
        title: "Enterprise GitOps + Observability",
        description: "Full K8s infra + ArgoCD GitOps + Prometheus/Grafana dashboards + CI/CD pipelines.",
        price: 950,
        deliveryDays: 10,
        revisions: "Unlimited",
        features: [
          "Complete Production K8s + Helm Repo",
          "ArgoCD Automated GitOps Sync",
          "Prometheus + Grafana + Loki Stack",
          "Automated Rollback & Load Testing",
        ],
      },
    },
    criteriaAverages: {
      communication: 5.0,
      serviceAsDescribed: 5.0,
      recommend: 5.0,
    },
    reviews: [],
  },
  {
    id: "gig-106",
    title: "I will produce a studio-quality 3D SaaS product explainer video and motion graphics",
    slug: "produce-3d-saas-product-explainer-video-motion-graphics",
    category: "Video & Animation",
    subcategory: "SaaS Explainer Videos",
    thumbnailUrl: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1000&q=80",
    galleryUrls: [
      "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80",
    ],
    seller: {
      id: "22222222-2222-2222-2222-222222222222",
      username: "sofia_fintech",
      displayName: "Enzo Moretti",
      avatarUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=250&q=80",
      level: "Level 2 Seller",
      tagline: "Motion Director for Tech & Fintech Brands",
      country: "Italy",
      memberSince: "Jul 2022",
      avgResponseTime: "1 hour",
      lastDelivery: "about 12 hours ago",
      languages: ["English (Fluent)", "Italian (Native)"],
      bio: "Creating high-impact 60-second product launch videos for YCombinator startups and global SaaS teams.",
    },
    rating: 4.8,
    reviewCount: 97,
    ordersInQueue: 3,
    startingPrice: 250,
    tags: ["Motion Graphics", "SaaS Video", "After Effects", "3D Product", "Explainer"],
    description:
      "Turn visitors into paying customers with a dynamic SaaS product walkthrough video featuring smooth UI animations, kinetic typography, and professional sound design.",
    highlights: [
      "4K 60fps UI motion capture and 3D camera transitions",
      "Professional voiceover and custom sound effects",
      "Optimized aspect ratios for Hero Landing Page, YouTube, and LinkedIn",
    ],
    packages: {
      Basic: {
        tier: "Basic",
        title: "30s Product Teaser",
        description: "Fast-paced 30-second product sizzle reel with kinetic typography and music.",
        price: 250,
        deliveryDays: 4,
        revisions: 2,
        features: ["30 Seconds 4K Render", "Background Music & SFX", "UI Screen Animations"],
      },
      Standard: {
        tier: "Standard",
        title: "60s Full SaaS Explainer",
        description: "60-second scripted product tour with voiceover, 3D UI mockups, and sound design.",
        price: 520,
        deliveryDays: 7,
        revisions: 4,
        features: ["60 Seconds 4K Render", "Studio Voiceover Included", "Custom 3D Device Scenes"],
      },
      Premium: {
        tier: "Premium",
        title: "90s Launch Campaign Bundle",
        description: "90s flagship launch film + 3 social cutdowns + project source files.",
        price: 980,
        deliveryDays: 12,
        revisions: "Unlimited",
        features: ["90s Flagship Video + 3 Cutdowns", "Scriptwriting & Storyboard", "Full After Effects Source"],
      },
    },
    criteriaAverages: {
      communication: 4.9,
      serviceAsDescribed: 4.8,
      recommend: 4.8,
    },
    reviews: [],
  },
];

export const SEED_ORDERS: Order[] = [
  {
    id: "44444444-4444-4444-4444-444444444444",
    orderNumber: "#FO-8849201",
    gigId: "11111111-1111-1111-1111-111111111111",
    gigTitle: "I will architect and build a production Spring Boot 3 microservices ecosystem on Kubernetes",
    gigThumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80",
    packageTier: "Premium",
    buyerName: "Jordan Taylor",
    buyerUsername: "jordan_taylor",
    sellerName: "Alex Rivera",
    sellerUsername: "alex_architect",
    sellerLevel: "Top Rated Seller",
    amount: 995,
    serviceFee: 54.73,
    totalEscrow: 1049.73,
    status: "DELIVERED",
    dueDate: "2026-11-08T18:00:00Z",
    createdAt: "2026-10-28T10:15:00Z",
    deliveredAt: "2026-11-04T06:30:00Z",
    revisionsUsed: 1,
    revisionsAllowed: "Unlimited",
    requirements:
      "Build all 9 Spring Boot 3 DDD microservices (API Gateway, Auth, User, Gig, Order, Payment Escrow, Messaging, Review, Notification) plus Kubernetes & Helm v3 deployment manifests.",
    deliveryNote:
      "All 9 Spring Boot 3 microservices with strict DDD Hexagonal architecture (`domain/repository`, `application/usecase`, `infrastructure/persistence`) and the complete `fiverr-k8s-infra` Helm chart have been pushed and verified. Ready for your review and escrow release!",
    deliveryAttachments: [
      "fiverr-microservices-architecture-v1.zip (42.8 MB)",
      "helm-fiverr-ecosystem-chart.tgz (1.4 MB)",
      "escrow-saga-verification-report.pdf (840 KB)",
    ],
    buyerId: "33333333-3333-3333-3333-333333333333",
    sellerId: "11111111-1111-1111-1111-111111111111",
  },
  {
    id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    orderNumber: "#FO-8849345",
    gigId: "22222222-2222-2222-2222-222222222222",
    gigTitle: "I will design and develop a high-converting Next.js 15 SaaS or Marketplace web app",
    gigThumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80",
    packageTier: "Standard",
    buyerName: "Jordan Taylor",
    buyerUsername: "jordan_taylor",
    sellerName: "Sophia Chen",
    sellerUsername: "elena_ai",
    sellerLevel: "Pro Verified",
    amount: 390,
    serviceFee: 21.45,
    totalEscrow: 411.45,
    status: "IN_PROGRESS",
    dueDate: "2026-11-07T20:00:00Z",
    createdAt: "2026-11-02T14:20:00Z",
    revisionsUsed: 0,
    revisionsAllowed: 5,
    requirements:
      "Implement the Next.js 15 App Router frontend with Fiverr emerald palette (#1dbf73), 3-tier package selector, order escrow workspace, seller studio, and real-time inbox.",
    buyerId: "33333333-3333-3333-3333-333333333333",
    sellerId: "22222222-2222-2222-2222-222222222222",
  },
  {
    id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
    orderNumber: "#FO-8847110",
    gigId: "33333333-3333-3333-3333-333333333333",
    gigTitle: "I will automate your Kubernetes cluster, Helm charts, Ingress TLS, and GitHub Actions CI/CD",
    gigThumbnail: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&w=600&q=80",
    packageTier: "Standard",
    buyerName: "Jordan Taylor",
    buyerUsername: "jordan_taylor",
    sellerName: "Viktor Lindqvist",
    sellerUsername: "k8s_viktor",
    sellerLevel: "Top Rated Seller",
    amount: 595,
    serviceFee: 32.73,
    totalEscrow: 627.73,
    status: "COMPLETED",
    dueDate: "2026-10-25T18:00:00Z",
    createdAt: "2026-10-20T09:00:00Z",
    deliveredAt: "2026-10-24T15:10:00Z",
    completedAt: "2026-10-24T19:45:00Z",
    revisionsUsed: 0,
    revisionsAllowed: 4,
    requirements: "Create StatefulSets for PostgreSQL, Redis, and Kafka KRaft mode plus HPA policies.",
    deliveryNote: "Delivered full Kustomize and Helm manifests with zero-downtime rolling updates.",
    deliveryAttachments: ["k8s-stateful-ha-bundle.zip (3.2 MB)"],
    buyerId: "33333333-3333-3333-3333-333333333333",
    sellerId: "11111111-1111-1111-1111-111111111111",
  },
];

export const SEED_SELLER_STATS: SellerDashboardStats = {
  escrowPendingBalance: 1385.0,
  availableForWithdrawal: 1476.0,
  clearedThisMonth: 4890.0,
  activeOrdersCount: 3,
  activeOrdersValue: 1980.0,
  sellerLevel: "Top Rated Seller",
  nextEvaluationDate: "Nov 15, 2026",
  metrics: {
    inboxResponseRate: 99,
    onTimeDeliveryRate: 100,
    orderCompletionRate: 98,
    overallRating: 5.0,
  },
};

export const SEED_CONVERSATIONS: Conversation[] = [
  {
    id: "137ad359-20c7-492f-b978-416db5932478",
    buyerId: "11111111-1111-1111-1111-111111111111",
    sellerId: "22222222-2222-2222-2222-222222222222",
    gigId: "33333333-3333-3333-3333-333333333333",
    participantName: "Alex Rivera",
    participantUsername: "alex_architect",
    participantAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80",
    participantRole: "Seller",
    participantLevel: "Top Rated Seller",
    online: true,
    relatedGigTitle: "Spring Boot 3 Microservices Ecosystem on Kubernetes",
    lastMessage: "I've just uploaded the Helm chart and Kafka Saga verification report to Order #FO-8849201!",
    lastMessageTime: "10:42 AM",
    unreadCount: 1,
    messages: [
      {
        id: "msg-1",
        sender: "buyer",
        senderName: "Jordan Taylor",
        text: "Hi Alex! Just checking in on the Payment Service escrow ledger and Kafka event consumers. Are all repository interfaces inside domain/repository?",
        timestamp: "10:15 AM",
      },
      {
        id: "msg-2",
        sender: "seller",
        senderName: "Alex Rivera",
        text: "Hey Jordan! Yes, 100%. Every microservice strictly keeps Repository interfaces in `domain/repository/` and JPA implementations in `infrastructure/persistence/repository/`. Port Out is reserved exclusively for external adapters.",
        timestamp: "10:22 AM",
      },
      {
        id: "msg-3",
        sender: "seller",
        senderName: "Alex Rivera",
        text: "I've just uploaded the Helm chart and Kafka Saga verification report to Order #FO-8849201!",
        timestamp: "10:42 AM",
      },
    ],
  },
  {
    id: "conv-2",
    buyerId: "33333333-3333-3333-3333-333333333333",
    sellerId: "22222222-2222-2222-2222-222222222222",
    gigId: "22222222-2222-2222-2222-222222222222",
    participantName: "Sophia Chen",
    participantUsername: "sophia_ui_craft",
    participantAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80",
    participantRole: "Seller",
    participantLevel: "Pro Verified",
    online: true,
    relatedGigTitle: "Next.js 15 SaaS or Marketplace Web App",
    lastMessage: "Here is the custom offer for the interactive Seller Studio & Escrow Workspace module.",
    lastMessageTime: "Yesterday",
    unreadCount: 0,
    messages: [
      {
        id: "msg-201",
        sender: "buyer",
        senderName: "Jordan Taylor",
        text: "Hi Sophia, can we include the 3-criteria review breakdown and custom offer widget in the inbox?",
        timestamp: "Yesterday, 4:10 PM",
      },
      {
        id: "msg-202",
        sender: "seller",
        senderName: "Sophia Chen",
        text: "Here is the custom offer for the interactive Seller Studio & Escrow Workspace module.",
        timestamp: "Yesterday, 4:18 PM",
        customOffer: {
          offerId: "44444444-4444-4444-4444-444444444444",
          gigId: "22222222-2222-2222-2222-222222222222",
          title: "Next.js 15 Marketplace + Escrow Workspace + Real-Time Inbox",
          packageTier: "Standard",
          price: 380,
          deliveryDays: 5,
          revisions: 5,
          status: "ACCEPTED",
        },
      },
    ],
  },
  {
    id: "conv-3",
    buyerId: "33333333-3333-3333-3333-333333333333",
    sellerId: "22222222-2222-2222-2222-222222222222",
    gigId: "33333333-3333-3333-3333-333333333333",
    participantName: "Dr. Aryan Mehta",
    participantUsername: "dr_aryan_ai",
    participantAvatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=250&q=80",
    participantRole: "Seller",
    participantLevel: "Top Rated Seller",
    online: false,
    relatedGigTitle: "Custom RAG AI Agent with LangChain & pgvector",
    lastMessage: "Sounds great, let me know when you're ready to kick off the semantic gig search indexing.",
    lastMessageTime: "Nov 1",
    unreadCount: 0,
    messages: [
      {
        id: "msg-301",
        sender: "seller",
        senderName: "Dr. Aryan Mehta",
        text: "Sounds great, let me know when you're ready to kick off the semantic gig search indexing.",
        timestamp: "Nov 1, 2:00 PM",
      },
    ],
  },
];

export const SEED_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "34c1715f-5a2e-4b5d-952c-0c0fbb08a69f",
    recipientUserId: "11111111-1111-1111-1111-111111111111",
    type: "CUSTOM_OFFER_RECEIVED",
    title: "Custom Milestone Offer Received",
    message: "You received a custom offer ($1,250.00 - 5 days delivery) for your FIVERREX architecture inquiry.",
    channel: "IN_APP",
    read: false,
    readAt: null,
    createdAt: "2026-11-04T09:01:41.152478Z",
  },
  {
    id: "b8898388-74a0-43d0-931f-854c034f0286",
    recipientUserId: "22222222-2222-2222-2222-222222222222",
    type: "REVIEW_RECEIVED",
    title: "New 5.0 Star Verified Review",
    message: "A buyer left a 5.0-star verified review across all 3 criteria on your gig!",
    channel: "EMAIL",
    read: false,
    readAt: null,
    createdAt: "2026-11-04T09:01:41.160991Z",
  },
  {
    id: "37d5ecc6-8675-4db8-b294-e964a5268d01",
    recipientUserId: "22222222-2222-2222-2222-222222222222",
    type: "ORDER_CREATED",
    title: "New Enterprise Order Placed",
    message: "A buyer placed an order for Enterprise Spring Boot 3 Hexagonal DDD Architecture & API Suite.",
    channel: "ALL",
    read: true,
    readAt: "2026-11-04T09:01:41.076629Z",
    createdAt: "2026-11-04T09:01:41.076613Z",
  },
];

export const SEED_ESCROW_TRANSACTIONS: EscrowTransactionItem[] = [
  {
    id: "55555555-5555-5555-5555-555555555555",
    orderId: "44444444-4444-4444-4444-444444444444",
    buyerId: "33333333-3333-3333-3333-333333333333",
    sellerId: "11111111-1111-1111-1111-111111111111",
    grossAmount: 995.0,
    platformFee: 199.0,
    sellerNetPayout: 796.0,
    gatewayChargeId: "ch_fvx_44444444",
    status: "HELD",
    createdAt: "2026-11-01T09:01:41.147Z",
    updatedAt: "2026-11-02T09:01:41.147Z",
  },
  {
    id: "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee",
    orderId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    buyerId: "33333333-3333-3333-3333-333333333333",
    sellerId: "22222222-2222-2222-2222-222222222222",
    grossAmount: 390.0,
    platformFee: 78.0,
    sellerNetPayout: 312.0,
    gatewayChargeId: "ch_fvx_aaaaaaaa",
    status: "HELD",
    createdAt: "2026-10-30T09:01:41.147Z",
    updatedAt: "2026-11-03T09:01:41.147Z",
  },
  {
    id: "ffffffff-ffff-ffff-ffff-ffffffffffff",
    orderId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
    buyerId: "33333333-3333-3333-3333-333333333333",
    sellerId: "11111111-1111-1111-1111-111111111111",
    grossAmount: 595.0,
    platformFee: 119.0,
    sellerNetPayout: 476.0,
    gatewayChargeId: "ch_fvx_bbbbbbbb",
    status: "RELEASED",
    createdAt: "2026-10-28T09:01:41.147Z",
    updatedAt: "2026-11-04T09:01:41.147Z",
  },
];

export const SEED_WALLETS: SellerWalletItem[] = [
  {
    sellerId: "11111111-1111-1111-1111-111111111111",
    availableBalance: 1476.0,
    withdrawnTotal: 800.0,
    createdAt: "2026-10-21T09:01:41.147Z",
    updatedAt: "2026-11-04T09:01:41.147Z",
  },
  {
    sellerId: "22222222-2222-2222-2222-222222222222",
    availableBalance: 624.0,
    withdrawnTotal: 312.0,
    createdAt: "2026-10-25T09:01:41.147Z",
    updatedAt: "2026-11-03T09:01:41.147Z",
  },
];

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const GIG_ID_TO_UUID: Record<string, string> = {
  "gig-101": "11111111-1111-1111-1111-111111111111",
  "gig-102": "22222222-2222-2222-2222-222222222222",
  "gig-103": "22222222-2222-2222-2222-222222222222",
  "gig-104": "33333333-3333-3333-3333-333333333333",
  "gig-105": "11111111-1111-1111-1111-111111111111",
  "gig-106": "33333333-3333-3333-3333-333333333333",
};

const ORDER_ID_TO_UUID: Record<string, string> = {
  "ord-9001": "44444444-4444-4444-4444-444444444444",
  "ord-9002": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
  "ord-9003": "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
};

export function resolveBackendUuid(
  id: string | undefined,
  fallbackUuid = "11111111-1111-1111-1111-111111111111"
): string {
  if (!id) return fallbackUuid;
  if (UUID_REGEX.test(id)) return id;
  if (GIG_ID_TO_UUID[id]) return GIG_ID_TO_UUID[id];
  if (ORDER_ID_TO_UUID[id]) return ORDER_ID_TO_UUID[id];
  return fallbackUuid;
}

// ============================================================================
// DTO Normalizers (Backend Spring Boot JSON -> Rich UI Models)
// ============================================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapBackendGigToUi(raw: any): Gig {
  if (!raw) return SEED_GIGS[0];
  // If already in UI shape with packages.Basic, return as-is
  if (raw.packages && raw.packages.Basic && raw.seller?.displayName) {
    return raw as Gig;
  }

  const rawId = String(raw.id || "");
  // Match a template from SEED_GIGS by UUID mapping or category
  const templateGig =
    rawId === "11111111-1111-1111-1111-111111111111"
      ? SEED_GIGS[0]
      : rawId === "22222222-2222-2222-2222-222222222222"
      ? SEED_GIGS[1]
      : rawId === "33333333-3333-3333-3333-333333333333"
      ? SEED_GIGS[3]
      : SEED_GIGS.find((g) => g.category === raw.category) || SEED_GIGS[0];

  const pkgArray: Array<{
    tier?: string;
    name?: string;
    description?: string;
    price?: number;
    deliveryDays?: number;
    revisions?: number;
  }> = Array.isArray(raw.packages) ? raw.packages : [];

  const findPkg = (tierKey: string, fallbackPkg: PackageTier): PackageTier => {
    const found = pkgArray.find(
      (p) => String(p.tier || "").toUpperCase() === tierKey.toUpperCase()
    );
    if (!found) return fallbackPkg;
    return {
      tier: fallbackPkg.tier,
      title: found.name || fallbackPkg.title,
      description: found.description || fallbackPkg.description,
      price: Number(found.price ?? fallbackPkg.price),
      deliveryDays: Number(found.deliveryDays ?? fallbackPkg.deliveryDays),
      revisions: found.revisions !== undefined ? Number(found.revisions) : fallbackPkg.revisions,
      features: fallbackPkg.features,
    };
  };

  const basicPkg = findPkg("BASIC", templateGig.packages.Basic);
  const standardPkg = findPkg("STANDARD", templateGig.packages.Standard);
  const premiumPkg = findPkg("PREMIUM", templateGig.packages.Premium);

  const sellerMeta = ACCOUNT_PROFILE_META[String(raw.sellerId || "")];
  const seller: GigSeller = sellerMeta
    ? {
        ...templateGig.seller,
        id: String(raw.sellerId),
        displayName: sellerMeta.displayName,
        avatarUrl: sellerMeta.avatarUrl,
      }
    : templateGig.seller;

  return {
    ...templateGig,
    id: rawId || templateGig.id,
    slug: raw.slug || templateGig.slug,
    title: raw.title || templateGig.title,
    category: raw.category || templateGig.category,
    description: raw.description || templateGig.description,
    seller,
    startingPrice: basicPkg.price,
    packages: {
      Basic: basicPkg,
      Standard: standardPkg,
      Premium: premiumPkg,
    },
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapBackendReviewToUi(raw: any): ReviewItem {
  if (!raw) return SEED_GIGS[0].reviews[0];
  if (raw.buyerName && raw.ratingOverall !== undefined) {
    return raw as ReviewItem;
  }

  const buyerMeta = ACCOUNT_PROFILE_META[String(raw.buyerId || "")];
  const createdDate = raw.createdAt
    ? new Date(raw.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Just now";

  return {
    id: String(raw.id || `rev-${Date.now()}`),
    buyerName: buyerMeta?.displayName || "Verified Enterprise Buyer",
    buyerCountry: "United States",
    buyerAvatar:
      buyerMeta?.avatarUrl ||
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    ratingOverall: Number(raw.overallRating ?? 5.0),
    communicationRating: Number(raw.communicationRating ?? 5.0),
    serviceAsDescribedRating: Number(raw.serviceAsDescribedRating ?? 5.0),
    recommendRating: Number(raw.buyAgainRecommendRating ?? 5.0),
    comment: String(raw.comment || ""),
    packageOrdered: "Premium",
    priceRange: "Escrow Verified",
    createdAt: createdDate,
    sellerResponse: raw.sellerResponse || undefined,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapBackendOrderToUi(raw: any): Order {
  if (!raw) return SEED_ORDERS[0];
  if (raw.orderNumber && raw.gigTitle && raw.totalEscrow !== undefined) {
    return raw as Order;
  }

  const rawId = String(raw.id || "");
  const seedMatch = SEED_ORDERS.find(
    (o) => o.id === rawId || o.gigId === String(raw.gigId || "")
  );
  const matchedGig =
    SEED_GIGS.find(
      (g) => g.id === String(raw.gigId || "") || GIG_ID_TO_UUID[g.id] === String(raw.gigId || "")
    ) || SEED_GIGS[0];

  const amount = Number(raw.amount ?? seedMatch?.amount ?? 490);
  const serviceFee = Number((amount * 0.055).toFixed(2));
  const totalEscrow = Number((amount + serviceFee).toFixed(2));

  const tierStr = String(raw.packageTier || "STANDARD").toUpperCase();
  const packageTier: PackageTierName =
    tierStr === "BASIC" ? "Basic" : tierStr === "PREMIUM" ? "Premium" : "Standard";

  const rawStatus = String(raw.status || "IN_PROGRESS").toUpperCase();
  const status: OrderStatus =
    rawStatus === "DELIVERED" ||
    rawStatus === "REVISION_REQUESTED" ||
    rawStatus === "COMPLETED" ||
    rawStatus === "CANCELLED"
      ? (rawStatus as OrderStatus)
      : "IN_PROGRESS";

  const sellerMeta = ACCOUNT_PROFILE_META[String(raw.sellerId || "")];
  const buyerMeta = ACCOUNT_PROFILE_META[String(raw.buyerId || "")];

  return {
    id: rawId || `ord-${Date.now()}`,
    orderNumber:
      seedMatch?.orderNumber ||
      `#FO-${rawId.replace(/-/g, "").slice(0, 7).toUpperCase() || "8849900"}`,
    gigId: String(raw.gigId || matchedGig.id),
    gigTitle: seedMatch?.gigTitle || matchedGig.title,
    gigThumbnail: seedMatch?.gigThumbnail || matchedGig.thumbnailUrl,
    packageTier,
    buyerName: buyerMeta?.displayName || seedMatch?.buyerName || "Jordan Taylor",
    buyerUsername: seedMatch?.buyerUsername || "jordan_taylor",
    sellerName: sellerMeta?.displayName || seedMatch?.sellerName || matchedGig.seller.displayName,
    sellerUsername: seedMatch?.sellerUsername || matchedGig.seller.username,
    sellerLevel: seedMatch?.sellerLevel || matchedGig.seller.level,
    amount,
    serviceFee,
    totalEscrow,
    status,
    dueDate:
      seedMatch?.dueDate ||
      new Date(Date.now() + 5 * 86400000).toISOString(),
    createdAt: raw.createdAt || new Date().toISOString(),
    deliveredAt: status === "DELIVERED" || status === "COMPLETED" ? raw.updatedAt : undefined,
    completedAt: status === "COMPLETED" ? raw.updatedAt : undefined,
    revisionsUsed: Number(raw.usedRevisions ?? seedMatch?.revisionsUsed ?? 0),
    revisionsAllowed: Number(raw.maxRevisions ?? 5),
    requirements:
      raw.requirements ||
      seedMatch?.requirements ||
      "Follow DDD Hexagonal architecture guidelines.",
    deliveryNote: raw.deliveryNote || seedMatch?.deliveryNote,
    deliveryAttachments: raw.deliverableUrl
      ? [String(raw.deliverableUrl)]
      : seedMatch?.deliveryAttachments,
    buyerId: String(raw.buyerId || "33333333-3333-3333-3333-333333333333"),
    sellerId: String(raw.sellerId || "11111111-1111-1111-1111-111111111111"),
    escrowReference: raw.escrowReference,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapBackendMessageToUi(raw: any): MessageItem {
  if (!raw) return SEED_CONVERSATIONS[0].messages[0];
  if (raw.text !== undefined && raw.senderName !== undefined) {
    return raw as MessageItem;
  }

  const session = getAuthSession();
  const senderId = String(raw.senderId || "");
  const isBuyer =
    senderId === session.account.id ||
    senderId === "11111111-1111-1111-1111-111111111111";
  const senderMeta = ACCOUNT_PROFILE_META[senderId];

  const timeFormatted = raw.createdAt
    ? new Date(raw.createdAt).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      })
    : "Just now";

  return {
    id: String(raw.id || `msg-${Date.now()}`),
    sender: isBuyer ? "buyer" : "seller",
    senderName: senderMeta?.displayName || (isBuyer ? "Jordan Taylor" : "Elena Vance"),
    text: String(raw.content || ""),
    timestamp: timeFormatted,
    customOffer: raw.customOffer
      ? {
          offerId: String(raw.customOffer.offerId || "44444444-4444-4444-4444-444444444444"),
          gigId: String(raw.customOffer.gigId || "33333333-3333-3333-3333-333333333333"),
          title: String(raw.customOffer.title || "Custom Milestone Offer"),
          packageTier: "Standard",
          price: Number(raw.customOffer.price ?? 450),
          deliveryDays: Number(raw.customOffer.deliveryDays ?? 5),
          revisions: 4,
          status:
            String(raw.customOffer.status || "PENDING").toUpperCase() === "ACCEPTED"
              ? "ACCEPTED"
              : "PENDING",
        }
      : undefined,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapBackendConversationToUi(raw: any, messages?: MessageItem[]): Conversation {
  if (!raw) return SEED_CONVERSATIONS[0];
  if (raw.participantName && Array.isArray(raw.messages)) {
    return raw as Conversation;
  }

  const rawId = String(raw.id || "");
  const sellerMeta = ACCOUNT_PROFILE_META[String(raw.sellerId || "")];
  const seedConv = SEED_CONVERSATIONS[0];

  return {
    id: rawId || seedConv.id,
    buyerId: String(raw.buyerId || "11111111-1111-1111-1111-111111111111"),
    sellerId: String(raw.sellerId || "22222222-2222-2222-2222-222222222222"),
    gigId: String(raw.gigId || "33333333-3333-3333-3333-333333333333"),
    participantName: sellerMeta?.displayName || "Elena Vance",
    participantUsername: "elena_ai",
    participantAvatar:
      sellerMeta?.avatarUrl ||
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=250&q=80",
    participantRole: "Seller",
    participantLevel: "Top Rated Seller",
    online: true,
    relatedGigTitle: "Enterprise Spring Boot 3 & Next.js 15 Architecture",
    lastMessage: String(raw.lastMessagePreview || seedConv.lastMessage),
    lastMessageTime: raw.lastMessageAt
      ? new Date(raw.lastMessageAt).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        })
      : "Just now",
    unreadCount: 1,
    messages: messages && messages.length > 0 ? messages : seedConv.messages,
  };
}

// ============================================================================
// HTTP Fetch Client with Auth Headers & Automatic Fallback
// ============================================================================

async function fetchWithFallback<T>(
  endpoint: string,
  fallbackData: T,
  init?: RequestInit
): Promise<T> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);
    const session = getAuthSession();

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(session?.account?.id ? { "X-User-Id": session.account.id } : {}),
      ...(session?.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {}),
    };

    const activeGatewayUrl = getApiGatewayUrl();
    const url = endpoint.startsWith("http")
      ? endpoint
      : `${activeGatewayUrl}${endpoint}`;

    if (
      typeof window !== "undefined" &&
      window.location.protocol === "https:" &&
      url.startsWith("http://")
    ) {
      clearTimeout(timeout);
      return fallbackData;
    }

    const response = await fetch(url, {
      ...init,
      headers: {
        ...headers,
        ...(init?.headers as Record<string, string> | undefined),
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!response.ok) {
      return fallbackData;
    }
    const json = await response.json();
    return (json?.data ?? json) as T;
  } catch {
    return fallbackData;
  }
}

// ============================================================================
// Full 28-Endpoint FIVERREX Client SDK
// ============================================================================

export const fiverrApi = {
  // 0. Gateway Status (GET http://localhost:8080/)
  async getGatewayStatus(): Promise<GatewayStatusInfo> {
    const fallback: GatewayStatusInfo = {
      service: "fiverr-api-gateway",
      brand: "FIVERREX",
      status: "UP",
      swaggerUi: "http://localhost:8080/swagger-ui/index.html",
      openApiDocs: "http://localhost:8080/v3/api-docs",
      timestamp: new Date().toISOString(),
      routes: [
        "/api/v1/auth/**",
        "/api/v1/users/**",
        "/api/v1/sellers/**",
        "/api/v1/gigs/**",
        "/api/v1/orders/**",
        "/api/v1/payments/**",
        "/api/v1/messages/**",
        "/api/v1/reviews/**",
        "/api/v1/notifications/**",
      ],
    };
    return fetchWithFallback<GatewayStatusInfo>(`${GATEWAY_ROOT_URL}/`, fallback);
  },

  // 1. Auth Service (/api/v1/auth)
  async getAccounts(): Promise<AuthAccountDto[]> {
    return fetchWithFallback<AuthAccountDto[]>("/auth/accounts", DEFAULT_AUTH_ACCOUNTS);
  },

  async getAccountById(id: string): Promise<AuthAccountDto> {
    const uuid = resolveBackendUuid(id, "33333333-3333-3333-3333-333333333333");
    const fallback =
      DEFAULT_AUTH_ACCOUNTS.find((a) => a.id === uuid) || DEFAULT_AUTH_ACCOUNTS[0];
    return fetchWithFallback<AuthAccountDto>(`/auth/accounts/${uuid}`, fallback);
  },

  async login(payload: {
    emailOrUsername: string;
    password: string;
  }): Promise<AuthSession> {
    const matchedAccount =
      DEFAULT_AUTH_ACCOUNTS.find(
        (a) =>
          a.username.toLowerCase() === payload.emailOrUsername.toLowerCase() ||
          a.email.toLowerCase() === payload.emailOrUsername.toLowerCase()
      ) || DEFAULT_AUTH_ACCOUNTS[0];

    const fallbackResponse = {
      accessToken: `eyJhbGciOiJIUzI1NiJ9.${matchedAccount.id}`,
      refreshToken: `refresh-${matchedAccount.id}`,
      tokenType: "Bearer",
      expiresInSeconds: 3600,
      account: matchedAccount,
    };

    const res = await fetchWithFallback<typeof fallbackResponse>(
      "/auth/login",
      fallbackResponse,
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );

    const session = buildSessionForAccount(
      res.account || matchedAccount,
      res.accessToken,
      res.refreshToken
    );
    setAuthSession(session);
    return session;
  },

  async register(payload: {
    username: string;
    email: string;
    password: string;
    roles?: string[];
  }): Promise<AuthSession> {
    const fallbackAccount: AuthAccountDto = {
      id: "33333333-3333-3333-3333-333333333333",
      username: payload.username,
      email: payload.email,
      roles: payload.roles || ["BUYER", "SELLER"],
      status: "ACTIVE",
      emailVerified: true,
    };

    const fallbackResponse = {
      accessToken: `eyJhbGciOiJIUzI1NiJ9.${fallbackAccount.id}`,
      refreshToken: `refresh-${fallbackAccount.id}`,
      tokenType: "Bearer",
      expiresInSeconds: 3600,
      account: fallbackAccount,
    };

    const res = await fetchWithFallback<typeof fallbackResponse>(
      "/auth/register",
      fallbackResponse,
      {
        method: "POST",
        body: JSON.stringify({
          username: payload.username,
          email: payload.email,
          password: payload.password,
          roles: payload.roles || ["BUYER", "SELLER"],
        }),
      }
    );

    const session = buildSessionForAccount(
      res.account || fallbackAccount,
      res.accessToken,
      res.refreshToken
    );
    setAuthSession(session);
    return session;
  },

  async refreshToken(refreshTokenStr: string): Promise<{ accessToken: string; refreshToken: string }> {
    return fetchWithFallback(
      "/auth/refresh",
      { accessToken: `refreshed-${Date.now()}`, refreshToken: refreshTokenStr },
      {
        method: "POST",
        body: JSON.stringify({ refreshToken: refreshTokenStr }),
      }
    );
  },

  async changePassword(
    accountId: string,
    payload: { currentPassword: string; newPassword: string }
  ): Promise<AuthAccountDto> {
    const uuid = resolveBackendUuid(accountId, getAuthSession().account.id);
    return fetchWithFallback<AuthAccountDto>(
      `/auth/accounts/${uuid}/password`,
      getAuthSession().account,
      {
        method: "PUT",
        body: JSON.stringify(payload),
      }
    );
  },

  // 2. User & Seller Profile Service (/api/v1/profiles, /api/v1/users, /api/v1/sellers)
  async getSellers(): Promise<UserProfileDto[]> {
    const rawList = await fetchWithFallback<UserProfileDto[]>("/sellers", SEED_USER_PROFILES);
    const liveSellers = Array.isArray(rawList) ? rawList : [];
    const seenUsernames = new Set(liveSellers.map((s) => resolveCanonicalUsername(s.username)));
    return [
      ...liveSellers,
      ...SEED_USER_PROFILES.filter(
        (seed) => !seenUsernames.has(resolveCanonicalUsername(seed.username))
      ),
    ];
  },

  async getProfileById(profileId: string): Promise<UserProfileDto> {
    const sellers = await this.getSellers();
    const uuid = resolveBackendUuid(profileId, "aaaaaaaa-1111-1111-1111-111111111111");
    const matched = sellers.find((s) => s.id === uuid || s.accountId === uuid) || sellers[0];
    return fetchWithFallback<UserProfileDto>(`/profiles/${uuid}`, matched);
  },

  async getProfileByUsername(username: string): Promise<UserProfileDto> {
    const canonical = resolveCanonicalUsername(username);
    const seedMatch =
      SEED_USER_PROFILES.find(
        (u) => resolveCanonicalUsername(u.username) === canonical
      ) || SEED_USER_PROFILES[0];
    const fetched = await fetchWithFallback<UserProfileDto>(
      `/users/${canonical}`,
      seedMatch
    );
    if (
      fetched &&
      resolveCanonicalUsername(fetched.username) !== canonical &&
      seedMatch
    ) {
      return seedMatch;
    }
    return fetched || seedMatch;
  },

  async getUserByUsername(username: string): Promise<UserProfileDto> {
    return this.getProfileByUsername(username);
  },

  async createProfile(payload: {
    accountId: string;
    username: string;
    displayName: string;
    headline?: string;
    bio?: string;
    avatarUrl?: string;
    country?: string;
    languages?: string[];
    skills?: string[];
  }): Promise<UserProfileDto> {
    const sellers = await this.getSellers();
    return fetchWithFallback<UserProfileDto>("/profiles", sellers[0], {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async updateProfile(
    profileId: string,
    payload: {
      displayName: string;
      headline?: string;
      bio?: string;
      avatarUrl?: string;
      country?: string;
      languages?: string[];
      skills?: string[];
      hourlyRate?: number;
      availabilityStatus?: string;
    }
  ): Promise<UserProfileDto> {
    const sellers = await this.getSellers();
    const uuid = resolveBackendUuid(profileId, getAuthSession().profileId);
    const fallbackBase =
      sellers.find((s) => s.id === profileId || s.id === uuid) || sellers[0];
    const fallbackUpdated: UserProfileDto = {
      ...fallbackBase,
      ...payload,
      hourlyRate: payload.hourlyRate ?? fallbackBase.hourlyRate,
      availabilityStatus: payload.availabilityStatus || "AVAILABLE",
    };
    return fetchWithFallback<UserProfileDto>(`/profiles/${uuid}`, fallbackUpdated, {
      method: "PUT",
      body: JSON.stringify({
        availabilityStatus: "AVAILABLE",
        ...payload,
      }),
    });
  },

  async upgradeToSeller(
    profileId?: string,
    payload?: {
      headline?: string;
      bio?: string;
      skills?: string[];
      hourlyRate?: number;
    }
  ): Promise<UserProfileDto> {
    const session = getAuthSession();
    const uuid = resolveBackendUuid(
      profileId,
      session.profileId || "aaaaaaaa-3333-3333-3333-333333333333"
    );
    const body = {
      headline: payload?.headline || "Full-Stack Product Architect & Verified Seller",
      bio:
        payload?.bio ||
        "Delivering enterprise microservices, cloud-native Kubernetes infrastructure, and modern web applications.",
      skills: payload?.skills || ["Spring Boot", "Next.js", "Kubernetes", "DDD"],
      hourlyRate: payload?.hourlyRate ?? 150.0,
    };
    const sellers = await this.getSellers();
    return fetchWithFallback<UserProfileDto>(
      `/profiles/${uuid}/upgrade-seller`,
      sellers[0],
      {
        method: "POST",
        body: JSON.stringify(body),
      }
    );
  },

  // 3. Gig Catalog Service (/api/v1/gigs)
  async getGigs(params?: {
    category?: string;
    search?: string;
    maxPrice?: number;
  }): Promise<Gig[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawList = await fetchWithFallback<any[]>("/gigs", SEED_GIGS);
    const mappedBackendGigs = Array.isArray(rawList)
      ? rawList.map((item) => mapBackendGigToUi(item))
      : [];

    // Merge live backend PostgreSQL gigs with rich SEED_GIGS catalog so all 6+ cards & routes work
    const seenTitles = new Set(mappedBackendGigs.map((g) => g.title.toLowerCase()));
    const combined: Gig[] = [
      ...mappedBackendGigs,
      ...SEED_GIGS.filter((seed) => !seenTitles.has(seed.title.toLowerCase())),
    ];

    return combined.filter((g) => {
      if (
        params?.category &&
        params.category !== "All Categories" &&
        g.category !== params.category
      ) {
        return false;
      }
      if (params?.maxPrice && g.startingPrice > params.maxPrice) {
        return false;
      }
      if (params?.search) {
        const q = params.search.toLowerCase();
        const matchesTitle = g.title.toLowerCase().includes(q);
        const matchesTag = g.tags.some((t) => t.toLowerCase().includes(q));
        const matchesCategory = g.category.toLowerCase().includes(q);
        return matchesTitle || matchesTag || matchesCategory;
      }
      return true;
    });
  },

  async searchGigs(keyword = "", category = ""): Promise<Gig[]> {
    const query = new URLSearchParams();
    if (keyword) query.set("keyword", keyword);
    if (category && category !== "All Categories") query.set("category", category);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawList = await fetchWithFallback<any[]>(
      `/gigs/search?${query.toString()}`,
      SEED_GIGS
    );
    const mapped = Array.isArray(rawList) ? rawList.map(mapBackendGigToUi) : SEED_GIGS;
    return mapped;
  },

  async getGigById(id: string): Promise<Gig> {
    const seedMatch = SEED_GIGS.find((g) => g.id === id);
    const uuid = resolveBackendUuid(id, "11111111-1111-1111-1111-111111111111");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw = await fetchWithFallback<any>(`/gigs/${uuid}`, seedMatch || SEED_GIGS[0]);
    const mapped = mapBackendGigToUi(raw);
    if (seedMatch && !UUID_REGEX.test(id)) {
      return seedMatch;
    }
    return mapped;
  },

  async createGig(payload: {
    sellerId?: string;
    title: string;
    category: string;
    description?: string;
    basicPrice: number;
    standardPrice: number;
    premiumPrice: number;
  }): Promise<Gig> {
    const session = getAuthSession();
    const sellerId = resolveBackendUuid(
      payload.sellerId,
      session.sellerId || "11111111-1111-1111-1111-111111111111"
    );
    const formattedTitle = payload.title.startsWith("I will")
      ? payload.title
      : `I will ${payload.title}`;
    const body = {
      sellerId,
      title:
        formattedTitle.length >= 10
          ? formattedTitle
          : `${formattedTitle} with Enterprise Quality`,
      category: payload.category,
      description:
        payload.description ||
        "Production-grade architecture and implementation delivered with full test coverage, documentation, and Escrow milestone protection.",
      packages: [
        {
          tier: "BASIC",
          name: "Core Deliverable Package",
          description: "Essential foundation implementation with clean architecture and documentation.",
          price: payload.basicPrice,
          deliveryDays: 3,
          revisions: 2,
        },
        {
          tier: "STANDARD",
          name: "Full Production Suite",
          description: "Complete multi-module implementation with integration tests and Docker support.",
          price: payload.standardPrice,
          deliveryDays: 5,
          revisions: 5,
        },
        {
          tier: "PREMIUM",
          name: "Enterprise Cloud Ecosystem",
          description: "End-to-end production system with Kubernetes Helm charts and priority SLA.",
          price: payload.premiumPrice,
          deliveryDays: 10,
          revisions: 10,
        },
      ],
    };

    const fallbackGig: Gig = {
      ...SEED_GIGS[0],
      id: `gig-${Date.now()}`,
      title: body.title,
      category: payload.category,
      startingPrice: payload.basicPrice,
      packages: {
        Basic: { ...SEED_GIGS[0].packages.Basic, price: payload.basicPrice },
        Standard: { ...SEED_GIGS[0].packages.Standard, price: payload.standardPrice },
        Premium: { ...SEED_GIGS[0].packages.Premium, price: payload.premiumPrice },
      },
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw = await fetchWithFallback<any>("/gigs", fallbackGig, {
      method: "POST",
      body: JSON.stringify(body),
    });
    return mapBackendGigToUi(raw);
  },

  // 4. Orders & Escrow Lifecycle (/api/v1/orders)
  async getOrders(): Promise<Order[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawList = await fetchWithFallback<any[]>("/orders", SEED_ORDERS);
    if (!Array.isArray(rawList) || rawList.length === 0) {
      return SEED_ORDERS;
    }
    return rawList.map(mapBackendOrderToUi);
  },

  async getOrderById(orderId: string): Promise<Order> {
    const uuid = resolveBackendUuid(orderId, "44444444-4444-4444-4444-444444444444");
    const fallback = SEED_ORDERS.find((o) => o.id === uuid) || SEED_ORDERS[0];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw = await fetchWithFallback<any>(`/orders/${uuid}`, fallback);
    return mapBackendOrderToUi(raw);
  },

  async createOrder(payload: {
    gigId: string;
    packageTier: PackageTierName;
    requirements: string;
    amount?: number;
    sellerId?: string;
  }): Promise<Order> {
    const session = getAuthSession();
    const gig =
      SEED_GIGS.find((g) => g.id === payload.gigId) ||
      SEED_GIGS.find((g) => GIG_ID_TO_UUID[g.id] === payload.gigId) ||
      SEED_GIGS[0];
    const pkg = gig.packages[payload.packageTier] || gig.packages.Standard;
    const price = payload.amount ?? pkg.price;
    const serviceFee = Number((price * 0.055).toFixed(2));

    const backendGigId = resolveBackendUuid(
      payload.gigId,
      "11111111-1111-1111-1111-111111111111"
    );
    const buyerId = resolveBackendUuid(
      session.account.id,
      "33333333-3333-3333-3333-333333333333"
    );
    const sellerId = resolveBackendUuid(
      payload.sellerId || gig.seller.id,
      "11111111-1111-1111-1111-111111111111"
    );

    const fallbackOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: `#FO-${Math.floor(1000000 + Math.random() * 9000000)}`,
      gigId: gig.id,
      gigTitle: gig.title,
      gigThumbnail: gig.thumbnailUrl,
      packageTier: payload.packageTier,
      buyerName: session.displayName || "Jordan Taylor",
      buyerUsername: session.account.username || "jordan_taylor",
      sellerName: gig.seller.displayName,
      sellerUsername: gig.seller.username,
      sellerLevel: gig.seller.level,
      amount: price,
      serviceFee,
      totalEscrow: Number((price + serviceFee).toFixed(2)),
      status: "IN_PROGRESS",
      dueDate: new Date(Date.now() + pkg.deliveryDays * 86400000).toISOString(),
      createdAt: new Date().toISOString(),
      revisionsUsed: 0,
      revisionsAllowed: pkg.revisions,
      requirements:
        payload.requirements || "Please follow the architectural guidelines discussed.",
      buyerId,
      sellerId,
    };

    const requestBody = {
      gigId: backendGigId,
      buyerId,
      sellerId,
      packageTier: payload.packageTier.toUpperCase(),
      amount: price,
      requirements:
        payload.requirements || "Please follow the architectural guidelines discussed.",
      maxRevisions: typeof pkg.revisions === "number" ? pkg.revisions : 10,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw = await fetchWithFallback<any>("/orders", fallbackOrder, {
      method: "POST",
      body: JSON.stringify(requestBody),
    });
    return mapBackendOrderToUi(raw);
  },

  async deliverOrder(
    orderId: string,
    payload: { sellerId?: string; deliveryNote: string; deliverableUrl?: string }
  ): Promise<Order> {
    const uuid = resolveBackendUuid(orderId, "44444444-4444-4444-4444-444444444444");
    const existing = SEED_ORDERS.find((o) => o.id === uuid) || SEED_ORDERS[0];
    const body = {
      sellerId: resolveBackendUuid(
        payload.sellerId || existing.sellerId,
        "11111111-1111-1111-1111-111111111111"
      ),
      deliveryNote: payload.deliveryNote,
      deliverableUrl:
        payload.deliverableUrl || "https://github.com/fiverrex/deliverables-release-v1.zip",
    };
    const fallback: Order = {
      ...existing,
      id: orderId,
      status: "DELIVERED",
      deliveryNote: payload.deliveryNote,
      deliveredAt: new Date().toISOString(),
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw = await fetchWithFallback<any>(`/orders/${uuid}/deliver`, fallback, {
      method: "POST",
      body: JSON.stringify(body),
    });
    return mapBackendOrderToUi(raw);
  },

  async requestRevision(
    orderId: string,
    payload: { buyerId?: string; reason: string }
  ): Promise<Order> {
    const uuid = resolveBackendUuid(orderId, "44444444-4444-4444-4444-444444444444");
    const existing = SEED_ORDERS.find((o) => o.id === uuid) || SEED_ORDERS[0];
    const body = {
      buyerId: resolveBackendUuid(
        payload.buyerId || existing.buyerId,
        "33333333-3333-3333-3333-333333333333"
      ),
      reason: payload.reason,
    };
    const fallback: Order = {
      ...existing,
      id: orderId,
      status: "REVISION_REQUESTED",
      revisionsUsed: existing.revisionsUsed + 1,
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw = await fetchWithFallback<any>(`/orders/${uuid}/revisions`, fallback, {
      method: "POST",
      body: JSON.stringify(body),
    });
    return mapBackendOrderToUi(raw);
  },

  async completeOrder(orderId: string, buyerId?: string): Promise<Order> {
    const uuid = resolveBackendUuid(orderId, "44444444-4444-4444-4444-444444444444");
    const existing = SEED_ORDERS.find((o) => o.id === uuid) || SEED_ORDERS[0];
    const body = {
      buyerId: resolveBackendUuid(
        buyerId || existing.buyerId,
        "33333333-3333-3333-3333-333333333333"
      ),
    };
    const fallback: Order = {
      ...existing,
      id: orderId,
      status: "COMPLETED",
      completedAt: new Date().toISOString(),
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw = await fetchWithFallback<any>(`/orders/${uuid}/complete`, fallback, {
      method: "POST",
      body: JSON.stringify(body),
    });
    return mapBackendOrderToUi(raw);
  },

  // 5. Payment & Escrow Wallet Service (/api/v1/payments)
  async getEscrowTransactions(): Promise<EscrowTransactionItem[]> {
    return fetchWithFallback<EscrowTransactionItem[]>(
      "/payments/escrow",
      SEED_ESCROW_TRANSACTIONS
    );
  },

  async holdEscrow(payload: {
    orderId: string;
    buyerId?: string;
    sellerId?: string;
    grossAmount: number;
    paymentMethodToken?: string;
  }): Promise<EscrowTransactionItem> {
    const session = getAuthSession();
    const orderUuid = resolveBackendUuid(
      payload.orderId,
      "44444444-4444-4444-4444-444444444444"
    );
    const buyerUuid = resolveBackendUuid(
      payload.buyerId || session.account.id,
      "33333333-3333-3333-3333-333333333333"
    );
    const sellerUuid = resolveBackendUuid(
      payload.sellerId,
      "11111111-1111-1111-1111-111111111111"
    );
    const fallback: EscrowTransactionItem = {
      id: `escrow-${Date.now()}`,
      orderId: orderUuid,
      buyerId: buyerUuid,
      sellerId: sellerUuid,
      grossAmount: payload.grossAmount,
      platformFee: Number((payload.grossAmount * 0.2).toFixed(2)),
      sellerNetPayout: Number((payload.grossAmount * 0.8).toFixed(2)),
      gatewayChargeId: `ch_fvx_${Date.now()}`,
      status: "HELD",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return fetchWithFallback<EscrowTransactionItem>("/payments/escrow/hold", fallback, {
      method: "POST",
      body: JSON.stringify({
        orderId: orderUuid,
        buyerId: buyerUuid,
        sellerId: sellerUuid,
        grossAmount: payload.grossAmount,
        paymentMethodToken: payload.paymentMethodToken || "tok_fiverrex_visa_4242",
      }),
    });
  },

  async releaseEscrow(orderId: string): Promise<EscrowTransactionItem> {
    const orderUuid = resolveBackendUuid(
      orderId,
      "44444444-4444-4444-4444-444444444444"
    );
    const fallback: EscrowTransactionItem = {
      ...SEED_ESCROW_TRANSACTIONS[0],
      orderId: orderUuid,
      status: "RELEASED",
      updatedAt: new Date().toISOString(),
    };
    return fetchWithFallback<EscrowTransactionItem>(
      "/payments/escrow/release",
      fallback,
      {
        method: "POST",
        body: JSON.stringify({ orderId: orderUuid }),
      }
    );
  },

  async getWallets(): Promise<SellerWalletItem[]> {
    return fetchWithFallback<SellerWalletItem[]>("/payments/wallets", SEED_WALLETS);
  },

  async getSellerWallet(sellerId?: string): Promise<SellerWalletItem> {
    const session = getAuthSession();
    const uuid = resolveBackendUuid(
      sellerId || session.sellerId,
      "11111111-1111-1111-1111-111111111111"
    );
    const fallback =
      SEED_WALLETS.find((w) => w.sellerId === uuid) || SEED_WALLETS[0];
    return fetchWithFallback<SellerWalletItem>(`/payments/wallets/${uuid}`, fallback);
  },

  async withdrawFunds(payload: {
    sellerId?: string;
    amount: number;
    payoutDestination?: string;
  }): Promise<SellerWalletItem> {
    const session = getAuthSession();
    const sellerUuid = resolveBackendUuid(
      payload.sellerId || session.sellerId,
      "11111111-1111-1111-1111-111111111111"
    );
    const fallback: SellerWalletItem = {
      sellerId: sellerUuid,
      availableBalance: 0,
      withdrawnTotal: payload.amount + 800,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return fetchWithFallback<SellerWalletItem>("/payments/wallets/withdraw", fallback, {
      method: "POST",
      body: JSON.stringify({
        sellerId: sellerUuid,
        amount: payload.amount,
        payoutDestination: payload.payoutDestination || "stripe_Express_Acct_FIVERREX",
      }),
    });
  },

  async getSellerDashboard(): Promise<SellerDashboardStats> {
    const [wallets, escrows, orders] = await Promise.all([
      this.getWallets(),
      this.getEscrowTransactions(),
      this.getOrders(),
    ]);
    const session = getAuthSession();
    const primaryWallet =
      wallets.find((w) => w.sellerId === session.sellerId) || wallets[0];
    const pendingEscrow = escrows
      .filter((e) => e.status === "HELD")
      .reduce((sum, e) => sum + Number(e.grossAmount || 0), 0);
    const clearedEscrow = escrows
      .filter((e) => e.status === "RELEASED")
      .reduce((sum, e) => sum + Number(e.sellerNetPayout || 0), 0);
    const activeOrders = orders.filter((o) => o.status !== "COMPLETED" && o.status !== "CANCELLED");

    return {
      ...SEED_SELLER_STATS,
      availableForWithdrawal: primaryWallet
        ? Number(primaryWallet.availableBalance)
        : SEED_SELLER_STATS.availableForWithdrawal,
      escrowPendingBalance: pendingEscrow || SEED_SELLER_STATS.escrowPendingBalance,
      clearedThisMonth:
        (clearedEscrow || 0) +
        (primaryWallet ? Number(primaryWallet.withdrawnTotal || 0) : 0) ||
        SEED_SELLER_STATS.clearedThisMonth,
      activeOrdersCount: activeOrders.length || SEED_SELLER_STATS.activeOrdersCount,
      activeOrdersValue:
        activeOrders.reduce((s, o) => s + o.totalEscrow, 0) ||
        SEED_SELLER_STATS.activeOrdersValue,
    };
  },

  // 6. Messaging & Chat Service (/api/v1/messages)
  async getAllMessages(): Promise<MessageItem[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawList = await fetchWithFallback<any[]>(
      "/messages",
      SEED_CONVERSATIONS[0].messages
    );
    return Array.isArray(rawList) ? rawList.map(mapBackendMessageToUi) : [];
  },

  async getConversationMessages(conversationId: string): Promise<MessageItem[]> {
    if (!UUID_REGEX.test(conversationId)) {
      const found = SEED_CONVERSATIONS.find((c) => c.id === conversationId);
      return found ? found.messages : SEED_CONVERSATIONS[0].messages;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawList = await fetchWithFallback<any[]>(
      `/messages/conversations/${conversationId}`,
      SEED_CONVERSATIONS[0].messages
    );
    return Array.isArray(rawList) && rawList.length > 0
      ? rawList.map(mapBackendMessageToUi)
      : SEED_CONVERSATIONS[0].messages;
  },

  async getConversations(): Promise<Conversation[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawConvs = await fetchWithFallback<any[]>(
      "/messages/conversations",
      SEED_CONVERSATIONS
    );
    if (!Array.isArray(rawConvs) || rawConvs.length === 0) {
      return SEED_CONVERSATIONS;
    }

    const mappedConvs = await Promise.all(
      rawConvs.map(async (rc) => {
        if (rc.participantName && Array.isArray(rc.messages)) {
          return rc as Conversation;
        }
        const msgs = await this.getConversationMessages(String(rc.id));
        return mapBackendConversationToUi(rc, msgs);
      })
    );

    const existingIds = new Set(mappedConvs.map((c) => c.id));
    return [
      ...mappedConvs,
      ...SEED_CONVERSATIONS.filter((sc) => !existingIds.has(sc.id)),
    ];
  },

  async sendMessage(payload: {
    conversationId?: string;
    senderId?: string;
    recipientId?: string;
    gigId?: string;
    content: string;
    messageType?: "TEXT" | "CUSTOM_OFFER";
    customOffer?: {
      title: string;
      description?: string;
      packageTier?: PackageTierName;
      price: number;
      deliveryDays: number;
      revisions?: number;
    };
  }): Promise<MessageItem> {
    const session = getAuthSession();
    const convUuid =
      payload.conversationId && UUID_REGEX.test(payload.conversationId)
        ? payload.conversationId
        : "137ad359-20c7-492f-b978-416db5932478";
    const senderUuid = resolveBackendUuid(
      payload.senderId || session.account.id,
      "11111111-1111-1111-1111-111111111111"
    );
    const recipientUuid = resolveBackendUuid(
      payload.recipientId,
      "22222222-2222-2222-2222-222222222222"
    );
    const gigUuid = resolveBackendUuid(
      payload.gigId,
      "33333333-3333-3333-3333-333333333333"
    );

    const body = {
      conversationId: convUuid,
      senderId: senderUuid,
      recipientId: recipientUuid,
      gigId: gigUuid,
      content: payload.content,
      messageType: payload.messageType || "TEXT",
      attachmentUrls: [],
      customOffer: payload.customOffer
        ? {
            offerId: "44444444-4444-4444-4444-444444444444",
            gigId: gigUuid,
            title: payload.customOffer.title,
            description:
              payload.customOffer.description ||
              "Custom milestone package protected by FIVERREX Payment Escrow.",
            price: payload.customOffer.price,
            deliveryDays: payload.customOffer.deliveryDays,
            status: "PENDING",
          }
        : null,
    };

    const fallbackMsg: MessageItem = {
      id: `msg-${Date.now()}`,
      sender: payload.messageType === "CUSTOM_OFFER" ? "seller" : "buyer",
      senderName: session.displayName || "Jordan Taylor",
      text: payload.content,
      timestamp: "Just now",
      customOffer: payload.customOffer
        ? {
            offerId: "44444444-4444-4444-4444-444444444444",
            gigId: gigUuid,
            title: payload.customOffer.title,
            packageTier: payload.customOffer.packageTier || "Standard",
            price: payload.customOffer.price,
            deliveryDays: payload.customOffer.deliveryDays,
            revisions: payload.customOffer.revisions ?? 4,
            status: "PENDING",
          }
        : undefined,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw = await fetchWithFallback<any>("/messages", fallbackMsg, {
      method: "POST",
      body: JSON.stringify(body),
    });
    const mapped = mapBackendMessageToUi(raw);
    if (payload.customOffer && mapped.customOffer) {
      mapped.customOffer.packageTier = payload.customOffer.packageTier || "Standard";
      mapped.customOffer.revisions = payload.customOffer.revisions ?? 4;
    }
    return mapped;
  },

  // 7. Verified Review Service (/api/v1/reviews)
  async getAllReviews(): Promise<ReviewItem[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawList = await fetchWithFallback<any[]>("/reviews", SEED_GIGS[0].reviews);
    return Array.isArray(rawList) ? rawList.map(mapBackendReviewToUi) : SEED_GIGS[0].reviews;
  },

  async getGigReviews(gigId: string): Promise<ReviewItem[]> {
    const uuid = resolveBackendUuid(gigId, "33333333-3333-3333-3333-333333333333");
    const seedGig = SEED_GIGS.find((g) => g.id === gigId) || SEED_GIGS[0];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawList = await fetchWithFallback<any[]>(
      `/reviews/gig/${uuid}`,
      seedGig.reviews
    );
    const mapped = Array.isArray(rawList) ? rawList.map(mapBackendReviewToUi) : [];
    const seenIds = new Set(mapped.map((r) => r.id));
    return [...mapped, ...seedGig.reviews.filter((sr) => !seenIds.has(sr.id))];
  },

  async submitReview(payload: {
    orderId?: string;
    gigId: string;
    buyerId?: string;
    sellerId?: string;
    communicationRating: number;
    serviceAsDescribedRating: number;
    buyAgainRecommendRating: number;
    comment: string;
  }): Promise<ReviewItem> {
    const session = getAuthSession();
    // Generate a deterministic unique UUID for orderId so unique constraint on orderId in review DB succeeds
    const randomHex = Math.floor(100000000000 + Math.random() * 899999999999).toString(16).slice(0, 12);
    const uniqueOrderUuid =
      payload.orderId && UUID_REGEX.test(payload.orderId)
        ? payload.orderId
        : `55555555-5555-4555-8555-${randomHex.padEnd(12, "0")}`;
    const gigUuid = resolveBackendUuid(
      payload.gigId,
      "33333333-3333-3333-3333-333333333333"
    );
    const buyerUuid = resolveBackendUuid(
      payload.buyerId || session.account.id,
      "33333333-3333-3333-3333-333333333333"
    );
    const sellerUuid = resolveBackendUuid(
      payload.sellerId,
      "22222222-2222-2222-2222-222222222222"
    );

    const avg = Number(
      (
        (payload.communicationRating +
          payload.serviceAsDescribedRating +
          payload.buyAgainRecommendRating) /
        3
      ).toFixed(1)
    );

    const fallbackReview: ReviewItem = {
      id: `rev-${Date.now()}`,
      buyerName: session.displayName || "Jordan Taylor",
      buyerCountry: "United States",
      buyerAvatar: session.avatarUrl,
      ratingOverall: avg,
      communicationRating: payload.communicationRating,
      serviceAsDescribedRating: payload.serviceAsDescribedRating,
      recommendRating: payload.buyAgainRecommendRating,
      comment: payload.comment,
      packageOrdered: "Premium",
      priceRange: "Escrow Verified",
      createdAt: "Just now",
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw = await fetchWithFallback<any>("/reviews", fallbackReview, {
      method: "POST",
      body: JSON.stringify({
        orderId: uniqueOrderUuid,
        gigId: gigUuid,
        buyerId: buyerUuid,
        sellerId: sellerUuid,
        communicationRating: payload.communicationRating,
        serviceAsDescribedRating: payload.serviceAsDescribedRating,
        buyAgainRecommendRating: payload.buyAgainRecommendRating,
        comment: payload.comment,
      }),
    });
    return mapBackendReviewToUi(raw);
  },

  async addSellerResponse(
    reviewId: string,
    payload: string | { sellerId?: string; sellerResponse: string }
  ): Promise<ReviewItem> {
    const responseText =
      typeof payload === "string" ? payload : payload.sellerResponse;
    const rawSellerId =
      typeof payload === "string" ? undefined : payload.sellerId;
    const uuid = resolveBackendUuid(reviewId, "cf4277bb-47d0-46dc-83d4-a54ef1ebb7be");
    const sellerUuid = resolveBackendUuid(
      rawSellerId || getAuthSession().sellerId,
      "22222222-2222-2222-2222-222222222222"
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw = await fetchWithFallback<any>(
      `/reviews/${uuid}/seller-response`,
      { ...SEED_GIGS[0].reviews[0], id: reviewId, sellerResponse: responseText },
      {
        method: "POST",
        body: JSON.stringify({
          sellerId: sellerUuid,
          sellerResponse: responseText,
        }),
      }
    );
    const mapped = mapBackendReviewToUi(raw);
    return {
      ...mapped,
      sellerResponse: mapped.sellerResponse || responseText,
    };
  },

  // 8. Multi-Channel Notification Service (/api/v1/notifications)
  async getNotifications(): Promise<NotificationItem[]> {
    return fetchWithFallback<NotificationItem[]>("/notifications", SEED_NOTIFICATIONS);
  },

  async getUserNotifications(recipientUserId?: string): Promise<NotificationItem[]> {
    const uuid = resolveBackendUuid(
      recipientUserId || getAuthSession().account.id,
      "11111111-1111-1111-1111-111111111111"
    );
    return fetchWithFallback<NotificationItem[]>(
      `/notifications/users/${uuid}`,
      SEED_NOTIFICATIONS
    );
  },

  async sendNotification(payload: {
    recipientUserId?: string;
    type?: string;
    title: string;
    message: string;
    channel?: "IN_APP" | "EMAIL" | "ALL";
  }): Promise<NotificationItem> {
    const recipientUuid = resolveBackendUuid(
      payload.recipientUserId || getAuthSession().account.id,
      "11111111-1111-1111-1111-111111111111"
    );
    const fallback: NotificationItem = {
      id: `notif-${Date.now()}`,
      recipientUserId: recipientUuid,
      type: payload.type || "ORDER_CREATED",
      title: payload.title,
      message: payload.message,
      channel: payload.channel || "IN_APP",
      read: false,
      readAt: null,
      createdAt: new Date().toISOString(),
    };
    return fetchWithFallback<NotificationItem>("/notifications", fallback, {
      method: "POST",
      body: JSON.stringify({
        recipientUserId: recipientUuid,
        type: payload.type || "ORDER_CREATED",
        title: payload.title,
        message: payload.message,
        channel: payload.channel || "IN_APP",
      }),
    });
  },

  async markNotificationRead(notificationId: string): Promise<NotificationItem> {
    const fallback: NotificationItem = {
      ...SEED_NOTIFICATIONS[0],
      id: notificationId,
      read: true,
      readAt: new Date().toISOString(),
    };
    if (!UUID_REGEX.test(notificationId)) {
      return fallback;
    }
    return fetchWithFallback<NotificationItem>(
      `/notifications/${notificationId}/read`,
      fallback,
      {
        method: "PATCH",
      }
    );
  },
};
