'use strict';
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('storage', {
  get: (key) => ipcRenderer.invoke('storage:get', key),
  set: (key, value) => ipcRenderer.invoke('storage:set', { key, value }),
  delete: (key) => ipcRenderer.invoke('storage:delete', key),
});

contextBridge.exposeInMainWorld('naveDesktop', {
  fetch: (url, options) => ipcRenderer.invoke('net:fetch', { url, options }),
  platform: process.platform,
});

// Explicit allow-list: no ipcRenderer is exposed to the page.
contextBridge.exposeInMainWorld('naveCRM', {
  dashboard: () => ipcRenderer.invoke('crm:dashboard'),
  upsertContact: (data) => ipcRenderer.invoke('crm:upsert-contact', data),
  createCase: (data) => ipcRenderer.invoke('crm:create-case', data),
  moveCase: (caseId, stage) => ipcRenderer.invoke('crm:move-case', { caseId, stage }),
  createTask: (data) => ipcRenderer.invoke('crm:create-task', data),
  humanBrief: (caseId) => ipcRenderer.invoke('crm:human-brief', { caseId }),
});

contextBridge.exposeInMainWorld('naveAgent', {
  classify: (text) => ipcRenderer.invoke('agent:classify', { text }),
  processInbound: (payload) => ipcRenderer.invoke('agent:process-inbound', payload),
});
