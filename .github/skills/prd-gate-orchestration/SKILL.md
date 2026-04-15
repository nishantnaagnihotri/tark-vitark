---
name: prd-gate-orchestration
description: "PRD gate orchestration workflow: execute Gate 2 handoff to prd-agent, enforce local/cloud progression checks, validate open-question handling, and apply cloud-return safeguards before Design progression. Use when: running Gate 2, validating PRD readiness, or deciding progression to Gate 3."
---

# PRD Gate Orchestration Workflow

Use this skill to run Gate 2 consistently from PRD handoff through design progression decisions.

## When To Use

- Running Gate 2 PRD handoff from orchestrator
- Validating PRD readiness and gate progression decisions
- Executing local-vs-cloud handoff branching for PRD drafting
- Validating cloud-returned PRD packages before Gate 3 progression

## PRD Gate Handoff Trigger

When executing Gate 2, invoke `prd-agent` with `Requirement Context Package` and any explicit Product Owner updates.

Requirement-to-PRD alignment rule:

1. Follow the `requirement-prd-alignment` skill (`.github/skills/requirement-prd-alignment/SKILL.md`) for Gate 1 contract freeze validation, one-to-one alignment checks, and Gate 2 loop-back conditions.

Pre-handoff confirmation rule:

1. Default PRD execution mode is `local`.
2. If Product Owner explicitly requests `cloud`, do not auto-run local subagent handoff.
3. For `cloud`, provide manual handoff prompt and wait for returned `PRD Draft Package`.

Proceeding rule:

1. Continue only when PRD result is `PRD Readiness: Ready` and `Gate Decision: can proceed to design`.
2. If open questions remain, continue only when they are explicitly marked as accepted by Product Owner.
3. Continue only when PRD output passes the Requirement-to-PRD alignment checks defined in `requirement-prd-alignment`.
4. Otherwise, return quality gaps to Product Owner and loop PRD clarification.

Cloud-return rule:

1. If PRD was executed in cloud, require `PRD Draft Package` to be pasted back.
2. Validate the returned package in Local against the PRD gate checklist and `requirement-prd-alignment` cloud-return checks before advancing gate status.
3. If any requirement-prd-alignment check fails (missing PR Description, blank Resolution fields, or unauthorized Gate 1 contract drift), loop back to PRD Agent.

PRD Amendment trigger rule:

1. If any owner decision during Gate 3 or later changes a PRD FR or AC, the PRD amendment MUST be committed on the same branch/PR as the decision before that gate cycle closes.
2. Gate closure is blocked if: a downstream artifact (`03-ux.md`, `04-design-qa.md`) references an owner-approved scope change but no corresponding PRD amendment exists in `## Amendments` in `02-prd.md`.
3. The amendment does not require a full PRD re-run. It is an append-only operation to the `## Amendments` section per the `PRD Amendment Protocol` in `requirement-prd-alignment`.
4. After any amendment, re-run the alignment check to confirm all affected AC rows reference the amended definition.