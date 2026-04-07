---
name: architecture-gate-orchestration
description: "Architecture gate orchestration workflow: execute Gate 4 handoff and validation, enforce local-only signoff, apply readiness/loop-back checks, and close Gate 4 with task/issue traceability evidence. Use when: running Gate 4, validating architecture readiness, or authorizing Build progression."
---

# Architecture Gate Orchestration Workflow

Use this skill to run Gate 4 consistently from architecture handoff through Build authorization.

## When To Use

- Running Gate 4 architecture handoff from orchestrator
- Validating architecture readiness and gate progression decisions
- Closing Gate 4 with `05-architecture.md` and `06-tasks.md` evidence
- Verifying issue/task traceability before Build gate authorization

## Architecture Gate Handoff Trigger

When executing Gate 4, invoke `architecture-agent` with slice artifacts (`01-requirement.md`, `02-prd.md`, `03-ux.md`, `04-design-qa.md`) and any explicit Product Owner technical constraints.

## Execution Rule

1. Gate 4 signoff decisions are Local-only.
2. Cloud may be used only for non-binding analysis alternatives.
3. Final architecture approval and gate progression must be made in Local context.
4. Architecture Agent must run its internal Challenge Phase before returning architecture outputs; all `Must Resolve` gaps must be resolved or explicitly accepted by Product Owner before `Architecture Readiness: Ready`.

## Proceeding Rule

1. Continue only when architecture result is `Architecture Readiness: Ready` and `Gate Decision: can proceed to build`.
2. If open questions remain, continue only when they are explicitly marked as accepted by Product Owner.
3. Otherwise, return quality gaps to Product Owner and loop architecture clarification.

## Gate 4 Completion Rule

1. Gate 4 closes only when `05-architecture.md` is produced and approved.
2. At Gate 4 end, orchestrator decomposes the architecture plan into GitHub Issues (one per atomic task).
3. Orchestrator records created issue numbers in `06-tasks.md`.
4. Gate 5 (Build) may begin only after `06-tasks.md` and related issues are in place.

## Local Validation Rule

1. Validate `05-architecture.md` and `06-tasks.md` against Gate 4 checklist before Build gate authorization.

## Architecture Gate Checklist (Orchestrator-Owned)

1. Run the canonical checklist in `.github/references/architecture-quality-checks.md`.
2. Verify `06-tasks.md` includes created issue numbers and architecture section references.
3. Verify slice tracker and story issue bidirectional links and required labels (see `slice-traceability-and-issue-ops` skill for traceability rules).