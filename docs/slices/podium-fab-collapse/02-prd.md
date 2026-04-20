# PRD — podium-fab-collapse
## Gate 2 Reference Artifact

> **This is a reference artifact.** The full PRD for this slice is Amendment A-1 in
> [`docs/slices/post-tark-vitark/02-prd.md §Amendments`](../post-tark-vitark/02-prd.md).
> Do not duplicate content here — consult the source document for all FR/AC details.

---

## Amendment Provenance

| Field | Value |
|---|---|
| Source slice | `post-tark-vitark` |
| Amendment label | A-1 |
| Amendment date | 2026-04-18 |
| PO approval | Verbal approval 2026-04-18 |

---

## Scope Summary

Amendment A-1 replaces the always-visible inline `Podium` composer bar (FR-1 / FR-2, AC-1 / AC-2) with a FAB-triggered bottom-sheet `Podium` pattern. All other requirements (FR-3–FR-18, AC-3–AC-18) are unchanged.

### Functional Requirements (canonical)

| ID | Requirement |
|---|---|
| FR-19 | A floating action button (FAB) is persistently visible in the lower-right corner of the Debate Screen on mobile |
| FR-20 | Tapping the FAB expands Tark/Vitark side-select options; tapping a side opens a bottom sheet containing the full Podium composer with that side selected. *(Amended at Gate 5.5 — PO approved two-tap UX: FAB expands to Tark/Vitark side-select options first; tapping a side opens the composer bottom sheet; 2026-04-20)* |
| FR-21 | The bottom sheet can be dismissed by dragging it down. *(Amended at Gate 5.5 — canonical AC-23 in post-tark-vitark/02-prd.md specifies drag-down as the only remaining dismissal path; outside-tap and close-affordance paths removed; 2026-04-20)* |
| FR-22 | FAB and bottom sheet respect both light and dark themes |
| FR-23 | FAB and bottom sheet are mobile-only (≤ 767 px); on ≥ 768 px the inline Podium remains |
| FR-24 | Re-tapping the expanded FAB, or tapping outside the expanded FAB, collapses it back to the single `+` icon state |

### Acceptance Criteria (canonical)

| ID | Criterion |
|---|---|
| AC-19 | FAB renders at bottom-right on mobile; not visible on tablet/desktop |
| AC-20 | Tapping FAB expands side-select options (Post as Tark / Post as Vitark); tapping a side option opens the bottom-sheet composer with that side pre-selected. *(Amended at Gate 5.5 — PO approved two-tap side-select UX over single-tap, 2026-04-20)* |
| AC-21 | Bottom sheet closes on drag-down; FAB remains visible. *(Amended at Gate 5.5 — outside-tap and close-affordance dismissal removed; drag-down is the only path, per canonical AC-23 in post-tark-vitark/02-prd.md; 2026-04-20)* |
| AC-22 | FAB and bottom sheet use correct theme tokens in light and dark mode |
| AC-23 | On ≥ 768 px breakpoint, FAB and bottom sheet are absent; inline Podium is present |
| AC-24 | When the FAB is expanded to show Tark/Vitark side-select options, re-tapping the FAB or tapping outside the expanded options collapses the FAB back to its default state |

---

## Gate Decision

**Status:** Ready — Gate 2 complete. Can proceed to Gate 4 (Gate 3 complete via post-tark-vitark Pass 5 / Pass 2).
