/* NAVE — telas: Painel operacional, Inbox unificada, Funil, Clientes (PF/PJ) */
(() => {
'use strict';
const N = window.NAVE, S = N.state;
const { $, esc, money, dateBR, dtBR, today, daysDiff, addDays, openModal, closeModal, toast, stageName } = N;

const urgBadge = u => `<span class="badge ${u === 'alta' || u === 'critica' ? 'hot' : ''}">${esc(u || 'normal')}</span>`;

/* ============================== PAINEL ============================== */
N.views.painel = function renderPainel() {
  const el = $('view-painel');
  const openCases = S.cases.filter(k => k.status === 'aberto');
  const newContacts7 = S.contacts.filter(c => daysDiff(today(), c.createdAt?.slice(0, 10) || today()) <= 7).length;
  const triagem = openCases.filter(k => ['novo_contato', 'triagem'].includes(k.stageId)).length;
  const qualificados = openCases.filter(k => k.stageId === 'qualificado').length;
  const aguardDocs = openCases.filter(k => k.stageId === 'aguardando_documentos').length;
  const analise = openCases.filter(k => ['documentacao_completa', 'analise_juridica'].includes(k.stageId)).length;
  const handoffs = N.waChats().filter(c => c.status === 'aguardando_vilmar');
  const approvals = S.tasks.filter(t => t.status === 'aberta' && t.kind === 'aprovacao');
  const meetsToday = S.appointments.filter(a => a.date === today() && a.status !== 'cancelado');
  const tasksOpen = N.openTasks().filter(t => t.kind !== 'aprovacao');
  const overdue = tasksOpen.filter(t => daysDiff(t.due) < 0);
  const dueToday = tasksOpen.filter(t => t.due === today());
  const docsPend = S.documents.filter(d => d.status === 'pendente').length;
  const contratos = openCases.filter(k => ['contratacao', 'execucao', 'acompanhamento'].includes(k.stageId)).length;
  const deadlines = S.deadlines.filter(d => daysDiff(d.date) >= 0 && daysDiff(d.date) <= 7);

  /* conversão por origem: leads -> qualificados+ -> reuniões -> contratos */
  const qualIdx = N.stageIndex('qualificado'), contrIdx = N.stageIndex('contratacao');
  const byOrigin = {};
  for (const k of S.cases) {
    const o = k.origin || 'outro';
    const b = byOrigin[o] = byOrigin[o] || { leads: 0, qualificados: 0, reunioes: 0, contratos: 0 };
    b.leads++;
    if (N.stageIndex(k.stageId) >= qualIdx || k.status === 'ganho') b.qualificados++;
    if (S.appointments.some(a => a.caseId === k.id)) b.reunioes++;
    if (N.stageIndex(k.stageId) >= contrIdx || k.status === 'ganho') b.contratos++;
  }

  const attention = [];
  for (const t of approvals) attention.push({ pri: 0, html: `<div class="item fatal"><div class="between"><strong>⚖ Aprovação: ${esc(t.title.replace('Aprovar ação da IA: ', ''))}</strong>${urgBadge('alta')}</div><div class="muted" style="font-size:11px">${esc((t.desc || '').slice(0, 120))}</div><div class="row" style="margin-top:7px"><button class="btn small primary" data-action="approve-action" data-id="${t.id}">Aprovar</button><button class="btn small danger" data-action="reject-action" data-id="${t.id}">Rejeitar</button></div></div>` });
  for (const c of handoffs) attention.push({ pri: 1, html: `<div class="item"><div class="between"><strong>💬 ${esc(c.name || c.phone)} aguarda Vilmar</strong>${urgBadge(c.agentUrgency)}</div><div class="muted" style="font-size:11px">${esc(c.agentSummary || 'Conversa encaminhada pela IA')}</div><div class="row" style="margin-top:7px"><button class="btn small primary" data-action="open-chat" data-id="${esc(c.id)}">Abrir conversa</button>${c.caseId ? `<button class="btn small" data-action="case-detail" data-id="${esc(c.caseId)}">Ver demanda</button>` : ''}</div></div>` });
  for (const t of overdue.slice(0, 5)) attention.push({ pri: 2, html: `<div class="item fatal"><div class="between"><strong>☑ ${esc(t.title)}</strong><span class="bad mono">${dateBR(t.due)}</span></div><button class="btn small" style="margin-top:6px" data-action="task-done" data-id="${t.id}">Concluir</button></div>` });
  for (const a of meetsToday) attention.push({ pri: 3, html: `<div class="item"><div class="between"><strong>📅 ${a.time} — ${esc(a.title)}</strong><span class="badge">${esc(a.status)}</span></div></div>` });
  for (const d of deadlines.slice(0, 4)) attention.push({ pri: 4, html: `<div class="item ${daysDiff(d.date) <= 3 ? 'fatal' : ''}"><div class="between"><strong>⏳ ${esc(d.title)}</strong><span class="mono">${dateBR(d.date)}</span></div></div>` });
  attention.sort((a, b) => a.pri - b.pri);

  el.innerHTML = `<div class="section-head"><div><div class="eyebrow">Visão operacional</div><h2>O que precisa da sua atenção agora?</h2></div><div class="row"><button class="btn" data-action="run-sweeps">Executar rotinas</button><button class="btn primary" data-action="new-case">+ Demanda</button></div></div>
  <div class="grid grid4">
    <div class="card metric"><div class="label">Novos contatos (7d)</div><div class="num">${newContacts7}</div><div class="status">${S.contacts.length} no total</div></div>
    <div class="card metric"><div class="label">Em triagem</div><div class="num">${triagem}</div><div class="status">${qualificados} qualificados</div></div>
    <div class="card metric"><div class="label">Aguardando documentos</div><div class="num">${aguardDocs}</div><div class="status">${docsPend} documento(s) pendente(s)</div></div>
    <div class="card metric"><div class="label">Aguardando Vilmar</div><div class="num ${handoffs.length + approvals.length ? 'bad' : ''}">${handoffs.length + approvals.length}</div><div class="status">${approvals.length} aprovação(ões) · ${analise} em análise</div></div>
    <div class="card metric"><div class="label">Reuniões hoje</div><div class="num">${meetsToday.length}</div><div class="status">${S.appointments.filter(a => a.date > today() && a.status !== 'cancelado').length} futuras</div></div>
    <div class="card metric"><div class="label">Tarefas vencidas</div><div class="num ${overdue.length ? 'bad' : ''}">${overdue.length}</div><div class="status">${dueToday.length} para hoje</div></div>
    <div class="card metric"><div class="label">Casos em andamento</div><div class="num">${contratos}</div><div class="status">${S.cases.filter(k => k.status === 'ganho').length} concluídos</div></div>
    <div class="card metric"><div class="label">Conversão</div><div class="num">${S.cases.length ? Math.round(100 * S.cases.filter(k => N.stageIndex(k.stageId) >= contrIdx || k.status === 'ganho').length / S.cases.length) : 0}%</div><div class="status">demanda → contratação</div></div>
  </div>
  <div class="grid grid2" style="margin-top:12px">
    <div class="card"><div class="between"><strong>Atenção agora</strong><span class="badge">${attention.length}</span></div>
      <div class="list" style="margin-top:10px">${attention.slice(0, 10).map(x => x.html).join('') || '<div class="empty"><strong>Tudo em dia</strong>Nenhuma pendência crítica no momento.</div>'}</div></div>
    <div class="card"><div class="between"><strong>Origem → conversão</strong><span class="badge">${S.cases.length} demandas</span></div>
      <div class="table-wrap" style="margin-top:10px"><table class="table"><thead><tr><th>Origem</th><th>Leads</th><th>Qualif.</th><th>Reuniões</th><th>Contratos</th></tr></thead>
      <tbody>${Object.entries(byOrigin).sort((a, b) => b[1].leads - a[1].leads).map(([o, v]) => `<tr><td>${esc(N.originLabel(o))}</td><td>${v.leads}</td><td>${v.qualificados}</td><td>${v.reunioes}</td><td>${v.contratos}</td></tr>`).join('') || '<tr><td colspan="5" class="muted">Sem demandas ainda.</td></tr>'}</tbody></table></div>
      <div class="wa-note" style="margin-top:8px">Rastreamento de campanha: informe a origem no cadastro da demanda; leads de WhatsApp entram automaticamente como "WhatsApp".</div></div>
  </div>`;
};

/* ============================== INBOX ============================== */
const FILTERS = [
  ['todos', 'Todos'], ['ia', 'IA atendendo'], ['humano', 'Aguardando humano'], ['urgente', 'Urgente'],
  ['novos', 'Novos'], ['sem_resposta', 'Sem resposta'], ['pendentes', 'Pendentes'], ['meus', 'Meus atendimentos']];

function chatCase(c) { return c.caseId ? N.caseById(c.caseId) : (c.contactId ? N.openCaseForContact(c.contactId) : null); }
function filterChats(list, f) {
  const lastMsg = id => N.chatMessages(id).slice(-1)[0];
  switch (f) {
    case 'ia': return list.filter(c => c.aiMode !== 'humano' && c.status !== 'aguardando_vilmar');
    case 'humano': return list.filter(c => c.status === 'aguardando_vilmar');
    case 'urgente': return list.filter(c => ['alta', 'critica'].includes(c.agentUrgency) || ['alta', 'critica'].includes(chatCase(c)?.urgency));
    case 'novos': return list.filter(c => c.agentStatus === 'novo' || !c.contactId);
    case 'sem_resposta': return list.filter(c => { const m = lastMsg(c.id); return m && m.direction === 'out' && (Date.now() - new Date(m.at)) > 86400000; });
    case 'pendentes': return list.filter(c => N.openTasks().some(t => t.contactId === c.contactId) || N.caseDocs(chatCase(c)?.id || '').some(d => d.status === 'pendente'));
    case 'meus': return list.filter(c => c.aiMode === 'humano' || c.status === 'com_vilmar');
    default: return list;
  }
}

N.views.inbox = function renderInbox() {
  const el = $('view-inbox');
  const keepSearch = $('inboxSearch')?.value || '';
  const keepText = $('inboxText')?.value || '';
  const focusId = document.activeElement?.id || '';
  const w = N.waConfig();
  let chats = N.waChats().slice().sort((a, b) => Number(b.wa_lastMsgTimestamp || 0) - Number(a.wa_lastMsgTimestamp || 0));
  chats = filterChats(chats, S.inboxFilter);
  const selected = S.waSelectedChatId && chats.find(c => c.id === S.waSelectedChatId) ? S.waSelectedChatId : (chats[0]?.id || '');
  S.waSelectedChatId = selected;
  const c = chats.find(x => x.id === selected);
  const kase = c ? chatCase(c) : null;
  const contact = c?.contactId ? N.contactById(c.contactId) : null;
  const thread = c ? N.chatMessages(c.id).slice(-80) : [];

  el.innerHTML = `<div class="section-head"><div><div class="eyebrow">Caixa de entrada unificada</div><h2>Inbox</h2></div>
    <div class="row"><span class="wa-dot ${w.lastStatus === 'connected' ? 'on' : w.lastStatus ? 'off' : ''}"></span><span class="wa-note">${esc(w.phone || 'WhatsApp')} · ${esc(N.waStatusLabel())}${N.offlineMode() ? ' · modo local' : ''}</span>
    <button class="btn small" data-action="wa-sync-chats">Sincronizar</button><button class="btn small" data-action="wa-status">Status</button><button class="btn small" data-action="simulate-inbound">Simular mensagem</button></div></div>
  <div class="wa-agentbar"><div><strong>Agente: ${esc(w.agentName || 'Atendimento do Escritório')}</strong>
    <div class="wa-note">${w.agentEnabled !== false ? 'ATIVO' : 'DESLIGADO'} · ${w.mode === 'autonomo' ? 'autônomo (responde + opera o CRM)' : w.mode === 'copiloto' ? 'copiloto' : 'somente humano'}${N.aiConfigured() ? '' : ' · <span class="warn">sem chave de IA — configure em ⚙</span>'}</div></div>
    <span class="badge ${w.agentEnabled !== false && w.mode === 'autonomo' ? 'good' : ''}">${w.agentEnabled !== false && w.mode === 'autonomo' ? 'AUTÔNOMO' : 'MANUAL'}</span></div>
  <div class="inbox"><aside class="inbox-side">
    <div class="inbox-search"><input id="inboxSearch" placeholder="Pesquisar conversa..."></div>
    <div class="inbox-filters">${FILTERS.map(([k, lbl]) => `<button class="chip ${S.inboxFilter === k ? 'active' : ''}" data-action="inbox-filter" data-id="${k}">${lbl}</button>`).join('')}</div>
    <div class="inbox-list" id="inboxList">${chats.map(x => {
      const kk = chatCase(x); const unread = Number(x.wa_unreadCount || 0);
      return `<div class="inbox-row ${x.id === selected ? 'selected' : ''}" data-action="inbox-select" data-id="${esc(x.id)}">
        <div class="wa-avatar">${esc((x.name || x.phone || '?').slice(0, 2).toUpperCase())}</div>
        <div style="min-width:0"><strong style="font-size:12px">${esc(x.name || x.phone || 'Sem nome')}</strong>
        <div class="last">${esc(x.wa_lastMessageText || 'Sem mensagens')}</div>
        <div class="meta">${x.status === 'aguardando_vilmar' ? '<span class="badge bad">AGUARDANDO VILMAR</span>' : x.aiMode === 'humano' ? '<span class="badge">HUMANO</span>' : '<span class="badge ia">IA</span>'}${kk ? `<span class="badge">${esc(stageName(kk.stageId))}</span>` : ''}${['alta', 'critica'].includes(x.agentUrgency) ? urgBadge(x.agentUrgency) : ''}</div></div>
        ${unread ? `<span class="unread">${unread > 99 ? '99+' : unread}</span>` : ''}</div>`;
    }).join('') || '<div class="empty" style="margin:12px"><strong>Nenhuma conversa</strong>Sincronize a Zappfy ou use "Simular mensagem".</div>'}</div></aside>
  <section class="inbox-main">${c ? `
    <div class="inbox-head"><div><strong>${esc(c.name || c.phone)}</strong>
      <div class="wa-note">${esc(c.phone || '')} · WhatsApp ${contact ? `· <a href="#" data-action="contact-detail" data-id="${contact.id}" style="color:var(--accent)">${esc(contact.name)}</a>` : '· contato não vinculado'}${kase ? ` · demanda: ${esc(kase.title)} (${esc(stageName(kase.stageId))})` : ''}</div></div>
      <div class="row">
        ${c.status === 'aguardando_vilmar' || c.aiMode === 'humano' ? `<button class="btn small primary" data-action="chat-assume" data-id="${esc(c.id)}">${c.aiMode === 'humano' ? 'Assumido' : 'Assumir'}</button><button class="btn small" data-action="chat-return-ia" data-id="${esc(c.id)}">Devolver à IA</button>` : `<button class="btn small" data-action="chat-assume" data-id="${esc(c.id)}">Assumir conversa</button>`}
        ${kase ? `<button class="btn small" data-action="case-detail" data-id="${esc(kase.id)}">Demanda</button><button class="btn small" data-action="case-summary" data-id="${esc(kase.id)}">Resumo</button>` : (contact ? `<button class="btn small" data-action="new-case-for" data-id="${contact.id}">+ Demanda</button>` : '')}
        <button class="btn small" data-action="chat-resolve" data-id="${esc(c.id)}">Resolvido</button>
        <button class="btn small" data-action="wa-mark-read" data-id="${esc(c.id)}">Lido</button></div></div>
    ${c.status === 'aguardando_vilmar' && kase?.summary ? `<div style="padding:10px 14px 0"><div class="summary-card">${esc(kase.summary.text)}</div></div>` : ''}
    <div class="inbox-thread" id="inboxThread">${thread.length ? thread.map(m => `<div class="wa-bubble ${m.direction === 'out' ? 'out' : 'in'}">${esc(m.text || '')}<span class="wa-time">${m.at ? new Date(m.at).toLocaleString('pt-BR') : ''}${m.direction === 'out' && m.actor === 'ia' ? ' · IA' : ''}</span></div>`).join('') : '<div class="empty"><strong>Sem mensagens carregadas</strong></div>'}</div>
    <div class="inbox-compose"><textarea id="inboxText" placeholder="Responder como escritório..."></textarea><button class="btn primary" data-action="inbox-send" data-id="${esc(c.id)}">Enviar</button></div>` :
    '<div class="empty" style="margin:auto"><strong>Nenhuma conversa selecionada</strong></div>'}</section></div>`;

  const search = $('inboxSearch');
  const applyFilter = () => { const q = (search?.value || '').trim().toLowerCase(); document.querySelectorAll('#inboxList .inbox-row').forEach(row => { row.style.display = !q || row.textContent.toLowerCase().includes(q) ? 'grid' : 'none'; }); };
  if (search) { search.value = keepSearch; search.oninput = applyFilter; if (keepSearch) applyFilter(); }
  const ta = $('inboxText'); if (ta && keepText) ta.value = keepText;
  if (focusId === 'inboxSearch' || focusId === 'inboxText') { const f = $(focusId); if (f) { f.focus(); try { f.setSelectionRange(f.value.length, f.value.length); } catch (e) {} } }
  const th = $('inboxThread'); if (th) th.scrollTop = th.scrollHeight;
};

/* ============================== FUNIL ============================== */
N.views.funil = function renderFunil() {
  const el = $('view-funil');
  const open = S.cases.filter(k => k.status === 'aberto');
  el.innerHTML = `<div class="section-head"><div><div class="eyebrow">Pipeline de demandas</div><h2>Funil</h2></div>
    <div class="row"><button class="btn" data-action="edit-stages">Editar estágios</button><button class="btn primary" data-action="new-case">+ Demanda</button></div></div>
  <div class="kanban">${N.stages().map(s => {
    const items = open.filter(k => k.stageId === s.id);
    return `<div class="lane"><h3><span>${esc(s.name)}</span><span>${items.length}</span></h3>${items.map(k => {
      const c = N.contactById(k.contactId);
      const idx = N.stageIndex(k.stageId);
      const next = N.stages()[idx + 1];
      return `<article class="lead-card"><div class="between"><h4>${esc(k.title)}</h4>${urgBadge(k.urgency)}</div>
        <p>${esc(c?.name || 'sem contato')} · ${esc(N.originLabel(k.origin))}</p>
        <p>${esc(N.flowByArea(k.area)?.label || k.area)}${k.value ? ' · ' + money(k.value) : ''}</p>
        <p>Entrada ${dateBR(k.createdAt)} · ${daysDiff(today(), (k.lastInteraction || k.createdAt).slice(0, 10))}d sem mov.</p>
        <div class="row" style="margin-top:8px"><button class="btn small" data-action="case-detail" data-id="${k.id}">Abrir</button>${next ? `<button class="btn small" data-action="case-advance" data-id="${k.id}">→ ${esc(next.name)}</button>` : ''}</div></article>`;
    }).join('') || '<div class="empty" style="padding:18px 8px;font-size:10px">Vazio</div>'}</div>`;
  }).join('')}</div>
  <div class="wa-note" style="margin-top:8px">Demandas perdidas/concluídas saem do funil. Mudanças de estágio disparam automações (Sistema → Automações).</div>`;
};

/* ============================== CLIENTES ============================== */
N.views.clientes = function renderClientes() {
  const el = $('view-clientes');
  const keep = $('clientSearch')?.value || '';
  const hadFocus = document.activeElement?.id === 'clientSearch';
  const mode = S.clientMode || 'pf';
  const q = keep.trim().toLowerCase();
  el.innerHTML = `<div class="section-head"><div><div class="eyebrow">Contatos e empresas</div><h2>Clientes</h2></div>
    <div class="row"><button class="btn ${mode === 'pf' ? 'primary' : ''}" data-action="client-mode" data-id="pf">Pessoas (${S.contacts.length})</button>
    <button class="btn ${mode === 'pj' ? 'primary' : ''}" data-action="client-mode" data-id="pj">Empresas (${S.companies.length})</button>
    <button class="btn primary" data-action="${mode === 'pf' ? 'new-contact' : 'new-company'}">+ ${mode === 'pf' ? 'Contato' : 'Empresa'}</button></div></div>
  <div class="card"><div class="field"><input id="clientSearch" placeholder="Buscar por nome, telefone, CPF/CNPJ, e-mail ou tag..."></div>
  <div class="list" id="clientList">${mode === 'pf' ?
    S.contacts.filter(c => !q || (c.name + c.phone + c.cpf + c.email + (c.tags || []).join(' ')).toLowerCase().includes(q))
      .sort((a, b) => (b.lastInteraction || '').localeCompare(a.lastInteraction || '')).slice(0, 100).map(c => {
        const cases = N.contactCases(c.id);
        return `<div class="item clickable" data-action="contact-detail" data-id="${c.id}"><div class="between"><strong>${esc(c.name)}</strong>
          <span class="row"><span class="badge ${c.status === 'cliente' ? 'good' : ''}">${esc(c.status)}</span><span class="badge">${esc(N.originLabel(c.origin))}</span></span></div>
          <div class="muted" style="font-size:11px">${esc(c.phone || 'sem telefone')}${c.email ? ' · ' + esc(c.email) : ''} · ${cases.length} demanda(s) · última interação ${dtBR(c.lastInteraction)}</div>
          ${(c.tags || []).length ? `<div class="tagrow" style="margin-top:5px">${c.tags.map(t => `<span class="badge">${esc(t)}</span>`).join('')}</div>` : ''}</div>`;
      }).join('') || '<div class="empty"><strong>Nenhum contato</strong>Contatos são criados automaticamente quando chega mensagem no WhatsApp.</div>'
    : S.companies.filter(e => !q || (e.razaoSocial + e.nomeFantasia + e.cnpj).toLowerCase().includes(q)).map(e => {
        const linked = e.contactIds.map(id => N.contactById(id)?.name).filter(Boolean);
        return `<div class="item clickable" data-action="company-detail" data-id="${e.id}"><div class="between"><strong>${esc(e.razaoSocial)}</strong><span class="badge">${esc(e.cnpj || 'sem CNPJ')}</span></div>
          <div class="muted" style="font-size:11px">${e.nomeFantasia ? esc(e.nomeFantasia) + ' · ' : ''}${linked.length} contato(s): ${esc(linked.join(', ') || '—')} · ${S.cases.filter(k => k.companyId === e.id).length} demanda(s)</div></div>`;
      }).join('') || '<div class="empty"><strong>Nenhuma empresa</strong>Cadastre pessoas jurídicas para demandas empresariais.</div>'}</div></div>`;
  const search = $('clientSearch');
  if (search) {
    search.value = keep;
    search.oninput = () => N.views.clientes();
    if (hadFocus) { search.focus(); try { search.setSelectionRange(search.value.length, search.value.length); } catch (e) {} }
  }
};

/* ---------- modais de contato/empresa/demanda ---------- */
function contactDetail(id) {
  const c = N.contactById(id); if (!c) return;
  const cases = N.contactCases(id);
  const docs = S.documents.filter(d => d.contactId === id);
  const tasks = S.tasks.filter(t => t.contactId === id && t.status === 'aberta');
  const appts = S.appointments.filter(a => a.contactId === id);
  const companies = (c.companyIds || []).map(cid => S.companies.find(e => e.id === cid)).filter(Boolean);
  const tl = N.timelineFor({ contactId: id });
  openModal(`<h3>${esc(c.name)}</h3>
  <div class="kv"><b>Telefone</b><span>${esc(c.phone || '—')}</span><b>WhatsApp</b><span>${esc(c.whatsapp || '—')}</span>
  <b>E-mail</b><span>${esc(c.email || '—')}</span><b>CPF</b><span>${esc(c.cpf || '—')}</span>
  <b>Origem</b><span>${esc(N.originLabel(c.origin))}</span><b>Status</b><span>${esc(c.status)}</span>
  <b>Criado em</b><span>${dtBR(c.createdAt)}</span><b>Última interação</b><span>${dtBR(c.lastInteraction)}</span>
  <b>Próxima ação</b><span>${esc(c.nextAction || '—')}</span><b>Empresas</b><span>${companies.map(e => esc(e.razaoSocial)).join(', ') || '—'}</span></div>
  ${c.notes ? `<div class="item" style="margin-top:8px">${esc(c.notes)}</div>` : ''}
  <div class="row" style="margin-top:10px"><button class="btn small" data-action="contact-edit" data-id="${c.id}">Editar</button>
  <button class="btn small" data-action="new-case-for" data-id="${c.id}">+ Demanda</button>
  <button class="btn small" data-action="open-chat-phone" data-id="${esc(c.whatsapp || c.phone)}">Conversa</button>
  <button class="btn small" data-action="link-company" data-id="${c.id}">Vincular empresa</button></div>
  <details class="more" open><summary>Demandas (${cases.length})</summary><div class="list">${cases.map(k => `<div class="item clickable" data-action="case-detail" data-id="${k.id}"><div class="between"><strong>${esc(k.title)}</strong><span class="row"><span class="badge">${esc(stageName(k.stageId))}</span>${urgBadge(k.urgency)}</span></div><div class="muted" style="font-size:11px">${esc(N.flowByArea(k.area)?.label || k.area)} · ${esc(k.status)}</div></div>`).join('') || '<div class="empty">Nenhuma demanda.</div>'}</div></details>
  <details class="more"><summary>Documentos (${docs.length})</summary><div class="list">${docs.map(d => docRow(d)).join('') || '<div class="empty">Nenhum documento.</div>'}</div></details>
  <details class="more"><summary>Tarefas abertas (${tasks.length})</summary><div class="list">${tasks.map(t => `<div class="item"><div class="between"><strong>${esc(t.title)}</strong><span class="mono">${dateBR(t.due)}</span></div></div>`).join('') || '<div class="empty">Nenhuma.</div>'}</div></details>
  <details class="more"><summary>Reuniões (${appts.length})</summary><div class="list">${appts.map(a => `<div class="item"><div class="between"><strong>${dateBR(a.date)} ${a.time} — ${esc(a.title)}</strong><span class="badge">${esc(a.status)}</span></div></div>`).join('') || '<div class="empty">Nenhuma.</div>'}</details>
  <details class="more"><summary>Histórico</summary><div class="timeline">${tl.map(t => `<div class="tl"><span class="when">${dtBR(t.at)}</span><span>${esc(t.text)}</span></div>`).join('') || '<div class="empty">Sem eventos.</div>'}</div></details>
  <div class="row" style="margin-top:12px"><button class="btn" data-close>Fechar</button></div>`);
}
function docRow(d) {
  const cls = { pendente: 'warn', recebido: '', aprovado: 'good', rejeitado: 'bad' }[d.status] || '';
  return `<div class="doc-row"><div><strong>${esc(d.name)}</strong><div class="cat">${esc(d.category)} · ${d.status === 'pendente' ? 'solicitado ' + dtBR(d.requestedAt) : 'recebido ' + dtBR(d.receivedAt)}</div></div>
    <span class="badge ${cls}">${esc(d.status)}</span>
    <span class="row">${d.status === 'recebido' ? `<button class="btn small" data-action="doc-status" data-id="${d.id}" data-status="aprovado">Aprovar</button><button class="btn small danger" data-action="doc-status" data-id="${d.id}" data-status="rejeitado">Rejeitar</button>` : d.status === 'pendente' ? `<button class="btn small" data-action="doc-status" data-id="${d.id}" data-status="recebido">Marcar recebido</button>` : ''}</span></div>`;
}
function contactEdit(id) {
  const c = id ? N.contactById(id) : null;
  openModal(`<h3>${c ? 'Editar contato' : 'Novo contato'}</h3><form id="contactForm">
  <div class="field"><label>Nome</label><input name="name" required value="${esc(c?.name || '')}"></div>
  <div class="grid grid2"><div class="field"><label>Telefone/WhatsApp</label><input name="phone" value="${esc(c?.phone || '')}"></div>
  <div class="field"><label>E-mail</label><input name="email" value="${esc(c?.email || '')}"></div>
  <div class="field"><label>CPF</label><input name="cpf" value="${esc(c?.cpf || '')}"></div>
  <div class="field"><label>Origem</label><select name="origin">${N.ORIGINS.map(o => `<option value="${o}" ${c?.origin === o ? 'selected' : ''}>${N.originLabel(o)}</option>`).join('')}</select></div>
  <div class="field"><label>Status</label><select name="status">${['lead', 'cliente', 'inativo'].map(s => `<option ${c?.status === s ? 'selected' : ''}>${s}</option>`).join('')}</select></div>
  <div class="field"><label>Tags (separadas por vírgula)</label><input name="tags" value="${esc((c?.tags || []).join(', '))}"></div></div>
  <div class="field"><label>Observações</label><textarea name="notes">${esc(c?.notes || '')}</textarea></div>
  <div class="row"><button class="btn primary">Salvar</button><button type="button" class="btn" data-close>Cancelar</button></div></form>`);
  $('contactForm').onsubmit = async e => {
    e.preventDefault();
    const f = new FormData(e.target);
    const data = { name: f.get('name'), phone: f.get('phone'), whatsapp: f.get('phone'), email: f.get('email'), cpf: f.get('cpf'),
      origin: f.get('origin'), status: f.get('status'), notes: f.get('notes'), tags: String(f.get('tags') || '').split(',').map(t => t.trim()).filter(Boolean) };
    if (c) await N.updateContact(c.id, data, 'vilmar'); else {
      const dup = N.findContact({ phone: data.phone, cpf: data.cpf, email: data.email });
      if (dup) { toast('Já existe: ' + dup.name + ' — abrindo cadastro existente'); closeModal(); contactDetail(dup.id); return; }
      await N.createContact(data, 'vilmar');
    }
    closeModal(); N.render(); toast('Contato salvo');
  };
}
function companyEdit(id) {
  const c = id ? S.companies.find(x => x.id === id) : null;
  openModal(`<h3>${c ? 'Editar empresa' : 'Nova empresa'}</h3><form id="companyForm">
  <div class="field"><label>Razão social</label><input name="razaoSocial" required value="${esc(c?.razaoSocial || '')}"></div>
  <div class="grid grid2"><div class="field"><label>Nome fantasia</label><input name="nomeFantasia" value="${esc(c?.nomeFantasia || '')}"></div>
  <div class="field"><label>CNPJ</label><input name="cnpj" value="${esc(c?.cnpj || '')}"></div></div>
  <div class="field"><label>Observações</label><textarea name="notes">${esc(c?.notes || '')}</textarea></div>
  <div class="row"><button class="btn primary">Salvar</button><button type="button" class="btn" data-close>Cancelar</button></div></form>`);
  $('companyForm').onsubmit = async e => {
    e.preventDefault();
    const f = new FormData(e.target);
    if (c) { c.razaoSocial = f.get('razaoSocial'); c.nomeFantasia = f.get('nomeFantasia'); c.cnpj = f.get('cnpj'); c.notes = f.get('notes'); c.updatedAt = N.now(); await N.sset('companies', S.companies); }
    else await N.createCompany({ razaoSocial: f.get('razaoSocial'), nomeFantasia: f.get('nomeFantasia'), cnpj: f.get('cnpj'), notes: f.get('notes') }, 'vilmar');
    closeModal(); N.render(); toast('Empresa salva');
  };
}
function companyDetail(id) {
  const e = S.companies.find(x => x.id === id); if (!e) return;
  const cases = S.cases.filter(k => k.companyId === id);
  const contacts = e.contactIds.map(cid => N.contactById(cid)).filter(Boolean);
  openModal(`<h3>${esc(e.razaoSocial)}</h3>
  <div class="kv"><b>CNPJ</b><span>${esc(e.cnpj || '—')}</span><b>Fantasia</b><span>${esc(e.nomeFantasia || '—')}</span></div>
  ${e.notes ? `<div class="item" style="margin-top:8px">${esc(e.notes)}</div>` : ''}
  <div class="row" style="margin-top:10px"><button class="btn small" data-action="company-edit" data-id="${e.id}">Editar</button></div>
  <details class="more" open><summary>Contatos vinculados (${contacts.length})</summary><div class="list">${contacts.map(c => `<div class="item clickable" data-action="contact-detail" data-id="${c.id}"><strong>${esc(c.name)}</strong> <span class="muted">${esc(c.phone)}</span></div>`).join('') || '<div class="empty">Nenhum — vincule pelo cadastro da pessoa.</div>'}</div></details>
  <details class="more" open><summary>Demandas (${cases.length})</summary><div class="list">${cases.map(k => `<div class="item clickable" data-action="case-detail" data-id="${k.id}"><div class="between"><strong>${esc(k.title)}</strong><span class="badge">${esc(stageName(k.stageId))}</span></div></div>`).join('') || '<div class="empty">Nenhuma.</div>'}</div></details>
  <div class="row" style="margin-top:12px"><button class="btn" data-close>Fechar</button></div>`);
}
function linkCompanyModal(contactId) {
  const c = N.contactById(contactId); if (!c) return;
  openModal(`<h3>Vincular empresa a ${esc(c.name)}</h3>
  ${S.companies.length ? `<form id="linkForm"><div class="field"><label>Empresa</label><select name="companyId">${S.companies.map(e => `<option value="${e.id}">${esc(e.razaoSocial)}</option>`).join('')}</select></div>
  <div class="row"><button class="btn primary">Vincular</button><button type="button" class="btn" data-close>Cancelar</button></div></form>` :
  '<div class="empty"><strong>Nenhuma empresa cadastrada</strong></div><button class="btn primary" data-action="new-company">+ Nova empresa</button>'}`);
  const f = $('linkForm');
  if (f) f.onsubmit = async e => { e.preventDefault(); await N.linkContactCompany(contactId, new FormData(e.target).get('companyId')); closeModal(); toast('Vinculado'); contactDetail(contactId); };
}

/* ---------- demanda: criação e detalhe ---------- */
function caseEdit(kaseId, presetContactId) {
  const k = kaseId ? N.caseById(kaseId) : null;
  openModal(`<h3>${k ? 'Editar demanda' : 'Nova demanda'}</h3><form id="caseForm">
  <div class="field"><label>Título</label><input name="title" required value="${esc(k?.title || '')}" placeholder="Ex.: Negativa de cobertura — cirurgia"></div>
  <div class="field"><label>Cliente</label><select name="contactId" ${k ? 'disabled' : ''}>${S.contacts.map(c => `<option value="${c.id}" ${(k?.contactId || presetContactId) === c.id ? 'selected' : ''}>${esc(c.name)}</option>`).join('') || '<option value="">— cadastre um contato antes —</option>'}</select></div>
  <div class="grid grid2">
  <div class="field"><label>Área</label><select name="area">${S.triageFlows.map(f => `<option value="${f.area}" ${k?.area === f.area ? 'selected' : ''}>${esc(f.label)}</option>`).join('')}</select></div>
  <div class="field"><label>Origem</label><select name="origin">${N.ORIGINS.map(o => `<option value="${o}" ${k?.origin === o ? 'selected' : ''}>${N.originLabel(o)}</option>`).join('')}</select></div>
  <div class="field"><label>Urgência</label><select name="urgency">${['baixa', 'normal', 'alta', 'critica'].map(u => `<option ${(k?.urgency || 'normal') === u ? 'selected' : ''}>${u}</option>`).join('')}</select></div>
  <div class="field"><label>Valor potencial (R$)</label><input name="value" type="number" step="100" value="${Number(k?.value) || 0}"></div>
  <div class="field"><label>Prazo interno</label><input name="dueDate" type="date" value="${esc(k?.dueDate || '')}"></div>
  <div class="field"><label>Empresa (opcional)</label><select name="companyId"><option value="">—</option>${S.companies.map(e => `<option value="${e.id}" ${k?.companyId === e.id ? 'selected' : ''}>${esc(e.razaoSocial)}</option>`).join('')}</select></div></div>
  <div class="field"><label>Assunto / relato</label><textarea name="subject">${esc(k?.subject || '')}</textarea></div>
  <div class="row"><button class="btn primary">Salvar</button><button type="button" class="btn" data-close>Cancelar</button></div></form>`);
  $('caseForm').onsubmit = async e => {
    e.preventDefault();
    const f = new FormData(e.target);
    const data = { title: f.get('title'), area: f.get('area'), origin: f.get('origin'), urgency: f.get('urgency'),
      value: Number(f.get('value') || 0), dueDate: f.get('dueDate'), subject: f.get('subject'), companyId: f.get('companyId') || '' };
    if (k) await N.updateCase(k.id, data, 'vilmar');
    else {
      const contactId = f.get('contactId');
      if (!contactId) { toast('Cadastre um contato primeiro'); return; }
      await N.createCase({ ...data, contactId }, 'vilmar');
    }
    closeModal(); N.render(); toast('Demanda salva');
  };
}
function caseDetail(id) {
  const k = N.caseById(id); if (!k) return;
  const c = N.contactById(k.contactId);
  const docs = N.caseDocs(id);
  const tasks = N.caseTasks(id);
  const appts = S.appointments.filter(a => a.caseId === id);
  const flow = N.flowByArea(k.area);
  const tl = N.timelineFor({ caseId: id });
  const idx = N.stageIndex(k.stageId);
  openModal(`<h3>${esc(k.title)}</h3>
  <div class="kv"><b>Cliente</b><span>${c ? `<a href="#" data-action="contact-detail" data-id="${c.id}" style="color:var(--accent)">${esc(c.name)}</a>` : '—'}</span>
  <b>Área</b><span>${esc(flow?.label || k.area)}</span><b>Estágio</b><span>${esc(stageName(k.stageId))}</span>
  <b>Status</b><span>${esc(k.status)}</span><b>Urgência</b><span>${esc(k.urgency)}</span><b>Origem</b><span>${esc(N.originLabel(k.origin))}</span>
  <b>Valor</b><span>${k.value ? money(k.value) : '—'}</span><b>Prazo</b><span>${k.dueDate ? dateBR(k.dueDate) : '—'}</span>
  <b>Entrada</b><span>${dtBR(k.createdAt)}</span><b>Última mov.</b><span>${dtBR(k.lastInteraction)}</span></div>
  ${k.subject ? `<div class="item" style="margin-top:8px"><strong style="font-size:11px">RELATO</strong><div style="font-size:12px;white-space:pre-wrap">${esc(k.subject)}</div></div>` : ''}
  <div class="row" style="margin-top:10px">
    <select id="caseMoveSel" class="btn" style="font-weight:400">${N.stages().map(s => `<option value="${s.id}" ${s.id === k.stageId ? 'selected' : ''}>${esc(s.name)}</option>`).join('')}</select>
    <button class="btn small primary" data-action="case-move" data-id="${k.id}">Mover</button>
    <button class="btn small" data-action="case-edit" data-id="${k.id}">Editar</button>
    <button class="btn small" data-action="case-summary" data-id="${k.id}">Gerar resumo</button>
    <button class="btn small" data-action="case-request-docs" data-id="${k.id}">Solicitar docs da área</button>
    <button class="btn small danger" data-action="case-lost" data-id="${k.id}">Perdida</button></div>
  ${k.summary ? `<details class="more" open><summary>Resumo para Vilmar (${dtBR(k.summary.at)})</summary><div class="summary-card">${esc(k.summary.text)}</div></details>` : ''}
  ${(k.triageAnswers || []).length ? `<details class="more" open><summary>Triagem (${k.triageAnswers.length})</summary><div class="list">${k.triageAnswers.map(a => `<div class="item" style="font-size:12px">${esc(a)}</div>`).join('')}</div></details>` : ''}
  <details class="more" open><summary>Documentos (${docs.length})</summary>
    <div class="row" style="margin-bottom:8px"><button class="btn small" data-action="doc-add" data-id="${k.id}">+ Registrar documento</button><button class="btn small" data-action="doc-request-custom" data-id="${k.id}">+ Solicitar documento</button></div>
    <div class="list">${docs.map(d => docRow(d)).join('') || '<div class="empty">Nenhum documento.</div>'}</div></details>
  <details class="more"><summary>Tarefas (${tasks.length})</summary><div class="list">${tasks.map(t => `<div class="item"><div class="between"><strong>${esc(t.title)}</strong><span>${t.status === 'concluida' ? '<span class="badge good">concluída</span>' : `<button class="btn small" data-action="task-done" data-id="${t.id}">Concluir</button>`}</span></div></div>`).join('') || '<div class="empty">Nenhuma.</div>'}</div></details>
  <details class="more"><summary>Reuniões (${appts.length})</summary><div class="list">${appts.map(a => `<div class="item"><div class="between"><strong>${dateBR(a.date)} ${a.time}</strong><span class="badge">${esc(a.status)}</span></div></div>`).join('') || '<div class="empty">Nenhuma.</div>'}</div></details>
  <details class="more"><summary>Histórico</summary><div class="timeline">${tl.map(t => `<div class="tl"><span class="when">${dtBR(t.at)}</span><span>${esc(t.text)}</span></div>`).join('') || '<div class="empty">Sem eventos.</div>'}</div></details>
  <div class="row" style="margin-top:12px"><button class="btn" data-close>Fechar</button></div>`);
}

/* editor de estágios do funil */
function stagesEditor() {
  openModal(`<h3>Estágios do funil</h3><div class="list" id="stageList">${N.stages().map((s, i) => `
    <div class="item"><div class="between"><strong>${i + 1}. ${esc(s.name)}</strong><span class="row">
    <button class="btn small" data-action="stage-up" data-id="${s.id}">↑</button>
    <button class="btn small" data-action="stage-rename" data-id="${s.id}">Renomear</button>
    <button class="btn small danger" data-action="stage-del" data-id="${s.id}">Excluir</button></span></div>
    <div class="muted mono" style="font-size:10px">${s.id} · ${S.cases.filter(k => k.stageId === s.id && k.status === 'aberto').length} demanda(s)</div></div>`).join('')}</div>
  <div class="row" style="margin-top:10px"><button class="btn primary" data-action="stage-add">+ Estágio</button><button class="btn" data-close>Fechar</button></div>`);
}

Object.assign(N, { contactDetail, contactEdit, companyEdit, companyDetail, linkCompanyModal, caseEdit, caseDetail, stagesEditor, docRow, chatCase });
})();
