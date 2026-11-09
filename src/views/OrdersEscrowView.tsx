import React, { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  FolderOpen,
  Lock,
  RefreshCw,
  ShieldCheck,
  UploadCloud,
} from "lucide-react";
import {
  fiverrApi,
  SEED_ESCROW_TRANSACTIONS,
  SEED_ORDERS,
  type EscrowTransactionItem,
  type Order,
  type OrderStatus,
} from "@/lib/api";
import { desktopClient } from "@/lib/desktop";

export function OrdersEscrowView() {
  const [orders, setOrders] = useState<Order[]>(SEED_ORDERS);
  const [escrows, setEscrows] = useState<EscrowTransactionItem[]>(
    SEED_ESCROW_TRANSACTIONS
  );
  const [selectedOrderId, setSelectedOrderId] = useState<string>(
    SEED_ORDERS[0].id
  );
  const [roleView, setRoleView] = useState<"BUYER" | "SELLER">("BUYER");
  const [deliveryInput, setDeliveryInput] = useState<string>("");
  const [attachedFiles, setAttachedFiles] = useState<string[]>([]);
  const [actionToast, setActionToast] = useState<string | null>(null);
  const [busyAction, setBusyAction] = useState<boolean>(false);

  useEffect(() => {
    async function loadOrdersAndEscrow() {
      const [liveOrders, liveEscrows] = await Promise.all([
        fiverrApi.getOrders(),
        fiverrApi.getEscrowTransactions(),
      ]);
      if (liveOrders && liveOrders.length > 0) {
        setOrders(liveOrders);
        setSelectedOrderId((prev) =>
          liveOrders.some((o) => o.id === prev) ? prev : liveOrders[0].id
        );
      }
      if (liveEscrows && liveEscrows.length > 0) {
        setEscrows(liveEscrows);
      }
    }
    loadOrdersAndEscrow();
  }, []);

  const activeOrder =
    orders.find((o) => o.id === selectedOrderId) || orders[0];
  const activeEscrow = escrows.find((e) => e.orderId === activeOrder.id);

  function updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
    note?: string,
    extraAttachments?: string[]
  ) {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== orderId) return ord;
        return {
          ...ord,
          status: newStatus,
          deliveryNote: note ?? ord.deliveryNote,
          deliveryAttachments:
            extraAttachments && extraAttachments.length > 0
              ? [...(ord.deliveryAttachments || []), ...extraAttachments]
              : ord.deliveryAttachments,
          deliveredAt:
            newStatus === "DELIVERED"
              ? new Date().toISOString()
              : ord.deliveredAt,
          completedAt:
            newStatus === "COMPLETED"
              ? new Date().toISOString()
              : ord.completedAt,
          revisionsUsed:
            newStatus === "REVISION_REQUESTED"
              ? ord.revisionsUsed + 1
              : ord.revisionsUsed,
        };
      })
    );
  }

  async function handleSelectNativeFiles() {
    const picked = await desktopClient.selectDeliverableFiles();
    if (picked && picked.length > 0) {
      setAttachedFiles((prev) => [...prev, ...picked]);
      setActionToast(
        `Attached ${picked.length} local artifact(s) via Electron File Dialog.`
      );
    }
  }

  async function handleExportReceipt() {
    const res = await desktopClient.exportEscrowReceipt({
      orderNumber: activeOrder.orderNumber,
      orderId: activeOrder.id,
      gigTitle: activeOrder.gigTitle,
      packageTier: activeOrder.packageTier,
      buyerName: activeOrder.buyerName,
      sellerName: activeOrder.sellerName,
      amount: activeOrder.amount,
      serviceFee: activeOrder.serviceFee,
      totalEscrow: activeOrder.totalEscrow,
      status: activeOrder.status,
      escrowStatus:
        activeOrder.status === "COMPLETED"
          ? "RELEASED"
          : activeEscrow?.status || "HELD",
      gatewayChargeId: activeEscrow?.gatewayChargeId || "ch_fvx_escrow_verified",
      createdAt: activeOrder.createdAt,
      completedAt: activeOrder.completedAt,
    });
    if (res.saved) {
      setActionToast(
        `Official Escrow Receipt exported to ${res.filePath || "disk"}!`
      );
    }
  }

  async function handleSubmitDelivery(e: React.FormEvent) {
    e.preventDefault();
    setBusyAction(true);
    const note =
      deliveryInput.trim() ||
      "Updated build artifacts and Helm release manifests uploaded for verification.";
    const updated = await fiverrApi.deliverOrder(activeOrder.id, {
      sellerId: activeOrder.sellerId,
      deliveryNote: note,
      deliverableUrl:
        attachedFiles[0] ||
        "https://github.com/fiverrex/deliverables-release-v1.zip",
    });
    updateOrderStatus(
      activeOrder.id,
      updated.status || "DELIVERED",
      note,
      attachedFiles
    );
    setDeliveryInput("");
    setAttachedFiles([]);
    setBusyAction(false);
    await desktopClient.notify(
      `Order ${activeOrder.orderNumber} Delivered`,
      `Deliverables submitted to ${activeOrder.buyerName} via fiverr-order-service.`
    );
    setActionToast(
      `Order ${activeOrder.orderNumber} marked as DELIVERED via POST /api/v1/orders/${activeOrder.id.slice(
        0,
        8
      )}/deliver!`
    );
  }

  async function handleRequestRevision() {
    setBusyAction(true);
    const updated = await fiverrApi.requestRevision(activeOrder.id, {
      buyerId: activeOrder.buyerId,
      reason:
        "Please add additional integration test coverage and Helm values documentation.",
    });
    updateOrderStatus(
      activeOrder.id,
      updated.status || "REVISION_REQUESTED"
    );
    setBusyAction(false);
    setActionToast(
      `Revision requested on ${activeOrder.orderNumber} via POST /api/v1/orders/${activeOrder.id.slice(
        0,
        8
      )}/revisions.`
    );
  }

  async function handleApproveAndReleaseEscrow() {
    setBusyAction(true);
    const [, releasedEscrow] = await Promise.all([
      fiverrApi.completeOrder(activeOrder.id, activeOrder.buyerId),
      fiverrApi.releaseEscrow(activeOrder.id),
    ]);
    updateOrderStatus(activeOrder.id, "COMPLETED");
    setEscrows((prev) =>
      prev.map((e) =>
        e.orderId === activeOrder.id ? { ...e, status: releasedEscrow.status } : e
      )
    );
    setBusyAction(false);
    window.dispatchEvent(new CustomEvent("fiverrex-session-change"));
    await desktopClient.notify(
      `Escrow Released • $${activeOrder.totalEscrow.toFixed(2)}`,
      `Funds settled to ${activeOrder.sellerName}'s wallet via fiverr-payment-service.`
    );
    setActionToast(
      `Escrow of $${activeOrder.totalEscrow.toFixed(2)} released to ${activeOrder.sellerName}'s wallet via POST /api/v1/payments/escrow/release!`
    );
  }

  const timelineSteps: { key: OrderStatus; label: string; desc: string }[] = [
    {
      key: "IN_PROGRESS",
      label: "1. Escrow Funded & In Progress",
      desc: "Funds locked in fiverr-payment-service ledger",
    },
    {
      key: "DELIVERED",
      label: "2. Work Delivered",
      desc: "Artifacts submitted by Seller for inspection",
    },
    {
      key: "COMPLETED",
      label: "3. Approved & Escrow Released",
      desc: "Payout settled to Seller Available Balance",
    },
  ];

  function getStepState(stepKey: OrderStatus, currentStatus: OrderStatus) {
    const rank: Record<OrderStatus, number> = {
      IN_PROGRESS: 1,
      REVISION_REQUESTED: 1,
      DELIVERED: 2,
      COMPLETED: 3,
      CANCELLED: 0,
    };
    const currentRank = rank[currentStatus];
    const stepRank = rank[stepKey];
    if (currentRank > stepRank || currentStatus === "COMPLETED") return "DONE";
    if (currentRank === stepRank) return "ACTIVE";
    return "PENDING";
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header & Role Switcher */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-[#1dbf73]">
            <ShieldCheck className="h-3.5 w-3.5" />
            Order &amp; Escrow Saga Workspace
          </span>
          <h1 className="mt-2 text-2xl font-extrabold text-gray-900 sm:text-3xl">
            Manage Orders &amp; Escrow Releases
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleExportReceipt}
            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-300 bg-white px-3.5 py-2 text-xs font-bold text-gray-800 shadow-sm transition hover:border-[#1dbf73] hover:text-[#1dbf73]"
          >
            <Download className="h-3.5 w-3.5 text-[#1dbf73]" />
            <span>Export Escrow Receipt</span>
          </button>

          <div className="inline-flex rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setRoleView("BUYER")}
              className={`rounded-lg px-4 py-2 text-xs font-bold transition ${
                roleView === "BUYER"
                  ? "bg-[#1dbf73] text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Buyer View (Approve / Revision)
            </button>
            <button
              type="button"
              onClick={() => setRoleView("SELLER")}
              className={`rounded-lg px-4 py-2 text-xs font-bold transition ${
                roleView === "SELLER"
                  ? "bg-[#0a4226] text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Seller View (Submit Delivery)
            </button>
          </div>
        </div>
      </div>

      {actionToast && (
        <div className="mb-6 flex items-center justify-between rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-950 shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-[#1dbf73]" />
            <span>{actionToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionToast(null)}
            className="text-emerald-700 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left List of Orders */}
        <div className="space-y-3 lg:col-span-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Active &amp; Recent Orders ({orders.length})
          </h2>
          {orders.map((ord) => {
            const isSelected = ord.id === activeOrder.id;
            return (
              <button
                key={ord.id}
                type="button"
                onClick={() => setSelectedOrderId(ord.id)}
                className={`w-full rounded-xl border p-4 text-left transition ${
                  isSelected
                    ? "border-[#1dbf73] bg-emerald-50/40 ring-2 ring-[#1dbf73]/20"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-extrabold text-gray-900">
                    {ord.orderNumber}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                      ord.status === "COMPLETED"
                        ? "bg-emerald-100 text-emerald-800"
                        : ord.status === "DELIVERED"
                        ? "bg-amber-100 text-amber-800"
                        : ord.status === "REVISION_REQUESTED"
                        ? "bg-rose-100 text-rose-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {ord.status.replace("_", " ")}
                  </span>
                </div>
                <p className="mt-2 line-clamp-2 text-xs font-bold text-gray-800">
                  {ord.gigTitle}
                </p>
                <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-2 text-[11px] text-gray-500">
                  <span>
                    {ord.packageTier} • Seller: @{ord.sellerUsername}
                  </span>
                  <span className="font-extrabold text-gray-900">
                    ${ord.totalEscrow.toFixed(2)}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Order Detail Panel */}
        <div className="space-y-6 lg:col-span-8">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-gray-200 pb-5">
              <div className="flex items-start gap-4">
                <img
                  src={activeOrder.gigThumbnail}
                  alt={activeOrder.gigTitle}
                  className="h-16 w-24 rounded-lg object-cover"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-extrabold text-gray-900">
                      {activeOrder.orderNumber}
                    </span>
                    <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-bold text-gray-700">
                      {activeOrder.packageTier} Tier
                    </span>
                    {activeEscrow?.gatewayChargeId && (
                      <span className="rounded bg-emerald-50 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-800">
                        {activeEscrow.gatewayChargeId}
                      </span>
                    )}
                  </div>
                  <h3 className="mt-1 text-sm font-bold text-gray-900">
                    {activeOrder.gigTitle}
                  </h3>
                  <p className="mt-1 text-xs text-gray-500">
                    Seller:{" "}
                    <span className="font-semibold text-gray-800">
                      {activeOrder.sellerName}
                    </span>{" "}
                    ({activeOrder.sellerLevel}) • Buyer:{" "}
                    <span className="font-semibold text-gray-800">
                      {activeOrder.buyerName}
                    </span>
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 px-4 py-2.5 text-right">
                <div className="flex items-center justify-end gap-1 text-[11px] font-bold text-emerald-800">
                  <Lock className="h-3.5 w-3.5 text-[#1dbf73]" />
                  <span>
                    {activeOrder.status === "COMPLETED" ||
                    activeEscrow?.status === "RELEASED"
                      ? "Escrow Released"
                      : "Held in Escrow"}
                  </span>
                </div>
                <p className="text-xl font-extrabold text-gray-900">
                  ${activeOrder.totalEscrow.toFixed(2)}
                </p>
              </div>
            </div>

            {/* 3-Step Escrow Status Timeline */}
            <div className="mt-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Escrow Lifecycle Timeline
              </h3>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {timelineSteps.map((step) => {
                  const state = getStepState(step.key, activeOrder.status);
                  return (
                    <div
                      key={step.key}
                      className={`rounded-xl border p-3.5 ${
                        state === "DONE"
                          ? "border-emerald-300 bg-emerald-50/70"
                          : state === "ACTIVE"
                          ? "border-[#1dbf73] bg-white ring-2 ring-[#1dbf73]/20"
                          : "border-gray-200 bg-gray-50 opacity-65"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-gray-900">
                          {step.label}
                        </span>
                        <CheckCircle2
                          className={`h-4 w-4 ${
                            state === "DONE" || state === "ACTIVE"
                              ? "text-[#1dbf73]"
                              : "text-gray-300"
                          }`}
                        />
                      </div>
                      <p className="mt-1 text-[11px] text-gray-600">
                        {step.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Delivery Countdown & Revisions Info */}
            <div className="mt-6 grid grid-cols-1 gap-4 rounded-xl bg-gray-50 p-4 text-xs sm:grid-cols-3">
              <div className="flex items-center gap-2.5">
                <Clock className="h-4 w-4 text-[#1dbf73]" />
                <div>
                  <span className="text-gray-500">Target Delivery Date</span>
                  <p className="font-bold text-gray-900">
                    {new Date(activeOrder.dueDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <RefreshCw className="h-4 w-4 text-[#1dbf73]" />
                <div>
                  <span className="text-gray-500">Revisions Used</span>
                  <p className="font-bold text-gray-900">
                    {activeOrder.revisionsUsed} / {activeOrder.revisionsAllowed}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <AlertCircle className="h-4 w-4 text-[#1dbf73]" />
                <div>
                  <span className="text-gray-500">Current Saga State</span>
                  <p className="font-mono font-bold text-gray-900">
                    {activeOrder.status}
                  </p>
                </div>
              </div>
            </div>

            {/* Buyer Requirements */}
            <div className="mt-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Submitted Project Requirements
              </h4>
              <p className="mt-2 rounded-xl border border-gray-200 bg-gray-50/50 p-3.5 text-xs leading-relaxed text-gray-700">
                {activeOrder.requirements}
              </p>
            </div>

            {/* Delivery Package Box */}
            {activeOrder.deliveryNote && (
              <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50/40 p-4">
                <h4 className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#0a4226]">
                  <UploadCloud className="h-4 w-4 text-[#1dbf73]" />
                  <span>Latest Delivery from {activeOrder.sellerName}</span>
                </h4>
                <p className="mt-2 text-xs leading-relaxed text-gray-700">
                  {activeOrder.deliveryNote}
                </p>
                {activeOrder.deliveryAttachments &&
                  activeOrder.deliveryAttachments.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {activeOrder.deliveryAttachments.map((file) => (
                        <span
                          key={file}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-800 shadow-sm"
                        >
                          <FileText className="h-3.5 w-3.5 text-[#1dbf73]" />
                          {file}
                        </span>
                      ))}
                    </div>
                  )}
              </div>
            )}

            {/* Interactive Controls */}
            <div className="mt-6 border-t border-gray-200 pt-6">
              {roleView === "BUYER" ? (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    Buyer Escrow Controls
                  </h4>
                  {activeOrder.status === "COMPLETED" ? (
                    <div className="rounded-xl bg-emerald-50 p-4 text-xs font-bold text-emerald-900">
                      This order is COMPLETED and the $
                      {activeOrder.totalEscrow.toFixed(2)} escrow has been
                      released to the seller.
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        disabled={busyAction}
                        onClick={handleApproveAndReleaseEscrow}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#1dbf73] px-5 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-[#19a463] disabled:opacity-50"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        <span>
                          {busyAction
                            ? "Releasing Escrow..."
                            : `Approve Delivery & Release Escrow ($${activeOrder.totalEscrow.toFixed(
                                2
                              )})`}
                        </span>
                      </button>

                      <button
                        type="button"
                        disabled={busyAction}
                        onClick={handleRequestRevision}
                        className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-3 text-xs font-bold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                      >
                        <RefreshCw className="h-4 w-4 text-amber-600" />
                        <span>Request Revision</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <form onSubmit={handleSubmitDelivery} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                      Seller Delivery Submission (`fiverr-order-service`)
                    </h4>
                    <button
                      type="button"
                      onClick={handleSelectNativeFiles}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-bold text-gray-700 transition hover:border-[#1dbf73] hover:text-[#1dbf73]"
                    >
                      <FolderOpen className="h-3.5 w-3.5 text-[#1dbf73]" />
                      <span>Attach Local Files (Electron Dialog)</span>
                    </button>
                  </div>

                  {attachedFiles.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {attachedFiles.map((f) => (
                        <span
                          key={f}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-900"
                        >
                          <FileText className="h-3.5 w-3.5 text-[#1dbf73]" />
                          {f}
                        </span>
                      ))}
                    </div>
                  )}

                  <textarea
                    rows={3}
                    value={deliveryInput}
                    onChange={(e) => setDeliveryInput(e.target.value)}
                    placeholder="Write your release notes, Git commit SHA, or deployment verification summary..."
                    className="w-full rounded-xl border border-gray-300 p-3 text-xs focus:border-[#1dbf73] focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={busyAction}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#0a4226] px-5 py-3 text-xs font-bold text-white transition hover:bg-emerald-900 disabled:opacity-50"
                  >
                    <UploadCloud className="h-4 w-4 text-[#1dbf73]" />
                    <span>
                      {busyAction
                        ? "Uploading Delivery..."
                        : "Submit Delivery & Notify Buyer"}
                    </span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

