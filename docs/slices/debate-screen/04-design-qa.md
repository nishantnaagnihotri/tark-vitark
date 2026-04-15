# Design QA Verdict Package — debate-screen

## Design QA Readiness

**Approved** — All checks pass. Pass 6 covers post-tark-vitark Composer addition across all 6 frames. Product Owner approved Gate 3 closure 2026-04-15.

## Canonical Requirement Summary

| Field | Value |
|---|---|
| Slice | `debate-screen` |
| Product | TarkVitark |
| Deliverable | Single debate screen replacing coming-soon splash page |
| Core content | Debate topic + 8 arguments in sequential thread (4 Tark, 4 Vitark) |
| Layout | Timeline with center spine (desktop/tablet), chat-bubble stagger (mobile) |
| Legend | Sticky bar with colored dots — "● Tark · for · ● Vitark · against" — center-aligned with timeline spine |
| Card shape | Asymmetric corner radii (4px sharp on speaker side, 12px rounded on other three) + 8×10px triangular tail |
| Responsive targets | Desktop (≥1024px), Tablet (~768px), Mobile (≤480px) |
| Theme support | Light/Dark via 14 library variables with dual-mode values |
| Accessibility | WCAG 2.1 AA (verified at implementation; design uses neutral blue/amber per Known Rule #40) |

## Scope Boundaries

- **In-scope:** Debate screen display at 3 breakpoints (Desktop ≥1024px, Tablet ~768px, Mobile ≤480px), Light/Dark themes, semantic HTML structure, token-based design system; mobile "Read more" tap/expand affordance (PRD Amendment 1 in `02-prd.md`; Owner-Approved PRD delta, 2026-04-14); Composer input row — side toggle (Chip/Filter), argument text field (TextField), send button (IconButton) (PRD Amendment 2 in `02-prd.md`; Owner-Approved PRD delta, 2026-04-15).
- **Out-of-scope:** Data persistence, networking/API, authentication, multi-debate navigation, framework selection (Gate 4). Read-only debate content zone itself requires no server interaction for display.

## Figma Design Reference

| Asset | URL | Confirmed |
|---|---|---|
| Debate Screen Slice | https://www.figma.com/design/CsPAyUdLSStdmNpmiBMESQ | Yes — all 6 frames accessed via MCP |
| Design System Library | https://www.figma.com/design/onzB8ujyvn6wnhdaS7Hz28 | Yes — 46 variables (14 color + spacing/radius/breakpoint) |

### Frame Inventory (post-tark-vitark — active frames in `02-post-tark-vitark [IN PROGRESS]`)

| Frame | Node ID | Breakpoint | Theme | Composer |
|---|---|---|---|---|
| Desktop Light | `582:50` | ≥1024px (1440px) | Light | ✅ |
| Desktop Dark | `583:62` | ≥1024px (1440px) | Dark | ✅ |
| Tablet Light | `580:26` | ~768px | Light | ✅ |
| Tablet Dark | `581:38` | ~768px | Dark | ✅ |
| Mobile Light | `304:2` | ≤480px (390px) | Light | ✅ |
| Mobile Dark | `414:78` | ≤480px (390px) | Dark | ✅ |

## PRD Traceability Confirmation

| PRD AC | Design Coverage | Status |
|---|---|---|
| AC-1 (JS framework) | Framework-agnostic static layout in 6 Figma frames | N/A — deferred to Gate 4 |
| AC-2 (Topic prominent) | `h1`-style heading centered at top in all 6 frames | PASS |
| AC-3 (Tark blue, sequential) | 4 Tark (blue) cards in posting order, left of spine (desktop/tablet), left-aligned (mobile) | PASS |
| AC-4 (Vitark amber, sequential) | 4 Vitark (amber) cards in posting order, right of spine (desktop/tablet), right-aligned (mobile) | PASS |
| AC-5 (Hardcoded static) | Placeholder debate content in all frames | PASS |
| AC-6 (Read-only content) | ⚠ PRD delta: original AC-6 prohibited all interactive affordances. Owner-approved extensions supersede this constraint for the post-tark-vitark slice: (1) mobile "Read more" tap target (approved 2026-04-14; `02-prd.md` Amendment 1, with supporting UX delta noted in `03-ux.md`); (2) full Composer row — Chip/Filter, TextField, IconButton (approved 2026-04-15; `02-prd.md` Amendment 2, with supporting UX delta noted in `03-ux.md`). Debate content zone itself remains read-only and consumable. | PASS (PRD delta) |
| AC-7 (Responsive 3 breakpoints) | Desktop, Tablet, Mobile — all breakpoints represented; Composer adapts padding/width per breakpoint | PASS |
| AC-8 (Replaces splash at `/`) | Design-stage assertion; implementation concern | N/A — Gate 5 |
| AC-9 (A11y, WCAG AA) | Contrast verified, variable-bound colors, M3-compliant typography | PASS |
| AC-10 (Light/Dark themes) | Both themes present for all 3 breakpoints; dark mode variable binding confirmed | PASS |

**FR-4 (Legend bar + layout):** Sticky legend bar present in all 6 frames with colored dots, per-card labels removed. Legend separator aligns with timeline spine on desktop/tablet. **PASS**.

## UX Coverage Confirmation

| UX Flow / State | Figma Frame(s) | Status |
|---|---|---|
| Desktop read (Light/Dark) | 582:50, 583:62 | PASS |
| Tablet read (Light/Dark) | 580:26, 581:38 | PASS |
| Mobile read (Light/Dark) | 304:2, 414:78 | PASS |
| Topic heading (h1, centered) | All 6 frames | PASS |
| Sticky legend bar | All 6 frames | PASS |
| Timeline center spine (desktop/tablet) | 582:50, 583:62, 580:26, 581:38 | PASS |
| Chat-bubble stagger (mobile) | 304:2, 414:78 | PASS |
| Card shape (asymmetric + tails) | All 6 frames | PASS |
| Natural page scroll (OQ-2) | Content extends beyond frame, no scroll containers | PASS |
| Composer (Chip/Filter + TextField + IconButton) | All 6 frames | PASS |
| Dark mode variable binding | 414:78, 581:38, 583:62 | PASS |

## Component and Token Consistency

### Color Variables (14 total, each with Light + Dark modes — updated dark values)

| Variable | Light | Dark |
|---|---|---|
| `color/surface/default` | `#FFFBFF` | `#1B1B1F` |
| `color/brand/primary` | `#4555B7` | `#BBC3FF` |
| `color/brand/on-primary` | `#FFFFFF` | `#0E2288` |
| `color/tark/surface` | `#BBDEFB` | `#002C76` |
| `color/tark/on-surface` | `#0D47A1` | `#D5E3FF` |
| `color/tark/header` | `#1565C0` | `#90CAF9` |
| `color/vitark/surface` | `#FFECB3` | `#5C1000` |
| `color/vitark/on-surface` | `#BF360C` | `#FFB4A2` |
| `color/vitark/header` | `#EF6C00` | `#FFB74D` |
| `color/spine/line` | `#767680` | `#90909A` |
| `color/spine/dot` | `#9E9E9E` | `#616161` |
| `color/legend/surface` | `#F5F5F5` | `#1C1C1C` |
| `color/legend/on-surface` | `#4D4D4D` | `#BFBFBF` |
| `color/legend/separator` | `#999999` | `#666666` |

**Dark surface update (2026-04-15):** `color/tark/surface` dark updated `#1565C0` → `#002C76` (M3 Blue tone-30); `color/vitark/surface` dark updated `#BF360C` → `#5C1000` (M3 DeepOrange tone-30); `color/tark/on-surface` dark → `#D5E3FF`; `color/vitark/on-surface` dark → `#FFB4A2`. WCAG AA body text ≥8:1 confirmed.

**Token compliance:** All frame fills bound to library variables. No raw hex values remain.

**Pre-Gate 5 action required:** `src/styles/tokens.css` must be updated before Gate 5 build-out to sync dark token values: `--color-tark-surface` dark → `#002C76`, `--color-vitark-surface` dark → `#5C1000`, `--color-tark-on-surface` dark → `#D5E3FF`, `--color-vitark-on-surface` dark → `#FFB4A2`. Apply the same updates in both dark-theme definitions in that file — `[data-theme="dark"]` and the `@media (prefers-color-scheme: dark)` fallback for `:root:not([data-theme])` — to avoid theme mismatches when `data-theme` is unset. This design QA package records the approved token change; the implementation token source must be brought into sync before build-out.

## Edge State Coverage

| Edge State | Coverage |
|---|---|
| Default / Loaded | All 6 frames — primary state |
| Loading | N/A — near-instant static render |
| Empty | N/A — hardcoded content ("missing content = defect") |
| Error | Deferred to Gate 4 error boundary |
| Permission | N/A — public read-only |

## Interaction and Layout Notes

### Legend Bar

- 3-column layout mirroring timeline: Left Section (right-justified) | Center Dot | Right Section (left-justified)
- Desktop: 572px | 32px | 572px with 12px gaps, 120px horizontal padding
- Tablet: 316px | 32px | 316px with 12px gaps, 40px horizontal padding
- Mobile: Centered single row (no timeline spine to align with), 20px horizontal padding
- Content: Colored dot + "Tark · for" | "·" separator | Colored dot + "Vitark · against"
- Sticky on scroll, theme-aware background

### Card Shape

- Asymmetric corner radii: 4px sharp on speaker side, 12px rounded on other three corners
- 8×10px triangular tail protruding outward from sharp-corner edge
- Tark: sharp top-left + left-pointing tail; Vitark: sharp top-right + right-pointing tail

### Timeline

- Desktop/Tablet: center spine (32px wide) with alternating left/right cards
- Mobile: chat-bubble stagger — Tark left-aligned, Vitark right-aligned (~72% width)

## Quality Gaps

None — all gaps from passes 1–3 resolved.

## Open Questions

| ID | Question | Status | Resolution |
|---|---|---|---|
| OQ-1 | Browser support baseline | Resolved | Modern evergreen browsers |
| OQ-2 | Argument overflow/pagination | Resolved | Natural page scroll |

## Owner-Approved Deltas

| Delta | Decision | Date |
|---|---|---|
| Semantic neutrality | Blue/amber (not green/red) | 2026-04-04 |
| Sequential debate model | Timeline layout (not parallel columns) | 2026-04-04 |
| Legend bar replaces per-card labels | Sticky legend with colored dots | 2026-04-05 |
| Legend bar spine alignment | 3-column layout matching timeline columns | 2026-04-05 |
| Dark card surfaces — M3 tonal containers (tone-30) | Tark dark `#002C76`, Vitark dark `#5C1000`; on-surface tints updated | 2026-04-15 |
| "Read more" CTA color | `color/brand/primary` (neutral CTA, not side-coded) | 2026-04-15 |
| Composer addition (post-tark-vitark slice) | Horizontal row: Chip/Filter + TextField/Outlined + IconButton/Filled | 2026-04-15 |
| Bubble tails on all 6 breakpoints | Accepted — tail anticipates future user avatar attachment; spatial relationship (tail → avatar) applies at all viewports | 2026-04-15 |

## Design QA History

| Pass | Result | Key Findings |
|---|---|---|
| Pass 1 | Needs Revision | DQA-1: raw hex fills (306 bindings needed), DQA-2: library overview outdated, DQA-3: missing variables |
| Pass 2 | Agent-Ready | All 9 checks pass after 11 variables created + 306 bindings |
| Pass 3 | Needs Revision | Legend bar elements (3 new) used raw hex — 3 variables + 48 bindings needed |
| Pass 4 | Agent-Ready | All gaps resolved — 14 color variables, full compliance |
| Pass 5 | Agent-Ready → Approved | M3 rebuild verified: primary #4555B7/#BBC3FF, surface #FFFBFF/#1B1B1F, outline #767680/#90909A, vitark #BF360C WCAG fix confirmed. All 14 variables M3-compliant. PO approved Gate 3 closure 2026-04-05. |
| Pass 6 | PASS → Approved | post-tark-vitark Composer added to all 6 frames. Checks: Composer structure ✅, token binding ✅, dark mode ✅, bubble tails ✅ (PO accepted all-breakpoints intent), AC-6 scope ✅. PO approved Gate 3 closure 2026-04-15. |

## Product Owner Approval

**Current approval: 2026-04-15** — Product Owner approved Gate 3 closure (Pass 6) covering the post-tark-vitark Composer across all 6 frames. Supersedes the earlier 2026-04-05 approval for current document status.

## Traceability Snapshot

| Artifact | Location |
|---|---|
| Requirement | `docs/slices/debate-screen/01-requirement.md` |
| PRD | `docs/slices/debate-screen/02-prd.md` |
| UX Flow/State | `docs/slices/debate-screen/03-ux.md` |
| Design QA Verdict | `docs/slices/debate-screen/04-design-qa.md` |
| Figma Slice | https://www.figma.com/design/CsPAyUdLSStdmNpmiBMESQ |
| Design System Library | https://www.figma.com/design/onzB8ujyvn6wnhdaS7Hz28 |
