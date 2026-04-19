# Requirement — podium-fab-collapse
## Gate 1 — 2026-04-19 (Continuation Slice)

---

## Provenance

This slice is a continuation of the approved Amendment A-1 from the `post-tark-vitark` slice.
- PRD source: [docs/slices/post-tark-vitark/02-prd.md — §Amendments A-1](../post-tark-vitark/02-prd.md)
- PO approval: verbal, Gate 3 design session, 2026-04-18

---

## Requirement Statement

The always-visible inline Podium (Composer bar) introduced in the `post-tark-vitark` slice shall be replaced with a FAB-triggered bottom-sheet Podium pattern.

A collapsed FAB (`+` icon) shall be always visible in the bottom-right corner of the Debate Screen. Tapping it expands to show T, V, and × mini-buttons. Tapping T or V opens the Podium (SegmentedControl + text input + Publish button) as a Material 3 bottom sheet with the corresponding side pre-selected. Tapping × collapses the FAB. Dragging down the Podium sheet dismisses it.

---

## Problem and Expected Outcome

The `post-tark-vitark` always-visible Podium occupies persistent screen space for the majority of users (Audience / readers) who do not post. This change minimises chrome for readers while preserving direct, low-friction access for Debaters.

Expected outcome:
- Debate Screen is uncluttered for Audience by default.
- A Debater can open the Podium in two taps (FAB tap → T or V).
- All existing post validation, side-selection, and lifecycle behavior (FR-3–FR-18 / AC-3–AC-18) is unchanged.

---

## Slice Complexity Classification

**Standard** — single-screen UI behavior change, no API, no new module boundaries beyond existing Debate Screen.

---

## Domain Glossary (Active Terms)

| Term | Definition |
|---|---|
| Debate Screen | The primary screen showing the debate topic, timeline of Arguments, and the Podium entry point. |
| Debater | A user who creates and publishes a Post. |
| Audience | A user who reads the Debate Screen without posting. |
| Tark | A supporting argument (for the topic). |
| Vitark | An opposing argument (against the topic). |
| Post | A single argument submitted by a Debater. |
| Podium | The FAB-triggered, bottom-sheet input area used by a Debater to create and publish a new Post. |
| FAB | A Material 3 Floating Action Button; the always-visible `+` trigger that initiates the Podium entry flow. |
| Bottom Sheet | The slide-up panel containing the Podium (SegmentedControl + text input + Publish button). |
| Chronological Append | New Posts are appended at the bottom of the debate timeline in submission order. |
| Trimmed Text | Text with leading and trailing whitespace removed before validation. |

---

## In-Scope

| ID | Item |
|---|---|
| IS-1 | Replace always-visible inline Podium with FAB-triggered bottom-sheet Podium |
| IS-2 | FAB collapsed state (single `+` icon, bottom-right, always visible) |
| IS-3 | FAB expanded state (T, V, × mini-buttons, M3 Smart Animate 300 ms ease-out) |
| IS-4 | Podium bottom sheet (SegmentedControl + text input + Publish, 300 ms ease-out open) |
| IS-5 | Side pre-selection from FAB tap (T → Tark, V → Vitark) |
| IS-6 | In-sheet side switching via SegmentedControl without dismissing |
| IS-7 | Dismiss: × collapses FAB; drag-down dismisses sheet, returns to expanded FAB |
| IS-8 | All existing validation (FR-3–FR-18) remains unchanged |

## Out-of-Scope

| ID | Item |
|---|---|
| OOS-1 | Authentication/login |
| OOS-2 | Edit/delete Post |
| OOS-3 | Backend persistence |
| OOS-4 | Podium collapse option (deferred — issue #79) |
| OOS-5 | Desktop viewport — FAB pattern is mobile-first; desktop behavior to be confirmed in architecture |

---

## Acceptance Criteria

| ID | Acceptance Criterion |
|---|---|
| AC-19 | The FAB is visible collapsed (single `+` icon, bottom-right) at all times on the Debate Screen. |
| AC-20 | Tapping the collapsed FAB expands it with M3 animation (300 ms ease-out) to show T, V, and × mini-buttons. |
| AC-21 | Tapping T opens the Podium bottom sheet with Tark pre-selected; tapping V opens it with Vitark pre-selected. |
| AC-22 | The Podium bottom sheet includes a SegmentedControl (Tark \| Vitark) for switching side without dismissing the sheet. |
| AC-23 | Tapping × collapses the FAB to Phase 1; dragging the Podium sheet down dismisses the sheet and returns to FAB expanded state. |

---

## Open Questions

None. Amendment A-1 scope is fully frozen.
