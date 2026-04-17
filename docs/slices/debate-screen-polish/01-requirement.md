# Gate 1 — Requirement — debate-screen-polish

**Date:** 2026-04-17
**Complexity:** Standard (full 6-gate flow)
**Gate Decision:** ✅ Pass — OQ-2 resolved, OQ-1 PO-accepted open to be resolved at Gate 3A

---

## Requirement Statement

On the existing debate-screen, (1) widen mobile argument cards beyond 72% to improve readability on ≤480px viewports, and (2) fix Vitark spine dots that render in grid row 2 instead of grid row 1 on tablet/desktop viewports (≥481px).

---

## Problem and Expected Outcome

**Item 1 — Enhancement (Mobile card width):**
Audience on mobile cannot comfortably read argument content at 72% card width. Expected: Cards render at a wider percentage (to be confirmed at Gate 3A via Figma frames) on ≥360px mobile devices, with no horizontal scroll introduced. Tark cards remain left-aligned, Vitark cards remain right-aligned (stagger preserved — confirmed by PO 2026-04-17).

**Item 2 — Bug (Spine dot misalignment):**
Vitark spine dots appear displaced below their card on tablet/desktop due to CSS Grid auto-placement cursor behavior. The grid cursor wraps to row 2 after placing the Vitark card in the last column (col 3), so `.timeline__spine-cell` (explicit `grid-column: 2`, implicit row) lands in row 2 instead of row 1. Tark cards are unaffected. Expected: All spine dots appear vertically centered on their card midpoint, in the same grid row as the card, on all tablet and desktop viewports.

---

## Users and Scenarios

- **Audience (public visitor) on a mobile phone:** sees wider argument cards, reads more content per card without scrolling.
- **Audience on tablet or desktop:** sees Vitark spine dots correctly aligned with their argument cards.

---

## Scope Boundaries

**In-scope:**
- `src/styles/components/timeline.css` — mobile width value; spine-cell grid-row fix
- `src/styles/components/argument-card.css` — only if chat-bubble pointer adjustment needed
- `src/components/Timeline.tsx` — only if DOM reorder chosen for bug fix
- BDD Gherkin scenarios for both items
- Figma frames at Gate 3A to determine target mobile card width

**Out-of-scope:**
- Interactivity, state management, or API changes
- Typography, color token, or design-system changes
- Layout changes at tablet or desktop breakpoints for Item 1
- New component creation
- Routing or navigation changes
- 4-line text clamp behavior

---

## Constraints

- No horizontal scroll introduced at any supported mobile width.
- Tark/Vitark stagger (Tark left, Vitark right) must be preserved at the new mobile width.
- Tark spine dots must remain unaffected.
- Bug fix must work in both subgrid-supported and non-subgrid fallback browsers.
- All existing tests must remain green.
- WCAG 2.1 AA baseline maintained — no regression.

---

## Acceptance Criteria

| ID | Criterion | Status |
|---|---|---|
| AC-1 | On a 360px-wide mobile viewport, `.timeline__item` renders at the target width confirmed at Gate 3A via Figma frames. | Pending Gate 3A |
| AC-2 | At the new width on a 360px-wide viewport, no horizontal scrollbar is present on `<body>` or `.timeline`. | Ready |
| AC-3 | Tark cards are left-aligned and Vitark cards are right-aligned at the new mobile width (stagger preserved). | Ready |
| AC-4 | The 4-line text clamp on `.argument-card__body--clamped` is unchanged on mobile (≤480px). | Ready |
| AC-5 | The chat-bubble pointer (`::before`) on Tark and Vitark cards is fully visible and not clipped within the timeline container at the new width. | Ready |
| AC-6 | On a 768px-wide tablet viewport, the `.timeline__spine-cell` dot for every Vitark argument card appears in the same grid row as its `.argument-card`, vertically centered on the card midpoint. | Ready |
| AC-7 | On a 1280px-wide desktop viewport, AC-6 holds for all Vitark argument cards. | Ready |
| AC-8 | No extra row is present in `.timeline__item` for any Vitark card — the item contains exactly 2 grid children (card + spine-cell), both in grid row 1. | Ready |
| AC-9 | Tark argument card spine dots are unaffected — correctly aligned on all tablet/desktop viewports ≥481px. | Ready |
| AC-10 | All existing tests in `tests/` pass without modification. | Ready |
| AC-11 | Light and Dark themes render correctly for both changes at all relevant viewports. | Ready |
| AC-12 | WCAG 2.1 AA baseline maintained — no regression in contrast, keyboard traversal, or screen-reader behavior. | Ready |

---

## Domain Glossary

Inherited from `debate-screen` Gate 1; extended with polish-specific terms.

| Term | Definition |
|---|---|
| Tark | The "for" side of the debate; arguments supporting the topic. |
| Vitark | The "against" side of the debate; arguments opposing the topic. |
| Timeline | Visual structure for sequencing arguments in a vertical flow. |
| Argument Card | Styled card component presenting one argument, with side-specific color and pointer. |
| Spine | Center vertical line dividing Tark and Vitark columns on tablet/desktop. |
| Spine Cell | CSS grid cell (column 2) within a `.timeline__item`; contains the Spine Dot. |
| Spine Dot | Circular marker per argument, centered on the Spine at that argument's row. |
| Chat Bubble Pointer | Triangular `::before` pseudo-element on an Argument Card that points toward the Spine. |
| Stagger | Mobile layout pattern where Tark cards align left and Vitark cards align right within a single flex column. |
| Mobile Viewport | Screen width ≤480px; single-column flex layout. |
| Tablet Viewport | Screen width ≥481px and <1024px; 3-column CSS Grid with spine. |
| Desktop Viewport | Screen width ≥1024px; 3-column CSS Grid with wider outer padding. |
| Grid Auto-Placement | Browser algorithm that assigns implicit grid rows to items lacking explicit row declarations; root cause of the Vitark dot bug. |

---

## Open Questions

| # | Question | Blocking? | Status |
|---|---|---|---|
| OQ-1 | Target mobile card width (%, px, or vw). | ~~Blocking~~ | **PO-accepted open** — to be resolved at Gate 3A via Figma frames |
| OQ-2 | Stagger intent: preserve Tark left / Vitark right? | ~~Blocking~~ | **Resolved** — stagger preserved (PO 2026-04-17) |
| OQ-3 | Does current 72% cause actual horizontal scrolling today? | Non-blocking | Carry forward as accepted open |
| OQ-4 | Preferred CSS fix strategy for spine dot: (a) `grid-row: 1`, (b) DOM reorder, (c) `grid-auto-flow: dense`? | Non-blocking | Carry forward to Gate 4 |
| OQ-5 | Verify spine dot fix at tablet only, or tablet + desktop? | Non-blocking | Carry forward as accepted open (AC-6 + AC-7 cover both) |

---

## Requirement Context Package

```
Slice: debate-screen-polish
Complexity: Standard
Gate 1 Decision: ✅ Pass

Requirement: Widen mobile argument cards (width TBD at Gate 3A) + fix Vitark
  spine dot CSS grid auto-placement bug on tablet/desktop.

Resolved: OQ-2 — stagger preserved (Tark left, Vitark right).
Accepted open: OQ-1 (width — Gate 3A), OQ-3, OQ-4 (Gate 4), OQ-5.

Frozen scope boundaries and constraints: as listed above.
Acceptance criteria: AC-1 through AC-12 (AC-1 value pending Gate 3A).
Domain Glossary: 13 terms as listed above.
```
