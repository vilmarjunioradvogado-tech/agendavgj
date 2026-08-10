/* NAVE — agente de IA autônomo: motor de ações (tools), orquestrador, resumo para Vilmar, aprovações */
(() => {
'use strict';
const N = window.NAVE, S = N.state;
const { uid, today, now, addDays, esc, emit, audit, sset, iaCan, apiFetch, dateBR } = N;

const aiConfigured = () => !!String(S.config.anthropicApiKey || '').trim();

/* ---------- chamada ao modelo (com cérebro de teste injetável) ---------- */
async function llm(payload) {
  if (typeof window.__NAVE_TEST_BRAIN === 'function') return await window.__NAVE_TEST_BRAIN(payload);
  const key = String(S.config.anthropicApiKey || '').trim();
  if (!key) throw new Error('Configure a chave da API Anthropic em Configurações (⚙) para usar a IA.');
  const body = { model: String(S.config.aiModel || 'claude-sonnet-4-6').trim() || 'claude-sonnet-4-6', max_tokens: payload.max_tokens || 1500,
    system: payload.system, messages: payload.messages };
  if (payload.tools) body.tools = payload.tools;
  const r = await apiFetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
    body: JSON.stringify(body)
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j?.error?.message || ('IA indisponível (' + r.status + ')'));
  return j;
}

/* ---------- motor de ações (item 27): definição + implementação + validação + autorização ---------- */
const str = (d) => ({ type: 'string', description: d });
const TOOL_DEFS = [
  { name: 'find_contact', description: 'Busca um contato no CRM por telefone, CPF, e-mail ou nome. Sempre use antes de criar contato, para evitar duplicidade.', input_schema: { type: 'object', properties: { phone: str('telefone com DDD'), cpf: str('CPF'), email: str('e-mail'), name: str('nome') } } },
  { name: 'create_contact', description: 'Cria um contato (pessoa física) no CRM. Só use se find_contact não encontrar.', input_schema: { type: 'object', properties: { name: str('nome completo'), phone: str('telefone'), email: str('e-mail'), cpf: str('CPF'), origin: str('origem do lead: whatsapp|instagram|google|meta_ads|tiktok|youtube|indicacao|site|organico|outro'), notes: str('observações') }, required: ['name'] } },
  { name: 'update_contact', description: 'Atualiza dados do contato atual (nome, e-mail, CPF, origem, observações, próxima ação).', input_schema: { type: 'object', properties: { name: str('nome'), email: str('e-mail'), cpf: str('CPF'), origin: str('origem'), notes: str('observações'), nextAction: str('próxima ação') } } },
  { name: 'create_case', description: 'Cria uma NOVA demanda jurídica para o contato atual. Cada assunto diferente é uma demanda separada — nunca misture demandas.', input_schema: { type: 'object', properties: { title: str('título curto da demanda'), area: str('área: planos_de_saude|consumidor|bancario|golpes_fraudes|trabalhista|civel|empresarial|previdenciario|outras'), subject: str('assunto detalhado'), urgency: str('baixa|normal|alta|critica') }, required: ['title', 'area'] } },
  { name: 'update_case', description: 'Atualiza a demanda atual: registra respostas de triagem, urgência, observações, próxima ação.', input_schema: { type: 'object', properties: { subject: str('assunto'), urgency: str('baixa|normal|alta|critica'), notes: str('observações'), nextAction: str('próxima ação'), triageAnswer: str('resposta de triagem no formato "Pergunta => Resposta"') } } },
  { name: 'move_pipeline', description: 'Move a demanda atual para outro estágio do funil.', input_schema: { type: 'object', properties: { stage: str('id do estágio destino') }, required: ['stage'] } },
  { name: 'create_task', description: 'Cria uma tarefa/pendência (por padrão para Vilmar).', input_schema: { type: 'object', properties: { title: str('título da tarefa'), desc: str('detalhes'), priority: str('baixa|normal|alta'), due: str('prazo AAAA-MM-DD') }, required: ['title'] } },
  { name: 'complete_task', description: 'Conclui uma tarefa pelo id.', input_schema: { type: 'object', properties: { taskId: str('id da tarefa') }, required: ['taskId'] } },
  { name: 'request_document', description: 'Registra a solicitação de documentos ao cliente para a demanda atual (também informe o cliente via send_message).', input_schema: { type: 'object', properties: { documents: { type: 'array', items: { type: 'string' }, description: 'lista de documentos necessários' } }, required: ['documents'] } },
  { name: 'register_document', description: 'Registra que o cliente enviou um documento (nome do arquivo/descrição). O sistema sugere a categoria.', input_schema: { type: 'object', properties: { name: str('nome do documento/arquivo'), category: str('categoria, se souber') }, required: ['name'] } },
  { name: 'check_calendar', description: 'Consulta horários livres na agenda em uma data (AAAA-MM-DD) ou nos próximos dias úteis.', input_schema: { type: 'object', properties: { date: str('data AAAA-MM-DD (opcional)') } } },
  { name: 'create_appointment', description: 'Agenda uma reunião/atendimento em um horário livre confirmado pelo cliente.', input_schema: { type: 'object', properties: { date: str('data AAAA-MM-DD'), time: str('hora HH:00'), title: str('título') }, required: ['date', 'time'] } },
  { name: 'reschedule_appointment', description: 'Remarca uma reunião existente.', input_schema: { type: 'object', properties: { appointmentId: str('id do compromisso'), date: str('nova data AAAA-MM-DD'), time: str('nova hora HH:00') }, required: ['appointmentId', 'date', 'time'] } },
  { name: 'send_message', description: 'Envia mensagem de WhatsApp ao cliente da conversa atual. TODA fala com o cliente passa por aqui.', input_schema: { type: 'object', properties: { text: str('texto da mensagem') }, required: ['text'] } },
  { name: 'handoff_to_human', description: 'Transfere a conversa para Vilmar (análise humana) e para de agir. Use para: dúvida jurídica, honorários, contratação, urgência crítica, insatisfação, ameaça, situação fora do escopo ou não prevista.', input_schema: { type: 'object', properties: { reason: str('motivo do encaminhamento'), urgency: str('baixa|normal|alta|critica') }, required: ['reason'] } },
  { name: 'generate_case_summary', description: 'Gera o resumo estruturado da demanda atual para análise de Vilmar.', input_schema: { type: 'object', properties: {} } },
  { name: 'search_knowledge', description: 'Consulta a base de conhecimento do escritório (serviços, procedimentos, documentos, regras).', input_schema: { type: 'object', properties: { query: str('o que procurar') }, required: ['query'] } },
];

/* implementações — recebem (input, ctx) e retornam string para o modelo */
const IMPL = {
  async find_contact(input) {
    const c = N.findContact(input);
    return c ? JSON.stringify({ found: true, id: c.id, name: c.name, phone: c.phone, status: c.status, demandas: N.contactCases(c.id).map(k => ({ id: k.id, title: k.title, stage: k.stageId, status: k.status })) })
      : JSON.stringify({ found: false });
  },
  async create_contact(input, ctx) {
    const c = await N.createContact({ ...input, phone: input.phone || ctx.phone, origin: input.origin || 'whatsapp' }, 'ia');
    if (ctx.chat) { ctx.chat.contactId = c.id; await sset('whatsappChats', S.whatsappChats); }
    ctx.contact = c;
    return 'Contato ' + c.name + ' (id ' + c.id + ') pronto.';
  },
  async update_contact(input, ctx) {
    if (!ctx.contact) return 'Nenhum contato vinculado a esta conversa.';
    await N.updateContact(ctx.contact.id, input, 'ia');
    return 'Contato atualizado.';
  },
  async create_case(input, ctx) {
    if (!ctx.contact) return 'Crie/identifique o contato antes da demanda.';
    const k = await N.createCase({ ...input, contactId: ctx.contact.id, origin: ctx.contact.origin || 'whatsapp' }, 'ia');
    ctx.kase = k;
    if (ctx.chat) { ctx.chat.caseId = k.id; await sset('whatsappChats', S.whatsappChats); }
    return 'Demanda criada (id ' + k.id + '), estágio ' + N.stageName(k.stageId) + '.';
  },
  async update_case(input, ctx) {
    if (!ctx.kase) return 'Nenhuma demanda ativa. Use create_case primeiro.';
    const data = { ...input };
    if (input.triageAnswer) { data.triageAnswers = [...(ctx.kase.triageAnswers || []), input.triageAnswer]; delete data.triageAnswer; }
    await N.updateCase(ctx.kase.id, data, 'ia');
    return 'Demanda atualizada.';
  },
  async move_pipeline(input, ctx) {
    if (!ctx.kase) return 'Nenhuma demanda ativa.';
    await N.moveCase(ctx.kase.id, input.stage, 'ia');
    return 'Demanda movida para ' + N.stageName(input.stage) + '.';
  },
  async create_task(input, ctx) {
    const t = await N.createTask({ title: input.title, desc: input.desc, priority: input.priority, due: input.due || today(),
      contactId: ctx.contact?.id || '', caseId: ctx.kase?.id || '', origin: 'ia' }, 'ia');
    return t ? 'Tarefa criada.' : 'Tarefa idêntica já existia.';
  },
  async complete_task(input) { const t = await N.completeTask(input.taskId, 'ia'); return t ? 'Tarefa concluída.' : 'Tarefa não encontrada.'; },
  async request_document(input, ctx) {
    if (!ctx.kase) return 'Nenhuma demanda ativa para vincular documentos.';
    const docs = await N.requestDocuments(ctx.kase.id, input.documents, 'ia');
    return 'Solicitação registrada: ' + (docs.map(d => d.name).join(', ') || 'itens já constavam') + '. Lembre de pedir ao cliente via send_message.';
  },
  async register_document(input, ctx) {
    const d = await N.registerDocument({ caseId: ctx.kase?.id || '', contactId: ctx.contact?.id || '', name: input.name, category: input.category, source: 'whatsapp' }, 'ia');
    return `Documento registrado: ${d.name} → categoria ${d.category}.`;
  },
  async check_calendar(input) {
    const dates = input.date ? [input.date] : [1, 2, 3, 4, 5].map(n => addDays(today(), n));
    const out = dates.map(d => ({ date: d, free: N.checkCalendar(d) })).filter(x => x.free.length);
    return out.length ? JSON.stringify(out) : 'Sem horários livres nos dias consultados.';
  },
  async create_appointment(input, ctx) {
    const a = await N.createAppointment({ ...input, title: input.title || ('Atendimento — ' + (ctx.contact?.name || 'cliente')),
      contactId: ctx.contact?.id || '', caseId: ctx.kase?.id || '' }, 'ia');
    return `Reunião agendada para ${dateBR(a.date)} às ${a.time}.`;
  },
  async reschedule_appointment(input) {
    const a = await N.rescheduleAppointment(input.appointmentId, input.date, input.time, 'ia');
    return `Reunião remarcada para ${dateBR(a.date)} às ${a.time}.`;
  },
  async send_message(input, ctx) {
    if (!ctx.phone) return 'Conversa sem telefone associado.';
    const ok = await N.waSend(ctx.phone, input.text, { silent: true, actor: 'ia' });
    if (ok && ctx.chat) { ctx.repliedInRun = true; }
    return ok ? 'Mensagem enviada.' : 'Falha no envio.';
  },
  async handoff_to_human(input, ctx) {
    if (ctx.chat) {
      ctx.chat.status = 'aguardando_vilmar';
      ctx.chat.agentStatus = 'aguardando_vilmar';
      ctx.chat.agentUrgency = input.urgency || ctx.kase?.urgency || 'normal';
      ctx.chat.agentSummary = input.reason || '';
      await sset('whatsappChats', S.whatsappChats);
    }
    if (ctx.kase) await generateCaseSummary(ctx.kase.id, 'ia');
    await audit('ia', 'handoff_to_human', 'Encaminhado para Vilmar: ' + (input.reason || ''), { caseId: ctx.kase?.id || '', contactId: ctx.contact?.id || '' });
    await emit('handoff.human', { contact: ctx.contact, kase: ctx.kase, reason: input.reason || 'análise humana', contactId: ctx.contact?.id });
    ctx.handoff = true;
    return 'Conversa marcada como AGUARDANDO VILMAR. Não aja mais nesta conversa; apenas informe o cliente de que o caso seguiu para análise.';
  },
  async generate_case_summary(_input, ctx) {
    if (!ctx.kase) return 'Nenhuma demanda ativa.';
    const s = await generateCaseSummary(ctx.kase.id, 'ia');
    return 'Resumo gerado:\n' + s;
  },
  async search_knowledge(input) {
    const hits = N.searchKnowledge(input.query);
    return hits.length ? hits.map(h => `# ${h.title}\n${h.content}`).join('\n\n') : 'Nada encontrado na base de conhecimento.';
  },
};

/* execução com validação + autorização + auditoria */
async function runTool(name, input, ctx) {
  const impl = IMPL[name];
  if (!impl) return 'Ferramenta desconhecida: ' + name;
  const perm = iaCan(name);
  if (ctx.actor === 'ia' && perm === 'block') {
    await audit('ia', name, 'BLOQUEADO pela política de permissões', { result: 'bloqueado', caseId: ctx.kase?.id || '', contactId: ctx.contact?.id || '' });
    return 'Ação bloqueada pela política do escritório. Encaminhe para Vilmar se necessário.';
  }
  if (ctx.actor === 'ia' && perm === 'approve') {
    await N.createTask({ title: `Aprovar ação da IA: ${name}`, desc: JSON.stringify(input), kind: 'aprovacao',
      payload: { tool: name, input, contactId: ctx.contact?.id || '', caseId: ctx.kase?.id || '', chatId: ctx.chat?.id || '' },
      priority: 'alta', contactId: ctx.contact?.id || '', caseId: ctx.kase?.id || '', origin: 'ia' }, 'ia');
    await audit('ia', name, 'Ação registrada para aprovação de Vilmar', { result: 'aguardando_aprovacao', caseId: ctx.kase?.id || '', contactId: ctx.contact?.id || '' });
    return 'Esta ação exige aprovação humana. Uma pendência foi criada para Vilmar; informe o cliente de que a equipe vai confirmar.';
  }
  try { return String(await impl(input || {}, ctx)); }
  catch (e) { await audit(ctx.actor || 'ia', name, 'ERRO: ' + e.message, { result: 'erro' }); return 'Erro ao executar ' + name + ': ' + e.message; }
}

/* aprovação humana de ações pendentes */
async function approveAction(taskId) {
  const t = S.tasks.find(x => x.id === taskId);
  if (!t || t.kind !== 'aprovacao' || !t.payload) return null;
  const ctx = { actor: 'vilmar', contact: N.contactById(t.payload.contactId), kase: N.caseById(t.payload.caseId),
    chat: S.whatsappChats.find(c => c.id === t.payload.chatId) || null, phone: '' };
  ctx.phone = ctx.contact?.whatsapp || ctx.contact?.phone || '';
  const result = await IMPL[t.payload.tool](t.payload.input || {}, ctx).catch(e => 'Erro: ' + e.message);
  await audit('vilmar', 'approve_action', `Aprovou ${t.payload.tool}: ${result}`, { caseId: t.caseId, contactId: t.contactId });
  await N.completeTask(taskId, 'vilmar');
  return result;
}
async function rejectAction(taskId) {
  const t = S.tasks.find(x => x.id === taskId);
  if (!t) return;
  await audit('vilmar', 'reject_action', 'Rejeitou ação da IA: ' + t.title, { caseId: t.caseId, contactId: t.contactId });
  await N.completeTask(taskId, 'vilmar');
}

/* ---------- resumo estruturado para Vilmar (determinístico — nunca inventa) ---------- */
async function generateCaseSummary(caseId, actor = 'sistema') {
  const k = N.caseById(caseId); if (!k) throw new Error('Demanda não encontrada');
  const c = N.contactById(k.contactId);
  const docs = N.caseDocs(caseId);
  const flow = N.flowByArea(k.area);
  const recebidos = docs.filter(d => ['recebido', 'aprovado'].includes(d.status)).map(d => `- ${d.name} (${d.category})`);
  const pendentes = docs.filter(d => d.status === 'pendente').map(d => `- ${d.name}`);
  const pontos = [];
  if (flow?.qualifyCriteria) pontos.push('- Critério de qualificação: ' + flow.qualifyCriteria);
  if (flow?.handoff) pontos.push('- Atenção: ' + flow.handoff);
  if (pendentes.length) pontos.push('- Documentos ainda pendentes (ver lista).');
  if (k.urgency === 'critica' || k.urgency === 'alta') pontos.push('- Urgência ' + k.urgency + ' — avaliar necessidade de medida imediata.');
  const answers = (k.triageAnswers || []).map(a => '- ' + a);
  const txt = [
    'CLIENTE: ' + (c ? c.name + (c.phone ? ' · ' + c.phone : '') : '—'),
    'DEMANDA: ' + k.title + ' (' + (flow?.label || k.area) + ')',
    'ORIGEM: ' + N.originLabel(k.origin),
    'ESTÁGIO: ' + N.stageName(k.stageId) + ' · URGÊNCIA: ' + (k.urgency || 'normal'),
    '',
    'TRIAGEM:', ...(answers.length ? answers : ['- (sem respostas registradas)']),
    k.subject ? '\nRELATO/ASSUNTO:\n' + k.subject : '',
    k.notes ? '\nOBSERVAÇÕES:\n' + k.notes : '',
    '',
    'DOCUMENTOS RECEBIDOS:', ...(recebidos.length ? recebidos : ['- nenhum']),
    'DOCUMENTOS PENDENTES:', ...(pendentes.length ? pendentes : ['- nenhum']),
    '',
    'PONTOS A VERIFICAR:', ...(pontos.length ? pontos : ['- análise geral do caso']),
    '',
    'PRÓXIMA AÇÃO: Análise jurídica por Vilmar.'
  ].filter(l => l !== '').join('\n');
  await N.updateCase(caseId, { summary: { text: txt, at: now() } }, actor);
  return txt;
}

/* ---------- prompt do agente ---------- */
function agentSystem(ctx) {
  const stagesTxt = N.stages().map(s => `${s.id} (${s.name})`).join(', ');
  const flow = ctx.kase ? N.flowByArea(ctx.kase.area) : (ctx.detectedFlow || null);
  const kb = S.knowledge.slice(0, 8).map(kitem => `- ${kitem.title}: ${kitem.content}`).join('\n');
  return `Você é o canal de atendimento digital do escritório ${S.config.office || 'de advocacia'} (advogado responsável: ${S.config.lawyer || 'Vilmar'}). Você opera o CRM do escritório por meio de ferramentas.

IDENTIDADE: você é o atendimento institucional do escritório. Não use nome de pessoa (nunca "Julia"), não diga espontaneamente "sou uma inteligência artificial" e não finja ser um humano específico. Se perguntarem diretamente se é um robô, diga que é o canal automatizado de atendimento do escritório e que toda análise é feita pelo advogado.

MISSÃO: transformar cada conversa em ação concreta no CRM — identificar o cliente, entender a demanda, triar, qualificar, coletar informações e documentos, classificar, agendar quando autorizado, criar tarefas e preparar o caso para análise de Vilmar. Pergunte UMA coisa por vez. Português do Brasil, tom humano, acolhedor e profissional.

REGRAS RÍGIDAS (nunca viole):
- NUNCA invente jurisprudência, legislação, prazos, decisões, valores, andamento de processos, documentos recebidos ou qualquer informação que não esteja no CRM/conversa.
- NUNCA informe honorários, prometa resultado, dê parecer jurídico definitivo ou feche acordo. Isso é decisão de Vilmar → use handoff_to_human.
- Não peça dados sensíveis além do mínimo necessário.
- Se houver risco à saúde, oriente procurar emergência antes da questão jurídica e marque urgência critica.
- Em dúvida ou situação não prevista: registre e use handoff_to_human. Nunca recuse de forma seca.
- Grupos de WhatsApp não são atendidos.

FLUXO DE TRABALHO: 1) find_contact → create_contact se necessário; 2) entender a demanda → create_case (uma demanda POR ASSUNTO — cliente pode ter várias; não misture); 3) seguir as perguntas de triagem da área registrando cada resposta com update_case (triageAnswer); 4) request_document + pedir ao cliente; 5) registrar documentos recebidos; 6) mover no funil (move_pipeline) conforme progresso; 7) agendar com check_calendar/create_appointment quando o cliente pedir ou quando a triagem estiver completa; 8) ao concluir a triagem ou em situação de handoff: generate_case_summary + handoff_to_human.

FUNIL (estágios): ${stagesTxt}.
${flow ? `\nFLUXO DE TRIAGEM DA ÁREA "${flow.label}":\nPerguntas: ${flow.questions.join(' | ')}\nDocumentos: ${flow.docs.join(', ')}\nQualifica se: ${flow.qualifyCriteria}\nPrioridade: ${flow.priority} · Estágio destino: ${flow.targetStage}\n${flow.guidance ? 'Orientação: ' + flow.guidance : ''}\nTransferir para humano quando: ${flow.handoff}` : ''}

BASE DE CONHECIMENTO (institucional — use search_knowledge para mais):
${kb}

COMUNICAÇÃO: toda fala com o cliente vai por send_message (curta, humana, sem revelar raciocínio interno nem nomes de ferramentas). Seu texto final (fora das ferramentas) é apenas nota interna de uma linha.`;
}

function contextSnapshot(ctx) {
  const msgs = S.whatsappMessages.filter(m => m.chatId === ctx.chat.id).slice(-20)
    .map(m => (m.direction === 'in' ? 'CLIENTE: ' : 'ESCRITÓRIO: ') + m.text).join('\n');
  const docs = ctx.kase ? N.caseDocs(ctx.kase.id).map(d => `${d.name} [${d.status}]`).join('; ') : '';
  const snap = {
    contato: ctx.contact ? { id: ctx.contact.id, nome: ctx.contact.name, telefone: ctx.contact.phone, status: ctx.contact.status, origem: ctx.contact.origin } : null,
    demanda_atual: ctx.kase ? { id: ctx.kase.id, titulo: ctx.kase.title, area: ctx.kase.area, estagio: ctx.kase.stageId, urgencia: ctx.kase.urgency, respostas_triagem: ctx.kase.triageAnswers || [], documentos: docs } : null,
    outras_demandas: ctx.contact ? N.contactCases(ctx.contact.id).filter(k => k.id !== ctx.kase?.id).map(k => ({ id: k.id, titulo: k.title, estagio: k.stageId, status: k.status })) : [],
    data_hoje: today()
  };
  return `CONTEXTO DO CRM (fonte da verdade — não invente além disto):\n${JSON.stringify(snap, null, 1)}\n\nCONVERSA RECENTE:\n${msgs}\n\nDecida e execute as próximas ações com as ferramentas. Depois responda ao cliente com send_message quando apropriado.`;
}

/* ---------- orquestrador por conversa ---------- */
const chatLocks = new Set();
async function runAgentOnChat(chat) {
  const w = S.config.whatsapp;
  if (!chat || chat.aiMode === 'humano' || chat.status === 'aguardando_vilmar') return null;
  if (w.agentEnabled === false || w.mode !== 'autonomo' || w.autoReply === false) return null;
  if (!aiConfigured() && typeof window.__NAVE_TEST_BRAIN !== 'function') return null;
  if (chatLocks.has(chat.id)) return null;
  chatLocks.add(chat.id);
  try {
    const phone = N.normPhone(chat.phone || chat.wa_chatid);
    const contact = chat.contactId ? N.contactById(chat.contactId) : N.findContact({ phone });
    let kase = chat.caseId ? N.caseById(chat.caseId) : (contact ? N.openCaseForContact(contact.id) : null);
    if (kase && kase.status !== 'aberto') kase = contact ? N.openCaseForContact(contact.id) : null;
    const lastIn = S.whatsappMessages.filter(m => m.chatId === chat.id && m.direction === 'in').slice(-1)[0];
    const ctx = { actor: 'ia', chat, contact, kase, phone, detectedFlow: lastIn ? N.detectArea(lastIn.text) : null, repliedInRun: false, handoff: false };
    const messages = [{ role: 'user', content: contextSnapshot(ctx) }];
    const tools = TOOL_DEFS;
    let finalText = '', iterations = 0, toolsUsed = [];
    while (iterations < 8) {
      iterations++;
      const resp = await llm({ system: agentSystem(ctx), messages, tools, max_tokens: 1500 });
      const content = resp.content || [];
      const toolBlocks = content.filter(b => b.type === 'tool_use');
      finalText = content.filter(b => b.type === 'text').map(b => b.text).join('\n').trim();
      if (resp.stop_reason !== 'tool_use' || !toolBlocks.length) break;
      messages.push({ role: 'assistant', content });
      const results = [];
      for (const tb of toolBlocks) {
        // ctx pode ganhar contact/kase durante a execução — recarrega referências
        const out = await runTool(tb.name, tb.input, ctx);
        toolsUsed.push(tb.name);
        results.push({ type: 'tool_result', tool_use_id: tb.id, content: out });
        if (ctx.handoff) break;
      }
      messages.push({ role: 'user', content: results });
      if (ctx.handoff) {
        // dá uma última rodada para o agente se despedir do cliente
        const resp2 = await llm({ system: agentSystem(ctx), messages, tools, max_tokens: 700 });
        const c2 = resp2.content || [];
        for (const tb of c2.filter(b => b.type === 'tool_use' && b.name === 'send_message')) await runTool('send_message', tb.input, ctx);
        finalText = c2.filter(b => b.type === 'text').map(b => b.text).join('\n').trim() || finalText;
        break;
      }
    }
    // fallback: se o modelo respondeu só com texto e nunca falou com o cliente, envia o texto
    if (!ctx.repliedInRun && finalText && !ctx.handoff) await IMPL.send_message({ text: finalText }, ctx);
    chat.agentLastRun = now();
    if (ctx.kase) chat.caseId = ctx.kase.id;
    if (ctx.contact) chat.contactId = ctx.contact.id;
    if (lastIn) chat.agentLastProcessedId = lastIn.id;
    if (!ctx.handoff) chat.agentStatus = 'em_triagem';
    S.waAgentLogs.push({ id: uid(), chatId: chat.id, at: now(), tools: toolsUsed, note: finalText.slice(0, 300) });
    if (S.waAgentLogs.length > 300) S.waAgentLogs = S.waAgentLogs.slice(-300);
    await Promise.all([sset('whatsappChats', S.whatsappChats), sset('waAgentLogs', S.waAgentLogs)]);
    N.render();
    return { tools: toolsUsed, handoff: ctx.handoff };
  } catch (e) {
    console.error('agente', e);
    chat.agentStatus = 'erro_ia'; chat.agentLastError = e.message;
    S.waAgentLogs.push({ id: uid(), chatId: chat.id, at: now(), error: e.message });
    await Promise.all([sset('whatsappChats', S.whatsappChats), sset('waAgentLogs', S.waAgentLogs)]);
    return null;
  } finally { chatLocks.delete(chat.id); }
}

/* ---------- assistente interno (aba Assistente) ---------- */
async function aiMessages(system, messages, maxTokens = 1024) {
  const j = await llm({ system, messages, max_tokens: maxTokens });
  return (j.content || []).filter(b => b.type === 'text' || b.text).map(b => b.text || '').join('\n').trim();
}
function aiContext() {
  return {
    funil: N.stages().map(s => ({ estagio: s.name, demandas: S.cases.filter(k => k.stageId === s.id && k.status === 'aberto').length })),
    demandas_abertas: S.cases.filter(k => k.status === 'aberto').map(k => ({ titulo: k.title, cliente: N.contactById(k.contactId)?.name, estagio: N.stageName(k.stageId), urgencia: k.urgency })),
    contratos: S.contracts.map(c => ({ client: c.client, total: c.total, parcelas: (c.installments || []).length })),
    prazos: S.deadlines.map(d => ({ titulo: d.title, data: d.date, tipo: d.type })),
    tarefas_abertas: N.openTasks().length,
    reunioes: S.appointments.filter(a => a.date >= today() && a.status !== 'cancelado').map(a => ({ data: a.date, hora: a.time, titulo: a.title })),
  };
}

Object.assign(N, { aiConfigured, llm, TOOL_DEFS, toolImpl: IMPL, runTool, approveAction, rejectAction,
  generateCaseSummary, runAgentOnChat, aiMessages, aiContext, agentSystem });
})();
