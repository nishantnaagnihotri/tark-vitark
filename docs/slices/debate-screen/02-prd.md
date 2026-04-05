# PRD v0 — debate-screen

## 1. Problem Statement and Expected Outcome

TarkVitark's current public presence is a coming-soon splash page. While this established initial awareness, it does not communicate the product's core identity as a debate platform. Visitors cannot understand what TarkVitark does from the splash page alone.

**Expected outcome:** A single debate screen replaces the coming-soon splash page at the root path (`/`). The page renders a debate topic with arguments displayed in a sequential thread — each argument is a "Tark" (for) or "Vitark" (against) posted in a specific order, forming a flowing conversation rather than two parallel lists. The page immediately communicates TarkVitark's purpose as a debate platform. The page is responsive, accessible (WCAG 2.1 AA), supports Light/Dark themes, and is built using a JavaScript framework (chosen at Gate 4) for future extensibility.

## 2. Target Users and Primary Scenarios

| User | Description |
|---|---|
| **Public visitor — desktop** | Any person who navigates to the TarkVitark URL on a desktop or laptop browser (viewport ≥1024px). |
| **Public visitor — tablet** | Any person who navigates to the TarkVitark URL on a tablet device (viewport ~768px). |
| **Public visitor — mobile** | Any person who navigates to the TarkVitark URL on a mobile device browser (viewport ≤480px). |

**Primary scenario:** A visitor lands on the site on any device. They see a debate topic displayed prominently, with arguments displayed in sequential posting order as a flowing debate thread. Each argument is visually identified as a Tark (for) or Vitark (against) through color coding — blue for Tark, amber for Vitark. The visitor reads the arguments in order and understands this is a debate platform. No interaction is required to consume the content.

**Out-of-scope user scenarios:** Authenticated users, users submitting arguments, users voting or commenting, users navigating to other pages, users on smartwatch or TV viewports.

## 3. In-Scope and Out-of-Scope

### In-Scope

| ID | Item |
|---|---|
| IS-1 | Single debate screen |
| IS-2 | Topic display (prominently rendered) |
| IS-3 | "For" (Tark) argument display — blue-toned cards, semantically neutral |
| IS-4 | "Against" (Vitark) argument display — amber-toned cards, semantically neutral |
| IS-4a | Sequential debate thread: arguments rendered in posting order, not grouped by side |
| IS-5 | Responsive layout: desktop (≥1024px), tablet (~768px), mobile (≤480px) |
| IS-6 | JavaScript framework usage (framework chosen at Gate 4) |
| IS-7 | Static hardcoded content (single debate) |
| IS-8 | Light/Dark theme support via CSS token system (`[data-theme]` selectors + `prefers-color-scheme` fallback) |
| IS-9 | Accessibility baseline (WCAG 2.1 AA): semantic HTML, keyboard navigability, contrast ratios, ARIA attributes |
| IS-10 | Replaces coming-soon splash page at root path (`/`) |

### Out-of-Scope

| Item | Reason |
|---|---|
| User interaction (voting, commenting, submitting arguments) | Explicitly excluded — read-only slice |
| Dynamic data loading | Explicitly excluded — static hardcoded content only |
| Multiple debates or parameterized content | Scope limited to single debate |
| Navigation/routing beyond root | No routing or multi-page structure |
| API integration | No backend or API layer |
| Offline support | Not required |
| Authentication | No user identity system |
| Permanent branding system | New visual direction; not a final brand definition |
| Argument overflow/pagination | Deferred to UX Agent at Gate 3 |
| Framework selection | Deferred to Architecture Agent at Gate 4 |

## 4. Functional Requirements

| ID | Requirement | Priority | Traced To |
|---|---|---|---|
| FR-1 | The page **shall** render a debate screen using a JavaScript framework (specific framework determined at Gate 4). The PRD is framework-agnostic. | Must Have | AC-1 |
| FR-2 | The page **shall** display a debate topic prominently as the primary content heading or focal element. | Must Have | AC-2 |
| FR-3 | The page **shall** display arguments in a sequential thread in their posting order, not grouped into separate "for" and "against" sections. Each argument is visually identified as Tark (for) or Vitark (against) through semantically neutral color coding (blue for Tark, amber for Vitark). | Must Have | AC-3, AC-4 |
| FR-4 | On desktop/tablet, the debate thread **shall** use a timeline layout with a center spine — Tark cards branch left, Vitark cards branch right, in posting order top-to-bottom. On mobile, the thread **shall** collapse to a single column with cards stacked in posting order, differentiated by color coding and position. A sticky legend bar **shall** identify the two sides (Tark / Vitark) without per-card text labels. | Must Have | AC-7 |
| FR-5 | The debate content (topic and ordered argument thread) **shall** be hardcoded as static data within the application source. Each argument entry includes side (tark/vitark), text content, and sequence position. | Must Have | AC-5 |
| FR-6 | The page **shall** be read-only. All debate content is consumable without any user interaction. No input controls, forms, buttons, or interactive affordances **shall** be present. | Must Have | AC-6 |
| FR-7 | The layout **shall** be responsive and render without broken layout, text overflow, or hidden content at desktop (≥1024px), tablet (~768px), and mobile (≤480px) viewport widths. | Must Have | AC-7 |
| FR-8 | The debate screen **shall** replace the coming-soon splash page as the landing page served at the root path (`/`). | Must Have | AC-8 |
| FR-9 | The page **shall** use semantic HTML elements, support keyboard navigability, meet WCAG 2.1 AA contrast ratios, and include appropriate ARIA attributes. | Must Have | AC-9 |
| FR-10 | The page **shall** support Light and Dark themes via `[data-theme]` selectors and `prefers-color-scheme` media query fallback, using CSS custom properties from `src/styles/tokens.css`. | Must Have | AC-10 |

## 5. Constraints and Non-Goals

| ID | Constraint / Non-Goal | Source |
|---|---|---|
| C-1 | Framework selection is deferred to Gate 4 Architecture Discussion Phase. PRD and all pre-Gate 4 artifacts must be framework-agnostic. | Owner Decision Log |
| C-2 | No requirement to match the coming-soon splash page visual style. This is a new visual direction. | Owner Decision Log |
| C-3 | No permanent branding system creation is implied by this slice. | RCP Constraints |
| C-4 | Argument overflow/pagination strategy is deferred to UX Agent at Gate 3. | RCP Constraints |
| C-5 | The "for"/"against" labels are functional names; final UI labels (e.g., "Tark"/"Vitark") are a UX/design decision at Gate 3. | RCP Accepted Assumptions #2 |
| C-6 | No navigation chrome expected beyond what UX recommends at Gate 3. | RCP Accepted Assumptions #6 |
| C-7 | Interactivity (voting, commenting, submitting) is firmly deferred. Scope creep toward interactivity must be rejected. | RCP Risk |

## 6. Success Metrics

| ID | Metric | Measurement Method |
|---|---|---|
| SM-1 | The page clearly presents a debate topic to the visitor. | Reviewer assessment: topic is visible, prominent, and unambiguous. |
| SM-2 | For and against arguments are organized and readable. | Reviewer assessment: arguments are visually grouped, labeled, and legible at all three breakpoints. |
| SM-3 | The page is usable across standard screen sizes without layout failures. | Automated and manual viewport testing at ≥1024px, ~768px, and ≤480px — no broken layout, overflow, or hidden content. |
| SM-4 | WCAG 2.1 AA accessibility standards are met. | Automated contrast ratio checks, keyboard navigation walkthrough, semantic HTML inspection, ARIA audit. |
| SM-5 | Light and Dark themes render correctly. | Manual toggle of `data-theme` attribute and `prefers-color-scheme` simulation — all content remains legible, no missing styles. |

## 7. Acceptance Criteria

| ID | Acceptance Criterion | Testable? | Traced To |
|---|---|---|---|
| AC-1 | A debate screen is rendered using a JavaScript framework (framework chosen at Gate 4). | Yes — source inspection confirms framework usage after Gate 4 | RCP AC-1 |
| AC-2 | The screen displays a debate topic prominently. | Yes — visual + DOM inspection; topic is the primary heading/focal element | RCP AC-2 |
| AC-3 | The screen displays Tark ("for") arguments in a sequential thread, visually identified by blue color coding. | Yes — DOM inspection; Tark arguments present in thread order with blue styling | RCP AC-3 |
| AC-4 | The screen displays Vitark ("against") arguments in a sequential thread, visually identified by amber color coding. | Yes — DOM inspection; Vitark arguments present in thread order with amber styling | RCP AC-4 |
| AC-5 | The debate content is hardcoded (single debate, static data). | Yes — source inspection; no API calls, no dynamic loading, data is in-source | RCP AC-5 |
| AC-6 | The screen is read-only — no user interaction is required for the content to be usable. | Yes — DOM inspection; no input, form, button, or interactive control elements | RCP AC-6 |
| AC-7 | The layout is responsive and renders without broken layout, text overflow, or hidden content on desktop (≥1024px), tablet (~768px), and mobile (≤480px) viewports. | Yes — viewport simulation at all three breakpoints | RCP AC-7 |
| AC-8 | The screen replaces the coming-soon splash page as the landing page at the root path. | Yes — navigate to `/` and confirm debate screen renders; coming-soon page no longer appears | RCP AC-8 |
| AC-9 | Semantic HTML, keyboard navigability, WCAG 2.1 AA contrast ratios, and appropriate ARIA attributes are implemented. | Yes — axe/Lighthouse audit, manual keyboard walkthrough, contrast ratio check | RCP AC-9 |
| AC-10 | Light and Dark themes are supported via `[data-theme]` selectors and `prefers-color-scheme` fallback, using CSS custom properties from the token system. | Yes — toggle `data-theme`, simulate `prefers-color-scheme`; all content legible, no missing styles | RCP AC-10 |

## 8. Dependencies and Risks

| Type | Description | Mitigation / Owner |
|---|---|---|
| Dependency | Framework choice at Gate 4 — affects build tooling, project structure, and task decomposition. | PRD is framework-agnostic. Gate 4 Architecture Discussion Phase will resolve. |
| Dependency | Token system expansion — current `src/styles/tokens.css` contains minimal tokens. New visual direction will require additional color, typography, and spacing tokens. | Token expansion scoped during Gate 3 UX / Gate 4 Architecture. |
| Risk | Scope creep toward interactivity (voting, commenting, submitting). | Firmly deferred per Owner Decision Log. Any interactivity request must be escalated to Product Owner. |
| Risk | Framework introduction changes project build/deploy story. | Gate 4 Architecture must address build tooling, dev server, and deployment changes. |
| Risk | Coming-soon page retirement may affect any existing links or bookmarks. | Low risk — pre-launch site with minimal traffic. Root path simply shows new content. |

## Requirement-to-PRD Alignment Check

| RCP Field | PRD Section | Delta from RCP |
|---|---|---|
| Requirement Statement | §1 Problem Statement | None — preserved verbatim in intent |
| Problem and Expected Outcome | §1 Problem Statement | None — expanded with context, no scope change |
| Users and Scenarios | §2 Target Users | None — expanded to table format |
| Scope Boundaries — In-Scope | §3 In-Scope (IS-1..IS-10) | None — one-to-one mapping |
| Scope Boundaries — Out-of-Scope | §3 Out-of-Scope | None — all items preserved |
| Constraints and Non-Goals | §5 Constraints (C-1..C-7) | None — added C-5, C-6, C-7 from Accepted Assumptions and Risks for explicitness; no scope change |
| Success Criteria | §6 Success Metrics (SM-1..SM-5) | None — operationalized into measurable metrics |
| Dependencies and Risks | §8 Dependencies and Risks | None — added mitigation column |
| Acceptance Criteria AC-1..AC-10 | §7 AC-1..AC-10 | None — all 10 preserved verbatim; added testability notes |
| Open Questions OQ-1, OQ-2 | §9 Open Questions | None — carried forward with Resolution fields |
| Accepted Assumptions 1–7 | §5 Constraints, §3 Scope | None — folded into sections as constraints or scope clarifications |
| Complexity Classification | §1 (referenced) | None — Standard, confirmed by Owner |
| Owner Decisions Log | §5 Constraints | None — decisions encoded as constraints |

**Owner-approved deltas:**
1. **Sequential thread model (v0.1):** Gate 1 RCP described "for" and "against" as grouped lists. During Gate 3B design review, Product Owner reframed the debate as a sequential conversation — arguments posted in order, each potentially responding to any earlier argument. FR-3, FR-4, FR-5, IS-3, IS-4, AC-3, AC-4 updated. Owner confirmed 2026-04-05.
2. **Semantically neutral colors (v0.1):** Argument colors changed from green/red (value-laden) to blue/amber (neutral). Owner confirmed 2026-04-04. Recorded as Known Rule #40.
3. **Legend bar replaces per-card labels (v0.2):** Per-card "Tark"/"Vitark" text labels removed. A sticky legend bar with colored dots conveys side identity alongside color coding and card position. Owner confirmed 2026-04-05.

## Traceability Map

| PRD Section / ID | Requirement Context Package Source |
|---|---|
| §1 (Problem Statement) | RCP — Requirement Statement; Problem and Expected Outcome |
| §2 (Target Users) | RCP — Users and Scenarios |
| §3 IS-1..IS-10 | RCP — Scope Boundaries (In-Scope), one-to-one |
| §3 Out-of-Scope | RCP — Scope Boundaries (Out-of-Scope), one-to-one |
| FR-1..FR-10 | RCP AC-1..AC-10, one-to-one |
| C-1..C-7 | RCP Constraints, Accepted Assumptions, Risks |
| SM-1..SM-5 | RCP Success Criteria |
| AC-1..AC-10 | RCP AC-1..AC-10, one-to-one |
| §8 Dependencies | RCP Dependencies and Risks |
| OQ-1, OQ-2 | RCP Open Questions |

## Quality Gaps

| ID | Gap | Severity | Disposition |
|---|---|---|---|
| QG-1 | Token system is minimal. New visual direction will require additional color, typography, and spacing tokens. | Medium | Non-blocking. Token expansion at Gates 3–4. |
| QG-2 | Hardcoded debate content is undefined. | Low | Non-blocking. UX may use placeholder content. Final content by Gate 5. |
| QG-3 | Number of arguments is unspecified. | Low | Non-blocking. UX recommends representative count at Gate 3. |
| QG-4 | Coming-soon page retirement mechanism depends on framework choice at Gate 4. | Low | Non-blocking. Gate 4 Architecture defines approach. |
| QG-5 | "Prominent" topic display is subjective. | Low | Non-blocking. UX defines visual hierarchy at Gate 3. |

## Open Questions

| ID | Question | Source | Status | Resolution |
|---|---|---|---|---|
| OQ-1 | Browser support baseline | RCP OQ-1 | Resolved | Modern evergreen browsers (Chrome, Firefox, Safari, Edge latest 2 versions). IE excluded. |
| OQ-2 | Argument overflow/pagination strategy | RCP OQ-2 | Resolved | Natural page scroll (no scroll containers). Resolved at Gate 3A UX. |

## PRD Draft Package

### Canonical Requirement Summary

| Field | Value |
|---|---|
| Slice | `debate-screen` |
| Product | TarkVitark |
| Deliverable | Single debate screen replacing coming-soon splash page |
| Technology | JavaScript framework (framework-agnostic until Gate 4) |
| Core content | Debate topic + "for" arguments + "against" arguments |
| Content source | Hardcoded static data |
| Visual direction | New direction, not tied to coming-soon splash page |
| Responsive targets | Desktop (≥1024px), tablet (~768px), mobile (≤480px) |
| Theme support | Light/Dark via `[data-theme]` + `prefers-color-scheme` fallback |
| Accessibility | WCAG 2.1 AA (universal default) |
| Audience | Public visitors, all devices |

### Gate Decision

**PRD Readiness:** Ready
**Gate Decision:** can proceed to design

### PR Description

```
## Gate 2 — PRD v0: debate-screen

**Summary:** Product Requirements Document for the debate-screen slice — a single, static, read-only debate screen displaying a topic with for/against arguments, replacing the coming-soon splash page at root path.

**Slice folder:** `docs/slices/debate-screen/`

**Gate status:** ✅ READY — all PRD quality checks pass; proceed to Gate 3 (UX/Design).

### Open Questions

| ID | Question | Status | Resolution |
|---|---|---|---|
| OQ-1 | Browser support baseline | Resolved | Modern evergreen browsers (Chrome, Firefox, Safari, Edge latest 2 versions). IE excluded. |
| OQ-2 | Argument overflow/pagination strategy | Resolved | Use natural page scroll; do not introduce a dedicated scrollable arguments container. |

### Gate Blocking

- No questions block Gate 2 progression.

**Artifact:** `docs/slices/debate-screen/02-prd.md`
```
