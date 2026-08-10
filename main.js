'use strict';
const { app, BrowserWindow, ipcMain, shell, net, Menu } = require('electron');
const path = require('path');
const fs = require('fs');

// ---------------------------------------------------------------------------
// Armazenamento persistente: um único arquivo JSON em userData.
// O renderer acessa via window.storage (get/set/delete), exposto no preload.
// ---------------------------------------------------------------------------
const dataFile = () => path.join(app.getPath('userData'), 'nave-data.json');
let store = {};

function loadStore() {
  try {
    store = JSON.parse(fs.readFileSync(dataFile(), 'utf8'));
    if (!store || typeof store !== 'object') store = {};
  } catch (e) {
    store = {};
  }
}

function saveStore() {
  const file = dataFile();
  const tmp = file + '.tmp';
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(tmp, JSON.stringify(store));
  fs.renameSync(tmp, file);
}

let saveTimer = null;
function scheduleSave() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    saveTimer = null;
    try { saveStore(); } catch (e) { console.error('saveStore', e); }
  }, 250);
}

ipcMain.handle('storage:get', (_e, key) => {
  const k = String(key);
  return { key: k, value: Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null };
});
ipcMain.handle('storage:set', (_e, { key, value }) => {
  store[String(key)] = String(value);
  scheduleSave();
  return true;
});
ipcMain.handle('storage:delete', (_e, key) => {
  delete store[String(key)];
  scheduleSave();
  return true;
});

// ---------------------------------------------------------------------------
// Proxy de rede: requisições às APIs (Zappfy, Anthropic) saem pelo processo
// principal, sem restrições de CORS do renderer.
// ---------------------------------------------------------------------------
ipcMain.handle('net:fetch', async (_e, { url, options }) => {
  const target = String(url || '');
  if (!/^https?:\/\//i.test(target)) throw new Error('URL inválida: ' + target);
  const opts = options || {};
  const res = await net.fetch(target, {
    method: opts.method || 'GET',
    headers: opts.headers || {},
    body: typeof opts.body === 'string' ? opts.body : undefined,
  });
  const body = await res.text();
  return { ok: res.ok, status: res.status, body };
});

// ---------------------------------------------------------------------------
// Janela principal
// ---------------------------------------------------------------------------
let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 980,
    minHeight: 620,
    backgroundColor: '#090a0c',
    title: 'NAVE CRM',
    icon: path.join(__dirname, 'build', 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'app', 'index.html'));

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//i.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => { mainWindow = null; });
}

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    loadStore();
    const template = [
      ...(process.platform === 'darwin' ? [{ role: 'appMenu' }] : []),
      { role: 'fileMenu' },
      { role: 'editMenu' },
      { role: 'viewMenu' },
      { role: 'windowMenu' },
    ];
    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
    createWindow();
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });

  app.on('window-all-closed', () => {
    if (saveTimer) { clearTimeout(saveTimer); saveTimer = null; try { saveStore(); } catch (e) {} }
    if (process.platform !== 'darwin') app.quit();
  });

  app.on('before-quit', () => {
    if (saveTimer) { clearTimeout(saveTimer); saveTimer = null; try { saveStore(); } catch (e) {} }
  });
}
