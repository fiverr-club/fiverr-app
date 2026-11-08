import React, { useMemo, useState } from "react";
import {
  ArrowRight,
  Briefcase,
  Cpu,
  ExternalLink,
  LayoutDashboard,
  MessageSquare,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { SEED_GIGS, SEED_ORDERS, type Gig } from "@/lib/api";
import type { DesktopViewTab } from "./DesktopHeader";
import { desktopClient } from "@/lib/desktop";

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  onSelectTab: (tab: DesktopViewTab) => void;
  onSelectGig: (gig: Gig) => void;
  onRefreshCluster: () => void;
}

export function CommandPalette({
  open,
  onClose,
  onSelectTab,
  onSelectGig,
  onRefreshCluster,
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();

    const actions = [
      {
        id: "nav-explore",
        category: "Workspace Navigation",
        title: "Go to Explore Marketplace",
        subtitle: "Browse 3-Tier Gigs, filter by Seller Level & Delivery Time (⌘1)",
        icon: Sparkles,
        run: () => {
          onSelectTab("explore");
          onClose();
        },
      },
      {
        id: "nav-orders",
        category: "Workspace Navigation",
        title: "Go to Orders & Escrow Saga Workspace",
        subtitle: `Manage ${SEED_ORDERS.length} active orders, upload deliverables & release escrow (⌘2)`,
        icon: Briefcase,
        run: () => {
          onSelectTab("orders");
          onClose();
        },
      },
      {
        id: "nav-inbox",
        category: "Workspace Navigation",
        title: "Go to Real-Time Buyer/Seller Inbox",
        subtitle: "Chat threads & Custom Milestone Offers (⌘3)",
        icon: MessageSquare,
        run: () => {
          onSelectTab("inbox");
          onClose();
        },
      },
      {
        id: "nav-seller",
        category: "Workspace Navigation",
        title: "Go to Seller Studio & Escrow Wallet",
        subtitle: "Withdraw cleared funds, track metrics & publish new gigs (⌘4)",
        icon: LayoutDashboard,
        run: () => {
          onSelectTab("seller");
          onClose();
        },
      },
      {
        id: "nav-cluster",
        category: "Desktop & DDD Diagnostics",
        title: "Open DDD Microservice Cluster Telemetry",
        subtitle: "Inspect live TCP/HTTP ports (8080-8088, Postgres, Redis, Kafka) (⌘5)",
        icon: Cpu,
        run: () => {
          onRefreshCluster();
          onSelectTab("cluster");
          onClose();
        },
      },
      {
        id: "ext-swagger",
        category: "Developer Tools",
        title: "Open API Gateway Swagger UI (:8080)",
        subtitle: "Launch http://localhost:8080/swagger-ui/index.html in browser",
        icon: ExternalLink,
        run: () => {
          desktopClient.openExternal("http://localhost:8080/swagger-ui/index.html");
          onClose();
        },
      },
    ];

    const gigActions = SEED_GIGS.map((gig) => ({
      id: `gig-${gig.id}`,
      category: "Verified Gigs",
      title: gig.title,
      subtitle: `${gig.category} • @${gig.seller.username} (${gig.seller.level}) • From $${gig.startingPrice}`,
      icon: Sparkles,
      run: () => {
        onSelectGig(gig);
        onSelectTab("explore");
        onClose();
      },
    }));

    const all = [...actions, ...gigActions];
    if (!q) return all;
    return all.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    );
  }, [query, onClose, onRefreshCluster, onSelectGig, onSelectTab]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 pt-20 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
        {/* Search Input Header */}
        <div className="flex items-center gap-3 border-b border-gray-200 px-4 py-3.5">
          <Search className="h-5 w-5 text-[#1dbf73]" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, gig title, microservice, or shortcut..."
            className="flex-1 bg-transparent text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-96 divide-y divide-gray-100 overflow-y-auto p-2">
          {items.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-500">
              No matching commands or gigs found for &ldquo;{query}&rdquo;.
            </div>
          ) : (
            items.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={item.run}
                  className="flex w-full items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 text-left transition hover:bg-emerald-50/70"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100/80 text-[#1dbf73]">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-[#1dbf73]">
                        {item.category}
                      </span>
                      <p className="truncate text-xs font-bold text-gray-900">
                        {item.title}
                      </p>
                      <p className="truncate text-[11px] text-gray-500">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-gray-400" />
                </button>
              );
            })
          )}
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-4 py-2 text-[11px] text-gray-500">
          <span>FIVERREX Desktop Command Palette</span>
          <span>Press ESC to close</span>
        </div>
      </div>
    </div>
  );
}
