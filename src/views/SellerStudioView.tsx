import React, { useEffect, useState } from "react";
import {
  ArrowUpRight,
  Award,
  CheckCircle2,
  Clock,
  Lock,
  Plus,
  Star,
  TrendingUp,
  Wallet,
  X,
} from "lucide-react";
import {
  CATEGORIES,
  fiverrApi,
  getAuthSession,
  SEED_GIGS,
  SEED_ORDERS,
  SEED_SELLER_STATS,
  type Gig,
  type Order,
} from "@/lib/api";
import { desktopClient } from "@/lib/desktop";
import type { DesktopViewTab } from "@/components/DesktopHeader";

interface SellerStudioViewProps {
  onNavigateTab: (tab: DesktopViewTab) => void;
  onSelectGig: (gig: Gig) => void;
}

export function SellerStudioView({
  onNavigateTab,
  onSelectGig,
}: SellerStudioViewProps) {
  const [stats, setStats] = useState(SEED_SELLER_STATS);
  const [orders, setOrders] = useState<Order[]>(SEED_ORDERS);
  const [myGigs, setMyGigs] = useState<Gig[]>(SEED_GIGS.slice(0, 3));
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [withdrawBanner, setWithdrawBanner] = useState<string | null>(null);
  const [withdrawing, setWithdrawing] = useState(false);
  const [publishingGig, setPublishingGig] = useState(false);

  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<string>("Programming & Tech");
  const [basicPrice, setBasicPrice] = useState<number>(195);
  const [standardPrice, setStandardPrice] = useState<number>(490);
  const [premiumPrice, setPremiumPrice] = useState<number>(990);

  useEffect(() => {
    async function loadSellerStudio() {
      const [liveStats, liveOrders, liveGigs, liveSellers] = await Promise.all([
        fiverrApi.getSellerDashboard(),
        fiverrApi.getOrders(),
        fiverrApi.getGigs(),
        fiverrApi.getSellers(),
      ]);

      if (liveStats) {
        if (liveSellers && liveSellers.length > 0) {
          liveStats.metrics.overallRating = Number(
            liveSellers[0].ratingAverage || liveStats.metrics.overallRating
          );
        }
        setStats(liveStats);
      }
      if (liveOrders && liveOrders.length > 0) {
        setOrders(liveOrders);
      }
      if (liveGigs && liveGigs.length > 0) {
        setMyGigs(liveGigs.slice(0, 6));
      }
    }
    loadSellerStudio();
  }, []);

  async function handleWithdrawFunds() {
    if (stats.availableForWithdrawal <= 0 || withdrawing) return;
    setWithdrawing(true);
    const amount = stats.availableForWithdrawal;
    const session = getAuthSession();
    const updatedWallet = await fiverrApi.withdrawFunds({
      sellerId: session.sellerId,
      amount,
      payoutDestination: "stripe_Express_Acct_FIVERREX",
    });

    setStats((prev) => ({
      ...prev,
      availableForWithdrawal: Number(updatedWallet.availableBalance ?? 0),
    }));
    setWithdrawing(false);
    window.dispatchEvent(new CustomEvent("fiverrex-session-change"));
    await desktopClient.notify(
      "Seller Payout Settled",
      `$${amount.toLocaleString("en-US", {
        minimumFractionDigits: 2,
      })} withdrawn via POST /api/v1/payments/wallets/withdraw.`
    );
    setWithdrawBanner(
      `Withdrawal of $${amount.toLocaleString("en-US", {
        minimumFractionDigits: 2,
      })} processed via POST /api/v1/payments/wallets/withdraw!`
    );
  }

  async function handleCreateGig(e: React.FormEvent) {
    e.preventDefault();
    setPublishingGig(true);
    const createdGig = await fiverrApi.createGig({
      title: newTitle,
      category: newCategory,
      basicPrice,
      standardPrice,
      premiumPrice,
    });
    setMyGigs((prev) => [createdGig, ...prev]);
    setNewTitle("");
    setPublishingGig(false);
    setCreateModalOpen(false);
    await desktopClient.notify(
      "New 3-Tier Gig Published",
      `"${createdGig.title}" is now live in fiverr-gig-service.`
    );
    setWithdrawBanner(
      `Published "${createdGig.title}" to PostgreSQL via POST /api/v1/gigs!`
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Studio Header */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900">
            <Award className="h-3.5 w-3.5" />
            <span>
              {stats.sellerLevel} • Next Evaluation: {stats.nextEvaluationDate}
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-extrabold text-gray-900 sm:text-3xl">
            Seller Studio &amp; Escrow Wallet
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleWithdrawFunds}
            disabled={stats.availableForWithdrawal <= 0 || withdrawing}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-xs font-bold text-gray-800 shadow-sm transition hover:bg-gray-50 disabled:opacity-50"
          >
            <Wallet className="h-4 w-4 text-[#1dbf73]" />
            <span>
              {withdrawing ? "Withdrawing..." : "Withdraw Available Balance"}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#1dbf73] px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#19a463]"
          >
            <Plus className="h-4 w-4" />
            <span>Create New Gig</span>
          </button>
        </div>
      </div>

      {withdrawBanner && (
        <div className="mb-6 flex items-center justify-between rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-950">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-[#1dbf73]" />
            <span>{withdrawBanner}</span>
          </div>
          <button
            type="button"
            onClick={() => setWithdrawBanner(null)}
            className="text-emerald-700 hover:underline"
          >
            Close
          </button>
        </div>
      )}

      {/* Wallet & Earnings Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-[#0a4226] to-[#0d3b24] p-6 text-white shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-emerald-200">
            <span>Available for Withdrawal</span>
            <Wallet className="h-4 w-4 text-[#1dbf73]" />
          </div>
          <p className="mt-3 text-3xl font-extrabold">
            $
            {stats.availableForWithdrawal.toLocaleString("en-US", {
              minimumFractionDigits: 2,
            })}
          </p>
          <p className="mt-2 text-[11px] text-emerald-200/80">
            Cleared from Escrow &amp; ready for instant payout
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-gray-500">
            <span>Escrow Pending Clearance</span>
            <Lock className="h-4 w-4 text-amber-500" />
          </div>
          <p className="mt-3 text-3xl font-extrabold text-gray-900">
            $
            {stats.escrowPendingBalance.toLocaleString("en-US", {
              minimumFractionDigits: 2,
            })}
          </p>
          <p className="mt-2 text-[11px] text-gray-500">
            Locked in `fiverr-payment-service` active orders
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-gray-500">
            <span>Cleared Earnings (Nov)</span>
            <TrendingUp className="h-4 w-4 text-[#1dbf73]" />
          </div>
          <p className="mt-3 text-3xl font-extrabold text-gray-900">
            $
            {stats.clearedThisMonth.toLocaleString("en-US", {
              minimumFractionDigits: 2,
            })}
          </p>
          <p className="mt-2 text-[11px] font-semibold text-[#1dbf73]">
            +24.8% vs previous 30-day window
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-gray-500">
            <span>Active Orders Queue</span>
            <Clock className="h-4 w-4 text-indigo-600" />
          </div>
          <p className="mt-3 text-3xl font-extrabold text-gray-900">
            {stats.activeOrdersCount}{" "}
            <span className="text-base font-bold text-gray-400">
              (${stats.activeOrdersValue.toLocaleString()})
            </span>
          </p>
          <p className="mt-2 text-[11px] text-gray-500">
            100% on-schedule delivery trajectory
          </p>
        </div>
      </div>

      {/* Seller Level Performance Metrics + Active Queue */}
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-5">
          <h2 className="text-base font-extrabold text-gray-900">
            Seller Level Standards (`fiverr-user-service`)
          </h2>
          <p className="mt-1 text-xs text-gray-500">
            Maintain 90%+ across all 4 metrics to retain Top Rated Seller
            status.
          </p>

          <div className="mt-6 space-y-5">
            <div>
              <div className="flex justify-between text-xs font-bold">
                <span className="text-gray-700">Inbox Response Rate</span>
                <span className="text-[#1dbf73]">
                  {stats.metrics.inboxResponseRate}%
                </span>
              </div>
              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-[#1dbf73]"
                  style={{ width: `${stats.metrics.inboxResponseRate}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold">
                <span className="text-gray-700">On-Time Delivery</span>
                <span className="text-[#1dbf73]">
                  {stats.metrics.onTimeDeliveryRate}%
                </span>
              </div>
              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-[#1dbf73]"
                  style={{ width: `${stats.metrics.onTimeDeliveryRate}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold">
                <span className="text-gray-700">Order Completion Rate</span>
                <span className="text-[#1dbf73]">
                  {stats.metrics.orderCompletionRate}%
                </span>
              </div>
              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-[#1dbf73]"
                  style={{ width: `${stats.metrics.orderCompletionRate}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-amber-50 p-3.5 text-xs">
              <span className="font-bold text-gray-800">
                3-Criteria Overall Rating
              </span>
              <span className="inline-flex items-center gap-1 font-extrabold text-gray-900">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                {stats.metrics.overallRating.toFixed(1)} / 5.0
              </span>
            </div>
          </div>
        </div>

        {/* Active Orders Queue Table */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-7">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-gray-900">
              Active Orders Queue
            </h2>
            <button
              type="button"
              onClick={() => onNavigateTab("orders")}
              className="inline-flex items-center gap-1 text-xs font-bold text-[#1dbf73] hover:underline"
            >
              <span>Open Full Workspace</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="mt-4 divide-y divide-gray-100">
            {orders.map((ord) => (
              <div
                key={ord.id}
                className="flex flex-wrap items-center justify-between gap-4 py-3.5 text-xs"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={ord.gigThumbnail}
                    alt={ord.gigTitle}
                    className="h-11 w-16 rounded-lg object-cover"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-gray-900">
                        {ord.orderNumber}
                      </span>
                      <span className="rounded bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-700">
                        {ord.packageTier}
                      </span>
                    </div>
                    <p className="mt-0.5 line-clamp-1 font-semibold text-gray-800">
                      {ord.gigTitle}
                    </p>
                    <p className="text-[11px] text-gray-500">
                      Buyer: {ord.buyerName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="font-extrabold text-gray-900">
                      ${ord.totalEscrow.toFixed(2)}
                    </span>
                    <span className="block text-[10px] font-bold text-[#1dbf73]">
                      {ord.status.replace("_", " ")}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigateTab("orders")}
                    className="rounded-lg border border-gray-300 px-3 py-1.5 font-bold text-gray-700 hover:border-gray-900"
                  >
                    Manage
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* My Published Gigs */}
      <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-gray-900">
              Active Gigs ({myGigs.length})
            </h2>
            <p className="text-xs text-gray-500">
              Managed via `fiverr-gig-service` with 3-Tier Pricing (Basic /
              Standard / Premium)
            </p>
          </div>
          <button
            type="button"
            onClick={() => setCreateModalOpen(true)}
            className="text-xs font-bold text-[#1dbf73] hover:underline"
          >
            + Add Another Gig
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          {myGigs.map((gig) => (
            <div
              key={gig.id}
              className="flex flex-col justify-between rounded-xl border border-gray-200 p-4"
            >
              <div>
                <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-[#1dbf73]">
                  {gig.category}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onSelectGig(gig);
                    onNavigateTab("explore");
                  }}
                  className="mt-2 block text-left text-sm font-bold text-gray-900 hover:text-[#1dbf73]"
                >
                  {gig.title}
                </button>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-xs">
                <span className="text-gray-500">
                  Tiers: ${gig.packages.Basic.price} / $
                  {gig.packages.Standard.price} / ${gig.packages.Premium.price}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onSelectGig(gig);
                    onNavigateTab("explore");
                  }}
                  className="font-bold text-[#1dbf73] hover:underline"
                >
                  Preview →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create New Gig Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 bg-[#0a4226] px-6 py-4 text-white">
              <h3 className="text-sm font-bold">
                Publish New 3-Tier Gig (`fiverr-gig-service`)
              </h3>
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="rounded-lg p-1 text-white/80 hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateGig} className="space-y-4 p-6">
              <div>
                <label className="block text-xs font-bold text-gray-700">
                  Gig Title
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="I will architect a cloud-native Spring Boot 3 microservice..."
                  className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2.5 text-xs focus:border-[#1dbf73] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700">
                  Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-xs font-semibold"
                >
                  {CATEGORIES.filter((c) => c !== "All Categories").map(
                    (cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700">
                    Basic ($)
                  </label>
                  <input
                    type="number"
                    min={5}
                    value={basicPrice}
                    onChange={(e) => setBasicPrice(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700">
                    Standard ($)
                  </label>
                  <input
                    type="number"
                    min={10}
                    value={standardPrice}
                    onChange={(e) => setStandardPrice(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700">
                    Premium ($)
                  </label>
                  <input
                    type="number"
                    min={20}
                    value={premiumPrice}
                    onChange={(e) => setPremiumPrice(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-xs font-bold"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={publishingGig}
                className="w-full rounded-xl bg-[#1dbf73] py-3 text-xs font-bold text-white transition hover:bg-[#19a463] disabled:opacity-50"
              >
                {publishingGig
                  ? "Publishing to PostgreSQL..."
                  : "Publish Gig to Marketplace"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
