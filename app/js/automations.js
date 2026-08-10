/* NAVE — motor de automações: eventos -> ações configuráveis + varreduras agendadas */
(() => {
'use strict';
const N = window.NAVE, S = N.state;
const { uid, today, now, addDays, daysDiff, emit, on, audit, sset, createTask, moveCase, requestDocuments, flowByArea, dateBR } = N;

const TRIGGERS = {
  'case.created': 'Nova demanda criada',
  'contact.created': 'Novo contato criado',
  'case.stage_changed': 'Demanda mudou de estágio',
  'document.requested': 'Documentos solicitados',
  'document.received': 'Documento recebido',
  'document.complete': 'Documentação completa',
  'appointment.created': 'Reunião agendada',
  'appointment.done': 'Reunião realizada',
  'handoff.human': 'Conversa encaminhada para humano',
  'sweep.no_response': 'Cliente sem resposta (varredura)',
  'sweep.docs_pending': 'Documentação incompleta (varredura)',
  'sweep.deadline': 'Prazo próximo (varredura)',
  'sweep.appointment_tomorrow': 'Reunião amanhã (varredura)',
};
const ACTIONS = {
  create_task: 'Criar tarefa',
  move_stage: 'Mover para estágio',
  send_whatsapp: 'Enviar WhatsApp (modelo)',
  request_flow_docs: 'Solicitar documentos da área',
  notify_vilmar: 'Criar pendência para Vilmar',
};

const DEFAULT_AUTOMATIONS = [
  { key: 'novo_lead_triagem', name: 'Novo lead → iniciar triagem', trigger: 'case.created', enabled: true,
    actions: [{ type: 'move_stage', stage: 'triagem', onlyFrom: 'novo_contato' }] },
  { key: 'docs_completos_avancar', name: 'Documentação completa → avançar estágio + tarefa de análise', trigger: 'document.complete', enabled: true,
    actions: [{ type: 'move_stage', stage: 'documentacao_completa' }, { type: 'create_task', title: 'Analisar documentação de {cliente}', priority: 'alta' }] },
  { key: 'docs_solicitados_estagio', name: 'Documentos solicitados → estágio "Aguardando documentos"', trigger: 'document.requested', enabled: true,
    actions: [{ type: 'move_stage', stage: 'aguardando_documentos', onlyBefore: 'documentacao_completa' }] },
  { key: 'reuniao_lembrete', name: 'Reunião agendada → criar lembrete', trigger: 'appointment.created', enabled: true,
    actions: [{ type: 'create_task', title: 'Preparar reunião com {cliente} em {data}', priority: 'normal' }] },
  { key: 'reuniao_realizada_analise', name: 'Reunião realizada → tarefa de análise/retorno', trigger: 'appointment.done', enabled: true,
    actions: [{ type: 'create_task', title: 'Registrar desdobramentos da reunião com {cliente}', priority: 'normal' }] },
  { key: 'contratacao_estrutura', name: 'Contratação → tarefas de estruturação', trigger: 'case.stage_changed', toStage: 'contratacao', enabled: true,
    actions: [{ type: 'create_task', title: 'Emitir contrato e procuração de {cliente}', priority: 'alta' }, { type: 'create_task', title: 'Abrir pasta e estrutura do caso de {cliente}', priority: 'normal' }] },
  { key: 'handoff_pendencia', name: 'Encaminhado para humano → pendência para Vilmar', trigger: 'handoff.human', enabled: true,
    actions: [{ type: 'notify_vilmar', title: 'Analisar conversa de {cliente} ({motivo})', priority: 'alta' }] },
  { key: 'sem_resposta_followup', name: 'Cliente sem resposta há 2 dias → follow-up', trigger: 'sweep.no_response', enabled: true, days: 2,
    actions: [{ type: 'create_task', title: 'Follow-up: {cliente} sem resposta', priority: 'normal' },
              { type: 'send_whatsapp', template: 'Olá, {nome}. Passando para saber se conseguiu ver nossa última mensagem. Seguimos à disposição para dar andamento ao seu caso.' }] },
  { key: 'docs_pendentes_cobranca', name: 'Documentação incompleta há 3 dias → solicitar pendentes', trigger: 'sweep.docs_pending', enabled: true, days: 3,
    actions: [{ type: 'send_whatsapp', template: 'Olá, {nome}. Para darmos andamento ao seu caso ainda precisamos de: {docs}. Pode nos enviar por aqui mesmo?' },
              { type: 'create_task', title: 'Cobrar documentos de {cliente}', priority: 'normal' }] },
  { key: 'prazo_proximo_alerta', name: 'Prazo em até 3 dias → alertar responsável', trigger: 'sweep.deadline', enabled: true, days: 3,
    actions: [{ type: 'notify_vilmar', title: 'PRAZO PRÓXIMO: {titulo} em {data}', priority: 'alta' }] },
  { key: 'reuniao_amanha_confirmar', name: 'Reunião amanhã → confirmar com cliente', trigger: 'sweep.appointment_tomorrow', enabled: true,
    actions: [{ type: 'send_whatsapp', template: 'Olá, {nome}. Confirmando nossa reunião amanhã às {hora}. Podemos contar com sua presença?' },
              { type: 'create_task', title: 'Confirmar reunião de amanhã com {cliente}', priority: 'alta' }] },
];

async function ensureAutomations() {
  let changed = false;
  for (const def of DEFAULT_AUTOMATIONS) {
    if (!S.automations.find(a => a.key === def.key)) { S.automations.push({ id: uid(), ...N.clone(def) }); changed = true; }
  }
  if (changed) await sset('automations', S.automations);
}

function fill(tpl, ctx) {
  return String(tpl || '')
    .replace(/\{cliente\}|\{nome\}/g, ctx.contactName || 'cliente')
    .replace(/\{data\}/g, ctx.date || '')
    .replace(/\{hora\}/g, ctx.time || '')
    .replace(/\{docs\}/g, ctx.docs || '')
    .replace(/\{motivo\}/g, ctx.reason || '')
    .replace(/\{titulo\}/g, ctx.title || '');
}

async function runActions(auto, payload, ctx) {
  for (const act of (auto.actions || [])) {
    try {
      if (act.type === 'create_task' || act.type === 'notify_vilmar') {
        await createTask({ title: fill(act.title, ctx), priority: act.priority || 'normal', due: today(),
          contactId: ctx.contactId || '', caseId: ctx.caseId || '', origin: 'automacao:' + auto.key, dedupeTitle: true }, 'sistema');
      } else if (act.type === 'move_stage' && ctx.caseId) {
        const k = N.caseById(ctx.caseId);
        if (k) {
          if (act.onlyFrom && k.stageId !== act.onlyFrom) continue;
          if (act.onlyBefore && N.stageIndex(k.stageId) >= N.stageIndex(act.onlyBefore)) continue;
          if (k.stageId !== act.stage) await moveCase(ctx.caseId, act.stage, 'sistema');
        }
      } else if (act.type === 'send_whatsapp' && ctx.phone) {
        await N.waSend(ctx.phone, fill(act.template, ctx), { silent: true, actor: 'sistema' });
      } else if (act.type === 'request_flow_docs' && ctx.caseId) {
        const k = N.caseById(ctx.caseId); const flow = k && flowByArea(k.area);
        if (flow) await requestDocuments(ctx.caseId, flow.docs, 'sistema');
      }
    } catch (e) { console.error('automação ' + auto.key, e); }
  }
  await audit('sistema', 'automation', 'Automação executada: ' + auto.name, { caseId: ctx.caseId || '', contactId: ctx.contactId || '' });
}

function ctxFrom(payload) {
  const kase = payload.kase || (payload.doc && N.caseById(payload.doc.caseId)) || (payload.appt && N.caseById(payload.appt.caseId)) || (payload.task && N.caseById(payload.task.caseId)) || null;
  const contactId = payload.contact?.id || kase?.contactId || payload.appt?.contactId || payload.doc?.contactId || payload.contactId || '';
  const contact = N.contactById(contactId);
  return {
    caseId: kase?.id || '', contactId, contactName: contact?.name || '', phone: contact?.whatsapp || contact?.phone || '',
    date: payload.appt ? dateBR(payload.appt.date) : (payload.date || ''), time: payload.appt?.time || payload.time || '',
    docs: payload.docs ? payload.docs.map(d => d.name).join(', ') : (payload.docsList || ''), reason: payload.reason || '', title: payload.title || kase?.title || ''
  };
}

function installEngine() {
  for (const trig of Object.keys(TRIGGERS)) {
    on(trig, async (payload) => {
      for (const auto of S.automations.filter(a => a.enabled && a.trigger === trig)) {
        if (trig === 'case.stage_changed' && auto.toStage && payload.to !== auto.toStage) continue;
        await runActions(auto, payload, ctxFrom(payload));
      }
    });
  }
}

/* ---------- varreduras agendadas (follow-up, docs, prazos, reuniões) ---------- */
let lastSweepDay = '';
async function runSweeps(force = false) {
  if (!force && lastSweepDay === today()) return;
  lastSweepDay = today();
  const noRespAuto = S.automations.find(a => a.key === 'sem_resposta_followup' && a.enabled);
  if (noRespAuto) {
    for (const ch of S.whatsappChats) {
      if (ch.aiMode === 'humano' || !ch.contactId) continue;
      const msgs = S.whatsappMessages.filter(m => m.chatId === ch.id);
      const last = msgs[msgs.length - 1];
      if (!last || last.direction !== 'out') continue;
      const days = Math.floor((Date.now() - new Date(last.at).getTime()) / 86400000);
      if (days >= (noRespAuto.days || 2) && ch.lastNoRespSweep !== today()) {
        ch.lastNoRespSweep = today();
        await emit('sweep.no_response', { contactId: ch.contactId, kase: N.openCaseForContact(ch.contactId) });
      }
    }
    await sset('whatsappChats', S.whatsappChats);
  }
  const docsAuto = S.automations.find(a => a.key === 'docs_pendentes_cobranca' && a.enabled);
  if (docsAuto) {
    const byCase = {};
    for (const d of S.documents.filter(d => d.status === 'pendente' && d.requestedAt)) {
      const days = Math.floor((Date.now() - new Date(d.requestedAt).getTime()) / 86400000);
      if (days >= (docsAuto.days || 3)) (byCase[d.caseId] = byCase[d.caseId] || []).push(d);
    }
    for (const [caseId, docs] of Object.entries(byCase)) {
      const k = N.caseById(caseId);
      if (!k || k.lastDocsSweep === today()) continue;
      k.lastDocsSweep = today();
      await emit('sweep.docs_pending', { kase: k, docsList: docs.map(d => d.name).join(', ') });
    }
    await sset('cases', S.cases);
  }
  const dlAuto = S.automations.find(a => a.key === 'prazo_proximo_alerta' && a.enabled);
  if (dlAuto) {
    for (const d of S.deadlines) {
      const diff = daysDiff(d.date);
      if (diff >= 0 && diff <= (dlAuto.days || 3) && d.lastSweep !== today()) {
        d.lastSweep = today();
        await emit('sweep.deadline', { title: d.title, date: dateBR(d.date) });
      }
    }
    for (const k of S.cases.filter(k => k.status === 'aberto' && k.dueDate)) {
      const diff = daysDiff(k.dueDate);
      if (diff >= 0 && diff <= (dlAuto.days || 3) && k.lastDueSweep !== today()) {
        k.lastDueSweep = today();
        await emit('sweep.deadline', { title: 'Demanda: ' + k.title, date: dateBR(k.dueDate), kase: k });
      }
    }
    await Promise.all([sset('deadlines', S.deadlines), sset('cases', S.cases)]);
  }
  const apptAuto = S.automations.find(a => a.key === 'reuniao_amanha_confirmar' && a.enabled);
  if (apptAuto) {
    const tomorrow = addDays(today(), 1);
    for (const a of S.appointments.filter(a => a.date === tomorrow && ['agendado', 'remarcado'].includes(a.status) && a.lastSweep !== today())) {
      a.lastSweep = today();
      await emit('sweep.appointment_tomorrow', { appt: a, time: a.time });
    }
    await sset('appointments', S.appointments);
  }
}

Object.assign(N, { TRIGGERS, ACTIONS, ensureAutomations, installEngine, runSweeps });
})();
