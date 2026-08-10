'use strict';
const assert = require('node:assert/strict');
const { test } = require('node:test');
const { ensureState, upsertContact, createCase, moveCase, createTask, dashboard } = require('../core/nave-core');
const { processInbound, classifyMessage } = require('../core/nave-agent');

test('deduplicates contact by phone', () => {
  const s = ensureState({});
  const a = upsertContact(s, { name: 'Maria', phone: '+55 (77) 99999-0000' });
  const b = upsertContact(s, { name: 'Maria Silva', phone: '5577999990000' });
  assert.equal(a.contact.id, b.contact.id);
  assert.equal(s.contacts.length, 1);
  assert.equal(b.contact.name, 'Maria Silva');
});

test('case moves only to valid pipeline stages', () => {
  const s = ensureState({});
  const c = upsertContact(s, { name: 'João', phone: '5577999991111' }).contact;
  const kase = createCase(s, { contactId: c.id, title: 'Golpe PIX' });
  moveCase(s, kase.id, 'ANALISE_VILMAR');
  assert.equal(kase.stage, 'ANALISE_VILMAR');
  assert.throws(() => moveCase(s, kase.id, 'ESTAGIO_INEXISTENTE'));
});

test('agent creates CRM record and human handoff for urgent inbound', () => {
  const s = ensureState({});
  const result = processInbound({ state: s, message: { from: '5577999992222', name: 'Ana', text: 'Meu plano negou o tratamento e preciso de liminar hoje' } });
  assert.equal(result.needsHuman, true);
  assert.equal(result.case.stage, 'ANALISE_VILMAR');
  assert.equal(result.contact.phone, '5577999992222');
  assert.ok(s.tasks.some(t => t.caseId === result.case.id));
});

test('classification recognizes health-plan denial', () => {
  const c = classifyMessage('A Unimed negou o tratamento prescrito');
  assert.equal(c.area, 'PLANOS_DE_SAUDE');
  assert.equal(c.intent, 'NEGATIVA_COBERTURA');
});

test('dashboard exposes operational attention counts', () => {
  const s = ensureState({});
  const c = upsertContact(s, { name: 'Cliente', phone: '5577999993333' }).contact;
  const kase = createCase(s, { contactId: c.id, title: 'Caso', stage: 'ANALISE_VILMAR' });
  createTask(s, { title: 'Analisar caso', caseId: kase.id });
  const d = dashboard(s);
  assert.equal(d.contacts, 1);
  assert.equal(d.cases, 1);
  assert.equal(d.awaitingHuman, 1);
  assert.equal(d.pendingTasks, 1);
});
