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
| FR-20 | Tapping the FAB opens a bottom sheet containing the full Podium composer |
| FR-21 | The bottom sheet can be dismissed by tapping outside or a close affordance |
| FR-22 | FAB and bottom sheet respect both light and dark themes |
| FR-23 | FAB and bottom sheet are mobile-only (≤ 767 px); on ≥ 768 px the inline Podium remains |

### Acceptance Criteria (canonical)

| ID | Criterion |
|---|---|
| AC-19 | FAB renders at bottom-right on mobile; not visible on tablet/desktop |
| AC-20 | Tapping FAB expands side-select options (Post as Tark / Post as Vitark); tapping a side option opens the bottom-sheet composer with that side pre-selected. *(Amended at Gate 5.5 — PO approved two-tap side-select UX over single-tap, 2026-04-20)* |
| AC-21 | Bottom sheet closes on outside tap or close affordance; FAB remains visible |
| AC-22 | FAB and bottom sheet use correct theme tokens in light and dark mode |
| AC-23 | On ≥ 768 px breakpoint, FAB and bottom sheet are absent; inline Podium is present |

---

## Gate Decision

**Status:** Ready — Gate 2 complete. Can proceed to Gate 4 (Gate 3 complete via post-tark-vitark Pass 5 / Pass 2).
