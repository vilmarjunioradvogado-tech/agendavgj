/* VGJ LEGAL GROWTH OS — execution/evidence control plane.
 * This module is intentionally independent from the UI. It does not claim
 * operational status; it records state, evidence and controlled failures.
 */
(() => {
'use strict';
const N = window.NAVE = window.NAVE || {};
const STATES = ['INIT','SPEC_AUDIT','SPEC_CONSOLIDATION','REQUIREMENTS_DEFINITION','REPOSITORY_AUDIT','ARCHITECTURE','CORE_IMPLEMENTATION','MODULE_IMPLEMENTATION','INTEGRATION','VALIDATION_1','RED_TEAM','FAILURE_INJECTION','REFACTOR','REGRESSION','CROSS_REVIEW','CRITICAL_FLOW_VALIDATION','OPERATIONAL_READINESS','FINAL_ACCEPTANCE','DELIVERY','PARTIAL','BLOCKED'];
const MODES = ['REAL','INTEGRATED_TEST','MOCKED','STUBBED','SIMULATED','UNAVAILABLE'];
const TERMINAL = new Set(['DELIVERY','PARTIAL','BLOCKED']);
let state = { current:'INIT', previous:null, history:[], blockers:[] };
let loaded = false;

const key = k => `growth-os-${k}`;
const uuid = () => (crypto?.randomUUID ? crypto.randomUUID() : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`);
const iso = () => new Date().toISOString();

async function persist() {
  if (typeof N.sset === 'function') await N.sset(key('execution-state'), state);
}
async function init() {
  if (loaded) return state;
  loaded = true;
  try { state = (typeof N.sget === 'function' && await N.sget(key('execution-state'))) || state; } catch (_) {}
  if (!STATES.includes(state.current)) state.current = 'INIT';
  if (!Array.isArray(state.history)) state.history = [];
  if (!Array.isArray(state.blockers)) state.blockers = [];
  return state;
}
function assertState(s) { if (!STATES.includes(s)) throw new Error(`Invalid execution state: ${s}`); }
function assertMode(m) { if (!MODES.includes(m)) throw new Error(`Invalid execution mode: ${m}`); }
async function transition(next, evidence = {}) {
  await init(); assertState(next);
  if (TERMINAL.has(state.current) && state.current !== next) throw new Error(`Terminal state ${state.current} cannot transition to ${next}`);
  const previous = state.current;
  state.previous = previous;
  state.current = next;
  const record = { id: uuid(), previous, state: next, enteredAt: iso(), evidence };
  state.history.push(record);
  await persist();
  return record;
}
async function addBlocker(blocker) {
  await init();
  const b = { id: blocker.id || uuid(), severity: blocker.severity || 'P1', description: String(blocker.description || ''), status: 'OPEN', createdAt: iso() };
  state.blockers.push(b); await persist(); return b;
}
async function resolveBlocker(id, resolution = '') {
  await init();
  const b = state.blockers.find(x => x.id === id); if (!b) return null;
  b.status = 'RESOLVED'; b.resolution = resolution; b.resolvedAt = iso(); await persist(); return b;
}
async function evidence(input) {
  assertMode(input.executionMode || 'INTEGRATED_TEST');
  const e = {
    evidenceId: input.evidenceId || `EVD-${uuid()}`,
    requirementId: input.requirementId || null,
    phase: input.phase || state.current,
    type: input.type || 'COMMAND_RESULT',
    executionMode: input.executionMode || 'INTEGRATED_TEST',
    command: input.command || null,
    result: input.result || null,
    sourceRevision: input.sourceRevision || null,
    file: input.file || null,
    test: input.test || null,
    timestamp: iso(),
    status: input.status || 'RECORDED'
  };
  const existing = (typeof N.sget === 'function' && await N.sget(key('evidence'))) || [];
  existing.unshift(e);
  if (existing.length > 5000) existing.length = 5000;
  if (typeof N.sset === 'function') await N.sset(key('evidence'), existing);
  return e;
}
async function change(input) {
  const c = { changeId: input.changeId || `CHG-${uuid()}`, type: input.type || 'CODE', reason: input.reason || '', component: input.component || '', filesChanged: input.filesChanged || [], requirementsAffected: input.requirementsAffected || [], testsAffected: input.testsAffected || [], architecturalImpact: input.architecturalImpact || 'UNKNOWN', securityImpact: input.securityImpact || 'UNKNOWN', rollbackStrategy: input.rollbackStrategy || 'REVERT_COMMIT', timestamp: iso() };
  const existing = (typeof N.sget === 'function' && await N.sget(key('changes'))) || [];
  existing.unshift(c); if (existing.length > 2000) existing.length = 2000;
  if (typeof N.sset === 'function') await N.sset(key('changes'), existing);
  return c;
}
function classify(openP0, openP1Critical, openP1, criticalFlowsValidated) {
  if (openP0 > 0 || openP1Critical > 0 || !criticalFlowsValidated) return 'BLOCKED';
  if (openP1 > 0) return 'PARTIAL';
  return 'OPERATIONAL';
}
N.GROWTH_OS = {
  STATES, MODES, TERMINAL, init, transition, addBlocker, resolveBlocker, evidence, change, classify,
  getState: async () => { await init(); return JSON.parse(JSON.stringify(state)); }
};

/* Wrap loadState so the control plane is initialized after persistent state is loaded. */
const originalLoadState = N.loadState;
if (typeof originalLoadState === 'function') {
  N.loadState = async (...args) => { const result = await originalLoadState(...args); await init(); return result; };
}
})();
