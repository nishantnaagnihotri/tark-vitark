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