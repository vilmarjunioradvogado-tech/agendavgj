/* NAVE — núcleo: helpers, storage, estado, migração, eventos, auditoria, permissões */
(() => {
'use strict';
const NAVE = window.NAVE = window.NAVE || {};

/* ---------- helpers ---------- */
const $ = id => document.getElementById(id);
const uid = () => (crypto && crypto.randomUUID) ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2);
const today = () => new Date().toISOString().slice(0, 10);
const now = () => new Date().toISOString();
const money = v => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(v) || 0);
const dateBR = v => v ? new Date(String(v).slice(0, 10) + 'T12:00:00').toLocaleDateString('pt-BR') : '—';
const dtBR = v => v ? new Date(v).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—';
const esc = v => String(v ?? '').replace(/[&<>'"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]));
const daysDiff = (a, b = today()) => Math.floor((new Date(String(a).slice(0, 10) + 'T12:00:00') - new Date(String(b).slice(0, 10) + 'T12:00:00')) / 86400000);
const addDays = (d, n) => { const x = new Date(String(d).slice(0, 10) + 'T12:00:00'); x.setDate(x.getDate() + n); return x.toISOString().slice(0, 10); };
const clone = x => JSON.parse(JSON.stringify(x));
const normPhone = p => String(p || '').replace(/\D/g, '');

/* ---------- storage: desktop (arquivo) -> localStorage -> memória ---------- */
const PREFIX = 'crm-';
const volatile = new Map();
const hasDesktopStore = !!(window.storage && typeof window.storage.get === 'function' && typeof window.storage.set === 'function');
let storageMode = hasDesktopStore ? 'desktop' : (() => { try { const t = '__nave_test__'; localStorage.setItem(t, '1'); localStorage.removeItem(t); return 'local'; } catch (e) { return 'memory'; } })();

async function sget(k) {
  try {
    if (storageMode === 'desktop') { const r = await window.storage.get(PREFIX + k); if (r?.value != null) return JSON.parse(r.value); }
    else if (storageMode === 'local') { const v = localStorage.getItem(PREFIX + k); if (v != null) return JSON.parse(v); }
  } catch (e) { console.error('sget ' + k, e); }
  return volatile.has(k) ? clone(volatile.get(k)) : null;
}
async function sset(k, v) {
  const data = JSON.stringify(v);
  try {
    if (storageMode === 'desktop') { await window.storage.set(PREFIX + k, data); return; }
    if (storageMode === 'local') { localStorage.setItem(PREFIX + k, data); return; }
  } catch (e) { console.error('sset ' + k, e); storageMode = 'memory'; showStorageFallback(); }
  volatile.set(k, clone(v));
}
function showStorageFallback() {
  const b = $('storageBanner'); if (!b) return;
  b.style.display = 'block';
  b.textContent = 'Modo degradado: o armazenamento persistente não está disponível. Os dados ficam apenas na memória desta sessão.';
}

/* ---------- fetch (desktop = sem CORS via processo principal) ---------- */
async function apiFetch(url, opts) {
  if (window.naveDesktop && typeof window.naveDesktop.fetch === 'function') {
    const r = await window.naveDesktop.fetch(url, opts || {});
    return { ok: !!r.ok, status: r.status, json: async () => JSON.parse(r.body || 'null'), text: async () => r.body || '' };
  }
  return fetch(url, opts);
}

/* ---------- estado ---------- */
const KEYS = ['config', 'contacts', 'companies', 'cases', 'pipeline', 'documents', 'tasks', 'appointments',
  'automations', 'knowledge', 'triageFlows', 'auditLog', 'contracts', 'processes', 'deadlines', 'learnings',
  'chat', 'whatsappChats', 'whatsappMessages', 'waAgentLogs'];
const LIST_KEYS = KEYS.filter(k => !['config', 'pipeline'].includes(k));

const defaultConfig = {
  office: 'NAVE Advocacia', lawyer: 'Vilmar Guimarães Júnior', oab: '', goal: 30000, pix: '',
  anthropicApiKey: '', aiModel: 'claude-sonnet-4-6',
  users: [{ id: 'vilmar', name: 'Vilmar', role: 'administrador' }, { id: 'ia', name: 'Agente IA', role: 'agente_ia' }],
  roles: ['administrador', 'advogado', 'assistente', 'atendimento', 'agente_ia'],
  agenda: { startHour: 9, endHour: 18, slotMin: 60, weekdays: [1, 2, 3, 4, 5] },
  automations: { lead3: true, proposal5: true, installment3: true, hearing1: true },
  /* permissões do agente IA por ferramenta: allow | approve | block */
  iaPermissions: {
    find_contact: 'allow', create_contact: 'allow', update_contact: 'allow', create_case: 'allow', update_case: 'allow',
    move_pipeline: 'allow', create_task: 'allow', complete_task: 'approve', request_document: 'allow', register_document: 'allow',
    check_calendar: 'allow', create_appointment: 'allow', reschedule_appointment: 'approve', send_message: 'allow',
    handoff_to_human: 'allow', generate_case_summary: 'allow', search_knowledge: 'allow'
  },
  whatsapp: {
    enabled: true, baseUrl: 'https://api.zappfy.io', token: '', instanceId: '', phone: '', mode: 'autonomo',
    sendPath: '/send/text', webhookUrl: '', polling: true, pollMs: 30000, agentEnabled: true,
    agentName: 'Atendimento do Escritório', autoReply: true, createLead: true, createTasks: true, transferAfterTriage: true
  }
};

const state = NAVE.state = { waSelectedChatId: '', inboxFilter: 'todos', clientDetailId: '', systemTab: 'automacoes' };

async function loadState() {
  for (const k of KEYS) state[k] = await sget(k);
  state.config = deepMergeConfig(defaultConfig, state.config || {});
  for (const k of LIST_KEYS) if (!Array.isArray(state[k])) state[k] = [];
  if (!state.pipeline || !Array.isArray(state.pipeline.stages) || !state.pipeline.stages.length) state.pipeline = null; // data.js aplica default
  await migrate();
}
function deepMergeConfig(def, cur) {
  const out = { ...def, ...cur };
  out.automations = { ...def.automations, ...(cur.automations || {}) };
  out.whatsapp = { ...def.whatsapp, ...(cur.whatsapp || {}) };
  out.agenda = { ...def.agenda, ...(cur.agenda || {}) };
  out.iaPermissions = { ...def.iaPermissions, ...(cur.iaPermissions || {}) };
  if (!Array.isArray(out.users) || !out.users.length) out.users = clone(def.users);
  if (!Array.isArray(out.roles) || !out.roles.length) out.roles = clone(def.roles);
  return out;
}

/* ---------- migração v1 (leads/clients) -> v2 (contacts/cases) ---------- */
async function migrate() {
  const ver = Number(state.config.schemaVersion || 1);
  if (ver >= 2) return;
  const oldLeads = (await sget('leads')) || [];
  const oldClients = (await sget('clients')) || [];
  const stageMap = { 'LEAD': 'novo_contato', 'QUALIFICAÇÃO': 'triagem', 'PROPOSTA': 'proposta', 'FECHADO': 'contratacao', 'PERDIDO': 'triagem' };
  for (const c of oldClients) {
    if (!state.contacts.find(x => x.id === c.id)) state.contacts.push({
      id: c.id, name: c.name || 'Sem nome', phone: normPhone(c.phone), whatsapp: normPhone(c.phone), email: '', cpf: '',
      origin: c.source || 'outro', ownerId: 'vilmar', status: 'cliente', tags: [], notes: c.notes || '', companyIds: [],
      lastInteraction: c.createdAt || now(), nextAction: '', createdAt: c.createdAt || now(), updatedAt: now()
    });
  }
  for (const l of oldLeads) {
    let contact = state.contacts.find(x => x.id === l.clientId) || state.contacts.find(x => normPhone(x.phone) === normPhone(l.phone) && normPhone(l.phone));
    if (!contact) {
      contact = { id: uid(), name: l.name || 'Sem nome', phone: normPhone(l.phone), whatsapp: normPhone(l.phone), email: '', cpf: '',
        origin: l.source || 'outro', ownerId: 'vilmar', status: l.stage === 'FECHADO' ? 'cliente' : 'lead', tags: [], notes: l.notes || '',
        companyIds: [], lastInteraction: l.createdAt || now(), nextAction: '', createdAt: l.createdAt || now(), updatedAt: now() };
      state.contacts.push(contact);
    }
    if (!state.cases.find(x => x.migratedFromLead === l.id)) state.cases.push({
      id: uid(), migratedFromLead: l.id, title: l.subject || 'Demanda migrada', contactId: contact.id, companyId: '',
      area: l.subject || 'outras', subject: l.subject || '', origin: l.source || 'outro',
      stageId: stageMap[l.stage] || 'novo_contato', status: l.stage === 'PERDIDO' ? 'perdido' : (l.stage === 'FECHADO' ? 'ganho' : 'aberto'),
      priority: l.urgency === 'alta' ? 'alta' : 'normal', urgency: l.urgency || 'normal', ownerId: 'vilmar',
      value: Number(l.estimatedValue) || 0, createdAt: l.createdAt || now(), lastInteraction: l.createdAt || now(),
      nextAction: '', dueDate: '', notes: l.notes || '', summary: null, lossReason: l.lossReason || ''
    });
  }
  for (const t of state.tasks) { if (!t.status) t.status = t.done ? 'concluida' : 'aberta'; if (!t.assignee) t.assignee = 'vilmar'; }
  for (const ch of state.whatsappChats) { if (!ch.aiMode) ch.aiMode = 'ia'; }
  state.config.schemaVersion = 2;
  await sset('config', state.config);
  await Promise.all(['contacts', 'cases', 'tasks', 'whatsappChats'].map(k => sset(k, state[k])));
}

/* ---------- barramento de eventos (motor de automações escuta aqui) ---------- */
const listeners = {};
function on(evt, fn) { (listeners[evt] = listeners[evt] || []).push(fn); }
async function emit(evt, payload) {
  for (const fn of (listeners[evt] || [])) { try { await fn(payload || {}); } catch (e) { console.error('evento ' + evt, e); } }
  for (const fn of (listeners['*'] || [])) { try { await fn(evt, payload || {}); } catch (e) { console.error('evento * ' + evt, e); } }
}

/* ---------- auditoria ---------- */
async function audit(actor, action, detail, refs) {
  state.auditLog.unshift({ id: uid(), at: now(), actor, action, detail: detail || '', contactId: refs?.contactId || '', caseId: refs?.caseId || '', result: refs?.result || 'ok', data: refs?.data || null });
  if (state.auditLog.length > 1500) state.auditLog = state.auditLog.slice(0, 1500);
  await sset('auditLog', state.auditLog);
}

/* ---------- permissões da IA ---------- */
function iaCan(tool) { return state.config.iaPermissions[tool] || 'approve'; }

/* ---------- UI base ---------- */
function toast(t) { const el = $('toast'); if (!el) return; el.textContent = t; el.classList.add('show'); clearTimeout(toast._t); toast._t = setTimeout(() => el.classList.remove('show'), 2200); }
function openModal(html) { $('modal').innerHTML = html; $('modalBackdrop').classList.add('open'); }
function closeModal() { $('modalBackdrop').classList.remove('open'); $('modal').innerHTML = ''; }

NAVE.views = {};           // nome -> função render
let currentView = 'painel';
function nav(view) {
  currentView = view;
  document.querySelectorAll('.view').forEach(x => x.classList.remove('active'));
  const el = $('view-' + view); if (el) el.classList.add('active');
  document.querySelectorAll('.nav button').forEach(x => x.classList.toggle('active', x.dataset.view === view));
  renderView(view);
}
function renderView(v) { const fn = NAVE.views[v]; if (fn) { try { fn(); } catch (e) { console.error('render ' + v, e); showError('Erro ao renderizar ' + v + ': ' + e.message); } } }
function render() { renderView(currentView); const on = $('officeName'); if (on) on.textContent = state.config.office || 'Escritório'; updateNavBadges(); }
function updateNavBadges() {
  const pend = state.whatsappChats.filter(c => c.status === 'aguardando_vilmar').length + state.tasks.filter(t => t.status === 'aberta' && t.kind === 'aprovacao').length;
  const btn = document.querySelector('.nav button[data-view="inbox"] b');
  if (btn) btn.innerHTML = '✉' + (pend ? '<span class="ndot"></span>' : '');
}
async function persist(k) { await sset(k, state[k]); render(); }
function showError(msg) { const b = $('errorBanner'); if (!b) return; b.style.display = 'block'; b.textContent = msg; }

window.addEventListener('error', e => { showError('Erro detectado: ' + (e.message || 'erro desconhecido')); console.error(e.error || e.message); });
window.addEventListener('unhandledrejection', e => { showError('Erro detectado: ' + (e.reason?.message || String(e.reason))); console.error(e.reason); });

Object.assign(NAVE, { $, uid, today, now, money, dateBR, dtBR, esc, daysDiff, addDays, clone, normPhone,
  sget, sset, apiFetch, loadState, defaultConfig, on, emit, audit, iaCan, toast, openModal, closeModal,
  nav, render, renderView, persist, showError, getStorageMode: () => storageMode, showStorageFallback });
})();
