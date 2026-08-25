# REQUIREMENTS MATRIX

| ID | Requirement | Priority | Domain | Existing evidence | Status | Validation required |
|---|---|---|---|---|---|---|
| R-001 | CRM lead/contact/case lifecycle with explicit transitions | P0 | CRM | `app/js/data.js`, `app/js/agent.js` | PARTIAL | unit + integration + E2E + integrity |
| R-002 | AI tool authorization independent of model output | P0 | Security/AI | `app/js/agent.js` | PARTIAL | security + adversarial |
| R-003 | Human handoff for critical/legal decisions | P0 | Operations | `app/js/agent.js` | PARTIAL | E2E + policy |
| R-004 | Audit trail for critical actions | P0 | Audit | `app/js/core.js`, `app/js/agent.js` | PARTIAL | integrity + E2E |
| R-005 | Real external dependency state must not be simulated | P0 | Integrations | `app/js/whatsapp.js` | PARTIAL | integration + failure injection |
| R-006 | AI output schema/semantic/policy validation | P0 | AI | `app/js/agent.js` | PARTIAL | AI evaluation |
| R-007 | Prompt/model/provider version traceability | P1-CRITICAL | AI | not established as registry | MISSING | integration + regression |
| R-008 | Central AI orchestrator boundary | P0 | AI architecture | direct `llm()` in agent | PARTIAL | architecture + integration |
| R-009 | Persistent execution/workflow state with recovery | P1-CRITICAL | Workflow | existing automations; formal state machine not established | PARTIAL | failure injection + recovery |
| R-010 | Idempotency for duplicate-sensitive operations | P0 | Data integrity | partial duplicate handling in code | PARTIAL | concurrency/integration |
| R-011 | Structured event model with correlation IDs | P1-CRITICAL | Events | existing `emit` usage | PARTIAL | integration + observability |
| R-012 | Knowledge source traceability and verification status | P1-CRITICAL | Knowledge | existing knowledge search | PARTIAL | source-control tests |
| R-013 | Acquisition-to-conversion funnel events | P1 | Growth | CRM foundation exists | PARTIAL | E2E |
| R-014 | Campaign engine with compliance gate | P1 | Growth/Compliance | not established | MISSING | E2E + compliance |
| R-015 | Content generation/review/versioning | P1 | Content/AI | skills exist; application engine not established | PARTIAL | AI regression + E2E |
| R-016 | Landing page generation and real lead ingestion | P1 | Acquisition | existing app is desktop CRM; web funnel not established | MISSING | API/E2E |
| R-017 | Explainable lead scoring | P1 | CRM | not established as formal engine | MISSING | unit + E2E |
| R-018 | Analytics from real persisted data | P1 | Analytics | partial dashboards | PARTIAL | integration |
| R-019 | Experiment and learning loop with human approval | P2 | Growth | not established | MISSING | integration |
| R-020 | Security controls: auth/authorization/ownership/session isolation | P0 | Security | desktop/local architecture | PARTIAL | security |
| R-021 | Observability: structured logs/correlation/AI usage/cost | P1-CRITICAL | Observability | partial audit/events | PARTIAL | integration |
| R-022 | Critical-flow evidence registry | P1-CRITICAL | Governance | not established | MISSING | protocol validation |
| R-023 | Evidence integrity tied to source revision | P1-CRITICAL | Governance | not established | MISSING | governance tests |
| R-024 | Automated regression in CI | P1 | QA | E2E workflow exists | PARTIAL | CI |
| R-025 | Production build/smoke verification | P1 | Release | build workflow exists | PARTIAL | CI/release |

P0/P1-CRITICAL items cannot be declared complete until their validation and evidence columns are satisfied.