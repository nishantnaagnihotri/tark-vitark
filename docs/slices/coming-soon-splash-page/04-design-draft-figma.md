# Design Draft Package (Figma) — Coming Soon Splash Page

## Slice: coming-soon-splash-page
## Gate: 3B — Design Tool (Figma)
## Status: READY
## Date: 2026-03-29
## Author: figma-agent (Gate 3B)
## Source: docs/slices/coming-soon-splash-page/03-ux.md

---

## 1) Design Readiness

**Status: Ready**

The UX Flow/State Package is fully specified and barrier-free. All frame specifications (dimensions, typography, colors, layout) are concrete and implementation-ready.

**Figma File Created:**
- **File Key**: `wg4kv4Dixw1eAExOJbAfaO`
- **URL**: https://figma.com/design/wg4kv4Dixw1eAExOJbAfaO/
- **Four design frames** (D1, D2, M1, M2) created with all text layers and background colors applied.

---

## 2) Screen/Frame Mapping

| Frame ID | Screen Name | Viewport | Background | Typography |
|----------|-------------|----------|------------|------------|
| **D1** | Desktop Default | 1280×720 | #E0F2FE (light blue) | TarkVitark 92px Bold #0F172A + A debate platform 42px Medium #334155 + Coming Soon!! 56px Bold #B45309 |
| **D2** | Desktop Fallback | 1280×720 | #FFF7ED (light orange) | TarkVitark 90px Bold #0F172A + A debate platform 40px Medium #334155 + Coming Soon!! 54px Bold #B45309 |
| **M1** | Mobile Default | 375×812 | #ECFDF5 (light green) | TarkVitark 52px Bold #0F172A + A debate platform 26px Medium #334155 + Coming Soon!! 36px Bold #B45309 |
| **M2** | Mobile Fallback | 375×812 | #F5F3FF (light purple) | TarkVitark 50px Bold #0F172A + A debate platform 25px Medium #334155 + Coming Soon!! 34px Bold #B45309 |

---

## 3) Component and Token Guidance

### Text Components Hierarchy

- **Title (TarkVitark)**
  - Font: 92/90px (desktop), 52/50px (mobile) | Weight: 700 (Bold)
  - Color: #0F172A (dark slate)
  - Hierarchy: Primary (first in z-order, largest)
  - Positioning: Top-centered for dominance

- **Tagline (A debate platform)**
  - Font: 42/40px (desktop), 26/25px (mobile) | Weight: 500 (Medium)
  - Color: #334155 (muted slate)
  - Hierarchy: Secondary (establishes context)

- **Status (Coming Soon!!)**
  - Font: 56/54px (desktop), 36/34px (mobile) | Weight: 700 (Bold)
  - Color: #B45309 (amber/orange)
  - Hierarchy: Tertiary (semantic weight via color + size)

### Background Color Tokens (State-Specific)

| State | Desktop | Mobile |
|-------|---------|--------|
| Default Render | #E0F2FE (Cyan-50) | #ECFDF5 (Teal-50) |
| Fallback/Degraded | #FFF7ED (Orange-50) | #F5F3FF (Indigo-50) |

**Font Family**: System fonts acceptable; no third-party dependency required.
**Line Height**: 1.2–1.3× font size for all text layers.

---

## 4) Interaction and Edge-State Design Notes

### Default/Initial Render State (D1, M1)
- **Expected**: All three text layers visible immediately on page load.
- **Layout**: Vertical stack (title → tagline → status) with intentional spacing.
- **Desktop**: All content visible without scroll.
- **Mobile**: All content rendered; scroll acceptable per PO.

### Fallback/Degraded Render State (D2, M2)
- **Trigger**: CSS external font fails or visual treatment unavailable.
- **Expected**: Core text messages remain readable; layout does not collapse.
- **Mitigation**: Fallback frames use distinct background colors (orange/purple) to signal state while preserving hierarchy.
- **Success**: User can identify product name, category, and coming-soon status.

### Loading State
- Not applicable. Static HTML/CSS render only; no custom loading UX required.

### No Interaction Flows
- Splash page is interaction-free: zero click targets, no forms, no state machine.
- Page lifecycle: request → render → view → exit.

---

## 5) Quality Gaps

- **None blocking Design QA readiness.**
- Minor: Figma frames created via agent (not MCP scripting); recommend visual inspection to verify typography rendering and color accuracy on-screen after frame creation.

---

## 6) Open Questions (with Owner Decision Status)

| Question | Owner Decision Status | Notes |
|----------|----------------------|-------|
| Browser support baseline | ✅ Resolved | Last 2 versions Chrome/Firefox/Safari; IE excluded |
| Mobile above-the-fold requirement | ✅ Resolved | Scrolling on mobile is acceptable |
| Tone preference | ✅ Resolved | Designer discretion within colorful/excitement direction |
| CSS-only animation allowed | ✅ Resolved | CSS motion permitted, optional, scope-safe |
| 1280/375 viewport sufficiency | ✅ Resolved | Sufficient for this slice |
| Figma design file location | ✅ Resolved | File key: `wg4kv4Dixw1eAExOJbAfaO` |

---

## 7) Gate Decision

**Can proceed to design-qa** ✅

**Rationale**: All four screen variants specified with concrete dimensions, typography, colors, and backgrounds. No ambiguity on layout or state coverage for desktop/mobile contexts. Fallback states explicitly addressed. All prior open questions resolved. Design Coverage Report traces every frame to UX flows and PRD acceptance criteria.

---

## 8) Design Draft Package (for Design QA handoff)

### Summary
- **File Key**: `wg4kv4Dixw1eAExOJbAfaO`
- **Frames**: D1 (1280×720 blue), D2 (1280×720 orange), M1 (375×812 green), M2 (375×812 purple)
- **Content**: Three text layers per frame (Title, Tagline, Status) with specified fonts, weights, colors, and sizes.
- **States**: Default (D1/M1) + Fallback (D2/M2)
- **Ready for**: Design QA verification (Gate 3C)

### Traceability to PRD & UX

| Frame | UX Flow | UX State | PRD Goal | AC Criterion | Coverage |
|-------|---------|----------|----------|--------------|----------|
| **D1 Desktop Default** | Primary Journey A | Default/Initial Render | G-1, G-2, G-3, G-4, G-5 | AC-1, AC-2, AC-5, AC-6 | ✅ Complete |
| **D2 Desktop Fallback** | Primary Journey A | Error/Fallback State | G-5, G-6 | AC-5, AC-6, AC-7 | ✅ Complete |
| **M1 Mobile Default** | Primary Journey B | Default/Initial Render | G-1, G-2, G-3, G-4, G-5 | AC-1, AC-2, AC-5, AC-6 | ✅ Complete |
| **M2 Mobile Fallback** | Primary Journey B | Error/Fallback State | G-5, G-6 | AC-5, AC-6, AC-7 | ✅ Complete |
