# Orchestrator Context Transfer

Canonical live handover context for the Architect + Orchestrator agent.

## Product Owner Model

1. Product Owner is the human user.
2. Product Owner owns final decisions on scope, ambiguity acceptance, PR merge, and release.
3. Agents prepare artifacts and recommendations only.

## Figma Project Metadata

Project-specific Figma identifiers live in `.figma-config.local` (gitignored). Use `.figma-config.local.example` as the schema and onboarding reference. Required keys are `project_name`, `plan_key`, and `design_system_library_file_key` (required after first Gate 3 bootstrap).

## Delivery Mode

1. Part-time execution.
2. One active implementation slice at a time.
3. One micro-goal per session.
4. Session closeout always includes: done, next, blockers.

## Environment Model

1. Default execution mode is local across all gates.
2. Product Owner may opt a specific gate invocation into cloud mode by explicit request.
3. Gate 3 design work, including UX, Figma, and Design QA substeps, is local-only.
4. Cloud mode uses manual handoff and pasted-back artifacts.
5. Final verification and merge readiness decisions happen in local context.

## Implemented Agents (Current)

1. Architect + Orchestrator: `.github/agents/architect-orchestrator.agent.md`
2. Requirement Challenger: `.github/agents/requirement-challenger.agent.md`
3. PRD Agent: `.github/agents/prd.agent.md`
4. UX Agent: `.github/agents/ux.agent.md`
5. Figma Agent: `.github/agents/figma.agent.md`
6. Design QA Agent: `.github/agents/design-qa.agent.md`
7. Architecture Agent: `.github/agents/architecture.agent.md`
8. Dev Agent: `.github/agents/dev.agent.md`

## Current Gate Contracts

1. Gate 1 (Requirement Challenge)
    - Input: requirement statement.
    - Output: readiness, challenge set, acceptance criteria, open questions, gate decision, Requirement Context Package.

2. Gate 2 (PRD)
    - Input: Requirement Context Package.
    - Output: PRD Draft Package plus readiness, alignment/traceability, quality gaps, open questions, and gate decision.

3. Gate 3 (Design)
    - Flow: PRD Draft Package -> UX Flow/State Package -> Design Draft Package -> Design QA Verdict Package.
    - Gate closes only after UX, Figma, and Design QA pass and Product Owner explicitly approves the design.

4. Gate 4 (Architecture)
    - Input: slice artifacts `01-requirement.md` through `04-design-qa.md`.
    - Output: Architecture Plan Package plus `05-architecture.md` and `06-tasks.md`.

5. Gate 5 (Build)
    - Input: one approved Gate 4 issue with acceptance criteria, slice path, and architecture reference.
    - Output: Build Output Package with implementation summary, verification evidence, BDD evidence, PR package, quality gaps, open questions, and gate decision.

6. Gate 6 (Merge)
    - Input: GitHub Issue reference, PR link, and Build Output Package.
    - Output: merge readiness, review summary, outstanding gaps, gate decision, and owner action.

## Known Rules From User Decisions

1. Requirement Challenger is primary owner of requirement detailing.
2. Orchestrator forwards only requirement statement at Gate 1 and does not reinterpret details.
3. Challenger continues clarification rounds until no open questions remain or Product Owner accepts remaining open questions.
4. Challenger drafts acceptance criteria detailed enough for PRD writing.
5. Product Owner manually reviews and merges all PRs.
6. Dev execution is local by default, with optional Product Owner cloud opt-in for a specific task.
7. Gate 3 is a full design gate and is local-only.
8. Gate 1 and Gate 2 stay separate: Gate 1 is Requirement Challenger only, Gate 2 is PRD Agent only.
9. Orchestrator must challenge major decisions, provide alternatives with tradeoffs, and recommend a balanced option before owner finalization.
10. Gate 6 structure (compound substeps vs split gates) is deferred until Gate 5 Dev output contract is known. Do not design Gate 6 before Gate 5 is implemented.
11. Gate 3 never closes on agent decision alone. Figma Agent produces dual output (real Figma design via MCP + text Design Coverage Report). Design QA reads Figma via MCP, loops gaps back to Figma Agent, then escalates to Product Owner. Product Owner explicit approval is required to close Gate 3.
12. Slice artifacts are stored in `docs/slices/<slice-name>/` as versioned markdown. Orchestrator creates the slice folder when Gate 1 passes and writes gate artifacts after each gate closes.
13. GitHub Issues (one per atomic coding task) are created by the orchestrator at the end of Gate 4, after the architecture plan is approved. Gate 5 (Build) is purely implementation — no planning overhead.
14. Architecture governance is orchestrator-owned and enforced through an explicit Gate 4 checklist (scope, traceability, boundaries, risk, verification, rollback, decomposition, issue linkage, and owner acceptance).
15. Gate 5 default execution is local. Product Owner may opt a specific issue into cloud execution. Final build evidence is verified in local context before merge recommendation.
16. Gate 5 implementation uses BDD discipline: behavior scenarios, test-first workflow, and scenario-to-test evidence are required before merge progression.
17. Issue-centric handoff is supported for Gate 5: issue link/number is sufficient only when issue metadata includes acceptance criteria, slice path, and architecture reference.
18. Gate 5 PR provenance is mandatory: PR body must include issue-closing keyword and `Execution-Agent: dev` marker for attribution and orchestration traceability.
19. Gate 6 is orchestrator-owned and Local-only. It recommends merge or loop-back based on evidence, but Product Owner alone performs the actual merge.
20. Design artifact is mandatory for every UX task: Gate 3A must include a valid Figma artifact reference (file URL or key) before progression.
21. Orchestrator terminal policy is diagnostics-first, but explicit Product Owner requests may authorize scoped git mutating commands (including add/commit/push/branch/PR operations); destructive commands still require command-level approval.
22. Slice/story traceability policy: each slice has a GitHub slice tracker issue labeled `slice`; each story issue is labeled `user-story` and `slice:<slice-name>` and must contain a `Slice tracker:` backlink; slice tracker must list all story issue links; `06-tasks.md` must mirror story issue links and architecture references.
23. Review-response policy is repo-wide: when an agent fixes a review comment, it must also post a PR reply explaining what was accepted or challenged, what changed (or why no change), and the rationale/tradeoff.
24. Universal principle persistence: repo-wide principles may be stored in either (a) `Known Rules From User Decisions` (this section) or (b) permanent shared protocol docs (.github/AGENTS.md, .github/agents/*.agent.md) with explicit cross-reference. This avoids duplication while ensuring traceability and centralized visibility. Pre-archive checks validate presence in either location before archiving a slice.
25. UX and Architecture agents run an embedded challenge phase; unresolved `Must Resolve` gaps must be resolved or explicitly accepted before `Ready`.
26. Architecture work uses a three-tier discussion model: System Design, Solution Architecture, and Implementation Design.
27. Figma uses one self-contained file per slice with pages `UX Flows`, `Design`, `QA Notes` and frame naming `<Screen>/<State>/<Theme>`.
28. The Design System lives in a shared Figma library file; the first slice entering Gate 3 bootstraps it if absent. Dual-theme and token-only rules apply from day one.
29. PR review intake is mandatory before any fix: classify each actionable comment as `Accept`, `Challenge`, or `Needs Product Owner Decision`.
30. Start the Copilot review loop immediately when a PR is created, and rerun it after each review-fix push until there are zero `semantic-open` comments unless the Product Owner accepts residual risk.
31. After requesting Copilot review, poll live GitHub state for up to 5 minutes before declaring the result pending; if an approved non-MCP fallback is needed for the wait, use `python3 scripts/wait_for_copilot_review.py --owner <owner> --repo <repo> --pr <number>` so the live PR head is derived from GitHub rather than pasted manually.
32. GitHub PR/issue/review operations use GitHub MCP as the default control plane; fallbacks require an explicit capability gap and approval.
33. Once a PR review loop starts, continue it automatically after each push and review request until resolved or blocked.
34. Thread resolution belongs to disposition execution, not classification.
35. Review completion uses semantic state: `semantic-open` blocks, `semantic-closed` does not, and `semantically-closed/tooling-unresolved` must be reported explicitly.
36. Internal review triage may classify an item as `Challenge`, but posting a `Challenge` reply on a PR thread requires prior discussion with the Product Owner and explicit agreement on the external position.
37. Orchestrator resume is tiered: read shared protocol + context first, then only gate-relevant agent files.
38. Resume writes current state into `/memories/session/active-state.md` for follow-up prompts in the same session.

## Resume Protocol For Orchestrator

On first response in any new activity:

1. Read `.github/AGENTS.md`.
2. Read this file (`.github/orchestrator-context.md`).
3. Identify current gate from this file.
4. Read only the gate-relevant agent file(s) under `.github/agents/`.
5. Write `/memories/session/active-state.md` with current slice, gate, blockers, and next micro-goal.
6. Return a short resume snapshot:
- current gate
- known artifacts present or missing
- immediate next micro-goal
- blockers and owner decisions needed

## Current Program Status

1. Gates 1 through 6 are implemented at protocol level.
2. Gate 3 is fully wired through UX, Figma, and Design QA.
3. Current governance baseline is complete through Merge gate.

## Default Next Step

1. Start the next slice or run a fresh Gate 4 -> Gate 6 path on a new issue/PR.

## Current Slice Status

| Slice | Gate 1 | Gate 2 | Gate 3 | Gate 4 | Gate 5 | Gate 6 |
|---|---|---|---|---|---|---|
| `coming-soon-splash-page` | ✅ Pass | ✅ Full Pass | ✅ Pass (PO approved 2026-03-29) | ✅ Pass | ✅ Complete (T3 PR #18, T4 PR #19, T5 PR #20 all merged) | ✅ Complete (2026-03-29) |

## Log Archive Protocol

When a slice reaches Gate 6 ✅ Complete:
1. **Pre-archive: extract universal principles.** If a slice log contains a reusable repo-wide rule, ensure it is preserved in `Known Rules From User Decisions` or permanent shared protocol docs before archiving.
2. For slice closeout, move only **slice-specific** log entries for that slice from this file to `docs/slices/<slice-name>/context-log.md`.
3. Separately, as repo-wide maintenance, move detailed global governance history that no longer needs to stay hot into `.github/orchestrator-context.archive.md`.
4. Replace any moved history with short summary lines in this file.
5. Keep this file optimized for session loading; keep deep history in the archive.

Periodic archival rule:

6. If Context Update Log grows beyond 15 entries or 100 lines without a slice completion event, archive oldest governance entries to `.github/orchestrator-context.archive.md` and keep a short summary line here.

Archive summary format:
```
### <slice-name> — Gate 6 ✅ Complete (<date>) — Full log: docs/slices/<slice-name>/context-log.md
```

## Context Update Log

Append new entries here after each gate transition.

Template:

### YYYY-MM-DD
- Gate status:
- Artifact changes:
- Open questions status:
- Next micro-goal:
- Blockers/owner decisions:

### coming-soon-splash-page — Gate 6 ✅ Complete (2026-03-29) — Full log: docs/slices/coming-soon-splash-page/context-log.md

Detailed repo-wide governance history from 2026-03-30 through 2026-04-02 is archived in `.github/orchestrator-context.archive.md`; selected 2026-04-03 governance updates remain intentionally live below.

### 2026-03-30 to 2026-04-03 — Archived Summary
- 2026-03-30: merge authority reserved to Product Owner; public/proprietary repo baseline added; TFD/BDD/domain-language discipline added; Gate 1/2 alignment and slice/story maintenance tightened.
- 2026-04-01: embedded challenge phase adopted; architecture expert standard and three-tier discussion model added; Figma file-per-slice convention established.
- 2026-04-02: design-system-first and dual-theme governance established, with first-slice bootstrap of the shared design-system library.
- 2026-04-03: PR review intake and Copilot review loop hardened; PR #33 merged after a clean live Copilot review on head `dc19aa1`.

### 2026-04-03 (Challenge Reply Approval)
- Gate status: No active slice. PR review governance tightened.
- Artifact changes: Updated shared, orchestrator, and dev protocols so internal triage may classify `Challenge`, but posting a `Challenge` reply on a PR thread now requires explicit Product Owner approval first. Added Known Rule #36.
- Open questions status: None.
- Next micro-goal: Apply this stricter approval rule on all future PR review responses.
- Blockers/owner decisions: Owner clarified that external challenge replies require prior agreement, even when the internal classification is already clear.

### 2026-04-03 (Challenge Discussion Sequence)
- Gate status: No active slice. PR review governance tightened further.
- Artifact changes: Updated shared, orchestrator, and dev protocols so a `Challenge` disposition must be discussed with the Product Owner first, then posted externally only using the agreed position. Known Rule #36 updated to reflect discussion-first sequencing.
- Open questions status: None.
- Next micro-goal: Apply the discuss -> agree -> post sequence on all future challenged PR comments.
- Blockers/owner decisions: Owner clarified that approval alone is not the full requirement; the process must explicitly include discussion and agreement before the external challenge reply is posted.

### 2026-04-03 (Review Poll Window)
- Gate status: No active slice. PR review polling policy adjusted.
- Artifact changes: Updated shared, orchestrator, dev, and orchestrator-context protocol wording so the default bounded Copilot polling window is now up to 5 minutes instead of 2 minutes.
- Open questions status: None.
- Next micro-goal: Use the longer 5-minute bounded polling window for active and future PR review loops.
- Blockers/owner decisions: Owner determined that 2 minutes is too short in practice, so the default bounded polling window is extended to 5 minutes.

### 2026-04-03 (Reusable Copilot Poller)
- Gate status: No active slice. PR review polling fallback hardened.
- Artifact changes: Added `scripts/wait_for_copilot_review.py` as the repo-standard fallback for bounded Copilot review waits. Updated shared, orchestrator, dev, and orchestrator-context protocol text to prefer this helper over ad hoc terminal snippets when a non-MCP polling exception is justified.
- Open questions status: None.
- Next micro-goal: Reuse the helper for future review loops whenever long waits make repeated manual polling impractical.
- Blockers/owner decisions: The ad hoc polling snippet failed because it relied on a pasted SHA that drifted from the real PR head. The hardened helper now derives the live head from GitHub, reports `review-found`, `timeout`, and `head-changed` distinctly, and treats check-run lookup failures as non-fatal metadata gaps.

### 2026-04-03 (PR Creation Review Trigger)
- Gate status: No active slice. PR review automation workflow tightened.
- Artifact changes: Updated shared, orchestrator, and dev protocols so PR creation itself triggers the initial Copilot review request and bounded polling window instead of waiting for a later follow-up prompt. Updated Known Rule #30 to match.
- Open questions status: None.
- Next micro-goal: Apply the tightened rule to newly opened PRs, including PR #34.
- Blockers/owner decisions: Root cause was a missing loop-entry trigger rather than a missing continuation rule. The prior protocol handled pushes after review feedback but did not explicitly require immediate review-loop startup on PR creation.

### 2026-04-03 (PR #34 Merge Closeout)
- Gate status: No active slice. Repo governance baseline updated on `master`.
- Artifact changes: PR #34 (`Compress orchestrator context`) was merged after the reusable Copilot poller, `.gitignore` Python cache ignores, and the compressed live/archive orchestration context split cleared the review loop.
- Open questions status: None.
- Next micro-goal: Start the next slice or next governance change from the merged `master` baseline.
- Blockers/owner decisions: Product Owner completed the merge; local `master` was fast-forwarded to the merged remote state for clean follow-on work.
