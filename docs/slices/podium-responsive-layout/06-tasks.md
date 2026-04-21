# Task Decomposition — podium-responsive-layout
## Gate 5 Artifact — 2026-04-21

---

## Slice Closeout Snapshot

- Gate 5 completed: Tasks A-F were implemented and merged to `slice/podium-responsive-layout`.
- Gate 5.5 completed: Runtime QA verdict closed as `REVISED PASS` after orchestrator investigation confirmed the reported AC-27 and AC-28 findings were invalid and the favicon 404 was non-blocking.
- Gate 6 completed: slice PR [#190](https://github.com/nishantnaagnihotri/tark-vitark/pull/190) merged to `master`.
- Final evidence: 311 unit tests passed, 28 BDD scenarios passed, and Copilot's latest review on the final PR head reported no new comments.

---

## Phase 1 — Parallel Implementation

All Phase 1 tasks target branch `slice/podium-responsive-layout` via individual PRs from task-specific branches.

| Task | Issue | Title | Labels | Target branch |
|---|---|---|---|---|
| A | [#177](https://github.com/nishantnaagnihotri/tark-vitark/issues/177) | Remove DebateScreen isMobile conditional | `slice:podium-responsive-layout`, `type:feature` | `slice/podium-responsive-layout` |
| B | [#178](https://github.com/nishantnaagnihotri/tark-vitark/issues/178) | podium-fab.css tablet and desktop breakpoints | `slice:podium-responsive-layout`, `type:feature` | `slice/podium-responsive-layout` |
| C | [#179](https://github.com/nishantnaagnihotri/tark-vitark/issues/179) | podium-bottom-sheet.css max-width and scrim breakpoints | `slice:podium-responsive-layout`, `type:feature` | `slice/podium-responsive-layout` |
| D | [#180](https://github.com/nishantnaagnihotri/tark-vitark/issues/180) | IS-3 comment reclassification (4 CSS files) | `slice:podium-responsive-layout`, `type:chore` | `slice/podium-responsive-layout` |
| E | [#181](https://github.com/nishantnaagnihotri/tark-vitark/issues/181) | IS-1 mobile colour token fix | `slice:podium-responsive-layout`, `type:bug` | `slice/podium-responsive-layout` |

---

## Phase 2 — Sequential (after all Phase 1 PRs merged)

| Task | Issue | Title | Labels | Target branch |
|---|---|---|---|---|
| F | [#182](https://github.com/nishantnaagnihotri/tark-vitark/issues/182) | BDD feature file + unit tests | `slice:podium-responsive-layout`, `type:test` | `slice/podium-responsive-layout` |

---

## Acceptance Criteria Traceability

| AC | Gate 1 | Gate 2 | Covered by tasks |
|---|---|---|---|
| AC-25 | requirement.md §Amendments | prd.md FR-5 | B, C, F |
| AC-26 | requirement.md §Amendments | prd.md FR-6 | B, C, F |
| AC-27 | requirement.md AC-27 | prd.md AC-27 | A, F |
| AC-28 | requirement.md AC-28 | prd.md AC-28 | D, F |
| AC-29 | requirement.md §Amendments | prd.md FR-5 | B, C, F |
| AC-30 | requirement.md §Amendments | prd.md FR-6 | B, C, F |

---

## Figma Source Traceability

| Figma section | Node |
|---|---|
| `05-podium-responsive-layout [APPROVED]` | `747:356` |
| [Design review frame](https://www.figma.com/design/CsPAyUdLSStdmNpmiBMESQ?node-id=747-356) | runtime-preview |

---

## Gate History

| Gate | Artifact | Status |
|---|---|---|
| Gate 1 | `01-requirement.md` | ✅ Closed |
| Gate 2 | `02-prd.md` | ✅ Closed |
| Gate 3A | `03-ux.md` | ✅ Closed |
| Gate 3B | `04-design-qa.md` | ✅ CONDITIONAL PASS |
| Gate 4 | `05-architecture.md` | ✅ Closed — PROCEED |
| Gate 5 | `06-tasks.md` (this file) | ✅ Complete — implementation tasks A-F merged to slice branch |
| Gate 5.5 | Runtime QA verdict | ✅ REVISED PASS |
| Gate 6 | Merge recommendation | ✅ Complete — PR [#190](https://github.com/nishantnaagnihotri/tark-vitark/pull/190) merged to `master` |
