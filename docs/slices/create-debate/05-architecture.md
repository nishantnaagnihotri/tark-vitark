# Architecture Plan - create-debate
## Gate 4 Artifact - 2026-04-27

---

## 1. Architecture Readiness

**Ready**

Gate 3 artifacts are sufficient to freeze build direction. The two deferred decisions are now closed at Gate 4:

- **OQ-2** resolves to **trimmed canonical topic semantics**.
- **OQ-3** resolves to **fail-closed storage behavior with no in-memory fallback**.

No remaining Must Resolve gap blocks Build.

---

## 2. Architecture Plan

### 2.1 Architectural Pattern

Keep the existing single-screen React pattern and refactor `src/components/DebateScreen.tsx` into the sole page-level state owner. Display components remain prop-driven; persistence, mode switching, and mutation orchestration stay in the screen container. No Context, reducer, or global store is required for one device-local debate.

### 2.2 Frozen Gate 4 Decisions

| Decision | Chosen contract | Rationale |
|---|---|---|
| Topic validation semantics | Validation, counter state, Start enablement, and persisted topic all use the **trimmed canonical topic length**. The form may keep raw input locally for editing, but it submits only the trimmed topic. | Prevents whitespace padding from bypassing the minimum, keeps the validated value equal to the saved value, and aligns with the repo's existing trimmed validation pattern in the Podium flow. |
| localStorage fallback | **No in-memory fallback.** Read failures or corrupt payloads resolve to empty state without a crash. Write failures abort the action, keep the current UI state unchanged, and surface an inline error on the existing form or sheet surface. | A silent session-only fallback would violate the persistence promise, and Gate 3 did not authorize a separate storage-error screen. |
| Persistence model | Persist one versioned JSON record under the single key `tark-vitark:active-debate`. Create, replace, and argument append each rewrite the full record. | One-key writes make AC-34 atomic, simplify AC-39 corruption recovery, and avoid split-key partial-state bugs. |
| Schema validation | Use a small manual runtime guard in the storage adapter, not zod in client code. | The repo does not currently use zod at runtime, and manual guards keep the runtime surface explicit. |
| Active debate chrome | Build a screen-local active header with topic, theme action, and one-item overflow menu. Do not introduce a generic TopAppBar or Menu abstraction in this slice. | The repo has no reusable header or menu abstraction today, and this slice needs only one menu action. |
| Theme toggle placement | Move the existing theme control into the active-debate header actions. Empty state remains headerless and does not get a floating theme control. | Gate 3 frames are authoritative: empty state has no header, while active debate frames include header icon chrome and Design QA carried a 44x44 touch-target advisory for interactive icons. |
| Seeded data removal | Final target state removes the runtime `DEBATE` constant from `src/data/debate.ts`. Any sample debate content needed for tests moves to test-only fixtures outside `src`. | Required by AC-37 and by the domain shift from seeded demo debate to device-owned active debate. |

### 2.3 Module Responsibilities

| Surface | Responsibility | File impact |
|---|---|---|
| Debate screen container | Owns `activeDebate`, `storageStatus`, `selectedSide`, replace-mode state, overflow state, FAB state, and bottom-sheet state. Applies persistence results and decides which screen mode renders. | Major refactor in `src/components/DebateScreen.tsx` |
| Debate types | Export `Side`, `Argument`, `ActiveDebate`, and stored-record types. Final state is types-only, not seeded runtime content. | Modify `src/data/debate.ts` |
| Active-debate storage adapter | Safe load, safe save, replace, append, invalid-payload cleanup, and storage-availability reporting. | New storage adapter under `src/lib/` |
| Topic validation | Pure trimmed-topic validation for create and replace forms; returns canonical length and too-short or too-long state. | New validation utility under `src/lib/` |
| Shared topic form | Reusable form for both empty-state create and replace flow; owns real-time validation boundary and submits canonical trimmed topic only. | New form component under `src/components/` plus screen-local CSS |
| Empty-state wrapper | Headerless empty state using the TV mark, topic field, counter, and Start button. | New wrapper component under `src/components/` plus screen-local CSS |
| Active-debate header | Topic-at-top header with integrated `ThemeToggle` action and overflow trigger for New Debate. | New header component plus modifications to `src/components/ThemeToggle.tsx` and `src/styles/components/theme-toggle.css` |
| Reused display stack | Topic, legend, timeline, and argument cards remain display-only and should not absorb persistence logic. | Reuse `src/components/Topic.tsx`, `src/components/LegendBar.tsx`, `src/components/Timeline.tsx`, `src/components/ArgumentCard.tsx` |
| Reused Podium surfaces | FAB and bottom sheet remain child components; parent decides when they exist, and publish becomes persisted rather than local-only. | Reuse `src/components/PodiumFAB.tsx` and `src/components/PodiumBottomSheet.tsx` with parent-driven contract changes |

### 2.4 Data Contracts

| Entity | Fields | Notes |
|---|---|---|
| `ActiveDebate` | `topic`, `arguments` | In-memory screen state |
| `StoredActiveDebateRecord` | `version`, `topic`, `arguments` | Version starts at `1` |
| `Argument` | `id`, `side`, `text` | `id` is monotonic within the current debate; replace resets the first new argument to `1` |
| `storageStatus` | `available` or `unavailable` | Screen-only fault-state signal |

### 2.5 Screen Modes

| Mode | Render contract | Mutation contract |
|---|---|---|
| Empty | No header, no legend, no timeline, and no Podium. Render the empty-state topic form and TV mark only. | Successful create writes a fresh record with topic and empty arguments, then transitions to active mode. |
| Active | Render header chrome, legend, timeline, and Podium access. | Podium publish appends to the active debate only after persistence succeeds. |
| Replace | Render the replace-form variant as a screen-local mode; keep the current active debate intact until submit succeeds; hide Podium while replace mode is open. | Cancel drops the draft and returns to the existing active debate. Submit writes a fresh record with the new topic and empty arguments, then returns to active mode with `selectedSide` reset to `tark`. |

### 2.6 Domain Glossary to Code Mapping

| Glossary term | Code identifier |
|---|---|
| Debate | `ActiveDebate` type, `DebateScreen` component |
| Topic | `topic` field, `validateTopic` utility, shared topic-form component |
| Tark | `Side` value `tark`, `selectedSide` state |
| Vitark | `Side` value `vitark`, `selectedSide` state |
| Argument | `Argument` type, `appendArgument` action, `Timeline` props |
| Podium | Existing `PodiumFAB` and `PodiumBottomSheet` components |
| Empty State | `EmptyDebateState` component and empty screen mode |
| Active Debate | `activeDebate` state and stored active-debate record |
| Replace Flow | replace-mode state, `startReplaceFlow` action, `cancelReplaceFlow` action |
| localStorage | active-debate storage adapter and `storageStatus` |
| Device | Browser storage scope only; no separate runtime type |

### 2.7 Figma Authority

Authoritative Figma nodes for Build:

| State | Node |
|---|---|
| EmptyState/Light/Mobile | `837:456` |
| EmptyState/Dark/Mobile | `890:457` |
| InputValid/Light/Mobile | `892:458` |
| InputValid/Dark/Mobile | `893:459` |
| InputTooLong/Light/Mobile | `895:460` |
| InputTooLong/Dark/Mobile | `896:461` |
| ReplaceFlow/Light/Mobile | `897:462` |
| ReplaceFlow/Dark/Mobile | `898:463` |
| Replace warning text | `897:475`, `898:475` |
| Replace Cancel instances | `977:481`, `977:483` |
| EmptyState/Light/Tablet | `925:494` |
| EmptyState/Dark/Tablet | `925:507` |
| EmptyState/Light/Desktop | `926:496` |
| EmptyState/Dark/Desktop | `926:509` |
| ActiveDebate/Default/Light/Mobile | `947:476` |
| ActiveDebate/Default/Dark/Mobile | `947:521` |

---

## 3. Impact Analysis

The heaviest runtime impact is concentrated in `src/components/DebateScreen.tsx`, `src/data/debate.ts`, `src/components/ThemeToggle.tsx`, `src/styles/debate-screen.css`, and `src/styles/components/theme-toggle.css`.

The display stack in `src/components/Topic.tsx`, `src/components/LegendBar.tsx`, `src/components/Timeline.tsx`, and `src/components/ArgumentCard.tsx` should remain reusable and storage-agnostic.

The current regression surface is broad because tests and BDD flows assume a seeded initial debate and immediate Podium access.

Highest-impact existing test files:

- `tests/components/DebateScreen.test.tsx`
- `tests/debate.test.ts`
- `tests/a11y/landmarks.test.tsx`
- `tests/a11y/debate-screen-a11y.test.tsx`
- `tests/components/PodiumBottomSheet.test.tsx`
- `tests/components/PodiumFAB.test.tsx`
- `tests/components/ThemeToggle.test.tsx`

Highest-impact BDD files:

- `features/post-tark-vitark.feature`
- `features/debate-screen-polish.feature`
- `features/step-definitions/post-tark-vitark.steps.ts`
- `features/step-definitions/debate-screen-polish.steps.ts`

---

## 4. Risk and Mitigation Plan

| ID | Risk | Why it matters | Mitigation |
|---|---|---|---|
| R-1 | Split-key persistence would make replace non-atomic | AC-34 requires topic replacement and argument wipe to behave as one action | Persist the full debate record under one key and rewrite the full object on each mutation |
| R-2 | Silent in-memory fallback would mislead the user | A debate would appear real but disappear on reload | Do not fall back to memory; failed writes return inline errors and leave state unchanged |
| R-3 | Corrupt JSON or schema drift could crash boot | AC-39 requires graceful empty-state recovery | Guard JSON parse and shape, remove invalid payload when possible, and return empty state |
| R-4 | Theme toggle and overflow chrome are currently off-spec | Current `ThemeToggle` is floating, but active frames show header actions | Move theme control into active header only and enforce at least 44x44 touch target |
| R-5 | `DebateScreen` refactor is merge-prone | The same file currently owns almost every behavior that changes | Isolate storage, topic form, and header chrome first; merge `DebateScreen` integration tasks sequentially |
| R-6 | Legacy tests depend on seeded runtime content | The slice deletes that content from `src` | Move sample debate data into test-only fixtures and update scenarios to preload active debate in storage |
| R-7 | Larger-view active and replace states were not authored as new Gate 3 frames | Only empty state has tablet and desktop create-debate frames | Keep mobile-only replace and input fidelity anchored to Gate 3, and require runtime QA on tablet and desktop using the existing approved baseline layout |
| R-8 | Storage-error copy is not frame-authored | Figma only covers the no-crash floor, not a dedicated write-error state | Reuse existing inline helper or alert regions without inventing a new modal or layout |

Rollback is clean: the slice introduces one new localStorage key and no migration from prior persisted debate data is required because the seeded debate never lived in storage. Reverting the slice leaves the key inert, and older builds simply ignore it.

---

## 5. Verification Strategy

| AC | Primary automated evidence | Runtime QA evidence |
|---|---|---|
| AC-29 | `DebateScreen` tests assert empty-state render with no legend, no timeline, and no Podium when no active debate is stored; topic-form tests cover the inline form structure | Compare against `837:456`, `890:457`, `925:494`, `925:507`, `926:496`, `926:509` |
| AC-30 | Topic-validation unit tests plus topic-form tests for counter updates, disabled Start under 10, enabled Start for 10-120, and visible error only over 120 | Compare against `892:458`, `893:459`, `895:460`, `896:461` |
| AC-31 | Storage-adapter unit tests plus `DebateScreen` integration tests for create success and reload into active state | Verify empty-to-active transition against `947:476` and `947:521` |
| AC-32 | `DebateScreen` integration tests for Podium absence in empty mode and presence after create | Verify Podium is not reachable from empty state and is operable immediately after create |
| AC-33 | Storage-adapter tests for append persistence plus reload tests; migrated post feature preloads active debate via storage instead of seeded data | Runtime QA creates a debate, publishes arguments, reloads, and confirms timeline restoration |
| AC-34 | Active-header tests for overflow trigger and one-item menu wiring; `DebateScreen` integration tests for successful replace and cleared arguments | Compare replace flow against `897:462` and `898:463`, then confirm return to `947:476` and `947:521` |
| AC-35 | Replace-mode topic-form tests for Cancel behavior and `DebateScreen` tests proving prior topic and arguments remain unchanged after cancel | Verify Cancel affordance against `977:481` and `977:483` |
| AC-36 | Header tests assert there is no standalone clear action in any mode | Runtime QA confirms the menu exposes only New Debate and no clear action |
| AC-37 | Source-level review confirms runtime `DEBATE` removal from `src/data/debate.ts`; initial-render tests prove the app no longer shows seeded content on first load | Gate 5 review includes repo search for remaining runtime seed references under `src` |
| AC-38 | Storage-adapter and `DebateScreen` tests append multiple arguments without cap logic; old count-based seed tests are replaced | Runtime QA posts repeatedly and confirms the timeline continues to grow |
| AC-39 | Storage-adapter tests cover unavailable storage and corrupt payloads; render tests prove empty-state fallback and no throw | Runtime QA simulates broken storage if feasible; otherwise rely on automated adapter coverage |
| AC-40 | Replace-mode topic-form tests assert the inline warning is rendered and that no blocking dialog appears | Verify warning placement against `897:475` and `898:475` |

Gate 5 validation must run:

1. `npm run test`
2. `npm run test:bdd`
3. `npm run typecheck`
4. Gate 5.5 runtime QA against the approved frame matrix

---

## 6. Task Decomposition

| Task | Scope | Likely files | Likely tests | AC focus | Dependencies | Parallelism |
|---|---|---|---|---|---|---|
| T1 - active-debate storage foundation | Add the versioned active-debate record and guarded storage adapter while keeping the runtime green during transition | `src/data/debate.ts`; new adapter under `src/lib/`; shared fixtures under `tests/` and feature support | `tests/debate.test.ts`; new storage unit coverage for load, save, replace, corrupt payloads, unavailable storage, and uncapped append | AC-33, AC-34, AC-37, AC-38, AC-39 | None | Can run in parallel with T2 |
| T2 - shared topic form and topic validation | Implement the trimmed-topic validation utility and the reusable form used by both empty-state create and replace flow, including warning and Cancel variants | New validation utility under `src/lib/`; new topic-form and empty-state components under `src/components/`; screen-local CSS | New topic-validation unit tests and topic-form component tests | AC-29, AC-30, AC-31, AC-35, AC-40 | None | Can run in parallel with T1 |
| T3 - active header chrome | Add the active-debate header, integrate a header variant of `ThemeToggle`, and add the overflow trigger for New Debate without yet changing the full screen state machine | `src/components/ThemeToggle.tsx`; `src/styles/components/theme-toggle.css`; new active-header component and CSS | Header tests plus `ThemeToggle` placement and touch-target updates | AC-34, AC-36 | None at code level, but should merge after T1 and T2 | Can be prepared in parallel; merge after T1 and T2 |
| T4 - DebateScreen empty-state and create integration | Refactor `DebateScreen` to load storage on boot, render headerless empty state when no debate exists, create a persisted debate from the shared topic form, and stop using seeded src runtime content on first render | `src/components/DebateScreen.tsx`; `src/styles/debate-screen.css`; `tests/components/DebateScreen.test.tsx`; `tests/a11y/landmarks.test.tsx`; `tests/a11y/debate-screen-a11y.test.tsx` | Updated `DebateScreen` and a11y integration tests | AC-29, AC-31, AC-32, AC-37, AC-39 | T1 and T2 | Sequential |
| T5 - replace-flow integration | Wire the active-header overflow trigger into replace mode, keep the current active debate intact until save succeeds, support explicit Cancel, and atomically replace topic plus arguments on submit | `src/components/DebateScreen.tsx`; `src/styles/debate-screen.css`; `tests/components/DebateScreen.test.tsx` | Replace-flow feature coverage and component assertions for warning and menu wiring | AC-34, AC-35, AC-36, AC-40 | T3 and T4 | Sequential only |
| T6 - persisted Podium publish and no-cap behavior | Replace the current `localPosts` path with persisted active-debate append, gate Podium presence behind active debate existence, and keep publish failures fail-closed when storage is unavailable | `src/components/DebateScreen.tsx`; `src/components/PodiumBottomSheet.tsx`; `src/components/PodiumFAB.tsx`; `tests/components/DebateScreen.test.tsx`; `tests/components/PodiumBottomSheet.test.tsx`; `tests/components/PodiumFAB.test.tsx` | Updated screen and Podium tests | AC-32, AC-33, AC-38, AC-39 | T1 and T4 | Sequential only |
| T7 - acceptance and regression migration | Add the new create-debate feature and step definitions, migrate old post and polish scenarios to preload an active debate in storage, and remove remaining runtime-seed assumptions from tests | `features/post-tark-vitark.feature`; `features/debate-screen-polish.feature`; `features/step-definitions/post-tark-vitark.steps.ts`; `features/step-definitions/debate-screen-polish.steps.ts`; `tests/debate.test.ts`; `tests/a11y/landmarks.test.tsx`; new create-debate feature and step definitions | New feature coverage plus migrated regression tests | AC-29 through AC-40 traceability and AC-37 regression safety | T4 through T6 | Last |

**Best dispatcher A/B candidate:** **T2 - shared topic form and topic validation.**

It is the smallest representative task because it naturally exists in the architecture, touches real React component work and CSS token usage, exercises the two newly closed Gate 4 decisions at the form boundary, requires focused unit and component tests, and avoids the same-file merge churn of the larger `src/components/DebateScreen.tsx` refactor.

---

## 7. Quality Gaps

No blocking architecture gap remains.

Non-blocking cautions to carry into Build:

1. Legacy post wording persists in older Podium code and historical feature files; new slice-owned code should not extend that naming.
2. Tablet and desktop create-debate fidelity exists only for empty state; active and replace larger-view behavior inherits the approved baseline layout and must be verified in runtime QA.
3. Storage-write error copy is not frame-authored; implementation must reuse existing inline helper or alert space without inventing a new modal or layout state.

---

## 8. Open Questions

None.

OQ-2 is closed to trimmed canonical topic semantics. OQ-3 is closed to fail-closed localStorage behavior with no in-memory fallback.

---

## 9. Gate Decision

**Can proceed to build.**

The architecture is implementation-ready, dependency-ordered, and testable, and the remaining cautions are accepted non-blockers rather than Build blockers.

---

## 10. Architecture Plan Package

- Slice: `create-debate`
- Readiness: `Ready`
- Closed architecture decisions: trimmed canonical topic semantics; single-key versioned active-debate persistence; no in-memory fallback; screen-local active header and overflow menu; header-only theme control in active mode; no runtime seeded debate content under `src`
- Primary module owners: `src/components/DebateScreen.tsx` as the stateful container; `src/data/debate.ts` as the types contract; new storage and topic-validation utilities under `src/lib/`; new shared topic-form and active-header components under `src/components/`; reused `PodiumFAB`, `PodiumBottomSheet`, `Topic`, `LegendBar`, and `Timeline`
- Authoritative Figma set for Build: empty state `837:456`, `890:457`, `925:494`, `925:507`, `926:496`, `926:509`; validation states `892:458`, `893:459`, `895:460`, `896:461`; replace flow `897:462` and `898:463` with warning nodes `897:475` and `898:475` and Cancel nodes `977:481` and `977:483`; active debate mobile chrome `947:476` and `947:521`
- Build sequencing: T1 and T2 can run in parallel; T3 can be prepared in parallel but should merge after T1 and T2; T4, T5, and T6 should merge sequentially because they overlap the screen container; T7 closes the regression and traceability loop
- Required evidence before Gate 5.5 close: `npm run test`, `npm run test:bdd`, `npm run typecheck`, then runtime QA against the approved frame matrix
- Best single Gate 5 issue for the dispatcher A/B replacement test: T2, shared topic form and topic validation