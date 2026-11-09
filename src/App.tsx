import React, { useCallback, useEffect, useState } from "react";
import { DesktopHeader, type DesktopViewTab } from "@/components/DesktopHeader";
import { CommandPalette } from "@/components/CommandPalette";
import { ExploreView } from "@/views/ExploreView";
import { OrdersEscrowView } from "@/views/OrdersEscrowView";
import { InboxView } from "@/views/InboxView";
import { SellerStudioView } from "@/views/SellerStudioView";
import { ClusterTelemetryView } from "@/views/ClusterTelemetryView";
import type { Gig } from "@/lib/api";
import { desktopClient, type ServiceProbeResult } from "@/lib/desktop";
import { Cpu, ExternalLink, ShieldCheck } from "lucide-react";

export function App() {
  const [activeTab, setActiveTab] = useState<DesktopViewTab>("explore");
  const [selectedGig, setSelectedGig] = useState<Gig | null>(null);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState<boolean>(false);
  const [clusterServices, setClusterServices] = useState<ServiceProbeResult[]>(
    []
  );
  const [probingCluster, setProbingCluster] = useState<boolean>(false);

  const refreshClusterHealth = useCallback(async () => {
    setProbingCluster(true);
    try {
      const results = await desktopClient.probeClusterHealth();
      setClusterServices(results);
    } finally {
      setProbingCluster(false);
    }
  }, []);

  useEffect(() => {
    refreshClusterHealth();
    const interval = setInterval(refreshClusterHealth, 15000);
    return () => clearInterval(interval);
  }, [refreshClusterHealth]);

  // Listen for native Electron application menu shortcuts
  useEffect(() => {
    const unsubscribe = desktopClient.onNavigateShortcut((route: string) => {
      if (route === "command-palette") {
        setCommandPaletteOpen((prev) => !prev);
        return;
      }
      if (
        route === "explore" ||
        route === "orders" ||
        route === "inbox" ||
        route === "seller" ||
        route === "cluster"
      ) {
        if (route === "explore") setSelectedGig(null);
        setActiveTab(route);
      }
    });
    return unsubscribe;
  }, []);

  // Keyboard shortcuts in renderer (Cmd/Ctrl+K, Escape, Cmd+1..5)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      } else if (e.key === "Escape" && commandPaletteOpen) {
        setCommandPaletteOpen(false);
      } else if (e.metaKey || e.ctrlKey) {
        if (e.key === "1") {
          setSelectedGig(null);
          setActiveTab("explore");
        } else if (e.key === "2") {
          setActiveTab("orders");
        } else if (e.key === "3") {
          setActiveTab("inbox");
        } else if (e.key === "4") {
          setActiveTab("seller");
        } else if (e.key === "5") {
          setActiveTab("cluster");
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [commandPaletteOpen]);

  const handleSelectTab = (tab: DesktopViewTab) => {
    if (tab === "explore") {
      setSelectedGig(null);
    }
    setActiveTab(tab);
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 text-gray-900">
      <DesktopHeader
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        onOpenCommandPalette={() => setCommandPaletteOpen(true)}
        clusterServices={clusterServices}
      />

      <main className="flex-1">
        {activeTab === "explore" && (
          <ExploreView
            selectedGig={selectedGig}
            onSelectGig={setSelectedGig}
            onNavigateTab={handleSelectTab}
          />
        )}
        {activeTab === "orders" && <OrdersEscrowView />}
        {activeTab === "inbox" && <InboxView />}
        {activeTab === "seller" && (
          <SellerStudioView
            onNavigateTab={handleSelectTab}
            onSelectGig={(gig) => {
              setSelectedGig(gig);
              setActiveTab("explore");
            }}
          />
        )}
        {activeTab === "cluster" && (
          <ClusterTelemetryView
            clusterServices={clusterServices}
            probing={probingCluster}
            onRefreshProbe={refreshClusterHealth}
          />
        )}
      </main>

      {/* Desktop Status Footer */}
      <footer className="border-t border-gray-200 bg-white px-4 py-3 text-xs text-gray-500">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="font-extrabold text-gray-900">
              FIVERREX<span className="text-[#1dbf73]">.</span> Desktop
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
              <ShieldCheck className="h-3.5 w-3.5 text-[#1dbf73]" />
              DDD Hexagonal Architecture (`domain/repository/*`)
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setActiveTab("cluster")}
              className="inline-flex items-center gap-1 font-semibold text-gray-600 hover:text-[#1dbf73]"
            >
              <Cpu className="h-3.5 w-3.5 text-[#1dbf73]" />
              <span>Cluster Telemetry</span>
            </button>
            <button
              type="button"
              onClick={() =>
                desktopClient.openExternal("https://github.com/fiverr-club")
              }
              className="inline-flex items-center gap-1 font-semibold text-gray-600 hover:text-[#1dbf73]"
            >
              <span>@fiverr-club</span>
              <ExternalLink className="h-3 w-3" />
            </button>
          </div>
        </div>
      </footer>

      <CommandPalette
        open={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onSelectTab={handleSelectTab}
        onSelectGig={(gig) => {
          setSelectedGig(gig);
          setActiveTab("explore");
        }}
        onRefreshCluster={refreshClusterHealth}
      />
    </div>
  );
}

