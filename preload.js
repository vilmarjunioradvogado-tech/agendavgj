'use strict';
const { contextBridge, ipcRenderer } = require('electron');

// API de armazenamento no formato esperado pelo NAVE CRM:
// get(key) -> {key, value|null}; set(key, stringValue); delete(key)
contextBridge.exposeInMainWorld('storage', {
  get: (key) => ipcRenderer.invoke('storage:get', key),
  set: (key, value) => ipcRenderer.invoke('storage:set', { key, value }),
  delete: (key) => ipcRenderer.invoke('storage:delete', key),
});

// Fetch via processo principal (sem CORS). Retorna {ok, status, body}.
contextBridge.exposeInMainWorld('naveDesktop', {
  fetch: (url, options) => ipcRenderer.invoke('net:fetch', { url, options }),
  platform: process.platform,
});
