/* NAVE — testes E2E dos fluxos operacionais (12 cenários da missão + smoke test de UI)
 * Executa em Chromium headless com um "cérebro" de IA roteirizado (window.__NAVE_TEST_BRAIN),
 * validando o orquestrador real: ferramentas, permissões, automações, auditoria e persistência.
 * Uso: node tests/e2e.js   (PW_CHROMIUM aponta para o binário; padrão /opt/pw-browsers/chromium)
 */
'use strict';
function loadPW() {
  try { return { pw: require('playwright'), bundled: true }; } catch (e) {}
  try { return { pw: require('playwright-core'), bundled: false }; } catch (e) {}
  throw new Error('Instale playwright ou playwright-core (npm i -D playwright-core)');
}
const { pw, bundled } = loadPW();
const path = require('path');

let passed = 0, failed = 0;
const failures = [];
function check(name, cond, extra) {
  if (cond) { passed++; console.log('  ✓ ' + name); }
  else { failed++; failures.push(name + (extra ? ' — ' + extra : '')); console.log('  ✗ ' + name + (extra ? ' — ' + extra : '')); }
}

(async () => {
  const launchOpts = { args: ['--no-sandbox'] };
  if (!bundled) launchOpts.executablePath = process.env.PW_CHROMIUM || '/opt/pw-browsers/chromium';
  const browser = await pw.chromium.launch(launchOpts);
  const page = await browser.newPage({ viewport: { width: 1360, height: 900 } });

  const consoleErrors = [];
  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('pageerror', e => consoleErrors.push('pageerror: ' + e.message));
  await page.route('**/*', r => r.request().url().startsWith('file://') ? r.continue() : r.abort());

  /* cérebro roteirizado: consome uma fila de respostas por rodada do orquestrador */
  await page.addInitScript(() => {
    window.__NAVE_TEST_MODE = true;
    window.__BRAIN_CALLS = 0;
    window.__QUEUE = [];
    window.__NAVE_TEST_BRAIN = async () => {
      window.__BRAIN_CALLS++;
      if (window.__QUEUE.length) return window.__QUEUE.shift();
      return { content: [{ type: 'text', text: '' }], stop_reason: 'end_turn' };
    };
  });

  const url = 'file://' + path.resolve(__dirname, '..', 'app', 'index.html');
  await page.goto(url);
  await page.waitForFunction(() => window.__NAVE_READY === true, null, { timeout: 15000 });

  const S = fn => page.evaluate(fn);
  const setQueue = q => page.evaluate(qq => { window.__QUEUE = qq; }, q);
  const tu = (name, input, id) => ({ type: 'tool_use', id: id || (name + '-' + Math.random().toString(36).slice(2, 8)), name, input });
  const round = (...blocks) => ({ content: blocks, stop_reason: 'tool_use' });
  const finalRound = text => ({ content: [{ type: 'text', text: text || '' }], stop_reason: 'end_turn' });

  const P1 = '5577999110001', P2 = '5577999220002';

  console.log('\n== Smoke: inicialização e navegação ==');
  check('app inicializa', await S(() => !!window.NAVE && !!window.NAVE.state.config));
  check('funil padrão com 11 estágios', await S(() => window.NAVE.stages().length) === 11);
  check('fluxos de triagem padrão criados', await S(() => window.NAVE.state.triageFlows.length) >= 9);
  check('automações padrão criadas', await S(() => window.NAVE.state.automations.length) >= 11);
  check('base de conhecimento criada', await S(() => window.NAVE.state.knowledge.length) >= 5);
  for (const v of ['painel', 'inbox', 'funil', 'clientes', 'agenda', 'tarefas', 'juridico', 'financeiro', 'assistente', 'sistema']) {
    await page.click(`.nav button[data-view="${v}"]`);
    await page.waitForTimeout(60);
    const ok = await page.evaluate(vv => document.getElementById('view-' + vv)?.classList.contains('active') && document.getElementById('view-' + vv).innerHTML.length > 50, v);
    check('tela ' + v + ' renderiza', ok);
  }

  console.log('\n== Cenário 1: novo cliente chega pelo WhatsApp ==');
  await setQueue([
    round(tu('create_case', { title: 'Negativa de tratamento — filho', area: 'planos_de_saude', urgency: 'alta', subject: 'Plano negou fisioterapia prescrita para o filho.' })),
    round(tu('update_case', { triageAnswer: 'Tratamento negado => Fisioterapia' }),
          tu('request_document', { documents: ['Negativa do plano', 'Relatório médico'] }),
          tu('send_message', { text: 'Olá, Maria! Sentimos muito pela situação. Para agilizar a análise, pode nos enviar a negativa do plano e o relatório médico? Pode mandar por aqui mesmo.' })),
    finalRound('triagem iniciada'),
  ]);
  await S(() => window.NAVE.simulateInbound('5577999110001', 'Olá, meu plano negou o tratamento do meu filho.', { name: 'Maria Silva' }));
  let st = await S(() => {
    const N = window.NAVE, c = N.findContact({ phone: '5577999110001' });
    const cases = c ? N.contactCases(c.id) : [];
    return { contact: !!c, name: c?.name, origin: c?.origin, cases: cases.length, stage: cases[0]?.stageId, area: cases[0]?.area,
      docsPend: cases[0] ? N.caseDocs(cases[0].id).filter(d => d.status === 'pendente').length : 0,
      outbound: N.state.whatsappMessages.filter(m => m.direction === 'out' && m.phone === '5577999110001').length,
      audit: N.state.auditLog.filter(a => a.actor === 'ia').length, answers: cases[0]?.triageAnswers?.length };
  });
  check('contato criado automaticamente (identificação)', st.contact && st.name === 'Maria Silva');
  check('origem = whatsapp', st.origin === 'whatsapp');
  check('demanda criada na área planos_de_saude', st.cases === 1 && st.area === 'planos_de_saude');
  check('automação moveu novo_contato→triagem e docs→aguardando_documentos', st.stage === 'aguardando_documentos', 'estágio: ' + st.stage);
  check('resposta de triagem registrada', st.answers === 1);
  check('2 documentos solicitados (pendentes)', st.docsPend === 2);
  check('IA respondeu ao cliente', st.outbound >= 1);
  check('ações da IA auditadas', st.audit >= 4);

  console.log('\n== Cenário 2: cliente já cadastrado inicia NOVA demanda ==');
  await setQueue([
    round(tu('create_case', { title: 'Golpe do PIX', area: 'golpes_fraudes', urgency: 'alta', subject: 'Transferiu R$ 3.000 em golpe por WhatsApp.' })),
    round(tu('request_document', { documents: ['Boletim de ocorrência', 'Comprovante de pagamento'] }),
          tu('send_message', { text: 'Sinto muito, Maria. Vamos agir rápido: registre o B.O. e nos envie o comprovante do PIX.' })),
    finalRound(''),
  ]);
  await S(() => window.NAVE.simulateInbound('5577999110001', 'Aconteceu outra coisa: caí num golpe do PIX, transferi 3 mil reais.'));
  st = await S(() => {
    const N = window.NAVE, c = N.findContact({ phone: '5577999110001' });
    const cases = N.contactCases(c.id);
    return { contacts: N.state.contacts.length, cases: cases.length, areas: cases.map(k => k.area).sort() };
  });
  check('não duplicou o contato', st.contacts === 1, 'contatos: ' + st.contacts);
  check('segunda demanda separada criada', st.cases === 2);
  check('demandas não se misturam (áreas distintas)', st.areas.join(',') === 'golpes_fraudes,planos_de_saude');

  console.log('\n== Cenário 3: cliente envia documentos (mídia WhatsApp) ==');
  await setQueue([round(tu('send_message', { text: 'Recebido, Maria! Vou registrar aqui.' })), finalRound('')]);
  await S(() => window.NAVE.simulateInbound('5577999110001', '', { media: { kind: 'document', filename: 'boletim-ocorrencia.pdf' } }));
  await setQueue([round(tu('send_message', { text: 'Perfeito, documentação completa! O caso já vai para análise.' })), finalRound('')]);
  await S(() => window.NAVE.simulateInbound('5577999110001', '', { media: { kind: 'document', filename: 'comprovante-pix.pdf' } }));
  st = await S(() => {
    const N = window.NAVE, c = N.findContact({ phone: '5577999110001' });
    const golpe = N.contactCases(c.id).find(k => k.area === 'golpes_fraudes');
    const saude = N.contactCases(c.id).find(k => k.area === 'planos_de_saude');
    return { golpeDocs: N.caseDocs(golpe.id).map(d => [d.category, d.status]), golpeStage: golpe.stageId,
      saudePend: N.caseDocs(saude.id).filter(d => d.status === 'pendente').length,
      analiseTask: N.state.tasks.some(t => t.title.includes('Analisar documentação') && t.caseId === golpe.id) };
  });
  check('B.O. classificado e recebido', JSON.stringify(st.golpeDocs).includes('["Boletim de ocorrência","recebido"]'));
  check('comprovante classificado e recebido', JSON.stringify(st.golpeDocs).includes('["Comprovante de pagamento","recebido"]'));
  check('docs completos → estágio documentacao_completa', st.golpeStage === 'documentacao_completa', st.golpeStage);
  check('automação criou tarefa "Analisar documentação"', st.analiseTask);
  check('demanda de saúde NÃO foi afetada (isolamento)', st.saudePend === 2);

  console.log('\n== Cenário 4: cliente NÃO envia documento → varredura cobra ==');
  await S(() => {
    const N = window.NAVE, c = N.findContact({ phone: '5577999110001' });
    const saude = N.contactCases(c.id).find(k => k.area === 'planos_de_saude');
    const old = new Date(Date.now() - 4 * 86400000).toISOString();
    for (const d of N.state.documents.filter(d => d.caseId === saude.id && d.status === 'pendente')) d.requestedAt = old;
    return N.sset('documents', N.state.documents);
  });
  await S(() => window.NAVE.runSweeps(true));
  st = await S(() => {
    const N = window.NAVE, c = N.findContact({ phone: '5577999110001' });
    const saude = N.contactCases(c.id).find(k => k.area === 'planos_de_saude');
    const msgs = N.state.whatsappMessages.filter(m => m.direction === 'out' && m.phone === '5577999110001');
    return { cobranca: N.state.tasks.some(t => t.title.startsWith('Cobrar documentos') && t.caseId === saude.id),
      msgCobranca: msgs.some(m => m.text.includes('ainda precisamos de')) };
  });
  check('tarefa de cobrança criada', st.cobranca);
  check('mensagem automática de cobrança enviada', st.msgCobranca);

  console.log('\n== Cenário 5: cliente precisa agendar ==');
  const freeDay = await S(() => {
    const N = window.NAVE;
    for (let n = 1; n <= 7; n++) { const d = N.addDays(N.today(), n); if (N.checkCalendar(d).length) return { d, t: N.checkCalendar(d)[0] }; }
    return null;
  });
  check('agenda tem slot livre em dia útil', !!freeDay);
  await setQueue([
    round(tu('check_calendar', {})),
    round(tu('create_appointment', { date: freeDay.d, time: freeDay.t, title: 'Reunião inicial — golpe do PIX' })),
    round(tu('send_message', { text: `Agendado para ${freeDay.d} às ${freeDay.t}. Até lá!` })),
    finalRound(''),
  ]);
  await S(() => window.NAVE.simulateInbound('5577999110001', 'Posso conversar com o advogado? Queria agendar um horário.'));
  st = await S(() => {
    const N = window.NAVE, c = N.findContact({ phone: '5577999110001' });
    const a = N.state.appointments[0];
    return { count: N.state.appointments.length, linked: a?.contactId === c.id && !!a?.caseId, status: a?.status,
      lembrete: N.state.tasks.some(t => t.title.startsWith('Preparar reunião')),
      slotTaken: a ? !N.checkCalendar(a.date).includes(a.time) : false };
  });
  check('reunião criada e vinculada a cliente+demanda', st.count === 1 && st.linked);
  check('automação criou lembrete de preparação', st.lembrete);
  check('slot ficou ocupado (sem conflito)', st.slotTaken);

  console.log('\n== Cenário 6: cliente pede atendimento humano ==');
  await setQueue([
    round(tu('handoff_to_human', { reason: 'Cliente pediu falar com o advogado sobre honorários', urgency: 'alta' })),
    round(tu('send_message', { text: 'Claro! Encaminhei seu caso para o Dr. Vilmar — ele vai falar com você em breve.' })),
  ]);
  await S(() => window.NAVE.simulateInbound('5577999110001', 'Quanto custa? Quero falar com o advogado sobre valores.'));
  st = await S(() => {
    const N = window.NAVE, c = N.findContact({ phone: '5577999110001' });
    const chat = N.state.whatsappChats.find(x => N.normPhone(x.phone) === '5577999110001');
    const kase = N.caseById(chat.caseId);
    return { status: chat.status, pendencia: N.state.tasks.some(t => t.title.startsWith('Analisar conversa de Maria')),
      summary: !!kase?.summary?.text, summaryHasDocs: kase?.summary?.text?.includes('DOCUMENTOS RECEBIDOS'), despedida: N.state.whatsappMessages.filter(m => m.phone === '5577999110001' && m.direction === 'out').slice(-1)[0]?.text.includes('Vilmar') };
  });
  check('conversa marcada AGUARDANDO VILMAR', st.status === 'aguardando_vilmar');
  check('pendência para Vilmar criada (automação)', st.pendencia);
  check('resumo estruturado gerado', st.summary && st.summaryHasDocs);
  check('cliente informado do encaminhamento', st.despedida);

  console.log('\n== Cenário 7: situação fora do escopo ==');
  await setQueue([
    round(tu('create_case', { title: 'Divórcio consensual', area: 'outras', subject: 'Cliente quer divórcio.' })),
    round(tu('handoff_to_human', { reason: 'Área não mapeada (família) — fora do escopo da triagem automática' })),
    round(tu('send_message', { text: 'Entendi! Esse tipo de caso é avaliado diretamente pelo Dr. Vilmar. Já encaminhei seu contato — retornaremos em breve.' })),
  ]);
  await S(() => window.NAVE.simulateInbound('5577999220002', 'Quero fazer um divórcio', { name: 'João Souza' }));
  st = await S(() => {
    const N = window.NAVE;
    const chat = N.state.whatsappChats.find(x => N.normPhone(x.phone) === '5577999220002');
    const out = N.state.whatsappMessages.filter(m => m.phone === '5577999220002' && m.direction === 'out');
    return { status: chat.status, contacts: N.state.contacts.length, outCount: out.length, acolheu: out[0]?.text.includes('encaminhei') };
  });
  check('novo contato criado para João', st.contacts === 2);
  check('handoff imediato (sem inventar orientação)', st.status === 'aguardando_vilmar' && st.outCount === 1 && st.acolheu);

  console.log('\n== Cenário 8: Vilmar assume a conversa ==');
  const callsBefore = await S(() => window.__BRAIN_CALLS);
  await page.click('.nav button[data-view="inbox"]');
  await page.waitForTimeout(100);
  await S(() => { window.NAVE.state.waSelectedChatId = window.NAVE.state.whatsappChats.find(x => x.phone === '5577999110001').id; window.NAVE.render(); });
  await page.waitForTimeout(100);
  await page.click('[data-action="chat-assume"]');
  await page.waitForTimeout(150);
  await S(() => window.NAVE.simulateInbound('5577999110001', 'Ok, aguardo o retorno do doutor.'));
  const callsAfter = await S(() => window.__BRAIN_CALLS);
  st = await S(() => {
    const N = window.NAVE;
    const chat = N.state.whatsappChats.find(x => x.phone === '5577999110001');
    return { aiMode: chat.aiMode, audit: N.state.auditLog.some(a => a.action === 'assume_chat') };
  });
  check('modo humano ativado pela UI', st.aiMode === 'humano');
  check('assunção auditada', st.audit);
  check('IA NÃO respondeu após assumir', callsAfter === callsBefore, `chamadas: ${callsBefore}→${callsAfter}`);
  await page.fill('#inboxText', 'Olá Maria, aqui é o Vilmar. Analisei seu caso e vamos conversar na reunião.');
  await page.click('[data-action="inbox-send"]');
  await page.waitForTimeout(200);
  check('Vilmar responde manualmente pela inbox', await S(() => {
    const m = window.NAVE.state.whatsappMessages.filter(x => x.phone === '5577999110001' && x.direction === 'out').slice(-1)[0];
    return m.actor === 'vilmar' && m.text.includes('aqui é o Vilmar');
  }));

  console.log('\n== Cenário 9: Vilmar conclui a tarefa ==');
  await page.click('.nav button[data-view="tarefas"]');
  await page.waitForTimeout(120);
  const taskId = await S(() => window.NAVE.state.tasks.find(t => t.status === 'aberta' && t.kind !== 'aprovacao')?.id);
  await page.click(`[data-action="task-done"][data-id="${taskId}"]`);
  await page.waitForTimeout(150);
  st = await page.evaluate(tid => { const t = window.NAVE.state.tasks.find(x => x.id === tid); return { status: t.status, done: !!t.completedAt, audit: window.NAVE.state.auditLog.some(a => a.action === 'complete_task') }; }, taskId);
  check('tarefa concluída pela UI', st.status === 'concluida' && st.done);
  check('conclusão auditada', st.audit);

  console.log('\n== Cenário 10: caso avança no funil (com automação de contratação) ==');
  st = await S(async () => {
    const N = window.NAVE, c = N.findContact({ phone: '5577999110001' });
    const golpe = N.contactCases(c.id).find(k => k.area === 'golpes_fraudes');
    await N.moveCase(golpe.id, 'analise_juridica', 'vilmar');
    await N.moveCase(golpe.id, 'proposta', 'vilmar');
    await N.moveCase(golpe.id, 'contratacao', 'vilmar');
    return { stage: N.caseById(golpe.id).stageId,
      contrato: N.state.tasks.some(t => t.title.startsWith('Emitir contrato e procuração') && t.caseId === golpe.id),
      pasta: N.state.tasks.some(t => t.title.startsWith('Abrir pasta') && t.caseId === golpe.id),
      auditMoves: N.state.auditLog.filter(a => a.action === 'move_pipeline').length };
  });
  check('demanda em contratação', st.stage === 'contratacao');
  check('automação de contratação criou tarefas', st.contrato && st.pasta);
  check('movimentações auditadas', st.auditMoves >= 3);

  console.log('\n== Cenário 11: cliente retorna dias depois ==');
  await S(() => window.NAVE.returnToAI(window.NAVE.state.whatsappChats.find(x => x.phone === '5577999110001').id));
  await setQueue([round(tu('send_message', { text: 'Oi, Maria! Seu caso do PIX está em fase de contratação e a reunião está mantida. Qualquer novidade avisamos por aqui.' })), finalRound('')]);
  await S(() => window.NAVE.simulateInbound('5577999110001', 'Oi, alguma novidade do meu caso?'));
  st = await S(() => {
    const N = window.NAVE, c = N.findContact({ phone: '5577999110001' });
    const out = N.state.whatsappMessages.filter(m => m.phone === '5577999110001' && m.direction === 'out').slice(-1)[0];
    return { contacts: N.state.contacts.length, replied: out.actor === 'ia' && out.text.includes('contratação'),
      touched: (Date.now() - new Date(c.lastInteraction).getTime()) < 60000 };
  });
  check('mesmo contato reconhecido (sem duplicar)', st.contacts === 2);
  check('IA retomou com contexto real do CRM', st.replied);
  check('última interação atualizada', st.touched);

  console.log('\n== Cenário 12: duas demandas do mesmo cliente não se misturam ==');
  st = await S(() => {
    const N = window.NAVE, c = N.findContact({ phone: '5577999110001' });
    const saude = N.contactCases(c.id).find(k => k.area === 'planos_de_saude');
    const golpe = N.contactCases(c.id).find(k => k.area === 'golpes_fraudes');
    const dS = N.caseDocs(saude.id).map(d => d.category), dG = N.caseDocs(golpe.id).map(d => d.category);
    return { saudeDocs: dS, golpeDocs: dG, saudeStage: saude.stageId, golpeStage: golpe.stageId,
      cross: dS.some(x => dG.includes(x)), tSaude: N.caseTasks(saude.id).length, tGolpe: N.caseTasks(golpe.id).length };
  });
  check('documentos por demanda sem cruzamento', !st.cross, JSON.stringify([st.saudeDocs, st.golpeDocs]));
  check('estágios independentes', st.saudeStage === 'aguardando_documentos' && st.golpeStage === 'contratacao');
  check('tarefas vinculadas à demanda certa', st.tGolpe >= 2);

  console.log('\n== Extra: permissão "exige aprovação" cria pendência e Vilmar aprova ==');
  await setQueue([round(tu('complete_task', { taskId: 'qualquer' })), finalRound('')]);
  await S(() => window.NAVE.simulateInbound('5577999110001', 'Pode dar baixa naquela pendência?'));
  st = await S(() => {
    const t = window.NAVE.state.tasks.find(x => x.kind === 'aprovacao' && x.status === 'aberta');
    return { created: !!t, id: t?.id };
  });
  check('ação bloqueada virou pendência de aprovação', st.created);
  if (st.id) {
    await page.evaluate(id => window.NAVE.approveAction(id), st.id);
    check('Vilmar aprovou e ação executou', await S(() => !window.NAVE.state.tasks.some(x => x.kind === 'aprovacao' && x.status === 'aberta')));
  }

  console.log('\n== Persistência: recarregar e conferir ==');
  await page.reload();
  await page.waitForFunction(() => window.__NAVE_READY === true, null, { timeout: 15000 });
  st = await S(() => ({ contacts: window.NAVE.state.contacts.length, cases: window.NAVE.state.cases.length,
    docs: window.NAVE.state.documents.length, appts: window.NAVE.state.appointments.length,
    audit: window.NAVE.state.auditLog.length, chats: window.NAVE.state.whatsappChats.length }));
  check('contatos persistem', st.contacts === 2);
  check('demandas persistem', st.cases === 3);
  check('documentos persistem', st.docs >= 4);
  check('agenda persiste', st.appts === 1);
  check('auditoria persiste', st.audit > 20);

  console.log('\n== UI final com dados: telas renderizam sem erro ==');
  for (const v of ['painel', 'inbox', 'funil', 'clientes', 'agenda', 'tarefas', 'sistema']) {
    await page.click(`.nav button[data-view="${v}"]`);
    await page.waitForTimeout(80);
  }
  for (const tab of ['automacoes', 'triagem', 'conhecimento', 'permissoes', 'auditoria']) {
    await page.click(`[data-action="system-tab"][data-id="${tab}"]`);
    await page.waitForTimeout(60);
  }
  check('painel mostra funil por origem', await S(() => document.getElementById('view-sistema').innerHTML.length > 100));
  const errBanner = await page.evaluate(() => document.getElementById('errorBanner').style.display === 'block' ? document.getElementById('errorBanner').textContent : '');
  check('banner de erro oculto', !errBanner, errBanner);
  const realErrors = consoleErrors.filter(e => !/net::|Failed to load resource|ERR_FAILED/i.test(e));
  check('zero erros de console', realErrors.length === 0, realErrors.slice(0, 3).join(' | '));

  console.log(`\n===== RESULTADO: ${passed} ✓ / ${failed} ✗ =====`);
  if (failures.length) { console.log('FALHAS:'); failures.forEach(f => console.log(' - ' + f)); }
  await browser.close();
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error('ERRO FATAL NO TESTE:', e); process.exit(1); });
