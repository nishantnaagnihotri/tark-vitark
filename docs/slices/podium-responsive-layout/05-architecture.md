# Architecture Plan — podium-responsive-layout
## Gate 4 Artifact — 2026-04-21

---

## 1. Architecture Readiness

**Ready**

All acceptance criteria (AC-25–AC-30) are fully traced to verified Figma frames confirmed in the Design QA Verdict Package (CONDITIONAL PASS; GAP-1 non-blocking). Implementation tasks are well-bounded: additive CSS breakpoints, one TSX conditional removal, comment-only changes in four CSS files, a Figma-read-gated mobile colour fix, and new BDD + unit tests. Architecture Challenge Phase finds no Must Resolve gaps. Gate 4 may proceed.

---

## 2. Architecture Plan

### 2.1 Architectural Pattern

CSS mobile-first responsive extension + React conditional rendering simplification. No new modules, no new routes, no new components, no API changes. All CSS changes are additive (`@media` blocks appended after existing rules). The TSX change simplifies a conditional by removing it entirely, rendering `PodiumFAB` and `PodiumBottomSheet` unconditionally.

### 2.2 Design Token Strategy

| Token | Decision | Rationale |
|---|---|---|
| `--space-4` / `--space-8` / `--space-12` | Used directly in media-query-scoped overrides in `podium-fab.css` | Existing space tokens map exactly to Figma-specified margin values (16 px / 32 px / 48 px) |
| `--color-scrim` | NOT extended to new tiers; literal `rgba()` values used in scrim breakpoint overrides | Token is mobile-scoped. Extending its semantic meaning to wider tiers would introduce drift. Desktop values differ between light/dark and differ from mobile — not suitable for a single shared token. |
| BottomSheet `max-width` | Literal px values (600 px, 720 px) in breakpoint overrides | No existing max-width tokens at these values; a new token would be premature for one component. |

**Decision authority:** Confirmed in Gate 4 mission brief (2026-04-21). These decisions are frozen.

### 2.3 CSS Specificity Analysis

Base scrim rule in `podium-bottom-sheet.css`:

```css
.podium-sheet-scrim { background: var(--color-scrim); }
/* specificity: (0,0,1,0) */
```

Proposed additions and their winning conditions:

| Rule | Specificity | Media scope | Beats base? |
|---|---|---|---|
| `.podium-sheet-scrim` in `@media (min-width: 1024px)` | (0,0,1,0) | desktop only | Yes — same specificity, later in cascade within MQ |
| `[data-theme="dark"] .podium-sheet-scrim` in `@media (min-width: 768px) and (max-width: 1023px)` | (0,1,1,0) | tablet only | Yes — higher specificity |
| `[data-theme="dark"] .podium-sheet-scrim` in `@media (min-width: 1024px)` | (0,1,1,0) | desktop only | Yes — higher specificity |

Tablet light: `var(--color-scrim)` resolves to `rgba(0,0,0,0.32)` — matches spec — no override required. ✅
Mobile tier: no new MQ rules apply at `<768px` — mobile scrim frozen. ✅
**No specificity conflicts identified.**

### 2.4 State Management Changes (Task A)

| State / Effect | Keep or Remove | Reason |
|---|---|---|
| `isMobile` state + init | **Remove** | Not needed once conditional is dropped |
| First `useEffect` (viewport listener: `setIsMobile`, `setIsFabExpanded`, `setIsSheetOpen`) | **Remove** | Depends on `isMobile`; no longer applicable |
| `selectedSide` state | Keep | Shared between FAB and Sheet |
| `isFabExpanded` state | Keep | FAB expand/collapse state |
| `isSheetOpen` state | Keep | Sheet open/close state |
| `ignoreNextSheetCloseRef` ref | Keep | Sheet close race-condition guard |
| `clearIgnoreCloseAnimationFrameRef` ref | Keep | Cleanup ref for animation frame |
| Second `useEffect` (cleanup of `clearIgnoreCloseAnimationFrameRef`) | Keep | Required to prevent animation frame memory leak |
| `handlePublish` function | Keep | Unchanged |

Import change: remove `Podium` import from `DebateScreen.tsx` (becomes unused after Task A). `src/components/Podium.tsx` file is **not deleted**.

### 2.5 Test Impact from Task A

Removing `isMobile` breaks the following tests in `tests/components/DebateScreen.test.tsx`. **The Task A dev agent must fix all of them in the same PR as the TSX change.**

| Test | Required action |
|---|---|
| `"composes Podium controls"` | Delete — `Podium` no longer rendered; behaviour covered by `PodiumBottomSheet.test.tsx` |
| `"defaults selected side to tark on mount"` | Rewrite — assert FAB collapsed button present (`'Open post composer'`); no Podium switch |
| `"passes side changes to Podium by updating selected side state"` | Delete — Podium-specific; covered by `PodiumBottomSheet.test.tsx` |
| `"appends a valid published post as the last timeline item"` | Rewrite — use FAB → side-select → sheet-open → type → publish flow |
| `"resets localPosts to empty after remount"` | Rewrite — use FAB+Sheet publish flow |
| `"resets selected side to tark after remount"` | Delete — Podium-specific; covered by `PodiumBottomSheet.test.tsx` |
| `"keeps ThemeToggle present alongside composer controls"` | Update — assert FAB presence, not Podium textbox |
| `"renders mobile compose flow only when matchMedia reports mobile"` | Delete — `isMobile` removed; FAB+Sheet always render |
| `"resets FAB and sheet state on resize from mobile to desktop"` | Delete — viewport resize handler removed |
| `"opens bottom sheet immediately with selected side after mobile FAB side selection"` | Keep but remove `mockViewportQuery(true)` call — FAB always renders now |
| `mockViewportQuery` helper + `MatchMediaController` / `MutableMediaQueryList` types | Delete — no longer needed in this file |

Tests that survive unchanged: `"renders a <main> landmark"`, `"renders the debate topic as a heading"`, `"composes Topic component"`, `"composes LegendBar component"`, `"composes Timeline component"`, `"renders all arguments from DEBATE data"`, `"applies debate-screen CSS class to main element"`, `"uses shared podium height variable for debate screen clearance"`, `"scopes --podium-height to desktop media query and keeps mobile default at zero"`.

### 2.6 Dependency Graph

```
Phase 1 — dispatch in parallel (non-overlapping files):
  Task A  — DebateScreen.tsx + DebateScreen.test.tsx update
  Task B  — podium-fab.css breakpoints
  Task C  — podium-bottom-sheet.css max-width + scrim
  Task D  — 4 CSS files (comment-only IS-3)
  Task E  — IS-1 mobile colour fix (Figma frame read required)

Phase 2 — after all Phase 1 PRs merge to slice branch:
  Task F  — features/podium-responsive-layout.feature + tests/components/podium-responsive-layout.test.ts
```

Task D and Task E may both touch `debate-screen.css` (D changes a comment; E may change CSS values in a different line range). Since hunks are non-overlapping, parallel dispatch is safe with post-merge rebase.

### 2.7 Exact CSS Specifications for Build (sourced from verified Figma frames)

**Task B — `podium-fab.css` additions** (append after all existing rules):
```css
/* ── Tablet (768–1023 px): FAB margin override ── */
@media (min-width: 768px) {
    button.podium-fab,
    div.podium-fab[role="group"] {
        right: var(--space-8);
        bottom: var(--space-8);
    }
}

/* ── Desktop (≥1024 px): FAB margin override ── */
@media (min-width: 1024px) {
    button.podium-fab,
    div.podium-fab[role="group"] {
        right: var(--space-12);
        bottom: var(--space-12);
    }
}
```

**Task C — `podium-bottom-sheet.css` additions** (append after all existing rules):
```css
/* ── Tablet (768–1023 px): BottomSheet max-width ── */
@media (min-width: 768px) {
    .podium-bottom-sheet {
        max-width: 600px;
    }
}

/* ── Desktop (≥1024 px): BottomSheet max-width ── */
@media (min-width: 1024px) {
    .podium-bottom-sheet {
        max-width: 720px;
    }
}

/* ── Scrim opacity: tablet dark theme ── */
@media (min-width: 768px) and (max-width: 1023px) {
    [data-theme="dark"] .podium-sheet-scrim {
        background: rgba(0, 0, 0, 0.48);
    }
}

/* ── Scrim opacity: desktop (light and dark theme) ── */
@media (min-width: 1024px) {
    .podium-sheet-scrim {
        background: rgba(0, 0, 0, 0.36);
    }

    [data-theme="dark"] .podium-sheet-scrim {
        background: rgba(0, 0, 0, 0.52);
    }
}
```

**Task D — IS-3 comment replacements (comment text only; no value changes):**

| File | Current comment | Replacement |
|---|---|---|
| `src/styles/components/timeline.css` line 44 | `/* ── Tablet (≥481px): CSS Grid with center spine ── */` | `/* ── mobile-internal layout adjustment (≥481px) — not a design tier ── */` |
| `src/styles/debate-screen.css` | `/* ── Tablet ── */` (above `@media (min-width: 481px)`) | `/* ── mobile-internal (≥481px) — not a design tier ── */` |
| `src/styles/components/legend-bar.css` | `/* Tablet and above: 3-column grid matching timeline spine alignment */` | `/* mobile-internal (≥481px) — not a design tier */` |
| `src/styles/components/argument-card.css` | *(no comment above `@media (min-width: 481px)`)* | Add: `/* mobile-internal (≥481px) — not a design tier */` above the media query |

### 2.8 Figma Source Traceability

| Spec value | Authoritative Figma node(s) |
|---|---|
| Mobile FAB `right`/`bottom` = 16 px (`--space-4`) | `801:459`, `801:500` |
| Tablet FAB `right`/`bottom` = 32 px (`--space-8`) | `786:427`, `786:523`, `786:619`, `786:715` |
| Desktop FAB `right`/`bottom` = 48 px (`--space-12`) | `786:811`, `786:907`, `786:1003`, `786:1099` |
| Tablet BottomSheet `max-width: 600px`, `height: 256px`, centred | `786:523` (light), `786:715` (dark) |
| Desktop BottomSheet `max-width: 720px`, `height: 256px`, centred | `786:907` (light), `786:1099` (dark) |
| Tablet scrim light `rgba(0,0,0,0.32)` | `786:523` |
| Tablet scrim dark `rgba(0,0,0,0.48)` | `786:715` |
| Desktop scrim light `rgba(0,0,0,0.36)` | `786:907` |
| Desktop scrim dark `rgba(0,0,0,0.52)` | `786:1099` |
| IS-1 mobile colour baseline | `801:459` (light), `801:500` (dark) — read by Task E dev agent at build time |

---

## 3. Impact Analysis

| File | Change type | Task |
|---|---|---|
| `src/components/DebateScreen.tsx` | Modify — remove `isMobile` state/effect, remove `Podium` import, render FAB+Sheet unconditionally | A |
| `tests/components/DebateScreen.test.tsx` | Modify — delete/rewrite 9 broken tests, delete `mockViewportQuery` helper | A (same PR) |
| `src/styles/components/podium-fab.css` | Modify — append two `@media` breakpoint blocks | B |
| `src/styles/components/podium-bottom-sheet.css` | Modify — append four `@media` breakpoint blocks (max-width ×2, scrim ×2) | C |
| `src/styles/components/timeline.css` | Modify — comment text only (line 44) | D |
| `src/styles/debate-screen.css` | Modify — comment text only | D |
| `src/styles/components/legend-bar.css` | Modify — comment text only | D |
| `src/styles/components/argument-card.css` | Modify — add comment above `@media (min-width: 481px)` | D |
| CSS file(s) TBD by Figma frame read | Modify — colour token corrections at `<768px` if mismatches found | E |
| `features/podium-responsive-layout.feature` | Add — BDD Gherkin scenarios for AC-25–AC-30 | F |
| `tests/components/podium-responsive-layout.test.ts` | Add — unit tests for AC-25–AC-30 | F |

**Unchanged (frozen):** `src/components/PodiumFAB.tsx`, `src/components/PodiumBottomSheet.tsx`, `src/components/Podium.tsx`, `src/data/`, all other test files, `tokens.css`.

---

## 4. Risk and Mitigation Plan

| ID | Risk | Probability | Impact | Mitigation |
|---|---|---|---|---|
| R-1 | Mobile regression from new CSS breakpoints | Low | High | Breakpoints are `min-width: 768px` / `min-width: 1024px` — no rule applies at `<768px`; AC-27 is a hard pass criterion; runtime QA at 320 px and 767 px mandatory |
| R-2 | CSS specificity conflict on scrim override | Very Low | Medium | Confirmed via specificity analysis: `[data-theme="dark"] .podium-sheet-scrim` at (0,1,1,0) beats base (0,0,1,0); desktop light same-specificity override wins by cascade position |
| R-3 | `--color-scrim` token semantic drift on wider viewports | Very Low | Medium | Token explicitly NOT extended; literal `rgba()` values used for non-mobile tiers; decision documented in PO Decision Log |
| R-4 | IS-1 colour values not pre-extracted in Gate 4 inputs | Certain | Low | Task E dev reads Figma frames `801:459` and `801:500` via Figma MCP; issue includes deep links |
| R-5 | IS-1 no colour mismatch found (Task E is no-op) | Medium | Low | Acceptable; task closes with "No mismatch found" in commit note; IS-1 formally resolved |
| R-6 | Task A breaks 9 existing `DebateScreen.test.tsx` tests | Certain | Medium | Task A issue explicitly lists all 9 tests to delete/rewrite; dev agent owns `DebateScreen.test.tsx` update in same PR |
| R-7 | GAP-1: dark Figma frames use light-mode variable fallbacks | Very Low | None | Non-blocking per Design QA verdict; CSS runtime resolves via `data-theme` attribute; route back to UX for Figma-side fix if preview fidelity required |
| R-8 | Unused `Podium` import lint error after Task A | Low | Low | `Podium` import removed from `DebateScreen.tsx`; `Podium.tsx` component file retained |

---

## 5. Verification Strategy

| AC | Verification level | Evidence required |
|---|---|---|
| AC-25 — Tablet layout 768–1023 px | Unit + Runtime QA | `podium-responsive-layout.test.ts`: CSS text assertions on `podium-fab.css` (tablet breakpoint with `--space-8`) and `podium-bottom-sheet.css` (600 px max-width); Runtime QA at 768 px |
| AC-26 — Desktop layout ≥1024 px | Unit + Runtime QA | `podium-responsive-layout.test.ts`: CSS text assertions on desktop breakpoints; Runtime QA at 1024 px |
| AC-27 — Mobile frozen ≤767 px | Unit + Runtime QA | `DebateScreen.test.tsx` (updated): FAB+Sheet always render; Runtime QA at 320 px and 767 px confirms zero regression |
| AC-28 — 481 px comment reclassified | Unit + Code review | `podium-responsive-layout.test.ts`: `readFileSync` on all 4 files, assert new comment text present and legacy "Tablet" label absent |
| AC-29 — Tablet FAB 32 px + Sheet 600×256 + scrim 0.32/0.48 | Unit + Runtime QA | CSS text assertions on breakpoint values; Runtime QA at 768 px in light + dark theme |
| AC-30 — Desktop FAB 48 px + Sheet 720×256 + scrim 0.36/0.52 | Unit + Runtime QA | CSS text assertions on breakpoint values; Runtime QA at 1024 px in light + dark theme |

**Viewport mocking approach (vitest + jsdom):** jsdom does not natively resolve CSS media queries. Two patterns are used:

1. **Component behaviour assertions** — render `<DebateScreen/>` with `@testing-library/react` and assert DOM presence. No `matchMedia` mock needed after Task A removes `isMobile`.
2. **CSS value assertions** — use `readFileSync` on CSS files and assert expected `@media` blocks are present as text content. Consistent with the pattern in `PodiumFAB.test.tsx` and `DebateScreen.test.tsx`.

---

## 6. Task Decomposition

| Task | Files changed | AC(s) | Phase | Parallelisable with |
|---|---|---|---|---|
| A — Remove `DebateScreen` `isMobile` conditional | `DebateScreen.tsx`, `DebateScreen.test.tsx` | AC-27, AC-29, AC-30 | 1 | B, C, D, E |
| B — `podium-fab.css` tablet + desktop breakpoints | `podium-fab.css` | AC-25, AC-26, AC-29, AC-30 | 1 | A, C, D, E |
| C — `podium-bottom-sheet.css` max-width + scrim overrides | `podium-bottom-sheet.css` | AC-25, AC-26, AC-29, AC-30 | 1 | A, B, D, E |
| D — IS-3 comment reclassification (4 CSS files) | `timeline.css`, `debate-screen.css`, `legend-bar.css`, `argument-card.css` | AC-28 | 1 | A, B, C, E |
| E — IS-1 mobile colour fix | TBD (Figma frame read by dev at build time) | AC-27 | 1 | A, B, C, D |
| F — BDD feature + unit tests | `features/podium-responsive-layout.feature`, `tests/components/podium-responsive-layout.test.ts` | AC-25–AC-30 | 2 (after A–E merge) | — |

---

## 7. Quality Gaps Inherited

| ID | Gap | Severity | Status |
|---|---|---|---|
| QG-1 | IS-1 exact colour token values for mobile tier not pre-extracted at Gate 4; Task E dev agent must read Figma frames `801:459` and `801:500` at build time | Minor | Non-blocking — Figma deep links provided in Task E issue |
| GAP-1 | Figma dark frames retain light-mode variable fallbacks in Figma preview (from Design QA) | Minor | Non-blocking — CSS runtime unaffected; route back to UX for Figma-side fix if fidelity is required |

---

## 8. Open Questions

| ID | Question | Status |
|---|---|---|
| OQ-E1 | Will Task E find any colour token mismatches at `<768px` (IS-1)? | Unresolved — Task E dev resolves at build time via Figma MCP read of `801:459` and `801:500` |
| OQ-F1 | Should `DebateScreen.test.tsx` retain any `matchMedia` mock infrastructure after Task A? | Accepted — all `mockViewportQuery` helpers deleted from `DebateScreen.test.tsx` as part of Task A; `window.matchMedia` polyfill in `tests/setup.ts` is kept (still used by `ThemeToggle`) |

---

## 9. Gate Decision

**Can proceed to Build (Gate 5).**

All AC-25–AC-30 are traced to verified Figma frames. All six implementation tasks are atomic, dependency-ordered, and in non-overlapping files (Phase 1 parallel-safe with post-merge rebase). CSS specificity analysis confirms no conflicts. `--color-scrim` token not extended. Task A test co-change requirement is explicit in the Task A issue. No Must Resolve gaps remain.

---

## 10. Architecture Plan Package

### Requirement and Design Traceability Snapshot

| Gate | Artifact |
|---|---|
| Gate 1 | `docs/slices/podium-responsive-layout/01-requirement.md` |
| Gate 2 | `docs/slices/podium-responsive-layout/02-prd.md` |
| Gate 3A | `docs/slices/podium-responsive-layout/03-ux.md` |
| Gate 3B | `docs/slices/podium-responsive-layout/04-design-qa.md` |
| Figma file | https://www.figma.com/design/CsPAyUdLSStdmNpmiBMESQ |
| Figma section | `05-podium-responsive-layout [APPROVED]` — node `747:356` |

### Module Boundary Map

```
src/
  components/
    DebateScreen.tsx            ← Task A: remove isMobile conditional, remove Podium import
    Podium.tsx                  ← untouched (not deleted)
    PodiumFAB.tsx               ← untouched (frozen)
    PodiumBottomSheet.tsx       ← untouched (frozen)
  styles/
    debate-screen.css           ← Task D: comment-only
    components/
      podium-fab.css            ← Task B: append breakpoints
      podium-bottom-sheet.css   ← Task C: append max-width + scrim breakpoints
      timeline.css              ← Task D: comment-only
      legend-bar.css            ← Task D: comment-only
      argument-card.css         ← Task D: comment-only
      [TBD by Task E]           ← Task E: colour fix if mismatch found

tests/
  components/
    DebateScreen.test.tsx       ← Task A: update broken tests
    podium-responsive-layout.test.ts ← Task F: new file

features/
  podium-responsive-layout.feature ← Task F: new file
```

### Interface Contracts

`PodiumFAB`, `PodiumBottomSheet`, and `Podium` component prop interfaces are unchanged. `DebateScreen.tsx` internal state shrinks (removes `isMobile: boolean`). No new props introduced anywhere.

### Rollout and Rollback

- All changes live on `slice/podium-responsive-layout` branch; `master` is unaffected until slice PR merges.
- Rollback: revert the slice branch PR. No database migrations, no infrastructure changes, no feature flags required.
- All CSS changes are additive; reverting restores mobile-only breakpoint behaviour instantly.

### Product Owner Decision Log

| Decision | Owner | Date |
|---|---|---|
| Scrim: use literal `rgba()` in component CSS, not via extended token | PO — autopilot mandate | 2026-04-21 |
| BottomSheet `max-width`: literal px values (not tokens) | PO — autopilot mandate | 2026-04-21 |
| `Podium` component file not deleted; `DebateScreen.tsx` import removed | Architecture agent | 2026-04-21 |
| IS-1 colour values delegated to Task E dev agent Figma MCP read | Architecture agent | 2026-04-21 |
