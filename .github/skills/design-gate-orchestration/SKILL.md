---
name: design-gate-orchestration
description: "Design gate orchestration workflow: execute Gate 3 UX/Figma/Design QA substeps, enforce local-only execution and validation checks, run revision loops, and require Product Owner approval before gate closure. Use when: running Gate 3, validating substep readiness, or deciding Gate 3 progression."
---

# Design Gate Orchestration Workflow

Use this skill to coordinate Gate 3 execution from UX handoff through Design QA closure.

## When To Use

- Running Gate 3 substeps in the orchestrator
- Validating UX/Figma/Design QA readiness and progression decisions
- Handling Design QA revision loops with Figma Agent
- Determining whether Gate 3 may close and Gate 4 may begin

## Gate 3 Execution Rule

1. Gate 3 is local-only for all substeps.
2. Do not offer cloud mode for UX, Figma, or Design QA substeps.
3. Progression between substeps must follow the readiness and gate-decision checks below.

## Substep A: UX Handoff Trigger (Gate 3A)

When executing Gate 3A, invoke `ux-agent` with `PRD Draft Package` and any explicit Product Owner UX or platform constraints.

Proceeding rule:

1. Continue to Gate 3B only when UX result is `UX Readiness: Ready`, `Gate Decision: can proceed to figma`, and UX has completed its internal Challenge Phase.
2. Before returning `UX Readiness: Ready`, UX must have all `Must Resolve` items from its internal Challenge Phase either resolved or explicitly accepted by Product Owner.
3. Require a `Design Artifact` reference (Figma file URL) in UX output for every UX task.
4. If Design System library is missing, route bootstrap to Figma Agent (Gate 3A -> 3B fast-path), publish/enable it in Figma, and require populated `design_system_library_file_key` in `.figma-config.local` before Gate 3B progression.
5. If open questions remain, continue only when explicitly accepted by Product Owner.
6. Otherwise, loop back to UX clarification.

Local-validation rule:

1. Validate `UX Flow/State Package` against UX substep checklist.
2. Validate `Design Artifact` reference. Missing/invalid reference must loop back.
3. Validate `.figma-config.local` has populated, non-empty `design_system_library_file_key`. Treat blank/empty as missing. `design_system_library_url` is recommended but optional.

## Substep B: Figma Handoff Trigger (Gate 3B)

When executing Gate 3B, invoke `figma-agent` with `UX Flow/State Package` and any explicit Product Owner design-system or platform constraints.

Proceeding rule:

1. Continue to Gate 3C only when Figma result is `Figma Readiness: Ready` and `Gate Decision: can proceed to design-qa`.
2. If open questions remain, continue only when explicitly accepted by Product Owner.
3. Otherwise, loop back to Figma clarification.

Local-validation rule:

1. Validate `Design Draft Package` against Figma substep checklist before Gate 3C.

## Substep C: Design QA Handoff Trigger (Gate 3C)

When executing Gate 3C, invoke `design-qa-agent` with `Design Draft Package`, `UX Flow/State Package`, and `PRD Draft Package`.

Design feedback loop rule:

1. Design QA reads the Figma design directly via MCP on every pass.
2. If structural gaps exist, Design QA routes back to Figma Agent with specific revision instructions.
3. Figma Agent revises design and re-submits a new `Design Draft Package`.
4. Repeat the loop until no structural gaps remain.

Product Owner approval rule:

1. Once Design QA reaches `Agent-Ready`, present `Design QA Verdict Package` to Product Owner.
2. Product Owner reviews design directly and explicitly approves or requests changes.
3. If changes are requested, route back to Figma Agent and restart Gate 3C loop.
4. Gate 3 closes only when Product Owner explicitly approves.

Local-validation rule:

1. Validate `Design QA Verdict Package` against Design QA checklist before closure.

## Gate 3 Completion Rule

1. All three substeps (UX, Figma, Design QA) must pass before Gate 3 is closed.
2. Closing Gate 3 requires `Design QA Verdict Package` and explicit Product Owner approval on record.
3. Gate 4 (Architecture) must not begin until Gate 3 is formally closed.