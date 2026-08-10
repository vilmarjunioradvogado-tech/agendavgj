/* NAVE — WhatsApp (Zappfy): sincronização, entrada de mensagens, mídia/documentos, handoff, simulador */
(() => {
'use strict';
const N = window.NAVE, S = N.state;
const { uid, now, today, normPhone, emit, audit, sset, apiFetch, toast, openModal, closeModal, esc } = N;

const waConfig = () => S.config.whatsapp;
const offlineMode = () => window.__NAVE_TEST_MODE === true || !String(waConfig().token || '').trim();

function waIsGroup(c) {
  if (!c) return false;
  const ids = [c.wa_chatid, c.chatid, c.chatId, c.jid, c.remoteJid, c.id, c.phone, c.number].filter(Boolean).map(String);
  if (ids.some(v => /@g\.us(?:$|\?)/i.test(v))) return true;
  return c.isGroup === true || c.is_group === true || c.group === true || String(c.type || c.chatType || '').toLowerCase() === 'group';
}
const waChats = () => (Array.isArray(S.whatsappChats) ? S.whatsappChats : []).filter(c => !waIsGroup(c));
const waStatusLabel = () => { const w = waConfig(); return w.lastStatus === 'connected' ? 'Conectado' : w.lastStatus === 'disconnected' ? 'Desconectado' : w.lastStatus === 'error' ? 'Erro' : 'Não verificado'; };
const chatById = id => S.whatsappChats.find(c => c.id === id) || null;
const chatMessages = id => S.whatsappMessages.filter(m => m.chatId === id);

function ensureChatDefaults(c) {
  if (!c.aiMode) c.aiMode = 'ia';
  if (c.status === undefined) c.status = '';
  if (!c.agentStatus) c.agentStatus = 'novo';
  return c;
}

/* ---------- entrada de mensagens: identificação + documentos + eventos + agente ---------- */
function detectMedia(providerMsg) {
  const m = providerMsg || {};
  const t = String(m.type || m.messageType || m.mediaType || '').toLowerCase();
  const mime = String(m.mimetype || m.mimeType || '').toLowerCase();
  const filename = m.filename || m.fileName || m.documentName || m.caption || '';
  if (/audio|ptt|voice/.test(t) || mime.startsWith('audio')) return { kind: 'audio', filename };
  if (/document|file/.test(t) || /pdf|msword|officedocument/.test(mime)) return { kind: 'document', filename: filename || 'Documento recebido' };
  if (/image|photo/.test(t) || mime.startsWith('image')) return { kind: 'image', filename: filename || 'Imagem recebida' };
  return null;
}

async function processInbound(chat, msg) {
  ensureChatDefaults(chat);
  const phone = normPhone(chat.phone || chat.wa_chatid);
  /* identificação: localizar ou criar contato (dedupe por telefone) */
  let contact = chat.contactId ? N.contactById(chat.contactId) : N.findContact({ phone });
  if (!contact && phone) {
    contact = await N.createContact({ name: chat.name || chat.wa_contactName || phone, phone, origin: 'whatsapp', status: 'lead' }, 'sistema');
  }
  if (contact) { chat.contactId = contact.id; await N.touchContact(contact.id); }
  if (!chat.caseId && contact) { const k = N.openCaseForContact(contact.id); if (k) chat.caseId = k.id; }
  /* mídia: documentos/imagens entram no módulo documental; áudio fica marcado p/ transcrição */
  if (msg.media && (msg.media.kind === 'document' || msg.media.kind === 'image')) {
    const caseId = chat.caseId || (contact ? (N.openCaseForContact(contact.id)?.id || '') : '');
    await N.registerDocument({ caseId, contactId: contact?.id || '', name: msg.media.filename || 'Documento WhatsApp', source: 'whatsapp' }, 'sistema');
  }
  if (chat.status === 'aguardando_cliente') chat.status = '';
  chat.lastInboundAt = msg.at || now();
  await sset('whatsappChats', S.whatsappChats);
  await emit('message.inbound', { chat, msg, contact });
  return contact;
}

/* ---------- envio ---------- */
async function waSend(phone, text, opts = {}) {
  const w = waConfig();
  const p = normPhone(phone);
  if (!p) { if (!opts.silent) toast('Número de destino inválido.'); return false; }
  if (String(phone || '').includes('@g.us')) { if (!opts.silent) toast('Envio bloqueado: grupos do WhatsApp estão desativados.'); return false; }
  const target = S.whatsappChats.find(c => normPhone(c.phone) === p);
  if (waIsGroup(target)) { if (!opts.silent) toast('Envio bloqueado: o VGJ LAW não envia mensagens para grupos.'); return false; }
  let provider = null;
  if (!offlineMode()) {
    try {
      const url = (w.baseUrl || 'https://api.zappfy.io') + (w.sendPath || '/send/text');
      const r = await apiFetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', token: w.token },
        body: JSON.stringify({ number: p, text, readchat: true, readmessages: true }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.message || 'HTTP ' + r.status);
      provider = j;
    } catch (e) {
      await audit(opts.actor || 'vilmar', 'send_message', 'FALHA no envio para ' + p + ': ' + e.message, { result: 'erro' });
      if (!opts.silent) toast('Falha no envio: ' + e.message);
      return false;
    }
  } else if (!window.__NAVE_TEST_MODE && !String(w.token || '').trim() && !opts.silent) {
    toast('Zappfy não configurada — mensagem registrada apenas localmente.');
  }
  let chat = S.whatsappChats.find(c => normPhone(c.phone) === p);
  if (!chat) { chat = ensureChatDefaults({ id: uid(), phone: p, name: p, wa_lastMessageText: '', agentPending: [] }); S.whatsappChats.push(chat); }
  S.whatsappMessages.push({ id: uid(), chatId: chat.id, direction: 'out', phone: p, text, at: now(), provider, actor: opts.actor || 'vilmar' });
  chat.wa_lastMessageText = text;
  await Promise.all([sset('whatsappChats', S.whatsappChats), sset('whatsappMessages', S.whatsappMessages)]);
  await audit(opts.actor || 'vilmar', 'send_message', 'WhatsApp → ' + p + ': ' + String(text).slice(0, 120), {});
  if (!opts.silent) { N.render(); toast('Mensagem enviada'); }
  return true;
}

/* ---------- sincronização Zappfy ---------- */
async function waSyncChats(silent = false) {
  const w = waConfig();
  if (!w.token) { if (!silent) toast('Configure o token Zappfy primeiro'); return false; }
  try {
    const r = await apiFetch((w.baseUrl || 'https://api.zappfy.io') + '/chat/find', { method: 'POST',
      headers: { 'Content-Type': 'application/json', token: w.token },
      body: JSON.stringify({ operator: 'AND', sort: '-wa_lastMsgTimestamp', limit: 200, offset: 0 }) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j.error || j.message || 'HTTP ' + r.status);
    const raw = Array.isArray(j.chats) ? j.chats : (Array.isArray(j.data) ? j.data : (Array.isArray(j.results) ? j.results : (Array.isArray(j.items) ? j.items : [])));
    const incoming = raw.filter(x => !waIsGroup(x));
    const oldByPhone = new Map(S.whatsappChats.map(c => [normPhone(c.phone || c.wa_chatid), c]));
    const needLoad = new Set();
    S.whatsappChats = incoming.map(x => {
      const phone = normPhone(x.phone || x.wa_chatid);
      const old = oldByPhone.get(phone) || {};
      const merged = ensureChatDefaults({ ...old, ...x, id: String(old.id || x.id || x.wa_chatid || phone || uid()), phone,
        name: x.name || x.wa_contactName || x.wa_name || x.lead_name || old.name || phone || 'Sem nome',
        wa_lastMessageText: x.wa_lastMessageText || old.wa_lastMessageText || '',
        contactId: old.contactId || '', caseId: old.caseId || '', aiMode: old.aiMode || 'ia', status: old.status || '',
        agentStatus: old.agentStatus || 'novo', agentLastProcessedId: old.agentLastProcessedId || '',
        agentSummary: old.agentSummary || '', agentUrgency: old.agentUrgency || '', agentPending: old.agentPending || [], agentLastRun: old.agentLastRun || '' });
      const hasMsgs = S.whatsappMessages.some(m => m.chatId === merged.id);
      if (!hasMsgs || String(x.wa_lastMsgTimestamp || '') !== String(old.wa_lastMsgTimestamp || '')) needLoad.add(merged.id);
      return merged;
    });
    if (!S.waSelectedChatId && S.whatsappChats[0]) S.waSelectedChatId = S.whatsappChats[0].id;
    if (S.waSelectedChatId) needLoad.add(S.waSelectedChatId);
    await sset('whatsappChats', S.whatsappChats);
    const toLoad = S.whatsappChats.filter(c => needLoad.has(c.id)).slice(0, silent ? 20 : 40);
    for (const c of toLoad) await waLoadMessages(c, silent);
    await sset('whatsappChats', S.whatsappChats);
    N.render();
    if (!silent) toast(`${S.whatsappChats.length} conversa(s) sincronizada(s)`);
    return true;
  } catch (e) {
    if (silent) console.error('waSyncChats', e); else toast('Falha ao sincronizar conversas: ' + e.message);
    return false;
  }
}

async function waLoadMessages(c, silent = false) {
  const w = waConfig();
  if (waIsGroup(c) || !w.token || !c) return false;
  const number = normPhone(c.phone || c.wa_chatid);
  if (!number) return false;
  try {
    const r = await apiFetch((w.baseUrl || 'https://api.zappfy.io') + '/message/find', { method: 'POST',
      headers: { 'Content-Type': 'application/json', token: w.token },
      body: JSON.stringify({ chatid: String(c.wa_chatid || number + '@s.whatsapp.net'), limit: 100, offset: 0 }) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j.error || j.message || 'HTTP ' + r.status);
    const incoming = Array.isArray(j.messages) ? j.messages : Array.isArray(j.data) ? j.data : [];
    const prevIds = new Set(S.whatsappMessages.filter(m => m.chatId === c.id).map(m => m.id));
    const keep = S.whatsappMessages.filter(m => m.chatId !== c.id || !m.provider === false); // mantém locais (sem provider) e de outras conversas
    const keepLocal = S.whatsappMessages.filter(m => m.chatId === c.id && !m.provider && m.direction === 'out');
    const others = S.whatsappMessages.filter(m => m.chatId !== c.id);
    const mapped = incoming.map(m => {
      const media = detectMedia(m);
      let text = m.text || m.body || m.message || m.content || m.caption || '';
      if (media?.kind === 'audio' && !text) text = '[Áudio recebido — transcrição automática indisponível; configure um serviço de STT ou peça para o cliente escrever]';
      if ((media?.kind === 'document' || media?.kind === 'image') && !text) text = '[' + (media.filename || 'Arquivo recebido') + ']';
      return { id: String(m.id || m.messageid || uid()), chatId: c.id, phone: number,
        direction: (m.fromMe || m.direction === 'out' || m.messageType === 'outgoing') ? 'out' : 'in',
        text, media, at: m.timestamp ? new Date(Number(m.timestamp) > 1e12 ? Number(m.timestamp) : Number(m.timestamp) * 1000).toISOString() : m.created || now(), provider: m };
    }).filter(m => m.text);
    S.whatsappMessages = others.concat(keepLocal, mapped).slice(-5000);
    await sset('whatsappMessages', S.whatsappMessages);
    const fresh = mapped.filter(m => m.direction === 'in' && !prevIds.has(m.id));
    for (const msg of fresh) await processInbound(c, msg);
    if (fresh.length && waConfig().agentEnabled !== false) N.runAgentOnChat(c);
    return true;
  } catch (e) {
    if (silent) console.error('waLoadMessages', e); else toast('Não foi possível carregar as mensagens: ' + e.message);
    return false;
  }
}

async function waStatus(showResult = true) {
  const w = waConfig();
  if (!w.token) { openModal(`<h3>Configurar Zappfy</h3><p class="muted" style="font-size:12px">Informe o token da instância em Configurações → WhatsApp.</p><button class="btn primary" data-action="wa-setup">Configurar agora</button>`); return null; }
  try {
    const r = await apiFetch((w.baseUrl || 'https://api.zappfy.io') + '/instance/status', { headers: { token: w.token } });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j.message || j.error || 'HTTP ' + r.status);
    const inst = j?.instance || {}; const st = j?.status || {};
    w.lastStatus = String(inst.status || '').toLowerCase() || ((st.connected || st.loggedIn) ? 'connected' : 'disconnected');
    w.profileName = inst.profileName || w.profileName || '';
    w.phone = st?.jid?.user || w.phone || '';
    w.lastCheck = now(); w.qrcode = inst.qrcode || ''; w.paircode = inst.paircode || ''; w.lastError = '';
    await sset('config', S.config);
    N.render();
    if (showResult) waShowSyncResult(j);
    toast('Zappfy: ' + waStatusLabel());
    return j;
  } catch (e) {
    w.lastStatus = 'error'; w.lastError = e.message; w.qrcode = '';
    await sset('config', S.config); N.render();
    toast('Falha ao consultar Zappfy: ' + e.message);
    return null;
  }
}
function waShowSyncResult(j) {
  const w = waConfig(), inst = j?.instance || {}, st = j?.status || {}, status = String(inst.status || '').toLowerCase();
  let html = '';
  if (status === 'connected' || st.connected || st.loggedIn) {
    html = `<h3>WhatsApp conectado</h3><div class="item"><strong>${esc(inst.profileName || w.profileName || 'WhatsApp')}</strong><div class="wa-note">${esc(String(st?.jid?.user || w.phone || ''))} · conectado à Zappfy</div></div>`;
  } else if (inst.qrcode) {
    html = `<h3>Conectar WhatsApp</h3><p class="wa-note">WhatsApp → Configurações → Aparelhos conectados → Conectar aparelho</p><div style="text-align:center"><img src="${esc(inst.qrcode)}" alt="QR Code" style="width:min(300px,80vw);background:#fff;padding:10px;border-radius:12px"></div><div class="row" style="justify-content:center;margin-top:10px"><button class="btn small" data-action="wa-status">Atualizar QR Code</button></div>`;
  } else if (inst.paircode) {
    html = `<h3>Código de pareamento</h3><div style="font:700 24px 'DM Mono';margin:8px 0">${esc(inst.paircode)}</div><button class="btn small" data-action="wa-status">Atualizar</button>`;
  } else {
    html = `<h3>Sincronização</h3><p class="wa-note">Instância: ${esc(status || 'desconhecida')}. Se estiver desconectada, inicie a conexão no painel da Zappfy e tente novamente.</p><button class="btn small" data-action="wa-status">Atualizar</button>`;
  }
  openModal(html + '<div class="row" style="margin-top:12px"><button class="btn" data-close>Fechar</button></div>');
}

async function waMarkRead(id) {
  const w = waConfig(), c = chatById(id);
  if (!w.token || !c) return;
  const ids = chatMessages(id).filter(m => m.direction === 'in' && (m.provider?.messageid || m.provider?.id || m.id)).slice(-50).map(m => m.provider?.messageid || m.provider?.id || m.id);
  if (!ids.length) { toast('Nenhuma mensagem recebida para marcar como lida'); return; }
  try {
    const r = await apiFetch((w.baseUrl || 'https://api.zappfy.io') + '/message/markread', { method: 'POST', headers: { 'Content-Type': 'application/json', token: w.token }, body: JSON.stringify({ id: ids }) });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    c.wa_unreadCount = 0;
    await sset('whatsappChats', S.whatsappChats);
    N.render(); toast('Mensagens marcadas como lidas');
  } catch (e) { toast('Não foi possível marcar como lida: ' + e.message); }
}

/* ---------- handoff IA <-> humano ---------- */
async function assumeChat(chatId) {
  const c = chatById(chatId); if (!c) return;
  c.aiMode = 'humano'; c.status = 'com_vilmar';
  await sset('whatsappChats', S.whatsappChats);
  await audit('vilmar', 'assume_chat', 'Vilmar assumiu a conversa de ' + (c.name || c.phone), { contactId: c.contactId });
  N.render();
}
async function returnToAI(chatId) {
  const c = chatById(chatId); if (!c) return;
  c.aiMode = 'ia'; c.status = ''; c.agentStatus = 'em_triagem';
  await sset('whatsappChats', S.whatsappChats);
  await audit('vilmar', 'return_to_ai', 'Conversa devolvida à IA: ' + (c.name || c.phone), { contactId: c.contactId });
  N.render();
}
async function resolveChat(chatId) {
  const c = chatById(chatId); if (!c) return;
  c.status = ''; c.agentStatus = 'encerrado';
  await sset('whatsappChats', S.whatsappChats);
  await audit('vilmar', 'resolve_chat', 'Conversa resolvida: ' + (c.name || c.phone), { contactId: c.contactId });
  N.render();
}

/* ---------- simulador (testes E2E / demonstração sem Zappfy) ---------- */
async function simulateInbound(phone, text, opts = {}) {
  const p = normPhone(phone);
  let chat = S.whatsappChats.find(c => normPhone(c.phone) === p);
  if (!chat) { chat = ensureChatDefaults({ id: uid(), phone: p, name: opts.name || p, wa_lastMessageText: '', agentPending: [] }); S.whatsappChats.push(chat); }
  else if (opts.name && (!chat.name || chat.name === p)) chat.name = opts.name;
  const msg = { id: uid(), chatId: chat.id, phone: p, direction: 'in', text: String(text),
    media: opts.media || null, at: now(), provider: opts.provider || { simulated: true } };
  S.whatsappMessages.push(msg);
  chat.wa_lastMessageText = msg.text;
  chat.wa_lastMsgTimestamp = Date.now();
  await Promise.all([sset('whatsappChats', S.whatsappChats), sset('whatsappMessages', S.whatsappMessages)]);
  await processInbound(chat, msg);
  let agentResult = null;
  if (!opts.skipAgent) agentResult = await N.runAgentOnChat(chat);
  N.render();
  return { chat, msg, agentResult };
}

/* ---------- loop de fundo ---------- */
function startWaLoop() {
  if (window.__naveWaLoop) clearInterval(window.__naveWaLoop);
  const w = waConfig();
  if (w.agentEnabled !== false && w.polling !== false && String(w.token || '').trim()) {
    window.__naveWaLoop = setInterval(async () => {
      try { await waSyncChats(true); await N.runSweeps(); } catch (e) { console.error(e); }
    }, Math.max(15000, Number(w.pollMs || 30000)));
  }
}

Object.assign(N, { waConfig, waIsGroup, waChats, waStatusLabel, chatById, chatMessages, processInbound, waSend,
  waSyncChats, waLoadMessages, waStatus, waMarkRead, assumeChat, returnToAI, resolveChat, simulateInbound, startWaLoop, offlineMode });
})();
