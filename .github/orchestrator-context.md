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
3. Gate 3 design work, including UX+Design single-pass and Design QA substeps, is local-only.
4. Cloud mode uses manual handoff and pasted-back artifacts.
5. Final verification and merge readiness decisions happen in local context.

## Implemented Agents (Current)

1. Architect + Orchestrator: `.github/agents/architect-orchestrator.agent.md`
2. Requirement Challenger: `.github/agents/requirement-challenger.agent.md`
3. PRD Agent: `.github/agents/prd.agent.md`
4. UX Agent: `.github/agents/ux.agent.md` **[DEPRECATED — Protocol 3.19. Orchestrator absorbs UX execution via `ux-design-execution` skill.]**
5. Figma Agent: `.github/agents/figma.agent.md`
6. Design QA Agent: `.github/agents/design-qa.agent.md`
7. Architecture Agent: `.github/agents/architecture.agent.md`
8. Dev Agent: `.github/agents/dev.agent.md`
9. Runtime QA Agent: `.github/agents/runtime-qa.agent.md`

## Current Gate Contracts

1. Gate 1 (Requirement Challenge)
    - Input: requirement statement.
    - Output: readiness, challenge set, acceptance criteria, open questions, gate decision, Requirement Context Package.

2. Gate 2 (PRD)
    - Input: Requirement Context Package.
    - Output: PRD Draft Package plus readiness, alignment/traceability, quality gaps, open questions, and gate decision.

3. Gate 3 (Design)
    - Flow: PRD Draft Package -> UX+Design Package (Orchestrator executes via `ux-design-execution` skill: flows + Figma frames in one pass) -> Design QA Verdict Package.
    - Gate closes only after UX+Design pass and Design QA pass and Product Owner explicitly approves the design.

4. Gate 4 (Architecture)
    - Input: slice artifacts `01-requirement.md` through `04-design-qa.md`.
    - Output: Architecture Plan Package plus `05-architecture.md` and `06-tasks.md`.

5. Gate 5 (Build)
    - Input: one approved Gate 4 issue with acceptance criteria, slice path, and architecture reference.
    - Output: Build Output Package with implementation summary, verification evidence, BDD evidence, PR package, quality gaps, open questions, and gate decision.

6. Gate 5.5 (Runtime QA)
    - Input: Gate 5 build output, PR link, acceptance-criterion journey map, and runtime setup notes.
    - Output: Runtime QA Verdict Package (`Pass | Fail | Blocked`) with coverage matrix, findings, and loop-back recommendation.

7. Gate 6 (Merge)
    - Input: GitHub Issue reference, PR link, and Build Output Package.
    - Output: merge readiness, review summary, runtime QA status, outstanding gaps, gate decision, and owner action.

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
11. Gate 3 never closes on agent decision alone. Orchestrator produces dual output via `ux-design-execution` skill (Figma pixel frames via MCP + text UX Flow/State Package). Design QA reads Figma via MCP, loops gaps back to Orchestrator, then escalates to Product Owner. Product Owner explicit approval is required to close Gate 3.
12. Slice artifacts are stored in `docs/slices/<slice-name>/` as versioned markdown. Orchestrator creates the slice folder when Gate 1 passes and writes gate artifacts after each gate closes.
13. GitHub Issues (one per atomic coding task) are created by the orchestrator at the end of Gate 4, after the architecture plan is approved. Gate 5 (Build) is purely implementation — no planning overhead.
14. Architecture governance is orchestrator-owned and enforced through an explicit Gate 4 checklist (scope, traceability, boundaries, risk, verification, rollback, decomposition, issue linkage, and owner acceptance).
15. Gate 5 default execution is local. Product Owner may opt a specific issue into cloud execution. Final build evidence is verified in local context before merge recommendation.
16. Gate 5 implementation uses BDD discipline: behavior scenarios, test-first workflow, and scenario-to-test evidence are required before merge progression.
17. Issue-centric handoff is supported for Gate 5: issue link/number is sufficient only when issue metadata includes acceptance criteria, slice path, and architecture reference.
18. Gate 5 PR provenance is mandatory: PR body must include issue-closing keyword and an `## Agent Provenance` block with `run-id`, `task-id`, `role`, and `dispatched` fields. The legacy `Execution-Agent: dev` marker alone is not provenance-complete.
19. Gate 6 is orchestrator-owned and Local-only. It recommends merge or loop-back based on evidence, but Product Owner alone performs the actual merge.
20. Design artifact is mandatory for every UX task: Gate 3A must include a valid Figma file URL before progression. Raw file keys must not appear in git-tracked artifacts — store them only in `.figma-config.local`.
21. Orchestrator terminal policy is diagnostics-first, but explicit Product Owner requests may authorize scoped git mutating commands (including add/commit/push/branch/PR operations); destructive commands still require command-level approval.
22. Slice/story traceability policy: each slice has a GitHub slice tracker issue labeled `slice`; each story issue is labeled `user-story` and `slice:<slice-name>` and must contain a `Slice tracker:` backlink; slice tracker must list all story issue links; `06-tasks.md` must mirror story issue links and architecture references.
23. Review-response policy is repo-wide: when an agent fixes a review comment, it must also post a PR reply explaining what was accepted or challenged, what changed (or why no change), and the rationale/tradeoff.
24. Universal principle persistence: repo-wide principles may be stored in either (a) `Known Rules From User Decisions` (this section) or (b) permanent shared protocol docs (.github/AGENTS.md, .github/agents/*.agent.md) with explicit cross-reference. This avoids duplication while ensuring traceability and centralized visibility. Pre-archive checks validate presence in either location before archiving a slice.
25. UX and Architecture agents run an embedded challenge phase; unresolved `Must Resolve` gaps must be resolved or explicitly accepted before `Ready`.
26. Architecture work uses a three-tier discussion model: System Design, Solution Architecture, and Implementation Design.
27. Figma uses one self-contained file per screen with pages `Design` and `QA Notes`. There is no `UX Flows` page — UX flow/state coverage is captured in `03-ux.md` only. Frame naming: `<Screen>/<State>/<Theme>/<Viewport>`. Cross-ref: Known Rule #76.
28. The Design System lives in a shared Figma library file; the first slice entering Gate 3 bootstraps it if absent. Dual-theme and token-only rules apply from day one.
29. PR review intake is mandatory before any fix: classify each actionable comment as `Accept`, `Challenge`, or `Needs Product Owner Decision`.
30. Start the Copilot review loop immediately when a PR is created, and rerun it after each review-fix push until there are zero `semantic-open` comments unless the Product Owner accepts residual risk.
31. After requesting Copilot review, poll live GitHub state for up to 5 minutes before declaring the result pending; if an approved non-MCP fallback is needed for the wait, use `node scripts/wait_for_copilot_review.js --owner <owner> --repo <repo> --pr <number>` so the live PR head is derived from GitHub rather than pasted manually.
32. GitHub PR/issue/review operations use GitHub MCP as the default control plane; fallbacks require an explicit capability gap and approval.
33. Once a PR review loop starts, continue it automatically after each push and review request until resolved or blocked.
34. Thread resolution belongs to disposition execution, not classification.
35. Review completion uses semantic state: `semantic-open` blocks, `semantic-closed` does not, and `semantically-closed/tooling-unresolved` must be reported explicitly.
36. ~~Superseded by Rule #56 for review-loop handling.~~ Previously required prior PO discussion before posting a `Challenge` reply. Review-loop challenges are posted immediately and batched for PO review after no `semantic-open` review threads remain. Non-review-loop challenges (e.g., gate artifacts) require prior PO discussion and explicit PO agreement on the external position before posting the challenge.
37. Orchestrator resume is tiered: read shared protocol + context first, then only gate-relevant agent files.
38. Resume writes current state into `/memories/session/active-state.md` for follow-up prompts in the same session.
39. Accessibility is a universal default: all screens must meet baseline accessibility (semantic HTML, keyboard navigation, WCAG 2.1 AA contrast, appropriate ARIA attributes). Not a per-slice opt-in.
40. Argument colors must be semantically neutral: Tark (for) uses blue tones, Vitark (against) uses amber/warm tones. No green/red or other value-laden color pairs that imply positive/negative judgment. This is a universal design rule for all debate-related UI.
41. All Figma MCP write operations (design frames AND DS library) are executed by the Orchestrator using the `ux-design-execution` skill during Gate 3A. Read-only Figma MCP access is allowed for Design QA Agent, Dev Agent, and Orchestrator for gate validation and spot-checks. Outside Gate 3A execution, no agent invokes Figma write operations. Cross-ref: Known Rule #79.
42. Visual and UX execution (flows, states, Figma frames) is performed by the Orchestrator in Gate 3A using the `ux-design-execution` skill. Other agents do not originate design proposals.
43. Gate artifact updates route through the owning agent: PRD changes → PRD Agent, Gate 3A/UX artifacts → Orchestrator (authored during Gate 3A execution), etc. No agent makes content edits to another agent's gate artifact. Orchestrator may mechanically persist or commit output to the slice folder.
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
56. Review loop post-and-continue: agents post Challenge replies immediately during the review loop (with rationale + rule citation) and continue without pausing. Supersedes Rule #36 for review-loop handling. Challenges are batched for PO review after all review threads are `semantic-closed` (no `semantic-open` threads remain). PO may override any challenge, triggering a fix + re-loop cycle. Loop completes when: (1) no review threads remain `semantic-open`, and (2) all challenges resolved with PO. Cross-ref: `pr-review-loop` skill, Strict Accept-vs-Challenge Lens rule #5.
57. Review loop auto-entry is tracked canonically in the `pr-review-loop` skill under Copilot Review Loop Protocol rule #1; this entry is a context pointer only.
58. Stacked PR review and merge handling is tracked canonically in the `stacked-pr-review-loop` skill at `.github/skills/stacked-pr-review-loop/SKILL.md`; this entry is a context pointer only.
59. For orchestrator-managed dependent PR chains, review-loop control is orchestrator-owned: orchestrator requests/polls/triages and sequences base-to-tip progression; dev agents perform code-only changes and hand back unless explicitly delegated a review action.
60. No-manual-QA policy: UI-impacting issues require Gate 5.5 runtime validation by Runtime QA Agent via Chrome DevTools MCP before Gate 6 progression, unless Product Owner explicitly accepts residual runtime risk.
61. Gate 3A control-contract rule: for any input/submit journey, UX output must include an explicit UI Control Contract (control type, validation timing, error presentation, state behavior, and keyboard/focus behavior). Missing control-level decisions cannot pass `UX Readiness: Ready` unless Product Owner explicitly accepts risk.
62. Gate 3A M3 control-mapping rule: for Design System-governed input/submit journeys, UX output must include explicit M3 control mapping (component, variant, required states, and token/state references). Generic control naming alone is insufficient for `UX Readiness: Ready` unless Product Owner explicitly accepts risk.
63. Gate 3 visibility rule: after Gate 3A (UX+Design single-pass) execution, orchestrator must provide a `Design Review Access Packet` to Product Owner with node-targeted Figma URL(s) (`?node-id=`) containing actual frame node IDs, page list, key frame/state node IDs, pass-level change summary, and explicit review decision request. Root file URL alone is insufficient. Review links must prioritize runtime-preview visual frames (minimal/no QA overlays). Missing node IDs must loop back before review-ready claims.
64. For enhancement slices, runtime-preview review frames must be derived from duplicated baseline screen frame(s) to preserve established visual consistency; Design Review Access must include baseline source references.
65. One Figma file per screen — strictly enforced. All slices that add to or modify the same screen share one Figma file for that screen. File key stored only in `.figma-config.local`; file URL may appear in git-tracked artifacts. Cross-ref: Known Rule #73.
66. Baseline-lock is mandatory for all continuation slices (any slice adding to or modifying an existing approved screen): Orchestrator's first Figma action (Gate 3A, `ux-design-execution` skill) must be MCP `node.clone()` of approved baseline frame(s) — not recreation or approximation. Source node ID and clone node ID must be recorded as provenance in Design Review Access. Any element present in the baseline must come from the clone only; only net-new additions are authored fresh. Violation is a loop-back condition regardless of gate or slice type.
67. M3 Component Library-First: all M3-derived and shared UI components (Card, Button, TextField, SegmentedControl, Chips, NavigationBar, FAB, etc.) must be created and published in the DS library file (`design_system_library_file_key` in `.figma-config.local`) before being used in any slice design frame. Slice files must import components via library link only — no local component definitions allowed for M3-derived components. Orchestrator (Gate 3A, `ux-design-execution` skill) must run Component Coverage Check before any frame creation. If a required TV Library component is absent, Orchestrator creates it directly in the DS library before proceeding. `UX Readiness: Ready` cannot be claimed if any frame uses a locally-defined component. See `M3 Component Library-First Policy` in `figma-governance-and-fidelity/SKILL.md`.
68. Orchestrator is the authoritative Figma execution agent for Gate 3: it produces the `Frame Blueprint` and `DS Component Coverage Declaration` as the authoritative anatomy specification, and then executes Figma frames directly via MCP using the `ux-design-execution` skill in the same Gate 3A pass. DS library gaps surface during Component Coverage Check and are resolved by Orchestrator directly in the DS library. Design QA verifies against Orchestrator's output. There is no separate UX Agent or Figma Agent substep. Cross-ref: Known Rule #79.
69. All questions to Product Owner must use the VS Code `vscode_askQuestions` tool. Before invoking the tool, print elaborated context, tradeoffs, and recommendation in the chat. The tool call contains only concise choice labels and a short one-line `question` prompt — not the full explanation. `allowFreeformInput` must always be `true` (the default, never override to false). Cross-ref: AGENTS.md `Owner Question Protocol`.
70. (Renumbered — see Known Rule #70 below; this slot is intentionally skipped to preserve legacy numbering.)
71. (Renumbered — see Known Rule #71 below.)
72. (Renumbered — see Known Rule #72 below.)
73. (Renumbered — see Known Rule #73 below.)
74. Every message that requires a Product Owner action must include a direct clickable URL — Figma files as `https://www.figma.com/design/<key>`, GitHub issues as `https://github.com/nishantnaagnihotri/tark-vitark/issues/<n>`, GitHub PRs as `https://github.com/nishantnaagnihotri/tark-vitark/pull/<n>`. Each action gets its own link on its own line. Applies to all agents. Cross-ref: AGENTS.md `PO Actionable Link Policy`, Known Rule #74.
75. Figma Design page frames are organized in journey rows (UX-defined flow order). Row layout: Light/Mobile → Dark/Mobile → Light/Desktop → Dark/Desktop (100px h-gap). Row gap: 300px. First row at x=0, y=0; rows stack downward. Baseline-lock frames in a dedicated Baseline Zone (x≥1200). Baseline frame names prefixed `_baseline/`. Unrecognized frames always reported as QGs. Cross-ref: AGENTS.md `Figma Canvas Layout Protocol`, Known Rule #75.
76. Gate 3 merged execution model (Option C, adopted 2026-04-10): Protocol 3.16. Orchestrator (via `ux-design-execution` skill) is the single Gate 3A execution agent — it produces both the `03-ux.md` text artifact AND all Figma pixel frames in one pass. Standard Figma file pages: `Design` and `QA Notes` (no `UX Flows` page). Gate 3 substeps: (A) UX+Design single-pass → (B) Design QA with PO approval. (Figma Agent DS library scope eliminated in Protocol 3.17; UX Agent eliminated in Protocol 3.19 — see Known Rule #79.)
77. Figma Agent eliminated (Protocol 3.17, adopted 2026-04-10): UX Agent (now Orchestrator via `ux-design-execution` skill) owns both slice design frames AND DS library management (bootstrap, TV component creation, token/variable updates). Safety constraint: DS library writes must be scoped to a named component task; publish only after verifying no regressions in existing components. There is no separate Figma Agent. Cross-ref: Known Rule #79.
78. Single-screen-first Gate 3A protocol (Protocol 3.18, adopted 2026-04-11): Gate 3A runs in two phases. Phase 1: Orchestrator creates only the primary frame (Default/Light/Mobile) and returns it for Product Owner explicit visual approval before any other frames are created. Phase 2 (authorized by PO approval): Orchestrator creates all remaining frames. Phase 2 must NOT start until PO has explicitly approved Phase 1. Root cause for this rule: applying variable modes or resizing the outer cloned frame after `duplicate_node` can silently mutate existing elements (topic bar fills, card bubble arrow positions). Phase 1 approval is the mandatory visual gate that catches this class of fidelity failures early. Cross-ref: AGENTS.md Rule 4, `design-gate-orchestration/SKILL.md` Substep A.
79. UX Agent eliminated (Protocol 3.19, adopted 2026-04-11): Orchestrator absorbs full UX execution and Figma write ownership. All UX work (Challenge Phase, UX Flow/State Package, Frame Blueprint, DS Coverage Declaration, Component Coverage Check, Baseline-Lock, Figma frame execution, Overlap Check) is performed by Orchestrator directly using the `ux-design-execution` skill (`.github/skills/ux-design-execution/SKILL.md`). `ux.agent.md` is deprecated. Cross-ref: Known Rules #41, #68, `domain-ownership-governance` skill.
80. PRD Amendment Protocol (adopted 2026-04-16): When the Product Owner approves a scope change after Gate 2 is closed, all three conditions must be met before Gate 3 closure: (1) a dated `## Amendments` entry appended in `02-prd.md` (amendment number, date, scope narrative, supersession clause if applicable), (2) delta markers in `03-ux.md` and `04-design-qa.md` citing the amendment number, and (3) no downstream artifact may remain with stale scope that conflicts with the amendment. Gate 3 is blocked until all three are satisfied. Cross-ref: `.github/skills/requirement-prd-alignment/SKILL.md` §PRD Amendment Protocol, `.github/skills/prd-gate-orchestration/SKILL.md` §PRD Amendment trigger rule.

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
2. Gate 3 is fully wired through UX+Design single-pass and Design QA (Protocol 3.17/3.19). Figma Agent eliminated; Orchestrator owns all Figma write operations via `ux-design-execution` skill.
3. Current governance baseline is complete through Merge gate.

## Default Next Step

1. Start the next slice or run a fresh Gate 4 -> Gate 6 path on a new issue/PR.

## Current Slice Status

| Slice | Gate 1 | Gate 2 | Gate 3 | Gate 4 | Gate 5 | Gate 6 |
|---|---|---|---|---|---|---|
| `coming-soon-splash-page` | ✅ Pass | ✅ Full Pass | ✅ Pass (PO approved 2026-03-29) | ✅ Pass | ✅ Complete (T3 PR #18, T4 PR #19, T5 PR #20 all merged) | ✅ Complete (2026-03-29) |
| `debate-screen` | ✅ Pass | ✅ Full Pass | ✅ Pass (PO approved 2026-04-06) | ✅ Pass (Revision 1.1) | ✅ Complete (T1–T9 + visual polish PR #61) | ✅ Complete (2026-04-07) |
| `post-tark-vitark` | ✅ Re-pass (refined, 2026-04-08) | ✅ Re-pass (2026-04-08) | ✅ Pass (PO approved 2026-04-16, PR #83 merged) | ✅ Pass (2026-04-16, PR #94 merged) | ✅ Complete (T-1–T-8 + post-build PRs #106, #108, slice merge PR #109) | ✅ Complete (2026-04-17, PR #112 merged) |
| `debate-screen-polish` | ✅ Pass (2026-04-17, Standard) | ✅ Full Pass (2026-04-17) | — | — | — | — |

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

### 2026-04-17 (debate-screen-polish Gate 2 Full Pass)
- Gate status: `debate-screen-polish` Gate 2 ✅ Full Pass. PRD v0 complete with 11 FRs, 12 ACs, 5 constraints, 5 success metrics.
- Artifact changes: Created `docs/slices/debate-screen-polish/02-prd.md`.
- Open questions status: OQ-1 (width) non-blocking — Gate 3A owns resolution, AC-1 carries placeholder. OQ-4 (fix strategy) non-blocking — Gate 4 owns resolution. OQ-3 non-blocking, no gate assignment. OQ-5 de-facto resolved by AC-6 + AC-7.
- Next micro-goal: Gate 3 — UX+Design single-pass (Orchestrator executes via `ux-design-execution` skill).
- Blockers/owner decisions: None. Ready for Gate 3.

### 2026-04-17 (debate-screen-polish Gate 1 Pass)
- Gate status: `debate-screen-polish` Gate 1 ✅ Pass. Complexity: Standard (full 6-gate flow).
- Artifact changes: Created `docs/slices/debate-screen-polish/01-requirement.md`.
- Open questions status: OQ-2 resolved (stagger preserved — Tark left, Vitark right). OQ-1 (target mobile card width) accepted as PO-approved open to be resolved at Gate 3A via Figma frames. OQ-3, OQ-4, OQ-5 non-blocking, carried forward.
- Next micro-goal: Gate 2 — invoke PRD Agent with Requirement Context Package.
- Blockers/owner decisions: None. OQ-1 resolution delegated to Gate 3A.

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

### 2026-04-07 (Global — PR #78 Merged: Runtime QA Gate 5.5 Workflow)
- Gate status: No active slice. Governance baseline advanced after merge.
- PR: https://github.com/nishantnaagnihotri/tark-vitark/pull/78
- Artifact changes: Runtime QA governance package merged to `master` (`runtime-qa.agent.md`, `runtime-qa-validation` skill, Gate 5.5 and merge-evidence wiring across shared/orchestrator/dev protocols). Local `master` fast-forwarded to `origin/master` at `f8a3330`.
- Open questions status: None.
- Major decision challenged: runtime-confidence model options were previously challenged (`tests-only` vs `tests + runtime QA`). Product Owner-selected path is now merged: coded tests remain mandatory and UI-impacting issues additionally require Gate 5.5 runtime validation (or explicit residual-risk acceptance).
- Next micro-goal: Select the next active slice (or governance task) and run Gate 1 intake with a fresh Requirement Context Package.
- Blockers/owner decisions: None.

### 2026-04-07 (post-tark-vitark Gate 1 ✅ Pass)
- Gate status: `post-tark-vitark` Gate 1 ✅ Pass. Complexity: Standard (full 6-gate flow).
- Artifact changes: Created `docs/slices/post-tark-vitark/01-requirement.md`.
- Open questions status: All Gate 1 clarification questions resolved (eligibility, page scope, content type, length limits, publish policy, lifecycle, ordering).
- Major decisions challenged and confirmed: anyone can post until login is introduced; posting is limited to the current static debate page; post content is text-only with 10 to 200 character validation; publish is immediate; lifecycle is create-only; new posts append at bottom chronologically.
- Next micro-goal: Gate 2 — invoke PRD Agent with the Requirement Context Package for `post-tark-vitark`.
- Blockers/owner decisions: None. Ready for Gate 2.

### 2026-04-07 (post-tark-vitark Gate 2 ✅ Full Pass)
- Gate status: `post-tark-vitark` Gate 2 ✅ Full Pass. Ready for Gate 3.
- Artifact changes: Created `docs/slices/post-tark-vitark/02-prd.md`.
- Open questions status: None. Gate 1 clarifications remained resolved with no PRD-stage additions.
- Requirement-to-PRD alignment: Passed. Gate 1 contract preserved with one-to-one mapping from AC-1..AC-9 and no owner-approved deltas.
- Next micro-goal: Gate 3A — invoke UX Agent with PRD Draft Package for `post-tark-vitark`.
- Blockers/owner decisions: None. Ready for Gate 3.

### 2026-04-07 (post-tark-vitark Gate 3A ✅ Pass)
- Gate status: `post-tark-vitark` Gate 3A ✅ Pass. Gate 3B ready.
- Artifact changes: Created `docs/slices/post-tark-vitark/03-ux.md`.
- Open questions status: None. UX Challenge Phase completed with 0 Must Resolve and 2 Accept With Risk items documented.
- Validation checks: `UX Readiness: Ready`; `Gate Decision: can proceed to figma`; Design Artifact references present; `.figma-config.local` contains non-empty `design_system_library_file_key`.
- Next micro-goal: Gate 3B — invoke Figma Agent with UX Flow/State Package for `post-tark-vitark`.
- Blockers/owner decisions: None. Ready for Gate 3B.

### 2026-04-07 (Global — UX Protocol Hardened For Control Decisions)
- Gate status: `post-tark-vitark` remains in Gate 3 (3A protocol hardening + rerun requested).
- Artifact changes: Updated `.github/agents/ux.agent.md` and `.github/skills/design-gate-orchestration/SKILL.md` to require explicit `UI Control Contract` coverage for interactive journeys before `UX Readiness: Ready`.
- Open questions status: None.
- Major decision challenged and confirmed: control-level UI decisions (for input journeys) are UX-owned and must be explicit at Gate 3A, not inferred downstream.
- Next micro-goal: Re-run UX Agent for `post-tark-vitark` under hardened protocol and persist revised `03-ux.md`.
- Blockers/owner decisions: None.

### 2026-04-07 (post-tark-vitark Gate 3A ✅ Rerun Pass — Control Contract Locked)
- Gate status: `post-tark-vitark` Gate 3A remains ✅ Pass after rerun; Gate 3B ready.
- Artifact changes: Updated `docs/slices/post-tark-vitark/03-ux.md` with explicit `UI Control Contract` (selector type, textarea behavior, counting rule, validation timing, button states, error placement, keyboard/focus behavior).
- Open questions status: None.
- Validation checks: `UX Readiness: Ready`; `Gate Decision: can proceed to figma`; `Quality Gaps: None`; control-level decisions now explicit per Rule #61.
- Next micro-goal: Gate 3B — invoke Figma Agent with revised UX package.
- Blockers/owner decisions: None.

### 2026-04-07 (Global — UX Protocol Hardened For M3 Control Mapping)
- Gate status: `post-tark-vitark` remains in Gate 3 (3A M3-hardening + rerun requested).
- Artifact changes: Updated `.github/agents/ux.agent.md` and `.github/skills/design-gate-orchestration/SKILL.md` to require explicit `M3 Control Mapping` for Design System-governed interactive journeys.
- Open questions status: None.
- Major decision challenged and confirmed: UX control decisions must be both user-friendly and M3-compliant with explicit component/variant/state mapping before Gate 3B progression.
- Next micro-goal: Re-run UX Agent for `post-tark-vitark` under M3 mapping contract and persist revised `03-ux.md`.
- Blockers/owner decisions: None.

### 2026-04-07 (post-tark-vitark Gate 3A ✅ Rerun Pass — M3 Mapping Locked)
- Gate status: `post-tark-vitark` Gate 3A remains ✅ Pass after M3 rerun; Gate 3B ready.
- Artifact changes: Updated `docs/slices/post-tark-vitark/03-ux.md` with explicit `M3 Control Mapping` for posting journey controls (component, variant, interaction states, and token/state references).
- Open questions status: None.
- Validation checks: `UX Readiness: Ready`; `Gate Decision: can proceed to figma`; `Quality Gaps: None`; control contract and M3 mapping both explicit per Rules #61 and #62.
- Next micro-goal: Gate 3B — invoke Figma Agent with M3-compliant UX package.
- Blockers/owner decisions: None.

### 2026-04-07 (post-tark-vitark Gate 3B ✅ Pass)
- Gate status: `post-tark-vitark` Gate 3B ✅ Pass. Gate 3C initiated.
- Artifact changes: Updated slice Figma design in-place at `https://www.figma.com/design/CsPAyUdLSStdmNpmiBMESQ` with full posting-journey state coverage and QA traceability nodes (`149:494`, `152:2`).
- Open questions status: None.
- Validation checks: `Figma Readiness: Ready`; `Gate Decision: can proceed to design-qa`; 14 required DebatePage frames (7 states x Light/Dark) covered.
- Next micro-goal: Gate 3C — run Design QA against PRD + UX + Figma artifacts.
- Blockers/owner decisions: None.

### 2026-04-07 (post-tark-vitark Gate 3C 🔄 Revision Loop -> Agent-Ready)
- Gate status: Gate 3C initial pass found 2 structural gaps, routed to Figma revision, then revalidated to `Design QA Readiness: Agent-Ready`.
- Artifact changes: Created `docs/slices/post-tark-vitark/04-design-qa.md`; updated Figma QA artifacts in nodes `152:2` and `149:494` to close traceability/interaction gaps.
- Open questions status: None.
- Validation checks: all AC-1..AC-9 traceability now explicit, required interaction annotations explicit, no remaining structural quality gaps.
- Next micro-goal: obtain explicit Product Owner design approval to close Gate 3 and begin Gate 4 handoff.
- Blockers/owner decisions: **Product Owner explicit approval is required** (`Approved` or `Changes Requested`) before Gate 3 closure.

### 2026-04-08 (post-tark-vitark Gate 3 ❌ Not Approved — Loop Back To Gate 1 Refinement)
- Gate status: Product Owner rejected the current Gate 3 output (`I dont like any of it`). Gate 3 is not approved and cannot close.
- Artifact changes: No new artifact approved; existing `01-requirement.md` through `04-design-qa.md` retained as prior iteration history.
- Open questions status: Requirement details are reopened for refinement before further design iterations.
- Major decision challenged and confirmed: options were (a) run a narrow Gate 3 visual revision on the same requirement baseline, or (b) loop back and re-detail requirements first. Product Owner-selected option is (b) requirement refinement first.
- Next micro-goal: restart Gate 1 clarification in one-question-at-a-time mode and refresh Requirement Context Package for this slice.
- Blockers/owner decisions: pending Product Owner responses to requirement clarification prompts.

### 2026-04-08 (post-tark-vitark Gate 1 Refinement Update — Composer Baseline Changed)
- Gate status: Gate 1 refinement in progress (loop-back path remains active).
- Artifact changes: no gate artifact rewritten yet; refinement decisions captured for next Requirement Context Package revision.
- Open questions status: narrowed to side-selection behavior for the always-visible composer.
- Major decision challenged and confirmed: Product Owner discarded FAB/FAB-menu entry pattern and selected always-visible bottom composer on the same debate screen (WhatsApp-style, non-fullscreen). UX-agent provided side-selection alternatives for decision hardening: (A) single-select segmented control, (B) radio group, (C) exposed dropdown; recommendation is (A).
- Next micro-goal: capture Product Owner side-selection decision and rerun Gate 1 requirement challenge.
- Blockers/owner decisions: Product Owner decision pending on side-selection mechanism for Tark/Vitark.

### 2026-04-08 (post-tark-vitark Gate 1 Refinement Update — Option A Selected, Clarification Loop Continues)
- Gate status: Gate 1 refinement still in progress after requirement-challenger rerun.
- Artifact changes: no gate artifact rewritten yet; challenger produced updated unresolved-question set for requirement closure.
- Open questions status: side-selection mechanism resolved to Option A (required M3 single-select segmented control `Tark | Vitark`). Remaining unresolved items: posting eligibility, text validation contract, post-success reset behavior, failure/retry handling, mobile keyboard anchor behavior, and persistence scope.
- Major decision challenged and confirmed: Product Owner selected Option A for side selection in always-visible composer.
- Next micro-goal: close remaining open questions one-by-one with Product Owner, then regenerate `01-requirement.md` via Gate 1 handoff.
- Blockers/owner decisions: Product Owner responses pending for the remaining open questions listed above.

### 2026-04-08 (post-tark-vitark Gate 1 ✅ Re-pass After Refinement)
- Gate status: `post-tark-vitark` Gate 1 re-pass complete with updated requirement contract.
- Artifact changes: Rewrote `docs/slices/post-tark-vitark/01-requirement.md` with refined in-place composer model (always-visible bottom composer, segmented control side selection, updated validation/persistence/mobile rules).
- Open questions status: None.
- Validation checks: `Readiness: Ready`; `Gate Decision: can proceed to PRD`; complexity remains Standard.
- Major decisions confirmed: open posting (no auth), M3 segmented control with initial Tark default + last-side memory, trimmed validation 10-300 with whitespace-only rejection, keyboard-safe mobile composer pinning, local/static behavior where refresh resets newly added posts.
- Next micro-goal: rerun Gate 2 PRD drafting from the updated Requirement Context Package.
- Blockers/owner decisions: none for Gate 1 progression.

### 2026-04-08 (post-tark-vitark Gate 2 ✅ Re-pass After Refinement)
- Gate status: `post-tark-vitark` Gate 2 re-pass complete using refined Gate 1 contract.
- Artifact changes: Rewrote `docs/slices/post-tark-vitark/02-prd.md` with updated always-visible composer model, segmented side selection defaults/memory, trimmed 10-300 validation, keyboard-safe mobile behavior, and refresh-reset persistence scope.
- Open questions status: None.
- Validation checks: `PRD Readiness: Ready`; `Gate Decision: can proceed to design`; one-to-one Gate 1 to Gate 2 mapping complete; no owner-approved deltas.
- Next micro-goal: rerun Gate 3A UX handoff from updated PRD package.
- Blockers/owner decisions: none for Gate 2 progression.

### 2026-04-08 (Global - Gate 3 Design Visibility Protocol Hardened)
- Gate status: Governance update only; active slice remains `post-tark-vitark` Gate 3 pending Product Owner approval.
- Artifact changes: Updated `.github/AGENTS.md`, `.github/skills/design-gate-orchestration/SKILL.md`, `.github/agents/ux.agent.md`, `.github/agents/figma.agent.md`, and `.github/agents/architect-orchestrator.agent.md` to require a `Design Review Access Packet` after UX/Figma runs.
- Open questions status: None.
- Major decision challenged and confirmed: options were (a) keep URL-only reporting or (b) require URL + page/frame/node references + pass-level change summary. Product Owner-selected direction is (b) full visibility packet.
- Next micro-goal: apply the new packet format in all future Gate 3A/3B reports.
- Blockers/owner decisions: none.

### 2026-04-08 (Global - Gate 3 Visibility Deep-Link Hardening)
- Gate status: Governance update only; active slice remains `post-tark-vitark` Gate 3 pending Product Owner approval.
- Artifact changes: Refined Gate 3 visibility protocol to require node-targeted Figma deep links (`?node-id=`) instead of root file URLs across `.github/AGENTS.md`, `.github/skills/design-gate-orchestration/SKILL.md`, `.github/agents/ux.agent.md`, `.github/agents/figma.agent.md`, `.github/agents/architect-orchestrator.agent.md`, and Known Rule #63.
- Open questions status: None.
- Major decision challenged and confirmed: root file links do not land on review-critical states; protocol now requires node-targeted links in Design Review Access packets.
- Next micro-goal: emit node-targeted links in all Gate 3A/3B reports and handoff packets.
- Blockers/owner decisions: none.

### 2026-04-08 (Global - Runtime Preview First In Gate 3 Design Access)
- Gate status: Governance update only; active slice remains `post-tark-vitark` Gate 3 pending Product Owner approval.
- Artifact changes: Refined Gate 3 visibility protocol so `Design Review Access` primary links must target runtime-preview visual frames (minimal/no instructional overlays); annotated traceability frames are secondary evidence links.
- Open questions status: None.
- Major decision challenged and confirmed: node-targeted links alone are not sufficient when they land on instruction-heavy boards; Product Owner review links must feel like runtime screens first.
- Next micro-goal: ensure all new UX/Figma outputs provide runtime-preview deep links as primary review links.
- Blockers/owner decisions: none.

### 2026-04-08 (Global - Runtime Preview Baseline Derivation Rule)
- Gate status: Governance update only; active slice remains `post-tark-vitark` Gate 3 pending Product Owner approval.
- Artifact changes: Added requirement that enhancement-slice runtime preview frames must be built from duplicated baseline screen frame(s), with baseline source references included in Design Review Access packets.
- Open questions status: None.
- Major decision challenged and confirmed: runtime previews created from instruction-heavy states can drift from established visual language; baseline-first derivation preserves consistency.
- Next micro-goal: enforce baseline-source proof in future Figma review packets.
- Blockers/owner decisions: none.

### 2026-04-08 (post-tark-vitark Gate 3 Reset - Slice Designs Deleted)
- Gate status: `post-tark-vitark` Gate 3 reset by Product Owner request before approval.
- Artifact changes: Figma Agent deleted all post-tark-vitark slice design artifacts from the shared Figma file across `UX Flows`, `Design`, and `QA Notes` pages (runtime preview sections, state frames, and traceability boards). Baseline non-slice debate-screen anchors were preserved.
- Open questions status: Design strategy intentionally reopened for brainstorming.
- Validation checks: deletion verified by (a) removed node IDs resolving invalid, and (b) baseline anchor node still renderable (`106:2`).
- Next micro-goal: run Product Owner-led strategy brainstorm for new design direction, then restart Gate 3 from a fresh design handoff.
- Blockers/owner decisions: Product Owner strategy direction pending.

### 2026-04-08 (Global - M3 Component Library-First Protocol Hardened)
- Gate status: Governance update only; active slice remains `post-tark-vitark` Gate 3, pending Card/Filled DS library migration and redesign.
- Artifact changes: `.github/AGENTS.md` (Protocol-Version 3.8→3.9) — Design System Foundation Policy explicitly states M3 component library-first mandate. `.github/skills/figma-governance-and-fidelity/SKILL.md` — Rule #10 replaced with explicit M3 mandate; new `M3 Component Library-First Policy` section added (4 rules). `.github/agents/figma.agent.md` — new step 2b (Component Coverage Check, self-blocking); Quality Check #13 added. `.github/orchestrator-context.md` — Known Rule #67.
- Open questions status: None (protocol question resolved).
- Root cause addressed: `Card/Filled` component was created as a local component inside the debate-screen slice file, not in the DS library, because the prior protocol only said "New shared tokens/components are added to the library first" without defining what counts as "shared", without a workflow, and without a blocking condition.
- Major decision challenged and confirmed: Protocol must explicitly identify M3-derived components as library-only artifacts and block Figma Agent from creating frames before Component Coverage Check passes.
- Next micro-goal: route figma-agent to publish Card/Filled (and other required M3 components) to DS library `onzB8ujyvn6wnhdaS7Hz28`, then rebuild the post-tark-vitark design frame using real library imports.
- Blockers/owner decisions: Product Owner approval to proceed with DS library migration task.
- Known Rules added: 67 (M3 Component Library-First).

### 2026-04-08 (Global - UX-First Frame Anatomy (Hybrid Execution Model) Protocol Hardened)
- Gate status: Governance update only; active slice remains `post-tark-vitark` Gate 3, pending DS library migration and Gate 3A re-run.
- Artifact changes: `.github/AGENTS.md` (Protocol-Version 3.9→3.10). `ux.agent.md` — Approach steps 9a/9b (Frame Blueprint + DS Component Coverage Declaration); Constraints #10; UX Output Structure items 6/7; Quality Checks #10/#11; output format items 6/7; UX Flow/State Package Schema items 7/8. `figma.agent.md` — step 2b updated to consume UX-declared DS Coverage Declaration; step 7 updated to enforce Frame Blueprint fidelity. `design-gate-orchestration/SKILL.md` — Gate 3A proceeding rules 8/9 (require Frame Blueprint + DS Coverage Declaration); Local-validation rules 6/7. `orchestrator-context.md` — Known Rule #68.
- Open questions status: None.
- Root cause addressed: Figma Agent was making frame anatomy decisions (which components to use, how many, which layout) silently at execution time, causing design drift from intended UX. UX Agent is now the canonical authority for frame anatomy; Figma Agent is a pure executor with loop-back on any blueprint gap.
- Major decision challenged and confirmed: Accepted Option C (Hybrid) — UX declares Frame Blueprint + DS Component Coverage Declaration; Figma Agent verifies DS library state against UX declaration and executes blueprint exactly.
- Next micro-goal: re-run Gate 3A UX handoff for `post-tark-vitark` to produce Frame Blueprint + DS Component Coverage Declaration alongside existing UX artifacts, then proceed to DS library migration + Gate 3B execution.
- Blockers/owner decisions: none.
- Known Rules added: 68 (UX-first frame anatomy, hybrid execution model).

### 2026-04-08 (post-tark-vitark Gate 3A ✅ Re-pass — Frame Blueprint + DS Coverage Declaration Added)
- Gate status: `post-tark-vitark` Gate 3A re-pass complete. Gate 3A ✅ Pass. Ready to proceed to Gate 3B after DS library migration.
- Artifact changes: Rewrote `docs/slices/post-tark-vitark/03-ux.md` — added Section 6 (Frame Blueprint: 12 frames declared with exact names, dimensions, and ordered component list), Section 7 (DS Component Coverage Declaration: 10 components, 6 confirmed absent, 4 to verify), Section 13 (Design Review Access with placeholder node IDs). Renumbered all subsequent sections §6→§8 through §11→§14. Fixed Design Artifact URLs (was pointing to debate-screen baseline `CsPAyUdLSStdmNpmiBMESQ`; now correctly points to post-tark-vitark slice file `156vPSsvB9PinDcxkM4Ffx`). Updated UX Flow/State Package schema items to 14 entries.
- Open questions status: None.
- Frame Blueprint declared: 12 frames — Mobile (390×[baseline+CB]) for 5 states × 2 themes + Desktop (1440×900) for 1 state × 2 themes. KeyboardOpen frames at 390×844 (viewport crop).
- DS Coverage Declaration: 6 components confirmed absent from DS library (Card/Filled, SegmentedControl, TextField/Outlined, Button/Filled, SupportingText/Error, SafeArea/Bottom). 4 uncertain (Divider, Topic/Default, LegendBar, Timeline). All must be resolved before any frame creation.
- Validation checks: `UX Readiness: Ready`; `Gate Decision: can proceed to figma`; Frame Blueprint complete; DS Coverage Declaration complete; Known Rules #67, #68 satisfied.
- Next micro-goal: Route Gate 3B to Figma Agent with DS Coverage Declaration as input for step 2b. Figma Agent must: (1) run Component Coverage Check against DS library, (2) create missing components in DS library, (3) execute Frame Blueprint exactly starting with DebateScreen/Default/Light/Mobile.
- Blockers/owner decisions: None. Ready to invoke Figma Agent.

### 2026-04-08 (post-tark-vitark Gate 3B 🔄 Pass 1 — Default Frames Created)
- Gate status: `post-tark-vitark` Gate 3B Pass 1 complete. Two Default frames created. Awaiting PO review + DS library publish before remaining 10 frames.
- Artifact changes: DS library `onzB8ujyvn6wnhdaS7Hz28` — 9 new components created: `Topic/Default` (67:26), `LegendBar` (67:35), `Divider/Horizontal` (67:37), `SafeArea/Bottom` (67:39), `Timeline` (67:41), `SegmentedControl` (68:38), `Button/Filled` (68:45), `SupportingText/Error` (68:48), `TextField/Outlined` (69:44). `Card/Filled` was pre-existing (26:6, 26:2/26:4 variants).
- Frames created in slice file `156vPSsvB9PinDcxkM4Ffx` Design page: `DebateScreen/Default/Light/Mobile` (12:2), `DebateScreen/Default/Dark/Mobile` (13:2). Prior invalid frame `4:2` deleted.
- Baseline provenance: Source `106:386` / `106:422` from `CsPAyUdLSStdmNpmiBMESQ`. Cross-file frame copy blocked by Figma Plugin API limitation; baseline content faithfully reconstructed using DS library components.
- Known blockers: (1) DS library not yet published as Figma team library — components exist as nodes but not cross-file importable. PO must publish manually. (2) QG-6: SegmentedControl width at 120px (should be 300px+); fix required before Phase 2 rebuild. (3) Frame layers use inline-recreated DS visuals, not true library-linked instances — resolved after DS library publish.
- Overlap check: PASS (12:2 at x=0, 13:2 at x=490, 100px gap).
- Next micro-goal: (a) PO reviews frames 12:2 and 13:2; (b) PO publishes DS library in Figma Assets panel; (c) Figma Agent fixes QG-6 and rebuilds frames with true library imports; (d) PO approves one agreed frame; (e) build remaining 10 frames.
- Blockers/owner decisions: (1) PO visual review of Default frames. (2) PO must publish DS library manually in Figma desktop.

### 2026-04-08 (Protocol v3.11 — 3-Layer Design System Architecture)
- Trigger: PO confirmed Material 3 Design Kit (357 components) is already enabled as a UI kit in the TV Design System file (`onzB8ujyvn6wnhdaS7Hz28`). Identified that current 12 DS components are recreated M3 primitives — not imports from the official kit. Protocol gap: no layer separation was enforced.
- Decision: PO accepted Option A — 3-layer restructure before remaining frames are built.
- Known Rule #69 added: 3-Layer Design System Architecture. See AGENTS.md and figma-governance-and-fidelity skill for full detail.
- M3 Kit confirmed: display name = "Material 3 Design Kit", MCP library key = `lk-5a31d104cabc6a74d4edf6425e7bc6575e9c0f18cda7efb746193aef4d915b077d115c985e6cf49d36d97d455a17d5127a2cbbfbc618b8a70a38669dccb61462`. Record in `.figma-config.local` as `m3_baseline_library_mcp_key`.
- Artifact changes: (1) `figma-governance-and-fidelity/SKILL.md` — rule #10 updated; "M3 Component Library-First Policy" section replaced with "3-Layer Design System Architecture" section (library chain table, 6 chain rules, Component Coverage Check with L1/L2+L3 classification, 3 gate-blocking conditions). (2) `AGENTS.md` — Protocol-Version bumped 3.10→3.11, Design System Foundation Policy mandate paragraph updated to describe 3-layer chain. (3) `figma.agent.md` — step 2b updated with explicit L1/L2+L3 component classification, M3 primitive import-only rule (never recreate), slice file M3 Kit prohibition. (4) `.figma-config.local.example` — added `m3_baseline_library_name` and `m3_baseline_library_mcp_key` fields with comments.
- Next action: Invoke Figma Agent to restructure TV DS file (`onzB8ujyvn6wnhdaS7Hz28`): (a) delete the 9 recreated M3 primitives (Button/Filled, TextField/Outlined, SegmentedControl, SupportingText/Error, Divider/Horizontal, Divider/Vertical recreations); (b) keep and migrate TV functional components to a "TV Components" page; (c) create a "Theme Overrides" page with brand variable overrides; (d) rebuild 2 Default frames in slice file using M3 Kit imports for primitives + TV DS library for functional components.

### 2026-04-08 (post-tark-vitark Gate 3B Pass 2 — DS Restructure + Frame Rebuild)
- Gate status: Gate 3B Pass 2 complete. TV DS restructured. 2 Default frames rebuilt (nodes 20:2611 and 20:2666). Must loop back on QG-1 (DS re-publish) and QG-3 (M3 Kit Button key).
- DS restructure: 6 recreated M3 primitives deleted from `onzB8ujyvn6wnhdaS7Hz28` (Button/Filled, TextField/Outlined, SegmentedControl, SupportingText/Error, Divider/Horizontal, Divider/Vertical). TV functional components kept (Card/Filled 26:6, Topic/Default 67:26, LegendBar 67:35, SafeArea/Bottom 67:39, Timeline 67:41). Page renamed to `TV Components`. `Theme Overrides` page added.
- Frames rebuilt: `DebateScreen/Default/Light/Mobile` (20:2611, 390×2479), `DebateScreen/Default/Dark/Mobile` (20:2666, 390×2479). Height = baseline 2276px + Composer Bar 203px.
- Component Coverage: SegmentedControl, Divider, TextField/Outlined confirmed imported from M3 Kit. Card/Filled, Topic, LegendBar, Timeline, SafeArea from TV DS. Button/Filled = QG-3 blocker (M3 Kit Buttons key not discoverable via MCP).
- QG-4: Card/Filled TV DS component renders at 56px (natural height), creating visual gap. TV DS Card/Filled redesign needed.
- 03-ux.md §13 updated: node IDs 20:2611 and 20:2666 recorded.
- Active blockers: QG-1 (PO must re-publish TV DS library after restructure), QG-3 (PO must provide M3 Kit Buttons component key), QG-4 (Card/Filled height, design debt).
- Next: PO re-publishes TV DS library + provides Buttons key → Pass 3 (fix QG-3, QG-4 Card redesign, then remaining 10 frames).

### 2026-04-08 (post-tark-vitark Gate 3B Pass 3 — Card Redesign + Button Wrapper + Library Update)
- Gate status: Gate 3B Pass 3 complete (pending PO re-publish). TV DS updated with Card/Filled redesign and new Button/Filled wrapper. One PO action blocks final frame update.
- Task 1 — Card/Filled redesign: Node `26:6` in `onzB8ujyvn6wnhdaS7Hz28` updated. `side=tark` → 280×248px, auto-layout, variable fills (DS `VariableID:9:4`), corner bl=0 bubble tail. `side=vitark` → 280×224px, auto-layout, variable fills (DS `VariableID:9:7`), corner br=0 bubble tail. Author label (Inter SemiBold 12px) + Argument text (Inter Regular 14px) on both.
- Task 2 — Button/Filled: QG-3 root cause confirmed permanently. M3 Kit "UI Kit" components cannot be imported via Figma Plugin API (`importComponentByKeyAsync`, `teamLibrary` API, `search_design_system` MCP) — UI Kit is asset-panel drag-only, not a team library. Resolution: created TV DS `Button/Filled` component set (node `93:32`, key `5fb45134cb399e43926580f82bb62531ff1c87dc`) as M3-spec-compliant wrapper: 98×40px pill (cornerRadius=20), `state=enabled` (key `4fb24aa94147eb4a5a9eb6c5274dc9ba1f0b7bea`) and `state=disabled` (key `248a04e90ea74b4dd7432d3ff77445cafdcee98f`). Binds to DS `color/primary` and `color/on-primary` variables. Known Rule #70 added.
- Task 3 — Frame card instances: 8 Card/Filled instances in 2 frames already linked to TV DS keys — will auto-update on PO re-publish.
- Task 4 — Overlap: PASS. Light at x=0, Dark at x=490, 100px gap, heights 390×2479.
- Frame node IDs: unchanged (20:2611 Light, 20:2666 Dark).
- Post-publish step (2026-04-09): PO re-published TV DS. Figma Agent ran Button replacement script + Card swap. Pass 3 fully closed.
- Final node IDs after Card swap + Button replacement:
  - Light frame 20:2611: Cards 28:90, 28:93, 28:96, 28:99 | Button/Filled 28:114 (98×40, x=146, y=2397)
  - Dark frame 20:2666: Cards 28:102, 28:105, 28:108, 28:111 | Button/Filled 28:116 (98×40, x=146, y=2397)
- All QG blockers resolved. Both Default frames: 390×2479, fully TV-DS-linked instances, overlap PASS.
- LOOP-BACK: PO reviewed frames and found they did not match approved baseline (wrong card count, centred cards, missing bubble tails, spurious Timeline spine).

### 2026-04-09 (post-tark-vitark Gate 3B Pass 4 — Baseline-Faithful Default Frame Rebuild)
- Root cause: Figma Plugin API blocks cross-file frame duplication. Pass 2/3 agent used generic DS component defaults instead of faithfully reading and matching baseline node positions and fills.
- Fix: Agent called get_design_context on both baseline nodes, extracted exact fills and positions, rebuilt both Default frames from scratch.
- Baseline fills extracted: Light surface #fffbff, tark card #bbdefb, vitark card #ffecb3. Dark surface #1b1b1f, tark card #1565c0, vitark card #bf360c.
- Frames deleted: 20:2611 (Light), 20:2666 (Dark).
- New frames created:
  - DebateScreen/Default/Light/Mobile → node 33:158, 390×2479, x=0, y=0
  - DebateScreen/Default/Dark/Mobile → node 33:226, 390×2479, x=490, y=0
- Content structure: Header (390×188) + Legend Bar (390×32) + Content (390×2056) with 8 Card/Filled instances at baseline x/y + 8 Bubble Tail triangle vectors. NO Timeline spine.
- Card layout: tark at x=20, vitark at x=90. Side pattern: tark, vitark, tark, vitark, tark, vitark, vitark, tark.
- Composer Bar appended: Divider + SegmentedControl + TextField + Button/Filled (disabled) + SafeArea.
- Overlap check: PASS (100px gap).
- 03-ux.md §13 updated with new node IDs.
- LOOP-BACK: PO reviewed 33:158/33:226. Still not pixel-perfect. Root cause: (1) TV DS Card/Filled had Author label not in baseline, (2) wrong corner radius (bubble-tail shape instead of 4px/12px rectangular), (3) placeholder text not overridden with actual argument text.

### 2026-04-09 (post-tark-vitark Gate 3B Pass 5 — Card/Filled Fix + Text Overrides)
- TV DS Card/Filled (node 26:6): Author label removed, corner radius corrected (tark=4px all, vitark=12px all), text Inter Regular 16px lh:24 ls:0.5, height=HUG. NOT YET RE-PUBLISHED.
- Frames deleted: 33:158, 33:226. New: Light 37:158, Dark 37:228, both 390×2479.
- All 8 Cards carry actual baseline debate argument text via instance text overrides.
- Overlap PASS. 03-ux.md §13 updated to node IDs 37:158 and 37:228.
- PO blocker: re-publish TV DS `onzB8ujyvn6wnhdaS7Hz28` to propagate Card/Filled fix.
- After re-publish: Default frames frozen, proceed to remaining 10 frames.

### 2026-04-09 (post-tark-vitark Gate 3B Pass 6 — Corner Radii, Text Size, SafeArea Color Fixes)
- PO reported: (a) corner arrows on cards off, (b) topic bar colors wrong.
- Root causes confirmed via design context diff:
  - Card corner radii: tark had TL=12 TR=12 BR=12 BL=0 (arrow artifact); vitark had TL=12 TR=12 BL=12 BR=0. Correct: tark=4px all, vitark=12px all (uniform).
  - Card text: 14px/leading-normal → fixed to 16px/lh:24/ls:0.5 Inter Regular.
  - Card height: FIXED (248 or 224px) → switched to AUTO (hug) so 16px text fits without overflow.
  - TV DS Card/Filled component (26:6): gap reset to 0px (was 8px from author-label row).
  - Dark frame SafeAreaBottom: fill was #fffbff (white) → fixed to #1b1b1f.
  - Header/Legend Bar node colors verified correct; no other color fixes needed.
- All 16 card instances in frames 37:158 (Light) and 37:228 (Dark) fixed in place. Frame node IDs unchanged.
- TV DS gap fix (itemSpacing=0) applied; PO must re-publish `onzB8ujyvn6wnhdaS7Hz28` to propagate to downstream instances.
- Next: PO visual review → if approved, re-publish TV DS → proceed to remaining 10 frames.

### 2026-04-09 (post-tark-vitark Gate 3B Pass 7 — Default Frame Hotfix)
- PO reported: (a) topic bar colors wrong, (b) dark vitark cards bad arrows, (c) posting control at bottom unacceptable.
- Root causes confirmed via get_design_context diff against baseline (106:386 / 106:422):
  1. Legend bar dots: nodes 37:163/37:167 (light) and 37:233/37:237 (dark) used M3 library color assets — fixed to tark/vitark surface colors per theme (light: #bbdefb/#ffecb3; dark: #1565c0/#bf360c).
  2. Card text 14px — library re-publish had reverted Pass 6 text overrides to 14px. Re-applied to all 16 cards (both frames): fontSize=16, lh=24px, ls=0.5px.
  3. Dark vitark text color: was #fbe9e7 (Deep Orange 50 — pinkish) → corrected to #fff8e1 (Amber 50 — warm cream) on all 4 dark vitark card text nodes.
  4. Dark bubble tail fills: Vector nodes 37:264–37:267 (tark left tails) → #1565c0; nodes 37:268–37:271 (vitark right tails) → #bf360c. Light-mode-colored tails on dark background created visible "bad arrows".
  5. Posting control removed: Divider + SegmentedButton + TextField + ButtonFilled + SafeAreaBottom deleted from both frames. Default frame has NO composer in baseline. Both frames resized from 390×2479 → 390×2276 (baseline spec).
- All 5 fixes confirmed applied. Post-fix screenshots verified vs baseline.
- CURRENT STATE: Both Default frames (37:158 Light, 37:228 Dark) are now 390×2276, pixel-matched to baseline.
- Next: PO visual review → if approved, proceed to 10-frame expansion (Pass 8).

### 2026-04-09 (post-tark-vitark Gate 3B Pass 8A — TV DS Card/Filled Component Defaults Baked + Corner Radius Decision)
- Gate status: Gate 3B Pass 8A complete (TV DS component properties baked). TV DS NOT YET RE-PUBLISHED. Blocked on Pass 8A corner radius correction (see below).
- TV DS Card/Filled — properties baked at component level (both variants, node 26:6 in `onzB8ujyvn6wnhdaS7Hz28`):
  - primaryAxisSizingMode: AUTO, counterAxisSizingMode: FIXED, width: 280, itemSpacing: 0, padding: 16 all
  - text: Inter Regular 16px, lineHeight PIXELS:24, letterSpacing PIXELS:0.5
  - tark (26:2): cornerRadius initially set to 4px all (INCORRECT — see correction below)
  - vitark (26:4): cornerRadius 12px all
- **Process reform (PO-approved):** Corrected model going forward — visual properties baked in TV DS component (not instance overrides) → single publish → atomic frame delete+recreate. Instance overrides = text content only.
- **Corner radius design decision — PO-accepted recommendation (2026-04-09):**
  - Decision: Card/Filled TV DS component (generic primitive) uses **uniform 12px all corners for BOTH variants** (tark + vitark).
  - The chat-bubble asymmetry (4px on speaker-side corner) lives at the ArgumentCard CSS layer, not in the DS Card/Filled primitive.
  - Source spec: `docs/slices/debate-screen/03-ux.md` line 94 — "asymmetric corner radii (sharp 4px corner on the speaker side, 12px rounded on the other three corners)... Tark cards have sharp top-left + left-pointing tail; Vitark cards have sharp top-right + right-pointing tail".
  - Rationale: Card/Filled is a generic M3 primitive; baking chat-bubble-specific asymmetry into it would pollute future non-chat-bubble consumers. The DS Card is a symmetric container; ArgumentCard CSS owns the directional override.
  - Pass 8A correction required: tark variant (26:2) cornerRadius must be updated 4px → 12px before TV DS re-publish.
- Next: Pass 8B — see below.

### 2026-04-09 (post-tark-vitark Gate 3B Pass 8B — Atomic Default Frame Rebuild)
- Gate status: Gate 3B Pass 8B complete. Both Default frames atomically deleted and recreated. Zero stale overrides.
- Deleted: 37:158 (Light), 37:228 (Dark).
- New frames:
  - DebateScreen/Default/Light/Mobile → node `53:112`, 390×2276, x=0, y=0
  - DebateScreen/Default/Dark/Mobile → node `53:148`, 390×2276, x=490, y=0
- DS component baked defaults confirmed on all instances: cornerRadius 12px all, width 280px, AUTO height, padding 16, font Inter Regular 16px/lh:24/ls:0.5 ✅
- All 8 Card text overrides applied with actual debate content ✅
- Bubble tail fills per theme: light tark `#bbdefb` / light vitark `#ffecb3` | dark tark `#1565c0` / dark vitark `#bf360c` ✅
- Overlap check: PASS (100px gap) ✅
- QG-1 (DS variable mode): Dark frame card fills show light-mode colors — DS variable mode not propagating to dark theme in cross-file import. Bubble tails and LegendBar dots are correct (independently overridden). Requires DS library fix, not inline patch.
- QG-2 (Minor): Card heights from baked defaults (tark=224px, vitark=200px) differ from baseline (248px/224px) — follows no-height-override rule.
- 03-ux.md §13 updated with new node IDs.
- Next: PO reviews frames 53:112 and 53:148.

### Known Rule #71 — Figma Agent Zero-Autonomous-Decision Policy (2026-04-09)
- Figma Agent is an executor, not a decision-maker. Every gap, deviation, or unexpected finding is a loop-back condition — the agent does not classify severity, patch inline, or self-issue a gate decision.
- All quality gaps are reported with: expected value, observed value, tool call that surfaced it, and orchestrator action required. No severity tiers (no Minor/Medium/Info classification). No gap is self-resolved.
- `Gate Decision` is always `Pending Orchestrator Review` in Figma Agent output. The agent never says `can proceed` or `must loop back` autonomously.
- No inline instance-level patches. Fixes route back through orchestrator to the owning agent (e.g., DS fill fix → DS library reauthored → re-published → frames auto-update).
- Cross-ref: `figma.agent.md` Constraints #7–#11, Quality Checks #14, Output Format items #7 and #10.

### Known Rule #75 — Figma Canvas: Journey-Row Layout (2026-04-10)
- Design page frames are organized in horizontal journey rows following the UX-defined user flow sequence.
- Within each journey row: Light/Mobile → Dark/Mobile → Light/Desktop → Dark/Desktop (left to right, 100px horizontal gap between frames).
- Journey row vertical gap: 300px minimum between the bottom of the tallest frame in a row and the top of the next row.
- First frame in the first journey row: x=0, y=0. Subsequent rows stack downward.
- Journey row y-coordinates are computed by Figma Agent at placement time: y_start = previous_row_y + previous_row_max_height + 300.
- Baseline-lock frames occupy a dedicated Baseline Zone at x≥1200 (or ≥1000px right of the last design frame column), y=0, labeled `_label/baseline-zone`. Baseline frames must never share x- or y-ranges with design frames.
- Baseline frames are named `_baseline/<original-state-name>` to distinguish from active design frames of the same state.
- When a new journey row is added (Pass 9+), Figma Agent reads the y_bottom of the last existing journey row and appends the new row at y_bottom + 300. No hardcoded y values.
- Stale or unrecognized frames on the Design page are always reported as QGs — never silently left or deleted.
- Journey row order for post-tark-vitark (per `03-ux.md`): (1) Default, (2) Typing, (3) KeyboardOpen, (4) ValidationError, (5) SubmitSuccess, (6) Desktop Default.
- Cross-ref: Rule #66 (baseline-lock), Rule #65 (file-per-screen), frame naming convention `<Screen>/<State>/<Theme>/<Viewport>`.

### Known Rule #74 — PO Actionable Link Policy (2026-04-10)
- Every message that requires a Product Owner action (publish, review, approve, merge, navigate) must include a direct clickable URL to the exact destination — no searching required.
- **Figma files:** always `https://www.figma.com/design/<file-key>` (not just a file key or vague reference).
- **GitHub issues:** always `https://github.com/nishantnaagnihotri/tark-vitark/issues/<n>`.
- **GitHub PRs:** always `https://github.com/nishantnaagnihotri/tark-vitark/pull/<n>`.
- If multiple PO actions exist in one message, each action must have its own link on its own line.
- Applies to all agents. Orchestrator enforces this in every gate-closure and handoff message.
- Cross-ref: Known Rule #72, AGENTS.md `PO Actionable Link Policy`.

### Known Rule #73 — File-Per-Screen Figma Governance (2026-04-10)
- Figma files are organized per screen, not per slice. All slices that touch the same screen share one file.
- Rationale: enables `node.clone()` within the same file for true baseline-lock with zero drift. Cross-file `node.clone()` is blocked by the Figma Plugin API — file-per-slice made genuine baseline duplication impossible.
- Consequence: `debate_screen_file_key` covers all slices extending DebateScreen. The `post_tark_vitark_file_key` (`156vPSsvB9PinDcxkM4Ffx`) is deprecated and abandoned.
- New-screen slices still create a new dedicated file for their screen — baseline duplication not required for brand-new screens.
- Cross-ref: Rule #65, AGENTS.md `Figma Baseline-Lock Policy`.

### Known Rule #72 — Owner Question Protocol (2026-04-09, amended 2026-04-10)
- All questions directed to the Product Owner must use the VS Code `vscode_askQuestions` tool.
- **Context in chat, choices in the tool.** Before invoking the tool, print the elaborated context, tradeoffs, and recommendation in the chat message. The tool call contains only concise choice labels and a short one-line `question` prompt.
- `allowFreeformInput` must always be `true` (the default — never override to false).
- `header` must be a short unique identifier (3–6 words). Batch related decisions into a single call.
- **Always set `recommended: true` on one option AND include `(Recommended)` in its `label` text** — both the JSON flag and the label text are required so the recommendation is visible regardless of how the VS Code UI renders the flag. Only omit if all options are genuinely cost-equivalent with no clear preference (must state this explicitly in chat context).
- Cross-ref: Rule #69, AGENTS.md `Owner Question Protocol`.

### Known Rule #70 — M3 UI Kit Import Limitation (2026-04-08)
- M3 Design Kit components configured as a Figma "UI Kit" (Assets panel → UI Kits) cannot be imported programmatically via `importComponentByKeyAsync`, `importComponentSetByKeyAsync`, or `figma.teamLibrary.getAvailableLibraryComponentsAsync()`. Only drag-and-drop from the Assets panel works.
- Applies to: any M3 Kit figure used in TV DS or slice files.
- Resolution: for any M3 Kit component needed programmatically (e.g., Button/Filled), create an M3-spec-compliant TV DS wrapper component that binds to the same DS variables. The wrapper lives in TV DS L2+L3, and slices import it from TV DS.
- This permanent limitation must NOT be worked around by bulk-recreation of M3 visuals. Wrapper must match visual spec (size, radius, variable binding) but is authored in TV DS, not cloned from M3 Kit.

### Known Rule #79 — UX Agent Eliminated: Orchestrator Absorbs UX Execution (Protocol 3.19, 2026-04-11)
- **Decision:** UX Agent eliminated. Orchestrator absorbs full UX execution and Figma write ownership directly.
- **Mechanism:** All Gate 3A work is performed by Orchestrator using the `ux-design-execution` skill (`.github/skills/ux-design-execution/SKILL.md`).
- **Scope:** Challenge Phase, UX Flow/State Package, Frame Blueprint, DS Component Coverage Declaration, Component Coverage Check, Baseline-Lock, Figma frame execution via MCP, Overlap Check, and `03-ux.md` artifact authoring — all Orchestrator-owned.
- **Files changed:** `AGENTS.md` (Protocol 3.18 → 3.19), `architect-orchestrator.agent.md` (tools + constraints + skill reference), `domain-ownership-governance/SKILL.md` (Universal Rules #1–#4, Orchestrator Rules #7–#10), `design-gate-orchestration/SKILL.md` (Substep A trigger, Gate 3B revision loop), `orchestrator-context.md` (Known Rules #41, #42, #43, #66, #67, #68, #76, #77, #78, current context; Implemented Agents entry deprecated), `ux.agent.md` (deprecated header added).
- **New skill created:** `.github/skills/ux-design-execution/SKILL.md` — full UX execution workflow transferred from `ux.agent.md`.
- **`ux.agent.md` status:** Deprecated. Content preserved as historical reference. Skill at `ux-design-execution/SKILL.md` is the canonical source.
- **Rationale:** Eliminates agent-to-agent delegation overhead for Gate 3A. Orchestrator now executes UX work with full Figma write access using the ux-design-execution skill, reducing context handoff cost and enabling tighter iteration loops with the Product Owner.

### Known Rule #81 — Branch Sync Protocol (2026-04-17)
- Canonical source: `.github/skills/pr-review-loop/SKILL.md` Section 4 (Branch Sync Protocol). Follow that section verbatim; this entry is a context pointer only and does not restate the rules locally.

### 2026-04-15 (post-tark-vitark Gate 3A — Pass 4 Composer Rebuild)
- Gate status: `post-tark-vitark` Gate 3A Pass 4 in progress. Composer bar rebuilt per PO direction. Gate 3B Design QA not yet started.
- Artifact changes: `docs/slices/post-tark-vitark/03-ux.md` — Pass 4 Amendment section added (Figma file migration notes, new active frame node IDs, Composer anatomy table, token binding table, native component rationale, updated Design Review Access links).
- Figma changes (all in `CsPAyUdLSStdmNpmiBMESQ`, Section 02 `399:78`):
  - File migrated to section model. Active frames: Light `304:2` (390×2463), Dark `414:78` (390×2515). Locked baseline clones at `403:78` (Light) and `403:114` (Dark).
  - Composer layout (PO direction): Segmented toggle (top, full width) → TextField + IconButton (bottom row). No TextField label.
  - DS `SegmentedControl` replaced with native `SegmentedToggle` (HORIZONTAL auto-layout pill, 358×48px, two segments with `layoutGrow=1`). Root cause: DS component inner frame `layoutMode:NONE`, hardcoded 207px — API-unresizable.
  - DS `TextField/Outlined` replaced with native outlined input frame (HORIZONTAL auto-layout, 310px `layoutGrow=1`, 56px tall, 1px outline stroke token-bound, Roboto Regular 16px placeholder). Root cause: DS component inner frame hardcoded 210px — API-unresizable.
  - DS `Divider/Horizontal` replaced with native 1px frame, DOM-positioned absolute at x=0,y=0, spanning full 390px Composer width. Root cause: DS component inner LINE hardcoded 320px — API-unresizable.
  - `SafeArea/Bottom` fill cleared (had near-white token fill visible against dark background).
  - `bottom-row` converted from `layoutMode:NONE` to HORIZONTAL auto-layout (`itemSpacing=8`, `counterAxisAlignItems=CENTER`); TextField `layoutGrow=1`.
- Open questions status: None.
- Known rule added: All three DS component replacement cases (SegmentedControl, TextField, Divider) confirmed same root pattern — M3 component inner containers have `layoutMode:NONE` with hardcoded dimensions, API-unresizable. Native rebuild with DS token bindings is the correct resolution. Doc pattern established in `03-ux.md` Pass 4 Amendment.
- Next micro-goal: Gate 3B Design QA — verify token accuracy on active frames `304:2` and `414:78`, then seek PO approval to close Gate 3.
- Blockers/owner decisions: PO visual approval of Pass 4 Composer pending before Gate 3 closes.

### 2026-04-16 (post-tark-vitark Gate 3 ✅ Closed — PR #83 Merged)
- Gate status: `post-tark-vitark` Gate 3 ✅ Pass. PR #83 merged to master. 11 Copilot review passes; all 20 review threads resolved with disposition replies. CI SUCCESS throughout.
- PR: https://github.com/nishantnaagnihotri/tark-vitark/pull/83
- Artifact changes: `02-prd.md` (PRD Amendment Protocol — Amendment 1 Read-more + Amendment 2 Composer with supersession clause); `03-ux.md` (SegCtrl→Chip/Filter in QG-5, audit date clarified, token ref corrected); `04-design-qa.md` (Scope Boundaries + AC-6 cite amendment numbers, both dark token blocks noted); `.github/skills/ux-design-execution/SKILL.md` (Design Quality Gate in schema item 13 + Step 11 section, pass/fail only, HTTPS sources); `.github/skills/requirement-prd-alignment/SKILL.md` (PRD Amendment Protocol section); `.github/skills/prd-gate-orchestration/SKILL.md` (PRD Amendment trigger rule).
- Open questions status: None blocking.
- Next micro-goal: Gate 4 (Architecture) for `post-tark-vitark` slice.
- Blockers/owner decisions: None. Product Owner merged PR #83.

### 2026-04-16 (post-tark-vitark Gate 4 ✅ Closed — PR #94 Merged)
- Gate status: `post-tark-vitark` Gate 4 ✅ Pass. PR #94 merged to master. 11 Copilot review passes (P1–P11); all review threads resolved with disposition replies. P11: clean 0-comment pass. CI SUCCESS throughout.
- PR: https://github.com/nishantnaagnihotri/tark-vitark/pull/94
- Branch: `docs/post-tark-vitark-architecture`
- Artifact changes: `docs/slices/post-tark-vitark/05-architecture.md` and `docs/slices/post-tark-vitark/06-tasks.md` created and merged.
- Key architecture decisions finalized: Podium fixed-bottom composer with `--podium-height: calc(187px + env(safe-area-inset-bottom, 0px))` on `:root`; native component builds for DS instances that cannot be resized via Plugin API (SegmentedControl, TextField, Divider); `onPublish: void` (synchronous in-memory, R-7); T-4 AC assertions reframed to CSS source assertion + Gate 5.5 runtime QA (jsdom does not apply external stylesheets).
- Open challenge disposition: `r3090426670` — Copilot suggested `onPublish: Promise<void>`; challenge posted (R-7: isBusy guard is synchronous in-memory, no async I/O). PR merged as-is → PO accepted challenge (keep `void`).
- Open questions status: None.
- Next micro-goal: Gate 5 — delegate tasks to Dev Agent. First batch (parallel-safe): T-1 (#86), T-2 (#87), T-6 (#91).
- Blockers/owner decisions: None. Product Owner merged PR #94.

### 2026-04-16 (post-tark-vitark Gate 5 ✅ Complete — T-1 through T-8 All Merged)
- Gate status: `post-tark-vitark` Gate 5 ✅ Complete. All 8 tasks and post-build fixes merged on the slice branch; merged to master via PR #109 on 2026-04-17.
- PRs merged (T-1 through T-8):
  - PR #96: feat(tokens): add `--color-on-surface-variant` + `--color-error` (closes #86)
  - PR #97: feat: extract `validatePost` pure utility (closes #87)
  - PR #104: feat: implement native `SegmentedControl` (closes #88) — reroll of stalled #99
  - PR #100: feat: implement `Podium` composer component (closes #89)
  - PR #101: test: add `Podium` accessibility tests (closes #93)
  - PR #102: feat: wire `Podium` into `DebateScreen` with publish state flow (closes #90)
  - PR #103: feat: add post-tark-vitark BDD Cucumber scenarios + step definitions (closes #92)
  - PR #98: feat: implement T-6 mobile clamp + Read More in `ArgumentCard` (closes #91)
- Post-build fix PRs:
  - PR #106: fix(theme-toggle): reposition to top on mobile/tablet to avoid Podium overlap
  - PR #108: fix: replace Podium `SegmentedControl` with inline `ChipFilter` pill (closes #107)
- Open questions status: None.
- Next micro-goal: Gate 5.5 Runtime QA → Gate 6.
- Blockers/owner decisions: None (stacked merge authorized by PO via PR merge actions).

### 2026-04-17 (post-tark-vitark Gate 5.5 Runtime QA → Issue #110 Found → PR #111 + PR #112 → Gate 6 ✅ Complete)
- Gate status: `post-tark-vitark` Gate 6 ✅ Complete. Slice fully delivered and merged to master.
- Stacked slice merge: PR #109 (`feat(post-tark-vitark): merge slice into master`) merged 2026-04-17. master HEAD: `0831c74`.
- Gate 5.5 Runtime QA findings: Issue #110 — Podium chip `aria-label` describes current state (`"Tark"` / `"Vitark"`) instead of action. Screen reader announces a changing control name/state interaction; WCAG 4.1.2 (Name, Role, Value) concern.
- Gate 5.5 post-QA fix PRs:
  - PR #111: fix(theme-toggle): reposition to top-right on mobile/tablet (overlap correction). Merged 2026-04-17.
  - PR #112: fix(a11y): Podium chip `role="switch"` + static `aria-label="Post as Tark"` + `aria-checked`. Closes #110. Merged 2026-04-17T02:39:40Z.
- Final implementation decision (OQ-1 in PR #112): static `aria-label="Post as Tark"` — matches `ThemeToggle` `"Dark mode"` pattern; state differentiation via `aria-checked`. Copilot review loop: R1→R4. R1 suggested static label; R2 flagged dynamic label; R3 challenged switch semantics; R4 (static label commit `2a03fe4`): "generated 0 comments" — exit condition met.
- Follow-up required (WCAG 2.5.3 Label in Name): chip visible text toggles between `"Tark"` / `"Vitark"` while `aria-label` stays `"Post as Tark"` — in the Vitark state the accessible name does not contain the visible label. Resolve in a follow-up slice by making `aria-label` dynamic (e.g. `"Post as Tark"` / `"Post as Vitark"`) or making the visible chip label static. Tracked as Issue #116: https://github.com/nishantnaagnihotri/tark-vitark/issues/116
- Test result: 263/263 passing on merged commit `2a03fe4`.
- Open questions status: None.
- Next micro-goal: context-update PR (this entry) + then start next slice intake.
- Blockers/owner decisions: None. Product Owner merged PR #112 to master.

### 2026-04-17 (Global — Skill Hardening PR #115 Merged)
- Gate status: No active slice. Skill/workflow hardening task complete.
- PR: https://github.com/nishantnaagnihotri/tark-vitark/pull/115
- Issue: https://github.com/nishantnaagnihotri/tark-vitark/issues/114
- Artifact changes:
  - `.github/skills/ux-design-execution/SKILL.md` — 5 gaps hardened: Step 3B pre-flight scan (detect stale `[IN PROGRESS]` marker before starting), blocked-state persistence (`gate-status: BLOCKED_AWAITING_PO` marker protocol), MCP read-back consistency table (QG-6 Q10, single canonical `[TOKEN LIST FETCH]` per gate run), cross-screen reuse enumeration (explicit page+section reference format), token fresh-fetch with timestamp logging. Copilot review fixes across passes 4–7: path typo, double-fetch resolution, 3-state baseline classification, fenced-block indentation.
  - `.github/skills/pr-review-loop/SKILL.md` — 3 gaps + Branch Sync Protocol hardened: Gap 6 (review loop auto-entry on multi-step workflow PR), Gap 7 (mandatory thread replies before push — Section 1B checklist, rule 1.7, rule 3.2 pre-push gate), Gap 8 (review-request + polling as atomic sequence — rule 3.8 rewrite, `[REVIEW REQUESTED] → [POLLING STARTED]` log entry), Section 4 Branch Sync Protocol (6 rules covering stale-branch detection, rebase procedure, head-SHA change → fresh review, linear history preference, conflict escalation, and check frequency). Final document section order: 1 → 1B → 2 → 3 → 4.
  - `.github/agents/architect-orchestrator.agent.md` — Standing review-loop rule #4 updated: after any PR is opened as the last step of a multi-step workflow or todo list, immediately load pr-review-loop skill and execute atomic entry sequence (request review → start polling → intake triage).
- Copilot review loop: 8 passes total (commit a83b7fa). Pass 8 "generated no new comments" — clean exit condition met. Branch rebased onto master and synced before merge-ready declaration (Branch Sync Protocol Section 4 enforced).
- Open questions status: None.
- Next micro-goal: Start next slice intake or governance task.
- Known Rules added: #81 (Branch Sync Protocol — context pointer to pr-review-loop Section 4).
