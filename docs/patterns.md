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

## Persistence Pattern
- Record process and architecture decisions in `docs/decision-log.md`.
- Record repeatable delivery heuristics in this file.
- Update `docs/roles-and-gates.md` when role triggers or responsibilities evolve.
