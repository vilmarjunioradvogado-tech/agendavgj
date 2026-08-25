# VGJ LEGAL GROWTH OS — MASTER SPEC V2

## Status
SPEC_FROZEN: true
Implementation status: PARTIAL
Operational status: NOT_ESTABLISHED
Source repository: `vilmarjunioradvogado-tech/agendavgj`

## 1. Scope
The existing VGJ LAW desktop application is the implementation base. The Growth OS extends, rather than replaces, the existing CRM, AI agent, triage, documents, agenda, tasks, automations, audit and knowledge capabilities.

The first operational target is the measurable chain:

`ACQUISITION → LEAD → TRIAGE → QUALIFICATION → CRM → HUMAN SERVICE → CONVERSION → ANALYTICS → EXPERIMENT → LEARNING`

Campaign/content/landing-page generation is governed by compliance and human approval. Legal decisions remain human decisions.

## 2. Mandatory engineering invariants
1. Code existence is not feature completion.
2. A feature is IMPLEMENTED only when implementation, integration, validation and evidence exist.
3. The model is never a security boundary.
4. External availability is never simulated as real.
5. Critical legal sources must be traceable or explicitly `UNVERIFIED`.
6. Critical actions require explicit authorization and, where policy requires, human approval.
7. Existing working code is preserved unless an ADR documents replacement.
8. Scope cannot be silently reduced after specification freeze.
9. Every critical state transition is validated and auditable.
10. `OPERATIONAL` cannot be asserted until every gate in the acceptance protocol passes.

## 3. Execution state machine
`INIT → SPEC_AUDIT → SPEC_CONSOLIDATION → REQUIREMENTS_DEFINITION → REPOSITORY_AUDIT → ARCHITECTURE → CORE_IMPLEMENTATION → MODULE_IMPLEMENTATION → INTEGRATION → VALIDATION_1 → RED_TEAM → FAILURE_INJECTION → REFACTOR → REGRESSION → CROSS_REVIEW → CRITICAL_FLOW_VALIDATION → OPERATIONAL_READINESS → FINAL_ACCEPTANCE → DELIVERY`

Failure states: `PARTIAL`, `BLOCKED`.

State transitions require entry criteria, artifacts, tests, exit criteria and evidence recorded in `execution/state.json`.

## 4. Criticality
- P0: critical security, data integrity, authorization, destructive migration or core workflow failure.
- P1-CRITICAL: blocks safe operation of a core business capability.
- P1-NONCRITICAL: high-value incomplete capability that does not compromise safe operation.
- P2: important improvement.
- P3: improvement.

Final classification:
- `BLOCKED` if any P0 or P1-CRITICAL is open, or a critical flow is unvalidated.
- `PARTIAL` if no blocker exists but required P1-NONCRITICAL/P2/P3 work remains.
- `OPERATIONAL` only when every mandatory acceptance criterion passes with evidence.

## 5. Capability model
Each capability must be tracked as:
`CAPABILITY_ID, REQUIRED, EXISTING, PARTIAL, MISSING, DEPENDENCIES, IMPLEMENTATION_STATUS, VALIDATION_STATUS, EVIDENCE`.

A capability may not be reported as complete solely because a route, UI, table, function, agent or prompt exists.

## 6. Feature completion contract
`IMPLEMENTATION + CONTRACT + INTEGRATION + TEST + EVIDENCE = IMPLEMENTED`

Otherwise status is `PARTIAL` or `PENDENCY`.

## 7. External dependency policy
Every dependency records version, purpose, required/optional status, credentials, environment, health check, failure mode and fallback. If unavailable, record `EXTERNAL_DEPENDENCY_UNAVAILABLE`. Never substitute a mock for production evidence.

## 8. Production safety
Destructive or externally visible operations require, where applicable:
`DRY_RUN → IMPACT_PREVIEW → APPROVAL_POLICY → EXECUTION → AUDIT`.

## 9. Data protection
Legal/lead data must use minimization, ownership isolation, authorization, auditability, secret/log redaction and controlled retention. Real personal data must not be required for automated tests.

## 10. AI control plane
All model calls must be mediated by an AI orchestration boundary. Required controls: provider/model, prompt version, schema, context identity, tools, permissions, timeout, retry, fallback, token/cost/latency telemetry, structured validation and evaluation.

Current repository reality: the existing agent directly calls the Anthropic API through its `llm` function and has a test brain. This is an architectural finding, not evidence that a complete provider abstraction exists. It must be refactored behind an explicit orchestration boundary before the AI layer can be accepted as complete.

## 11. Acceptance gates
Required technical gates: install, build, typecheck where applicable, lint/static validation where applicable, unit, integration, API, E2E, security, AI evaluation, migration/data-integrity, production build and smoke.

Required business gates: campaign flow, lead flow, operation flow and intelligence flow.

## 12. Freeze/change control
After this specification is frozen, a new requirement requires `NEW_REQUIREMENT → IMPACT_ANALYSIS → PRIORITY → INCORPORATE/DEFER/REJECT → SPEC_VERSION`.

## 13. Current classification
`PARTIAL` until the repository is executed and the complete acceptance evidence is available. No current artifact may upgrade this status merely by documentation.
