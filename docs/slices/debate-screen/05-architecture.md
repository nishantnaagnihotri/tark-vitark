# Architecture Plan — debate-screen

> **Revision 1.1** — Targeted revision of Gate 4-approved plan.
> Revision scope: (1) React 18 → React 19 (Rule #52), (2) M3 3-layer token architecture with computed values (Rule #53), (3) Design System primitive layer (Gate 3A Addendum), (4) Task decomposition update.
> Original approval: 2026-04-05. Revision: 2026-04-06.

## 1. Architecture Readiness

**Ready** — All open questions resolved. All PO decisions incorporated. Architecture quality checks pass. Revision addresses 4 change areas from Gate 3 reopen; no new blocking gaps introduced.

---

## 2. Architecture Plan

### 2.1 Architectural Pattern

**Single-Page Application** — React 19 + Vite SPA. One route (`/`), one screen, static data, CSS-only theming. No router needed.

### 2.2 Module Boundary Map

| Module | Responsibility | Owner |
|---|---|---|
| `src/design-system/Typography.tsx` | M3 Typography primitive — renders text with role-based styling (headline-large, body-large, label-medium) | Design System |
| `src/design-system/Card.tsx` | M3 Filled Card primitive — renders themed container with side-variant shape and color (tark, vitark) | Design System |
| `src/design-system/Divider.tsx` | M3 Divider primitive — renders vertical divider line | Design System |
| `src/design-system/typography.css` | Typography primitive styles — M3 type scale token bindings | Design System |
| `src/design-system/card.css` | Card primitive styles — shape, fill, padding per variant | Design System |
| `src/design-system/divider.css` | Divider primitive styles — thickness, color, orientation | Design System |
| `src/design-system/index.ts` | DS barrel export | Design System |
| `src/data/debate.ts` | Static debate data (topic + ordered arguments) | Data |
| `src/components/DebateScreen.tsx` | Root screen: composes Topic, LegendBar, Timeline | Screen |
| `src/components/Topic.tsx` | Renders debate topic heading; composes Typography (headline-large) | Component |
| `src/components/LegendBar.tsx` | Sticky legend bar with Tark/Vitark dots; composes Typography (label-medium) | Component |
| `src/components/Timeline.tsx` | Center-spine timeline (desktop/tablet), chat-bubble stagger (mobile); composes Divider + ArgumentCard instances | Component |
| `src/components/ArgumentCard.tsx` | Single argument card; composes Card + Typography (body-large); adds directional tail + aria-label | Component |
| `src/styles/tokens.css` | Expanded design token system — M3 3-layer architecture (15 color + typography + spacing/radius/dimension) | Tokens |
| `src/styles/debate-screen.css` | Screen-level layout, responsive breakpoints | Styles |
| `src/styles/components/legend-bar.css` | LegendBar feature-specific styles (sticky, dots, separator) | Styles |
| `src/styles/components/timeline.css` | Timeline + spine layout styles | Styles |
| `src/styles/components/argument-card.css` | Card tail, positioning, feature-specific card additions | Styles |
| `src/main.tsx` | React root mount + theme init | Entry |
| `index.html` | Vite HTML entry point | Entry |

### 2.3 Domain Glossary → Code Identifier Mapping

| Glossary Term | Code Identifier(s) | Type |
|---|---|---|
| Debate | `Debate` (type), `DebateScreen` (component) | Type, Component |
| Topic | `Topic` (component), `topic` (data field) | Component, Field |
| Argument | `Argument` (type), `ArgumentCard` (component), `arguments` (data field) | Type, Component, Field |
| Tark | `'tark'` (literal), `--color-tark-*` (tokens), `.argument-card--tark` (CSS) | Literal, Token, Class |
| Vitark | `'vitark'` (literal), `--color-vitark-*` (tokens), `.argument-card--vitark` (CSS) | Literal, Token, Class |
| Timeline | `Timeline` (component), `.timeline` (CSS) | Component, Class |
| Legend Bar | `LegendBar` (component), `.legend-bar` (CSS) | Component, Class |
| Card | `Card` (DS primitive), `ArgumentCard` (feature component), `.argument-card` (CSS) | DS Primitive, Component, Class |

### 2.4 Data Shapes / Types

```typescript
// src/data/debate.ts

type Side = 'tark' | 'vitark';

interface Argument {
  id: number;          // posting order (1-based)
  side: Side;
  text: string;
}

interface Debate {
  topic: string;
  arguments: Argument[];
}

// Exported constant: DEBATE
// ~8 arguments, mix of tark/vitark in posting order
// Content extracted from Figma design frames via Dev agent MCP read access
```

### 2.5 Interface Contracts (Component Props)

#### Design System Primitives

```typescript
// src/design-system/Typography.tsx
type TypographyRole = 'headline-large' | 'body-large' | 'label-medium';

interface TypographyProps {
  role: TypographyRole;
  as?: keyof React.JSX.IntrinsicElements;  // override semantic element
  children: React.ReactNode;
  className?: string;
}

// Default `as` per role:
//   headline-large → 'h1'
//   body-large     → 'p'
//   label-medium   → 'span'

// src/design-system/Card.tsx
interface CardProps {
  side: Side;                    // 'tark' | 'vitark' — selects color + shape variant
  children: React.ReactNode;
  className?: string;
}

// src/design-system/Divider.tsx
interface DividerProps {
  orientation?: 'vertical';      // only vertical in this slice
  className?: string;
}
```

#### Feature Components

```typescript
// Topic — composes Typography (headline-large, as="h1")
interface TopicProps {
  text: string;
}

// LegendBar — no props (static content, composes Typography label-medium)

// Timeline — composes Divider + ArgumentCard instances
interface TimelineProps {
  arguments: Argument[];
}

// ArgumentCard — composes Card + Typography (body-large)
interface ArgumentCardProps {
  argument: Argument;
}

// DebateScreen — no props (reads DEBATE constant directly)
```

### 2.6 Token System — M3 3-Layer Architecture

The token system follows the M3 3-layer architecture (Rule #53), computed from seed `#3949AB`:

| Layer | Purpose | This Slice |
|---|---|---|
| **Layer 1: M3 Baseline** | Computed from seed color via M3 algorithm. Used as-is unless PO rejects a value after visual review. | Surface, brand/primary, brand/on-primary, spine/line, on-surface values are M3-computed. |
| **Layer 2: Brand Override** | PO-directed overrides of M3 baseline values. Empty unless a specific M3 value is rejected. | Empty — no overrides needed. All M3-computed values accepted at Gate 3 Pass 5. |
| **Layer 3: Functional Override** | Domain-specific tokens that extend beyond M3 palette. Tark/vitark side colors, legend tokens, spine dot. | Tark (blue), vitark (amber), legend, and spine-dot tokens. |

All values below are verified against Design QA Pass 5 (04-design-qa.md):

```css
:root,
[data-theme="light"] {
  /* ── Layer 1: M3 Baseline (computed from seed #3949AB) ── */

  /* Surface */
  --color-surface-default: #FFFBFF;
  --color-on-surface: #1C1B1F;
  --color-brand-primary: #4555B7;
  --color-brand-on-primary: #FFFFFF;

  /* Spine (maps to M3 outline-variant) */
  --color-spine-line: #767680;

  /* ── Layer 2: Brand Override (empty — no M3 values overridden) ── */

  /* ── Layer 3: Functional Override (domain tokens) ── */

  /* Tark (blue) */
  --color-tark-surface: #BBDEFB;
  --color-tark-on-surface: #0D47A1;
  --color-tark-header: #1565C0;

  /* Vitark (amber) */
  --color-vitark-surface: #FFECB3;
  --color-vitark-on-surface: #BF360C;
  --color-vitark-header: #EF6C00;

  /* Spine (functional) */
  --color-spine-dot: #9E9E9E;

  /* Legend */
  --color-legend-surface: #F5F5F5;
  --color-legend-on-surface: #4D4D4D;
  --color-legend-separator: #999999;

  /* ── Typography (M3 Type Scale) ── */
  --font-family-plain: Inter, "Segoe UI", Arial, sans-serif;

  --typescale-headline-lg-size: 2rem;
  --typescale-headline-lg-line-height: 2.5rem;
  --typescale-headline-lg-weight: 400;
  --typescale-headline-lg-tracking: 0;

  --typescale-body-lg-size: 1rem;
  --typescale-body-lg-line-height: 1.5rem;
  --typescale-body-lg-weight: 400;
  --typescale-body-lg-tracking: 0.03125rem;

  --typescale-label-md-size: 0.75rem;
  --typescale-label-md-line-height: 1rem;
  --typescale-label-md-weight: 500;
  --typescale-label-md-tracking: 0.03125rem;

  /* ── Spacing ── */
  --space-4: 1rem;
  --space-8: 2rem;
  --space-12: 3rem;
  --space-card-padding: 1rem;

  /* ── Shape ── */
  --radius-sharp: 4px;
  --radius-round: 12px;

  /* ── Dimension ── */
  --divider-thickness: 1px;
}

[data-theme="dark"] {
  /* ── Layer 1: M3 Baseline ── */
  --color-surface-default: #1B1B1F;
  --color-on-surface: #E6E1E5;
  --color-brand-primary: #BBC3FF;
  --color-brand-on-primary: #0E2288;

  --color-spine-line: #90909A;

  /* ── Layer 3: Functional Override ── */
  --color-tark-surface: #1565C0;
  --color-tark-on-surface: #E3F2FD;
  --color-tark-header: #90CAF9;

  --color-vitark-surface: #BF360C;
  --color-vitark-on-surface: #FFF8E1;
  --color-vitark-header: #FFB74D;

  --color-spine-dot: #616161;

  --color-legend-surface: #1C1C1C;
  --color-legend-on-surface: #BFBFBF;
  --color-legend-separator: #666666;
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme]) {
    /* Same as [data-theme="dark"] block */
  }
}
```

**Token inventory:** 15 color tokens (14 from Figma library + `--color-on-surface` from DS spec) × 2 themes, 13 typography tokens (theme-invariant), 4 spacing tokens, 2 radius tokens, 1 dimension token. Total: 35 custom properties.

**Migration note:** The existing `--color-surface-primary` and `--color-text-primary` are replaced with new naming (`--color-surface-default`, `--color-on-surface`). The coming-soon splash page is unaffected — it uses its own `styles.css` with inline hardcoded colors and does not import tokens.

### 2.7 File/Folder Structure (Target State)

```
tark-vitark/
├── index.html                              # Vite entry (NEW)
├── vite.config.ts                          # Vite + PWA config (NEW)
├── tsconfig.json                           # TypeScript config (NEW)
├── package.json                            # Dependencies + scripts (NEW)
├── public/
│   ├── manifest.json                       # PWA web manifest (NEW)
│   └── icons/                              # PWA icons placeholder (NEW)
├── src/
│   ├── main.tsx                            # React root mount (NEW)
│   ├── data/
│   │   └── debate.ts                       # Static debate data (NEW)
│   ├── design-system/                      # DS primitive layer (NEW)
│   │   ├── index.ts                        # Barrel export (NEW)
│   │   ├── Typography.tsx                  # M3 Typography primitive (NEW)
│   │   ├── typography.css                  # Typography styles (NEW)
│   │   ├── Card.tsx                        # M3 Filled Card primitive (NEW)
│   │   ├── card.css                        # Card styles (NEW)
│   │   ├── Divider.tsx                     # M3 Divider primitive (NEW)
│   │   └── divider.css                     # Divider styles (NEW)
│   ├── components/
│   │   ├── DebateScreen.tsx                # Root screen (NEW)
│   │   ├── Topic.tsx                       # Topic heading — composes Typography (NEW)
│   │   ├── LegendBar.tsx                   # Sticky legend — composes Typography (NEW)
│   │   ├── Timeline.tsx                    # Timeline layout — composes Divider (NEW)
│   │   └── ArgumentCard.tsx               # Argument card — composes Card + Typography (NEW)
│   ├── styles/
│   │   ├── tokens.css                      # EXPANDED — M3 3-layer token architecture (existing)
│   │   ├── debate-screen.css               # Screen layout (NEW)
│   │   └── components/
│   │       ├── legend-bar.css              # Feature-specific LegendBar styles (NEW)
│   │       ├── timeline.css                # Feature-specific Timeline + spine styles (NEW)
│   │       └── argument-card.css           # Feature-specific card tail + positioning (NEW)
│   └── coming-soon-splash-page/            # UNTOUCHED (existing)
│       ├── index.html
│       └── styles.css
├── features/
│   ├── debate-screen.feature               # Cucumber scenarios (NEW)
│   └── step-definitions/
│       └── debate-screen.steps.ts          # Step definitions (NEW)
├── tests/
│   ├── design-system/                      # DS primitive tests (NEW)
│   │   ├── Typography.test.tsx             # (NEW)
│   │   ├── Card.test.tsx                   # (NEW)
│   │   └── Divider.test.tsx                # (NEW)
│   ├── components/
│   │   ├── DebateScreen.test.tsx           # (NEW)
│   │   ├── Topic.test.tsx                  # (NEW)
│   │   ├── LegendBar.test.tsx              # (NEW)
│   │   ├── Timeline.test.tsx               # (NEW)
│   │   └── ArgumentCard.test.tsx           # (NEW)
│   └── data/
│       └── debate.test.ts                  # (NEW)
├── docs/slices/debate-screen/
│   ├── 01-requirement.md                   # (existing)
│   ├── 02-prd.md                           # (existing)
│   ├── 03-ux.md                            # (existing)
│   ├── 04-design-qa.md                     # (existing)
│   ├── 05-architecture.md                  # (THIS OUTPUT)
│   └── 06-tasks.md                         # (after approval)
└── .github/workflows/
    └── deploy-pages.yml                    # UPDATED (existing)
```

### 2.8 Dependency Stack

| Package | Purpose | Version Strategy |
|---|---|---|
| `react` | UI library | `^19` (latest 19.x) |
| `react-dom` | DOM renderer | `^19` (match react) |
| `vite` | Build tool + dev server | `^6` (latest) |
| `@vitejs/plugin-react` | React Fast Refresh + JSX | `^4` |
| `vite-plugin-pwa` | PWA manifest + service worker | `^0.21` |
| `typescript` | Type checking | `^5` |
| `@types/react` | React type defs | `^19` |
| `@types/react-dom` | ReactDOM type defs | `^19` |
| `vitest` | Unit/component test runner | `^3` |
| `@testing-library/react` | Component test utilities | `^16` |
| `@testing-library/jest-dom` | DOM matchers | `^6` |
| `jsdom` | Browser env for vitest | `^25` |
| `@cucumber/cucumber` | BDD framework | `^11` |

### 2.9 Theme Strategy

- CSS-only theming via `[data-theme]` selectors + `prefers-color-scheme` fallback.
- No JS theme toggle in this slice (read-only, no controls). Theme is resolved by OS preference or `data-theme` attribute.
- `<html>` element carries `data-theme` attribute when explicitly set. Absence falls through to `prefers-color-scheme`.
- All component CSS references token custom properties — zero hardcoded colors.

### 2.10 PWA Baseline

- `vite-plugin-pwa` generates service worker and injects manifest link.
- `public/manifest.json`: app name "TarkVitark", theme color from brand primary, display "standalone".
- Service worker strategy: `generateSW` mode with precache of built assets. Provides offline shell only.
- **Not in scope:** push notifications, background sync, install prompt UI.
- **Future path (architecture note):** Capacitor wraps this React SPA for native iOS/Android distribution. No code changes needed — Capacitor consumes the same `dist/` output. The prior Gate 3A Flutter note is reconsidered in favor of Capacitor for unified React codebase strategy.

### 2.11 Semantic HTML Structure

```html
<!-- Simplified DOM outline -->
<html lang="en" data-theme="light|dark">
<body>
  <main role="main">
    <header class="debate-header">
      <h1 class="topic"><!-- debate topic --></h1>
    </header>
    <nav class="legend-bar" aria-label="Debate sides legend">
      <!-- ● Tark · for · | · ● Vitark · against -->
    </nav>
    <section class="timeline" aria-label="Debate arguments">
      <ol class="timeline__list">
        <li class="argument-card argument-card--tark" aria-label="Tark argument">
          <!-- argument text -->
        </li>
        <li class="argument-card argument-card--vitark" aria-label="Vitark argument">
          <!-- argument text -->
        </li>
        <!-- ... posting order -->
      </ol>
    </section>
  </main>
</body>
</html>
```

Key accessibility decisions:
- `<ol>` for arguments (posting order is meaningful).
- `aria-label` on each `<li>` for screen reader side identification (replaces visual per-card labels).
- `<nav>` for legend bar (navigational landmark for side identification).
- Skip-link optional; deferred — single-section page with no interactive controls.

### 2.12 Layout Strategy

**Desktop/Tablet (≥481px):**
- CSS Grid on `.timeline__list`: 2-column + center spine.
- Tark cards: `grid-column: 1`, right-aligned toward spine.
- Vitark cards: `grid-column: 3`, left-aligned toward spine.
- Center spine: `grid-column: 2`, 32px wide, drawn with `::before` pseudo-element (vertical line + dots at card positions).
- Legend bar: 3-column grid matching timeline columns.

**Mobile (≤480px):**
- Single column flex layout.
- Tark cards: `align-self: flex-start`, ~72% width.
- Vitark cards: `align-self: flex-end`, ~72% width.
- Chat-bubble stagger effect.

**Breakpoints:**
```css
/* Mobile-first */
@media (min-width: 481px) { /* tablet */ }
@media (min-width: 1024px) { /* desktop */ }
```

### 2.13 Card Shape Implementation

- Card container shape (border-radius per variant) is implemented in `src/design-system/card.css`. The triangular tail is implemented as a feature-specific `::before` pseudo-element in `src/styles/components/argument-card.css`.
- Tark: `border-radius: var(--radius-sharp) var(--radius-round) var(--radius-round) var(--radius-round)` (sharp top-left).
- Vitark: `border-radius: var(--radius-round) var(--radius-sharp) var(--radius-round) var(--radius-round)` (sharp top-right).
- Triangular tail: CSS `::before` pseudo-element with `clip-path: polygon()` or border-triangle technique. 8×10px, positioned at the sharp-corner edge, pointing toward spine.

### 2.14 Build & Dev Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:bdd": "cucumber-js --require-module ts-node/register --require features/step-definitions/**/*.ts"
  }
}
```

### 2.15 Deployment Workflow Update

Updated `.github/workflows/deploy-pages.yml`:
- Add `paths: ["src/**", "index.html", "vite.config.ts", "package.json"]` trigger.
- Add Node.js 20 setup step.
- Add `npm ci` step.
- Add `npm run build` step.
- Change artifact path from `src/coming-soon-splash-page` to `dist`.
- Coming-soon splash page folder remains in repo but is no longer deployed.

### 2.16 Cross-Cutting Concerns

- **Error boundaries:** Not needed — static content, no runtime data fetching or user input.
- **Fonts:** System font stack `Inter, "Segoe UI", Arial, sans-serif` — zero external dependencies. Deferred custom font evaluation tracked via GitHub issue.
- **CSP:** No inline scripts or eval. Vite injects module `<script>` tags. Compatible with strict CSP policies.
- **Bundle budget:** React 19 + ReactDOM ≈ ~42KB gzip. Monitor in T1. If exceeded, evaluate tree-shaking options.
- **React 19 note:** React 19 passes `ref` as a standard prop to function components, making `forwardRef` unnecessary. DS primitives and feature components use standard props signatures without `forwardRef` wrappers.

---

## 3. Impact Analysis

| File/System | Change Type | Risk |
|---|---|---|
| `src/styles/tokens.css` | **Modified** — expanded from 3 to ~35 tokens (M3 3-layer) | Low — coming-soon page has own inline styles |
| `src/design-system/*.tsx` (3 files) | **New** — DS primitive components | Low |
| `src/design-system/*.css` (3 files) | **New** — DS primitive styles | Low |
| `src/design-system/index.ts` | **New** — barrel export | Low |
| `.github/workflows/deploy-pages.yml` | **Modified** — Node.js build pipeline | Medium — deployment story changes |
| `index.html` (root) | **New** — Vite entry point | Low |
| `package.json` | **New** — dependency manifest | Low |
| `vite.config.ts` | **New** — build config | Low |
| `tsconfig.json` | **New** — TS config | Low |
| `src/main.tsx` | **New** — React entry | Low |
| `src/data/debate.ts` | **New** — static data | Low |
| `src/components/*.tsx` (5 files) | **New** — React feature components (compose DS primitives) | Low |
| `src/styles/**/*.css` (4 files) | **New/Modified** — feature-specific styles | Low |
| `public/manifest.json` | **New** — PWA manifest | Low |
| `tests/design-system/*.test.tsx` (3 files) | **New** — DS primitive tests | Low |
| `tests/components/*.test.tsx` (5 files) | **New** — feature component tests | Low |
| `tests/data/debate.test.ts` | **New** — data module test | Low |
| `features/**` (2 files) | **New** — BDD scenarios | Low |
| `src/coming-soon-splash-page/` | **Untouched** — remains in repo | None |
| Root path `/` | **Behavior change** — serves React app instead of splash | Medium — intentional |

---

## 4. Risk and Mitigation Plan

| ID | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| R-1 | Token expansion breaks coming-soon splash page | Low | Low | Coming-soon has its own `styles.css` with inline hardcoded colors and no token imports. Token rename is safe. Verified during architecture validation. |
| R-2 | Deployment workflow change breaks deploy | Medium | High | T9 workflow update tested with `workflow_dispatch` trigger before merge. Rollback: revert workflow YAML. |
| R-3 | Card tail CSS complexity across browsers | Low | Medium | Use `clip-path` with `polygon()` — supported in all target evergreen browsers. Graceful degradation: no tail in unsupported browsers (visual-only, not functional). |
| R-4 | PWA service worker caches stale content | Low | Medium | `vite-plugin-pwa` with `registerType: 'autoUpdate'`. Cache-bust on deploy via content hash. |
| R-5 | Bundle size exceeds 45KB gzip budget | Low | Low | React 19 + ReactDOM ≈ ~42KB gzip. Monitor in T1 scaffold. If exceeded, evaluate tree-shaking options. |
| R-6 | Accessibility contrast failure in dark theme | Low | High | Token values are M3-computed from seed #3949AB and verified at Design QA Pass 5. Vitark on-surface changed to #BF360C for WCAG compliance. Automated contrast check in vitest (computed styles) + manual axe audit in T8. |
| R-7 | Cucumber + TypeScript integration friction | Medium | Low | Pin `@cucumber/cucumber` v11 + `ts-node`. Validate in T1 scaffold with a trivial scenario. |
| R-8 | DS primitive abstraction mismatch | Low | Medium | DS primitives are specified by Gate 3A Addendum challenge findings (CH-1 through CH-8). Only 3 primitives with verified M3 mappings. No speculative abstractions. |

---

## 5. Verification Strategy

### 5.1 Test Levels

| Level | Tool | Scope |
|---|---|---|
| Unit | vitest | Data module integrity, argument ordering |
| Component | vitest + @testing-library/react | DS primitives (Typography, Card, Divider) and feature components (Topic, LegendBar, Timeline, ArgumentCard, DebateScreen) — render correctness, a11y attributes, token usage |
| BDD / Acceptance | @cucumber/cucumber + step defs (vitest + RTL underneath) | AC-1 through AC-10 scenarios |
| Visual / Viewport | Manual + optional Playwright screenshot | 3 breakpoints × 2 themes |
| Accessibility | axe-core (programmatic in vitest) + manual keyboard walkthrough | WCAG 2.1 AA |

### 5.2 BDD Scenarios (Cucumber .feature)

```gherkin
Feature: Debate Screen

  Scenario: AC-1 — Debate screen renders using React
    Given the application is built with React and Vite
    When a visitor navigates to the root path
    Then a debate screen is rendered

  Scenario: AC-2 — Topic displayed prominently
    Given a debate with topic "Should artificial intelligence be regulated by international law?"
    When the debate screen renders
    Then the topic is displayed as the primary heading

  Scenario: AC-3 — Tark arguments displayed in sequential thread
    Given a debate with Tark arguments in posting order
    When the debate screen renders
    Then each Tark argument is displayed with blue color coding
    And arguments appear in posting order

  Scenario: AC-4 — Vitark arguments displayed in sequential thread
    Given a debate with Vitark arguments in posting order
    When the debate screen renders
    Then each Vitark argument is displayed with amber color coding
    And arguments appear in posting order

  Scenario: AC-5 — Hardcoded static content
    Given the debate data module
    When inspected at build time
    Then it contains a hardcoded debate with topic and arguments
    And no API calls or dynamic loading occurs

  Scenario: AC-6 — Read-only screen
    When the debate screen renders
    Then no input controls, forms, or buttons are present

  Scenario: AC-7 — Responsive layout
    Given the debate screen
    When rendered at 1440px viewport width
    Then a timeline layout with center spine is displayed
    When rendered at 768px viewport width
    Then a timeline layout with narrower margins is displayed
    When rendered at 390px viewport width
    Then a single-column chat-bubble stagger layout is displayed

  Scenario: AC-8 — Replaces coming-soon splash page
    When a visitor navigates to the root path "/"
    Then the debate screen is displayed
    And the coming-soon splash page is not displayed

  Scenario: AC-9 — Accessibility baseline
    When the debate screen renders
    Then semantic HTML elements are used for structure
    And all argument cards have aria-labels identifying their side
    And text contrast meets WCAG 2.1 AA ratios
    And the page is navigable by keyboard

  Scenario: AC-10 — Light and Dark theme support
    Given the debate screen
    When data-theme is set to "light"
    Then light theme tokens are applied
    When data-theme is set to "dark"
    Then dark theme tokens are applied
    When no data-theme is set and OS prefers dark
    Then dark theme tokens are applied via prefers-color-scheme fallback
```

### 5.3 AC-to-Test Mapping

| AC | BDD Scenario | Unit/Component Test | Manual Check |
|---|---|---|---|
| AC-1 | AC-1 scenario | `DebateScreen.test.tsx` — renders | — |
| AC-2 | AC-2 scenario | `Topic.test.tsx` — h1 with topic text | — |
| AC-3 | AC-3 scenario | `Card.test.tsx` — tark variant; `ArgumentCard.test.tsx` — tark styling | — |
| AC-4 | AC-4 scenario | `Card.test.tsx` — vitark variant; `ArgumentCard.test.tsx` — vitark styling | — |
| AC-5 | AC-5 scenario | `debate.test.ts` — data shape validation | — |
| AC-6 | AC-6 scenario | `DebateScreen.test.tsx` — no interactive elements | — |
| AC-7 | AC-7 scenario | — | Viewport simulation at 1440/768/390px |
| AC-8 | AC-8 scenario | — | Navigate to `/` post-deploy |
| AC-9 | AC-9 scenario | Component tests with `aria-label` assertions | axe audit, keyboard walkthrough |
| AC-10 | AC-10 scenario | Token application tests | Toggle `data-theme`, simulate `prefers-color-scheme` |

---

## 6. Task Decomposition

### T1: Scaffold React + Vite project with test stack and PWA baseline

**Description:** Initialize the project with React 19, Vite, TypeScript, vitest, @testing-library/react, @cucumber/cucumber, and vite-plugin-pwa. Create `package.json`, `vite.config.ts`, `tsconfig.json`, root `index.html`, `src/main.tsx` with a minimal React mount, `public/manifest.json`, and verify the dev server runs, `npm run build` produces `dist/`, tests run, and a trivial Cucumber scenario passes.

**Acceptance Criteria:**
- `npm run dev` starts Vite dev server and serves a React root.
- `npm run build` produces `dist/index.html` with bundled JS.
- `npm test` runs vitest with zero failures (placeholder test passes).
- `npm run test:bdd` runs Cucumber with a trivial passing scenario.
- `public/manifest.json` exists with app name and theme color.
- `vite-plugin-pwa` generates a service worker in `dist/`.
- Bundle size (gzip) ≤ 45KB for vendor chunk.
- TypeScript strict mode enabled; no type errors.
- React 19 and ReactDOM 19 confirmed in `package.json`.

**Dependencies:** None (first task).

**Traced to:** AC-1 (framework), D-1 (React+Vite), D-1b (PWA), D-2 (test stack).

---

### T2: Expand token system with M3 3-layer architecture

**Description:** Expand `src/styles/tokens.css` from 3 tokens to the full M3 3-layer token set: 15 color variables (each with light/dark values), 13 typography tokens, 4 spacing tokens, 2 radius tokens, and 1 dimension token. All color values are M3-computed from seed `#3949AB` and verified at Design QA Pass 5. Structure tokens with Layer 1/2/3 comments. Implement `:root`/`[data-theme="light"]`, `[data-theme="dark"]`, and `prefers-color-scheme` fallback. Write tests verifying token presence.

**Acceptance Criteria:**
- All 15 color variables defined for both light and dark, matching Design QA Pass 5 exactly.
- 13 typography tokens (`--font-family-plain`, `--typescale-headline-lg-*`, `--typescale-body-lg-*`, `--typescale-label-md-*`) defined.
- Spacing tokens (`--space-4`, `--space-8`, `--space-12`, `--space-card-padding`) defined.
- Radius tokens (`--radius-sharp`, `--radius-round`) defined.
- Dimension token (`--divider-thickness`) defined.
- M3 3-layer comments present in CSS.
- `[data-theme="dark"]` block mirrors all light tokens with dark values.
- `prefers-color-scheme: dark` fallback defined for `:root:not([data-theme])`.
- Existing `--color-surface-primary` / `--color-text-primary` replaced with new naming.
- Coming-soon splash page verified unaffected (has own styles).
- Test: token CSS file parses without errors; all expected custom properties present (vitest).

**Dependencies:** T1 (project scaffold exists).

**Traced to:** AC-10, FR-10, Design QA Pass 5 token table, Rule #53 (M3 3-layer).

---

### T3: Create static debate data module

**Description:** Create `src/data/debate.ts` with TypeScript types (`Side`, `Argument`, `Debate`) and the `DEBATE` constant. Extract actual debate topic and arguments from Figma design frames via Dev agent read-only MCP access. Write unit tests for data shape and ordering.

**Acceptance Criteria:**
- `Debate` type exported with `topic: string` and `arguments: Argument[]`.
- `Argument` type exported with `id: number`, `side: Side`, `text: string`.
- `Side` type exported as `'tark' | 'vitark'`.
- `DEBATE` constant exported with real content from Figma frames.
- ~8 arguments in posting order, mix of tark/vitark.
- Test: data shape validates (vitest), argument IDs are sequential, sides alternate as expected.

**Dependencies:** T1 (TypeScript project exists).

**Traced to:** AC-5, FR-5, QG-A4, Rule #45 (domain language).

---

### T4: Implement DS primitives (Typography, Card, Divider)

**Description:** Build the Design System primitive layer in `src/design-system/`. Implement three M3-compliant React components per the Gate 3A DS Primitive Specification: Typography (3 roles: headline-large, body-large, label-medium), Card/Filled (2 side variants: tark, vitark), and Divider (vertical). Each primitive has co-located CSS using token custom properties. Create barrel export `index.ts`. Write component tests (test-first per Rule #50). DS primitives are pure React components — `@material/web` is a read-only reference, not a runtime dependency (Rule #51).

**Acceptance Criteria:**
- `Typography` renders text with correct font-size, line-height, weight, and tracking per role. Default semantic element per role (`h1`, `p`, `span`). `as` prop overrides element.
- `Card` renders themed container with correct surface fill, text color, and asymmetric border-radius per side variant. Internal padding via `--space-card-padding`.
- `Divider` renders vertical line with `--color-spine-line` color and `--divider-thickness` width.
- All components use CSS custom properties — zero hardcoded values.
- Barrel export re-exports all three components.
- Tests: Typography renders each role with correct element and class; Card renders tark/vitark with correct CSS classes; Divider renders vertical orientation.

**Dependencies:** T2 (tokens must exist for DS styling).

**Traced to:** DS Primitive Specification (03-ux.md Addendum), Rule #51 (M3 SOT), Rule #53 (M3 3-layer).

---

### T5: Implement ArgumentCard component

**Description:** Build `ArgumentCard.tsx` and `src/styles/components/argument-card.css`. Composes the `Card` and `Typography` (body-large) DS primitives. Adds the feature-specific triangular tail (`::before` pseudo-element, 8×10px, clip-path) and `aria-label` for screen reader side identification. Write component tests (test-first per Rule #50).

**Acceptance Criteria:**
- Renders argument text content via `Typography` (body-large) inside `Card`.
- Tark variant: sharp top-left corner, left-pointing tail.
- Vitark variant: sharp top-right corner, right-pointing tail.
- `aria-label="Tark argument"` or `aria-label="Vitark argument"` present.
- No hardcoded color values — all via CSS custom properties and DS primitives.
- Tests: renders with correct aria-label, correct CSS class per side, text content displayed, composes Card and Typography.

**Dependencies:** T2 (tokens), T3 (Argument type), T4 (DS Card + Typography primitives).

**Traced to:** AC-3, AC-4, AC-9, FR-3, Rule #40 (neutral colors), Rule #39 (a11y).

---

### T6: Implement Topic and LegendBar components

**Description:** Build `Topic.tsx` and `LegendBar.tsx` with their CSS. Topic composes Typography (headline-large, as="h1") with the debate topic text. LegendBar composes Typography (label-medium) for text segments; renders sticky bar with 3-column layout (matching timeline), colored dots, "Tark · for" | separator | "Vitark · against". Write component tests (test-first).

**Acceptance Criteria:**
- `Topic`: renders `<h1>` via Typography (headline-large) with provided text.
- `LegendBar`: renders sticky bar with correct text, colored dots, and `aria-label="Debate sides legend"` on `<nav>`.
- LegendBar sticks on scroll (`position: sticky`).
- LegendBar 3-column layout matches timeline spine alignment at desktop/tablet.
- LegendBar is centered single row on mobile.
- No hardcoded colors — token-only via DS primitives and feature CSS.
- Tests: h1 contains topic text, legend bar has correct accessible name, contains "Tark" and "Vitark" text.

**Dependencies:** T2 (tokens), T4 (DS Typography primitive).

**Traced to:** AC-2, FR-2, FR-4, Rule #39 (a11y).

---

### T7: Implement Timeline and DebateScreen components

**Description:** Build `Timeline.tsx`, `timeline.css`, `DebateScreen.tsx`, and `debate-screen.css`. Timeline composes Divider (vertical) for the center spine and renders `<ol>` of ArgumentCards in posting order with center-spine grid layout (desktop/tablet) and chat-bubble stagger (mobile). DebateScreen composes Topic + LegendBar + Timeline. Write component tests and wire up responsive breakpoints. BDD step definitions for all AC scenarios.

**Acceptance Criteria:**
- Timeline renders arguments in posting order as `<ol><li>` elements.
- Desktop/Tablet: CSS Grid with center spine via Divider primitive, Tark left / Vitark right.
- Mobile: flexbox single column, Tark left-aligned / Vitark right-aligned, ~72% width.
- Center spine visible on desktop/tablet (Divider + feature-specific dot markers).
- DebateScreen composes all sub-components and imports `DEBATE` data.
- Natural page scroll, no scroll containers.
- Tests: argument count matches data, DOM order matches posting order, responsive classes applied.
- All BDD step definitions pass for AC-1 through AC-10.

**Dependencies:** T3 (data), T4 (DS Divider primitive), T5 (ArgumentCard), T6 (Topic, LegendBar).

**Traced to:** AC-1, AC-3, AC-4, AC-6, AC-7, FR-3, FR-4, FR-6, FR-7.

---

### T8: Accessibility and theme verification

**Description:** Run axe-core programmatic audit, keyboard navigation walkthrough, contrast ratio verification for all token pairs in both themes. Verify `aria-label` attributes, heading hierarchy, landmark regions. Fix any gaps. Write targeted a11y tests.

**Acceptance Criteria:**
- Zero axe-core violations (critical + serious) in component render.
- All text meets 4.5:1 contrast (normal) / 3:1 (large) in both themes.
- `<main>`, `<nav>`, `<h1>` landmarks present and correct.
- `aria-label` on all argument cards.
- `data-theme="dark"` and `prefers-color-scheme: dark` both produce dark theme.
- Keyboard tab traverses landmark regions logically.
- Tests: axe-core integration test, contrast ratio assertions.

**Dependencies:** T7 (full screen assembled).

**Traced to:** AC-9, AC-10, FR-9, FR-10, Rule #39 (a11y).

---

### T9: Deployment cutover — update GitHub Pages workflow

**Description:** Update `.github/workflows/deploy-pages.yml` to build the Vite React app and deploy `dist/` instead of the static splash page folder. Add Node.js 20 setup, `npm ci`, `npm run build`. Update trigger paths. Verify deployment with `workflow_dispatch`.

**Acceptance Criteria:**
- Workflow uses `actions/setup-node@v4` with `node-version: 20`.
- `npm ci` and `npm run build` steps present.
- Artifact path changed to `dist`.
- Trigger paths updated to `["src/**", "index.html", "vite.config.ts", "package.json"]`.
- Coming-soon splash page is no longer deployed (root serves React app).
- `workflow_dispatch` trigger retained for manual deploys.
- Rollback: revert workflow YAML + force-deploy previous artifact via `workflow_dispatch`.

**Dependencies:** T7 (build output exists), T8 (quality verified).

**Traced to:** AC-8, FR-8, QG-A2.

---

### Task Dependency Graph

```
T1 (scaffold)
├── T2 (tokens)  ── T4 (DS primitives)  ── T5 (ArgumentCard) ─┐
│                                        ── T6 (Topic + LegendBar) ─┤
├── T3 (data) ─────────────────────────── T5 (ArgumentCard)    ─┤
│                                                                ├── T7 (Timeline + DebateScreen) ── T8 (a11y) ── T9 (deploy)
```

Parallelizable: T2 + T3 can run in parallel after T1. T5 + T6 can run in parallel after T4 (T5 also needs T3).

---

## 7. Quality Gaps

| ID | Gap | Severity | Status |
|---|---|---|---|
| QG-B1 | Exact Figma spacing values (padding, margins, spine width) need extraction during T5–T7 | Low | Non-blocking — Dev agent extracts via MCP read at implementation time |
| QG-B2 | PWA icons not designed | Low | Non-blocking — placeholder icons acceptable; design deferred |
| QG-B3 | Font stack reminder issue not yet created | Low | Non-blocking — deferred GitHub issue per D-7; created after Gate 4 |
| QG-DS1 | `--color-on-surface` was missing from architecture token list | Low | **Resolved** — added in §2.6 revision. Value: #1C1B1F / #E6E1E5. |
| QG-DS2 | Typography tokens were not in architecture token list | Low | **Resolved** — 13 typography tokens added in §2.6 revision. |
| QG-DS3 | `--divider-thickness` was not in architecture token list | Low | **Resolved** — added in §2.6 revision. Default 1px. |
| QG-DS4 | `--space-card-padding` was not in architecture token list | Low | **Resolved** — added in §2.6 revision. Value: 1rem. |
| QG-DS5 | Card contrast verification was pending | Medium | **Resolved** — verified at Design QA Pass 5 M3 rebuild. Vitark on-surface changed to #BF360C for WCAG compliance. |
| QG-DS6 | Exact card fill hex values were provisional | Low | **Resolved** — all values finalized at Design QA Pass 5 with M3-computed palette. |

---

## 8. Open Questions

| ID | Question | Status | Resolution |
|---|---|---|---|
| OQ-A1 | Framework selection | **Resolved** | React + Vite (PO decision D-1) |
| OQ-A2 | Test runner | **Resolved** | vitest + @testing-library/react + @cucumber/cucumber (PO decision D-2) |
| OQ-A3 | Font stack | **Resolved** | System font stack `Inter, "Segoe UI", Arial, sans-serif` (PO decision D-7) |
| OQ-A4 | Content source | **Resolved** | Extract from Figma designs via Dev MCP (PO decision QG-A4) |
| OQ-A5 | Deployment | **Resolved** | GitHub Pages, existing workflow updated (PO decision QG-A2) |
| OQ-A6 | Native strategy | **Resolved** | PWA now → Capacitor later (PO decision D-1b) |

---

## 9. Gate Decision

**Can proceed to build.** All architecture quality checks pass.

### Implementation Design ✅
1. ✅ Module boundaries explicit (§2.2 — includes DS primitives + feature components)
2. ✅ Traceability maps to files/modules/functions (§2.3, Task traces)
3. ✅ File/folder structure concrete (§2.7 — includes `src/design-system/`)
4. ✅ Data shapes documented (§2.4)
5. ✅ Interface signatures explicit (§2.5 — DS primitives + feature components)
6. ✅ Naming conventions align with repo (§2.3 glossary mapping)
7. ✅ Cross-cutting concerns addressed (theme §2.9, a11y §2.11, PWA §2.10, React 19 §2.16)

### Gate Integrity ✅
1. ✅ Risks and mitigations actionable (§4 — includes R-8 DS primitive risk)
2. ✅ Verification mapped to each AC (§5.3 — includes DS primitive test coverage)
3. ✅ Rollout/rollback documented (T9, §4 R-2)
4. ✅ Task decomposition atomic and dependency-ordered (§6 — T1–T9 with DS layer)
5. ✅ Key decisions owner-confirmed (D-1, D-1b, D-2, D-7, D-52, D-53, QG-A2, QG-A4)
6. ✅ Open questions all resolved (§8)

---

## 10. Architecture Plan Package

### Requirement & Design Traceability Snapshot

| AC | PRD FR | UX Element | Design QA | Architecture Module | Task |
|---|---|---|---|---|---|
| AC-1 | FR-1 | System journey | N/A (Gate 4) | `main.tsx`, `vite.config.ts` | T1 |
| AC-2 | FR-2 | Topic h1 | All 6 frames | `Topic.tsx` → Typography | T6 |
| AC-3 | FR-3 | Tark cards, timeline | All 6 frames | `ArgumentCard.tsx` → Card + Typography | T5 |
| AC-4 | FR-3 | Vitark cards, timeline | All 6 frames | `ArgumentCard.tsx` → Card + Typography | T5 |
| AC-5 | FR-5 | Static data | Placeholder content | `debate.ts` | T3 |
| AC-6 | FR-6 | Read-only, no controls | No interactive elements | `DebateScreen.tsx` | T7 |
| AC-7 | FR-7 | 3 breakpoints | 6 frames | `timeline.css`, `debate-screen.css` | T7 |
| AC-8 | FR-8 | Root path `/` | N/A (Gate 5) | `deploy-pages.yml` | T9 |
| AC-9 | FR-9 | Semantic HTML, ARIA | Contrast verified (Pass 5) | All components + DS primitives | T8 |
| AC-10 | FR-10 | Light/Dark tokens | 14 variables (M3-computed) | `tokens.css` | T2 |

### PO Decision Log (Architecture-Impacting)

| Decision | Options Considered | Chosen | Rationale | Date |
|---|---|---|---|---|
| D-1: Framework | React, Preact, Vanilla JS | React + Vite | Ecosystem needed for future growth; ~45KB acceptable | 2026-04-05 |
| D-1b: Native strategy | Flutter, Capacitor, PWA-only | PWA now → Capacitor later | Unified React codebase; Flutter reconsidered | 2026-04-05 |
| D-2: Test stack | vitest-only, vitest+cucumber | vitest + RTL + Cucumber | BDD for non-technical readability | 2026-04-05 |
| D-7: Font stack | Web fonts, system stack | System font stack | Zero-cost, fast; reminder issue deferred | 2026-04-05 |
| D-52: React version | React 18, React 19 | React 19 | Latest stable; makes forwardRef unnecessary; ecosystem ready | 2026-04-06 |
| D-53: Token architecture | Hand-picked values, M3 3-layer computed | M3 3-layer computed from seed #3949AB | Computed-first ensures M3 compliance; brand overrides only when needed | 2026-04-06 |
| QG-A2: Deploy | Vercel, Netlify, GitHub Pages | GitHub Pages (existing) | Workflow already exists; update only | 2026-04-05 |
| QG-A4: Content | Placeholder, Figma extraction | Figma extraction via MCP | Real content, no placeholder needed | 2026-04-05 |
```

---

