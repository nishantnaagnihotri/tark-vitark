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

## Figma Frame Authority Rule (Gate 4)

Figma frames documented in `04-design-qa.md` are the **authoritative design source of truth** for all visual implementation decisions at Gate 4 and beyond. When text specs in markdown artifacts diverge from the Figma frames, the Figma frames win unconditionally.

Architecture agent must:

1. Read Figma frame node IDs and URLs from `04-design-qa.md` (Frame Inventory section) before deriving any implementation values.
2. Derive exact visual properties (dimensions, widths, spacing, color token names) from the Figma frames — not from text approximations in `03-ux.md` or `02-prd.md`.
3. Record each Figma node ID used as the authoritative source for a given implementable decision in `05-architecture.md` (e.g., "Mobile card width: 85% — sourced from Figma frame `620:145`").
4. Flag any value that cannot be verified against a Figma frame as a `Must Resolve` gap before declaring `Architecture Readiness: Ready`.

Orchestrator must include Figma frame URLs with node IDs in the Gate 4 handoff packet, alongside the standard slice artifact files.

## Architecture Gate Handoff Trigger

When executing Gate 4, invoke `architecture-agent` with slice artifacts (`01-requirement.md`, `02-prd.md`, `03-ux.md`, `04-design-qa.md`) **and Figma frame URLs with node IDs from `04-design-qa.md`** and any explicit Product Owner technical constraints.

## Execution Rule

1. Gate 4 signoff decisions are Local-only.
2. Cloud may be used only for non-binding analysis alternatives.
3. Final architecture approval and gate progression must be made in Local context.
4. Architecture Agent must run its internal Challenge Phase before returning architecture outputs; all `Must Resolve` gaps must be resolved or explicitly accepted by Product Owner before `Architecture Readiness: Ready` is returned.

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

## Slice Branch and Parallel Dispatch Rule (Gate 4 → Gate 5 transition)

1. **Slice branch is mandatory.** Before any task branch is cut, orchestrator creates `slice/<slice-name>` from current `master`. All task PRs target this slice branch. The final PR (`slice/<slice-name> → master`) is the single PO merge action for the slice.
2. **Independence check determines dispatch strategy.** At Gate 4, classify each task pair:
   - **Non-overlapping** (different files, or same file but different lines/blocks with zero merge-conflict risk): dispatch all tasks in parallel; each agent cuts its branch from `slice/<slice-name>` and opens a PR targeting `slice/<slice-name>`.
   - **Overlapping** (same selector, same lines, or logical dependency on each other's output): dispatch sequentially only.
3. **Post-merge rebase rule (non-overlapping parallel tasks).** After each task PR merges into the slice branch, orchestrator rebases all remaining open task branches onto the updated slice branch. Since hunks are non-overlapping the rebase is zero-conflict and automated. After each rebase push, orchestrator requests a fresh Copilot review on the rebased PR before declaring that PR merge-ready.
4. **Dev agent review loop ownership.** Each dev agent owns its own Copilot review loop end-to-end (implement → open PR → review loop → clean pass → report back). Orchestrator takes over only for: post-merge rebase, retarget, re-review sequencing, and final slice PR creation.
5. **Gate 5.5 Runtime QA runs against the slice branch**, not individual task branches. The slice branch is the correct verification surface — it represents the fully-integrated state before any change touches `master`.

## Architecture Gate Checklist (Orchestrator-Owned)

1. Run the canonical checklist in `.github/references/architecture-quality-checks.md`.
2. Verify `06-tasks.md` includes created issue numbers and architecture section references.
3. Verify slice tracker and story issue bidirectional links and required labels (see `slice-traceability-and-issue-ops` skill for traceability rules).