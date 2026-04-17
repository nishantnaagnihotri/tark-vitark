# Gate 2 — PRD — debate-screen-polish

**Date:** 2026-04-17
**PRD Version:** v0
**Slice:** `debate-screen-polish`
**Source Contract:** `docs/slices/debate-screen-polish/01-requirement.md` (Gate 1 ✅ Pass 2026-04-17)

---

## PRD Readiness

**Ready** — All Gate 1 acceptance criteria are represented one-to-one. OQ-1 carries a Product Owner-accepted placeholder in AC-1, pending Gate 3A Figma resolution. All open questions have populated Resolution fields.

---

## 1. Problem Statement and Expected Outcome

**Item 1 — Enhancement (Mobile Card Width):**
On Mobile Viewports (≤480px), Argument Cards currently render at 72% of the available width. This width is too narrow for comfortable reading of argument body text on devices as narrow as 360px. The expected outcome is that Argument Cards render at a wider target percentage, confirmed at Gate 3A via Figma frames, with no horizontal scroll introduced and Tark/Vitark Stagger preserved.

**Item 2 — Bug (Vitark Spine Dot Misalignment):**
On Tablet and Desktop Viewports (≥481px), Vitark Spine Dots render in grid row 2 of their `.timeline__item` instead of grid row 1. The root cause is CSS Grid Auto-Placement: after the browser places a Vitark Argument Card in column 3 (the last column), the auto-placement cursor advances to the next row before placing the Spine Cell in column 2, landing it in row 2. Tark Argument Cards are unaffected because their card lands in column 1, leaving the cursor able to place the Spine Cell in column 2 of the same row. The expected outcome is that Spine Dots for all Vitark Argument Cards appear vertically centered on their card midpoint, in the same grid row as their card, on all Tablet and Desktop Viewports.

---

## 2. Target Users and Primary Scenarios

| User | Scenario |
|---|---|
| Public visitor on a mobile phone (≤480px) | Reads debate arguments on a narrower screen; receives wider Argument Cards for improved legibility without horizontal scrolling. |
| Public visitor on a tablet (481px–1023px) | Views the debate Timeline; sees Vitark Spine Dots correctly aligned with their Argument Cards. |
| Public visitor on a desktop (≥1024px) | Views the debate Timeline; sees Vitark Spine Dots correctly aligned at wider viewport. |

---

## 3. In-Scope and Out-of-Scope

**In-scope:**
- `src/styles/components/timeline.css` — mobile card width CSS value; Spine Cell grid-row fix
- `src/styles/components/argument-card.css` — only if Chat Bubble Pointer adjustment is required at the new mobile width
- `src/components/Timeline.tsx` — only if DOM reorder is chosen as the Spine Dot fix strategy (OQ-4)
- BDD Gherkin scenarios covering both items
- Figma frames at Gate 3A to determine and confirm target mobile card width (resolving OQ-1 / AC-1)

**Out-of-scope:**
- Interactivity, state management, API, or routing changes
- Typography, color token, or Design System expansion
- Layout changes at Tablet or Desktop Viewports for Item 1 (card width)
- New component creation
- 4-line text clamp behavior changes
- Navigation changes

---

## 4. Functional Requirements

| ID | Requirement | Item | Gate 1 ACs |
|---|---|---|---|
| FR-1 | On Mobile Viewports (≤480px), each `.timeline__item` must render at the target width confirmed at Gate 3A via Figma frames (wider than the current 72%). | Item 1 | AC-1 |
| FR-2 | At the new mobile width, no horizontal scrollbar must be present on `<body>` or `.timeline` on a 360px-wide viewport. | Item 1 | AC-2 |
| FR-3 | Tark Argument Cards must remain left-aligned and Vitark Argument Cards must remain right-aligned (Stagger preserved) at the new mobile width. | Item 1 | AC-3 |
| FR-4 | The 4-line text clamp on `.argument-card__body--clamped` must remain unchanged on Mobile Viewports (≤480px). | Item 1 | AC-4 |
| FR-5 | The Chat Bubble Pointer (`::before`) on Tark and Vitark Argument Cards must be fully visible and not clipped within the Timeline container at the new mobile width. | Item 1 | AC-5 |
| FR-6 | On Tablet Viewports (≥481px) and Desktop Viewports (≥1024px), the Spine Cell for every Vitark Argument Card must occupy the same grid row (row 1) as its Argument Card and render its Spine Dot vertically centered on the card midpoint. | Item 2 | AC-6, AC-7, AC-8 |
| FR-7 | Tark Argument Card Spine Dots must be unaffected by the bug fix and remain correctly aligned on all Tablet and Desktop Viewports (≥481px). | Item 2 | AC-9 |
| FR-8 | The Spine Dot bug fix must work correctly in both subgrid-supported browsers and non-subgrid fallback browsers. | Item 2 | AC-6, AC-7, AC-8 (constraint) |
| FR-9 | All pre-existing tests in `tests/` must pass without modification after both changes are applied. | Cross-cutting | AC-10 |
| FR-10 | Light and Dark themes must render correctly for both changes at all relevant viewports (mobile, tablet, desktop). | Cross-cutting | AC-11 |
| FR-11 | WCAG 2.1 AA baseline must be maintained — no regression in contrast, keyboard traversal, or screen-reader behavior. | Cross-cutting | AC-12 |

---

## 5. Constraints and Non-Goals

**Constraints:**
- No horizontal scroll may be introduced at any supported Mobile Viewport width at the new card width.
- Tark/Vitark Stagger (Tark left, Vitark right) must be preserved at the new mobile width.
- Tark Spine Dots must remain unaffected by the bug fix.
- The Spine Dot bug fix must work in both subgrid-supported browsers and non-subgrid fallback browsers.
- All existing tests must remain green after changes.
- WCAG 2.1 AA baseline must be maintained — no regressions.
- File changes are limited to `src/styles/components/timeline.css`, `src/styles/components/argument-card.css` (pointer-only if needed), and `src/components/Timeline.tsx` (DOM reorder only if chosen by Gate 4).

**Non-Goals:**
- Changing the card width on Tablet or Desktop Viewports.
- Changing any design token, typography value, or Design System component.
- Adding new components or views.
- Changing the 4-line text clamp behavior.
- Interactivity, state management, API, or routing work.

---

## 6. Success Metrics

| # | Metric | Target |
|---|---|---|
| SM-1 | Horizontal scroll on Mobile Viewports at new card width | Zero scrollbar occurrences on 360px viewport |
| SM-2 | Vitark Spine Dot alignment on Tablet and Desktop | 100% of Vitark Argument Cards have Spine Dot in row 1 on 768px and 1280px viewports |
| SM-3 | Acceptance criteria pass rate | All 12 ACs (AC-1–AC-12) pass in Gate 5 BDD/test run |
| SM-4 | Pre-existing test suite | All tests in `tests/` pass without modification |
| SM-5 | WCAG 2.1 AA regression | Zero new contrast, keyboard traversal, or screen-reader failures |

---

## 7. Acceptance Criteria

AC-1 carries a Product Owner-accepted placeholder pending Gate 3A Figma resolution (OQ-1). All other ACs are frozen.

| ID | Criterion | Status |
|---|---|---|
| AC-1 | On a 360px-wide mobile viewport, `.timeline__item` renders at the target width confirmed at Gate 3A via Figma frames. | Pending Gate 3A (OQ-1) |
| AC-2 | At the new width on a 360px-wide viewport, no horizontal scrollbar is present on `<body>` or `.timeline`. | Ready |
| AC-3 | Tark cards are left-aligned and Vitark cards are right-aligned at the new mobile width (Stagger preserved). | Ready |
| AC-4 | The 4-line text clamp on `.argument-card__body--clamped` is unchanged on mobile (≤480px). | Ready |
| AC-5 | The Chat Bubble Pointer (`::before`) on Tark and Vitark cards is fully visible and not clipped within the Timeline container at the new width. | Ready |
| AC-6 | On a 768px-wide Tablet Viewport, the `.timeline__spine-cell` dot for every Vitark Argument Card appears in the same grid row as its `.argument-card`, vertically centered on the card midpoint. | Ready |
| AC-7 | On a 1280px-wide Desktop Viewport, AC-6 holds for all Vitark Argument Cards. | Ready |
| AC-8 | No extra row is present in `.timeline__item` for any Vitark card — the item contains exactly 2 grid children (card + spine-cell), both in grid row 1. | Ready |
| AC-9 | Tark Argument Card Spine Dots are unaffected — correctly aligned on all Tablet and Desktop Viewports ≥481px. | Ready |
| AC-10 | All existing tests in `tests/` pass without modification. | Ready |
| AC-11 | Light and Dark themes render correctly for both changes at all relevant viewports. | Ready |
| AC-12 | WCAG 2.1 AA baseline maintained — no regression in contrast, keyboard traversal, or screen-reader behavior. | Ready |

---

## 8. Dependencies and Risks

| ID | Type | Description | Mitigation |
|---|---|---|---|
| DEP-1 | Gate Dependency | AC-1 target mobile card width cannot be finalized until Gate 3A Figma frames are reviewed by Product Owner (OQ-1). | AC-1 carries an explicit placeholder; all other ACs are independent and unblocked. |
| DEP-2 | Gate Dependency | CSS fix strategy for Spine Dot bug (OQ-4: options a, b, or c) must be decided at Gate 4 Architecture before build begins. | Three valid strategies are identified; Gate 4 decides; downstream build scope (`.tsx` vs `.css`-only) depends on the choice. |
| RISK-1 | Browser Compatibility | Spine Dot fix must work in both subgrid-supported and non-subgrid fallback browsers. | FR-8 and existing `@supports (grid-template-columns: subgrid)` branch in `timeline.css` must be addressed by the chosen fix strategy. |
| RISK-2 | Scroll Regression | Widening mobile cards could introduce horizontal scroll if sizing units or container padding are miscalculated. | AC-2 explicitly gates for zero horizontal scroll; Gate 5.5 QA validates at 360px. |
| RISK-3 | Stagger Regression | Widening mobile cards could break the Stagger alignment if `align-self` behavior changes. | AC-3 gates for stagger preservation; FR-3 is an explicit requirement. |
| RISK-4 | Pointer Clipping | A wider card near 100% could clip the Chat Bubble Pointer if container overflow is not managed. | AC-5 explicitly gates for pointer visibility; `argument-card.css` is in scope if pointer adjustment is needed. |

---

## 9. Open Questions

| ID | Question | Source | Status | Resolution |
|---|---|---|---|---|
| OQ-1 | What is the target mobile card width (%, px, or vw) for `.timeline__item` on ≤480px viewports? | Gate 1 OQ-1 | **Unresolved — Non-Blocking** | No final value yet. Pending Gate 3A Figma frames review. AC-1 carries placeholder. PO accepted this open at Gate 1 (2026-04-17). Must be resolved and AC-1 amended before Gate 5. Gate 3A owns resolution. |
| OQ-3 | Does the current 72% card width cause actual horizontal scrolling on any supported mobile device today? | Gate 1 OQ-3 | **Unresolved — Non-Blocking** | No confirmed report of horizontal scroll at 72%. Non-blocking; this is a UX improvement, not a scroll regression fix. No gate assignment required. |
| OQ-4 | Which CSS fix strategy for the Spine Dot bug: (a) `grid-row: 1` on `.timeline__spine-cell`, (b) DOM reorder in `Timeline.tsx`, or (c) `grid-auto-flow: dense` on `.timeline__item`? | Gate 1 OQ-4 | **Unresolved — Non-Blocking** | No decision yet. Default assumption: strategy (a) is least invasive CSS-only option. Gate 4 Architecture must evaluate all three and decide. Must be resolved at Gate 4 before Build. Gate 4 owns resolution. |
| OQ-5 | Must the Spine Dot fix be verified at tablet viewports only, or both tablet and desktop? | Gate 1 OQ-5 | **De-facto resolved** | AC-6 (768px tablet) and AC-7 (1280px desktop) both gate Spine Dot alignment. Both viewports are explicitly in scope. No further gate action required. |

---

## 10. Domain Glossary

| Term | Definition |
|---|---|
| Tark | The "for" side of the debate; arguments supporting the topic. |
| Vitark | The "against" side of the debate; arguments opposing the topic. |
| Timeline | Visual structure for sequencing arguments in a vertical flow. |
| Argument Card | Styled card component presenting one argument, with side-specific color and pointer. |
| Spine | Center vertical line dividing Tark and Vitark columns on Tablet and Desktop. |
| Spine Cell | CSS grid cell (column 2) within a `.timeline__item`; contains the Spine Dot. |
| Spine Dot | Circular marker per argument, centered on the Spine at that argument's row. |
| Chat Bubble Pointer | Triangular `::before` pseudo-element on an Argument Card that points toward the Spine. |
| Stagger | Mobile layout pattern where Tark cards align left and Vitark cards align right. |
| Mobile Viewport | Screen width ≤480px; single-column flex layout. |
| Tablet Viewport | Screen width ≥481px and <1024px; 3-column CSS Grid with Spine. |
| Desktop Viewport | Screen width ≥1024px; 3-column CSS Grid with wider outer padding. |
| Grid Auto-Placement | Browser algorithm that assigns implicit grid rows to items lacking explicit row declarations; root cause of the Vitark Spine Dot bug. |

---

## Requirement-to-PRD Alignment Check

| Gate 1 Source | PRD Section | Notes |
|---|---|---|
| RCP Requirement Statement (Item 1) | FR-1, FR-2, FR-3, FR-4, FR-5 | Full coverage |
| RCP Requirement Statement (Item 2) | FR-6, FR-7, FR-8 | Full coverage |
| RCP Constraint: No horizontal scroll | FR-2, §5 Constraints | Duplicated as FR and constraint |
| RCP Constraint: Stagger preserved | FR-3, §5 Constraints | OQ-2 resolved; preserved verbatim |
| RCP Constraint: Tark spine dots unaffected | FR-7, §5 Constraints | Explicit FR + constraint |
| RCP Constraint: Subgrid + fallback | FR-8, §5 Constraints | Explicit FR; strategy deferred to Gate 4 |
| RCP Constraint: All existing tests green | FR-9, §5 Constraints | Mapped to AC-10 |
| RCP Constraint: WCAG 2.1 AA | FR-11, §5 Constraints | Mapped to AC-12 |
| Gate 1 AC-1–AC-12 | PRD AC-1–AC-12 | Verbatim, one-to-one |
| Gate 1 In-scope file list | §3 In-scope | Verbatim |
| Gate 1 Out-of-scope list | §3 Out-of-scope | Verbatim |
| Gate 1 Domain Glossary (13 terms) | §10 Domain Glossary | All 13 terms carried forward |

**Owner-approved deltas:** None.

---

## Gate Decision

**✅ Can proceed to Gate 3 (Design).**

All 11 ACs with `Status: Ready` are unblocked. AC-1 carries a PO-accepted placeholder. OQ-4 deferred to Gate 4. No unauthorized scope expansion detected.
