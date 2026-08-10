/* NAVE — telas: Agenda, Tarefas, Jurídico, Financeiro, Assistente, Sistema, Configurações */
(() => {
'use strict';
const N = window.NAVE, S = N.state;
const { $, esc, money, dateBR, dtBR, today, now, addDays, daysDiff, openModal, closeModal, toast, uid, sset } = N;

/* ============================== AGENDA ============================== */
N.views.agenda = function renderAgenda() {
  const el = $('view-agenda');
  const days = [0, 1, 2, 3, 4, 5, 6].map(n => addDays(today(), n));
  const upcoming = S.appointments.filter(a => a.date >= today() && a.status !== 'cancelado').sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  el.innerHTML = `<div class="section-head"><div><div class="eyebrow">Agenda operacional</div><h2>Agenda</h2></div>
    <button class="btn primary" data-action="new-appointment">+ Compromisso</button></div>
  <div class="grid grid2"><div class="card"><strong>Próximos 7 dias</strong>
    <div class="list" style="margin-top:10px">${days.map(d => {
      const appts = S.appointments.filter(a => a.date === d && a.status !== 'cancelado').sort((a, b) => a.time.localeCompare(b.time));
      const free = N.checkCalendar(d);
      return `<div class="item"><div class="between"><strong>${dateBR(d)}${d === today() ? ' · hoje' : ''}</strong><span class="muted" style="font-size:10px">${free.length ? free.length + ' horário(s) livre(s)' : (N.slotsForDate(d).length ? 'lotado' : 'sem expediente')}</span></div>
      ${appts.map(a => `<div class="between" style="margin-top:6px;font-size:12px"><span>🕐 ${a.time} — ${esc(a.title)} ${a.contactId ? '(' + esc(N.contactById(a.contactId)?.name || '') + ')' : ''}</span>
        <span class="row"><span class="badge">${esc(a.status)}</span>
        ${['agendado', 'remarcado'].includes(a.status) ? `<button class="btn small" data-action="appt-status" data-id="${a.id}" data-status="confirmado">Confirmar</button>` : ''}
        ${a.status !== 'realizado' ? `<button class="btn small" data-action="appt-reschedule" data-id="${a.id}">Remarcar</button>
        <button class="btn small" data-action="appt-status" data-id="${a.id}" data-status="realizado">Realizada</button>
        <button class="btn small danger" data-action="appt-status" data-id="${a.id}" data-status="cancelado">Cancelar</button>` : ''}</span></div>`).join('') || '<div class="muted" style="font-size:11px;margin-top:5px">Sem compromissos.</div>'}</div>`;
    }).join('')}</div></div>
  <div class="card"><strong>Todos os próximos (${upcoming.length})</strong>
    <div class="list" style="margin-top:10px">${upcoming.slice(0, 20).map(a => {
      const c = N.contactById(a.contactId);
      return `<div class="item"><div class="between"><strong>${dateBR(a.date)} ${a.time} — ${esc(a.title)}</strong><span class="badge">${esc(a.status)}</span></div>
      <div class="muted" style="font-size:11px">${c ? esc(c.name) : 'sem cliente'}${a.caseId ? ' · ' + esc(N.caseById(a.caseId)?.title || '') : ''}</div></div>`;
    }).join('') || '<div class="empty"><strong>Agenda livre</strong>O agente de IA agenda automaticamente quando o cliente pede.</div>'}</div>
    <div class="wa-note" style="margin-top:8px">Expediente: ${S.config.agenda.startHour}h–${S.config.agenda.endHour}h, dias úteis. Ajuste em ⚙ Configurações.</div></div></div>`;
};

function appointmentModal(apptId) {
  const a = apptId ? S.appointments.find(x => x.id === apptId) : null;
  openModal(`<h3>${a ? 'Remarcar compromisso' : 'Novo compromisso'}</h3><form id="apptForm">
  ${a ? `<div class="item" style="margin-bottom:10px">${esc(a.title)} — atual: ${dateBR(a.date)} ${a.time}</div>` : `
  <div class="field"><label>Título</label><input name="title" required placeholder="Reunião inicial"></div>
  <div class="field"><label>Cliente</label><select name="contactId"><option value="">—</option>${S.contacts.map(c => `<option value="${c.id}">${esc(c.name)}</option>`).join('')}</select></div>
  <div class="field"><label>Demanda</label><select name="caseId"><option value="">—</option>${S.cases.filter(k => k.status === 'aberto').map(k => `<option value="${k.id}">${esc(k.title)}</option>`).join('')}</select></div>`}
  <div class="grid grid2"><div class="field"><label>Data</label><input name="date" type="date" required value="${addDays(today(), 1)}"></div>
  <div class="field"><label>Hora</label><select name="time" id="apptTime"></select></div></div>
  <div class="slotgrid" id="apptSlots"></div>
  <div class="row" style="margin-top:10px"><button class="btn primary">${a ? 'Remarcar' : 'Agendar'}</button><button type="button" class="btn" data-close>Cancelar</button></div></form>`);
  const form = $('apptForm');
  const refreshSlots = () => {
    const d = form.date.value;
    const slots = N.slotsForDate(d);
    $('apptSlots').innerHTML = slots.map(s => `<span class="slot ${s.taken ? 'taken' : ''}">${s.time}</span>`).join('') || '<span class="muted" style="font-size:11px">Sem expediente nesta data.</span>';
    $('apptTime').innerHTML = slots.filter(s => !s.taken).map(s => `<option>${s.time}</option>`).join('') || '<option value="">—</option>';
  };
  form.date.onchange = refreshSlots; refreshSlots();
  form.onsubmit = async e => {
    e.preventDefault();
    const f = new FormData(form);
    try {
      if (a) await N.rescheduleAppointment(a.id, f.get('date'), f.get('time'), 'vilmar');
      else await N.createAppointment({ title: f.get('title'), contactId: f.get('contactId'), caseId: f.get('caseId'), date: f.get('date'), time: f.get('time') }, 'vilmar');
      closeModal(); N.render(); toast(a ? 'Remarcado' : 'Agendado');
    } catch (err) { toast(err.message); }
  };
}

/* ============================== TAREFAS ============================== */
N.views.tarefas = function renderTarefas() {
  const el = $('view-tarefas');
  const filter = S.taskFilter || 'abertas';
  let list = S.tasks.slice().sort((a, b) => (a.due || '').localeCompare(b.due || ''));
  if (filter === 'abertas') list = list.filter(t => t.status === 'aberta' && t.kind !== 'aprovacao');
  if (filter === 'aprovacoes') list = list.filter(t => t.kind === 'aprovacao' && t.status === 'aberta');
  if (filter === 'vencidas') list = list.filter(t => t.status === 'aberta' && daysDiff(t.due) < 0);
  if (filter === 'hoje') list = list.filter(t => t.status === 'aberta' && t.due === today());
  if (filter === 'concluidas') list = list.filter(t => t.status === 'concluida').reverse();
  const chips = [['abertas', 'Abertas'], ['hoje', 'Hoje'], ['vencidas', 'Vencidas'], ['aprovacoes', 'Aprovações IA'], ['concluidas', 'Concluídas']];
  el.innerHTML = `<div class="section-head"><div><div class="eyebrow">Central de tarefas e pendências</div><h2>Tarefas</h2></div>
    <button class="btn primary" data-action="new-task">+ Tarefa</button></div>
  <div class="chips">${chips.map(([k, l]) => `<button class="chip ${filter === k ? 'active' : ''}" data-action="task-filter" data-id="${k}">${l} (${k === 'abertas' ? S.tasks.filter(t => t.status === 'aberta' && t.kind !== 'aprovacao').length : k === 'aprovacoes' ? S.tasks.filter(t => t.kind === 'aprovacao' && t.status === 'aberta').length : k === 'vencidas' ? S.tasks.filter(t => t.status === 'aberta' && daysDiff(t.due) < 0).length : k === 'hoje' ? S.tasks.filter(t => t.status === 'aberta' && t.due === today()).length : S.tasks.filter(t => t.status === 'concluida').length})</button>`).join('')}</div>
  <div class="list">${list.slice(0, 60).map(t => {
    const c = N.contactById(t.contactId); const k = N.caseById(t.caseId);
    return `<div class="item ${t.status === 'aberta' && daysDiff(t.due) < 0 ? 'fatal' : ''}">
      <div class="between"><strong>${t.kind === 'aprovacao' ? '⚖ ' : ''}${esc(t.title)}</strong>
      <span class="row"><span class="badge ${t.priority === 'alta' ? 'hot' : ''}">${esc(t.priority)}</span><span class="mono ${daysDiff(t.due) < 0 && t.status === 'aberta' ? 'bad' : ''}">${dateBR(t.due)}</span></span></div>
      <div class="muted" style="font-size:11px">${esc(t.desc || '')}${c ? ' · ' + esc(c.name) : ''}${k ? ' · ' + esc(k.title) : ''} · origem: ${esc(t.origin || '—')} · responsável: ${esc(t.assignee)}</div>
      <div class="row" style="margin-top:7px">${t.status === 'aberta' ? (t.kind === 'aprovacao' ?
        `<button class="btn small primary" data-action="approve-action" data-id="${t.id}">Aprovar e executar</button><button class="btn small danger" data-action="reject-action" data-id="${t.id}">Rejeitar</button>` :
        `<button class="btn small primary" data-action="task-done" data-id="${t.id}">Concluir</button>`) : `<span class="badge good">concluída ${dtBR(t.completedAt)}</span>`}
      ${k ? `<button class="btn small" data-action="case-detail" data-id="${k.id}">Demanda</button>` : ''}</div></div>`;
  }).join('') || '<div class="empty"><strong>Nada aqui</strong></div>'}</div>`;
};
function taskModal() {
  openModal(`<h3>Nova tarefa</h3><form id="taskForm">
  <div class="field"><label>Título</label><input name="title" required></div>
  <div class="field"><label>Detalhes</label><textarea name="desc"></textarea></div>
  <div class="grid grid2"><div class="field"><label>Prioridade</label><select name="priority"><option>normal</option><option>alta</option><option>baixa</option></select></div>
  <div class="field"><label>Prazo</label><input name="due" type="date" value="${today()}"></div>
  <div class="field"><label>Cliente</label><select name="contactId"><option value="">—</option>${S.contacts.map(c => `<option value="${c.id}">${esc(c.name)}</option>`).join('')}</select></div>
  <div class="field"><label>Demanda</label><select name="caseId"><option value="">—</option>${S.cases.filter(k => k.status === 'aberto').map(k => `<option value="${k.id}">${esc(k.title)}</option>`).join('')}</select></div></div>
  <div class="row"><button class="btn primary">Criar</button><button type="button" class="btn" data-close>Cancelar</button></div></form>`);
  $('taskForm').onsubmit = async e => {
    e.preventDefault(); const f = new FormData(e.target);
    await N.createTask({ title: f.get('title'), desc: f.get('desc'), priority: f.get('priority'), due: f.get('due'), contactId: f.get('contactId'), caseId: f.get('caseId'), origin: 'manual' }, 'vilmar');
    closeModal(); N.render(); toast('Tarefa criada');
  };
}

/* ============================== JURÍDICO (portado) ============================== */
N.views.juridico = function renderJuridico() {
  const el = $('view-juridico');
  el.innerHTML = `<div class="section-head"><div><div class="eyebrow">Processos e prazos</div><h2>Jurídico</h2></div>
  <div class="row"><button class="btn primary" data-action="new-process">+ Processo</button></div></div>
  <div class="grid grid2"><div class="card"><div class="between"><strong>Processos</strong><span class="badge">${S.processes.length}</span></div>
  <div class="list" style="margin-top:10px">${S.processes.map(p => `<div class="item"><div class="between"><strong>${esc(p.number)}</strong><span class="badge">${esc(p.phase)}</span></div>
    <div class="muted" style="font-size:11px">${esc(p.clientName)} · ${esc(p.court || 'tribunal não informado')}</div>
    <div class="pillbar" style="margin-top:8px"><i style="width:${['Pré-judicial', 'Inicial', 'Instrução', 'Sentença', 'Recurso', 'Encerrado'].indexOf(p.phase) >= 0 ? (['Pré-judicial', 'Inicial', 'Instrução', 'Sentença', 'Recurso', 'Encerrado'].indexOf(p.phase) + 1) / 6 * 100 : 0}%"></i></div>
    <div class="row" style="margin-top:8px"><button class="btn small" data-action="process-detail" data-id="${p.id}">Abrir</button><button class="btn small" data-action="client-summary" data-id="${p.id}">Resumo cliente</button></div></div>`).join('') || '<div class="empty"><strong>Nenhum processo</strong></div>'}</div></div>
  <div class="card"><div class="between"><strong>Prazos e audiências</strong><button class="btn small primary" data-action="new-deadline">+ Prazo</button></div>
  <div class="list" style="margin-top:10px">${S.deadlines.slice().sort((a, b) => a.date.localeCompare(b.date)).slice(0, 8).map(d => `<div class="item ${daysDiff(d.date) <= 5 && daysDiff(d.date) >= 0 ? 'fatal' : ''}"><div class="between"><strong>${esc(d.title)}</strong><span class="mono">${dateBR(d.date)}</span></div>
    <div class="muted" style="font-size:11px">${esc(d.type)} · ${esc(d.processNumber || 'sem processo')}</div></div>`).join('') || '<div class="empty"><strong>Nenhum prazo</strong></div>'}</div></div></div>
  <div class="card" style="margin-top:12px"><div class="between"><strong>Publicação → análise humana</strong><button class="btn small" data-action="publication">Analisar texto</button></div>
  <textarea id="pubText" style="width:100%;background:#090b0e;border:1px solid var(--line);color:var(--text);border-radius:9px;padding:10px;min-height:90px" placeholder="Cole aqui o texto da publicação..."></textarea>
  <div class="muted" style="font-size:10px;margin-top:6px">A IA apenas sugere. O prazo só entra no sistema após confirmação.</div></div>`;
};
function processModal() {
  if (!S.contacts.length) { toast('Cadastre um contato primeiro'); return; }
  openModal(`<h3>Novo processo</h3><form id="processForm">
  <div class="field"><label>Cliente</label><select name="contactId" required>${S.contacts.map(c => `<option value="${c.id}">${esc(c.name)}</option>`).join('')}</select></div>
  <div class="field"><label>Número</label><input name="number" required placeholder="Número CNJ"></div>
  <div class="field"><label>Vara / tribunal</label><input name="court"></div>
  <div class="field"><label>Fase</label><select name="phase"><option>Pré-judicial</option><option>Inicial</option><option>Instrução</option><option>Sentença</option><option>Recurso</option><option>Encerrado</option></select></div>
  <div class="row"><button class="btn primary">Salvar</button><button type="button" class="btn" data-close>Cancelar</button></div></form>`);
  $('processForm').onsubmit = async e => {
    e.preventDefault(); const f = new FormData(e.target); const c = N.contactById(f.get('contactId'));
    S.processes.push({ id: uid(), clientId: c.id, clientName: c.name, number: f.get('number'), court: f.get('court'), phase: f.get('phase'), responsible: S.config.lawyer || '', createdAt: now(), folder: 'VGJ-' + c.id });
    await N.persist('processes'); closeModal(); toast('Processo criado');
  };
}
function processDetail(id) {
  const p = S.processes.find(x => x.id === id); if (!p) return;
  openModal(`<h3>${esc(p.number)}</h3><div class="kv"><b>Cliente</b><span>${esc(p.clientName)}</span><b>Tribunal</b><span>${esc(p.court || '—')}</span><b>Fase</b><span>${esc(p.phase)}</span><b>Pasta</b><span class="mono">${esc(p.folder || '—')}</span></div>
  <div class="row" style="margin-top:10px"><button class="btn" data-action="client-summary" data-id="${p.id}">Resumo cliente</button>${p.phase !== 'Encerrado' ? `<button class="btn danger" data-action="end-process" data-id="${p.id}">Encerrar</button>` : ''}<button class="btn" data-close>Fechar</button></div>`);
}
function endProcess(id) {
  const p = S.processes.find(x => x.id === id); if (!p) return;
  openModal(`<h3>Encerrar processo</h3><form id="endForm"><div class="field"><label>Resultado</label><select name="result"><option>favorável</option><option>parcialmente favorável</option><option>desfavorável</option><option>acordo</option><option>arquivado</option></select></div>
  <div class="field"><label>Aprendizado (1 linha)</label><input name="learning" required></div>
  <div class="row"><button class="btn primary">Salvar</button><button type="button" class="btn" data-close>Cancelar</button></div></form>`);
  $('endForm').onsubmit = async e => {
    e.preventDefault(); const f = new FormData(e.target);
    p.phase = 'Encerrado'; p.result = f.get('result'); p.closedAt = now();
    S.learnings.push({ id: uid(), text: f.get('learning'), source: 'processo ' + p.number, result: p.result, createdAt: now() });
    await Promise.all([sset('processes', S.processes), sset('learnings', S.learnings)]);
    closeModal(); N.render(); toast('Processo encerrado');
  };
}
function clientSummary(pid) {
  const p = S.processes.find(x => x.id === pid); if (!p) return;
  const ds = S.deadlines.filter(d => d.processId === pid).sort((a, b) => a.date.localeCompare(b.date));
  const text = `Olá, ${p.clientName}. Atualização do seu processo: ${p.number === 'A definir' ? 'o processo ainda está em fase de organização inicial' : `o processo ${p.number} está na fase de ${p.phase}`}. ${ds[0] ? `O próximo compromisso registrado é ${ds[0].title}, em ${dateBR(ds[0].date)}.` : 'No momento, não há prazo ou audiência próximo cadastrado.'} Se houver qualquer mudança relevante, atualizaremos você por aqui.`;
  openModal(`<h3>Resumo para o cliente</h3><div class="field"><textarea id="copyText">${esc(text)}</textarea></div><div class="row"><button class="btn primary" data-copy="#copyText">Copiar</button><button class="btn" data-close>Fechar</button></div>`);
}
function deadlineModal() {
  openModal(`<h3>Novo prazo / audiência</h3><form id="deadlineForm">
  <div class="field"><label>Título</label><input name="title" required></div>
  <div class="field"><label>Data</label><input name="date" type="date" required value="${addDays(today(), 1)}"></div>
  <div class="field"><label>Tipo</label><select name="type"><option value="fatal">fatal</option><option value="common">comum</option><option value="hearing">audiência</option></select></div>
  <div class="field"><label>Processo</label><select name="processId"><option value="">Sem processo</option>${S.processes.map(p => `<option value="${p.id}">${esc(p.number)} — ${esc(p.clientName)}</option>`).join('')}</select></div>
  <div class="row"><button class="btn primary">Salvar</button><button type="button" class="btn" data-close>Cancelar</button></div></form>`);
  $('deadlineForm').onsubmit = async e => {
    e.preventDefault(); const f = new FormData(e.target); const p = S.processes.find(x => x.id === f.get('processId'));
    S.deadlines.push({ id: uid(), title: f.get('title'), date: f.get('date'), type: f.get('type'), processId: f.get('processId'), processNumber: p?.number || '', createdAt: now() });
    await N.persist('deadlines'); closeModal(); toast('Prazo salvo');
  };
}

/* ============================== FINANCEIRO (portado) ============================== */
N.views.financeiro = function renderFinanceiro() {
  const el = $('view-financeiro');
  const month = today().slice(0, 7);
  const all = S.contracts.flatMap(c => (c.installments || []).map(i => ({ ...i, client: c.client, contractId: c.id, area: c.area || 'não informada' })));
  const received = all.filter(i => i.status === 'paid' && i.paidAt?.slice(0, 7) === month).reduce((a, i) => a + Number(i.value || 0), 0);
  const receivable = all.filter(i => i.status !== 'paid' && i.dueDate?.slice(0, 7) === month).reduce((a, i) => a + Number(i.value || 0), 0);
  const overdue = all.filter(i => i.status !== 'paid' && daysDiff(i.dueDate) < 0).reduce((a, i) => a + Number(i.value || 0), 0);
  const goal = Number(S.config.goal) || 0, pct = goal ? Math.min(100, received / goal * 100) : 0;
  el.innerHTML = `<div class="section-head"><div><div class="eyebrow">Honorários e cobrança</div><h2>Financeiro</h2></div>
  <button class="btn primary" data-action="new-contract">+ Contrato</button></div>
  <div class="grid grid3"><div class="card metric"><div class="label">Recebido no mês</div><div class="num">${money(received)}</div><div class="progress"><i style="width:${pct}%"></i></div><div class="status ${pct >= 100 ? 'good' : ''}">${goal ? pct.toFixed(0) + '% da meta' : 'defina uma meta em ⚙'}</div></div>
  <div class="card metric"><div class="label">A receber no mês</div><div class="num">${money(receivable)}</div></div>
  <div class="card metric"><div class="label">Inadimplência</div><div class="num bad">${money(overdue)}</div></div></div>
  <div class="card" style="margin-top:12px"><div class="between"><strong>Contratos</strong><span class="badge">${S.contracts.length}</span></div>
  <div class="table-wrap"><table class="table"><thead><tr><th>Cliente</th><th>Total</th><th>Parcelas</th><th>Êxito</th><th>Ação</th></tr></thead>
  <tbody>${S.contracts.map(c => `<tr><td>${esc(c.client)}</td><td>${money(c.total)}</td><td>${(c.installments || []).length}</td><td>${Number(c.success || 0)}%</td><td><button class="btn small" data-action="contract-detail" data-id="${c.id}">Ver</button></td></tr>`).join('') || '<tr><td colspan="5" class="muted">Nenhum contrato.</td></tr>'}</tbody></table></div></div>
  <div class="card" style="margin-top:12px"><div class="between"><strong>Parcelas</strong><span class="badge">${all.length}</span></div>
  <div class="list" style="margin-top:10px">${all.sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || '')).slice(0, 15).map(i => {
    const late = i.status !== 'paid' && daysDiff(i.dueDate) < 0;
    return `<div class="item ${late ? 'fatal' : ''}"><div class="between"><strong>${esc(i.client)} · ${money(i.value)}</strong><span>${dateBR(i.dueDate)}</span></div>
    <div class="muted" style="font-size:11px">${i.status === 'paid' ? 'Paga' : late ? 'Atrasada' : 'Pendente'}</div>
    <div class="row" style="margin-top:7px">${i.status !== 'paid' ? `<button class="btn small" data-action="charge" data-id="${i.contractId}" data-installment="${i.id}">Cobrar</button><button class="btn small primary" data-action="pay" data-id="${i.contractId}" data-installment="${i.id}">Registrar pagamento</button>` : '<span class="good" style="font-size:10px">Pagamento registrado</span>'}</div></div>`;
  }).join('') || '<div class="empty"><strong>Nenhuma parcela</strong></div>'}</div></div>`;
};
function contractModal() {
  if (!S.contacts.length) { toast('Cadastre um contato primeiro'); return; }
  openModal(`<h3>Novo contrato</h3><form id="contractForm">
  <div class="field"><label>Cliente</label><select name="contactId" required>${S.contacts.map(c => `<option value="${c.id}">${esc(c.name)}</option>`).join('')}</select></div>
  <div class="grid grid2"><div class="field"><label>Valor total</label><input name="total" type="number" step="100" required></div>
  <div class="field"><label>Parcelas</label><input name="parts" type="number" min="1" max="60" value="1"></div>
  <div class="field"><label>Entrada</label><input name="entry" type="number" step="100" value="0"></div>
  <div class="field"><label>% de êxito</label><input name="success" type="number" min="0" max="100" value="0"></div>
  <div class="field"><label>Primeiro vencimento</label><input name="firstDue" type="date" value="${addDays(today(), 30)}"></div>
  <div class="field"><label>Área</label><input name="area"></div></div>
  <div class="row"><button class="btn primary">Criar contrato</button><button type="button" class="btn" data-close>Cancelar</button></div></form>`);
  $('contractForm').onsubmit = async e => {
    e.preventDefault(); const f = new FormData(e.target); const c = N.contactById(f.get('contactId'));
    const total = Number(f.get('total') || 0), parts = Math.max(1, Number(f.get('parts') || 1)), entry = Number(f.get('entry') || 0);
    const rest = Math.max(0, total - entry), base = rest / parts;
    const contract = { id: uid(), contactId: c.id, clientId: c.id, client: c.name, total, entry, success: Number(f.get('success') || 0), area: f.get('area') || '', createdAt: now(), installments: [] };
    for (let i = 0; i < parts; i++) contract.installments.push({ id: uid(), value: +(i === parts - 1 ? rest - base * (parts - 1) : base).toFixed(2), dueDate: addDays(f.get('firstDue'), i * 30), status: 'pending' });
    S.contracts.push(contract);
    await N.persist('contracts'); closeModal(); toast('Contrato criado');
    N.emit('contract.signed', { contactId: c.id, kase: N.openCaseForContact(c.id) });
  };
}
function contractDetail(id) {
  const c = S.contracts.find(x => x.id === id); if (!c) return;
  openModal(`<h3>${esc(c.client)}</h3><div class="kv"><b>Total</b><span>${money(c.total)}</span><b>Entrada</b><span>${money(c.entry)}</span><b>Êxito</b><span>${Number(c.success)}%</span><b>Área</b><span>${esc(c.area || '—')}</span></div>
  <div class="list" style="margin-top:10px">${(c.installments || []).map(i => `<div class="item"><div class="between"><strong>${money(i.value)}</strong><span>${dateBR(i.dueDate)}</span></div><div class="muted">${i.status === 'paid' ? 'Paga' : daysDiff(i.dueDate) < 0 ? 'Atrasada' : 'Pendente'}</div></div>`).join('')}</div>
  <button class="btn" style="margin-top:10px" data-close>Fechar</button>`);
}
function charge(contractId, instId) {
  const c = S.contracts.find(x => x.id === contractId), i = c?.installments.find(x => x.id === instId);
  if (!c || !i) return;
  const delta = daysDiff(i.dueDate);
  const text = delta > 0 ? `Olá, ${c.client}. Passando para lembrar que a parcela de ${money(i.value)} vence em ${dateBR(i.dueDate)}. Se precisar de alguma informação para realizar o pagamento, fico à disposição.` :
    delta === 0 ? `Olá, ${c.client}. A parcela de ${money(i.value)} vence hoje (${dateBR(i.dueDate)}).${S.config.pix ? ' PIX: ' + S.config.pix : ''}` :
    `Olá, ${c.client}. Identificamos que a parcela de ${money(i.value)}, com vencimento em ${dateBR(i.dueDate)}, ainda consta como pendente. Se o pagamento já foi realizado, desconsidere esta mensagem.${S.config.pix ? ' PIX: ' + S.config.pix : ''}`;
  openModal(`<h3>Cobrança</h3><div class="field"><textarea id="copyText">${esc(text)}</textarea></div><div class="row"><button class="btn primary" data-copy="#copyText">Copiar</button><button class="btn" data-close>Fechar</button></div>`);
}
function pay(cid, iid) {
  const c = S.contracts.find(x => x.id === cid), i = c?.installments.find(x => x.id === iid);
  if (!i) return;
  openModal(`<h3>Registrar pagamento</h3><p class="muted">Confirme o recebimento de ${money(i.value)} de ${esc(c.client)}.</p>
  <div class="row"><button class="btn primary" id="payYes">Confirmar</button><button class="btn" data-close>Cancelar</button></div>`);
  $('payYes').onclick = async () => { i.status = 'paid'; i.paidAt = now(); await N.persist('contracts'); closeModal(); toast('Pagamento registrado'); };
}

/* ============================== ASSISTENTE (portado) ============================== */
N.views.assistente = function renderAssistente() {
  const el = $('view-assistente');
  el.innerHTML = `<div class="section-head"><div><div class="eyebrow">IA com contexto real do escritório</div><h2>Assistente</h2></div></div>
  <div class="card chat"><div class="chips">
    <button class="chip" data-chip="pre">Pré-atendimento</button><button class="chip" data-chip="follow">Follow-up</button>
    <button class="chip" data-chip="charge">Cobrança</button><button class="chip" data-chip="hearing">Confirmação de audiência</button>
    <button class="chip" data-chip="pub">Publicação</button><button class="chip" data-chip="month">Diagnóstico do mês</button></div>
  <div class="messages" id="messages">${S.chat.length ? S.chat.slice(-20).map(m => `<div class="bubble ${m.role === 'user' ? 'user' : 'ai'}">${esc(m.content)}</div>`).join('') : '<div class="empty"><strong>Assistente pronto</strong>O contexto do escritório é enviado à IA somente ao executar.</div>'}</div>
  <div class="composer"><textarea id="chatInput" placeholder="Escreva ou cole o conteúdo..."></textarea><button class="btn primary" id="sendAI">Enviar</button></div></div>`;
  $('sendAI').onclick = () => sendAssistant('');
  document.querySelectorAll('[data-chip]').forEach(b => b.onclick = () => {
    const templates = { pre: 'Cole a mensagem do lead e faça pré-atendimento com triagem + resposta pronta.', follow: 'Gere um follow-up para uma oportunidade parada. Informe nome, estágio e dias sem contato.', charge: 'Gere uma cobrança para uma parcela. Informe cliente, valor, vencimento e dias de atraso.', hearing: 'Gere uma confirmação de audiência. Informe cliente, data, horário e processo.', pub: 'Cole a publicação e resuma, apontando eventual prazo a cadastrar. Não cadastre automaticamente.', month: 'Faça um diagnóstico do mês usando os números reais do escritório.' };
    $('chatInput').value = templates[b.dataset.chip] || ''; $('chatInput').focus();
  });
};
async function sendAssistant(prefix) {
  const input = $('chatInput');
  const text = (prefix || input?.value || '').trim();
  if (!text) return;
  S.chat.push({ id: uid(), role: 'user', content: text, at: now() });
  await sset('chat', S.chat); N.views.assistente();
  const system = `Você é o Assistente VGJ LAW do escritório ${S.config.office}. Responda em português do Brasil, em até ~180 palavras. Use apenas os dados fornecidos. Nunca invente jurisprudência, processos, estatísticas ou fatos. Para textos ao cliente, entregue texto pronto para copiar. Observe o Provimento 205/2021 e não prometa resultado. Contexto real: ${JSON.stringify(N.aiContext())}`;
  try {
    const answer = (await N.aiMessages(system, [{ role: 'user', content: text }], 1000)) || 'Não foi possível obter resposta.';
    S.chat.push({ id: uid(), role: 'assistant', content: answer, at: now() });
  } catch (e) {
    S.chat.push({ id: uid(), role: 'assistant', content: 'Não foi possível consultar a IA agora: ' + (e?.message || 'erro') + ' A operação não foi perdida.', at: now() });
  }
  await sset('chat', S.chat); N.views.assistente();
}
function publication() {
  const t = $('pubText')?.value.trim();
  if (!t) { toast('Cole o texto da publicação'); return; }
  N.nav('assistente');
  $('chatInput').value = 'Analise esta publicação. Resuma em linguagem objetiva, identifique eventual prazo e sugira os campos para cadastro. Não cadastre automaticamente.\n\n' + t;
  $('chatInput').focus();
}

/* ============================== SISTEMA ============================== */
N.views.sistema = function renderSistema() {
  const el = $('view-sistema');
  const tab = S.systemTab || 'automacoes';
  const tabs = [['automacoes', 'Automações'], ['triagem', 'Triagem'], ['conhecimento', 'Conhecimento'], ['permissoes', 'Permissões'], ['auditoria', 'Auditoria']];
  let body = '';
  if (tab === 'automacoes') {
    body = `<div class="row" style="margin-bottom:10px"><button class="btn small primary" data-action="new-automation">+ Automação</button><button class="btn small" data-action="run-sweeps">Executar varreduras agora</button></div>
    <div class="list">${S.automations.map(a => `<div class="item"><div class="between"><strong>${esc(a.name)}</strong>
      <label class="switch"><input type="checkbox" data-action="auto-toggle" data-id="${a.id}" ${a.enabled ? 'checked' : ''}><i></i></label></div>
      <div class="muted" style="font-size:11px">Gatilho: ${esc(N.TRIGGERS[a.trigger] || a.trigger)}${a.toStage ? ' → ' + esc(N.stageName(a.toStage)) : ''}${a.days ? ' · ' + a.days + ' dia(s)' : ''}</div>
      <div class="muted" style="font-size:10px;margin-top:4px">${(a.actions || []).map(x => esc(N.ACTIONS[x.type] || x.type) + (x.title ? ': ' + esc(x.title) : x.template ? ': "' + esc(String(x.template).slice(0, 60)) + '..."' : x.stage ? ' → ' + esc(N.stageName(x.stage)) : '')).join(' · ')}</div>
      <div class="row" style="margin-top:6px"><button class="btn small" data-action="auto-edit" data-id="${a.id}">Editar</button>${!a.key ? `<button class="btn small danger" data-action="auto-del" data-id="${a.id}">Excluir</button>` : ''}</div></div>`).join('')}</div>`;
  } else if (tab === 'triagem') {
    body = `<div class="row" style="margin-bottom:10px"><button class="btn small primary" data-action="new-flow">+ Fluxo de triagem</button></div>
    <div class="list">${S.triageFlows.map(f => `<div class="item"><div class="between"><strong>${esc(f.label)}</strong><span class="row"><span class="badge ${f.priority === 'alta' ? 'hot' : ''}">${esc(f.priority)}</span><button class="btn small" data-action="flow-edit" data-id="${f.id}">Editar</button></span></div>
      <div class="muted" style="font-size:11px">${(f.questions || []).length} pergunta(s) · docs: ${esc((f.docs || []).join(', ') || '—')} · destino: ${esc(N.stageName(f.targetStage))}</div>
      <div class="muted" style="font-size:10px;margin-top:3px">Handoff: ${esc(f.handoff || '—')}</div></div>`).join('')}</div>`;
  } else if (tab === 'conhecimento') {
    body = `<div class="row" style="margin-bottom:10px"><button class="btn small primary" data-action="new-knowledge">+ Item</button></div>
    <div class="list">${S.knowledge.map(kb => `<div class="item"><div class="between"><strong>${esc(kb.title)}</strong><span class="row"><span class="badge">${esc(kb.category)}</span><button class="btn small" data-action="kb-edit" data-id="${kb.id}">Editar</button><button class="btn small danger" data-action="kb-del" data-id="${kb.id}">Excluir</button></span></div>
      <div class="muted" style="font-size:11px;white-space:pre-wrap">${esc(kb.content)}</div></div>`).join('') || '<div class="empty">Vazio</div>'}</div>
    <div class="wa-note" style="margin-top:8px">Conhecimento institucional que o agente pode consultar. Decisão jurídica não entra aqui — vai sempre para Vilmar.</div>`;
  } else if (tab === 'permissoes') {
    body = `<div class="wa-note" style="margin-bottom:10px">Papéis: ${S.config.roles.join(', ')}. O agente IA tem permissões próprias por ferramenta: <strong>permitido</strong> executa e audita; <strong>aprovação</strong> cria pendência para Vilmar; <strong>bloqueado</strong> nunca executa. Ações críticas (petições, acordos, honorários, estratégia) não existem como ferramenta — são sempre humanas.</div>
    <div class="table-wrap"><table class="table"><thead><tr><th>Ferramenta da IA</th><th>Política</th></tr></thead><tbody>
    ${N.TOOL_DEFS.map(t => `<tr><td title="${esc(t.description)}">${esc(t.name)}</td><td><select data-action="perm-set" data-id="${t.name}" class="btn small" style="font-weight:400">
      ${['allow', 'approve', 'block'].map(p => `<option value="${p}" ${N.iaCan(t.name) === p ? 'selected' : ''}>${{ allow: 'permitido', approve: 'exige aprovação', block: 'bloqueado' }[p]}</option>`).join('')}</select></td></tr>`).join('')}</tbody></table></div>`;
  } else if (tab === 'auditoria') {
    body = `<div class="wa-note" style="margin-bottom:8px">Toda ação (IA, sistema, humano) fica registrada. ${S.auditLog.length} registro(s).</div>
    <div>${S.auditLog.slice(0, 80).map(a => `<div class="audit-row"><span class="when mono" style="color:#666">${dtBR(a.at)}</span><span class="who">${esc(a.actor)}</span><span>${esc(a.detail || a.action)}${a.result && a.result !== 'ok' ? ` <span class="badge bad">${esc(a.result)}</span>` : ''}</span></div>`).join('') || '<div class="empty">Sem registros.</div>'}</div>`;
  }
  el.innerHTML = `<div class="section-head"><div><div class="eyebrow">Motor do NAVE</div><h2>Sistema</h2></div></div>
  <div class="tabbar">${tabs.map(([k, l]) => `<button class="${tab === k ? 'active' : ''}" data-action="system-tab" data-id="${k}">${l}</button>`).join('')}</div>${body}`;
};

/* modais do Sistema */
function automationModal(id) {
  const a = id ? S.automations.find(x => x.id === id) : null;
  const act = a?.actions?.[0] || {};
  openModal(`<h3>${a ? 'Editar automação' : 'Nova automação'}</h3><form id="autoForm">
  <div class="field"><label>Nome</label><input name="name" required value="${esc(a?.name || '')}"></div>
  <div class="field"><label>Gatilho</label><select name="trigger">${Object.entries(N.TRIGGERS).map(([k, l]) => `<option value="${k}" ${a?.trigger === k ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
  <div class="field"><label>Se gatilho = mudança de estágio, para qual estágio? (opcional)</label><select name="toStage"><option value="">qualquer</option>${N.stages().map(s => `<option value="${s.id}" ${a?.toStage === s.id ? 'selected' : ''}>${esc(s.name)}</option>`).join('')}</select></div>
  <div class="field"><label>Dias (para varreduras)</label><input name="days" type="number" min="1" value="${a?.days || 2}"></div>
  <div class="field"><label>Ação</label><select name="actType">${Object.entries(N.ACTIONS).map(([k, l]) => `<option value="${k}" ${act.type === k ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
  <div class="field"><label>Título da tarefa (use {cliente}, {data}, {docs}, {motivo}, {titulo})</label><input name="actTitle" value="${esc(act.title || '')}"></div>
  <div class="field"><label>Modelo de mensagem WhatsApp (use {nome}, {docs}, {hora})</label><textarea name="actTemplate">${esc(act.template || '')}</textarea></div>
  <div class="field"><label>Estágio destino (para "Mover para estágio")</label><select name="actStage"><option value="">—</option>${N.stages().map(s => `<option value="${s.id}" ${act.stage === s.id ? 'selected' : ''}>${esc(s.name)}</option>`).join('')}</select></div>
  <div class="row"><button class="btn primary">Salvar</button><button type="button" class="btn" data-close>Cancelar</button></div></form>`);
  $('autoForm').onsubmit = async e => {
    e.preventDefault(); const f = new FormData(e.target);
    const action = { type: f.get('actType') };
    if (f.get('actTitle')) action.title = f.get('actTitle');
    if (f.get('actTemplate')) action.template = f.get('actTemplate');
    if (f.get('actStage')) action.stage = f.get('actStage');
    const data = { name: f.get('name'), trigger: f.get('trigger'), toStage: f.get('toStage') || undefined, days: Number(f.get('days')) || undefined, actions: [action], enabled: a ? a.enabled : true };
    if (a) Object.assign(a, data); else S.automations.push({ id: uid(), ...data });
    await sset('automations', S.automations); closeModal(); N.render(); toast('Automação salva');
  };
}
function flowModal(id) {
  const f0 = id ? S.triageFlows.find(x => x.id === id) : null;
  openModal(`<h3>${f0 ? 'Editar fluxo' : 'Novo fluxo de triagem'}</h3><form id="flowForm">
  <div class="grid grid2"><div class="field"><label>Nome/área</label><input name="label" required value="${esc(f0?.label || '')}"></div>
  <div class="field"><label>Identificador</label><input name="area" ${f0 ? 'readonly' : ''} required value="${esc(f0?.area || '')}" placeholder="ex.: inventario"></div>
  <div class="field"><label>Prioridade</label><select name="priority">${['baixa', 'normal', 'alta'].map(p => `<option ${f0?.priority === p ? 'selected' : ''}>${p}</option>`).join('')}</select></div>
  <div class="field"><label>Estágio destino após qualificar</label><select name="targetStage">${N.stages().map(s => `<option value="${s.id}" ${f0?.targetStage === s.id ? 'selected' : ''}>${esc(s.name)}</option>`).join('')}</select></div></div>
  <div class="field"><label>Palavras-chave (vírgula)</label><input name="keywords" value="${esc((f0?.keywords || []).join(', '))}"></div>
  <div class="field"><label>Perguntas (uma por linha)</label><textarea name="questions">${esc((f0?.questions || []).join('\n'))}</textarea></div>
  <div class="field"><label>Documentos necessários (vírgula)</label><input name="docs" value="${esc((f0?.docs || []).join(', '))}"></div>
  <div class="field"><label>Critério de qualificação</label><input name="qualifyCriteria" value="${esc(f0?.qualifyCriteria || '')}"></div>
  <div class="field"><label>Orientação ao agente</label><input name="guidance" value="${esc(f0?.guidance || '')}"></div>
  <div class="field"><label>Quando transferir para humano</label><input name="handoff" value="${esc(f0?.handoff || '')}"></div>
  <div class="row"><button class="btn primary">Salvar</button><button type="button" class="btn" data-close>Cancelar</button></div></form>`);
  $('flowForm').onsubmit = async e => {
    e.preventDefault(); const fd = new FormData(e.target);
    const data = { label: fd.get('label'), area: fd.get('area').trim().toLowerCase().replace(/\s+/g, '_'), priority: fd.get('priority'),
      targetStage: fd.get('targetStage'), keywords: String(fd.get('keywords') || '').split(',').map(x => x.trim()).filter(Boolean),
      questions: String(fd.get('questions') || '').split('\n').map(x => x.trim()).filter(Boolean),
      docs: String(fd.get('docs') || '').split(',').map(x => x.trim()).filter(Boolean),
      qualifyCriteria: fd.get('qualifyCriteria'), guidance: fd.get('guidance'), handoff: fd.get('handoff') };
    if (f0) Object.assign(f0, data); else S.triageFlows.push({ id: uid(), ...data });
    await sset('triageFlows', S.triageFlows); closeModal(); N.render(); toast('Fluxo salvo');
  };
}
function knowledgeModal(id) {
  const kb = id ? S.knowledge.find(x => x.id === id) : null;
  openModal(`<h3>${kb ? 'Editar' : 'Novo'} conhecimento</h3><form id="kbForm">
  <div class="field"><label>Título</label><input name="title" required value="${esc(kb?.title || '')}"></div>
  <div class="field"><label>Categoria</label><select name="category">${['institucional', 'procedimento', 'documentos', 'faq', 'script', 'regra'].map(c => `<option ${kb?.category === c ? 'selected' : ''}>${c}</option>`).join('')}</select></div>
  <div class="field"><label>Conteúdo</label><textarea name="content" required>${esc(kb?.content || '')}</textarea></div>
  <div class="row"><button class="btn primary">Salvar</button><button type="button" class="btn" data-close>Cancelar</button></div></form>`);
  $('kbForm').onsubmit = async e => {
    e.preventDefault(); const f = new FormData(e.target);
    if (kb) { kb.title = f.get('title'); kb.category = f.get('category'); kb.content = f.get('content'); }
    else S.knowledge.push({ id: uid(), title: f.get('title'), category: f.get('category'), content: f.get('content'), createdAt: now() });
    await sset('knowledge', S.knowledge); closeModal(); N.render(); toast('Salvo');
  };
}

/* ============================== CONFIGURAÇÕES ============================== */
function settingsModal() {
  const c = S.config, w = c.whatsapp;
  openModal(`<h3>Configurações</h3><form id="settingsForm">
  <div class="grid grid2"><div class="field"><label>Escritório</label><input name="office" value="${esc(c.office)}"></div>
  <div class="field"><label>Advogado</label><input name="lawyer" value="${esc(c.lawyer)}"></div>
  <div class="field"><label>OAB</label><input name="oab" value="${esc(c.oab)}"></div>
  <div class="field"><label>Meta mensal (R$)</label><input name="goal" type="number" min="0" step="100" value="${Number(c.goal) || 0}"></div>
  <div class="field"><label>Chave PIX</label><input name="pix" value="${esc(c.pix)}"></div></div>
  <details class="more" open><summary>Inteligência Artificial (Anthropic)</summary>
  <div class="field"><label>Chave da API Anthropic</label><input name="anthropicKey" type="password" autocomplete="off" placeholder="sk-ant-..." value="${esc(c.anthropicApiKey || '')}">
  <div class="muted" style="font-size:10px">Obtenha em platform.claude.com → API Keys. Sem a chave, o agente e o assistente ficam desativados; o restante funciona normalmente.</div></div>
  <div class="field"><label>Modelo</label><input name="aiModel" value="${esc(c.aiModel || 'claude-sonnet-4-6')}"></div></details>
  <details class="more" open><summary>WhatsApp / Zappfy / Agente</summary>
  <div class="grid grid2"><div class="field"><label>Token Zappfy</label><input name="waToken" type="password" autocomplete="off" value="${esc(w.token || '')}"></div>
  <div class="field"><label>Instância</label><input name="waInstance" value="${esc(w.instanceId || '')}"></div>
  <div class="field"><label>Número</label><input name="waPhone" value="${esc(w.phone || '')}"></div>
  <div class="field"><label>Identidade exibida</label><input name="agentName" value="${esc(w.agentName || 'Atendimento do Escritório')}"></div>
  <div class="field"><label>Modo do agente</label><select name="waMode"><option value="autonomo" ${w.mode === 'autonomo' ? 'selected' : ''}>Autônomo — atende e opera o CRM</option><option value="copiloto" ${w.mode === 'copiloto' ? 'selected' : ''}>Copiloto — prepara, não envia</option><option value="humano" ${w.mode === 'humano' ? 'selected' : ''}>Humano — sem IA</option></select></div>
  <div class="field"><label>Sincronização (segundos)</label><input name="pollSec" type="number" min="15" step="5" value="${Math.max(15, Math.round(Number(w.pollMs || 30000) / 1000))}"></div></div>
  <div class="field"><label><input type="checkbox" name="agentEnabled" ${w.agentEnabled !== false ? 'checked' : ''}> Agente ligado</label></div>
  <div class="muted" style="font-size:10px">O agente atua como atendimento institucional do escritório — sem nome de pessoa, sem identidade humana falsa. Grupos de WhatsApp nunca são atendidos.</div></details>
  <details class="more"><summary>Agenda</summary><div class="grid grid3">
  <div class="field"><label>Início (h)</label><input name="agStart" type="number" min="6" max="20" value="${c.agenda.startHour}"></div>
  <div class="field"><label>Fim (h)</label><input name="agEnd" type="number" min="7" max="22" value="${c.agenda.endHour}"></div>
  <div class="field"><label>Duração (min)</label><input name="agSlot" type="number" min="30" step="30" value="${c.agenda.slotMin}"></div></div></details>
  <div class="row" style="margin-top:10px"><button class="btn primary">Salvar</button><button type="button" class="btn" data-close>Fechar</button></div></form>
  <div class="card danger-zone" style="margin-top:16px"><strong>Apagar todos os dados</strong>
  <p class="muted" style="font-size:11px">Ação irreversível.</p><button class="btn danger" id="wipeStart">Apagar dados</button>
  <div id="wipeConfirm" style="display:none;margin-top:9px"><span class="muted" style="font-size:11px">Tem certeza?</span>
  <div class="row" style="margin-top:8px"><button class="btn danger" id="wipeYes">Sim, apagar tudo</button><button class="btn" id="wipeNo">Cancelar</button></div></div></div>`);
  $('settingsForm').onsubmit = async e => {
    e.preventDefault(); const f = new FormData(e.target);
    Object.assign(S.config, { office: f.get('office'), lawyer: f.get('lawyer'), oab: f.get('oab'), goal: Number(f.get('goal') || 0), pix: f.get('pix'),
      anthropicApiKey: String(f.get('anthropicKey') || '').trim(), aiModel: String(f.get('aiModel') || 'claude-sonnet-4-6').trim() || 'claude-sonnet-4-6' });
    Object.assign(S.config.whatsapp, { token: String(f.get('waToken') || '').trim(), instanceId: String(f.get('waInstance') || '').trim(),
      phone: String(f.get('waPhone') || '').trim(), agentName: String(f.get('agentName') || 'Atendimento do Escritório').trim(),
      mode: String(f.get('waMode') || 'autonomo'), agentEnabled: f.has('agentEnabled'), pollMs: Math.max(15000, Number(f.get('pollSec') || 30) * 1000) });
    Object.assign(S.config.agenda, { startHour: Number(f.get('agStart') || 9), endHour: Number(f.get('agEnd') || 18), slotMin: Number(f.get('agSlot') || 60) });
    await sset('config', S.config);
    closeModal(); N.startWaLoop(); N.render(); toast('Configurações salvas');
  };
  $('wipeStart').onclick = () => { $('wipeConfirm').style.display = 'block'; };
  $('wipeNo').onclick = () => { $('wipeConfirm').style.display = 'none'; };
  $('wipeYes').onclick = async () => {
    const KEYS = ['config', 'contacts', 'companies', 'cases', 'pipeline', 'documents', 'tasks', 'appointments', 'automations', 'knowledge', 'triageFlows', 'auditLog', 'contracts', 'processes', 'deadlines', 'learnings', 'chat', 'whatsappChats', 'whatsappMessages', 'waAgentLogs'];
    for (const k of KEYS) { S[k] = (k === 'config') ? N.clone(N.defaultConfig) : (k === 'pipeline' ? null : []); await sset(k, S[k]); }
    N.ensurePipeline(); await N.ensureFlows(); await N.ensureKnowledge(); await N.ensureAutomations();
    closeModal(); N.render(); toast('Dados apagados');
  };
}
function copyText(sel) {
  const el = document.querySelector(sel); if (!el) return;
  (navigator.clipboard?.writeText(el.value || el.textContent || '') || Promise.reject()).then(() => toast('Copiado')).catch(() => { el.select?.(); document.execCommand('copy'); toast('Copiado'); });
}

Object.assign(N, { appointmentModal, taskModal, processModal, processDetail, endProcess, clientSummary, deadlineModal,
  contractModal, contractDetail, charge, pay, sendAssistant, publication, automationModal, flowModal, knowledgeModal, settingsModal, copyText });
})();
