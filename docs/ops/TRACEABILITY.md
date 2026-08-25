# TRACEABILITY PROTOCOL

For every P0/P1-CRITICAL requirement:

`MASTER_SPEC → REQUIREMENT → CAPABILITY → COMPONENT → FILE → IMPLEMENTATION → TEST → RED_TEAM → FIX → RETEST → ACCEPTANCE`

Required fields:

- Requirement ID
- Component
- Exact implementation file(s)
- Contract/schema
- Unit/integration/API/E2E tests
- Security/adversarial test
- Evidence IDs
- Last validated commit
- Acceptance decision

A missing link means `TRACEABILITY = INCOMPLETE` and prevents acceptance of the affected critical requirement.

## Evidence integrity
Evidence must identify execution mode (`REAL`, `INTEGRATED_TEST`, `MOCKED`, `STUBBED`, `SIMULATED`, `UNAVAILABLE`), command, result, timestamp and source revision. Mocked or simulated evidence cannot prove real external integration.
