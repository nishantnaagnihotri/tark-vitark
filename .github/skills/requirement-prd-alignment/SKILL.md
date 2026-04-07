---
name: requirement-prd-alignment
description: "Requirement-to-PRD alignment workflow: preserve Gate 1 contract, enforce one-to-one requirement mapping, validate PRD package completeness, and apply Gate 2 loop-back conditions. Use when: drafting PRD outputs, reviewing Gate 2 readiness, or validating cloud-returned PRD packages."
---

# Requirement-To-PRD Alignment Workflow

Use this skill to prevent Gate 1 to Gate 2 drift and to standardize PRD validation in both local and cloud-return flows.

## When To Use

- Drafting `02-prd.md` from a `Requirement Context Package`
- Reviewing Gate 2 readiness and progression decisions
- Validating cloud-returned `PRD Draft Package` outputs
- Investigating suspected scope or acceptance-criteria drift in PRD artifacts

## Source Contract Freeze (Gate 1 -> Gate 2)

1. `01-requirement.md` and the `Requirement Context Package` are immutable source contracts for Gate 2.
2. Requirement statement, in-scope and out-of-scope boundaries, and acceptance-criteria intent (including IDs) carry forward unchanged unless Product Owner explicitly approves a change.
3. Any owner-approved change must be called out explicitly in PRD outputs and context updates.

## Mandatory Alignment Evidence

1. Every Gate 2 PRD output must include a `Requirement-to-PRD Alignment Check` section.
2. Alignment check must show one-to-one mapping from Gate 1 requirement IDs and acceptance-criteria IDs to PRD sections and user stories.
3. Every requirement ID must be mapped exactly once or marked with explicit Product Owner-approved rationale.
4. The `Traceability Map` must be consistent with the alignment check and the final PRD content.

## Template Completeness Rule

1. Requirement and PRD templates are completed only after requirement refinement is complete.
2. Gate 1 unresolved items are allowed only when explicitly accepted by Product Owner.
3. No unresolved placeholder text is allowed in `02-prd.md` or in the returned `PRD Draft Package`.

## Gate 2 Progression Checks (Orchestrator)

1. Progress only when `PRD Readiness: Ready` and `Gate Decision: can proceed to design`.
2. If open questions remain, each must be explicitly accepted by Product Owner.
3. Loop back if unauthorized scope expansion, wording changes, or acceptance-criteria intent drift is detected.
4. Loop back if any `Open Questions` row has a blank `Resolution` field.
5. Loop back if the `PR Description` block is missing from the returned `PRD Draft Package`.

## Cloud-Return Validation

1. Require the full `PRD Draft Package` before gate progression.
2. Re-run Gate 2 progression checks locally against the pasted package.
3. Verify no Gate 1 contract drift exists unless explicitly owner-approved and logged.
4. If any check fails, route back to PRD Agent with explicit remediation items.

## PRD Agent Output Requirements

1. Include both `Requirement-to-PRD Alignment Check` and `Traceability Map` in every Gate 2 response.
2. Surface owner-approved deltas in a dedicated subsection.
3. Ensure every open question includes `ID`, `Question`, `Source`, `Status`, and non-empty `Resolution`.
4. Include a copy-paste `PR Description` block in the `PRD Draft Package`.