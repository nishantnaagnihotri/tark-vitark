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
20. Design artifact is mandatory for every UX task: Gate 3A must include a valid Figma file URL before progression. Raw file keys must not appear in git-tracked artifacts — store them only in `.figma-config.local`.
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
31. After requesting Copilot review, poll live GitHub state for up to 5 minutes before declaring the result pending; if an approved non-MCP fallback is needed for the wait, use `node scripts/wait_for_copilot_review.js --owner <owner> --repo <repo> --pr <number>` so the live PR head is derived from GitHub rather than pasted manually.
32. GitHub PR/issue/review operations use GitHub MCP as the default control plane; fallbacks require an explicit capability gap and approval.
33. Once a PR review loop starts, continue it automatically after each push and review request until resolved or blocked.
34. Thread resolution belongs to disposition execution, not classification.
35. Review completion uses semantic state: `semantic-open` blocks, `semantic-closed` does not, and `semantically-closed/tooling-unresolved` must be reported explicitly.
36. ~~Superseded by Rule #56 for review-loop handling.~~ Previously required prior PO discussion before posting a `Challenge` reply. Under Protocol-Version 3.0, review-loop challenges are posted immediately and batched for PO review after no `semantic-open` review threads remain. Non-review-loop challenges (e.g., gate artifacts) require prior PO discussion and explicit PO agreement on the external position before posting the challenge.
37. Orchestrator resume is tiered: read shared protocol + context first, then only gate-relevant agent files.
38. Resume writes current state into `/memories/session/active-state.md` for follow-up prompts in the same session.
39. Accessibility is a universal default: all screens must meet baseline accessibility (semantic HTML, keyboard navigation, WCAG 2.1 AA contrast, appropriate ARIA attributes). Not a per-slice opt-in.
40. Argument colors must be semantically neutral: Tark (for) uses blue tones, Vitark (against) uses amber/warm tones. No green/red or other value-laden color pairs that imply positive/negative judgment. This is a universal design rule for all debate-related UI.
41. Figma MCP write operations route through Figma Agent exclusively. Read-only Figma MCP access is allowed for UX Agent, Design QA Agent, Dev Agent, and Orchestrator for gate validation and spot-checks. Orchestrator must not invoke write operations; any write need routes through Figma Agent.
42. Visual/UX design proposals (layout options, component shapes, interaction patterns, label strategies) are UX Agent-owned. Other agents challenge for clarity and facilitate but do not originate design proposals.
43. Gate artifact updates route through the owning agent: PRD changes → PRD Agent, UX changes → UX Agent, etc. No agent makes content edits to another agent's gate artifact. Orchestrator may mechanically persist or commit the owning agent's output without changing its content.
44. Domain Ownership Policy is universal: every agent executes only within its own domain and delegates cross-domain tasks to the owning agent via orchestrator. No threshold exception — even minor tweaks route through the owning agent.
45. Domain Language Policy: Gate 1 produces a Domain Glossary (5–15 canonical terms). All downstream agents must use glossary terms in artifacts, Figma layer names, architecture identifiers, and code. Non-glossary domain terms are flagged as quality gaps. New terms route through orchestrator for glossary addition.
46. Never commit raw Figma file keys or IDs to git-tracked files — keys belong only in `.figma-config.local` (gitignored). Figma file URLs are acceptable in git-tracked artifacts and context log entries. Context log entries must use indirect references for keys (e.g., "keys in `.figma-config.local`") rather than inline key values.
47. Git-tracked artifact references to Figma designs must use Figma file URLs, never raw file keys. File keys belong only in `.figma-config.local`. Dev agent may read keys from `.figma-config.local` at runtime for MCP calls.
48. Evaluate custom font when brand identity is finalized. System font stack is the current default. Tracked in https://github.com/nishantnaagnihotri/tark-vitark/issues/46. Orchestrator surfaces this at future slice intake when typography or brand identity comes up.
49. Native app strategy is PWA now → Capacitor later. React web + Capacitor is the unified codebase strategy. The prior Flutter-strong-candidate note (Gate 3A) is reconsidered in favor of Capacitor. No separate native codebase.
50. BDD uses Cucumber with Gherkin `.feature` files for non-technical stakeholder readability. Test stack: vitest + @testing-library/react + @cucumber/cucumber.
51. M3 compliance source of truth hierarchy: (1) m3.material.io governing spec, (2) M3 Figma Design Kit visual reference, (3) @material/web source code for exact token values and state math. @material/web is a read-only reference, not a runtime dependency. DS primitives are pure React components that implement M3 spec compliance independently. Design QA verifies against all three sources.
52. React version for new projects is React 19 (latest stable). The prior "React 18" default in Gate 4 architecture is superseded. React 19 passes `ref` as a standard prop to function components, making `forwardRef` unnecessary for DS primitives. Also improves Web Component interop.
53. M3 token architecture uses a 3-layer model: (1) M3 Baseline — full scheme generated from seed color `#3949AB` via `@material/material-color-utilities`, used as-is without hand-picking; (2) Brand Override — selective overrides only where visual review rejects M3 computed values; (3) Functional Override — domain-specific tokens (tark-surface, vitark-surface, etc.). Default posture: trust M3 computed values first, override only when PO rejects after visual review.
54. Figma project-first policy: all Figma files must reside in the designated project (from `.figma-config.local`), never in Drafts. MCP `create_new_file` creates in Drafts (API limitation); PO must manually move the file to the project before any further design work proceeds. No design activity on files in Drafts. Cross-ref: `figma-governance-and-fidelity` skill, Figma File Structure Convention rule #6.
55. PR #48 merged — Gate 1-4 artifacts now on master.
56. Review loop post-and-continue: agents post Challenge replies immediately during the review loop (with rationale + rule citation) and continue without pausing. Supersedes Rule #36 for review-loop handling. Challenges are batched for PO review after all review threads are `semantic-closed` (no `semantic-open` threads remain). PO may override any challenge, triggering a fix + re-loop cycle. Loop completes when: (1) no review threads remain `semantic-open`, and (2) all challenges resolved with PO. Cross-ref: `pr-review-loop` skill, Strict Accept-vs-Challenge Lens rule #5 (Protocol-Version 3.0).
57. Review loop auto-entry is tracked canonically in the `pr-review-loop` skill under Copilot Review Loop Protocol rule #1 (Protocol-Version 3.0); this entry is a context pointer only.

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
| `debate-screen` | ✅ Pass | ✅ Full Pass | ✅ Pass (PO approved 2026-04-06) | ✅ Pass (Revision 1.1) | ✅ Complete (T1–T9 + visual polish PR #61) | ✅ Complete (2026-04-07) |

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
- Artifact changes: Added `scripts/wait_for_copilot_review.py` as the repo-standard fallback for bounded Copilot review waits. Updated shared, orchestrator, dev, and orchestrator-context protocol text to prefer this helper over ad hoc terminal snippets when a non-MCP polling exception is justified. *(Superseded: `.py` script replaced by `scripts/wait_for_copilot_review.js` — Node + GraphQL — in PR #51.)*
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

### 2026-04-05 (Global — PR #36 Merged: Domain Ownership + Language Policy)
- Gate status: N/A — cross-cutting protocol PR merged to `master`.
- PR: https://github.com/nishantnaagnihotri/tark-vitark/pull/36
- Artifact changes: `.github/AGENTS.md` v2.1 — Domain Ownership Policy (10 rules, Figma read/write split), Domain Language Policy (6 rules, design-token exception), Figma File Structure Convention URL-only. All 8 agent files — Domain Ownership + Domain Language sections. `orchestrator-context.md` — Known Rules 41–47. `requirement-challenger.agent.md` — glossary in output format, schema, and example output. Slice templates `03-ux.md` and `04-design-qa.md` — URL-only Figma references. `01-requirement.md` template — Domain Glossary table.
- Copilot review: 12 rounds, 34 threads total. 20 Accept (fixed), 14 Challenge (pre-existing content or stylistic). Key fixes: Figma read/write access split, mechanical persistence exception for Constraint 12/Rule 43, design-token taxonomy exception for Domain Language, URL-only standardization for all Figma artifact references (Rule 47), UX Agent Approach steps 7–9 delegated to Figma Agent, Gate 3A bootstrap ownership aligned.
- Known Rules added: 41 (Figma write routing), 42 (design proposal ownership), 43 (artifact update routing), 44 (Domain Ownership universal), 45 (Domain Language glossary), 46 (no raw Figma keys in git), 47 (URL-only in artifacts).
- Next micro-goal: Gate 4 (Architecture) for `debate-screen`.

### 2026-04-05 (debate-screen Gate 4 ✅ Pass — now ⏸️ Paused)
- Gate status: `debate-screen` Gate 4 initially ✅ Pass, now ⏸️ Paused pending Gate 3 rework for DS primitives.
- Artifact changes: Created `docs/slices/debate-screen/05-architecture.md` and `docs/slices/debate-screen/06-tasks.md`. Updated `03-ux.md` and `04-design-qa.md` to remove raw Figma file keys (QG-A1 remediation, Rule #47 compliance). Updated `orchestrator-context.md` with Known Rules 48–50.
- GitHub issues created: Slice tracker #37, T1 #38, T2 #39, T3 #40, T4 #41, T5 #42, T6 #43, T7 #44, T8 #45, deferred font evaluation #46. All need revision after Gate 3 rework.
- PO decisions confirmed: D-1 React+Vite (not Preact), D-1b PWA→Capacitor (Flutter reconsidered), D-2 Cucumber BDD (non-tech colleagues), D-7 system font stack with reminder issue+rule. QG-A1 pragmatic fix (orchestrator executed mechanical Rule #47 compliance). QG-A2 dissolved (existing GitHub Pages workflow). QG-A4 content from Figma (no placeholder).
- Known Rules added: 48 (font evaluation reminder), 49 (PWA→Capacitor native strategy), 50 (Cucumber BDD for stakeholder readability).
- Architecture: React 18 + Vite + TypeScript SPA (React version superseded to 19 — see Gate 3 reopen entry). 8 tasks (T1–T8). Critical path: T1→T2→T4→T6→T7→T8. PWA baseline with vite-plugin-pwa.
- Next micro-goal: Complete Gate 3 rework, then revise architecture and issues.
- Blockers/owner decisions: Gate 3 reopened for DS primitive components. Gate 4 paused.

### 2026-04-05 (debate-screen Gate 3 🔄 Reopened — DS Primitives + M3 Decisions)
- Gate status: `debate-screen` Gate 3 🔄 Reopened. UX → Figma → Design QA cascade for Design System primitive components.
- Artifact changes: Updated `orchestrator-context.md` with Known Rules 51–52. Slice status reverted: Gate 3 🔄 Reopened, Gate 4 ⏸️ Paused.
- PO decisions confirmed:
  - @material/web is reference-only (Option A): pure React, @material/web as read-only reference for token values and state math, not a runtime dependency.
  - Rule #51: M3 compliance SOT hierarchy (spec → Figma Kit → material-web source).
  - React 19 (Rule #52): supersedes React 18 default. New project, 16 months stable, makes forwardRef unnecessary for DS primitives.
  - DS layer approach: Option A (slice-scoped, fully M3-compliant per primitive) — `src/design-system/` with Typography, Card, Divider.
  - Gate 3 reopen: approved — UX Agent defines DS primitives, Figma Agent builds them in DS Library, Design QA re-verifies.
  - Gate 4 PR: paused until Gate 3 rework completes.
  - M3 SOT: Option D (combination hierarchy: m3.material.io spec + M3 Figma Kit + @material/web source).
- Known Rules added: 51 (M3 compliance SOT hierarchy), 52 (React 19 for new projects).
- Next micro-goal: Invoke UX Agent for DS primitive specification (Gate 3A addendum).
- Blockers/owner decisions: None. Ready for UX Agent handoff.

### 2026-04-05 (debate-screen Gate 3B — M3 Computed-First Token Baseline)
- Gate status: `debate-screen` Gate 3B 🔄 Re-routing to Figma Agent for M3 baseline rebuild.
- Artifact changes: Added Known Rule 53 (M3 3-layer token architecture: computed-first, override-only-if-rejected). M3 palette generated from #3949AB seed via @material/material-color-utilities@0.3.0 and cached in session memory.
- PO decisions confirmed:
  - M3 computed-first: Use ALL M3-generated values as-is (including #4555B7 light primary, #BBC3FF dark primary). Override only if PO rejects after visual review in Figma. Tools first, taste later.
  - 3-layer architecture: M3 Baseline → Brand Override (empty until PO requests) → Functional Override (tark/vitark domain tokens).
- Key M3 corrections vs prior hand-picked values: dark primary #1A237E → #BBC3FF (M3 lightens for dark, we incorrectly darkened), dark onPrimary roles were swapped, spine outline #BDBDBD → #767680/#90909A (M3 computed), surface #FFFFFF → #FFFBFF (M3 warm tint).
- Known Rules added: 53 (M3 3-layer token architecture, computed-first posture).
- Next micro-goal: Invoke Figma Agent to rebuild DS Library with M3 computed values.
- Blockers/owner decisions: None. Ready for Figma Agent handoff.

### 2026-04-05 (Figma Project-First Policy — Rule #54)
- Gate status: `debate-screen` Gate 3B ongoing.
- Artifact changes: Added Figma File Structure Convention rule 6 to `.github/AGENTS.md`. Updated `.figma-config.local` and `.figma-config.local.example` with project-first notes. Added Known Rule 54 to `orchestrator-context.md`.
- PO decisions confirmed: All Figma files must live in the TarkVitark project, not Drafts. PO manually moved DS Library file to TarkVitark project. MCP `create_new_file` API limitation acknowledged — manual move required after creation.
- Known Rules added: 54 (Figma project-first policy).
- Next micro-goal: Continue Gate 3 — Design QA re-verify (Pass 3).
- Blockers/owner decisions: None.

### 2026-04-05 (debate-screen Gate 3 ✅ Closed — PO Approved)
- Gate status: `debate-screen` Gate 3 ✅ Pass. Gate 4 ready to resume.
- Artifact changes: Updated `04-design-qa.md` with Pass 5 M3 rebuild results (color variables corrected to M3-computed values, history updated). Slice status advanced: Gate 3 ✅ Pass, Gate 4 ⬆️ Ready.
- PO decisions confirmed: Gate 3 closure approved after Design QA Pass 5 verified M3 rebuild. All 14 color variables confirmed M3-compliant. WCAG contrast, typography, and theme coverage all pass.
- M3 token corrections in 04-design-qa.md: surface #FFFFFF→#FFFBFF, primary #3949AB→#4555B7, dark primary #1A237E→#BBC3FF, dark onPrimary #BAC3FF→#0E2288, vitark #E65100→#BF360C, spine #BDBDBD→#767680, dark spine #424242→#90909A.
- Next micro-goal: Resume Gate 4 architecture revision (update React 18→19, add DS layer, update M3 tokens, revise tasks/issues).
- Blockers/owner decisions: None.

### 2026-04-06 (debate-screen Gate 4 ✅ Pass — Revision 1.1)
- Gate status: `debate-screen` Gate 4 ✅ Pass (Revision 1.1). Gate 5 ready.
- Artifact changes: Replaced `05-architecture.md` with Revision 1.1 (866 lines). Updated `06-tasks.md` with T1–T9 (was T1–T8; new T4 for DS primitives). Created Issue #47 (T4: DS primitives). Updated Issues #37 (tracker: React 19 + M3 + DS, T4 added, T5–T9 renumbered), #38 (React 18→19, AC added), #39 (M3 3-layer scope, 15 color + typography + dimension tokens), #41 (T4→T5, DS composition, T4 dependency), #42 (T5→T6, DS composition, T4 dependency), #43 (T6→T7, DS Divider composition, T4+T5+T6 dependencies), #44 (T7→T8, dependency T6→T7), #45 (T8→T9, dependencies T6+T7→T7+T8).
- Architecture revision scope: (1) React 18→19 (Rule #52), (2) M3 3-layer token architecture with computed values (Rule #53, 35 tokens total), (3) Design System primitive layer `src/design-system/` (Typography, Card, Divider), (4) Task decomposition T1–T9 with updated critical path T1→T2→T4→T5→T7→T8→T9.
- Architecture Agent challenge phase: 8 items challenged, zero Must Resolve. All confirmed as appropriate or already-addressed.
- Key changes: 8 color token values corrected to M3-computed, 13 typography tokens added, DS primitive interfaces defined, feature components now compose DS primitives, new R-8 risk (DS abstraction mismatch), 6 QG-DS entries resolved.
- Next micro-goal: Gate 5 — begin delegating issues to Dev Agent. First issue: T1 (Scaffold, #38).
- Blockers/owner decisions: None. Ready for Gate 5.

### 2026-04-06 (debate-screen Gate 5 — T2 PR #51 Merged)
- Gate status: `debate-screen` Gate 5 in progress. T1 ✅, T2 ✅. Next: T3 (#40) and T4 (#47) can run in parallel.
- Artifact changes: Updated `06-tasks.md` (T2 status ⬜→✅ PR #51 merged).
- PR: https://github.com/nishantnaagnihotri/tark-vitark/pull/51
- PR details: feat(tokens): Expand token system to full M3 3-layer architecture. 15 color tokens (light + dark + prefers-color-scheme fallback), 13 typography, 4 spacing, 2 radius, 1 dimension. 112 Vitest assertions. Copilot review loop: 14 rounds (0 semantic-open, 3 tooling-unresolved regex false positives). Script rewrite: `wait_for_copilot_review.py` → `.js` (Node + GraphQL, atomic query, structured JSON errors, PR validation).
- Open questions status: None.
- Next micro-goal: Delegate T3 (#40: static debate data module) or T4 (#47: DS primitives) to Dev Agent. Both are unblocked (T1+T2 complete). T3+T4 can run in parallel.
- Blockers/owner decisions: None.

### 2026-04-06 (debate-screen Gate 5 — T3 PR #52 Merged)
- Gate status: `debate-screen` Gate 5 in progress. T1 ✅, T2 ✅, T3 ✅. Next: T4 (#47).
- Artifact changes: Updated `06-tasks.md` (T3 status ⬜→✅ PR #52 merged).
- PR: https://github.com/nishantnaagnihotri/tark-vitark/pull/52
- PR details: feat(data): Add static debate data module. `src/data/debate.ts` with `Side`, `Argument`, `Debate` types + `DEBATE` constant (8 arguments, exact Figma posting order). Content extracted from Figma Desktop Light frame (`22:4`) via MCP. 7 Vitest assertions. Copilot review: 2 initial comments (permissive test range, placeholder content) — both addressed in fix commit. Second review: 0 new comments.
- Gate 6 merge verification: All 8 checks pass (scope, verification, provenance, review, Copilot loop, docs, rollback, risk).
- Open questions status: None.
- Next micro-goal: Delegate T4 (#47: DS primitives — Typography, Card, Divider) to Dev Agent. T4 is next on critical path (T1→T2→T4→T5→T7→T8→T9). T5 (#41) and T6 (#42) are unblocked after T4.
- Blockers/owner decisions: None.

### 2026-04-06 (debate-screen Gate 5 — T4 PR #53 Merged)
- Gate status: `debate-screen` Gate 5 in progress. T1 ✅, T2 ✅, T3 ✅, T4 ✅. Next: T5 (#41) and T6 (#42) can run in parallel.
- Artifact changes: Updated `06-tasks.md` (T4 status ⬜→✅ PR #53 merged).
- PR: https://github.com/nishantnaagnihotri/tark-vitark/pull/53
- PR details: feat(design-system): implement Typography, Card, Divider primitives. Three M3-compliant DS primitives in `src/design-system/` with co-located CSS, barrel export, and component tests.
- Open questions status: None.
- Next micro-goal: Delegate T5 (#41: ArgumentCard) and T6 (#42: Topic + LegendBar) to Dev Agent — both unblocked.
- Blockers/owner decisions: None.

### 2026-04-06 (debate-screen Gate 5 — T6 PR #55 Merged)
- Gate status: `debate-screen` Gate 5 in progress. T1 ✅, T2 ✅, T3 ✅, T4 ✅, T6 ✅. Next: T5 (#41).
- Artifact changes: Updated `06-tasks.md` (T6 status ⬜→✅ PR #55 merged).
- PR: https://github.com/nishantnaagnihotri/tark-vitark/pull/55
- PR details: feat(t6): Implement Topic and LegendBar components. Topic composes Typography(headline-large, as="h1"). LegendBar renders sticky nav with colored dots, side labels, and accessible separator. Mobile-first responsive: flex (mobile) → 3-column grid (tablet/desktop). 10 tests (3 Topic + 7 LegendBar). Copilot review: 3 comments — 1 accepted (aria-hidden fix: replaced Typography with plain span for separator), 2 challenged (hardcoded layout values — PO accepted challenges, no gate reopen needed). Round 2: clean pass.
- PO decision: Hardcoded layout values (gap, height, padding) acceptable as component-specific dimensions. No token system change or design gate reopen. Shared tokens to be evaluated when T7 (Timeline) reveals overlapping patterns.
- Open questions status: None.
- Next micro-goal: Delegate T5 (#41: ArgumentCard) to Dev Agent. T5 is the last component before T7 (Timeline + DebateScreen). Dependencies satisfied: T2 ✅, T3 ✅, T4 ✅.
- Blockers/owner decisions: None.

### 2026-04-07 (debate-screen Gate 5 ✅ Complete + Gate 6 ✅ Complete)
- Gate status: `debate-screen` Gate 5 ✅ Complete. Gate 6 ✅ Complete. Slice fully delivered.
- Artifact changes: Updated `06-tasks.md` (T5→✅ PR #56, T7→✅ PR #57, T8→✅ PR #58, T9→✅ PR #59; added Post-Build QA section with Issue #60 / PR #61). Updated slice status table.
- PRs merged (cumulative since last log entry):
  - PR #56: feat(argument-card): ArgumentCard with tail and a11y (closes #41)
  - PR #57: feat(t7): Timeline and DebateScreen components (closes #43)
  - PR #58: feat(t8): accessibility and theme verification (closes #44)
  - PR #59: feat(t9): deployment cutover to Vite React app (closes #45)
  - PR #61: fix: visual polish — legend dots, topic header, body margin, theme toggle (closes #60). 10 Copilot review rounds. Round 10: "generated 0 comments" exit condition met.
- PO decisions confirmed: PR #61 merged by PO after Gate 6 merge readiness verified.
- Open questions status: None.
- Next micro-goal: Commit protocol file changes on master (.github/AGENTS.md, .github/agents/architect-orchestrator.agent.md, .github/agents/dev.agent.md) via branch/PR. Then: start next slice or maintenance tasks.
- Blockers/owner decisions: 3 uncommitted protocol files on master need branch/PR.
