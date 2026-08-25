# ADR-001 — Growth OS Control Plane

## Decision
Adopt the existing VGJ LAW application as the implementation base and introduce explicit control-plane boundaries for execution state, AI orchestration, events, evidence and acceptance rather than replacing the desktop application wholesale.

## Context
The repository is an Electron application with browser-rendered UI, local persistence, CRM/agenda/tasks/automations, an AI agent, WhatsApp adapter and E2E tests. The existing implementation already contains meaningful business behavior and must be preserved where sound.

## Problem
The existing code does not yet expose a sufficiently formal distinction between implementation, integration, validation and evidence. The AI agent also contains a direct provider call inside `agent.js`, preventing a clean provider/prompt/schema/telemetry boundary.

## Options
1. Rewrite the application into a new full-stack architecture.
2. Keep the current application unchanged and add documentation only.
3. Incrementally introduce explicit control-plane contracts and refactor only where required.

## Chosen option
Option 3.

## Rationale
It minimizes migration risk, preserves validated business behavior, and creates a path toward the Growth OS without pretending that missing backend, web-funnel or external integrations already exist.

## Consequences
The application will temporarily contain legacy and new boundaries. Each refactor must retain behavior through regression tests. New critical components must expose contracts and evidence.
