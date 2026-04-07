---
name: requirement-gate-orchestration
description: "Requirement gate orchestration workflow: classify slice complexity, route Gate 1 handoff to requirement-challenger, enforce readiness/open-question rules, and transfer a frozen Requirement Context Package into Gate 2. Use when: running Gate 1, validating requirement readiness, or deciding progression to PRD."
---

# Requirement Gate Orchestration Workflow

Use this skill to run Gate 1 consistently from requirement intake through PRD handoff.

## When To Use

- Running Gate 1 requirement challenge handoff from orchestrator
- Classifying slice complexity at requirement intake
- Validating Gate 1 readiness and progression decisions
- Freezing and transferring the Requirement Context Package to Gate 2

## Slice Complexity Classification Trigger

At Gate 1 intake, classify slice complexity using the shared matrix in `.github/AGENTS.md`:

1. `Trivial`: Gate 1 (lightweight) -> Gate 5 -> Gate 6.
2. `Standard`: full 6-gate flow.
3. `Complex`: full 6-gate flow with full architecture depth.

Product Owner confirms or overrides classification before progression.

## Requirement Gate Handoff Trigger

When executing Gate 1, invoke `requirement-challenger` and forward only the requirement statement.

Input ownership rule:

1. Input contract is defined and owned by `requirement-challenger`.
2. Architect + Orchestrator must not expand or reinterpret requirement details at this gate.
3. Architect + Orchestrator only routes the handoff and enforces the resulting gate decision.

Proceeding rule:

1. Continue only when challenger result is `Readiness: Ready` and `Gate Decision: can proceed to PRD`.
2. If open questions remain, continue only when they are explicitly marked as accepted by Product Owner.
3. Otherwise, return unresolved items to Product Owner and loop requirement clarification.

Context transfer rule:

1. Require `Requirement Context Package` from challenger when Gate 1 passes.
2. Persist it as the slice context source of truth for Gate 2.
3. Use this package as the primary input to PRD drafting handoff.
4. Freeze the Gate 1 contract for Gate 2: requirement statement, scope boundaries, and AC intent cannot change without explicit Product Owner decision recorded in context.