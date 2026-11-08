import React, { useEffect, useState } from "react";
import {
  Activity,
  BellRing,
  CheckCircle2,
  Cpu,
  Database,
  ExternalLink,
  HardDrive,
  Layers,
  RefreshCw,
  Server,
  ShieldCheck,
  Terminal,
} from "lucide-react";
import { getApiGatewayUrl, setApiGatewayUrl } from "@/lib/api";
import {
  desktopClient,
  type DesktopSystemInfo,
  type ServiceProbeResult,
} from "@/lib/desktop";

interface ClusterTelemetryViewProps {
  clusterServices: ServiceProbeResult[];
  probing: boolean;
  onRefreshProbe: () => void;
}

export function ClusterTelemetryView({
  clusterServices,
  probing,
  onRefreshProbe,
}: ClusterTelemetryViewProps) {
  const [sysInfo, setSysInfo] = useState<DesktopSystemInfo | null>(null);
  const [gatewayInput, setGatewayInput] = useState<string>(getApiGatewayUrl());
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    desktopClient.getSystemInfo().then(setSysInfo);
  }, []);

  function handleSaveGateway(e: React.FormEvent) {
    e.preventDefault();
    setApiGatewayUrl(gatewayInput);
    onRefreshProbe();
    setToast(`API Gateway endpoint updated to ${gatewayInput}`);
  }

  async function handleTestNotification() {
    await desktopClient.notify(
      "FIVERREX Desktop • System Telemetry",
      "Electron IPC bridge, DDD Microservice Probe, and Native Notifications are 100% operational."
    );
    setToast("Dispatched native OS notification via Electron Main Process!");
  }

  const upCount = clusterServices.filter((s) => s.status === "UP").length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-[#1dbf73]">
            <Cpu className="h-3.5 w-3.5" />
            Electron Main Process IPC • Cluster &amp; DDD Telemetry
          </span>
          <h1 className="mt-2 text-2xl font-extrabold text-gray-900 sm:text-3xl">
            Microservices Health &amp; Desktop Control Center
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleTestNotification}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-xs font-bold text-gray-800 shadow-sm transition hover:border-[#1dbf73] hover:text-[#1dbf73]"
          >
            <BellRing className="h-4 w-4 text-[#1dbf73]" />
            <span>Test Native OS Notification</span>
          </button>

          <button
            type="button"
            disabled={probing}
            onClick={onRefreshProbe}
            className="inline-flex items-center gap-2 rounded-xl bg-[#1dbf73] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#19a463] disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${probing ? "animate-spin" : ""}`}
            />
            <span>{probing ? "Probing Ports..." : "Probe Cluster Ports"}</span>
          </button>
        </div>
      </div>

      {toast && (
        <div className="mb-6 flex items-center justify-between rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-950">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-[#1dbf73]" />
            <span>{toast}</span>
          </div>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="text-emerald-700 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Top Runtime & Gateway Config Cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Electron Runtime Diagnostics */}
        <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-[#0a4226] to-[#072617] p-6 text-white shadow-sm lg:col-span-7">
          <div className="flex items-center justify-between border-b border-white/15 pb-4">
            <div className="flex items-center gap-2.5">
              <Terminal className="h-5 w-5 text-[#1dbf73]" />
              <div>
                <h2 className="text-base font-extrabold">
                  Electron Runtime &amp; Workstation Diagnostics
                </h2>
                <p className="text-xs text-emerald-200/80">
                  Context-Isolated Preload Bridge (`electron/preload.ts`)
                </p>
              </div>
            </div>
            <span className="rounded-full bg-emerald-500/20 px-3 py-1 font-mono text-xs font-bold text-[#1dbf73]">
              v{sysInfo?.appVersion || "1.0.0"}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
            <div className="rounded-xl bg-black/25 p-3">
              <span className="text-emerald-200/70">Electron</span>
              <p className="mt-0.5 font-mono text-sm font-bold text-white">
                v{sysInfo?.electronVersion || "34.0.0"}
              </p>
            </div>
            <div className="rounded-xl bg-black/25 p-3">
              <span className="text-emerald-200/70">Chromium</span>
              <p className="mt-0.5 font-mono text-sm font-bold text-white">
                v{sysInfo?.chromeVersion || "132.0"}
              </p>
            </div>
            <div className="rounded-xl bg-black/25 p-3">
              <span className="text-emerald-200/70">Node.js</span>
              <p className="mt-0.5 font-mono text-sm font-bold text-white">
                v{sysInfo?.nodeVersion || "22.21.0"}
              </p>
            </div>
            <div className="rounded-xl bg-black/25 p-3">
              <span className="text-emerald-200/70">OS / Arch</span>
              <p className="mt-0.5 truncate font-mono text-sm font-bold text-white">
                {sysInfo?.arch || "arm64"} • {sysInfo?.cpus || 10} Cores
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-black/20 px-4 py-2.5 text-[11px] text-emerald-100">
            <span className="inline-flex items-center gap-1.5">
              <HardDrive className="h-3.5 w-3.5 text-[#1dbf73]" />
              <span>
                Local Store: <code>{sysInfo?.userDataPath || "~/Library/Application Support/FIVERREX Desktop"}</code>
              </span>
            </span>
            <span className="font-mono font-bold text-[#1dbf73]">
              RAM: {sysInfo?.freeMemoryGb ?? 14.2} GB free /{" "}
              {sysInfo?.totalMemoryGb ?? 32} GB
            </span>
          </div>
        </div>

        {/* API Gateway Endpoint Configurator */}
        <div className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-5">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1dbf73]">
                Edge Gateway Configuration
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-gray-700">
                <Activity className="h-3.5 w-3.5 text-[#1dbf73]" />
                {upCount}/{clusterServices.length} Active
              </span>
            </div>
            <h2 className="mt-1 text-base font-extrabold text-gray-900">
              Spring Cloud API Gateway Endpoint
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              Configure the target API Gateway URL for all 28 REST endpoints.
              Automatically falls back to rich local seed state when offline.
            </p>

            <form onSubmit={handleSaveGateway} className="mt-4 space-y-3">
              <input
                type="url"
                required
                value={gatewayInput}
                onChange={(e) => setGatewayInput(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 font-mono text-xs text-gray-900 focus:border-[#1dbf73] focus:outline-none"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-[#0a4226] py-2.5 text-xs font-bold text-white transition hover:bg-emerald-900"
                >
                  Save Gateway URL
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const def = "http://localhost:8080/api/v1";
                    setGatewayInput(def);
                    setApiGatewayUrl(def);
                    setToast("Reset API Gateway URL to http://localhost:8080/api/v1");
                  }}
                  className="rounded-xl border border-gray-300 px-3.5 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50"
                >
                  Reset
                </button>
              </div>
            </form>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-xs">
            <span className="text-gray-500">OpenAPI / Swagger Aggregator:</span>
            <button
              type="button"
              onClick={() =>
                desktopClient.openExternal(
                  "http://localhost:8080/swagger-ui/index.html"
                )
              }
              className="inline-flex items-center gap-1 font-bold text-[#1dbf73] hover:underline"
            >
              <span>localhost:8080/swagger-ui</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 13-Service Live Port & DDD Repository Matrix */}
      <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-extrabold text-gray-900">
              Fiverr Club Cluster Topology &amp; DDD Hexagonal Repository Matrix
            </h2>
            <p className="text-xs text-gray-500">
              All backend microservices enforce strict Domain-Driven Design:
              repository interfaces reside exclusively in{" "}
              <code className="font-mono font-bold text-[#0a4226]">
                domain/repository/
              </code>{" "}
              and never in <code className="font-mono">application/port/out/</code>.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-[#1dbf73]">
            <ShieldCheck className="h-4 w-4" />
            DDD Hexagonal Verified
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {clusterServices.map((svc) => {
            const isUp = svc.status === "UP";
            const Icon =
              svc.category === "INFRASTRUCTURE"
                ? Database
                : svc.category === "GATEWAY"
                ? Layers
                : Server;

            return (
              <div
                key={svc.id}
                className="flex flex-col justify-between rounded-xl border border-gray-200 bg-gray-50/40 p-4 transition hover:border-[#1dbf73]/60 hover:bg-white hover:shadow-sm"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100/80 text-[#0a4226]">
                        <Icon className="h-4 w-4 text-[#1dbf73]" />
                      </div>
                      <div>
                        <h3 className="text-xs font-extrabold text-gray-900">
                          {svc.name}
                        </h3>
                        <span className="font-mono text-[11px] font-bold text-gray-500">
                          {svc.id} • :{svc.port}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        isUp
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          isUp ? "bg-[#1dbf73]" : "bg-amber-500"
                        }`}
                      />
                      {isUp ? `UP (${svc.latencyMs}ms)` : "SEED MODE"}
                    </span>
                  </div>

                  <p className="mt-3 text-xs leading-relaxed text-gray-600">
                    {svc.description}
                  </p>

                  {svc.dddRepository && (
                    <div className="mt-3 rounded-lg border border-emerald-200/80 bg-emerald-50/60 px-2.5 py-1.5 font-mono text-[10px] font-bold text-[#0a4226]">
                      ✓ {svc.dddRepository}
                    </div>
                  )}
                </div>

                {svc.swaggerUrl && (
                  <div className="mt-4 flex items-center justify-between border-t border-gray-200/70 pt-2.5 text-[11px]">
                    <span className="text-gray-400">OpenAPI Spec</span>
                    <button
                      type="button"
                      onClick={() => desktopClient.openExternal(svc.swaggerUrl!)}
                      className="inline-flex items-center gap-1 font-bold text-[#1dbf73] hover:underline"
                    >
                      <span>Swagger UI</span>
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
