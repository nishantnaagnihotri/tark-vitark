# Gate 2 — PRD — create-debate

**Date:** 2026-04-23
**PRD Version:** v0
**Slice:** `create-debate`
**Source Contract:** `docs/slices/create-debate/01-requirement.md` (Gate 1 ✅ Pass 2026-04-23)

---

## PRD Readiness

**Ready** — all 11 Gate 1 AC IDs are mapped one-to-one, scope boundaries are preserved without drift, and all open questions carry non-empty downstream resolutions.

---

## 1. Problem Statement and Expected Outcome

The landing page currently behaves as a static demo because it always renders a fixed hardcoded debate and seeded arguments. This slice turns the page into a device-local, user-owned debate space.

Expected outcome: a first-time visitor lands on an empty state, creates a debate topic, gains access to the Podium composer, posts Tark and Vitark arguments, and later returns on the same device to find the topic and arguments restored from localStorage. If the visitor starts a new debate, the current topic and all current arguments are atomically replaced with a fresh debate state.

---

## 2. Target Users and Primary Scenarios

| User | Scenario |
|---|---|
| First-time visitor | Lands on an empty state, creates a topic, and posts arguments via the Podium. |
| Returning visitor on the same device | Reloads or revisits and sees the previously created topic and arguments restored from localStorage. |
| Visitor replacing an active debate | Initiates a new debate while one is active, completes the flow, and lands in a fresh debate with zero carried-over arguments. |

---

## 3. In-Scope and Out-of-Scope

**In-scope:**

| ID | Item |
|---|---|
| IS-1 | Remove the hardcoded `DEBATE` constant and all seeded runtime content. |
| IS-2 | Render an empty state when no active debate exists in localStorage. |
| IS-3 | Allow creation of one active debate topic per browser-storage context. |
| IS-4 | Persist debate topic and all posted arguments in localStorage. |
| IS-5 | Gate Podium availability behind the existence of an active debate. |
| IS-6 | Support debate replacement that atomically overwrites the topic and clears all persisted arguments. |
| IS-7 | Migrate tests and step definitions away from hardcoded `DEBATE` assumptions. |

**Out-of-scope:**

| ID | Item |
|---|---|
| OOS-1 | Cross-device sync or backend persistence. |
| OOS-2 | Multiple concurrent debates or debate history. |
| OOS-3 | Authentication, ownership, or collaboration. |
| OOS-4 | Editing or deleting individual arguments. |
| OOS-5 | Standalone clear-to-empty-state action. |
| OOS-6 | Navigation to a new route or screen for this slice. |

---

## 4. Functional Requirements

| ID | Requirement | Priority | Acceptance Criteria |
|---|---|---|---|
| FR-1 | When no active debate exists in localStorage, the landing page shall render an empty state with a debate-creation affordance. | Must | AC-29 |
| FR-2 | The Podium composer shall be absent and unreachable when no active debate exists, and shall become visible and operable after a debate is created. | Must | AC-32 |
| FR-3 | There shall be no standalone in-app action to clear an active debate to an empty state. | Must | AC-36 |
| FR-4 | The debate topic input shall enforce a minimum of 10 and a maximum of 120 characters with a visible validation error on rejection. | Must | AC-30 |
| FR-5 | Submitting a valid topic shall create an active debate, persist the topic to localStorage, and transition the UI from empty state to active debate view. | Must | AC-31 |
| FR-6 | Arguments posted to a debate shall persist to localStorage and be restored into the timeline on subsequent page loads on the same device. | Must | AC-33 |
| FR-7 | A visitor shall be able to initiate a new debate while one is active; completing that flow shall atomically overwrite the current topic and delete all current arguments from localStorage and the timeline. | Must | AC-34 |
| FR-8 | Abandoning the new-debate flow before completion shall leave the current debate topic and all existing arguments fully intact. | Must | AC-35 |
| FR-9 | The hardcoded `DEBATE` constant and all seeded posts shall be removed from the codebase and the production render path. | Must | AC-37 |
| FR-10 | No maximum argument count shall be enforced in this slice. | Must | AC-38 |
| FR-11 | If localStorage is unavailable or returns corrupted data, the app shall render the empty state without throwing a runtime error. | Must | AC-39 |
| FR-12 | When the user initiates a new debate while one is active, the replace form shall display an inline warning in the topic input area informing the user that proceeding will replace the current topic and delete all existing arguments; no blocking confirmation dialog shall be shown. | Must | AC-40 |

---

## 5. Constraints and Non-Goals

| ID | Constraint / Non-Goal |
|---|---|
| C-1 | localStorage is the only persistence layer in this slice. |
| C-2 | One active debate exists per browser-storage context at a time. |
| C-3 | Topic character-count rule is 10 to 120; trimmed-vs-raw evaluation is deferred to Gate 4. |
| C-4 | No argument count cap is enforced. |
| C-5 | UX owns the exact interaction patterns for creation and replacement at Gate 3. |
| C-6 | Accessibility baseline must not regress. |
| C-7 | No backend, no authentication, and no cross-device sync are introduced in this slice. |

---

## 6. Success Metrics

| ID | Metric | Measurement Method |
|---|---|---|
| SM-1 | First-time visitor can create a topic and post arguments. | Empty state -> create -> post journey |
| SM-2 | Topic and arguments survive page reload on the same device. | Reload and verify restored state |
| SM-3 | Replace flow completes with zero carried-over arguments. | Replace journey verification |
| SM-4 | Abandoning replace leaves the current debate intact. | Start replace -> cancel -> verify prior state |
| SM-5 | Podium is absent before debate creation and present after. | State transition verification |
| SM-6 | localStorage failure or corruption renders a graceful empty state. | Failure-path verification |
| SM-7 | No hardcoded `DEBATE` runtime content remains. | Static analysis + runtime render verification |

---

## 7. Acceptance Criteria

**Acceptance Criteria source:** [01-requirement.md](01-requirement.md) (current). The executable feature file `features/create-debate.feature` does not exist yet; it will be generated at Gate 5 (Build).

In-scope AC IDs for this slice: **AC-29, AC-30, AC-31, AC-32, AC-33, AC-34, AC-35, AC-36, AC-37, AC-38, AC-39, AC-40**.

AC prose remains authored in [01-requirement.md](01-requirement.md). This PRD references AC IDs only to prevent drift.

---

## 8. Dependencies and Risks

| Type | Item | Mitigation |
|---|---|---|
| Dependency | Browser `localStorage` API | FR-11 sets the graceful-degradation floor; full fallback contract deferred to Gate 4. |
| Dependency | Existing Podium posting flow | Gate 4 defines the gating contract between debate existence and Podium availability. |
| Dependency | Existing tests and BDD steps reference `DEBATE` | IS-7 keeps migration in-scope for Gate 5. |
| Risk | Trimmed-vs-raw validation rule may shift FR-4 boundary tests | Gate 4 must decide and record the binding contract before build. |
| Risk | FR-7 atomic replace could create partial state if write strategy is weak | Gate 4 must define the atomic write strategy. |

---

## 9. Open Questions

| ID | Question | Source | Status | Resolution |
|---|---|---|---|---|
| OQ-1 | Should the replace flow include a confirmation or warning guard before wiping the active debate? | Gate 1 accepted OQ | Resolved | Resolved at Gate 3 — PO decision: inline warning displayed in the topic input area of the replace form; no blocking confirmation dialog. Implemented via AC-40. (2026-04-25; 03-ux.md Checkpoint 10) |
| OQ-2 | Does the 10–120 character topic validation apply to the trimmed string or the raw string as entered? | Gate 1 accepted OQ | Unresolved — Non-Blocking | Default assumption is raw character count until Gate 4 chooses and records the contract. Must resolve before Gate 5. |
| OQ-3 | What is the full fallback contract when localStorage is unavailable or corrupted? | Gate 1 accepted OQ | Unresolved — Non-Blocking | AC-39 is the minimum floor: graceful empty state and no runtime error. Extended fallback behavior is deferred to Gate 4. Must resolve before Gate 5. |

---

## 10. Requirement-to-PRD Alignment Check

| Gate 1 Source | PRD Section / FR | Status |
|---|---|---|
| Requirement statement — empty state when no debate | FR-1 | ✅ Mapped |
| Requirement statement — one active debate per device | IS-3, C-2 | ✅ Mapped |
| Requirement statement — 10 to 120 character topic | FR-4, C-3 | ✅ Mapped |
| Requirement statement — topic persists in localStorage | FR-5 | ✅ Mapped |
| Requirement statement — arguments persist in localStorage | FR-6 | ✅ Mapped |
| Requirement statement — Podium gated on debate existence | FR-2 | ✅ Mapped |
| Requirement statement — replacement wipes current debate | FR-7, FR-8 | ✅ Mapped |
| Requirement statement — no argument count cap | FR-10, C-4 | ✅ Mapped |
| Requirement statement — no standalone clear action | FR-3 | ✅ Mapped |
| Requirement statement — hardcoded debate removed | FR-9, IS-1 | ✅ Mapped |
| AC-29 through AC-39 | FR-1 through FR-11 | ✅ One-to-one |
| In-scope / out-of-scope boundaries | Section 3 tables | ✅ Preserved |
| Accepted OQ-1 through OQ-3 | Section 9 | ✅ Carried forward with non-empty resolutions |

**Owner-approved deltas:** None.

---

## 11. Traceability Map

| PRD Section / FR | Requirement Context Source |
|---|---|
| FR-1 | Empty state when no debate exists |
| FR-2 | Podium only after debate creation |
| FR-3 | No standalone clear action |
| FR-4 | Topic validation 10–120 |
| FR-5 | Debate creation + topic persistence |
| FR-6 | Argument persistence |
| FR-7 | Atomic replace flow |
| FR-8 | Abandon replace leaves existing debate intact |
| FR-9 | Hardcoded `DEBATE` and seeded posts removed |
| FR-10 | No argument cap |
| FR-11 | Graceful handling of unavailable/corrupted localStorage |
| C-1 through C-7 | Gate 1 constraints |
| OQ-1 through OQ-3 | Gate 1 accepted downstream questions |

---

## Gate Decision

**✅ Can proceed to Gate 3 (Design).**

No requirement drift detected. All 11 AC IDs are covered. All remaining open questions are explicitly accepted for downstream resolution and do not block PRD readiness.

---

## PRD Draft Package

### Canonical Requirement Summary

Replace the hardcoded landing-page debate with a device-local, user-owned debate lifecycle: empty state -> create topic -> Podium available -> post Tark/Vitark -> persist across page loads -> replace current debate with a fresh one when desired.

### Finalized Scope Boundaries

- In-scope: hardcoded content removal, empty state, debate creation, localStorage persistence, Podium gating, atomic replace, test migration.
- Out-of-scope: backend persistence, multi-debate management, auth, standalone clear flow, route expansion.

### Open Questions Log

| ID | Question | Status | Resolution |
|---|---|---|---|
| OQ-1 | Replace-flow confirmation / warning guard | Resolved | Resolved at Gate 3 — PO decision: inline warning in the topic input area; no blocking dialog. Implemented via AC-40. (2026-04-25) |
| OQ-2 | Trimmed vs raw topic validation | Unresolved — Non-Blocking | Gate 4 architecture decides the binding rule before build. |
| OQ-3 | Full localStorage-unavailability fallback contract | Unresolved — Non-Blocking | Gate 4 architecture defines behavior beyond AC-39 minimum floor. |

### PR Description

```md
## Gate 2 — PRD v0 — create-debate

Replace the hardcoded demo debate with a device-local, user-owned debate lifecycle backed by localStorage.

**Slice folder:** `docs/slices/create-debate/`
**Gate status:** Gate 2 — PRD — ✅ Ready; can proceed to Gate 3 (Design)
**Artifact:** `docs/slices/create-debate/02-prd.md`

### Open Questions

| ID | Question | Status | Resolution |
|---|---|---|---|
| OQ-1 | Replace-flow confirmation / warning guard | Resolved | Resolved at Gate 3 — PO decision: inline warning in the topic input area; no blocking dialog. Implemented via AC-40. (2026-04-25) |
| OQ-2 | Trimmed vs raw topic validation | Unresolved — Non-Blocking | Gate 4 architecture decides the contract before build. |
| OQ-3 | Full localStorage-unavailability fallback contract | Unresolved — Non-Blocking | Gate 4 architecture defines behavior beyond AC-39. |

### Gate Blockers

| OQ | Blocks |
|---|---|
| OQ-1 | Resolved at Gate 3; no remaining blocker (AC-40) |
| OQ-2 | Gate 4 closure; Gate 5 start |
| OQ-3 | Gate 4 closure; Gate 5 start |

### Checklist

- [x] Gate 1 contract preserved with zero drift
- [x] AC prose not copied into PRD body
- [x] Requirement-to-PRD Alignment Check included
- [x] Traceability Map complete
- [x] All open questions have non-empty Resolution fields
- [x] PRD Draft Package included
```

---

## Amendments

_This section records owner-approved PRD deltas since Gate 2 approval. Original FR/AC rows in the PRD body are preserved unchanged. Downstream artifacts (`03-ux.md`, `04-design-qa.md`) are the execution source for these decisions; this section is the PRD version history._

**Gate 3 status:** Design QA PASS, including Pass 3 DS Cancel swap spot-check (2026-04-26). Gate 3 closure authorized.

---

### A-1 — Gate 3 UX: Empty-State Creation Form Interaction Pattern

**Date:** 2026-04-26
**Gate:** Gate 3A Phase 1 rerun v2; PO-approved 2026-04-25
**Affected:** FR-1 / AC-29

**Original FR-1 text (unchanged in body):** "When no active debate exists in localStorage, the landing page shall render an empty state with a debate-creation affordance."

**Gate 3 delta:** The creation form is inline in the empty state — TV lettermark icon (48×48, brand-primary fill) + topic TextField (placeholder only, no floating label) + character counter ("X / 120") + "Start" button (disabled by default, enabled when input is 10–120 characters). No separate FormOpen state; no headline; no body copy.

**What remains out-of-scope:** Separate FormOpen transition state; floating-label TextField variant; headline/body copy in empty state.

**PO approval reference:** 03-ux.md Checkpoints 6 and 14 (2026-04-25).

---

### A-2 — Gate 3 UX: Topic Validation Timing and Error Display

**Date:** 2026-04-26
**Gate:** Gate 3A CP-3 resolution
**Affected:** FR-4 / AC-30

**Original FR-4 text (unchanged in body):** "The debate topic input shall enforce a minimum of 10 and a maximum of 120 characters with a visible validation error on rejection."

**Gate 3 delta:** Validation fires in real time on every keystroke. The "Start" button is disabled when input length is fewer than 10 or greater than 120 characters. An error message is shown only when input exceeds 120 characters; no error message is shown for input below the 10-character minimum.

**What remains out-of-scope:** On-blur-only validation; under-minimum error copy.

**PO approval reference:** 03-ux.md Challenge Phase Results CP-3 (2026-04-25).

---

### A-3 — Gate 3 UX: New Debate Entry Mechanism

**Date:** 2026-04-26
**Gate:** Gate 3A CP-6 resolution; PO confirmed 2026-04-25T16:30Z
**Affected:** FR-7 / AC-34

**Original FR-7 text (unchanged in body):** "A visitor shall be able to initiate a new debate while one is active; completing that flow shall atomically overwrite the current topic and delete all current arguments from localStorage and the timeline."

**Gate 3 delta:** The entry point for the replace flow is the TopAppBar trailing overflow menu (⋮ icon -> "New Debate" menu item). This is a binding Gate 4 implementation contract. TextButton near the topic heading, FAB, and primary-button placements are ruled out. No separate Figma frame is required for Gate 3; ReplaceFlow frames (897:462 Light, 898:463 Dark) cover all post-trigger behavior.

**What remains out-of-scope:** Any entry point other than the TopAppBar overflow menu; atomic replace behavior is unchanged (FR-7 body stands).

**PO approval reference:** 03-ux.md Checkpoint 22 (2026-04-25T16:30Z).

---

### A-4 — Gate 3 UX: Replace-Flow Abandon Mechanism

**Date:** 2026-04-26
**Gate:** Gate 3B QG-1 resolution; PO Option A confirmed
**Affected:** FR-8 / AC-35

**Original FR-8 text (unchanged in body):** "Abandoning the new-debate flow before completion shall leave the current debate topic and all existing arguments fully intact."

**Gate 3 delta:** The abandon mechanism is an explicit "Cancel" TV DS Button/Text component instance rendered in the replace form (label="Cancel"). The DS component governs token lineage internally via `color/primary`, which resolves to the brand-primary visual. Tapping "Cancel" dismisses the replace form and leaves the current debate and all arguments fully intact. Nodes: 977:481 (Light), 977:483 (Dark). _(DS swap applied at Gate 3B QA; pre-swap native nodes 936:468 / 936:470 superseded.)_

**What remains out-of-scope:** System-back-only dismiss; tap-away-only dismiss.

**PO approval reference:** 03-ux.md Checkpoint 21; 04-design-qa.md final PASS (2026-04-25).

---

### A-5 — Gate 3 New Criterion: Replace-Flow Inline Warning (resolves OQ-1)

**Date:** 2026-04-26
**Gate:** Gate 3A OQ-1 closure; PO confirmed 2026-04-25T05:41Z
**Affected:** New FR-12 / AC-40

**Original state:** OQ-1 asked whether the replace flow requires a confirmation or warning guard. Status was "Unresolved — Non-Blocking" at Gate 2 close, deferred to Gate 3.

**Gate 3 delta:** PO decision: when a user initiates a new debate while an active debate exists, the replace form displays an inline warning in the topic input area informing the user that proceeding will replace the current topic and delete all existing arguments. No blocking confirmation dialog is shown. AC-40 added to `01-requirement.md` at Gate 3. New FR-12 added to Section 4 of this PRD to map AC-40.

**What remains out-of-scope:** Modal dialogs; toast notifications; blocking dialogs; any non-inline warning pattern.

**PO approval reference:** 03-ux.md Checkpoint 10 (2026-04-25T05:41Z); 01-requirement.md OQ-1 "Closed at Gate 3".

---

### Gate 3 Alignment Check Extension

_Re-run of Section 10 for Gate 3 deltas only. Original Section 10 rows (AC-29 through AC-39 mapped to FR-1 through FR-11) remain valid for non-amended behavior._

| Gate 3 Delta | Amendment | Affected AC (amended) | FR Mapping | Alignment Status |
|---|---|---|---|---|
| Inline form in empty state (CP-1) | A-1 | AC-29 | FR-1 + A-1 | ✅ Mapped |
| Real-time validation; >120 error only (CP-3) | A-2 | AC-30 | FR-4 + A-2 | ✅ Mapped |
| TopAppBar overflow menu entry (CP-6) | A-3 | AC-34 | FR-7 + A-3 | ✅ Mapped |
| Explicit Cancel button (QG-1) | A-4 | AC-35 | FR-8 + A-4 | ✅ Mapped |
| Inline warning; no blocking dialog (OQ-1 closed) | A-5 | AC-40 (new) | FR-12 (new) | ✅ Mapped |

**Owner-approved deltas since Gate 2:** A-1 through A-5 above.
**Unauthorized scope expansion:** None detected.
**Out-of-scope boundaries (Section 3):** Preserved without change.