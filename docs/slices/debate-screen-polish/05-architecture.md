# Architecture Plan — debate-screen-polish
## Gate 4 — 2026-04-17

---

## 1. Architecture Readiness

**Ready**

Challenge Phase complete against all four gate artifacts. Both items are CSS-only changes. No DOM changes, no component changes, no token changes. All Figma frame node IDs are confirmed in `04-design-qa.md`. All Must Resolve gaps are closed. No open questions remain. Gate 4 may proceed to Build.

---

## 2. Architecture Plan

### 2.1 Architectural Pattern

**CSS-only targeted fix** on an existing static component system (React 19 + Vite + TypeScript). Both items are isolated property changes on existing selectors in `src/styles/components/timeline.css`. No new abstractions, no new modules, no state changes.

### 2.2 Module Boundary Map

| Module | File | Change |
|---|---|---|
| `timeline` styles | `src/styles/components/timeline.css` | **MODIFY** — two non-overlapping hunks (§2.3 and §2.4) |
| `Timeline` component | `src/components/Timeline.tsx` | **UNTOUCHED** — CSS-only fix confirmed (OQ-4 resolved Gate 3A) |
| `ArgumentCard` component | `src/components/ArgumentCard.tsx` | **UNTOUCHED** |
| `argument-card` styles | `src/styles/components/argument-card.css` | **UNTOUCHED** — bubble tail uses `left: -8px` / `right: -8px` relative to card edge; `.timeline` padding provides ≥12 px clearance from viewport edge at all mobile widths; no `overflow: hidden` on any ancestor; no clipping |
| BDD feature file | `features/debate-screen-polish.feature` | **NEW** |
| BDD step definitions | `features/step-definitions/debate-screen-polish.steps.ts` | **NEW** |
| All other files | — | **UNTOUCHED** |

### 2.3 CSS Change Plan — Item 1 (Mobile Card Width ≤480 px)

**Figma authority:** Frame `620:145` (`DebateScreen-Polish/Default/Light/Mobile`), Tark card child `620:157`. Confirmed: `w=332 px, x=20 px` on 390 px viewport frame. `332 / 390 = 85.1% ≈ 85%`. Design QA Pass — `04-design-qa.md §Item 1`.

**Current state** (base rule, no media query, `timeline.css` ~line 34):

```css
/* ── List items: mobile-first single column ── */
.timeline__item {
    width: 72%;
}
```

**Required change** — single value update, same selector, same rule block:

```css
/* ── List items: mobile-first single column ── */
.timeline__item {
    width: 85%;
}
```

**Breakpoint scope:** Mobile-first base rule (no `@media` wrapper needed). Effective only at ≤480 px because `@media (min-width: 481px)` overrides with `width: auto`. Consistent with the existing mobile-first convention. No `@media (max-width: 480px)` wrapper is added — it would deviate from the established pattern.

**Stagger preservation:**
- `.timeline__item--tark { align-self: flex-start }` → Tark left-aligned within the flex column
- `.timeline__item--vitark { align-self: flex-end }` → Vitark right-aligned
- Both selectors are **unchanged**. Stagger is preserved at the new width automatically.

**360 px no-scroll check (AC-2):** `.timeline` padding = `var(--space-5)` = `1.25rem` (~20px at 16px root). The card at `85%` of its containing block, plus the `.timeline` padding, fits well within the 360 px viewport. No overflow introduced at any supported mobile width.

**Bubble tail clearance (AC-5):** `.argument-card--tark::before` at `left: -8px`; `.argument-card--vitark::before` at `right: -8px`. With `1.25rem` `.timeline` padding (~20px at 16px root), each tail sits ≥12 px from the viewport edge. No `overflow: hidden` on `.timeline` or ancestors. Tails are **not clipped**. `argument-card.css` change is **not required**.

### 2.4 CSS Change Plan — Item 2 (Vitark Spine-Cell Row Fix ≥481 px)

**Figma authority:** Frames `630:292` (Light/Tablet), `630:399` (Dark/Tablet), `630:507` (Light/Desktop), `630:616` (Dark/Desktop). All show spine dots correctly aligned at row 1. Design QA Pass — `04-design-qa.md §Item 2`.

**Root cause (confirmed):**
`Timeline.tsx` renders each `.timeline__item` with two children in DOM order: `[ArgumentCard, .timeline__spine-cell]`. For a Vitark item, the browser places the argument card at `grid-column: 3` (explicit). The auto-placement cursor then wraps past column 3 to row 2 before placing the spine-cell at `grid-column: 2`. Result: spine-cell lands in row 2. Tark is unaffected — its card occupies column 1, leaving column 2 reachable in the same row.

**Current state** (inside `@media (min-width: 481px)`, outside `@supports`):

```css
/* Per-row spine cell: column 2, centered dot */
.timeline__spine-cell {
    display: flex;
    grid-column: 2;
    align-items: center;
    justify-content: center;
}
```

**Required change** — add one property line:

```css
/* Per-row spine cell: column 2, row 1, centered dot */
.timeline__spine-cell {
    display: flex;
    grid-column: 2;
    grid-row: 1;
    align-items: center;
    justify-content: center;
}
```

**Placement:** Inside `@media (min-width: 481px)`, **outside** the `@supports (grid-template-columns: subgrid)` block. This is intentional — the fix must apply in both branches:

| Browser branch | Effect of `grid-row: 1` |
|---|---|
| Non-subgrid fallback | `.timeline__item` uses `grid-template-columns: 1fr 32px 1fr`. `grid-row: 1` forces spine-cell to row 1 of the item's implicit grid. Bug fixed. |
| Subgrid-supported | `.timeline__item` uses `grid-template-columns: subgrid`. Columns are inherited; rows are independent. `grid-row: 1` forces spine-cell to row 1 of the item's row context. Bug fixed. |

No `@supports` split is required. `grid-row` is not a subgrid feature; it applies uniformly.

**Tark regression check (AC-9):** Tark spine-cells are already in row 1 via natural auto-placement. Adding `grid-row: 1` explicitly confirms this implicit placement. No Tark regression.

**DOM reorder:** Not used. `Timeline.tsx` is untouched per OQ-4 resolution.

### 2.5 Exact Diff Summary

```diff
--- a/src/styles/components/timeline.css
+++ b/src/styles/components/timeline.css

@@ .timeline__item base rule @@
-    width: 72%;
+    width: 85%;

@@ .timeline__spine-cell inside @media (min-width: 481px) @@
     grid-column: 2;
+    grid-row: 1;
```

**Total change:** 2 lines in one file.

### 2.6 Independence Analysis — Parallel vs Sequential

| Dimension | Assessment |
|---|---|
| Same file? | Yes — `src/styles/components/timeline.css` |
| Same selector? | No — Item 1: `.timeline__item` base rule; Item 2: `.timeline__spine-cell` inside `@media (min-width: 481px)` |
| Same breakpoint block? | No — Item 1 is in the mobile-first base; Item 2 is inside `@media (min-width: 481px)` |
| Overlapping lines? | No — hunks are far apart in the file |
| Merge conflict risk? | Zero — non-overlapping hunks produce a clean 3-way merge |
| Same test file impact? | `Timeline.test.tsx` tests DOM structure only; neither CSS change alters the DOM. No conflict. |

**Verdict: PARALLEL development is feasible.** T-1 and T-2 can be developed on separate branches simultaneously. Merge is clean.

**Recommendation: Sequential preferred.** Total change is 2 lines. Parallel overhead (two branches, two PRs, rebase coordination) exceeds any time savings. Sequential order: T-1 → T-2 → T-3.

---

## 3. Impact Analysis

### Touched Files

| File | Change Type | Hunk |
|---|---|---|
| `src/styles/components/timeline.css` | Modify | Item 1: base rule `.timeline__item width` value. Item 2: `.timeline__spine-cell` + `grid-row: 1`. |
| `features/debate-screen-polish.feature` | New | BDD Gherkin scenarios |
| `features/step-definitions/debate-screen-polish.steps.ts` | New | DOM-structural step implementations |

### Untouched Files (Confirmed)

| File | Reason |
|---|---|
| `src/components/Timeline.tsx` | CSS-only fix; DOM order unchanged |
| `src/components/ArgumentCard.tsx` | No component change |
| `src/styles/components/argument-card.css` | Bubble tail clearance confirmed; no change |
| `src/styles/tokens.css` | No new tokens required |
| All other `src/styles/components/*.css` | No impact |
| All `tests/` files | AC-10: must pass unmodified |
| `src/data/debate.ts` | No data change |
| `index.html`, `src/main.tsx` | No entry-point change |

### Cascading Impact Assessment

- **Theme tokens:** Both light and dark themes use the same `timeline.css` selectors. Width change and `grid-row` fix apply in both themes via existing `[data-theme]` token mechanism. No theme-specific CSS blocks needed. (AC-11 — no cascade risk.)
- **WCAG 2.1 AA:** Width increase does not reduce contrast. Grid row fix does not alter DOM order or focus order. `.timeline__spine-cell` is `aria-hidden="true"`. (AC-12 — no a11y regression risk.)
- **Tablet/Desktop for Item 1:** The base `width: 85%` rule is overridden by `width: auto` at ≥481 px. No tablet/desktop layout impact.

---

## 4. Risk and Mitigation Plan

### 4.1 Containing-Block Percentage Resolution (Low)

**Risk:** `width: 85%` resolves against the `.timeline__list` content width (= viewport − 2 × `var(--space-5)` = viewport − 40 px), not the raw viewport width. On 390 px: content = 350 px; `85% × 350 = 297.5 px`. The Figma frame shows 332 px at 390 px viewport, which is 85% of the viewport frame itself. There is a dimensional gap between the Figma pixel value and the CSS `%` resolution in context.

**Mitigation:** The Figma `85%` approval is the target value; the exact pixel resolution in the live browser is subject to the containing block. Gate 5.5 runtime QA will measure computed width on 360 px and 390 px viewports. The pass criterion is: card is visually wider than the current ~72% rendering and no horizontal scroll occurs. An exact 332 px pixel match is a reference, not a hard gate criterion.

### 4.2 Empty Row 2 in Vitark Item Grid (Very Low)

**Risk:** Forcing spine-cell to `grid-row: 1` when the cursor was at row 2 could leave an empty implicit row 2 in the item grid.

**Mitigation:** With only 2 children (card + spine-cell) and both now explicitly in row 1, the browser creates no implicit row 2. AC-8 verifies child count = 2 via BDD DOM check. Confirmed at Gate 5.5 visually.

### 4.3 `@supports` Interaction (Very Low)

**Risk:** A partially subgrid-capable browser could behave unexpectedly with `grid-row: 1` outside the `@supports` block.

**Mitigation:** `grid-row: 1` is a baseline property (CSS Grid Level 1, universal support). No `@supports` condition needed. Theoretical risk only.

### 4.4 Mobile Text Clamp Regression (Very Low)

**Risk:** Wider card causes text reflow that affects the 4-line clamp.

**Mitigation:** `-webkit-line-clamp: 4` is line-count-based, not width-based. A wider card means more text fits per line, reducing scroll need. AC-4 verified visually at Gate 5.5.

---

## 5. Verification Strategy

### AC-to-Verification Map

| AC | Criterion | Verification Method | When |
|---|---|---|---|
| AC-1 | `.timeline__item` at 85% on 360 px viewport | Gate 5.5: Chrome DevTools computed width | Runtime QA |
| AC-2 | No horizontal scroll on 360 px viewport | Gate 5.5: `document.body.scrollWidth ≤ 360` | Runtime QA |
| AC-3 | Tark left / Vitark right at 85% | Gate 5.5: visual + `getBoundingClientRect()` | Runtime QA |
| AC-4 | 4-line clamp unchanged on mobile | Gate 5.5: visual truncation check at 480 px | Runtime QA |
| AC-5 | Bubble pointer visible, not clipped | Gate 5.5: visual check 360 px, both themes | Runtime QA |
| AC-6 | Vitark spine-cell in row 1 at 768 px | BDD DOM (spine-cell is 2nd child) + Gate 5.5 visual | BDD + Runtime QA |
| AC-7 | Vitark spine-cell in row 1 at 1280 px | Gate 5.5: visual + DevTools grid inspector | Runtime QA |
| AC-8 | Vitark item has exactly 2 children, both row 1 | BDD DOM child count assertion | BDD |
| AC-9 | Tark spine dots unaffected | BDD DOM (Tark items unchanged) + Gate 5.5 visual | BDD + Runtime QA |
| AC-10 | All existing tests pass unmodified | `npm test` — full vitest suite | Gate 5 CI |
| AC-11 | Light + dark themes correct at all viewports | Gate 5.5: 6-frame matrix (2 themes × 3 viewports) | Runtime QA |
| AC-12 | WCAG 2.1 AA maintained | Gate 5.5: axe-core scan; zero new violations | Runtime QA |

### Test Levels

1. **Existing vitest unit tests** (`tests/`) — run unmodified to confirm AC-10. No new unit tests added for CSS-only changes (CSS percentage widths are not computed in jsdom).
2. **BDD Cucumber** (`features/debate-screen-polish.feature`) — DOM structural assertions for AC-6, AC-8, AC-9. Layout metrics deferred to Gate 5.5.
3. **Gate 5.5 Runtime QA** — Chrome DevTools MCP across 6-frame theme × viewport matrix for all remaining ACs.

---

## 6. BDD Scenario Additions

**New file:** `features/debate-screen-polish.feature`

```gherkin
Feature: Debate Screen Polish
  As a public visitor
  I want to read debate arguments comfortably on mobile
  And see correctly aligned spine dots on tablet and desktop
  So that the timeline is legible and visually coherent

  Scenario: Argument cards carry the timeline item CSS class
    Given the debate screen is loaded
    Then each timeline item has the timeline__item CSS class

  Scenario: Tark argument cards have the tark side class
    Given the debate screen is loaded
    Then each Tark timeline item has the timeline__item--tark class

  Scenario: Vitark argument cards have the vitark side class
    Given the debate screen is loaded
    Then each Vitark timeline item has the timeline__item--vitark class

  Scenario: Each Vitark timeline item contains exactly two grid children
    Given the debate screen is loaded
    Then each Vitark timeline item has exactly 2 direct children

  Scenario: Each Vitark timeline item has a spine cell as its second child
    Given the debate screen is loaded
    Then each Vitark timeline item has a spine cell as its second child

  Scenario: Each Tark timeline item has a spine cell as its second child
    Given the debate screen is loaded
    Then each Tark timeline item has a spine cell as its second child

  Scenario: Spine dots are rendered for all argument cards
    Given the debate screen is loaded
    Then the number of spine dots equals the number of argument cards
```

---

## 7. Rollout and Rollback Strategy

**Rollout:** Both changes are in a single CSS file. Merge through the mandatory `slice/debate-screen-polish` integration branch, then open the final `slice/debate-screen-polish` → `master` PR. No feature flag required. Both changes are visually isolated to their respective breakpoints with no runtime branching.

**Rollback:** Before the final `slice/debate-screen-polish` → `master` PR merges, revert the relevant commit(s) on `slice/debate-screen-polish`. After promotion to `master`, revert the final merge commit/PR from `slice/debate-screen-polish` to restore both items atomically (if promoted together) or revert the specific slice-branch commit(s) if promoted separately. No migrations, no token removals, and no API rollback are required.

---

## 8. Open Questions

None. All open questions from Gates 1–3 are resolved:

| OQ | Resolution | Gate |
|---|---|---|
| OQ-1: target card width % | 85% — PO approved on frame `620:145` | Gate 3A |
| OQ-2: bubble tail anchor | Follows card edge via `right: -8px` / `left: -8px` — no change needed | Gate 2 |
| OQ-3: 72% width causes scroll? | Non-blocking per Gate 2 — no scroll confirmed at 72%; widening to 85% reduces risk further; AC-2 validates zero scroll at Gate 5.5 | Gate 2 |
| OQ-6: legend bar / composer impact | Unaffected — full-width, independent of card width | Gate 3A |
| OQ-4: spine dot fix mechanism | `grid-row: 1` CSS-only — PO accepted | Gate 3A |

---

## 9. Architecture Decision Log

| Decision | Options Considered | Chosen | Rationale |
|---|---|---|---|
| Spine-cell fix mechanism | (A) `grid-row: 1` CSS-only; (B) DOM reorder in `Timeline.tsx` | A | Zero DOM impact; no test breakage risk; minimal diff |
| `@supports` split for `grid-row` | (A) Place inside `@supports`; (B) Place outside (both branches) | B | `grid-row` is not a subgrid feature; splitting adds noise without benefit |
| Mobile-first wrapper | (A) Add `@media (max-width: 480px)` wrapper; (B) Modify base rule only | B | Preserves mobile-first convention; base rule already overridden at ≥481 px |
| `argument-card.css` change | (A) Adjust tail positioning; (B) No change | B | Bubble clearance analytically verified — ≥12 px from viewport edge at ≤360 px |
| New vitest unit tests | (A) Add computed-style tests; (B) BDD + Gate 5.5 only | B | jsdom does not compute CSS percentages or grid placement; runtime QA is the correct verification layer |

---

## 10. Quality Gaps

None. All architecture quality checks pass.

---

## 11. Gate Decision

**Can proceed to Build.**

Both items are CSS-only, single-line changes in non-overlapping selectors of one file. All AC-to-file mappings are unambiguous. No new tokens, no new components, no DOM changes. Implementation is deterministic.

---

## 12. Architecture Plan Package — Traceability

| AC | FR | Item | File | Selector | Property | Value | Figma Source |
|---|---|---|---|---|---|---|---|
| AC-1, AC-2, AC-3 | FR-1–3 | 1 | `timeline.css` | `.timeline__item` (base) | `width` | `85%` | `620:145` |
| AC-4 | FR-4 | 1 | (no change) | — | — | — | — |
| AC-5 | FR-5 | 1 | (no change) | — | — | — | — |
| AC-6, AC-7, AC-8 | FR-6, FR-8 | 2 | `timeline.css` | `.timeline__spine-cell` in `@media (min-width: 481px)` | `grid-row` | `1` | `630:292`, `630:507` |
| AC-9 | FR-7 | 2 | (no change) | — | — | — | — |
| AC-10–12 | FR-9–11 | cross | (no changes) | — | — | — | — |
