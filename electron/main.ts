import {
  app,
  BrowserWindow,
  dialog,
  ipcMain,
  Menu,
  Notification,
  shell,
} from "electron";
import path from "node:path";
import fs from "node:fs";
import {
  DesktopJsonStore,
  type EscrowReceiptPayload,
  formatEscrowReceiptMarkdown,
  getSystemDiagnostics,
  probeClusterServices,
} from "./services";

let mainWindow: BrowserWindow | null = null;
let desktopStore: DesktopJsonStore | null = null;

function getStore(): DesktopJsonStore {
  if (!desktopStore) {
    desktopStore = new DesktopJsonStore(app.getPath("userData"));
  }
  return desktopStore;
}

function createApplicationMenu(): void {
  const isMac = process.platform === "darwin";

  const sendRoute = (route: string) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send("fiverrex:navigate", route);
    }
  };

  const template: Electron.MenuItemConstructorOptions[] = [
    ...(isMac
      ? [
          {
            label: app.name,
            submenu: [
              { role: "about" as const },
              { type: "separator" as const },
              {
                label: "Microservice Cluster Telemetry",
                accelerator: "CmdOrCtrl+5",
                click: () => sendRoute("cluster"),
              },
              { type: "separator" as const },
              { role: "services" as const },
              { type: "separator" as const },
              { role: "hide" as const },
              { role: "hideOthers" as const },
              { role: "unhide" as const },
              { type: "separator" as const },
              { role: "quit" as const },
            ],
          },
        ]
      : []),
    {
      label: "Workspace",
      submenu: [
        {
          label: "Explore Marketplace",
          accelerator: "CmdOrCtrl+1",
          click: () => sendRoute("explore"),
        },
        {
          label: "Orders & Escrow Saga",
          accelerator: "CmdOrCtrl+2",
          click: () => sendRoute("orders"),
        },
        {
          label: "Real-Time Inbox",
          accelerator: "CmdOrCtrl+3",
          click: () => sendRoute("inbox"),
        },
        {
          label: "Seller Studio & Wallet",
          accelerator: "CmdOrCtrl+4",
          click: () => sendRoute("seller"),
        },
        {
          label: "DDD Cluster & Desktop Control",
          accelerator: "CmdOrCtrl+5",
          click: () => sendRoute("cluster"),
        },
        { type: "separator" },
        {
          label: "Quick Command Palette",
          accelerator: "CmdOrCtrl+K",
          click: () => sendRoute("command-palette"),
        },
      ],
    },
    {
      label: "Edit",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
        { role: "selectAll" },
      ],
    },
    {
      label: "View",
      submenu: [
        { role: "reload" },
        { role: "forceReload" },
        { role: "toggleDevTools" },
        { type: "separator" },
        { role: "resetZoom" },
        { role: "zoomIn" },
        { role: "zoomOut" },
        { type: "separator" },
        { role: "togglefullscreen" },
      ],
    },
    {
      label: "Developer",
      submenu: [
        {
          label: "Open API Gateway Swagger UI (:8080)",
          click: () => {
            shell.openExternal("http://localhost:8080/swagger-ui/index.html");
          },
        },
        {
          label: "Open FIVERREX Technical Documentation",
          click: () => {
            shell.openExternal("https://fiverr-technical-doc.vercel.app");
          },
        },
        {
          label: "Open GitHub Organization (@fiverr-club)",
          click: () => {
            shell.openExternal("https://github.com/fiverr-club");
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function registerIpcHandlers(): void {
  ipcMain.handle("fiverrex:get-system-info", async () => {
    return getSystemDiagnostics(app.getPath("userData"), app.getVersion());
  });

  ipcMain.handle("fiverrex:probe-cluster", async (_event, host?: string) => {
    return probeClusterServices(host || "127.0.0.1");
  });

  ipcMain.handle(
    "fiverrex:notify",
    async (_event, payload: { title: string; body: string }) => {
      try {
        if (Notification.isSupported()) {
          const notif = new Notification({
            title: payload.title,
            body: payload.body,
            silent: false,
          });
          notif.show();
          return true;
        }
        return false;
      } catch {
        return false;
      }
    }
  );

  ipcMain.handle(
    "fiverrex:export-receipt",
    async (_event, payload: EscrowReceiptPayload) => {
      if (!mainWindow) return { saved: false };
      const sanitizedOrder = payload.orderNumber.replace(/[^a-zA-Z0-9-_]/g, "");
      const defaultPath = path.join(
        app.getPath("documents"),
        `FIVERREX-Escrow-Receipt-${sanitizedOrder || "Order"}.md`
      );

      const result = await dialog.showSaveDialog(mainWindow, {
        title: "Export Official FIVERREX Escrow Ledger Receipt",
        defaultPath,
        filters: [
          { name: "Markdown Receipt", extensions: ["md"] },
          { name: "JSON Ledger Proof", extensions: ["json"] },
        ],
      });

      if (result.canceled || !result.filePath) {
        return { saved: false };
      }

      const content = result.filePath.endsWith(".json")
        ? JSON.stringify(payload, null, 2)
        : formatEscrowReceiptMarkdown(payload);

      await fs.promises.writeFile(result.filePath, content, "utf-8");
      return { saved: true, filePath: result.filePath };
    }
  );

  ipcMain.handle("fiverrex:select-deliverables", async () => {
    if (!mainWindow) return [];
    const result = await dialog.showOpenDialog(mainWindow, {
      title: "Select Deliverable Artifacts to Attach",
      properties: ["openFile", "multiSelections"],
      filters: [
        {
          name: "Deliverable Archives & Docs",
          extensions: ["zip", "tgz", "tar", "gz", "pdf", "md", "json", "png", "jpg"],
        },
        { name: "All Files", extensions: ["*"] },
      ],
    });
    if (result.canceled || !result.filePaths.length) {
      return [];
    }
    return result.filePaths.map((fp) => {
      try {
        const stat = fs.statSync(fp);
        const kb = Math.max(1, Math.round(stat.size / 1024));
        const sizeLabel =
          kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`;
        return `${path.basename(fp)} (${sizeLabel})`;
      } catch {
        return path.basename(fp);
      }
    });
  });

  ipcMain.handle("fiverrex:open-external", async (_event, url: string) => {
    if (typeof url === "string" && (url.startsWith("http://") || url.startsWith("https://"))) {
      await shell.openExternal(url);
      return true;
    }
    return false;
  });

  ipcMain.handle(
    "fiverrex:store-get",
    async (_event, key: string, defaultValue?: unknown) => {
      return getStore().get(key, defaultValue);
    }
  );

  ipcMain.handle(
    "fiverrex:store-set",
    async (_event, key: string, value: unknown) => {
      getStore().set(key, value);
      return true;
    }
  );

  ipcMain.handle(
    "fiverrex:window-control",
    async (
      _event,
      action: "minimize" | "maximize" | "close" | "reload" | "devtools"
    ) => {
      if (!mainWindow || mainWindow.isDestroyed()) return;
      switch (action) {
        case "minimize":
          mainWindow.minimize();
          break;
        case "maximize":
          if (mainWindow.isMaximized()) {
            mainWindow.unmaximize();
          } else {
            mainWindow.maximize();
          }
          break;
        case "close":
          mainWindow.close();
          break;
        case "reload":
          mainWindow.reload();
          break;
        case "devtools":
          mainWindow.webContents.toggleDevTools();
          break;
      }
    }
  );
}

function createMainWindow(): void {
  const isMac = process.platform === "darwin";

  mainWindow = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1024,
    minHeight: 680,
    title: "FIVERREX Desktop — Freelance Marketplace & Escrow Studio",
    backgroundColor: "#072617",
    titleBarStyle: isMac ? "hiddenInset" : "default",
    trafficLightPosition: isMac ? { x: 16, y: 16 } : undefined,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  mainWindow.once("ready-to-show", () => {
    mainWindow?.show();
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("http://") || url.startsWith("https://")) {
      shell.openExternal(url);
    }
    return { action: "deny" };
  });

  const devServerUrl = process.env.ELECTRON_START_URL;
  if (devServerUrl) {
    mainWindow.loadURL(devServerUrl);
  } else {
    const indexHtmlPath = path.join(__dirname, "..", "dist", "index.html");
    mainWindow.loadFile(indexHtmlPath);
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.setName("FIVERREX Desktop");

app.whenReady().then(() => {
  createApplicationMenu();
  registerIpcHandlers();
  createMainWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

