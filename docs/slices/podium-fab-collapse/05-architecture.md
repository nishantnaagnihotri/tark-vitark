# Architecture Plan — podium-fab-collapse
## Gate 4 — 2026-04-19

**Architecture Readiness: Ready**
**Gate Decision: can proceed to build**

---

## 1. Architectural Pattern

Modular monolith, lift-state pattern. New mobile surface components (`PodiumFAB`, `PodiumBottomSheet`) are presentation-only children. All new state lives in the existing `DebateScreen` orchestrator. No new service boundaries. No new npm dependencies.

---

## 2. Architecture Plan

### 2.1 Desktop / Mobile Rendering Decision

| Option | Approach | Verdict |
|---|---|---|
| A — CSS hide/show | Both DOM trees always present; media-query `display:none` hides irrelevant one | Rejected: hidden bottom-sheet inputs remain keyboard-focusable; `inert` management adds JS anyway |
| B — JS conditional render | `window.matchMedia('(max-width: 767px)')` drives `isMobile` state; render exactly one DOM tree | **Selected**: clean DOM, zero inert management, naturally accessible, no flicker |

`isMobile` is initialized synchronously with `window.matchMedia(...).matches` inside `useState(() => ...)`.

### 2.2 Module Boundary Map

```
DebateScreen (orchestrator)
├── [isMobile = false] Podium (existing, unchanged)
└── [isMobile = true]
    ├── PodiumFAB       (new, presentational)
    └── PodiumBottomSheet (new, presentational)
            └── SegmentedControl (existing DS component — satisfies Advisory A1)
```

### 2.3 Data / State Ownership (`DebateScreen.tsx`)

| State | Type | Owner | Notes |
|---|---|---|---|
| `selectedSide` | `Side` | `DebateScreen` | existing — now also drives FAB pre-selection |
| `isMobile` | `boolean` | `DebateScreen` | new — matchMedia listener |
| `isFabExpanded` | `boolean` | `DebateScreen` | new — collapsed=`+`, expanded=T/V/× |
| `isSheetOpen` | `boolean` | `DebateScreen` | new — bottom sheet visibility |

State transitions:
```
FAB collapsed (+)  →tap +→  FAB expanded (T/V/×)
FAB expanded       →tap T→  selectedSide='tark',  isSheetOpen=true
FAB expanded       →tap V→  selectedSide='vitark', isSheetOpen=true
FAB expanded       →tap ×→  isFabExpanded=false
Sheet open         →tap × or scrim or drag-down→  isSheetOpen=false  [FAB stays expanded]
```

`isFabExpanded` and `isSheetOpen` both reset to `false` when `isMobile` transitions to `false` (resize from mobile → desktop).

### 2.4 Interface Contracts

**`PodiumFABProps`** (`src/components/PodiumFAB.tsx`)
```ts
interface PodiumFABProps {
    isExpanded: boolean;
    onExpand: () => void;
    onSideSelect: (side: Side) => void;
    onCollapse: () => void;
}
```

**`PodiumBottomSheetProps`** (`src/components/PodiumBottomSheet.tsx`)
```ts
interface PodiumBottomSheetProps {
    isOpen: boolean;
    selectedSide: Side;
    onSideChange: (side: Side) => void;
    onPublish: (text: string, side: Side) => void;
    onClose: () => void;
}
```

**`DebateScreen.tsx` additions (sketch)**
```ts
const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 767px)').matches);
const [isFabExpanded, setIsFabExpanded] = useState(false);
const [isSheetOpen, setIsSheetOpen] = useState(false);

useEffect(() => {
    const mql = window.matchMedia('(max-width: 767px)');
    const handler = (e: MediaQueryListEvent) => {
        setIsMobile(e.matches);
        if (!e.matches) { setIsFabExpanded(false); setIsSheetOpen(false); }
    };
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
}, []);
```

Render divergence:
```tsx
{isMobile ? (
    <>
        <PodiumFAB
            isExpanded={isFabExpanded}
            onExpand={() => setIsFabExpanded(true)}
            onSideSelect={(side) => { setSelectedSide(side); setIsSheetOpen(true); }}
            onCollapse={() => setIsFabExpanded(false)}
        />
        <PodiumBottomSheet
            isOpen={isSheetOpen}
            selectedSide={selectedSide}
            onSideChange={setSelectedSide}
            onPublish={handlePublish}
            onClose={() => setIsSheetOpen(false)}
        />
    </>
) : (
    <Podium selectedSide={selectedSide} onSideChange={setSelectedSide} onPublish={handlePublish} />
)}
```

### 2.5 PodiumFAB DOM Structure

```html
<!-- Collapsed -->
<button class="podium-fab" aria-label="Open post composer" aria-expanded="false">
    <span aria-hidden="true">+</span>
</button>

<!-- Expanded -->
<div class="podium-fab podium-fab--expanded" role="group" aria-label="Post composer options">
    <button class="podium-fab__mini-btn podium-fab__mini-btn--tark" aria-label="Post as Tark">T</button>
    <button class="podium-fab__mini-btn podium-fab__mini-btn--vitark" aria-label="Post as Vitark">V</button>
    <button class="podium-fab__dismiss" aria-label="Close">×</button>
</div>
```

### 2.6 PodiumBottomSheet DOM Structure

```html
<div class="podium-sheet-scrim" aria-hidden="true"></div>
<div role="dialog" aria-modal="true" aria-label="Post composer" class="podium-bottom-sheet podium-bottom-sheet--open">
    <div class="podium-bottom-sheet__handle" aria-hidden="true"></div>
    <button class="podium-bottom-sheet__close" aria-label="Close post composer">×</button>
    <form class="podium-bottom-sheet__form" aria-label="Post composer">
        <SegmentedControl options={['tark','vitark']} value={selectedSide} onChange={onSideChange} />
        <textarea aria-label="Post text" aria-describedby="sheet-podium-error" aria-invalid={error !== null} />
        <button type="submit" aria-label="Publish post" />
        <p id="sheet-podium-error" role="alert" aria-live="polite">{error ?? ''}</p>
    </form>
</div>
```

### 2.7 Drag-to-Dismiss

Implemented via pointer events (no npm dependency):
- `pointerdown` on handle: record `startY`
- `pointermove`: track `deltaY`
- `pointerup`: if `deltaY > 80px` → call `onClose()`; else snap back via CSS transition
- `touch-action: none` on handle; `touch-action: pan-y` on content area

### 2.8 Animation Strategy

CSS transitions only. No JS animation library.
- FAB mini-buttons: `opacity 0→1`, `transform: scale(0.8)→1` — `300ms ease-out`
- Bottom sheet: `transform: translateY(100%)→translateY(0)` — `300ms ease-out`
- Scrim: `opacity 0→0.32` — `300ms ease-out`
- `will-change: transform` on sheet panel for GPU compositing

### 2.9 CSS / Token Strategy

**New token (`src/styles/tokens.css`)**:
```css
--color-scrim: rgba(0, 0, 0, 0.32);
```

**`podium.css` — `--podium-height` breakpoint fix:**
```css
:root { --podium-height: 0px; }
@media (min-width: 768px) {
    :root { --podium-height: calc(109px + env(safe-area-inset-bottom, 0px)); }
}
```

**Figma-derived values — dev agents must read these frames before coding any size/spacing:**

| Value | Frame Node ID | Figma URL |
|---|---|---|
| FAB size, offset | `641:362` | https://www.figma.com/design/CsPAyUdLSStdmNpmiBMESQ?node-id=641:362 |
| FAB dark-mode | `669:197` | https://www.figma.com/design/CsPAyUdLSStdmNpmiBMESQ?node-id=669:197 |
| Sheet height, handle, close | `704:253` | https://www.figma.com/design/CsPAyUdLSStdmNpmiBMESQ?node-id=704:253 |
| Sheet dark-mode | `709:276` | https://www.figma.com/design/CsPAyUdLSStdmNpmiBMESQ?node-id=709:276 |
| SegmentedControl variants | `322:179` | DS Library `onzB8ujyvn6wnhdaS7Hz28` |

### 2.10 Advisory A1 — SegmentedControl Unification

Resolved by design: `PodiumBottomSheet` imports `SegmentedControl` from `src/components/SegmentedControl.tsx`. DS Library node `322:179` variant states must be verified against current `segmented-control.css` in T3. If active-state visuals diverge, a targeted update to `segmented-control.css` is included in T3 scope.

---

## 3. Impact Analysis

| File | Change | Risk |
|---|---|---|
| `src/components/DebateScreen.tsx` | Modified — mobile state + conditional render | Medium |
| `src/styles/tokens.css` | Modified — additive `--color-scrim` token | Low |
| `src/styles/components/podium.css` | Modified — `--podium-height` scoped to `≥768px` | Low |
| `src/components/PodiumFAB.tsx` | New | Low |
| `src/components/PodiumBottomSheet.tsx` | New | Low |
| `src/styles/components/podium-fab.css` | New | Low |
| `src/styles/components/podium-bottom-sheet.css` | New | Low |
| `tests/components/PodiumFAB.test.tsx` | New | Low |
| `tests/components/PodiumBottomSheet.test.tsx` | New | Low |
| `tests/a11y/podium-fab-a11y.test.tsx` | New | Low |
| `features/podium-fab-collapse.feature` | New | Low |
| `features/step-definitions/podium-fab-collapse.steps.ts` | New | Low |

**Existing `Podium.tsx`** — No changes. Desktop path unaffected.
**Existing `DebateScreen.test.tsx`** — No changes needed; default `matchMedia` polyfill returns `matches: false` → desktop path passes as before.

---

## 4. Risk and Mitigation Plan

| Risk | Severity | Mitigation |
|---|---|---|
| iOS Safari touch-scroll conflict on drag-to-dismiss | Medium | `touch-action: none` on handle; `touch-action: pan-y` on content |
| Bottom sheet animation jank | Low | `will-change: transform`; CSS transitions only |
| `--podium-height` change breaks desktop layout | Medium | `@media (min-width: 768px)` restores original value; covered by existing tests |
| matchMedia listener leak | Low | `useEffect` cleanup removes listener |
| SegmentedControl visual mismatch | Low | T3 includes frame inspection; targeted CSS update if needed |
| Focus trap missing in bottom sheet | Medium | T3 implements focus trap: focus first element on open; Tab cycles within; Escape calls `onClose` |
| `aria-hidden` not set on page content behind open sheet | Medium | `aria-modal="true"` on dialog covers ARIA isolation in most AT implementations; acceptable baseline |

**Rollback**: Revert `DebateScreen.tsx` conditional additions; delete `PodiumFAB.tsx`, `PodiumBottomSheet.tsx`, and their CSS files. `Podium.tsx` restores to always-visible inline state.

---

## 5. Verification Strategy

### BDD Scenarios (AC-19–AC-23)

Feature file: `features/podium-fab-collapse.feature`

```gherkin
Feature: Podium FAB Collapse
  As a mobile visitor
  I want a floating action button to open the post composer
  So that my reading experience is uninterrupted

  Scenario: AC-19 — FAB renders on mobile viewport
    Given the debate screen is loaded on a mobile viewport
    Then a button with aria-label "Open post composer" is present
    And it has the CSS class "podium-fab"

  Scenario: AC-19 — FAB is absent on desktop viewport
    Given the debate screen is loaded on a desktop viewport
    Then no element with aria-label "Open post composer" is present

  Scenario: AC-20 — Tapping FAB opens bottom sheet
    Given the debate screen is loaded on a mobile viewport
    And the FAB is expanded
    When the user taps the "Post as Tark" button
    Then a dialog with aria-label "Post composer" is visible

  Scenario: AC-21 — Close affordance dismisses sheet; FAB remains visible
    Given the debate screen is loaded on a mobile viewport
    And the bottom sheet is open
    When the user taps the "Close post composer" button
    Then the dialog is not visible
    And the FAB group is still present

  Scenario: AC-21 — Scrim tap dismisses sheet
    Given the debate screen is loaded on a mobile viewport
    And the bottom sheet is open
    When the user taps the scrim
    Then the dialog is not visible

  Scenario: AC-22 — FAB uses theme tokens in light mode
    Given the debate screen is loaded on a mobile viewport with light theme
    Then the FAB element background-color resolves from "--color-brand-primary"

  Scenario: AC-22 — FAB uses theme tokens in dark mode
    Given the debate screen is loaded on a mobile viewport with dark theme
    Then the FAB element background-color resolves from "--color-brand-primary"

  Scenario: AC-23 — Inline Podium present on desktop; FAB absent
    Given the debate screen is loaded on a desktop viewport
    Then the inline Podium form is present
    And no element with class "podium-fab" is present
```

### Unit Test Plan

**`tests/components/PodiumFAB.test.tsx`**: collapsed aria, onExpand, expanded T/V/× buttons, onSideSelect, onCollapse, CSS class toggling.

**`tests/components/PodiumBottomSheet.test.tsx`**: not rendered when `isOpen=false`; dialog + SegmentedControl + textarea + publish when open; onClose on close/scrim click; validatePost rejection; valid submit clears text; a11y attributes.

### A11y Test Plan

**`tests/a11y/podium-fab-a11y.test.tsx`** (axe-core): zero violations for FAB (collapsed), FAB (expanded), BottomSheet (open); focus trap entry and cycling; Escape key; aria-modal + role="dialog".

---

## 6. Task Decomposition

Dependency graph:
```
T1 → T2 ∥ T3 → T4 → T5 ∥ T6
```

| Task | Title | Files | Depends On | Parallel With |
|---|---|---|---|---|
| T1 | Add `--color-scrim` token | `tokens.css` | — | — |
| T2 | `PodiumFAB` component + CSS + unit tests | `PodiumFAB.tsx`, `podium-fab.css`, `PodiumFAB.test.tsx` | T1 | T3 |
| T3 | `PodiumBottomSheet` component + CSS + unit tests | `PodiumBottomSheet.tsx`, `podium-bottom-sheet.css`, `PodiumBottomSheet.test.tsx` | T1 | T2 |
| T4 | `DebateScreen` wiring + `--podium-height` fix | `DebateScreen.tsx`, `podium.css` | T2, T3 | — |
| T5 | A11y tests | `podium-fab-a11y.test.tsx` | T4 | T6 |
| T6 | BDD scenarios + step definitions | `.feature`, `.steps.ts` | T4 | T5 |

---

## 7. Quality Gaps

| ID | Description | Disposition |
|---|---|---|
| QG-1 | Figma frame visual values (FAB size, sheet height, spacing) not verified at Gate 4 | Dev-time Must-Read: frames `641:362`, `669:197`, `704:253`, `709:276`, DS `322:179` |
| QG-2 | `<dialog>` native vs `<div role="dialog">` — see OQ-1 | Defaulting to `<div role="dialog">` per architecture recommendation |
| QG-3 | `isMobile` stale state on resize while sheet open | Resolved in T4 AC: reset both flags on `isMobile → false` |

---

## 8. Open Questions

| ID | Question | Recommendation | Status |
|---|---|---|---|
| OQ-1 | Use native `<dialog>` vs `<div role="dialog">` for `PodiumBottomSheet`? | `<div role="dialog" aria-modal="true">` — preserves full CSS animation control; manual focus trap is 15 lines | **Accepted by default — PO confirm or override before T3 dispatch** |
| OQ-2 | Reset `isFabExpanded` to `false` on mobile→desktop resize? | Yes — included in T4 AC | **Accepted by default — PO confirm or override before T4 dispatch** |
