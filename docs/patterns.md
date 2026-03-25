# Patterns

Durable working patterns for planning, delivery, and delegation.

## Slice-First Delivery
- Prefer small, reviewable vertical slices (1 to 3 days).
- One slice should target one measurable user outcome.
- If a slice exceeds 3 days, split by user path or state.

## Role Activation Pattern
- Keep default active roles lean.
- Activate Security Steward and Release Engineer only when risk triggers fire.
- Add specialist roles (performance/accessibility/reliability/data/docs) only when needed.

## Gate Discipline Pattern
- No coding without explicit acceptance criteria.
- No merge without critical-path tests.
- No ship without gate approvals and decision-log update.

## Requirements-First Pattern
- For every non-trivial slice, create a short Functional Requirements Spec before implementation.
- Keep requirements lightweight: problem, scope, user stories, acceptance criteria, and edge cases.
- Link the spec in Plan Gate artifacts so UX, engineering, and QA work from one source of truth.

## Requirements-Continuity Pattern
- Keep a single requirements registry in `docs/functional-requirements-index.md`.
- Assign stable requirement IDs and reuse them across UX notes, implementation tasks, and QA evidence.
- On every significant requirement change, update both the index and `docs/decision-log.md`.

## Startup-First Context Pattern
- Start every new chat by loading `docs/current-state.md` before deeper artifacts.
- Then load requirements index, active slice specs, and decision log.
- This preserves high signal in limited context windows.

## Write-Through Persistence Pattern
- Do not leave critical decisions only in chat history.
- In the same task, write changes to the relevant canonical docs.
- Treat task completion as blocked until required docs are updated.

## Agent-First Execution Pattern
- Default every workflow step to agent execution.
- Allow manual fallback only for external platform blockers (auth, API availability, provider outage).
- When fallback occurs, record blocker, minimal manual action, and the automation follow-up in the same task.

## UX-to-Code Contract Pattern
- Every active UX spec must include:
	- Figma Production Contract
	- Code Translation Contract
- Use stable naming conventions for frames, components, and tokens to maximize reuse.
- Ensure Developer Agent can map design artifacts to code components without ambiguous interpretation.

## Persistence Pattern
- Record process and architecture decisions in `docs/decision-log.md`.
- Record repeatable delivery heuristics in this file.
- Update `docs/roles-and-gates.md` when role triggers or responsibilities evolve.
