# Architecture Plan — post-tark-vitark
## Gate 4 — 2026-04-16

## Gate 4 Amendment — 2026-04-16 (H-4 Retroactive Figma Frame References)

Figma frame node IDs added to UI-impacting task blocks (T-3, T-4, T-5, T-6) per protocol hardening H-4. Node IDs sourced from Section 10 `Figma Active Implementation Reference`.

---

## 1. Architecture Readiness

**Ready**

Challenge Phase complete against `01-requirement.md`, `02-prd.md`, `03-ux.md` (Pass 4), and `04-design-qa.md`. All Must Resolve gaps are closed. Two open questions are explicitly accepted at architecture level (Section 8). Desktop Podium responsive spec gap identified during Orchestrator UX review and resolved (Section 2.6, T-4). Gate 4 may proceed.

---

## 2. Architecture Plan

### 2.1 Architectural Pattern

**Stateful container + dumb children** on the existing SPA (React 19 + Vite + TypeScript).

`DebateScreen` is elevated from a pure render component to the page-level state owner for session-only Composer state. All child components receive state via props. No Context API, no `useReducer`, no global store. Rationale: the slice is entirely local and single-screen; any additional infrastructure would be premature complexity.

### 2.2 Module Boundary Map

| Module | File | Responsibility |
|---|---|---|
| `DebateScreen` | `src/components/DebateScreen.tsx` (MODIFY) | State owner: `localPosts`, `selectedSide`. Renders combined argument list + Podium. |
| `Timeline` | `src/components/Timeline.tsx` (UNCHANGED) | Display-only. Accepts `Argument[]`. Append behavior achieved by passing `[...DEBATE.arguments, ...localPosts]`. |
| `ArgumentCard` | `src/components/ArgumentCard.tsx` (MODIFY) | Amendment-1: mobile 4-line clamp + Read more toggle. Previously pure display; gains local `expanded`/`isClamped` state. |
| `Podium` | `src/components/Podium.tsx` (NEW) | Composer bar. Owns `text`, `error`, `isBusy`. Calls `validatePost`. Calls `onPublish` on valid submit. Fixed to the bottom of the viewport. |
| `SegmentedControl` | `src/components/SegmentedControl.tsx` (NEW) | Native M3 two-option single-select side selector. Extracted for unit-testability and ARIA isolation. |
| `validatePost` | `src/lib/validatePost.ts` (NEW) | Pure function: Trimmed Text validation (whitespace-only, min 10, max 300). No React dependency. |

### 2.3 Data Flow

```
DebateScreen (state: localPosts, selectedSide)
  ├─ <Timeline arguments={[...DEBATE.arguments, ...localPosts]} />
  │    └─ <ArgumentCard argument={arg} />   ← Amendment-1: +expanded/isClamped state
  └─ <Podium
         selectedSide={selectedSide}
         onSideChange={setSelectedSide}
         onPublish={handlePublish}
     />
       ├─ <SegmentedControl options={['tark','vitark']} value={selectedSide} onChange={onSideChange} />
       ├─ <textarea>  ← Native TextField
       ├─ <button>    ← Publish IconButton (aria-label="Publish post")
       └─ validatePost(text) → ValidationResult
```

**Valid publish flow:**
1. `Podium.handleSubmit` calls `validatePost(text)`.
2. If valid, sets `isBusy = true`, calls `onPublish(text.trim(), side)`.
3. `DebateScreen.handlePublish` creates `{ id: DEBATE.arguments.length + localPosts.length + 1, side, text }` and appends to `localPosts`.
4. React re-renders `Timeline` with updated combined list; new post appears at the bottom.
5. `Podium` clears `text`, resets `error = null`, `isBusy = false`.

### 2.4 State Ownership and Lifecycle

| State | Owner Component | Initial Value | Reset Condition |
|---|---|---|---|
| `localPosts` | `DebateScreen` | `[]` | Full page refresh |
| `selectedSide` | `DebateScreen` | `'tark'` | Full page refresh |
| `text` | `Podium` | `''` | Cleared on valid publish |
| `error` | `Podium` | `null` | Set on invalid submit; cleared on valid publish |
| `isBusy` | `Podium` | `false` | Set to `true` on submit entry; reset after publish (synchronous) |
| `expanded` | `ArgumentCard` (per instance) | `false` | Component re-mount (page refresh) |
| `isClamped` | `ArgumentCard` (per instance) | `false` | Measured via `useEffect` on mount; updated on resize |

### 2.5 Interface Contracts and Data Shapes

#### `validatePost` — `src/lib/validatePost.ts`

```typescript
export type ValidationError = 'whitespace-only' | 'too-short' | 'too-long';

export type ValidationResult =
  | { valid: true }
  | { valid: false; error: ValidationError; message: string };

export function validatePost(text: string): ValidationResult;
```

Rules (applied in order):
- `text.trim().length === 0` → `{ valid: false, error: 'whitespace-only', message: 'Text cannot be empty or whitespace only.' }`
- `text.trim().length < 10` → `{ valid: false, error: 'too-short', message: 'Text must be between 10 and 300 characters.' }`
- `text.trim().length > 300` → `{ valid: false, error: 'too-long', message: 'Text must be between 10 and 300 characters.' }`
- otherwise → `{ valid: true }`

The `message` copy for `too-short` and `too-long` is unified per Design QA: *"Text must be between 10 and 300 characters."* (confirmed on ValidationError frames).

#### `SegmentedControl` — `src/components/SegmentedControl.tsx`

```typescript
interface SegmentedControlProps {
  options: readonly Side[];   // exactly 2 values for this slice: ['tark', 'vitark']; labels derived in render
  value: Side;
  onChange: (value: Side) => void;
  id?: string;
  'aria-labelledby'?: string;
}
```

ARIA pattern: `role="radiogroup"` on container; each option `role="radio"` with `aria-checked={value === option}`. Keyboard: Tab enters group; Arrow keys move selection; Space/Enter confirm.

**Note:** Issue #88 may describe `SegmentedControl` with a string-based API (`options: readonly string[]`, `value: string`, `onChange: (value: string) => void`) as story shorthand. That is not the implementation contract for this slice. The authoritative contract here uses `Side`-typed props; render labels are derived from the `Side` values (`'tark'`, `'vitark'`) at render time.

#### `Podium` — `src/components/Podium.tsx`

```typescript
interface PodiumProps {
  selectedSide: Side;
  onSideChange: (side: Side) => void;
  onPublish: (text: string, side: Side) => void;
}
```

Internal state: `text: string`, `error: string | null`, `isBusy: boolean`.

Publish button `disabled` condition: `text.trim().length === 0 || isBusy`.

Validation is called only on submit (not on every keystroke), per UX control contract.

Error region: `<p id="podium-error" role="alert" aria-live="polite">`. Textarea: `aria-describedby="podium-error"`, `aria-invalid={error !== null}`.

#### `DebateScreen` additions — `src/components/DebateScreen.tsx`

```typescript
const [localPosts, setLocalPosts] = useState<Argument[]>([]);
const [selectedSide, setSelectedSide] = useState<Side>('tark');

function handlePublish(text: string, side: Side): void {
  const newPost: Argument = {
    id: DEBATE.arguments.length + localPosts.length + 1,
    side,
    text,   // already trimmed by Podium before calling onPublish
  };
  setLocalPosts(prev => [...prev, newPost]);
}
```

Render fragment additions:
```tsx
<Timeline arguments={[...DEBATE.arguments, ...localPosts]} />
<Podium
  selectedSide={selectedSide}
  onSideChange={setSelectedSide}
  onPublish={handlePublish}
/>
```

### 2.6 Native Component Specifications (Traceability: `03-ux.md` Pass 4 Amendment — hardcoded-dimension DS instances)

Per the `03-ux.md` Pass 4 Amendment notes, the following Figma DS library instances cannot be resized via the Plugin API due to fixed inner dimensions; all are implemented as native builds using DS tokens:

#### Divider/Native (inside Podium)
- Native `<div>` — `display: block`, `height: 1px`, `background-color: var(--color-spine-line)`, `role="separator"`, `aria-orientation="horizontal"`.
- Must be **full-bleed across the Podium** (edge-to-edge at 390px, not inset by Podium's 16px horizontal padding). Implement as `width: calc(100% + 32px); margin-inline: -16px` to negate the Podium content-box inset.
- **Not** the DS `<Divider>` component (which is vertical-only in `divider.css`).

#### SegmentedToggle/Native → `SegmentedControl.tsx`
- Pill shape: `border-radius: 24px`; outer border: `1px solid var(--color-brand-primary)`
- Selected segment: `background: var(--color-brand-primary)`, text `var(--color-brand-on-primary)`
- Unselected segment: no fill, text `var(--color-brand-primary)`
- Width: `100%` (fills Podium content box; Podium's 16px horizontal padding already provides the L/R inset — do not double-subtract)
- Each segment: `flex: 1`

#### TextField/Native (inline in `Podium.tsx`)
- `<textarea>` — multiline, `resize: none`
- Accessible name: `aria-label="Post text"` (placeholder text alone is not a reliable accessible name per WCAG 2.1 SC 1.3.1)
- Rest border: `1px solid var(--color-spine-line)`; focus border: `1px solid var(--color-brand-primary)`; error border: `1px solid var(--color-error)`
- `border-radius: var(--radius-sharp)` (4px)
- Horizontal padding: 16px
- Placeholder: `"Post text"`, colour `var(--color-on-surface-variant)`
- `flex: 1` inside the bottom row (fills available width alongside IconButton)

#### Podium CSS — `src/styles/components/podium.css`

Core layout:
```css
:root {
  --podium-height: calc(109px + env(safe-area-inset-bottom, 0px));  /* shared layout token: full rendered Podium height (Figma base 109px + safe-area inset) so .debate-screen sibling always has correct bottom clearance via var(--podium-height) */
  --podium-inline-padding: var(--space-4);
}

.podium {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  padding: calc(var(--space-4) - var(--radius-sharp)) var(--podium-inline-padding) 0;
  padding-bottom: env(safe-area-inset-bottom, 0px);
  background-color: var(--color-surface-default);
}
```

Desktop responsive — Podium stays full-width; horizontal guttering increases via `--podium-inline-padding` at `min-width: 1024px` (matches Design QA desktop frames `582:50`, `583:62`):
```css
/* ── Desktop ── */
@media (min-width: 1024px) {
  .podium {
    --podium-inline-padding: var(--space-30);
  }
}
```

---

## 3. Impact Analysis

### Files to Modify

| File | Change |
|---|---|
| `src/components/DebateScreen.tsx` | Add `useState` for `localPosts`, `selectedSide`. Add `handlePublish`. Render combined list + `Podium`. |
| `src/components/ArgumentCard.tsx` | Amendment-1: add `expanded`, `isClamped` state, `useRef`, `useEffect` for clamp detection, Read more/Show less button. |
| `src/styles/debate-screen.css` | Add `display: flex; flex-direction: column` to `.debate-screen`. Add `padding-bottom: var(--podium-height)` for Podium clearance. |
| `src/styles/tokens.css` | Add `--color-on-surface-variant` and `--color-error` to all three theme blocks. |
| `src/styles/components/argument-card.css` | Add `.argument-card__body--clamped` clamp rule and `.read-more-btn` reset styles. |
| `tests/components/ArgumentCard.test.tsx` | Extend with Amendment-1 clamp/toggle tests. |
| `tests/components/DebateScreen.test.tsx` | Extend with Podium wiring, state, and publish tests. |

### Files to Create

| File | Purpose |
|---|---|
| `src/lib/validatePost.ts` | Pure validation function |
| `src/components/Podium.tsx` | Composer bar component |
| `src/components/SegmentedControl.tsx` | Native M3 side selector |
| `src/styles/components/podium.css` | Podium layout, fixed positioning, safe-area, desktop responsive |
| `src/styles/components/segmented-control.css` | SegmentedControl pill styles |
| `features/post-tark-vitark.feature` | BDD Cucumber scenarios (Flows A–G) |
| `features/step-definitions/post-tark-vitark.steps.ts` | Cucumber step implementations |
| `tests/lib/validatePost.test.ts` | Unit tests for validatePost |
| `tests/components/Podium.test.tsx` | Component tests for Podium |
| `tests/components/SegmentedControl.test.tsx` | Component tests for SegmentedControl |
| `tests/a11y/podium-a11y.test.tsx` | Accessibility tests for Podium |

### Files Unchanged

`src/data/debate.ts`, `src/components/Timeline.tsx`, `src/components/LegendBar.tsx`, `src/components/Topic.tsx`, `src/components/ThemeToggle.tsx`, `src/design-system/*`, `src/main.tsx`.

---

## 4. Token Additions

Two tokens are needed that are absent from `tokens.css`. Both are Layer 1 M3 Baseline values derived from seed `#3949AB`.

| Token | Light value | Dark value | Required by |
|---|---|---|---|
| `--color-on-surface-variant` | `#49454E` | `#CAC4D0` | TextField placeholder colour, error helper text supporting colour |
| `--color-error` | `#B3261E` | `#F2B8B5` | Validation error text, TextField error-state border |

Add to all three theme blocks in `tokens.css` under `/* ── Layer 1: M3 Baseline ── */`:

```css
/* inside :root, [data-theme="light"] */
--color-on-surface-variant: #49454E;
--color-error: #B3261E;

/* inside [data-theme="dark"] */
--color-on-surface-variant: #CAC4D0;
--color-error: #F2B8B5;

/* inside @media (prefers-color-scheme: dark) { :root:not([data-theme]) { ... } } */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme]) {
    --color-on-surface-variant: #CAC4D0;
    --color-error: #F2B8B5;
  }
}
```

No other new tokens are required. All other Composer token references (`--color-brand-primary`, `--color-brand-on-primary`, `--color-surface-default`, `--color-spine-line`) are already present.

---

## 5. Risk and Mitigation Plan

| ID | Risk | Severity | Mitigation |
|---|---|---|---|
| R-1 | Mobile keyboard-open: `position: fixed; bottom: 0` works in iOS Safari and Chrome Android but on some older Android browsers the keyboard may obscure fixed elements rather than resize the visual viewport. | High | Gate 5.5 runtime QA must include a keyboard-open test on a real or emulated Android viewport. Use `padding-bottom: env(safe-area-inset-bottom, 0px)` in `.podium` to protect home indicator. Accept browser-level variation as known-acceptable outside this slice scope. |
| R-2 | `padding-bottom` on `.debate-screen` for Podium clearance is hardcoded to `var(--podium-height)`. If Podium content height grows (e.g. error text wrapping), bottom content may be partially hidden. In addition, `.podium` adds `padding-bottom: env(safe-area-inset-bottom, 0px)`, making the rendered Podium taller than 187px on iOS home-indicator devices. | Medium | Declare `--podium-height: calc(187px + env(safe-area-inset-bottom, 0px))` on `:root` (shared ancestor) so `.debate-screen` clearance accounts for the full rendered Podium height. Both `.podium` and `.debate-screen` reference `var(--podium-height)`. The base 187px matches the Figma Composer frame height. If future states require a taller Podium, update this single property. |
| R-3 | Amendment-1 clamp detection via `scrollHeight > clientHeight` may return `false` on initial render if fonts have not loaded, causing "Read more" button to not appear. | Medium | Use `useEffect` with a `ResizeObserver` on the text `ref` node to re-measure after font load. Accept that in rare cases the button appears unnecessarily (non-blocking UX). |
| R-4 | Amendment-1 has no Figma frame evidence for expanded/collapsed card states. No Gate 3B revision required (open item OQ-2 accepted). | Low | Validate at Gate 5.5 runtime QA. Implementation follows architecture spec. |
| R-5 | Monotonic post ID (`DEBATE.arguments.length + localPosts.length + 1`) provides uniqueness only within a single in-memory session. IDs are used only as React keys; collision across sessions is not possible (session-local state). | Low | Accept. Document in code that ID uniqueness guarantees are session-scoped only. |
| R-6 | Existing DS `Divider` component is vertical-only (`divider--vertical` in `divider.css`). Using it in Podium would require a horizontal variant addition to DS, expanding scope. | Low | Use Divider/Native inline div per Known Rule #70. Add code comment: `{/* Divider/Native — horizontal separator; DS Divider is vertical-only. See Known Rule #70. */}`. |
| R-7 | `isBusy` guard is synchronous (in-memory publish is instant). The guard window is ~0ms in practice. | Low | Guard is still required per UX spec (duplicate submit protection). The test verifies the guard path exists even if the window is narrow. |

### Rollout Strategy

Single feature branch → PR → Copilot review loop → Gate 5.5 runtime QA → merge to master. No feature flags, no infrastructure changes, no database migrations.

### Rollback Strategy

Revert the merge commit on master. No data persistence; no backend; full rollback is clean and instant.

---

## 6. Verification Strategy

### Acceptance Criteria Coverage Map

| AC | Criterion | Test Layer | Location |
|---|---|---|---|
| AC-1 | Composer always visible, bottom-anchored | CSS source assertion (`position: fixed` present in `podium.css`) | `tests/components/Podium.test.tsx` |
| AC-2 | Inline, not full-screen | CSS source assertion (Podium layout styles in `podium.css`; no full-screen/modal treatment) | `tests/components/Podium.test.tsx` |
| AC-3 | M3 SegCtrl, exactly Tark + Vitark | Component test | `tests/components/SegmentedControl.test.tsx` |
| AC-4 | Tark preselected on load | Component test | `tests/components/DebateScreen.test.tsx` |
| AC-5 | Last side remembered after change | Component test | `tests/components/DebateScreen.test.tsx` |
| AC-6 | Open posting, no auth gate | DOM assertion (no auth element) | `tests/components/Podium.test.tsx` |
| AC-7 | Text-only (no media controls) | DOM assertion | `tests/components/Podium.test.tsx` |
| AC-8 | Trimmed Text validation applied | Unit test | `tests/lib/validatePost.test.ts` |
| AC-9 | Whitespace-only rejected | Unit test | `tests/lib/validatePost.test.ts` |
| AC-10 | Below 10 rejected | Unit test (boundary: length 9 → invalid) | `tests/lib/validatePost.test.ts` |
| AC-11 | Above 300 rejected | Unit test (boundary: length 301 → invalid) | `tests/lib/validatePost.test.ts` |
| AC-12 | 10..300 accepted | Unit test (boundary: 10, 300 → valid) | `tests/lib/validatePost.test.ts` |
| AC-13 | Internal spaces/newlines allowed | Unit test (text with `\n` and spaces within bounds) | `tests/lib/validatePost.test.ts` |
| AC-14 | Valid submit publishes immediately | Integration test | `tests/components/DebateScreen.test.tsx` |
| AC-15 | Chronological append at bottom | Integration test (new post is last in list) | `tests/components/DebateScreen.test.tsx` |
| AC-16 | No edit/delete controls | DOM assertion (no edit/delete buttons) | `tests/components/ArgumentCard.test.tsx` |
| AC-17 | Mobile keyboard-open Composer pinned | CSS structure assertion + **Gate 5.5 runtime QA** | `tests/components/Podium.test.tsx` + Gate 5.5 |
| AC-18 | Refresh restores baseline | Component unmount/remount test (localPosts starts empty) | `tests/components/DebateScreen.test.tsx` |
| Amendment-1 | Mobile 4-line clamp + Read more toggle | Component test + **Gate 5.5 runtime QA** | `tests/components/ArgumentCard.test.tsx` + Gate 5.5 |
| C-4 (A11y) | ARIA roles; error announcements | Axe-core + ARIA attribute assertions | `tests/a11y/podium-a11y.test.tsx` |

### BDD Cucumber Scenarios (`features/post-tark-vitark.feature`)

```gherkin
Feature: Post Tark or Vitark to the Debate Screen
  As a public visitor on the Debate Screen
  I want to compose and publish a Tark or Vitark post
  So that my argument appears immediately in the debate

  Scenario: Composer is visible on initial load
  Scenario: Tark is preselected by default on load
  Scenario: Visitor changes side to Vitark; last-selected side is remembered
  Scenario: Whitespace-only input is rejected with an error message
  Scenario: Input of fewer than 10 characters is rejected
  Scenario: Input of exactly 10 characters is accepted
  Scenario: Input of exactly 300 characters is accepted
  Scenario: Input of more than 300 characters is rejected
  Scenario: Text with internal spaces and newlines is accepted when length is in range
  Scenario: Valid post is appended at the bottom of the debate
  Scenario: Composer input is cleared after a valid publish
  Scenario: Selected side is preserved after a valid publish
  Scenario: Second publish attempt is blocked while first is in progress (busy lock)
  Scenario: Full page refresh resets the debate to baseline static content
```

---

## 7. Task Decomposition

Tasks are ordered by dependency. Tasks with no declared dependency may be worked in parallel.

---

### T-1 — Token additions: `--color-on-surface-variant` + `--color-error`

**Files:** `src/styles/tokens.css`

**Change:** Add both tokens to all three theme blocks (`:root`/`[data-theme="light"]`, `[data-theme="dark"]`, `@media (prefers-color-scheme: dark) { :root:not([data-theme]) { ... } }`). Values per Section 4.

**Acceptance criteria:**
- Both token variables are present and non-empty in light and dark computed styles.

**Test file:** `tests/tokens.test.ts` — add assertions for both tokens in both themes.

**Implementation note:** Required for placeholder and error visual styling referenced by this slice.

**Dependency:** None.

---

### T-2 — Extract `validatePost` pure utility

**Files:** `src/lib/validatePost.ts`, `tests/lib/validatePost.test.ts`

**Change:** New module. Implement `validatePost(text: string): ValidationResult` per interface in Section 2.5.

**Acceptance criteria:**
- `''` → `whitespace-only` error
- `'   '` → `whitespace-only` error
- `'abc'` (trimmed length 3) → `too-short` error
- `'a'.repeat(9)` → `too-short` error
- `'a'.repeat(10)` → `valid: true`
- `'a'.repeat(300)` → `valid: true`
- `'a'.repeat(301)` → `too-long` error
- `'  hello world  '` (trimmed 11 chars) → `valid: true` (leading/trailing stripped)
- `'hello\nworld!!'` (14 chars with newline) → `valid: true` (internal newline allowed)

**AC coverage:** AC-8, AC-9, AC-10, AC-11, AC-12, AC-13.

**Dependency:** None.

---

### T-3 — Native `SegmentedControl` component

**Files:** `src/components/SegmentedControl.tsx`, `src/styles/components/segmented-control.css`

**Change:** New component. Pill shape, selected/unselected token bindings per Section 2.6. `role="radiogroup"` + `role="radio"` ARIA. Arrow-key navigation.

**Acceptance criteria:**
- Renders exactly `options.length` segments.
- The segment matching `value` has `aria-checked="true"`.
- Clicking a non-selected segment fires `onChange` with the correct option.
- Arrow key navigates between segments and calls `onChange`.
- `role="radiogroup"` on container; `role="radio"` on each segment.

**Test file:** `tests/components/SegmentedControl.test.tsx`

**AC coverage:** AC-3, AC-4, AC-5.

**Dependency:** T-1 (tokens).

**Figma Reference:**
| Frame | Node ID | URL |
|---|---|---|
| Default/Light/Mobile | `304:2` | https://www.figma.com/design/CsPAyUdLSStdmNpmiBMESQ?node-id=304-2 |
| Default/Dark/Mobile | `414:78` | https://www.figma.com/design/CsPAyUdLSStdmNpmiBMESQ?node-id=414-78 |

---

### T-4 — `Podium` component (Composer bar)

**Files:** `src/components/Podium.tsx`, `src/styles/components/podium.css`

**Change:** New component. Contains Divider/Native (inline), a single side chip `<button>`, native `<textarea>`, and Publish `<button>`. `position: fixed; bottom: 0; left: 0; right: 0`. Shared layout custom property declared on `:root` as `--podium-height: calc(109px + env(safe-area-inset-bottom, 0px))` (full rendered height: base 109px + safe-area inset, so `.debate-screen` sibling always has correct bottom clearance via `var(--podium-height)`). Safe-area via `env(safe-area-inset-bottom, 0px)`. Desktop breakpoint at `min-width: 1024px` keeps the Podium full-width and applies horizontal guttering via `--podium-inline-padding: var(--space-30)` (matches Design QA desktop frames `582:50` / `583:62`). Calls `validatePost` on submit. Error region with `role="alert"` and `aria-live="polite"`. Textarea `aria-invalid` and `aria-describedby`. Amendment (Gate 5.5 QA fix): SegmentedControl replaced by inline chip `<button>`; `--podium-height` corrected from 187px to 109px; desktop layout changed from centred/max-width to full-width padding.

**Acceptance criteria:**
- Side chip button, `textarea`, and Publish button are all in the DOM.
- Pressing the side chip button toggles the selected side used for publish.
- Publish button is `disabled` when `textarea` is empty.
- Submitting whitespace-only text renders an error message and does **not** call `onPublish`.
- Submitting valid text (10–300 characters) calls `onPublish(trimmedText, side)`.
- `textarea` is cleared after a valid submit.
- `isBusy = true` prevents a second call to `onPublish` before the first completes.
- Error message is associated to textarea via `aria-describedby`.
- `podium.css` source contains `position: fixed` (assert by reading file text in test; jsdom does not apply external stylesheets, so `getComputedStyle` assertions for CSS-injected layout properties are not used).
- Desktop `@media (min-width: 1024px)` full-width padding (`--podium-inline-padding: var(--space-30)`) is verified in Gate 5.5 runtime QA; no jsdom assertion for @media-scoped computed styles.

**Test file:** `tests/components/Podium.test.tsx`

**AC coverage:** AC-1, AC-2, AC-6, AC-7, AC-8..AC-13.

**Dependency:** T-1, T-2.

**Figma Reference:**
| Frame | Node ID | URL |
|---|---|---|
| Default/Light/Mobile | `304:2` | https://www.figma.com/design/CsPAyUdLSStdmNpmiBMESQ?node-id=304-2 |
| Default/Dark/Mobile | `414:78` | https://www.figma.com/design/CsPAyUdLSStdmNpmiBMESQ?node-id=414-78 |
| Default/Light/Tablet | `580:26` | https://www.figma.com/design/CsPAyUdLSStdmNpmiBMESQ?node-id=580-26 |
| Default/Dark/Tablet | `581:38` | https://www.figma.com/design/CsPAyUdLSStdmNpmiBMESQ?node-id=581-38 |
| Default/Light/Desktop | `582:50` | https://www.figma.com/design/CsPAyUdLSStdmNpmiBMESQ?node-id=582-50 |
| Default/Dark/Desktop | `583:62` | https://www.figma.com/design/CsPAyUdLSStdmNpmiBMESQ?node-id=583-62 |

> **Note — interaction-state frames:** Typing, ValidationError, SubmitSuccess, and KeyboardOpen state frames were planned in Gate 3A UX doc but deferred to Pass 5 (pending PO Composer design approval) and were never executed in Figma. These interaction states are validated via BDD tests (`features/post-tark-vitark.feature`) and Gate 5.5 runtime QA. No Figma node IDs exist for these states.

---

### T-5 — Wire `Podium` into `DebateScreen` + layout fix

**Files:** `src/components/DebateScreen.tsx`, `src/styles/debate-screen.css`

**Change:**
- Add `useState` for `localPosts: Argument[]` (init `[]`) and `selectedSide: Side` (init `'tark'`).
- Add `handlePublish(text, side)` using monotonic ID (see Section 2.5).
- Pass `[...DEBATE.arguments, ...localPosts]` to `<Timeline>`.
- Render `<Podium selectedSide={selectedSide} onSideChange={setSelectedSide} onPublish={handlePublish} />`.
- In `debate-screen.css`: add `display: flex; flex-direction: column` and `padding-bottom: var(--podium-height)` to `.debate-screen` to prevent content hiding behind fixed Podium.

**Acceptance criteria:**
- `<Podium>` is present in the rendered output.
- `selectedSide` defaults to `'tark'` on mount.
- After calling `onSideChange('vitark')`, `selectedSide` updates.
- After a valid publish, the new post appears as the last argument in the Timeline.
- `localPosts` starts empty; simulating re-mount (refresh) restores it to empty.
- Remount resets `selectedSide` to `'tark'`.

**Test file:** `tests/components/DebateScreen.test.tsx` (extend existing file)

**AC coverage:** AC-1, AC-4, AC-5, AC-14, AC-15, AC-18.

**Dependency:** T-2, T-4.

**Figma Reference:**
| Frame | Node ID | URL |
|---|---|---|
| Default/Light/Mobile | `304:2` | https://www.figma.com/design/CsPAyUdLSStdmNpmiBMESQ?node-id=304-2 |
| Default/Dark/Mobile | `414:78` | https://www.figma.com/design/CsPAyUdLSStdmNpmiBMESQ?node-id=414-78 |
| Default/Light/Tablet | `580:26` | https://www.figma.com/design/CsPAyUdLSStdmNpmiBMESQ?node-id=580-26 |
| Default/Dark/Tablet | `581:38` | https://www.figma.com/design/CsPAyUdLSStdmNpmiBMESQ?node-id=581-38 |
| Default/Light/Desktop | `582:50` | https://www.figma.com/design/CsPAyUdLSStdmNpmiBMESQ?node-id=582-50 |
| Default/Dark/Desktop | `583:62` | https://www.figma.com/design/CsPAyUdLSStdmNpmiBMESQ?node-id=583-62 |

---

### T-6 — Amendment-1: Mobile 4-line clamp + Read more in `ArgumentCard`

**Files:** `src/components/ArgumentCard.tsx`, `src/styles/components/argument-card.css`

**Change:**
- Add `expanded: boolean` state (init `false`) and `isClamped: boolean` state (init `false`).
- Add `useRef<HTMLElement>` on the text container.
- `useEffect` + `ResizeObserver`: sets `isClamped` when `node.scrollHeight > node.clientHeight` while `expanded === false`.
- Render Read more/Show less `<button aria-expanded={expanded}>` only when `isClamped || expanded`.
- Add `.argument-card__body--clamped` to CSS: `display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden`.
- Apply the class when `!expanded`.

**Acceptance criteria:**
- Read more button is not rendered when `isClamped` is `false`.
- Read more button is rendered when `isClamped` is `true` (mock `scrollHeight > clientHeight`).
- Clicking Read more sets `expanded = true`; button text changes to "Show less".
- Clicking Show less sets `expanded = false`; clamp class re-applied.
- Button has `aria-expanded` attribute reflecting current state.

**Test setup note:** `ResizeObserver` is not available in jsdom. Add a `ResizeObserver` stub to `tests/setup.ts` (or mock it per-test in `ArgumentCard.test.tsx`) before testing clamp detection.
- No edit or delete buttons are present.

**Test file:** `tests/components/ArgumentCard.test.tsx` (extend existing file)

**AC coverage:** Amendment-1, AC-16.

**Dependency:** None (independent of Podium work).

**Figma Reference:** None — OQ-2 accepted; no Figma frame evidence exists for Amendment-1 (mobile 4-line clamp + Read more). Validate at Gate 5.5 runtime QA.

---

### T-7 — BDD Cucumber feature file + step definitions

**Files:** `features/post-tark-vitark.feature`, `features/step-definitions/post-tark-vitark.steps.ts`

**Change:** New files. Implement all 14 BDD scenarios from Section 6 as runnable Cucumber scenarios wired to JSDOM via `@cucumber/cucumber` step definitions. Follow the pattern in `features/step-definitions/scaffold.steps.ts` for imports and assertions. Each scenario maps to one or more acceptance criteria.

**Acceptance criteria:**
- All 14 scenarios pass in CI (`npm run test:bdd`).
- Each scenario includes a clear `Given`/`When`/`Then` structure with no pending steps.

**AC coverage:** Full AC-1..AC-18; Flows A–G.

**Dependency:** T-4, T-5.

---

### T-8 — Accessibility tests for `Podium`

**Files:** `tests/a11y/podium-a11y.test.tsx`

**Change:** New file. Follow the pattern in `tests/a11y/debate-screen-a11y.test.tsx`. Tests:
- Axe-core no violations on `<Podium>` render.
- `textarea` has accessible name (via `aria-label` or associated `<label>`).
- Publish button has accessible name (`aria-label="Publish post"`).
- After an invalid submit, `aria-invalid="true"` is present on `textarea` and `aria-describedby` links to an error element.
- `SegmentedControl` has `role="radiogroup"` and each option has `role="radio"`.

**AC coverage:** C-4 (accessibility baseline).

**Dependency:** T-4.

---

### Dependency Order and Parallelism

```
T-1 ────────────────────────────────────────────────────────────┐
T-2 ────────────────────────────────────────────────────────────┤
                                                                 ↓
T-6 (independent) ──────────── T-3 (needs T-1) → T-4 (needs T-1, T-2, T-3) → T-5 → T-7
                                                                  └──────────────────→ T-8
```

Parallelizable pairs: {T-1, T-2, T-6}; {T-3} after T-1; {T-4} after T-3; {T-5, T-8} after T-4.

---

## 8. Open Questions

| ID | Question | Status | Recommended Resolution |
|---|---|---|---|
| OQ-1 | PO constraint item 9 references "FR-6/AC-6 includes mobile 4-line clamp (Amendment 1)." FR-6/AC-6 in `02-prd.md` is the open-posting/no-auth criterion — not the clamp behavior. The AC reference appears to be a labelling error. | **Accepted** — Amendment-1 is treated as an explicit in-scope addition via PO constraint, independent of legacy AC numbering. No PRD revision required. | Proceed. |
| OQ-2 | Amendment-1 (mobile 4-line clamp + Read more) has no Figma frame evidence. No expanded or collapsed card state was designed in Gate 3B. | **Accepted pending Gate 5.5** — implement per Section 2.5 spec. Gate 5.5 runtime QA is the validation gate. | Proceed. Builder follows architecture spec; no design revision required. |
| OQ-3 | Desktop Podium centering was not explicitly specified in the architecture agent output. Identified during Orchestrator UX review against Design QA desktop frames (`582:50`, `583:62`). | **Resolved (2026-04-16)** — PO selected option 1: add desktop breakpoint to architecture. Applied to Section 2.6 Podium CSS spec and T-4 acceptance criteria. | Closed. |

---

## 9. Gate Decision

**Can proceed to build.**

All 18 acceptance criteria plus Amendment-1 and C-4 are covered by the architecture plan. Module boundaries, interface contracts, data shapes, task ordering, and test locations are fully specified. Known Rule #70 is explicitly accounted for across Divider/Native, SegmentedToggle/Native, and TextField/Native. All open questions are accepted or resolved. Architecture quality checks per `.github/references/architecture-quality-checks.md` pass. Desktop Podium responsive spec added per PO direction (OQ-3 resolved). H-4 Figma frame reference requirement satisfied: Figma Reference fields added to all UI-impacting task blocks (T-3, T-4, T-5, T-6).

---

## 10. Architecture Plan Package

### Traceability Snapshot

| Artifact | Status |
|---|---|
| `01-requirement.md` — Requirement Context Package | Frozen; fully preserved in PRD and architecture |
| `02-prd.md` — PRD v0 + Amendments 1 & 2 | Frozen; 18/18 ACs mapped |
| `03-ux.md` — Gate 3A Pass 4 (2026-04-15) | Active; Pass 4 Composer rebuild is authoritative implementation reference |
| `04-design-qa.md` — Gate 3B (2026-04-11) | Agent-Ready; 18/18 ACs covered; PO-approved at Gate 3 close |

### Figma Active Implementation Reference

| Frame | Node ID | URL |
|---|---|---|
| Default/Light/Mobile (authoritative, Pass 4) | `304:2` | https://www.figma.com/design/CsPAyUdLSStdmNpmiBMESQ?node-id=304-2 |
| Default/Dark/Mobile (authoritative, Pass 4) | `414:78` | https://www.figma.com/design/CsPAyUdLSStdmNpmiBMESQ?node-id=414-78 |
| Default/Light/Tablet | `580:26` | https://www.figma.com/design/CsPAyUdLSStdmNpmiBMESQ?node-id=580-26 |
| Default/Dark/Tablet | `581:38` | https://www.figma.com/design/CsPAyUdLSStdmNpmiBMESQ?node-id=581-38 |
| Default/Light/Desktop | `582:50` | https://www.figma.com/design/CsPAyUdLSStdmNpmiBMESQ?node-id=582-50 |
| Default/Dark/Desktop | `583:62` | https://www.figma.com/design/CsPAyUdLSStdmNpmiBMESQ?node-id=583-62 |

> **Note — interaction-state frames:** Typing, ValidationError, SubmitSuccess, and KeyboardOpen state frames were planned in Gate 3A UX doc (Pass 5, pending Composer design approval) but were never executed in Figma. These states are validated via BDD tests and Gate 5.5 runtime QA. No Figma node IDs exist.

Section 02 container: node `399:78`, file `CsPAyUdLSStdmNpmiBMESQ`.

### File/Folder Change Map

```
src/
  lib/
    validatePost.ts               [CREATE]
  components/
    DebateScreen.tsx              [MODIFY]
    Podium.tsx                    [CREATE]
    SegmentedControl.tsx          [CREATE]
    ArgumentCard.tsx              [MODIFY — Amendment-1]
  styles/
    tokens.css                    [MODIFY — +2 tokens]
    debate-screen.css             [MODIFY — flex layout + padding-bottom]
    components/
      podium.css                  [CREATE]
      segmented-control.css       [CREATE]
      argument-card.css          [MODIFY — +clamp + read-more-btn]
features/
  post-tark-vitark.feature        [CREATE]
  step-definitions/
    post-tark-vitark.steps.ts     [CREATE]
tests/
  lib/
    validatePost.test.ts          [CREATE]
  tokens.test.ts                  [MODIFY — +token assertions]
  components/
    Podium.test.tsx               [CREATE]
    SegmentedControl.test.tsx     [CREATE]
    ArgumentCard.test.tsx         [MODIFY — +Amendment-1 tests]
    DebateScreen.test.tsx         [MODIFY — +state wiring tests]
  a11y/
    podium-a11y.test.tsx          [CREATE]
```

### Product Owner Architecture Decision Log

| # | Decision | Options Considered | Chosen | Rationale |
|---|---|---|---|---|
| AD-1 | State management strategy | Context API, `useReducer`, lifted `useState` | Lifted `useState` in `DebateScreen` | Single screen; session-local; simplest; resets cleanly on refresh with no teardown |
| AD-2 | Post ID generation | `Date.now()`, `crypto.randomUUID()`, monotonic counter | Monotonic counter (`DEBATE.arguments.length + localPosts.length + 1`) | Deterministic; test-friendly; no external dependency; session-unique |
| AD-3 | Podium positioning for keyboard-safe pinning | `position: sticky; bottom: 0`, flex+DVH column, `position: fixed; bottom: 0` | `position: fixed; bottom: 0` | Most reliable across iOS Safari + Chrome Android for keyboard-open viewport |
| AD-4 | `validatePost` location | Inline in `Podium.tsx`, `src/utils/`, `src/lib/` | `src/lib/validatePost.ts` | Enables direct unit testing and BDD step bindings without component mount |
| AD-5 | `SegmentedControl` ARIA pattern | `role="tablist"`, `role="radiogroup"`, custom `role="group"` | `role="radiogroup"` + `role="radio"` | M3 single-select semantics map precisely to radio group; correct screen reader behavior |
| AD-6 | Horizontal Divider in Podium | DS `<Divider>` component, native `<div>` | Native `<div>` | DS `Divider` is vertical-only in current implementation (Known Rule #70) |
| AD-7 | `SegmentedControl` scope | DS component (new), feature component | Feature component in `src/components/` (not `src/design-system/`) | PO constraint: no new DS components unless clearly necessary; this is slice-specific |
| AD-8 | Desktop Podium responsive spec | Span full viewport width, centre with max-width + transform | Span full viewport width; increase horizontal guttering via `--podium-inline-padding: var(--space-30)` at `min-width: 1024px` | Matches Design QA desktop frames `582:50`/`583:62`; PO selected option 1 (2026-04-16); centring approach superseded by PR #108 full-width redesign |
