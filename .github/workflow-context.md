# Workflow Context Transfer

Canonical live handover context for the role-owned workflow.

Transition status:
- `.github/orchestrator-context.md` is a deprecated compatibility alias through migration package `#234`.
- `.github/orchestrator-context.archive.md` is historical governance archive only.
- If any historical file conflicts with this file, this file is the live source of truth.

## Product Owner Model

1. Product Owner is the human user.
2. Product Owner owns final decisions on scope, ambiguity acceptance, PR merge, and release.
3. Agents prepare artifacts and recommendations only.

## Visible Workflow Contract

1. Visible role chain is fixed: `product-owner` -> `ux-ui` -> `architect` -> `dev` -> `test`.
2. Gate ownership is fixed:
   - Gate 1 and Gate 2: `product-owner`
   - Gate 3: `ux-ui`
   - Gate 4: `architect`
   - Gate 5: `dev`
   - Gate 5.5 and Gate 6 readiness: `test`
3. Hidden helper lanes are fixed to: `requirement-challenger`, `prd-agent`, `design-qa-agent`.
4. Legacy role names remain transition-only aliases through `#234`: `architect-orchestrator`, `ux-agent`, `architecture-agent`, `runtime-qa`.

## Delivery Mode

1. Part-time execution.
2. One active implementation slice at a time.
3. One micro-goal per session.
4. Session closeout always includes: done, next, blockers.

## Environment Model

1. Default execution mode is local across all gates.
2. Product Owner may opt a specific gate invocation into cloud mode by explicit request.
3. Gate 3 design work, including UX+Design single-pass and Design QA substeps, is local-only.
4. Cloud mode uses manual handoff and pasted-back artifacts.
5. Final verification and merge readiness decisions happen in local context.

## Current Gate Contracts

1. Gate 1 (Requirement Challenge)
   - Input: requirement statement.
   - Output: readiness, challenge set, acceptance criteria, open questions, gate decision, Requirement Context Package.

2. Gate 2 (PRD)
   - Input: Requirement Context Package.
   - Output: PRD Draft Package plus readiness, alignment/traceability, quality gaps, open questions, and gate decision.

3. Gate 3 (Design)
   - Flow: PRD Draft Package -> bounded async `ux-ui` role pass (internally dispatched via legacy alias `ux-agent` during transition) -> checkpointed `03-ux.md` + `Orchestrator Resume Packet` (legacy packet label retained for transition compatibility) -> manual Product Owner resume -> Design QA Verdict Package.
   - Gate closes only after UX+Design pass and Design QA pass and Product Owner explicit approval.

4. Gate 4 (Architecture)
   - Input: slice artifacts `01-requirement.md` through `04-design-qa.md`.
   - Output: Architecture Plan Package plus `05-architecture.md` and `06-tasks.md`.

5. Gate 5 (Build)
   - Input: one approved Gate 4 issue with acceptance criteria, slice path, and architecture reference.
   - Output: Build Output Package with implementation summary, verification evidence, BDD evidence, PR package, quality gaps, open questions, and gate decision.

6. Gate 5.5 (Runtime QA)
   - Input: Gate 5 build output, PR link, acceptance-criterion journey map, and runtime setup notes.
   - Output: Runtime QA Verdict Package (`Pass | Fail | Blocked`) with coverage matrix, findings, and loop-back recommendation.

7. Gate 6 (Merge Readiness)
   - Input: GitHub issue reference, PR link, and Build Output Package.
   - Output: merge readiness recommendation, review summary, runtime QA status, outstanding gaps, gate decision, and owner action.

## Known Rules And Lifecycle Notes

1. Use role-owned progression. No visible orchestrator control-plane is required for live execution.
2. Gate 3 async completion never auto-advances progression. Resume requires explicit Product Owner instruction after artifact verification.
3. All async `run-agent.ts` lanes are tracked in `/memories/session/active-state.md` with terminal IDs and statuses.
4. Product Owner questions must use `vscode_askQuestions` with `allowFreeformInput: true`.
5. GitHub MCP is the default interface for GitHub interactions; fallback use requires explicit gap disclosure.
6. Copilot review loop completion requires the latest Copilot review on the current head to indicate 0 new comments (or equivalent wording); thread state alone is not sufficient.
7. PR merges into `master` remain Product Owner-only.
8. Raw Figma file keys must never be committed. Store keys only in `.figma-config.local`.
9. Figma baseline-lock is mandatory for continuation slices; existing approved elements must be cloned, not rebuilt.
10. UI-impacting implementation work must pass Gate 5.5 runtime QA unless Product Owner explicitly accepts residual runtime risk.
11. Global AC numbering remains in force. Last assigned AC is `AC-52` (`active-debate-m3-alignment`, 2026-05-08); next AC seed is `AC-53`.

## Resume Protocol (Role-Owned)

On first response in any new activity:

1. Read `.github/AGENTS.md`.
2. Read this file (`.github/workflow-context.md`).
3. Identify current gate and owning role.
4. Read only gate-relevant agent file(s) under `.github/agents/`.
5. If Gate 3 is active and async UX work is in flight or completed, inspect `docs/slices/<slice-name>/03-ux.md` before progression decisions.
6. Write or update `/memories/session/active-state.md` with current slice, gate, blockers, and next micro-goal.
7. Return a short resume snapshot:
   - current gate
   - known artifacts present or missing
   - immediate next micro-goal
   - blockers and owner decisions needed

## Current Program Status

1. Gates 1 through 6 are implemented at protocol level.
2. Gate 3 is fully wired through UX+Design single-pass and Design QA.
3. Governance is now role-owned in the live contract; orchestrator naming is transition compatibility only.

## Default Next Step

1. Start the next slice or run a fresh Gate 4 -> Gate 6 path on a new issue/PR.

## Current Slice Status

| Slice | Gate 1 | Gate 2 | Gate 3 | Gate 4 | Gate 5 | Gate 6 |
|---|---|---|---|---|---|---|
| `coming-soon-splash-page` | ✅ Pass | ✅ Full Pass | ✅ Pass (PO approved 2026-03-29) | ✅ Pass | ✅ Complete (T3 PR #18, T4 PR #19, T5 PR #20 all merged) | ✅ Complete (2026-03-29) |
| `debate-screen` | ✅ Pass | ✅ Full Pass | ✅ Pass (PO approved 2026-04-06) | ✅ Pass (Revision 1.1) | ✅ Complete (T1–T9 + visual polish PR #61) | ✅ Complete (2026-04-07) |
| `post-tark-vitark` | ✅ Re-pass (refined, 2026-04-08) | ✅ Re-pass (2026-04-08) | ✅ Pass (PO approved 2026-04-16, PR #83 merged) | ✅ Pass (2026-04-16, PR #94 merged) | ✅ Complete (T-1–T-8 + post-build PRs #106, #108, slice merge PR #109) | ✅ Complete (2026-04-17, PR #112 merged) |
| `debate-screen-polish` | ✅ Pass (2026-04-17, Standard) | ✅ Full Pass (2026-04-17) | ✅ Pass | ✅ Pass | ✅ Complete (T-1 #124, T-2 #125, T-3 #126; integrated 2026-04-19) | ✅ Complete (2026-04-19; tracker #127 closed) |
| `create-debate` | ✅ Pass (2026-04-23, Standard) | ✅ Full Pass (2026-04-23) | ✅ Pass (PO approved 2026-04-26; Gate 3 writeback complete) | ✅ Pass (2026-04-27; architecture + task decomposition complete) | ✅ Complete (PRs #212, #211, #213, #214, #215, #216, #217 merged; integrated runtime QA Pass) | ✅ Complete (2026-04-29; PR #219 merged) |
| `active-debate-m3-alignment` | ✅ Pass (2026-05-08, Standard) | ✅ Full Pass (2026-05-08) | 🔁 Gate 3 blocked; PO selected manual exact-screen rebuild handoff to ux-agent (2026-05-08) | ⏳ Pending | ⏳ Pending | ⏳ Pending |

## Log Archive Protocol

When a slice reaches Gate 6 ✅ Complete:

1. Preserve reusable repo-wide principles in shared protocol and this file before archiving slice-specific detail.
2. Move only slice-specific log entries for that slice to `docs/slices/<slice-name>/context-log.md`.
3. Keep this file concise for fast session loading.
4. Use `.github/orchestrator-context.archive.md` for deep historical governance records.

## Context Update Log

### 2026-06-12
- Gate status: Role-owned shared contract migration started under package `#230`.
- Artifact changes: Added `.github/workflow-context.md` as canonical live context; retained orchestrator-named files as compatibility aliases.
- Open questions status: none.
- Next micro-goal: complete package `#230` by finishing in-scope compatibility rewrite and verification.
- Blockers/owner decisions: none.
