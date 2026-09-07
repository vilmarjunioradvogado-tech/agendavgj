/* NAVE — inicialização, navegação e delegação global de eventos */
(() => {
'use strict';
const N = window.NAVE, S = N.state;
const { $, esc, toast, openModal, closeModal, sset, uid, today } = N;

const NAV = [
  ['painel', '⌂', 'Painel'], ['inbox', '✉', 'Inbox'], ['funil', '◧', 'Funil'], ['clientes', '◎', 'Clientes'],
  ['agenda', '📅', 'Agenda'], ['tarefas', '☑', 'Tarefas'], ['juridico', '§', 'Jurídico'],
  ['financeiro', '¤', 'Financeiro'], ['carrosseis', '▣', 'Carrosséis'], ['assistente', '✦', 'Assistente'], ['sistema', '⚙', 'Sistema']];

function simulateModal() {
  openModal(`<h3>Simular mensagem recebida</h3>
  <p class="wa-note" style="margin-bottom:10px">Testa o fluxo completo (identificação → agente → CRM) sem depender da Zappfy.</p>
  <form id="simForm"><div class="grid grid2"><div class="field"><label>Telefone</label><input name="phone" required value="5577999990001"></div>
  <div class="field"><label>Nome (opcional)</label><input name="name" placeholder="Maria Silva"></div></div>
  <div class="field"><label>Mensagem</label><textarea name="text" required placeholder="Olá, meu plano negou o tratamento do meu filho..."></textarea></div>
  <div class="field"><label><input type="checkbox" name="asDoc"> Simular envio de documento (usa a mensagem como nome do arquivo)</label></div>
  <div class="row"><button class="btn primary">Receber</button><button type="button" class="btn" data-close>Cancelar</button></div></form>`);
  $('simForm').onsubmit = async e => {
    e.preventDefault();
    const f = new FormData(e.target);
    closeModal();
    const media = f.has('asDoc') ? { kind: 'document', filename: String(f.get('text')).slice(0, 60) } : null;
    await N.simulateInbound(f.get('phone'), f.get('text'), { name: f.get('name') || '', media });
    toast('Mensagem simulada recebida');
    N.nav('inbox');
  };
}

function docAddModal(caseId) {
  openModal(`<h3>Registrar documento recebido</h3><form id="docForm">
  <div class="field"><label>Nome do documento</label><input name="name" required placeholder="relatorio-medico.pdf"></div>
  <div class="field"><label>Categoria</label><select name="category"><option value="">(sugerir automaticamente)</option>${N.DOC_CATEGORIES.map(c => `<option>${c}</option>`).join('')}</select></div>
  <div class="field"><label>Arquivo (opcional, até 1,5 MB — fica salvo no VGJ LAW)</label><input name="file" type="file"></div>
  <div class="row"><button class="btn primary">Registrar</button><button type="button" class="btn" data-close>Cancelar</button></div></form>`);
  $('docForm').onsubmit = async e => {
    e.preventDefault();
    const form = e.target, f = new FormData(form);
    let fileData = null, fileType = '';
    const file = form.file.files[0];
    if (file) {
      if (file.size > 1.5 * 1024 * 1024) { toast('Arquivo acima de 1,5 MB — registre apenas os metadados.'); }
      else { fileData = await new Promise(res => { const r = new FileReader(); r.onload = () => res(r.result); r.readAsDataURL(file); }); fileType = file.type; }
    }
    const k = N.caseById(caseId);
    await N.registerDocument({ caseId, contactId: k?.contactId || '', name: file?.name || f.get('name'), category: f.get('category') || '', source: 'upload', fileData, fileType }, 'vilmar');
    closeModal(); N.caseDetail(caseId); toast('Documento registrado');
  };
}
function docRequestModal(caseId) {
  openModal(`<h3>Solicitar documento</h3><form id="docReqForm">
  <div class="field"><label>Documentos (um por linha)</label><textarea name="names" required placeholder="Relatório médico\nCarteirinha do plano"></textarea></div>
  <div class="field"><label><input type="checkbox" name="notify" checked> Enviar pedido ao cliente por WhatsApp</label></div>
  <div class="row"><button class="btn primary">Solicitar</button><button type="button" class="btn" data-close>Cancelar</button></div></form>`);
  $('docReqForm').onsubmit = async e => {
    e.preventDefault(); const f = new FormData(e.target);
    const names = String(f.get('names')).split('\n').map(x => x.trim()).filter(Boolean);
    const docs = await N.requestDocuments(caseId, names, 'vilmar');
    if (f.has('notify') && docs.length) {
      const k = N.caseById(caseId), c = N.contactById(k?.contactId);
      if (c?.whatsapp || c?.phone) await N.waSend(c.whatsapp || c.phone, `Olá, ${c.name}. Para darmos andamento ao seu caso, precisamos de: ${docs.map(d => d.name).join(', ')}. Pode enviar por aqui mesmo?`, { silent: true, actor: 'vilmar' });
    }
    closeModal(); N.caseDetail(caseId); toast('Solicitação registrada');
  };
}
function caseLostModal(id) {
  openModal(`<h3>Marcar demanda como perdida</h3><form id="lostForm">
  <div class="field"><label>Motivo</label><select name="reason" required><option value="">Selecione</option><option>preço</option><option>demora</option><option>concorrente</option><option>sem perfil</option><option>desistência</option></select></div>
  <div class="field"><label>Aprendizado (1 linha)</label><input name="learning"></div>
  <div class="row"><button class="btn danger">Confirmar perda</button><button type="button" class="btn" data-close>Cancelar</button></form>`);
  $('lostForm').onsubmit = async e => {
    e.preventDefault(); const f = new FormData(e.target);
    await N.updateCase(id, { status: 'perdido', lossReason: f.get('reason') }, 'vilmar');
    if (f.get('learning')) { S.learnings.push({ id: uid(), text: f.get('learning'), source: 'perda', createdAt: N.now() }); await sset('learnings', S.learnings); }
    closeModal(); N.render(); toast('Perda registrada');
  };
}

/* ---------- delegação de cliques ---------- */
document.addEventListener('click', async e => {
  const a = e.target.closest('[data-action]');
  const closeBtn = e.target.closest('[data-close]');
  const copyBtn = e.target.closest('[data-copy]');
  if (copyBtn) { N.copyText(copyBtn.dataset.copy); return; }
  if (closeBtn) { closeModal(); return; }
  if (!a) return;
  const act = a.dataset.action, id = a.dataset.id;
  try {
    switch (act) {
      /* navegação/gerais */
      case 'run-sweeps': await N.runSweeps(true); N.render(); toast('Rotinas executadas'); break;
      case 'system-tab': S.systemTab = id; N.render(); break;
      case 'inbox-filter': S.inboxFilter = id; N.render(); break;
      case 'task-filter': S.taskFilter = id; N.render(); break;
      case 'client-mode': S.clientMode = id; N.render(); break;
      /* inbox / chat */
      case 'inbox-select': S.waSelectedChatId = id; N.render(); break;
      case 'open-chat': S.waSelectedChatId = id; N.nav('inbox'); break;
      case 'open-chat-phone': {
        const p = N.normPhone(id);
        let chat = S.whatsappChats.find(c => N.normPhone(c.phone) === p);
        if (!chat) { toast('Sem conversa registrada com este número'); break; }
        S.waSelectedChatId = chat.id; closeModal(); N.nav('inbox'); break;
      }
      case 'inbox-send': {
        const ta = $('inboxText'); const text = ta?.value?.trim(); if (!text) break;
        const chat = N.chatById(id); if (!chat) break;
        ta.value = '';
        await N.waSend(chat.phone, text, { actor: 'vilmar' });
        break;
      }
      case 'chat-assume': await N.assumeChat(id); break;
      case 'chat-return-ia': await N.returnToAI(id); break;
      case 'chat-resolve': await N.resolveChat(id); break;
      case 'wa-sync-chats': N.waSyncChats(); break;
      case 'wa-status': N.waStatus(); break;
      case 'wa-mark-read': N.waMarkRead(id); break;
      case 'wa-setup': closeModal(); N.settingsModal(); break;
      case 'simulate-inbound': simulateModal(); break;
      /* contatos/empresas */
      case 'new-contact': N.contactEdit(null); break;
      case 'contact-edit': closeModal(); N.contactEdit(id); break;
      case 'contact-detail': closeModal(); N.contactDetail(id); break;
      case 'new-company': closeModal(); N.companyEdit(null); break;
      case 'company-edit': closeModal(); N.companyEdit(id); break;
      case 'company-detail': closeModal(); N.companyDetail(id); break;
      case 'link-company': closeModal(); N.linkCompanyModal(id); break;
      /* demandas */
      case 'new-case': N.caseEdit(null); break;
      case 'new-case-for': closeModal(); N.caseEdit(null, id); break;
      case 'case-edit': closeModal(); N.caseEdit(id); break;
      case 'case-detail': closeModal(); N.caseDetail(id); break;
      case 'case-advance': {
        const k = N.caseById(id); if (!k) break;
        const next = N.stages()[N.stageIndex(k.stageId) + 1];
        if (next) { await N.moveCase(id, next.id, 'vilmar'); N.render(); toast('Movida para ' + next.name); }
        break;
      }
      case 'case-move': {
        const sel = $('caseMoveSel'); if (!sel) break;
        await N.moveCase(id, sel.value, 'vilmar'); closeModal(); N.caseDetail(id); N.render(); break;
      }
      case 'case-lost': closeModal(); caseLostModal(id); break;
      case 'case-summary': {
        const txt = await N.generateCaseSummary(id, 'vilmar');
        openModal(`<h3>Resumo para Vilmar</h3><div class="summary-card">${esc(txt)}</div>
        <div class="field" style="margin-top:10px"><textarea id="copyText" style="display:none">${esc(txt)}</textarea></div>
        <div class="row" style="margin-top:10px"><button class="btn primary" data-copy="#copyText">Copiar</button><button class="btn" data-action="case-detail" data-id="${id}">Abrir demanda</button><button class="btn" data-close>Fechar</button></div>`);
        break;
      }
      case 'case-request-docs': {
        const k = N.caseById(id); const flow = k && N.flowByArea(k.area);
        if (flow?.docs?.length) { await N.requestDocuments(id, flow.docs, 'vilmar'); closeModal(); N.caseDetail(id); toast('Documentos da área solicitados'); }
        else toast('A área não tem documentos padrão — use "Solicitar documento".');
        break;
      }
      /* documentos */
      case 'doc-add': closeModal(); docAddModal(id); break;
      case 'doc-request-custom': closeModal(); docRequestModal(id); break;
      case 'doc-status': {
        await N.setDocStatus(id, a.dataset.status, 'vilmar'); N.render();
        const d = S.documents.find(x => x.id === id);
        if (d?.caseId && $('modal').innerHTML) { closeModal(); N.caseDetail(d.caseId); }
        break;
      }
      /* tarefas / aprovações */
      case 'new-task': N.taskModal(); break;
      case 'task-done': await N.completeTask(id, 'vilmar'); N.render(); toast('Tarefa concluída'); break;
      case 'approve-action': { const r = await N.approveAction(id); N.render(); toast('Ação aprovada e executada' + (r ? '' : '')); break; }
      case 'reject-action': await N.rejectAction(id); N.render(); toast('Ação rejeitada'); break;
      /* agenda */
      case 'new-appointment': N.appointmentModal(null); break;
      case 'appt-reschedule': N.appointmentModal(id); break;
      case 'appt-status': await N.setAppointmentStatus(id, a.dataset.status, 'vilmar'); N.render(); break;
      /* funil: estágios */
      case 'edit-stages': N.stagesEditor(); break;
      case 'stage-add': {
        const name = prompt('Nome do novo estágio:'); if (!name) break;
        const sid = name.trim().toLowerCase().replace(/\s+/g, '_').normalize('NFD').replace(/[^\w_]/g, '');
        if (N.stages().find(s => s.id === sid)) { toast('Já existe'); break; }
        S.pipeline.stages.push({ id: sid || uid(), name: name.trim() });
        await sset('pipeline', S.pipeline); N.stagesEditor(); N.render(); break;
      }
      case 'stage-rename': {
        const s = N.stages().find(x => x.id === id); if (!s) break;
        const name = prompt('Novo nome:', s.name); if (!name) break;
        s.name = name.trim(); await sset('pipeline', S.pipeline); N.stagesEditor(); N.render(); break;
      }
      case 'stage-del': {
        const inUse = S.cases.filter(k => k.stageId === id && k.status === 'aberto').length;
        if (inUse) { toast('Há ' + inUse + ' demanda(s) neste estágio — mova antes de excluir.'); break; }
        if (N.stages().length <= 2) { toast('O funil precisa de pelo menos 2 estágios.'); break; }
        S.pipeline.stages = S.pipeline.stages.filter(s => s.id !== id);
        await sset('pipeline', S.pipeline); N.stagesEditor(); N.render(); break;
      }
      case 'stage-up': {
        const i = N.stageIndex(id); if (i <= 0) break;
        const st = S.pipeline.stages;[st[i - 1], st[i]] = [st[i], st[i - 1]];
        await sset('pipeline', S.pipeline); N.stagesEditor(); N.render(); break;
      }
      /* jurídico / financeiro */
      case 'new-process': N.processModal(); break;
      case 'process-detail': N.processDetail(id); break;
      case 'end-process': closeModal(); N.endProcess(id); break;
      case 'client-summary': N.clientSummary(id); break;
      case 'new-deadline': N.deadlineModal(); break;
      case 'publication': N.publication(); break;
      case 'new-contract': N.contractModal(); break;
      case 'contract-detail': N.contractDetail(id); break;
      case 'charge': N.charge(id, a.dataset.installment); break;
      case 'pay': N.pay(id, a.dataset.installment); break;
      /* sistema */
      case 'new-automation': N.automationModal(null); break;
      case 'auto-edit': N.automationModal(id); break;
      case 'auto-del': S.automations = S.automations.filter(x => x.id !== id); await sset('automations', S.automations); N.render(); break;
      case 'new-flow': N.flowModal(null); break;
      case 'flow-edit': N.flowModal(id); break;
      case 'new-knowledge': N.knowledgeModal(null); break;
      case 'kb-edit': N.knowledgeModal(id); break;
      case 'kb-del': S.knowledge = S.knowledge.filter(x => x.id !== id); await sset('knowledge', S.knowledge); N.render(); break;
    }
  } catch (err) { console.error('ação ' + act, err); toast('Erro: ' + err.message); }
});

/* delegação de change (switches e selects) */
document.addEventListener('change', async e => {
  const el = e.target.closest('[data-action]');
  if (!el) return;
  try {
    if (el.dataset.action === 'auto-toggle') {
      const auto = S.automations.find(x => x.id === el.dataset.id);
      if (auto) { auto.enabled = el.checked; await sset('automations', S.automations); await N.audit('vilmar', 'automation_toggle', `${auto.name}: ${auto.enabled ? 'ativada' : 'desativada'}`, {}); }
    } else if (el.dataset.action === 'perm-set') {
      S.config.iaPermissions[el.dataset.id] = el.value;
      await sset('config', S.config);
      await N.audit('vilmar', 'permission_change', `Permissão da IA ${el.dataset.id} → ${el.value}`, {});
    }
  } catch (err) { console.error(err); }
});

/* ---------- inicialização ---------- */
async function init() {
  const navEl = document.querySelector('.nav');
  navEl.innerHTML = NAV.map(([v, icon, label], i) => `<button data-view="${v}" class="${i === 0 ? 'active' : ''}"><b>${icon}</b>${label}</button>`).join('');
  navEl.querySelectorAll('button').forEach(b => b.onclick = () => N.nav(b.dataset.view));
  $('modalBackdrop').addEventListener('click', e => { if (e.target === $('modalBackdrop')) closeModal(); });
  $('settingsBtn').onclick = () => N.settingsModal();

  await N.loadState();
  N.ensurePipeline();
  await N.ensureFlows();
  await N.ensureKnowledge();
  await N.ensureAutomations();
  N.installEngine();
  if (N.getStorageMode() === 'memory') N.showStorageFallback();
  $('officeName').textContent = S.config.office || 'Escritório';
  N.nav('painel');
  N.startWaLoop();
  setTimeout(() => N.runSweeps().catch(console.error), 2500);
  N.emit('app.ready', {});
  window.__NAVE_READY = true;
}
init().catch(e => { console.error(e); N.showError('Falha na inicialização: ' + e.message); });
})();
