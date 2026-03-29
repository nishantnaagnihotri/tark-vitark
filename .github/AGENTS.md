# Shared Agent Protocol

This repository follows a human-led, agent-executed workflow.

## Authority Model

1. Product Owner (human) owns product vision, priority, scope, and final decisions.
2. Agents prepare drafts, recommendations, and implementation artifacts.
3. Product Owner personally reviews and merges pull requests.

## Core Rules

1. Work one implementation slice at a time (WIP limit: 1).
2. Use part-time session mode: one micro-goal per session.
3. Close each session with a short checkpoint: done, next, blockers.
4. Keep changes small and reversible.

## Required Gates

1. Requirement challenge gate must pass before PRD freeze.
2. PRD drafting uses Requirement Context Package and must pass PRD quality gate before PRD freeze.
3. Design freeze and architecture signoff must happen before coding.
4. Merge requires passing tests, review closure, docs update, and rollback note.

## Environment Routing

1. Draft anywhere, decide and verify in Local.
2. Local is preferred for requirement challenge; cloud is preferred for PRD/UX drafts and Builder first-pass code + PR drafts.
3. Local is mandatory for final integration checks and merge readiness.
4. Copilot CLI is used for command-heavy scaffolding and repetitive transformations.

## Cloud Handoff Policy

1. Before any cloud-preferred gate handoff, Architect + Orchestrator must ask Product Owner to confirm `local` or `cloud` execution mode.
2. If `cloud` is chosen, Orchestrator provides a manual handoff prompt and pauses progression until return artifact is pasted.
3. Gate progression resumes only after returned artifact is validated in Local context.

## Handoff Contract Format

Every handoff should include:

1. Context: objective, scope, constraints.
2. Inputs: files, requirements, acceptance criteria.
3. Output expected: concrete artifact format.
4. Done criteria: objective conditions to accept output.
5. Risks and assumptions: explicit, testable, and reviewable.

## Escalation

Escalate to Product Owner when:

1. Requirement readiness is blocked.
2. Scope, security, or architecture tradeoffs need human choice.
3. Test and review findings conflict with delivery timeline.
