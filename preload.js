const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("desktopAPI", {
  isDesktop: true,
  getHardwareId: () => ipcRenderer.invoke("get-hwid"),
  getLicenseStatus: () => ipcRenderer.invoke("get-license-status"),
  activateLicense: (key) => ipcRenderer.invoke("activate-license", key),
  getPrinters: () => ipcRenderer.invoke("get-printers"),
  printSilent: (opts) => ipcRenderer.invoke("print-silent", opts),
  printToPDF: (opts) => ipcRenderer.invoke("print-to-pdf", opts),
  saveFileDialog: (opts) => ipcRenderer.invoke("save-file-dialog", opts),
  openFileDialog: (opts) => ipcRenderer.invoke("open-file-dialog", opts),
  selectFolderDialog: (opts) => ipcRenderer.invoke("select-folder-dialog", opts),
  openFolderPath: (opts) => ipcRenderer.invoke("open-folder-path", opts),
  writeFile: (opts) => ipcRenderer.invoke("write-file", opts),
  openCashDrawer: (opts) => ipcRenderer.invoke("open-cash-drawer", opts)
});
