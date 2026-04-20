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
4. **AC prose must not be copied into `02-prd.md`.** The PRD must reference AC IDs (e.g., `AC-19`) and link to the canonical feature file:
   ```md
   **Acceptance Criteria:** canonical source is [`features/{slice}.feature`](../../../features/{slice}.feature)
   ```
   User stories in the PRD reference AC IDs for traceability but do not restate AC text. This prevents AC drift across artifacts.

## Mandatory Alignment Evidence

1. Every Gate 2 PRD output must include a `Requirement-to-PRD Alignment Check` section.
2. Alignment check must show one-to-one mapping from Gate 1 requirement IDs and acceptance-criteria IDs to PRD sections and user stories.
3. Every requirement ID and acceptance-criteria ID must be mapped exactly once or marked with explicit Product Owner-approved rationale.
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

## PRD Amendment Protocol (Post-Gate-2 Scope Changes)

When a Product Owner decision during Gate 3 or later changes an acceptance criterion or adds scope that contradicts a PRD requirement, the PRD must be amended — never silently bypassed by downstream artifacts alone.

### When to Amend

Trigger a PRD amendment whenever:
- An owner decision changes, narrows, or extends a PRD acceptance criterion (FR or AC)
- A Gate 3+ owner-approved delta in `03-ux.md` contradicts a PRD requirement
- A downstream DQA or architecture artifact must add an exception note to a PRD criterion

### How to Amend

1. **Append** an `## Amendments` section to `02-prd.md` (never rewrite the original requirement text — preserve the original).
2. Each amendment entry must include:
   - Unique amendment number and title
   - Date of owner decision
   - IDs of affected FR/AC rows
   - Original text (verbatim quote)
   - Amended text or additive extension
   - What remains out-of-scope
   - PO approval reference (commit, delta log entry, or verbatim quote)
3. Downstream artifacts (`03-ux.md`, `04-design-qa.md`) cross-reference the PRD amendment by amendment number. They do not document the scope change independently of the PRD.
4. PRD amendments are **additive** — the original requirement rows in the PRD body are never edited. The amendment section is the version history.

### Ownership

- Orchestrator may write PRD amendments directly when the scope change was decided during an active gate cycle (Gate 3–6) and the owning PRD Agent is not in session.
- For significant scope changes requiring full re-analysis, route to PRD Agent for a formal amendment pass.

### Alignment Check Extension

After any amendment, re-run the Requirement-to-PRD Alignment Check to confirm all affected AC rows are now mapped to their amended definitions, not the original ones.