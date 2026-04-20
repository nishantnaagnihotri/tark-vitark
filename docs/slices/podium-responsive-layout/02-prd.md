# PRD v0 — podium-responsive-layout
## Gate 2 Artifact — 2026-04-20

---

## 1. Problem Statement and Expected Outcome

The Debate Screen was designed mobile-first and has never had an intentional layout above 767 px. On tablet and desktop viewports the screen expands without structure, producing an undefined visual experience. An existing CSS breakpoint at 481 px has no design-tier meaning but is present in the mobile CSS without explanation, creating ambiguity about the tier model.

This slice delivers structured, designed responsive layouts for two new viewport tiers — tablet (768–1023 px) and desktop (≥1024 px) — with all exact layout values defined by Gate 3 UX via Figma frames. It also cleans up the tier model by annotating the 481 px breakpoint as a mobile-internal implementation detail, making the tier model unambiguous. Mobile behavior (≤767 px) is frozen from the `podium-fab-collapse` slice and is not modified.

Expected outcome:
- Tablet users (768–1023 px) see a Debate Screen purposefully designed for their viewport, pixel-true to the Gate 3 Figma tablet frames.
- Desktop users (≥1024 px) see a Debate Screen purposefully designed for their viewport, pixel-true to the Gate 3 Figma desktop frames.
- The CSS breakpoint model is clean: three tiers (Mobile / Tablet / Desktop) with no ambiguous intermediate boundaries.
- All existing mobile behavior is untouched.

---

## 2. Target Users and Primary Scenarios

| User | Primary Scenario |
|---|---|
| Tablet visitor (768–1023 px) | Opens the Debate Screen on a tablet; sees the tablet-tier layout as defined by Gate 3 Figma frames. |
| Desktop visitor (≥1024 px) | Opens the Debate Screen on a desktop browser; sees the desktop-tier layout as defined by Gate 3 Figma frames. |
| Mobile visitor (≤767 px) | Behavior unchanged from `podium-fab-collapse`; no regression in this slice. |

No new user types are introduced. Podium entry pattern on wider viewports is a Gate 3 UX decision (see OQ-1, OQ-2).

---

## 3. In-Scope and Out-of-Scope

### In-Scope

| ID | Item |
|---|---|
| IS-1 | Tablet-tier responsive layout for the Debate Screen (768–1023 px) |
| IS-2 | Desktop-tier responsive layout for the Debate Screen (≥1024 px) |
| IS-3 | Reclassify existing 481 px CSS breakpoint as a mobile-internal detail (add comment; no design-tier change) |
| IS-4 | All exact layout values (columns, widths, gutters, spine) defined by Gate 3 UX in Figma frames |
| IS-5 | Tablet and desktop Podium entry pattern (FAB behavior on wider viewports) defined by Gate 3 UX |

### Out-of-Scope

| ID | Item |
|---|---|
| OOS-1 | Authentication / login |
| OOS-2 | Backend / API changes |
| OOS-3 | New debate features (posting, validation, side-selection logic) |
| OOS-4 | A new design tier for 481–767 px — that range is mobile-internal and receives no new Figma frames |
| OOS-5 | Changes to any mobile-tier (≤767 px) behavior — frozen from `podium-fab-collapse` |

---

## 4. Functional Requirements

**Acceptance Criteria:** canonical source is [`features/podium-responsive-layout.feature`](../../../features/podium-responsive-layout.feature) (to be generated at Gate 5).

| ID | Requirement | Priority | Traced To |
|---|---|---|---|
| FR-1 | The Debate Screen shall render the tablet-tier layout — columns, card widths, gutters, Podium panel width, and Spine position as specified in Gate 3 Figma tablet frames — when the viewport width is in the range 768–1023 px. | Must | AC-25 |
| FR-2 | The Debate Screen shall render the desktop-tier layout — columns, card widths, gutters, Podium panel width, and Spine position as specified in Gate 3 Figma desktop frames — when the viewport width is ≥1024 px. | Must | AC-26 |
| FR-3 | No layout rule, CSS class, component behavior, or interaction active at ≤767 px (mobile tier) shall be changed by this slice. | Must | AC-27 |
| FR-4 | The existing 481 px CSS breakpoint rule shall be annotated in source with a comment identifying it as a mobile-internal implementation detail; no new design tier shall be introduced or implied for the 481–767 px range. | Must | AC-28 |
| FR-5 *(Gate-3-deferred placeholder)* | The Debate Screen shall implement the tablet-tier Podium entry pattern (FAB behavior or equivalent) on viewports 768–1023 px, as defined by Gate 3 UX Figma frames and the AC authored by Gate 3 UX. | Must | AC-TBD-1 *(resolves OQ-1; AC prose to be authored by Gate 3 UX as an amendment in `01-requirement.md`; only AC ID referenced in `## Deferred Gate 3 AC IDs` of this PRD)* |
| FR-6 *(Gate-3-deferred placeholder)* | The Debate Screen shall implement the desktop-tier Podium entry pattern (FAB behavior or equivalent) on viewports ≥1024 px, as defined by Gate 3 UX Figma frames and the AC authored by Gate 3 UX. | Must | AC-TBD-2 *(resolves OQ-2; AC prose to be authored by Gate 3 UX as an amendment in `01-requirement.md`; only AC ID referenced in `## Deferred Gate 3 AC IDs` of this PRD)* |

> **Gate 3 instruction:** When Gate 3 UX writes the deferred ACs for OQ-1 and OQ-2, author the AC prose as amendments to `01-requirement.md` (annotated with `*(Added at Gate 3 — resolves OQ-1/OQ-2 deferred from Gate 1; <date>)*`), then add only the resulting AC ID references to the `## Deferred Gate 3 AC IDs` section of this PRD and update FR-5/FR-6 `Traced To` fields accordingly. AC prose must not be copied into this PRD.

---

## 5. Constraints and Non-Goals

| ID | Constraint / Non-Goal |
|---|---|
| C-1 | All exact layout values (column structure, card widths, Podium panel width, Spine position, gutters) are owned by Gate 3 UX via Figma frames. No layout numbers are specified in this PRD. |
| C-2 | Mobile-tier behavior (≤767 px) is frozen from `podium-fab-collapse`. No changes are permitted. |
| C-3 | The 481 px CSS rule is a mobile-internal implementation detail; no new design tier is created for the 481–767 px range. |
| C-4 | Tablet and desktop Podium entry patterns are Gate 3 UX decisions; the PRD carries only placeholders until Gate 3 closes. |
| C-5 | No backend, API, or authentication changes. |
| C-6 | No new debate features (posting flow, validation, side-selection logic). |
| C-7 | Accessibility baseline remains a standing requirement for all new layout code. |

---

## 6. Success Metrics

| ID | Metric | Measurement Method |
|---|---|---|
| SM-1 | Tablet-tier layout renders correctly for viewports 768–1023 px. | Runtime QA viewport check at 768 px and 1023 px against Gate 3 Figma tablet frames (AC-25). |
| SM-2 | Desktop-tier layout renders correctly for viewports ≥1024 px. | Runtime QA viewport check at 1024 px and a representative wider width against Gate 3 Figma desktop frames (AC-26). |
| SM-3 | Zero mobile regression on viewports ≤767 px. | Runtime QA at 320 px and 767 px; all `podium-fab-collapse` acceptance criteria continue to pass (AC-27). |
| SM-4 | 481 px CSS breakpoint comment is present in source. | Code review: comment exists on the 481 px rule identifying it as mobile-internal (AC-28). |
| SM-5 | Tablet Podium entry pattern renders per Gate 3 UX definition. | Runtime QA after Gate 3 adds AC-TBD-1 (resolves OQ-1). |
| SM-6 | Desktop Podium entry pattern renders per Gate 3 UX definition. | Runtime QA after Gate 3 adds AC-TBD-2 (resolves OQ-2). |

---

## 7. Acceptance Criteria

**Acceptance Criteria:** current prose source is [`01-requirement.md`](./01-requirement.md). Gherkin canonical source will be [`features/podium-responsive-layout.feature`](../../../features/podium-responsive-layout.feature) (generated at Gate 5). PRD references AC IDs and status only — prose is not duplicated here per the `requirement-prd-alignment` skill.

| ID | Status |
|---|---|
| AC-25 | Seeded at Gate 1 — canonical |
| AC-26 | Seeded at Gate 1 — canonical |
| AC-27 | Seeded at Gate 1 — canonical |
| AC-28 | Seeded at Gate 1 — canonical |
| AC-TBD-1 | Placeholder — Gate 3 UX will author prose as amendment to `01-requirement.md`; ID recorded in `## Deferred Gate 3 AC IDs` of this PRD *(resolves OQ-1)* |
| AC-TBD-2 | Placeholder — Gate 3 UX will author prose as amendment to `01-requirement.md`; ID recorded in `## Deferred Gate 3 AC IDs` of this PRD *(resolves OQ-2)* |

---

## 8. Dependencies and Risks

| Type | Description | Mitigation |
|---|---|---|
| Dependency — blocking | Gate 3 UX Figma tablet and desktop frames must exist before any layout implementation (FR-1, FR-2). | Gate 3 closes only when frames are approved; Gate 5 build cannot start without them. |
| Dependency — blocking | Gate 3 UX must author AC-TBD-1 and AC-TBD-2, append their prose in amendments to `01-requirement.md`, and record their IDs in this file's `## Deferred Gate 3 AC IDs` before Gate 3 can close. | Hardened in `design-gate-orchestration` skill (Gate 3A step 12 + Completion Rule step 4). |
| Dependency — non-blocking | OQ-3: Gate 3 UX must determine if AC-1/AC-2 (post/reply button triggers) need extension for wider viewports. | Gate 3 UX will assess and extend if needed; non-blocking for Gate 2 progression. |
| Risk | Mobile regression introduced by new breakpoint CSS. | Explicit 767 px and 320 px runtime QA checks; AC-27 is a hard pass criterion. |
| Risk | Spine position or column layout mismatches Figma frames at boundary viewports (768, 1024). | Runtime QA must test boundary viewports exactly; Figma frame pixel-truth is the acceptance bar. |
| Risk — non-blocking | Cross-slice AC numbering collision (QG-1). | Mitigated — ACs reseeded to globally unique range AC-25–AC-28 per PO decision (Option B, 2026-04-20); see `orchestrator-context.md` Known Rule #82. |

---

## 9. Open Questions

| ID | Question | Source | Status | Resolution |
|---|---|---|---|---|
| OQ-1 | What is the tablet Podium / FAB entry pattern on viewports 768–1023 px? | RCP OQ-1 | Unresolved — Non-Blocking | No decision at Gate 2. Gate 3 UX recommends pattern in Figma and authors AC-TBD-1. Must be resolved before Gate 3 closes. |
| OQ-2 | What is the desktop Podium / FAB entry pattern on viewports ≥1024 px? | RCP OQ-2 | Unresolved — Non-Blocking | No decision at Gate 2. Gate 3 UX recommends pattern in Figma and authors AC-TBD-2. Must be resolved before Gate 3 closes. |
| OQ-3 | Are AC-1/AC-2 (post/reply button triggers) binding for wider viewports, or must they be extended? | RCP OQ-3 | Unresolved — Non-Blocking | No decision at Gate 2. Gate 3 UX assesses and amends if needed. Must be resolved before Gate 3 closes. |
| OQ-4 | What is the scope of the 481 px breakpoint in the new tier model? | RCP OQ-4 | Resolved | IS-3 ships CSS comment; 481–767 px is mobile-internal; no new design tier. Recorded at Gate 1. |
| OQ-5 | Do measurable layout targets (columns, widths, gutters) come from Figma or from PO-defined numbers? | RCP OQ-5 | Resolved | Option A — Figma. Gate 3 UX owns all exact layout values. Recorded at Gate 1. |

---

## Quality Gaps

| ID | Gap | Severity | Recommended Resolution |
|---|---|---|---|
| QG-1 | ~~Cross-slice AC numbering collision.~~ **Resolved — 2026-04-20.** ACs reseeded to globally unique range AC-25–AC-28 per PO decision (Option B). Global AC counter rule added to `orchestrator-context.md` Known Rule #82. No residual collision. | Resolved | No action required. |

---

## Requirement-to-PRD Alignment Check

*Gate 2 traceability artifact — required by `requirement-prd-alignment` skill.*

### In-Scope Item Mapping

| Gate 1 ID | Gate 1 Statement | PRD Coverage |
|---|---|---|
| IS-1 | Tablet-tier responsive layout for the Debate Screen (768–1023 px) | FR-1; §1 Expected Outcome; §2 Tablet visitor scenario; SM-1 |
| IS-2 | Desktop-tier responsive layout for the Debate Screen (≥1024 px) | FR-2; §1 Expected Outcome; §2 Desktop visitor scenario; SM-2 |
| IS-3 | Reclassify existing 481 px CSS breakpoint as mobile-internal detail | FR-4; §1 Expected Outcome; C-3; OQ-4 (resolved) |
| IS-4 | All exact layout values defined by Gate 3 UX in Figma frames | FR-1, FR-2 (Figma-reference requirement); C-1 |
| IS-5 | Tablet and desktop Podium entry pattern defined by Gate 3 UX | FR-5, FR-6 (Gate-3-deferred placeholders); OQ-1, OQ-2 (unresolved, non-blocking) |

### Acceptance Criteria Mapping

| AC ID | Prose Source | PRD Section | FR | Coverage Notes |
|---|---|---|---|---|
| AC-25 | `01-requirement.md` §Acceptance Criteria | §7 | FR-1 | Covered; Gate 3 UX supplies exact frame-defined layout values |
| AC-26 | `01-requirement.md` §Acceptance Criteria | §7 | FR-2 | Covered; Gate 3 UX supplies exact frame-defined layout values |
| AC-27 | `01-requirement.md` §Acceptance Criteria | §7 | FR-3 | Covered; this slice is additive above 767 px — no mobile changes |
| AC-28 | `01-requirement.md` §Acceptance Criteria | §7 | FR-4 | Covered; OQ-4 resolved at Gate 1 |
| AC-TBD-1 | Gate 3 UX will author *(resolves OQ-1)* | §7 (placeholder), §Deferred Gate 3 AC IDs | FR-5 | Deferred by design; must be present before Gate 3 closes |
| AC-TBD-2 | Gate 3 UX will author *(resolves OQ-2)* | §7 (placeholder), §Deferred Gate 3 AC IDs | FR-6 | Deferred by design; must be present before Gate 3 closes |

### Alignment Summary

- All 5 Gate 1 in-scope items (IS-1 through IS-5) are represented by FR-1 through FR-6 in this PRD.
- All 4 Gate 1-seeded ACs (AC-25 through AC-28) have direct PRD coverage in §4 (FR Traced To), §6 (SM), and §7.
- 2 ACs deferred to Gate 3 UX (AC-TBD-1, AC-TBD-2) are carried as explicit placeholders in §7 and will be recorded in `## Deferred Gate 3 AC IDs` when Gate 3 closes.
- No Gate 1 requirement IDs or AC IDs are unaccounted for.
- Gate 2 closure authorized: `PRD Readiness: Ready | Gate Decision: can proceed to design`.

---

## Deferred Gate 3 AC IDs

*(Empty at Gate 2. Gate 3 UX will record AC-TBD-1 and AC-TBD-2 here with a short provenance note such as `Added at Gate 3 — resolves OQ-1/OQ-2 deferred from Gate 1; <date>`. This section tracks deferred AC IDs only and is not the PRD amendment log; any future PRD amendments must follow the repository PRD Amendment Protocol using versioned amendment entries.)*
