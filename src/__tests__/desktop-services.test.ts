import { describe, expect, it } from "vitest";
import os from "node:os";
import path from "node:path";
import fs from "node:fs";
import {
  DesktopJsonStore,
  FIVERREX_CLUSTER_TARGETS,
  formatEscrowReceiptMarkdown,
  getSystemDiagnostics,
} from "../../electron/services";
import {
  mapBackendGigToUi,
  mapBackendOrderToUi,
  mapBackendReviewToUi,
  resolveBackendUuid,
  SEED_GIGS,
} from "../lib/api";

describe("FIVERREX Electron Desktop Services & DDD Compliance", () => {
  it("enforces DDD repository location (domain/repository/*) across all microservices", () => {
    const microservices = FIVERREX_CLUSTER_TARGETS.filter(
      (t) => t.category === "MICROSERVICE"
    );
    expect(microservices.length).toBe(8);
    for (const svc of microservices) {
      expect(svc.dddRepository).toBeDefined();
      expect(svc.dddRepository?.startsWith("domain/repository/")).toBe(true);
      expect(svc.dddRepository?.includes("application/port/out")).toBe(false);
    }
  });

  it("persists and reloads DesktopJsonStore state on disk", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "fiverrex-electron-test-"));
    const store1 = new DesktopJsonStore(tmpDir, "test-store.json");
    store1.set("favoriteGigIds", ["gig-101", "gig-103"]);
    store1.set("nativeNotifications", true);

    const store2 = new DesktopJsonStore(tmpDir, "test-store.json");
    expect(store2.get<string[]>("favoriteGigIds", [])).toEqual([
      "gig-101",
      "gig-103",
    ]);
    expect(store2.get<boolean>("nativeNotifications", false)).toBe(true);
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("formats official Escrow Ledger Receipts with accurate breakdown", () => {
    const markdown = formatEscrowReceiptMarkdown({
      orderNumber: "#FO-8849201",
      orderId: "44444444-4444-4444-4444-444444444444",
      gigTitle: "Spring Boot 3 Microservices on Kubernetes",
      packageTier: "Premium",
      buyerName: "Jordan Taylor",
      sellerName: "Alex Rivera",
      amount: 995,
      serviceFee: 54.73,
      totalEscrow: 1049.73,
      status: "COMPLETED",
      escrowStatus: "RELEASED",
      gatewayChargeId: "ch_fvx_44444444",
      createdAt: "2026-10-28T10:15:00Z",
      completedAt: "2026-11-08T09:00:00Z",
    });

    expect(markdown).toContain("# FIVERREX OFFICIAL ESCROW LEDGER RECEIPT");
    expect(markdown).toContain("#FO-8849201");
    expect(markdown).toContain("$1049.73");
    expect(markdown).toContain("RELEASED");
  });

  it("collects Electron workstation system diagnostics", () => {
    const diag = getSystemDiagnostics("/tmp/fiverrex", "1.0.0");
    expect(diag.appName).toBe("FIVERREX Desktop");
    expect(diag.cpus).toBeGreaterThan(0);
    expect(diag.totalMemoryGb).toBeGreaterThan(0);
  });

  it("normalizes backend Spring Boot DTOs into rich Desktop UI models", () => {
    const uuid = resolveBackendUuid("gig-101");
    expect(uuid).toBe("11111111-1111-1111-1111-111111111111");

    const uiGig = mapBackendGigToUi({
      id: "11111111-1111-1111-1111-111111111111",
      title: "Custom Enterprise Spring Boot 3 Microservice",
      category: "Programming & Tech",
      packages: [
        { tier: "BASIC", price: 210, deliveryDays: 3, revisions: 2 },
        { tier: "STANDARD", price: 520, deliveryDays: 6, revisions: 5 },
        { tier: "PREMIUM", price: 1100, deliveryDays: 12, revisions: 10 },
      ],
    });
    expect(uiGig.packages.Basic.price).toBe(210);
    expect(uiGig.packages.Premium.price).toBe(1100);

    const uiOrder = mapBackendOrderToUi({
      id: "44444444-4444-4444-4444-444444444444",
      gigId: SEED_GIGS[0].id,
      amount: 500,
      packageTier: "STANDARD",
      status: "DELIVERED",
    });
    expect(uiOrder.status).toBe("DELIVERED");
    expect(uiOrder.totalEscrow).toBe(527.5);

    const uiReview = mapBackendReviewToUi({
      id: "rev-test-1",
      overallRating: 5.0,
      communicationRating: 5.0,
      serviceAsDescribedRating: 5.0,
      buyAgainRecommendRating: 5.0,
      comment: "Flawless hexagonal architecture!",
    });
    expect(uiReview.ratingOverall).toBe(5.0);
    expect(uiReview.comment).toContain("hexagonal");
  });
});

