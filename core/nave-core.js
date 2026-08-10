'use strict';

/**
 * NAVE CRM domain core.
 * Pure functions only: persistence remains in Electron main process.
 */

const PIPELINE = [
  'NOVO_CONTATO',
  'TRIAGEM',
  'QUALIFICADO',
  'AGUARDANDO_DOCUMENTOS',
  'DOCUMENTACAO_COMPLETA',
  'ANALISE_VILMAR',
  'PROPOSTA_HONORARIOS',
  'CONTRATACAO',
  'EXECUCAO',
  'ACOMPANHAMENTO',
  'CONCLUIDO',
  'PERDIDO',
];

const AREAS = ['CONSUMIDOR', 'PLANOS_DE_SAUDE', 'BANCARIO', 'GOLPES_FRAUDES', 'TRABALHISTA', 'CIVEL', 'EMPRESARIAL', 'PREVIDENCIARIO', 'OUTRA'];

function uid(prefix = 'n') {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

function now() { return new Date().toISOString(); }

function normalizePhone(value) {
  return String(value || '').replace(/\D/g, '');
}

function ensureState(input) {
  const s = input && typeof input === 'object' ? input : {};
  return {
    contacts: Array.isArray(s.contacts) ? s.contacts : [],
    cases: Array.isArray(s.cases) ? s.cases : [],
    tasks: Array.isArray(s.tasks) ? s.tasks : [],
    appointments: Array.isArray(s.appointments) ? s.appointments : [],
    documents: Array.isArray(s.documents) ? s.documents : [],
    messages: Array.isArray(s.messages) ? s.messages : [],
    audit: Array.isArray(s.audit) ? s.audit : [],
  };
}

function findContact(state, { id, phone, email } = {}) {
  if (id) return state.contacts.find(c => c.id === id) || null;
  const p = normalizePhone(phone);
  if (p) {
    const found = state.contacts.find(c => normalizePhone(c.phone) === p);
    if (found) return found;
  }
  if (email) {
    const e = String(email).trim().toLowerCase();
    return state.contacts.find(c => String(c.email || '').trim().toLowerCase() === e) || null;
  }
  return null;
}

function upsertContact(state, data, actor = 'system') {
  const existing = findContact(state, data);
  const stamp = now();
  if (existing) {
    Object.assign(existing, {
      ...data,
      id: existing.id,
      updatedAt: stamp,
      phone: data.phone !== undefined ? normalizePhone(data.phone) : existing.phone,
    });
    audit(state, actor, 'CONTACT_UPDATED', existing.id, { fields: Object.keys(data) });
    return { contact: existing, created: false };
  }
  const contact = {
    id: data.id || uid('contact'),
    name: String(data.name || '').trim(),
    phone: normalizePhone(data.phone),
    email: String(data.email || '').trim(),
    cpf: String(data.cpf || '').trim(),
    source: data.source || 'outro',
    tags: Array.isArray(data.tags) ? data.tags : [],
    owner: data.owner || 'vilmar',
    createdAt: stamp,
    updatedAt: stamp,
  };
  state.contacts.push(contact);
  audit(state, actor, 'CONTACT_CREATED', contact.id, {});
  return { contact, created: true };
}

function createCase(state, data, actor = 'system') {
  const area = AREAS.includes(data.area) ? data.area : 'OUTRA';
  const c = {
    id: data.id || uid('case'),
    contactId: data.contactId,
    title: String(data.title || 'Nova demanda').trim(),
    area,
    subject: String(data.subject || '').trim(),
    source: data.source || 'outro',
    stage: PIPELINE.includes(data.stage) ? data.stage : 'NOVO_CONTATO',
    priority: data.priority || 'normal',
    urgency: data.urgency || 'normal',
    owner: data.owner || 'vilmar',
    estimatedValue: Number(data.estimatedValue || 0),
    summary: String(data.summary || '').trim(),
    missingDocuments: Array.isArray(data.missingDocuments) ? data.missingDocuments : [],
    createdAt: now(),
    updatedAt: now(),
    nextActionAt: data.nextActionAt || null,
  };
  state.cases.push(c);
  audit(state, actor, 'CASE_CREATED', c.id, { stage: c.stage, area: c.area });
  return c;
}

function moveCase(state, caseId, stage, actor = 'system') {
  if (!PIPELINE.includes(stage)) throw new Error(`Estágio inválido: ${stage}`);
  const c = state.cases.find(x => x.id === caseId);
  if (!c) throw new Error('Demanda não encontrada');
  const from = c.stage;
  c.stage = stage;
  c.updatedAt = now();
  audit(state, actor, 'CASE_STAGE_CHANGED', caseId, { from, to: stage });
  return c;
}

function createTask(state, data, actor = 'system') {
  const task = {
    id: data.id || uid('task'),
    title: String(data.title || '').trim(),
    contactId: data.contactId || null,
    caseId: data.caseId || null,
    dueAt: data.dueAt || null,
    priority: data.priority || 'normal',
    status: 'PENDING',
    owner: data.owner || 'vilmar',
    source: data.source || 'system',
    createdAt: now(),
  };
  if (!task.title) throw new Error('Tarefa sem título');
  state.tasks.push(task);
  audit(state, actor, 'TASK_CREATED', task.id, { caseId: task.caseId });
  return task;
}

function audit(state, actor, action, entityId, data) {
  state.audit.push({ id: uid('audit'), at: now(), actor, action, entityId, data });
  if (state.audit.length > 5000) state.audit.splice(0, state.audit.length - 5000);
}

function dashboard(state) {
  const pendingTasks = state.tasks.filter(t => t.status === 'PENDING');
  const awaitingHuman = state.cases.filter(c => c.stage === 'ANALISE_VILMAR');
  const documents = state.documents.filter(d => d.status === 'PENDING');
  return {
    contacts: state.contacts.length,
    cases: state.cases.length,
    pendingTasks: pendingTasks.length,
    overdueTasks: pendingTasks.filter(t => t.dueAt && new Date(t.dueAt) < new Date()).length,
    awaitingHuman: awaitingHuman.length,
    pendingDocuments: documents.length,
    appointments: state.appointments.filter(a => a.status !== 'CANCELLED').length,
  };
}

module.exports = { PIPELINE, AREAS, ensureState, normalizePhone, findContact, upsertContact, createCase, moveCase, createTask, audit, dashboard, uid, now };
