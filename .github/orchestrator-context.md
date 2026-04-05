# Orchestrator Context Transfer

Canonical live handover context for the Architect + Orchestrator agent.

## Product Owner Model

1. Product Owner is the human user.
2. Product Owner owns final decisions on scope, ambiguity acceptance, PR merge, and release.
3. Agents prepare artifacts and recommendations only.

## Figma Project Metadata

Project-specific Figma identifiers live in `.figma-config.local` (gitignored). Use `.figma-config.local.example` as the schema and onboarding reference. Before the first Gate 3 bootstrap, required keys are `project_name` and `plan_key`. After the first Gate 3 bootstrap, `design_system_library_file_key` must also be present and non-empty.

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
39. Accessibility is a universal default: all screens must meet baseline accessibility (semantic HTML, keyboard navigation, WCAG 2.1 AA contrast, appropriate ARIA attributes). Not a per-slice opt-in.
40. Argument colors must be semantically neutral: Tark (for) uses blue tones, Vitark (against) uses amber/warm tones. No green/red or other value-laden color pairs that imply positive/negative judgment. This is a universal design rule for all debate-related UI.
41. Figma MCP write operations route through Figma Agent exclusively. Read-only Figma MCP access is allowed for UX Agent, Design QA Agent, and Dev Agent for their domain work. Orchestrator may not use Figma MCP tools at all.
42. Visual/UX design proposals (layout options, component shapes, interaction patterns, label strategies) are UX Agent-owned. Other agents challenge for clarity and facilitate but do not originate design proposals.
43. Gate artifact updates route through the owning agent: PRD changes → PRD Agent, UX changes → UX Agent, etc. No agent makes content edits to another agent's gate artifact. Orchestrator may mechanically persist or commit the owning agent's output without changing its content.
44. Domain Ownership Policy is universal: every agent executes only within its own domain and delegates cross-domain tasks to the owning agent via orchestrator. No threshold exception — even minor tweaks route through the owning agent.
45. Domain Language Policy: Gate 1 produces a Domain Glossary (5–15 canonical terms). All downstream agents must use glossary terms in artifacts, Figma layer names, architecture identifiers, and code. Non-glossary domain terms are flagged as quality gaps. New terms route through orchestrator for glossary addition.
46. Never commit raw Figma file keys or IDs to git-tracked files. Reference `.figma-config.local` (gitignored) instead. Context log entries must use indirect references (e.g., "keys in `.figma-config.local`") rather than inline key values.

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
| `debate-screen` | ✅ Pass | ✅ Full Pass | ✅ Pass (PO approved 2026-04-05) | ⬜ | ⬜ | ⬜ |

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

### 2026-04-04 (PR #35 Merge Closeout)
- Gate status: No active slice. Agent governance framework hardened on `master`.
- Artifact changes: PR #35 (`chore: harden agent governance setup`) merged. Key changes: Protocol 2.0 with shared protocol deduplication across all 8 agent files; Slice Complexity Classification (Trivial/Standard/Complex); Recovery Protocol (partial artifact, Figma MCP failure, Copilot poll timeout, config validation with pre/post-bootstrap stages); new CI workflow (`protocol-checks.yml`) with least-privilege permissions, `printf`-safe body checks, `nullglob` guard, and `edited` trigger; YAML issue templates replacing legacy `.md` templates; architecture reference docs (`architecture-discussion-topics.md`, `architecture-quality-checks.md`); canonical `src/styles/tokens.css` with consolidated light/dark theme selectors; `.github/copilot-instructions.md` for IDE context. 6 Copilot review rounds, 24 threads triaged (accepts fixed, challenges rationale-posted with PO agreement).
- Open questions status: None.
- Next micro-goal: Start the next feature slice or governance task from the merged `master` baseline.
- Blockers/owner decisions: Product Owner merged the PR. All review dispositions confirmed.

### 2026-04-04 (debate-screen Gate 1 Pass)
- Gate status: `debate-screen` Gate 1 ✅ Pass. Complexity: Standard (full 6-gate flow).
- Artifact changes: Created `docs/slices/debate-screen/01-requirement.md`. Added Known Rule #39 (accessibility universal default) to orchestrator-context.md and Accessibility Baseline section to AGENTS.md.
- Open questions status: OQ-1 (browser baseline) non-blocking, OQ-2 (overflow strategy) deferred to UX.
- Major decisions: framework selection deferred to Gate 4; accessibility is universal default (new repo-wide rule); replaces coming-soon splash page; new visual direction; Standard complexity confirmed.
- Next micro-goal: Gate 2 — invoke PRD Agent with Requirement Context Package.
- Blockers/owner decisions: None. Ready for Gate 2.

### 2026-04-04 (debate-screen Gate 2 Full Pass)
- Gate status: `debate-screen` Gate 2 ✅ Full Pass. PRD v0 complete with 10 FRs, 10 ACs, 7 constraints, 5 success metrics.
- Artifact changes: Created `docs/slices/debate-screen/02-prd.md`.
- Open questions status: OQ-1 resolved (evergreen browsers). OQ-2 unresolved, non-blocking, deferred to UX Agent at Gate 3.
- Major decisions: None new — PRD preserved Gate 1 intent with zero unapproved deltas. Alignment check confirmed one-to-one mapping.
- Next micro-goal: Gate 3A — invoke UX Agent with PRD Draft Package.
- Blockers/owner decisions: None. Ready for Gate 3.

### 2026-04-04 (debate-screen Gate 3A Pass)
- Gate status: `debate-screen` Gate 3A ✅ Pass. UX flows, state matrix, interaction notes complete.
- Artifact changes: Created `docs/slices/debate-screen/03-ux.md`. Updated `.figma-config.local` with design_system_library_file_key. Created slice Figma file and Design System Library (keys in `.figma-config.local`).
- Open questions status: OQ-2 resolved (natural page scroll). All UX OQs resolved.
- Major decisions: M3 adopted as hybrid base design system (M3 structure with brand color override). Native app ambition recorded as Gate 4 constraint (Flutter strong candidate). Framework selection deferred to Gate 4.
- Next micro-goal: Gate 3B — invoke Figma Agent for Figma design.
- Blockers/owner decisions: None. Ready for Gate 3B.

### 2026-04-04 (debate-screen Gate 3B — Palette + Card Colors Confirmed)
- Gate status: `debate-screen` Gate 3B design finalized. All 6 Figma frames (desktop/tablet/mobile × light/dark) updated.
- Artifact changes: 6 main design frames updated to Midnight Indigo brand palette with neutral blue+amber argument cards. 4 comparison frames created for palette review (to be cleaned up or archived). Added Known Rule #40 (semantic neutrality) to orchestrator-context.md and Semantic Neutrality section to AGENTS.md.
- Open questions status: None.
- Major decisions challenged and confirmed: (1) Red ≠ negative: PO flagged red for "against" arguments implies negative judgment. Orchestrator challenged further — green for "for" also implies positive. PO agreed to symmetric fix. (2) Neutral pair selected: blue (Tark) + amber (Vitark) — no value judgment. (3) Brand palette: Midnight Indigo (#3949AB) chosen from 3 options (Indigo recommended, Teal close to blue Tark cards, Slate too neutral). Both decisions recorded as universal rules.
- Next micro-goal: Finalize Gate 3B Design Draft Package, proceed to Gate 3C (Design QA).
- Blockers/owner decisions: None. Ready for Design QA.

### 2026-04-05 (debate-screen Gate 3 ✅ Complete — Design Approved)
- Gate status: `debate-screen` Gate 3 ✅ Pass. All 3 substeps (UX, Figma, Design QA) complete. Product Owner approved.
- Artifact changes: Created `docs/slices/debate-screen/04-design-qa.md`. Updated `02-prd.md` (FR-4 legend bar language, owner-approved delta #3). Updated `03-ux.md` (legend bar description, per-card label removal, `aria-label` a11y note, owner-approved deltas #3 and #4).
- Design QA: 4 passes total. Pass 1 found raw hex (fixed with 11 vars + 306 bindings). Pass 2 Agent-Ready. Pass 3 found legend bar raw hex (fixed with 3 vars + 48 bindings). Pass 4 Agent-Ready. 14 color variables total, all bound.
- Owner-approved design decisions: (1) Semantic neutrality — blue/amber. (2) Sequential timeline layout. (3) Legend bar replaces per-card labels. (4) Card shape — asymmetric corners + tails. (5) Legend bar 3-column alignment with timeline spine.
- Open questions status: All resolved.
- Next micro-goal: Gate 4 — invoke Architecture Agent with slice artifacts.
- Blockers/owner decisions: None. Ready for Gate 4.

### 2026-04-05 (debate-screen Gate 3B — Sequential Model Cascade + Timeline Redesign)
- Gate status: `debate-screen` Gate 3B ✅ Complete. All 6 Figma frames redesigned for sequential timeline layout.
- Artifact changes: PRD (02-prd.md) updated for sequential debate model (FR-3 sequential thread, FR-4 timeline layout, FR-5 ordered data model). UX (03-ux.md) updated for timeline center-spine desktop/tablet layout + WhatsApp-style chat-bubble mobile layout. All 6 Figma frames (desktop/tablet/mobile × light/dark) redesigned: desktop/tablet use center spine with zigzag Tark-left/Vitark-right cards; mobile uses chat-bubble style with Tark left-aligned (x=20) and Vitark right-aligned (x=90), 280px cards (~72% of 390px), 70px horizontal stagger.
- Open questions status: None.
- Major decisions challenged and confirmed: (1) Sequential debate model adopted (single ordered timeline replaces two-column parallel display). (2) Timeline center-spine layout for desktop/tablet. (3) WhatsApp-style chat-bubble layout for mobile — conversational feel with left/right stagger. (4) Auto-layout removed from mobile Content frames to enable per-card horizontal positioning.
- Next micro-goal: Gate 3C — invoke Design QA Agent.
- Blockers/owner decisions: None. Ready for Design QA.

### 2026-04-05 (Global — Agent Domain Ownership Policy Codified)
- Gate status: N/A — cross-cutting protocol update.
- Artifact changes: `.github/AGENTS.md` — added Domain Ownership Policy section (5 rules). `.github/agents/architect-orchestrator.agent.md` — added constraints 10–13 (Figma delegation, design proposal ownership, artifact update routing, domain ownership reference). `.github/orchestrator-context.md` — added Known Rules 41–44.
- Major decisions challenged and confirmed: (1) ALL Figma MCP operations route through Figma Agent — no size threshold exception. (2) Design proposals are UX Agent-owned — orchestrator challenges but does not originate. (3) Gate artifact updates route through owning agent (Option B: PRD→PRD Agent, UX→UX Agent). (4) Core principle: orchestrator supervises, agents execute domain work — no carrying.
- Rationale: PO identified orchestrator was directly executing Figma changes, originating design proposals, and editing gate artifacts during Gate 3. Accepted speed tradeoff in favor of hardened domain experts.
- Next micro-goal: Gate 4 (Architecture) for `debate-screen`.

### 2026-04-05 (Global — Domain Language Policy Codified)
- Gate status: N/A — cross-cutting protocol update.
- Artifact changes: `.github/AGENTS.md` — added Domain Language Policy section (6 rules). All 8 agent files — added `## Domain Language Policy` section with role-specific guidance. `requirement-challenger.agent.md` — added Domain Glossary to output format and Requirement Context Package Schema. `01-requirement.md` template — added Domain Glossary table. `architect-orchestrator.agent.md` — added glossary to Gate 1 handoff return contract. `orchestrator-context.md` — added Known Rule 45.
- Major decisions: PO accepted Option A (Glossary-Driven) over Option B (Convention Rule). Glossary produced at Gate 1, binding all downstream agents. Architecture agent maps glossary → code identifiers. Each gate validates glossary compliance.
- Rationale: Domain language drift starts before code. A shared glossary from Gate 1 ensures all agents speak the same functional language end-to-end.
- Next micro-goal: Gate 4 (Architecture) for `debate-screen`.
