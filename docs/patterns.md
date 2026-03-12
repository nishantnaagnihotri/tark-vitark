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

## Persistence Pattern
- Record process and architecture decisions in `docs/decision-log.md`.
- Record repeatable delivery heuristics in this file.
- Update `docs/roles-and-gates.md` when role triggers or responsibilities evolve.
