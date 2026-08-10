/* NAVE — modelo de dados: contatos, empresas, demandas, funil, documentos, tarefas, agenda, conhecimento, triagem */
(() => {
'use strict';
const N = window.NAVE, S = N.state;
const { uid, today, now, addDays, daysDiff, normPhone, emit, audit, sset } = N;

/* ---------- funil (estágios configuráveis) ---------- */
const DEFAULT_STAGES = [
  { id: 'novo_contato', name: 'Novo contato' },
  { id: 'triagem', name: 'Triagem' },
  { id: 'qualificado', name: 'Qualificado' },
  { id: 'aguardando_documentos', name: 'Aguardando documentos' },
  { id: 'documentacao_completa', name: 'Documentação completa' },
  { id: 'analise_juridica', name: 'Análise jurídica' },
  { id: 'proposta', name: 'Proposta/Honorários' },
  { id: 'contratacao', name: 'Contratação' },
  { id: 'execucao', name: 'Execução' },
  { id: 'acompanhamento', name: 'Acompanhamento' },
  { id: 'concluido', name: 'Concluído' },
];
function ensurePipeline() { if (!S.pipeline || !Array.isArray(S.pipeline.stages) || !S.pipeline.stages.length) S.pipeline = { stages: N.clone(DEFAULT_STAGES) }; }
const stages = () => S.pipeline.stages;
const stageName = id => (stages().find(s => s.id === id) || {}).name || id || '—';
const stageIndex = id => stages().findIndex(s => s.id === id);

/* ---------- origens de lead ---------- */
const ORIGINS = ['whatsapp', 'instagram', 'google', 'meta_ads', 'tiktok', 'youtube', 'indicacao', 'site', 'organico', 'outro'];
const originLabel = o => ({ whatsapp: 'WhatsApp', instagram: 'Instagram', google: 'Google', meta_ads: 'Meta Ads', tiktok: 'TikTok', youtube: 'YouTube', indicacao: 'Indicação', site: 'Site', organico: 'Orgânico', outro: 'Outro' }[o] || o || 'Outro');

/* ---------- contatos (PF) — dedupe por telefone/cpf ---------- */
function findContact({ phone, cpf, email, id, name }) {
  if (id) { const c = S.contacts.find(x => x.id === id); if (c) return c; }
  const p = normPhone(phone);
  if (p) { const c = S.contacts.find(x => normPhone(x.phone) === p || normPhone(x.whatsapp) === p); if (c) return c; }
  if (cpf) { const c = S.contacts.find(x => x.cpf && x.cpf.replace(/\D/g, '') === String(cpf).replace(/\D/g, '')); if (c) return c; }
  if (email) { const c = S.contacts.find(x => x.email && x.email.toLowerCase() === String(email).toLowerCase()); if (c) return c; }
  if (name) { const c = S.contacts.find(x => x.name.toLowerCase() === String(name).toLowerCase()); if (c) return c; }
  return null;
}
async function createContact(data, actor = 'vilmar') {
  const existing = findContact(data);
  if (existing) { await updateContact(existing.id, { ...data, name: data.name || existing.name }, actor, true); return existing; }
  const c = {
    id: uid(), name: data.name || 'Sem nome', phone: normPhone(data.phone), whatsapp: normPhone(data.whatsapp || data.phone),
    email: data.email || '', cpf: data.cpf || '', origin: data.origin || 'outro', ownerId: data.ownerId || 'vilmar',
    status: data.status || 'lead', tags: data.tags || [], notes: data.notes || '', companyIds: data.companyIds || [],
    lastInteraction: now(), nextAction: data.nextAction || '', createdAt: now(), updatedAt: now()
  };
  S.contacts.push(c);
  await sset('contacts', S.contacts);
  await audit(actor, 'create_contact', 'Contato criado: ' + c.name, { contactId: c.id });
  await emit('contact.created', { contact: c, actor });
  return c;
}
async function updateContact(id, data, actor = 'vilmar', silent = false) {
  const c = S.contacts.find(x => x.id === id); if (!c) return null;
  const allowed = ['name', 'phone', 'whatsapp', 'email', 'cpf', 'origin', 'ownerId', 'status', 'tags', 'notes', 'nextAction', 'companyIds'];
  for (const k of allowed) if (data[k] !== undefined && data[k] !== '' || (k === 'notes' && data[k] !== undefined)) {
    if (k === 'phone' || k === 'whatsapp') c[k] = normPhone(data[k]) || c[k]; else c[k] = data[k];
  }
  c.updatedAt = now();
  await sset('contacts', S.contacts);
  if (!silent) await audit(actor, 'update_contact', 'Contato atualizado: ' + c.name, { contactId: c.id });
  return c;
}
async function touchContact(id) { const c = S.contacts.find(x => x.id === id); if (c) { c.lastInteraction = now(); await sset('contacts', S.contacts); } }
const contactById = id => S.contacts.find(x => x.id === id) || null;
const contactCases = id => S.cases.filter(k => k.contactId === id);

/* ---------- empresas (PJ) ---------- */
function findCompany({ cnpj, id, name }) {
  if (id) { const c = S.companies.find(x => x.id === id); if (c) return c; }
  if (cnpj) { const c = S.companies.find(x => x.cnpj && x.cnpj.replace(/\D/g, '') === String(cnpj).replace(/\D/g, '')); if (c) return c; }
  if (name) { const c = S.companies.find(x => (x.razaoSocial || '').toLowerCase() === String(name).toLowerCase() || (x.nomeFantasia || '').toLowerCase() === String(name).toLowerCase()); if (c) return c; }
  return null;
}
async function createCompany(data, actor = 'vilmar') {
  const existing = findCompany(data); if (existing) return existing;
  const c = { id: uid(), cnpj: data.cnpj || '', razaoSocial: data.razaoSocial || data.name || 'Empresa', nomeFantasia: data.nomeFantasia || '',
    contactIds: data.contactIds || [], notes: data.notes || '', createdAt: now(), updatedAt: now() };
  S.companies.push(c);
  await sset('companies', S.companies);
  await audit(actor, 'create_company', 'Empresa criada: ' + c.razaoSocial, {});
  return c;
}
async function linkContactCompany(contactId, companyId) {
  const c = contactById(contactId), e = S.companies.find(x => x.id === companyId); if (!c || !e) return;
  if (!c.companyIds.includes(companyId)) c.companyIds.push(companyId);
  if (!e.contactIds.includes(contactId)) e.contactIds.push(contactId);
  await Promise.all([sset('contacts', S.contacts), sset('companies', S.companies)]);
}

/* ---------- demandas / casos (várias por contato — nunca misturar) ---------- */
async function createCase(data, actor = 'vilmar') {
  const k = {
    id: uid(), title: data.title || 'Nova demanda', contactId: data.contactId || '', companyId: data.companyId || '',
    area: data.area || 'outras', subject: data.subject || '', origin: data.origin || (contactById(data.contactId)?.origin) || 'outro',
    stageId: data.stageId || stages()[0].id, status: 'aberto', priority: data.priority || 'normal', urgency: data.urgency || 'normal',
    ownerId: data.ownerId || 'vilmar', value: Number(data.value) || 0, createdAt: now(), lastInteraction: now(),
    nextAction: data.nextAction || '', dueDate: data.dueDate || '', notes: data.notes || '', summary: null,
    triageAnswers: [], docsCompleteNotified: false
  };
  S.cases.push(k);
  await sset('cases', S.cases);
  await audit(actor, 'create_case', 'Demanda criada: ' + k.title, { caseId: k.id, contactId: k.contactId });
  await emit('case.created', { kase: k, actor });
  return k;
}
async function updateCase(id, data, actor = 'vilmar') {
  const k = S.cases.find(x => x.id === id); if (!k) return null;
  const allowed = ['title', 'area', 'subject', 'origin', 'priority', 'urgency', 'ownerId', 'value', 'nextAction', 'dueDate', 'notes', 'status', 'companyId', 'triageAnswers', 'summary', 'lossReason'];
  for (const key of allowed) if (data[key] !== undefined) k[key] = data[key];
  k.lastInteraction = now();
  await sset('cases', S.cases);
  await audit(actor, 'update_case', 'Demanda atualizada: ' + k.title, { caseId: k.id, contactId: k.contactId });
  return k;
}
async function moveCase(id, stageId, actor = 'vilmar') {
  const k = S.cases.find(x => x.id === id); if (!k) return null;
  if (!stages().find(s => s.id === stageId)) throw new Error('Estágio inexistente: ' + stageId);
  const from = k.stageId;
  if (from === stageId) return k;
  k.stageId = stageId; k.lastInteraction = now();
  if (stageId === 'concluido') k.status = 'ganho';
  await sset('cases', S.cases);
  await audit(actor, 'move_pipeline', `Estágio: ${stageName(from)} → ${stageName(stageId)} (${k.title})`, { caseId: k.id, contactId: k.contactId });
  await emit('case.stage_changed', { kase: k, from, to: stageId, actor });
  return k;
}
const caseById = id => S.cases.find(x => x.id === id) || null;
const openCaseForContact = contactId => S.cases.filter(k => k.contactId === contactId && k.status === 'aberto').sort((a, b) => (b.lastInteraction || '').localeCompare(a.lastInteraction || ''))[0] || null;

/* ---------- documentos ---------- */
const DOC_CATEGORIES = ['Documentos pessoais', 'Comprovante de residência', 'Relatório médico', 'Negativa do plano', 'Carteirinha do plano',
  'Contrato', 'Comprovante de pagamento', 'Extrato bancário', 'Boletim de ocorrência', 'Prints de conversa', 'Procuração', 'Carteira de trabalho', 'Outros'];
function suggestDocCategory(filename) {
  const f = String(filename || '').toLowerCase();
  const map = [
    [/negativa|recusa/, 'Negativa do plano'], [/relat[óo]rio|laudo|m[ée]dic/, 'Relatório médico'], [/carteir(inha)?.*plano|plano.*carteir/, 'Carteirinha do plano'],
    [/rg|cpf|cnh|identidade|documento/, 'Documentos pessoais'], [/resid[êe]ncia|endere[çc]o|conta.*(luz|agua|água)/, 'Comprovante de residência'],
    [/contrato/, 'Contrato'], [/comprovante.*pag|pix|transfer/, 'Comprovante de pagamento'], [/extrato/, 'Extrato bancário'],
    [/b\.?o\.?|ocorr[êe]ncia/, 'Boletim de ocorrência'], [/print|conversa|whats/, 'Prints de conversa'], [/procura[çc][ãa]o/, 'Procuração'],
    [/ctps|carteira.*trabalho/, 'Carteira de trabalho']];
  for (const [re, cat] of map) if (re.test(f)) return cat;
  return 'Outros';
}
async function requestDocuments(caseId, names, actor = 'ia') {
  const k = caseById(caseId); if (!k) throw new Error('Demanda não encontrada');
  const created = [];
  for (const name of (names || [])) {
    const nm = String(name).trim(); if (!nm) continue;
    if (S.documents.find(d => d.caseId === caseId && d.name.toLowerCase() === nm.toLowerCase() && d.status !== 'rejeitado')) continue;
    const d = { id: uid(), caseId, contactId: k.contactId, name: nm, category: suggestDocCategory(nm), status: 'pendente',
      requestedAt: now(), receivedAt: '', source: '', note: '', fileData: null, fileType: '' };
    S.documents.push(d); created.push(d);
  }
  if (created.length) {
    k.docsCompleteNotified = false;
    await Promise.all([sset('documents', S.documents), sset('cases', S.cases)]);
    await audit(actor, 'request_document', 'Solicitados: ' + created.map(d => d.name).join(', '), { caseId, contactId: k.contactId });
    await emit('document.requested', { kase: k, docs: created, actor });
  }
  return created;
}
async function registerDocument({ caseId, contactId, name, category, source, note, fileData, fileType }, actor = 'ia') {
  const k = caseId ? caseById(caseId) : null;
  const cat = category || suggestDocCategory(name);
  const pending = S.documents.find(d => d.status === 'pendente' && (d.caseId === caseId || (!caseId && d.contactId === contactId)) &&
    (d.category === cat || d.name.toLowerCase() === String(name || '').toLowerCase()));
  let doc;
  if (pending) { doc = pending; doc.status = 'recebido'; doc.receivedAt = now(); doc.source = source || doc.source; doc.note = note || doc.note; if (fileData) { doc.fileData = fileData; doc.fileType = fileType || ''; } }
  else {
    doc = { id: uid(), caseId: caseId || '', contactId: contactId || (k ? k.contactId : ''), name: name || 'Documento', category: cat,
      status: 'recebido', requestedAt: '', receivedAt: now(), source: source || '', note: note || '', fileData: fileData || null, fileType: fileType || '' };
    S.documents.push(doc);
  }
  await sset('documents', S.documents);
  await audit(actor, 'register_document', `Documento recebido: ${doc.name} (${doc.category})`, { caseId: doc.caseId, contactId: doc.contactId });
  await emit('document.received', { doc, kase: k, actor });
  await checkDocsComplete(doc.caseId, actor);
  return doc;
}
async function setDocStatus(docId, status, actor = 'vilmar') {
  const d = S.documents.find(x => x.id === docId); if (!d) return;
  d.status = status;
  await sset('documents', S.documents);
  await audit(actor, 'doc_status', `Documento ${d.name}: ${status}`, { caseId: d.caseId, contactId: d.contactId });
  await checkDocsComplete(d.caseId, actor);
}
async function checkDocsComplete(caseId, actor = 'sistema') {
  if (!caseId) return;
  const k = caseById(caseId); if (!k) return;
  const docs = S.documents.filter(d => d.caseId === caseId && d.status !== 'rejeitado');
  if (!docs.length) return;
  const pend = docs.filter(d => d.status === 'pendente');
  if (!pend.length && !k.docsCompleteNotified) {
    k.docsCompleteNotified = true;
    await sset('cases', S.cases);
    await emit('document.complete', { kase: k, actor });
  }
}
const caseDocs = caseId => S.documents.filter(d => d.caseId === caseId);

/* ---------- tarefas ---------- */
async function createTask(data, actor = 'sistema') {
  if (data.dedupeTitle && S.tasks.some(t => t.status === 'aberta' && t.title === data.title && t.caseId === (data.caseId || ''))) return null;
  const t = { id: uid(), title: data.title || 'Tarefa', desc: data.desc || '', assignee: data.assignee || 'vilmar',
    priority: data.priority || 'normal', due: data.due || today(), dueDate: data.due || today(),
    contactId: data.contactId || '', caseId: data.caseId || '', origin: data.origin || actor, status: 'aberta', done: false,
    kind: data.kind || 'tarefa', payload: data.payload || null, createdAt: now(), completedAt: '' };
  S.tasks.push(t);
  await sset('tasks', S.tasks);
  await audit(actor, 'create_task', 'Tarefa: ' + t.title, { caseId: t.caseId, contactId: t.contactId });
  await emit('task.created', { task: t, actor });
  return t;
}
async function completeTask(id, actor = 'vilmar') {
  const t = S.tasks.find(x => x.id === id); if (!t) return null;
  t.status = 'concluida'; t.done = true; t.completedAt = now();
  await sset('tasks', S.tasks);
  await audit(actor, 'complete_task', 'Tarefa concluída: ' + t.title, { caseId: t.caseId, contactId: t.contactId });
  await emit('task.completed', { task: t, actor });
  return t;
}
const openTasks = () => S.tasks.filter(t => t.status === 'aberta');
const caseTasks = caseId => S.tasks.filter(t => t.caseId === caseId);

/* ---------- agenda ---------- */
function slotsForDate(dateStr) {
  const cfg = S.config.agenda;
  const d = new Date(dateStr + 'T12:00:00');
  if (!cfg.weekdays.includes(d.getDay())) return [];
  const out = [];
  for (let h = cfg.startHour; h < cfg.endHour; h += Math.max(1, Math.round(cfg.slotMin / 60))) {
    const t = String(h).padStart(2, '0') + ':00';
    const taken = S.appointments.some(a => a.date === dateStr && a.time === t && !['cancelado'].includes(a.status));
    out.push({ time: t, taken });
  }
  return out;
}
function checkCalendar(dateStr) { return slotsForDate(dateStr).filter(s => !s.taken).map(s => s.time); }
async function createAppointment(data, actor = 'vilmar') {
  const free = checkCalendar(data.date);
  if (!free.includes(data.time)) throw new Error('Horário indisponível em ' + data.date + ' às ' + data.time + '. Livres: ' + (free.join(', ') || 'nenhum'));
  const a = { id: uid(), title: data.title || 'Atendimento', contactId: data.contactId || '', caseId: data.caseId || '',
    date: data.date, time: data.time, durationMin: Number(data.durationMin) || S.config.agenda.slotMin, status: 'agendado',
    notes: data.notes || '', createdAt: now() };
  S.appointments.push(a);
  await sset('appointments', S.appointments);
  await audit(actor, 'create_appointment', `Reunião ${a.date} ${a.time} — ${a.title}`, { caseId: a.caseId, contactId: a.contactId });
  await emit('appointment.created', { appt: a, actor });
  return a;
}
async function setAppointmentStatus(id, status, actor = 'vilmar') {
  const a = S.appointments.find(x => x.id === id); if (!a) return null;
  a.status = status;
  await sset('appointments', S.appointments);
  await audit(actor, 'appointment_status', `Reunião ${a.date} ${a.time}: ${status}`, { caseId: a.caseId, contactId: a.contactId });
  if (status === 'realizado') await emit('appointment.done', { appt: a, actor });
  if (status === 'cancelado') await emit('appointment.cancelled', { appt: a, actor });
  return a;
}
async function rescheduleAppointment(id, date, time, actor = 'vilmar') {
  const a = S.appointments.find(x => x.id === id); if (!a) throw new Error('Compromisso não encontrado');
  const free = checkCalendar(date);
  if (!free.includes(time)) throw new Error('Horário indisponível. Livres em ' + date + ': ' + (free.join(', ') || 'nenhum'));
  a.date = date; a.time = time; a.status = 'remarcado';
  await sset('appointments', S.appointments);
  await audit(actor, 'reschedule_appointment', `Reunião remarcada para ${date} ${time}`, { caseId: a.caseId, contactId: a.contactId });
  await emit('appointment.created', { appt: a, actor, rescheduled: true });
  return a;
}

/* ---------- base de conhecimento ---------- */
const DEFAULT_KNOWLEDGE = [
  { title: 'Áreas de atuação', category: 'institucional', content: 'O escritório atua em: direito do consumidor, planos de saúde (com foco em saúde de crianças e adolescentes), direito bancário, golpes e fraudes, trabalhista, cível, empresarial e previdenciário.' },
  { title: 'Horário de atendimento', category: 'institucional', content: 'Atendimento humano de segunda a sexta, das 9h às 18h. O canal digital recebe mensagens 24h e a triagem inicial é feita a qualquer horário.' },
  { title: 'Como funciona o atendimento', category: 'procedimento', content: '1) Triagem inicial pelo canal digital; 2) coleta de informações e documentos; 3) análise pelo Dr. Vilmar; 4) proposta de honorários quando aplicável; 5) contratação e execução.' },
  { title: 'Honorários', category: 'regra', content: 'Valores de honorários NUNCA são informados pelo canal automatizado. Propostas são feitas apenas pelo advogado após análise do caso.' },
  { title: 'Documentos básicos', category: 'documentos', content: 'Para a maioria dos casos: documento de identidade (RG/CNH), CPF e comprovante de residência. Cada área possui documentos específicos adicionais.' },
];
async function ensureKnowledge() {
  if (S.knowledge.length) return;
  for (const kitem of DEFAULT_KNOWLEDGE) S.knowledge.push({ id: uid(), ...kitem, createdAt: now() });
  await sset('knowledge', S.knowledge);
}
function searchKnowledge(q) {
  const terms = String(q || '').toLowerCase().split(/\s+/).filter(w => w.length > 2);
  if (!terms.length) return S.knowledge.slice(0, 5);
  return S.knowledge.map(kitem => {
    const hay = (kitem.title + ' ' + kitem.category + ' ' + kitem.content).toLowerCase();
    return { kitem, score: terms.reduce((a, t) => a + (hay.includes(t) ? 1 : 0), 0) };
  }).filter(x => x.score > 0).sort((a, b) => b.score - a.score).slice(0, 5).map(x => x.kitem);
}

/* ---------- fluxos de triagem por área ---------- */
const DEFAULT_FLOWS = [
  { area: 'planos_de_saude', label: 'Planos de saúde',
    keywords: ['plano', 'saúde', 'saude', 'convênio', 'convenio', 'negou', 'negativa', 'cobertura', 'tratamento', 'cirurgia', 'medicamento', 'internação', 'home care', 'tea', 'autismo'],
    questions: ['Qual é o nome do paciente e a relação com você?', 'Qual tratamento/procedimento foi negado ou está pendente?', 'Quando ocorreu a negativa e como ela foi comunicada?', 'Existe prescrição/relatório médico? De qual data?', 'Qual é o plano de saúde e há quanto tempo é cliente?'],
    docs: ['Negativa do plano', 'Relatório médico', 'Carteirinha do plano', 'Documentos pessoais'],
    qualifyCriteria: 'Há negativa (formal ou informal) de cobertura de tratamento prescrito por médico.',
    priority: 'alta', targetStage: 'qualificado',
    guidance: 'Casos de saúde podem exigir urgência (risco à saúde). Se houver risco imediato, oriente procurar emergência e marque urgência crítica.',
    handoff: 'Risco à saúde, pedido de liminar/tutela, ou dúvida sobre viabilidade.' },
  { area: 'consumidor', label: 'Consumidor',
    keywords: ['produto', 'defeito', 'loja', 'compra', 'entrega', 'cancelamento', 'cobrança indevida', 'voo', 'viagem'],
    questions: ['O que aconteceu e quando?', 'Qual empresa está envolvida?', 'Você já tentou resolver diretamente? Tem protocolo?', 'Qual prejuízo você teve (valores)?'],
    docs: ['Prints de conversa', 'Comprovante de pagamento', 'Documentos pessoais'],
    qualifyCriteria: 'Relação de consumo com dano material ou moral identificável.',
    priority: 'normal', targetStage: 'qualificado', guidance: '', handoff: 'Negociação de acordo ou dúvida sobre viabilidade.' },
  { area: 'bancario', label: 'Bancário',
    keywords: ['banco', 'empréstimo', 'emprestimo', 'consignado', 'juros', 'financiamento', 'cartão', 'cartao', 'negativação', 'negativacao', 'serasa', 'spc'],
    questions: ['Qual banco/instituição?', 'O que aconteceu (empréstimo não reconhecido, juros abusivos, negativação...)?', 'Desde quando? Tem contratos ou extratos?', 'Houve desconto em benefício/folha?'],
    docs: ['Extrato bancário', 'Contrato', 'Documentos pessoais'],
    qualifyCriteria: 'Operação bancária irregular ou cobrança/negativação indevida.',
    priority: 'normal', targetStage: 'qualificado', guidance: '', handoff: 'Cálculos complexos ou proposta de acordo.' },
  { area: 'golpes_fraudes', label: 'Golpes e fraudes',
    keywords: ['golpe', 'fraude', 'pix', 'clonaram', 'clonado', 'hacker', 'invadiram', 'transferência', 'transferencia', 'whatsapp clonado'],
    questions: ['Como o golpe aconteceu? Descreva passo a passo.', 'Qual valor foi perdido e por qual meio (PIX, cartão, boleto)?', 'Quando aconteceu? Registrou boletim de ocorrência?', 'Já contatou o banco? Qual resposta?'],
    docs: ['Boletim de ocorrência', 'Comprovante de pagamento', 'Prints de conversa', 'Extrato bancário', 'Documentos pessoais'],
    qualifyCriteria: 'Prejuízo financeiro identificável com possibilidade de responsabilização (banco/plataforma).',
    priority: 'alta', targetStage: 'qualificado',
    guidance: 'Orientar registro imediato de B.O. e contestação junto ao banco (MED/PIX) — sem prometer recuperação.',
    handoff: 'Sempre que houver valores altos ou urgência de bloqueio.' },
  { area: 'trabalhista', label: 'Trabalhista',
    keywords: ['trabalho', 'demissão', 'demitido', 'rescisão', 'rescisao', 'verbas', 'fgts', 'hora extra', 'assédio', 'assedio', 'carteira assinada'],
    questions: ['Qual empresa e período trabalhado?', 'Qual é a situação (demissão, verbas, assédio...)?', 'Tinha carteira assinada?', 'Tem documentos (contracheques, CTPS, mensagens)?'],
    docs: ['Carteira de trabalho', 'Comprovante de pagamento', 'Prints de conversa', 'Documentos pessoais'],
    qualifyCriteria: 'Vínculo de trabalho com direito potencialmente violado dentro do prazo prescricional.',
    priority: 'normal', targetStage: 'qualificado', guidance: '', handoff: 'Estimativa de valores ou estratégia processual.' },
  { area: 'civel', label: 'Cível', keywords: ['contrato', 'indenização', 'indenizacao', 'vizinho', 'aluguel', 'imóvel', 'imovel', 'danos'],
    questions: ['Descreva a situação e as partes envolvidas.', 'Há contrato ou documento por escrito?', 'Qual resultado você espera?'],
    docs: ['Contrato', 'Documentos pessoais'], qualifyCriteria: 'Conflito civil com elementos mínimos de prova.',
    priority: 'normal', targetStage: 'qualificado', guidance: '', handoff: 'Análise de viabilidade.' },
  { area: 'empresarial', label: 'Empresarial', keywords: ['empresa', 'cnpj', 'sócio', 'socio', 'fornecedor', 'societário', 'societario'],
    questions: ['Qual é a empresa (nome/CNPJ)?', 'Qual é a demanda (contratos, sócios, cobrança...)?', 'Qual o porte e urgência?'],
    docs: ['Contrato', 'Documentos pessoais'], qualifyCriteria: 'Demanda empresarial com responsável identificado.',
    priority: 'normal', targetStage: 'qualificado', guidance: 'Cadastrar a empresa (PJ) além do contato.', handoff: 'Sempre — demandas empresariais exigem análise humana.' },
  { area: 'previdenciario', label: 'Previdenciário', keywords: ['inss', 'aposentadoria', 'benefício', 'beneficio', 'auxílio', 'auxilio', 'bpc', 'loas', 'perícia', 'pericia'],
    questions: ['Qual benefício você busca ou teve negado?', 'Já fez pedido no INSS? Qual resultado?', 'Tem laudos/documentos médicos?'],
    docs: ['Relatório médico', 'Documentos pessoais'], qualifyCriteria: 'Pedido administrativo feito ou viável.',
    priority: 'normal', targetStage: 'qualificado', guidance: '', handoff: 'Análise de tempo de contribuição ou perícia.' },
  { area: 'outras', label: 'Outras áreas', keywords: [],
    questions: ['Descreva sua situação com o máximo de detalhes.', 'Quando aconteceu?', 'O que você espera resolver?'],
    docs: ['Documentos pessoais'], qualifyCriteria: 'Encaminhar para análise humana.',
    priority: 'normal', targetStage: 'triagem', guidance: 'Acolher e coletar o essencial; não recusar de forma seca.', handoff: 'Sempre que a área não estiver mapeada.' },
];
async function ensureFlows() {
  if (S.triageFlows.length) return;
  for (const f of DEFAULT_FLOWS) S.triageFlows.push({ id: uid(), ...f });
  await sset('triageFlows', S.triageFlows);
}
function detectArea(text) {
  const t = String(text || '').toLowerCase();
  let best = null, bestScore = 0;
  for (const f of S.triageFlows) {
    const score = (f.keywords || []).reduce((a, kw) => a + (t.includes(kw) ? 1 : 0), 0);
    if (score > bestScore) { best = f; bestScore = score; }
  }
  return best || S.triageFlows.find(f => f.area === 'outras') || null;
}
const flowByArea = area => S.triageFlows.find(f => f.area === area) || null;

/* ---------- histórico (timeline) ---------- */
function timelineFor({ contactId, caseId }) {
  const out = [];
  for (const a of S.auditLog) if ((caseId && a.caseId === caseId) || (!caseId && contactId && a.contactId === contactId))
    out.push({ at: a.at, text: `${a.actor === 'ia' ? '🤖' : a.actor === 'sistema' ? '⚙' : '👤'} ${a.detail || a.action}` });
  for (const t of S.tasks) if ((caseId && t.caseId === caseId) || (!caseId && contactId && t.contactId === contactId))
    out.push({ at: t.createdAt, text: '☑ Tarefa: ' + t.title + (t.status === 'concluida' ? ' (concluída)' : '') });
  for (const ap of S.appointments) if ((caseId && ap.caseId === caseId) || (!caseId && contactId && ap.contactId === contactId))
    out.push({ at: ap.createdAt, text: `📅 Reunião ${dateBRsafe(ap.date)} ${ap.time} (${ap.status})` });
  return out.sort((a, b) => (b.at || '').localeCompare(a.at || '')).slice(0, 60);
}
const dateBRsafe = v => { try { return N.dateBR(v); } catch (e) { return v; } };

Object.assign(N, { ensurePipeline, stages, stageName, stageIndex, ORIGINS, originLabel,
  findContact, createContact, updateContact, touchContact, contactById, contactCases,
  findCompany, createCompany, linkContactCompany,
  createCase, updateCase, moveCase, caseById, openCaseForContact,
  DOC_CATEGORIES, suggestDocCategory, requestDocuments, registerDocument, setDocStatus, checkDocsComplete, caseDocs,
  createTask, completeTask, openTasks, caseTasks,
  slotsForDate, checkCalendar, createAppointment, setAppointmentStatus, rescheduleAppointment,
  ensureKnowledge, searchKnowledge, ensureFlows, detectArea, flowByArea, timelineFor });
})();
