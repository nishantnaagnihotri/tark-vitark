# 06 — Task Breakdown: podium-fab-collapse

**Gate:** 4 End / Gate 5 Preparation  
**Date:** 2026-05-18  
**Slice tracker:** https://github.com/nishantnaagnihotri/tark-vitark/issues/153  
**Slice branch:** `slice/podium-fab-collapse`

---

## Figma Design Authority (applies to all tasks)

> **Figma frames are the single source of truth for all visual implementation decisions.**  
> Text specs in this document and all other markdown artifacts are supplementary only.  
> When any markdown value diverges from a Figma frame, the Figma frame wins unconditionally.  
> Mandatory pre-implementation step for T2 and T3: read the relevant Figma frame node IDs via MCP `get_design_context` before writing any CSS size or color value.

---

## Task Registry

| ID | GitHub Issue | Title | Depends on | Status |
|---|---|---|---|---|
| T1 | [#154](https://github.com/nishantnaagnihotri/tark-vitark/issues/154) | Add `--color-scrim` token to `tokens.css` | — | Open |
| T2 | [#155](https://github.com/nishantnaagnihotri/tark-vitark/issues/155) | Create `PodiumFAB` component + CSS + unit tests | T1 | Open |
| T3 | [#156](https://github.com/nishantnaagnihotri/tark-vitark/issues/156) | Create `PodiumBottomSheet` component + CSS + unit tests | T1 | Open |
| T4 | [#157](https://github.com/nishantnaagnihotri/tark-vitark/issues/157) | Wire `DebateScreen` + FAB/Sheet state + `--podium-height` fix | T2, T3 | Open |
| T5 | [#158](https://github.com/nishantnaagnihotri/tark-vitark/issues/158) | A11y tests for `PodiumFAB` + `PodiumBottomSheet` | T2, T3 | Open |
| T6 | [#159](https://github.com/nishantnaagnihotri/tark-vitark/issues/159) | BDD scenarios AC-19–AC-23 + step definitions | T4 | Open |

---

## Execution Order and Parallelism Map

```
T1
├── T2  (can run in parallel with T3)
└── T3  (can run in parallel with T2)
     └── T4
          ├── T5  (can run in parallel with T6)
          └── T6  (can run in parallel with T5)
```

**Wave 1:** T1 (serial — no dep)  
**Wave 2:** T2 ∥ T3 (parallel — both depend only on T1)  
**Wave 3:** T4 (serial — depends on T2 + T3)  
**Wave 4:** T5 ∥ T6 (parallel — T5 deps T2+T3, T6 deps T4)  

---

## Figma Frame Index

| Frame | Node ID | Figma URL | Required by |
|---|---|---|---|
| FAB Closed / Light | `641:362` | https://www.figma.com/design/CsPAyUdLSStdmNpmiBMESQ?node-id=641:362 | T2, T4, T6 |
| FAB Closed / Dark | `669:197` | https://www.figma.com/design/CsPAyUdLSStdmNpmiBMESQ?node-id=669:197 | T2, T5 |
| BottomSheet Open / Light | `704:253` | https://www.figma.com/design/CsPAyUdLSStdmNpmiBMESQ?node-id=704:253 | T3, T4, T6 |
| BottomSheet Open / Dark | `709:276` | https://www.figma.com/design/CsPAyUdLSStdmNpmiBMESQ?node-id=709:276 | T3, T5 |
| BottomSheet PostTark / Light | `714:284` | https://www.figma.com/design/CsPAyUdLSStdmNpmiBMESQ?node-id=714:284 | T3, T6 |
| BottomSheet PostTark / Dark | `714:346` | https://www.figma.com/design/CsPAyUdLSStdmNpmiBMESQ?node-id=714:346 | T3, T6 |
| BottomSheet PostVitark / Light | `714:408` | https://www.figma.com/design/CsPAyUdLSStdmNpmiBMESQ?node-id=714:408 | T3, T6 |
| BottomSheet PostVitark / Dark | `714:471` | https://www.figma.com/design/CsPAyUdLSStdmNpmiBMESQ?node-id=714:471 | T3, T6 |
| SegmentedControl DS variants | `322:179` | DS Library `onzB8ujyvn6wnhdaS7Hz28` | T3 |

---

## Architecture Section References

| Task | Architecture section |
|---|---|
| T1 | §2.9 CSS / Token Strategy |
| T2 | §2.4 Interface Contracts, §2.5 PodiumFAB DOM Structure, §2.9 |
| T3 | §2.4, §2.6 PodiumBottomSheet DOM Structure, §2.7 Drag-to-Dismiss, §2.8 Focus Trap, §2.9, §2.10 Advisory A1 |
| T4 | §2.1 Module Boundaries, §2.2 Data Flow, §2.3 State Model, §2.4, §2.9 |
| T5 | §2.11 Verification Strategy (a11y) |
| T6 | §2.11 BDD Scenario Stubs |

---

## Open Questions (architecture-gate recorded)

| ID | Question | Resolution | Needed before |
|---|---|---|---|
| OQ-1 | `<div role="dialog">` vs native `<dialog>` | Default: `<div role="dialog" aria-modal="true">` — preserves CSS animation control. **PO to confirm or override.** | T3 dispatch |
| OQ-2 | FAB/Sheet state reset on mobile→desktop resize | Default: yes (`isFabExpanded=false`, `isSheetOpen=false` when `isMobile→false`). **PO to confirm or override.** | T4 dispatch |

---

## Acceptance Criteria Traceability

| AC | Description | Covered by |
|---|---|---|
| AC-19 | FAB visible on mobile; inline Podium hidden | T2, T4, T6 |
| AC-20 | FAB expands to show T/V/× mini-buttons | T2, T5, T6 |
| AC-21 | Side-select → opens bottom sheet with correct side pre-selected | T3, T4, T6 |
| AC-22 | Post submitted via bottom sheet with correct side + text | T3, T4, T6 |
| AC-23 | FAB and sheet not rendered on desktop | T4, T5, T6 |
