import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Globe,
  Heart,
  Layers,
  Lock,
  MessageSquare,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  X,
  Zap,
} from "lucide-react";
import {
  CATEGORIES,
  fiverrApi,
  SEED_GIGS,
  type GatewayStatusInfo,
  type Gig,
  type PackageTierName,
  type ReviewItem,
  type SellerLevel,
} from "@/lib/api";
import { desktopClient } from "@/lib/desktop";
import type { DesktopViewTab } from "@/components/DesktopHeader";

interface ExploreViewProps {
  selectedGig: Gig | null;
  onSelectGig: (gig: Gig | null) => void;
  onNavigateTab: (tab: DesktopViewTab) => void;
}

export function ExploreView({
  selectedGig,
  onSelectGig,
  onNavigateTab,
}: ExploreViewProps) {
  const [gigs, setGigs] = useState<Gig[]>(SEED_GIGS);
  const [gatewayStatus, setGatewayStatus] = useState<GatewayStatusInfo | null>(
    null
  );
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<string>("All Categories");
  const [selectedLevel, setSelectedLevel] = useState<string>("ALL");
  const [maxDeliveryDays, setMaxDeliveryDays] = useState<number>(30);
  const [maxBudget, setMaxBudget] = useState<number>(1500);

  // Selected Gig Detail State
  const [selectedTier, setSelectedTier] = useState<PackageTierName>("Standard");
  const [selectedImageIdx, setSelectedImageIdx] = useState<number>(0);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [checkoutOpen, setCheckoutOpen] = useState<boolean>(false);
  const [requirements, setRequirements] = useState<string>("");
  const [submittingOrder, setSubmittingOrder] = useState<boolean>(false);
  const [orderSuccessNumber, setOrderSuccessNumber] = useState<string | null>(
    null
  );

  // 3-Criteria Review State
  const [commRating, setCommRating] = useState<number>(5);
  const [serviceRating, setServiceRating] = useState<number>(5);
  const [recommendRating, setRecommendRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>("");
  const [submittingReview, setSubmittingReview] = useState<boolean>(false);
  const [reviewToast, setReviewToast] = useState<string | null>(null);

  useEffect(() => {
    async function loadMarketplace() {
      const [liveGigs, liveGateway, savedFavs] = await Promise.all([
        fiverrApi.getGigs(),
        fiverrApi.getGatewayStatus(),
        desktopClient.storeGet<string[]>("favoriteGigIds", []),
      ]);
      if (liveGigs && liveGigs.length > 0) {
        setGigs(liveGigs);
      }
      if (liveGateway) {
        setGatewayStatus(liveGateway);
      }
      if (Array.isArray(savedFavs)) {
        setFavoriteIds(savedFavs);
      }
    }
    loadMarketplace();
  }, []);

  useEffect(() => {
    if (!selectedGig) return;
    setSelectedImageIdx(0);
    setReviews(selectedGig.reviews || []);
    setReviewToast(null);
    fiverrApi.getGigReviews(selectedGig.id).then((liveRevs) => {
      if (liveRevs && liveRevs.length > 0) {
        setReviews(liveRevs);
      }
    });
  }, [selectedGig]);

  async function toggleFavorite(gigId: string, e: React.MouseEvent) {
    e.stopPropagation();
    const exists = favoriteIds.includes(gigId);
    const next = exists
      ? favoriteIds.filter((id) => id !== gigId)
      : [...favoriteIds, gigId];
    setFavoriteIds(next);
    await desktopClient.storeSet("favoriteGigIds", next);
  }

  async function handleRemoteSearch() {
    if (!searchQuery.trim() && selectedCategory === "All Categories") {
      const allGigs = await fiverrApi.getGigs();
      setGigs(allGigs);
      return;
    }
    const results = await fiverrApi.searchGigs(searchQuery, selectedCategory);
    if (results && results.length > 0) {
      setGigs(results);
    }
  }

  const filteredGigs = useMemo(() => {
    return gigs.filter((gig) => {
      if (showFavoritesOnly && !favoriteIds.includes(gig.id)) {
        return false;
      }
      if (
        selectedCategory !== "All Categories" &&
        gig.category !== selectedCategory
      ) {
        return false;
      }
      if (
        selectedLevel !== "ALL" &&
        gig.seller.level !== (selectedLevel as SellerLevel)
      ) {
        return false;
      }
      if (gig.packages.Basic.deliveryDays > maxDeliveryDays) {
        return false;
      }
      if (gig.startingPrice > maxBudget) {
        return false;
      }
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const matchesTitle = gig.title.toLowerCase().includes(q);
        const matchesTags = gig.tags.some((t) => t.toLowerCase().includes(q));
        const matchesCategory = gig.category.toLowerCase().includes(q);
        const matchesSeller = gig.seller.displayName.toLowerCase().includes(q);
        return matchesTitle || matchesTags || matchesCategory || matchesSeller;
      }
      return true;
    });
  }, [
    gigs,
    showFavoritesOnly,
    favoriteIds,
    selectedCategory,
    selectedLevel,
    maxDeliveryDays,
    maxBudget,
    searchQuery,
  ]);

  const popularTags = [
    "Spring Boot",
    "Next.js 15",
    "AI Agent",
    "Kubernetes",
    "Figma",
    "DDD",
  ];
  const routeCount = gatewayStatus?.routes?.length ?? 9;

  // If a Gig is selected, show the full interactive Gig Detail & 3-Tier Configurator View
  if (selectedGig) {
    const activePackage =
      selectedGig.packages[selectedTier] || selectedGig.packages.Standard;
    const serviceFee = Number((activePackage.price * 0.055).toFixed(2));
    const totalEscrow = Number((activePackage.price + serviceFee).toFixed(2));

    async function handleConfirmOrder(e: React.FormEvent) {
      e.preventDefault();
      if (!selectedGig) return;
      setSubmittingOrder(true);
      const created = await fiverrApi.createOrder({
        gigId: selectedGig.id,
        packageTier: selectedTier,
        requirements,
        amount: activePackage.price,
        sellerId: selectedGig.seller.id,
      });

      await Promise.all([
        fiverrApi.holdEscrow({
          orderId: created.id,
          sellerId: selectedGig.seller.id,
          grossAmount: activePackage.price,
        }),
        fiverrApi.sendNotification({
          type: "ORDER_CREATED",
          title: `New ${selectedTier} Order ${created.orderNumber}`,
          message: `Escrow deposit of $${totalEscrow.toFixed(2)} locked for "${selectedGig.title}".`,
          channel: "IN_APP",
        }),
        desktopClient.notify(
          `Escrow Funded • ${created.orderNumber}`,
          `$${totalEscrow.toFixed(2)} locked in fiverr-payment-service for ${selectedGig.seller.displayName}.`
        ),
      ]);

      setSubmittingOrder(false);
      setOrderSuccessNumber(created.orderNumber);
      window.dispatchEvent(new CustomEvent("fiverrex-session-change"));
    }

    async function handleSubmitReview(e: React.FormEvent) {
      e.preventDefault();
      if (!selectedGig || !reviewComment.trim()) return;
      setSubmittingReview(true);
      const createdRev = await fiverrApi.submitReview({
        gigId: selectedGig.id,
        sellerId: selectedGig.seller.id,
        communicationRating: commRating,
        serviceAsDescribedRating: serviceRating,
        buyAgainRecommendRating: recommendRating,
        comment: reviewComment.trim(),
      });
      setReviews((prev) => [createdRev, ...prev]);
      setReviewComment("");
      setSubmittingReview(false);
      setReviewToast(
        "Verified 3-criteria review published via POST /api/v1/reviews!"
      );
      await desktopClient.notify(
        "3-Criteria Review Published",
        `Your verified rating for ${selectedGig.seller.displayName} is live.`
      );
    }

    return (
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Back Button & Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onSelectGig(null)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-300 bg-white px-3.5 py-2 text-xs font-bold text-gray-800 shadow-sm transition hover:border-[#1dbf73] hover:text-[#1dbf73]"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Catalog</span>
            </button>
            <div className="hidden items-center gap-2 text-xs font-medium text-gray-500 sm:flex">
              <span>{selectedGig.category}</span>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="font-semibold text-gray-800">
                {selectedGig.subcategory}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => toggleFavorite(selectedGig.id, e)}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-bold transition ${
              favoriteIds.includes(selectedGig.id)
                ? "border-rose-200 bg-rose-50 text-rose-600"
                : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
            }`}
          >
            <Heart
              className={`h-4 w-4 ${
                favoriteIds.includes(selectedGig.id)
                  ? "fill-rose-500 text-rose-500"
                  : ""
              }`}
            />
            <span>
              {favoriteIds.includes(selectedGig.id)
                ? "Saved in Desktop Store"
                : "Save Gig"}
            </span>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          {/* Left Column */}
          <div className="space-y-8 lg:col-span-7">
            <div>
              <h1 className="text-2xl font-extrabold leading-tight text-gray-900 sm:text-3xl">
                {selectedGig.title}
              </h1>

              <div className="mt-4 flex flex-wrap items-center gap-4 border-b border-gray-200 pb-4">
                <div className="flex items-center gap-2.5">
                  <img
                    src={selectedGig.seller.avatarUrl}
                    alt={selectedGig.seller.displayName}
                    className="h-10 w-10 rounded-full object-cover ring-2 ring-[#1dbf73]/30"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-900">
                        {selectedGig.seller.displayName}
                      </span>
                      <span className="rounded bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800">
                        {selectedGig.seller.level}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      @{selectedGig.seller.username}
                    </p>
                  </div>
                </div>

                <div className="h-5 w-px bg-gray-200" />

                <div className="flex items-center gap-1 text-sm">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="font-bold text-gray-900">
                    {selectedGig.rating.toFixed(1)}
                  </span>
                  <span className="text-gray-500">
                    ({selectedGig.reviewCount + reviews.length} reviews)
                  </span>
                </div>

                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-[#1dbf73]">
                  {selectedGig.ordersInQueue} Orders in Queue
                </span>
              </div>
            </div>

            {/* Gallery */}
            <div className="space-y-3">
              <div className="aspect-[16/10] overflow-hidden rounded-2xl border border-gray-200 bg-gray-900">
                <img
                  src={
                    selectedGig.galleryUrls[selectedImageIdx] ||
                    selectedGig.thumbnailUrl
                  }
                  alt={selectedGig.title}
                  className="h-full w-full object-cover"
                />
              </div>
              {selectedGig.galleryUrls.length > 1 && (
                <div className="flex gap-3">
                  {selectedGig.galleryUrls.map((url, idx) => (
                    <button
                      key={url}
                      type="button"
                      onClick={() => setSelectedImageIdx(idx)}
                      className={`overflow-hidden rounded-lg border-2 transition ${
                        selectedImageIdx === idx
                          ? "border-[#1dbf73] ring-2 ring-[#1dbf73]/30"
                          : "border-transparent opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={url}
                        alt="Gallery thumbnail"
                        className="h-16 w-28 object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* About Gig */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900">
                About This Gig
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                {selectedGig.description}
              </p>

              <h3 className="mt-5 text-xs font-bold uppercase tracking-wider text-gray-500">
                Architectural &amp; Deliverable Highlights
              </h3>
              <ul className="mt-3 space-y-2">
                {selectedGig.highlights.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 text-sm text-gray-700"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#1dbf73]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-5 flex flex-wrap gap-2 border-t border-gray-100 pt-4">
                {selectedGig.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* About Seller */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900">
                About The Seller
              </h2>
              <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <img
                    src={selectedGig.seller.avatarUrl}
                    alt={selectedGig.seller.displayName}
                    className="h-16 w-16 rounded-full object-cover ring-2 ring-[#1dbf73]"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-gray-900">
                        {selectedGig.seller.displayName}
                      </h3>
                      <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-xs font-bold text-[#1dbf73]">
                        <Award className="h-3.5 w-3.5" />
                        {selectedGig.seller.level}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-gray-600">
                      {selectedGig.seller.tagline}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigateTab("inbox")}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-bold text-gray-800 transition hover:border-gray-900"
                >
                  <MessageSquare className="h-4 w-4 text-[#1dbf73]" />
                  <span>Contact in Inbox</span>
                </button>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-4 rounded-xl bg-gray-50 p-4 text-xs sm:grid-cols-4">
                <div>
                  <span className="text-gray-400">From</span>
                  <p className="mt-0.5 font-bold text-gray-900">
                    {selectedGig.seller.country}
                  </p>
                </div>
                <div>
                  <span className="text-gray-400">Member since</span>
                  <p className="mt-0.5 font-bold text-gray-900">
                    {selectedGig.seller.memberSince}
                  </p>
                </div>
                <div>
                  <span className="text-gray-400">Avg. response time</span>
                  <p className="mt-0.5 font-bold text-gray-900">
                    {selectedGig.seller.avgResponseTime}
                  </p>
                </div>
                <div>
                  <span className="text-gray-400">Last delivery</span>
                  <p className="mt-0.5 font-bold text-gray-900">
                    {selectedGig.seller.lastDelivery}
                  </p>
                </div>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-gray-600">
                {selectedGig.seller.bio}
              </p>

              <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                <Globe className="h-3.5 w-3.5 text-[#1dbf73]" />
                <span>Languages: {selectedGig.seller.languages.join(", ")}</span>
              </div>
            </div>

            {/* 3-Criteria Review Breakdown */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Verified Buyer Reviews (
                    {selectedGig.reviewCount + reviews.length})
                  </h2>
                  <p className="text-xs text-gray-500">
                    3-Criteria Rating powered by `fiverr-review-service`
                  </p>
                </div>
                <div className="flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-1.5">
                  <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                  <span className="text-lg font-extrabold text-gray-900">
                    {selectedGig.rating.toFixed(1)}
                  </span>
                  <span className="text-xs font-semibold text-gray-600">
                    / 5.0
                  </span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-3.5">
                  <p className="text-xs font-medium text-gray-500">
                    Seller communication level
                  </p>
                  <div className="mt-1 flex items-center gap-1.5">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="text-base font-bold text-gray-900">
                      {selectedGig.criteriaAverages.communication.toFixed(1)}
                    </span>
                  </div>
                </div>
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-3.5">
                  <p className="text-xs font-medium text-gray-500">
                    Service as described
                  </p>
                  <div className="mt-1 flex items-center gap-1.5">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="text-base font-bold text-gray-900">
                      {selectedGig.criteriaAverages.serviceAsDescribed.toFixed(1)}
                    </span>
                  </div>
                </div>
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-3.5">
                  <p className="text-xs font-medium text-gray-500">
                    Buy again or recommend
                  </p>
                  <div className="mt-1 flex items-center gap-1.5">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="text-base font-bold text-gray-900">
                      {selectedGig.criteriaAverages.recommend.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>

              <form
                onSubmit={handleSubmitReview}
                className="mt-6 space-y-3 rounded-xl border border-emerald-200 bg-emerald-50/40 p-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#0a4226]">
                    Write a Verified 3-Criteria Review (`POST /api/v1/reviews`)
                  </h3>
                  {reviewToast && (
                    <span className="text-[11px] font-bold text-[#1dbf73]">
                      {reviewToast}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700">
                      Communication (1-5)
                    </label>
                    <select
                      value={commRating}
                      onChange={(e) => setCommRating(Number(e.target.value))}
                      className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-bold"
                    >
                      {[5, 4, 3, 2, 1].map((r) => (
                        <option key={r} value={r}>
                          {r} Stars
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700">
                      Service as Described (1-5)
                    </label>
                    <select
                      value={serviceRating}
                      onChange={(e) => setServiceRating(Number(e.target.value))}
                      className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-bold"
                    >
                      {[5, 4, 3, 2, 1].map((r) => (
                        <option key={r} value={r}>
                          {r} Stars
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700">
                      Recommend / Buy Again (1-5)
                    </label>
                    <select
                      value={recommendRating}
                      onChange={(e) =>
                        setRecommendRating(Number(e.target.value))
                      }
                      className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-bold"
                    >
                      {[5, 4, 3, 2, 1].map((r) => (
                        <option key={r} value={r}>
                          {r} Stars
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    type="text"
                    required
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Share your experience with this seller's architecture & delivery..."
                    className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs focus:border-[#1dbf73] focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-[#1dbf73] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#19a463] disabled:opacity-50"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>
                      {submittingReview ? "Posting..." : "Post Review"}
                    </span>
                  </button>
                </div>
              </form>

              <div className="mt-6 space-y-5">
                {reviews.map((rev) => (
                  <div key={rev.id} className="border-t border-gray-100 pt-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={rev.buyerAvatar}
                          alt={rev.buyerName}
                          className="h-9 w-9 rounded-full object-cover"
                        />
                        <div>
                          <p className="text-xs font-bold text-gray-900">
                            {rev.buyerName}
                          </p>
                          <p className="text-[11px] text-gray-500">
                            {rev.buyerCountry} • {rev.packageOrdered} Package (
                            {rev.priceRange})
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs font-bold text-gray-900">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        <span>{rev.ratingOverall.toFixed(1)}</span>
                        <span className="ml-2 font-normal text-gray-400">
                          {rev.createdAt}
                        </span>
                      </div>
                    </div>
                    <p className="mt-2.5 text-sm text-gray-700">{rev.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Sticky 3-Tier Package Selector */}
          <div className="lg:col-span-5">
            <div className="sticky top-28 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg">
              <div className="grid grid-cols-3 border-b border-gray-200 bg-gray-50">
                {(["Basic", "Standard", "Premium"] as PackageTierName[]).map(
                  (tier) => {
                    const active = selectedTier === tier;
                    return (
                      <button
                        key={tier}
                        type="button"
                        onClick={() => setSelectedTier(tier)}
                        className={`border-b-2 py-3.5 text-xs font-extrabold uppercase tracking-wider transition ${
                          active
                            ? "border-[#1dbf73] bg-white text-[#1dbf73]"
                            : "border-transparent text-gray-500 hover:text-gray-800"
                        }`}
                      >
                        {tier}
                      </button>
                    );
                  }
                )}
              </div>

              <div className="p-6">
                <div className="flex items-baseline justify-between">
                  <h3 className="text-base font-extrabold text-gray-900">
                    {activePackage.title}
                  </h3>
                  <span className="text-2xl font-extrabold text-gray-900">
                    ${activePackage.price}
                  </span>
                </div>

                <p className="mt-2 text-xs leading-relaxed text-gray-600">
                  {activePackage.description}
                </p>

                <div className="mt-4 flex items-center gap-5 text-xs font-bold text-gray-800">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-[#1dbf73]" />
                    <span>{activePackage.deliveryDays}-Day Delivery</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <RefreshCw className="h-4 w-4 text-[#1dbf73]" />
                    <span>{activePackage.revisions} Revisions</span>
                  </div>
                </div>

                <ul className="mt-5 space-y-2.5 border-t border-gray-100 pt-4">
                  {activePackage.features.map((feat) => (
                    <li
                      key={feat}
                      className="flex items-center gap-2 text-xs font-medium text-gray-700"
                    >
                      <Check className="h-4 w-4 shrink-0 text-[#1dbf73]" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={() => {
                    setOrderSuccessNumber(null);
                    setCheckoutOpen(true);
                  }}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1dbf73] py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#19a463]"
                >
                  <span>Continue (${activePackage.price})</span>
                  <ChevronRight className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => onNavigateTab("inbox")}
                  className="mt-3 block w-full rounded-xl border border-gray-300 py-2.5 text-center text-xs font-bold text-gray-700 transition hover:bg-gray-50"
                >
                  Contact Seller or Request Custom Offer
                </button>

                <div className="mt-5 flex items-start gap-2.5 rounded-xl bg-emerald-50/70 p-3 text-[11px] text-emerald-900">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#1dbf73]" />
                  <div>
                    <span className="font-bold">FIVERREX Escrow Guarantee:</span>{" "}
                    Funds are held in `fiverr-payment-service` and only released
                    after you approve the final delivery.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Escrow Checkout Modal */}
        {checkoutOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-gray-200 bg-[#0a4226] px-6 py-4 text-white">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-[#1dbf73]" />
                  <h3 className="text-sm font-bold">Escrow Order Checkout</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setCheckoutOpen(false)}
                  className="rounded-lg p-1 text-white/80 hover:bg-white/10"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {orderSuccessNumber ? (
                <div className="space-y-4 p-6 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-[#1dbf73]">
                    <Check className="h-6 w-6" />
                  </div>
                  <h4 className="text-lg font-extrabold text-gray-900">
                    Escrow Funded &amp; Order Created!
                  </h4>
                  <p className="text-xs text-gray-600">
                    Order{" "}
                    <span className="font-mono font-bold text-gray-900">
                      {orderSuccessNumber}
                    </span>{" "}
                    has been dispatched via `fiverr-order-service` and `$
                    {totalEscrow.toFixed(2)}` is locked in Escrow.
                  </p>
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setCheckoutOpen(false);
                        onNavigateTab("orders");
                      }}
                      className="flex-1 rounded-xl bg-[#1dbf73] py-3 text-xs font-bold text-white hover:bg-[#19a463]"
                    >
                      Go to Order Workspace
                    </button>
                    <button
                      type="button"
                      onClick={() => setCheckoutOpen(false)}
                      className="rounded-xl border border-gray-300 px-4 py-3 text-xs font-bold text-gray-700"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleConfirmOrder} className="space-y-4 p-6">
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#1dbf73]">
                        {selectedTier} Package
                      </span>
                      <span className="font-bold text-gray-900">
                        {activePackage.deliveryDays} Days
                      </span>
                    </div>
                    <p className="mt-1 text-sm font-bold text-gray-900">
                      {activePackage.title}
                    </p>
                    <div className="mt-3 space-y-1 border-t border-gray-200 pt-2 text-xs">
                      <div className="flex justify-between text-gray-600">
                        <span>Subtotal</span>
                        <span>${activePackage.price.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Escrow Protection &amp; Platform Fee (5.5%)</span>
                        <span>${serviceFee.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between pt-1 text-sm font-extrabold text-gray-900">
                        <span>Total Escrow Deposit</span>
                        <span>${totalEscrow.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700">
                      Project Requirements for {selectedGig.seller.displayName}
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={requirements}
                      onChange={(e) => setRequirements(e.target.value)}
                      placeholder="Describe your repository structure, tech stack preferences, and target deadlines..."
                      className="mt-1.5 w-full rounded-xl border border-gray-300 p-3 text-xs focus:border-[#1dbf73] focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingOrder}
                    className="w-full rounded-xl bg-[#1dbf73] py-3.5 text-xs font-bold text-white transition hover:bg-[#19a463] disabled:opacity-50"
                  >
                    {submittingOrder
                      ? "Locking Escrow in Payment Service..."
                      : `Fund Escrow & Place Order ($${totalEscrow.toFixed(2)})`}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Default Marketplace Grid View
  return (
    <div>
      {/* Dark Emerald Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0a4226] via-[#0d3b24] to-[#072617] text-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
            <div className="space-y-5 lg:col-span-7">
              <div className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-emerald-400/30 bg-emerald-950/60 px-3.5 py-1.5 text-xs font-semibold text-emerald-300">
                <Sparkles className="h-3.5 w-3.5 shrink-0 text-[#1dbf73]" />
                <span>
                  FIVERREX Electron Desktop • Powered by {routeCount} DDD
                  Microservice Routes
                </span>
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
                Scale your vision with{" "}
                <span className="italic text-[#1dbf73]">world-class</span>{" "}
                freelance talent.
              </h1>

              <p className="max-w-2xl text-sm text-emerald-100/85 sm:text-base">
                Hire verified architects, AI engineers, and product designers
                with 3-tier transparent packages and milestone-backed Payment
                Escrow protection.
              </p>

              {/* Hero Search Bar */}
              <div className="flex max-w-2xl flex-col gap-2 rounded-xl bg-white p-2 shadow-xl sm:flex-row">
                <div className="flex flex-1 items-center gap-3 px-3 py-2">
                  <Search className="h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder='Try "Spring Boot DDD", "Next.js 15", "Kubernetes Helm", or "AI Agent"...'
                    className="w-full bg-transparent text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleRemoteSearch}
                  className="inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-[#1dbf73] px-6 py-2.5 text-sm font-bold text-white transition hover:bg-[#19a463]"
                >
                  <span>Search Gigs</span>
                  <ArrowRight className="h-4 w-4 shrink-0" />
                </button>
              </div>

              {/* Popular Tags */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-semibold text-emerald-200/80">
                  Popular:
                </span>
                {popularTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSearchQuery(tag)}
                    className="rounded-full border border-white/25 bg-white/10 px-3 py-1 font-medium text-white transition hover:border-[#1dbf73] hover:bg-[#1dbf73]"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Right Architecture Card */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-emerald-400/20 bg-white/10 p-5 backdrop-blur-md">
                <div className="mb-4 flex items-center justify-between border-b border-white/15 pb-3">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#1dbf73]">
                      Live Desktop &amp; Cluster Status
                    </span>
                    <h3 className="text-base font-bold text-white">
                      Escrow &amp; Event Mesh Ready
                    </h3>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300">
                    <span className="h-2 w-2 rounded-full bg-[#1dbf73]" />
                    Healthy ({routeCount} Routes)
                  </span>
                </div>
                <div className="space-y-2.5 text-xs text-emerald-50">
                  <div className="flex items-center justify-between rounded-lg bg-black/25 px-3.5 py-2">
                    <span>Spring Cloud Gateway (:8080)</span>
                    <span className="font-mono font-bold text-[#1dbf73]">
                      JWT + RateLimiter
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-black/25 px-3.5 py-2">
                    <span>Order &amp; Payment Escrow Saga</span>
                    <span className="font-mono font-bold text-[#1dbf73]">
                      Kafka KRaft Event Bus
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-black/25 px-3.5 py-2">
                    <span>Domain Repository Isolation</span>
                    <span className="font-mono font-bold text-[#1dbf73]">
                      domain/repository/*
                    </span>
                  </div>
                </div>
                <div className="mt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => onNavigateTab("orders")}
                    className="flex-1 rounded-lg bg-[#1dbf73] py-2.5 text-center text-xs font-bold text-white transition hover:bg-[#19a463]"
                  >
                    View Escrow Orders
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigateTab("cluster")}
                    className="flex-1 rounded-lg border border-white/30 bg-white/5 py-2.5 text-center text-xs font-bold text-white transition hover:bg-white/15"
                  >
                    Inspect DDD Cluster
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Ribbon */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto px-4 py-3 sm:px-6 lg:px-8">
          {CATEGORIES.map((category) => {
            const active = selectedCategory === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-bold transition ${
                  active
                    ? "bg-[#1dbf73] text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900"
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter Bar & Catalog Grid */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-500">
              <SlidersHorizontal className="h-4 w-4 text-[#1dbf73]" />
              <span>Filters:</span>
            </div>

            <select
              aria-label="Filter by Seller Level"
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 focus:border-[#1dbf73] focus:outline-none"
            >
              <option value="ALL">All Seller Levels</option>
              <option value="Top Rated Seller">Top Rated Seller</option>
              <option value="Pro Verified">Pro Verified</option>
              <option value="Level 2 Seller">Level 2 Seller</option>
            </select>

            <select
              aria-label="Filter by Delivery Time"
              value={maxDeliveryDays}
              onChange={(e) => setMaxDeliveryDays(Number(e.target.value))}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 focus:border-[#1dbf73] focus:outline-none"
            >
              <option value={30}>Any Delivery Time</option>
              <option value={2}>Express 48 Hours (≤ 2 days)</option>
              <option value={3}>Up to 3 Days</option>
              <option value={7}>Up to 7 Days</option>
            </select>

            <select
              aria-label="Filter by Budget"
              value={maxBudget}
              onChange={(e) => setMaxBudget(Number(e.target.value))}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 focus:border-[#1dbf73] focus:outline-none"
            >
              <option value={1500}>Any Starting Budget</option>
              <option value={150}>Under $150</option>
              <option value={200}>Under $200</option>
              <option value={300}>Under $300</option>
            </select>

            <button
              type="button"
              onClick={() => setShowFavoritesOnly((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-bold transition ${
                showFavoritesOnly
                  ? "border-rose-300 bg-rose-50 text-rose-600"
                  : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Heart
                className={`h-3.5 w-3.5 ${
                  showFavoritesOnly ? "fill-rose-500 text-rose-500" : ""
                }`}
              />
              <span>Saved ({favoriteIds.length})</span>
            </button>

            {(selectedCategory !== "All Categories" ||
              selectedLevel !== "ALL" ||
              maxDeliveryDays !== 30 ||
              maxBudget !== 1500 ||
              showFavoritesOnly ||
              searchQuery !== "") && (
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory("All Categories");
                  setSelectedLevel("ALL");
                  setMaxDeliveryDays(30);
                  setMaxBudget(1500);
                  setShowFavoritesOnly(false);
                  setSearchQuery("");
                }}
                className="text-xs font-bold text-rose-600 hover:underline"
              >
                Reset Filters
              </button>
            )}
          </div>

          <p className="text-xs font-semibold text-gray-500">
            Showing{" "}
            <span className="font-bold text-gray-900">
              {filteredGigs.length}
            </span>{" "}
            verified services available now
          </p>
        </div>

        {/* Gigs Grid */}
        {filteredGigs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
            <p className="text-base font-bold text-gray-800">
              No gigs matched your current filter combination.
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Try clearing your filters or searching for another skill.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredGigs.map((gig) => {
              const isTopRated = gig.seller.level === "Top Rated Seller";
              const isPro = gig.seller.level === "Pro Verified";
              const isFav = favoriteIds.includes(gig.id);

              return (
                <div
                  key={gig.id}
                  onClick={() => onSelectGig(gig)}
                  className="group flex cursor-pointer flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-[#1dbf73]/50 hover:shadow-md"
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100">
                    <img
                      src={gig.thumbnailUrl}
                      alt={gig.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute left-3 top-3 flex gap-1.5">
                      {isPro && (
                        <span className="inline-flex items-center gap-1 rounded bg-indigo-950/90 px-2.5 py-1 text-[11px] font-bold text-white shadow">
                          <Award className="h-3 w-3 text-[#1dbf73]" />
                          Pro Verified
                        </span>
                      )}
                      <span className="rounded bg-black/65 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm">
                        {gig.category}
                      </span>
                    </div>
                    <button
                      type="button"
                      aria-label="Save to favorites"
                      onClick={(e) => toggleFavorite(gig.id, e)}
                      className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-gray-600 shadow transition hover:text-rose-500"
                    >
                      <Heart
                        className={`h-4 w-4 ${
                          isFav ? "fill-rose-500 text-rose-500" : ""
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex flex-1 flex-col justify-between p-4">
                    <div>
                      <div className="mb-2.5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img
                            src={gig.seller.avatarUrl}
                            alt={gig.seller.displayName}
                            className="h-7 w-7 rounded-full object-cover ring-1 ring-gray-200"
                          />
                          <div>
                            <p className="text-xs font-bold text-gray-900">
                              {gig.seller.displayName}
                            </p>
                            <p className="text-[11px] text-gray-500">
                              @{gig.seller.username}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`rounded px-2 py-0.5 text-[11px] font-bold ${
                            isTopRated
                              ? "bg-amber-100 text-amber-800"
                              : isPro
                              ? "bg-indigo-100 text-indigo-800"
                              : "bg-emerald-50 text-emerald-700"
                          }`}
                        >
                          {gig.seller.level}
                        </span>
                      </div>

                      <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-gray-800 transition-colors group-hover:text-[#1dbf73]">
                        {gig.title}
                      </h3>

                      <div className="mt-3 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                          <span className="font-bold text-gray-900">
                            {gig.rating.toFixed(1)}
                          </span>
                          <span className="text-gray-500">
                            ({gig.reviewCount})
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-500">
                          <Clock className="h-3.5 w-3.5 text-[#1dbf73]" />
                          <span>{gig.packages.Basic.deliveryDays}d delivery</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
                      <div className="flex flex-wrap gap-1">
                        {gig.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="rounded bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="text-right">
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">
                          From
                        </span>
                        <span className="text-base font-extrabold text-gray-900">
                          ${gig.startingPrice}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* How FIVERREX Escrow Works */}
      <section className="border-t border-gray-200 bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#1dbf73]">
              Trust &amp; Architecture
            </span>
            <h2 className="mt-2 text-2xl font-extrabold text-gray-900">
              How FIVERREX Escrow Protection Works
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
            <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-5">
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-[#1dbf73]">
                <Layers className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-gray-900">
                1. Choose a 3-Tier Package
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-gray-600">
                Compare Basic, Standard, and Premium deliverables, delivery
                days, and revision allowances upfront.
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-5">
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-[#1dbf73]">
                <Lock className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-gray-900">
                2. Funds Held in Escrow
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-gray-600">
                `fiverr-payment-service` locks your deposit in an isolated
                PostgreSQL escrow ledger until delivery completion.
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-5">
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-[#1dbf73]">
                <Zap className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-gray-900">
                3. Collaborate &amp; Review
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-gray-600">
                Attach local build artifacts via the Electron File Dialog and
                exchange feedback in real time.
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-5">
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-[#1dbf73]">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-gray-900">
                4. Approve &amp; Release
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-gray-600">
                Approve delivery to trigger the Kafka `OrderCompletedEvent` and
                export your verified Escrow Ledger Receipt.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

