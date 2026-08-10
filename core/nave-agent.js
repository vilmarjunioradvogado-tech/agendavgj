'use strict';

const { uid, now, findContact, upsertContact, createCase, createTask, moveCase, audit, normalizePhone } = require('./nave-core');

const HUMAN_REQUIRED = new Set([
  'DECISAO_JURIDICA',
  'NEGOCIACAO_HONORARIOS',
  'CONTRATO',
  'ACORDO',
  'AMEACA_RECLAMACAO',
  'SITUACAO_FORA_ESCOPO',
  'URGENTE',
]);

function classifyMessage(text = '') {
  const t = String(text).toLowerCase();
  if (/negou|negativa|plano de sa[uú]de|unimed|tratamento/.test(t)) return { area: 'PLANOS_DE_SAUDE', intent: 'NEGATIVA_COBERTURA' };
  if (/golpe|fraude|pix|clonad|estelionat/.test(t)) return { area: 'GOLPES_FRAUDES', intent: 'FRAUDE' };
  if (/cobran[cç]a|banco|cart[aã]o|conta/.test(t)) return { area: 'BANCARIO', intent: 'BANCARIO' };
  if (/trabalho|demiss[aã]o|sal[aá]rio|fgts/.test(t)) return { area: 'TRABALHISTA', intent: 'TRABALHISTA' };
  if (/contrato|empresa|s[oó]cio|cnpj/.test(t)) return { area: 'EMPRESARIAL', intent: 'EMPRESARIAL' };
  if (/processo|audi[eê]ncia|prazo|intima[cç][aã]o/.test(t)) return { area: 'CIVEL', intent: 'PROCESSUAL' };
  return { area: 'OUTRA', intent: 'OUTRO' };
}

function inferUrgency(text = '') {
  const t = String(text).toLowerCase();
  if (/hoje|amanh[aã]|urgente|liminar|prazo|audi[eê]ncia|risco imediato|bloquead/.test(t)) return 'alta';
  if (/esta semana|negativa|cobran[cç]a|golpe/.test(t)) return 'media';
  return 'normal';
}

function safeReply() {
  return 'Recebi as informações. Vou organizar o atendimento e verificar os próximos dados necessários. Quando a análise depender de uma decisão jurídica, o caso será encaminhado para o advogado responsável.';
}

/**
 * Runs deterministic CRM work around an AI decision.
 * The model itself is intentionally injected by the caller; this module never invents legal conclusions.
 */
function processInbound({ state, message, aiDecision = null, actor = 'agent' }) {
  if (!state || !message) throw new Error('state e message são obrigatórios');
  const text = String(message.text || '').trim();
  const phone = normalizePhone(message.phone || message.from);
  if (!text) throw new Error('Mensagem vazia');

  const classification = classifyMessage(text);
  const urgency = aiDecision?.urgency || inferUrgency(text);
  const needsHuman = Boolean(aiDecision?.transferToVilmar) || HUMAN_REQUIRED.has(aiDecision?.reason) || urgency === 'alta' || aiDecision?.status === 'encaminhar_humano';

  const { contact } = upsertContact(state, {
    phone,
    name: aiDecision?.contactName || message.name || 'Contato WhatsApp',
    source: message.source || 'whatsapp',
  }, actor);

  let currentCase = state.cases.find(c => c.contactId === contact.id && c.stage !== 'CONCLUIDO' && c.stage !== 'PERDIDO');
  if (!currentCase) {
    currentCase = createCase(state, {
      contactId: contact.id,
      title: aiDecision?.title || classification.intent,
      area: aiDecision?.area || classification.area,
      subject: aiDecision?.subject || classification.intent,
      source: 'whatsapp',
      urgency,
      priority: urgency === 'alta' ? 'alta' : 'normal',
      summary: aiDecision?.summary || text.slice(0, 1000),
      stage: 'TRIAGEM',
    }, actor);
  }

  if (Array.isArray(aiDecision?.missingDocuments) && aiDecision.missingDocuments.length) {
    currentCase.missingDocuments = [...new Set(aiDecision.missingDocuments.map(String))];
    moveCase(state, currentCase.id, 'AGUARDANDO_DOCUMENTOS', actor);
  }

  if (needsHuman) {
    moveCase(state, currentCase.id, 'ANALISE_VILMAR', actor);
    createTask(state, {
      title: `Analisar atendimento: ${contact.name}`,
      contactId: contact.id,
      caseId: currentCase.id,
      priority: urgency === 'alta' ? 'alta' : 'normal',
      source: 'agent_handoff',
    }, actor);
  }

  audit(state, actor, 'INBOUND_PROCESSED', currentCase.id, {
    contactId: contact.id,
    urgency,
    needsHuman,
    classification,
  });

  return {
    contact,
    case: currentCase,
    needsHuman,
    status: needsHuman ? 'AGUARDANDO_VILMAR' : 'AUTOMACAO_CONTINUA',
    reply: aiDecision?.reply || safeReply(),
  };
}

function buildHumanBrief({ state, caseId }) {
  const c = state.cases.find(x => x.id === caseId);
  if (!c) throw new Error('Demanda não encontrada');
  const contact = state.contacts.find(x => x.id === c.contactId);
  const messages = state.messages.filter(m => m.caseId === caseId).slice(-20);
  return {
    title: c.title,
    client: contact?.name || 'Não identificado',
    phone: contact?.phone || '',
    area: c.area,
    urgency: c.urgency,
    stage: c.stage,
    summary: c.summary,
    missingDocuments: c.missingDocuments || [],
    lastMessages: messages.map(m => ({ at: m.at, direction: m.direction, text: m.text })),
    nextAction: 'Análise e decisão jurídica por Vilmar.',
  };
}

module.exports = { classifyMessage, inferUrgency, processInbound, buildHumanBrief, HUMAN_REQUIRED };
