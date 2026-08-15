const { app, BrowserWindow, Menu, shell } = require("electron");
const path = require("path");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    title: "إدهام ERP - لوحة التحكم الإدارية",
    backgroundColor: "#0d1117",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true
    }
  });

  // تحميل رابط الويب المستضاف على كلاود فلير
  mainWindow.loadURL("https://idham-foodstuffs.pages.dev/index.html");

  // تخصيص القائمة العلوية للتطبيق
  createCustomMenu();

  // فتح الروابط الخارجية (مثل الخرائط أو الروابط المرجعية) في متصفح النظام الافتراضي بدلاً من التطبيق نفسه
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("http:") || url.startsWith("https:")) {
      shell.openExternal(url);
    }
    return { action: "deny" };
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

function createCustomMenu() {
  const template = [
    {
      label: "الملف",
      submenu: [
        { label: "إعادة تحميل الصفحة", role: "reload" },
        { label: "إعادة تحميل كاملة", role: "forceReload" },
        { type: "separator" },
        { label: "تصغير النافذة", role: "minimize" },
        { label: "خروج", click: () => app.quit() }
      ]
    },
    {
      label: "عرض",
      submenu: [
        { label: "تكبير الشاشة كاملة", role: "togglefullscreen" },
        { label: "تقريب (Zoom In)", role: "zoomIn" },
        { label: "تصغير (Zoom Out)", role: "zoomOut" },
        { label: "الوضع الافتراضي", role: "resetZoom" },
        { type: "separator" },
        { label: "أدوات المطور (DevTools)", role: "toggleDevTools" }
      ]
    },
    {
      label: "مساعدة",
      submenu: [
        {
          label: "موقع الدعم الفني",
          click: async () => {
            await shell.openExternal("https://idham-foodstuffs-sa.web.app");
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
