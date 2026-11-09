import { contextBridge, ipcRenderer } from "electron";
import type {
  DesktopSystemInfo,
  EscrowReceiptPayload,
  ServiceProbeResult,
} from "./services";

export interface ElectronDesktopBridge {
  isElectron: boolean;
  platform: string;
  getSystemInfo: () => Promise<DesktopSystemInfo>;
  probeClusterHealth: (host?: string) => Promise<ServiceProbeResult[]>;
  showNativeNotification: (payload: {
    title: string;
    body: string;
  }) => Promise<boolean>;
  exportEscrowReceipt: (
    payload: EscrowReceiptPayload
  ) => Promise<{ saved: boolean; filePath?: string }>;
  selectDeliverableFiles: () => Promise<string[]>;
  openExternalUrl: (url: string) => Promise<boolean>;
  storeGet: <T = unknown>(key: string, defaultValue?: T) => Promise<T>;
  storeSet: (key: string, value: unknown) => Promise<boolean>;
  windowControl: (
    action: "minimize" | "maximize" | "close" | "reload" | "devtools"
  ) => Promise<void>;
  onNavigateShortcut: (callback: (route: string) => void) => () => void;
}

const desktopBridge: ElectronDesktopBridge = {
  isElectron: true,
  platform: process.platform,
  getSystemInfo: () => ipcRenderer.invoke("fiverrex:get-system-info"),
  probeClusterHealth: (host?: string) =>
    ipcRenderer.invoke("fiverrex:probe-cluster", host),
  showNativeNotification: (payload) =>
    ipcRenderer.invoke("fiverrex:notify", payload),
  exportEscrowReceipt: (payload) =>
    ipcRenderer.invoke("fiverrex:export-receipt", payload),
  selectDeliverableFiles: () =>
    ipcRenderer.invoke("fiverrex:select-deliverables"),
  openExternalUrl: (url: string) =>
    ipcRenderer.invoke("fiverrex:open-external", url),
  storeGet: (key, defaultValue) =>
    ipcRenderer.invoke("fiverrex:store-get", key, defaultValue),
  storeSet: (key, value) =>
    ipcRenderer.invoke("fiverrex:store-set", key, value),
  windowControl: (action) =>
    ipcRenderer.invoke("fiverrex:window-control", action),
  onNavigateShortcut: (callback: (route: string) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, route: string) => {
      callback(route);
    };
    ipcRenderer.on("fiverrex:navigate", handler);
    return () => {
      ipcRenderer.removeListener("fiverrex:navigate", handler);
    };
  },
};

contextBridge.exposeInMainWorld("electronAPI", desktopBridge);

