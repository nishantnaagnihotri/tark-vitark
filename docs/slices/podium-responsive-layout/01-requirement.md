# Requirement — podium-responsive-layout
## Gate 1 — 2026-04-20 (Continuation Slice)

---

## Provenance

This slice directly resolves OOS-5 from the `podium-fab-collapse` slice, which explicitly deferred desktop viewport behavior.
- Parent slice: [docs/slices/podium-fab-collapse/01-requirement.md](../podium-fab-collapse/01-requirement.md)
- Resolves: OOS-5 — "Desktop viewport — FAB pattern is mobile-first; desktop behavior to be confirmed in architecture"
- Gate 1 skill changes in this session:
  - `.github/skills/design-gate-orchestration/SKILL.md` — hardened with two new rules: Gate 3A step 12 (OQ-Deferred AC Creation Check) and Gate 3 Completion Rule step 4 (OQ-Deferred AC Completeness Check). Ensures Gate 3 UX is required to write new ACs for any OQs explicitly deferred from Gate 1.

---

## Requirement Statement

The Debate Screen shall be extended to support tablet (768–1023 px) and desktop (≥1024 px) viewport tiers with responsive layouts adapted to each tier. All layout values (column structure, card widths, Podium panel width, spine position, gutters) are owned by Gate 3 UX via Figma frames. The Podium entry pattern for wider viewports (how and where the FAB or equivalent trigger is presented on tablet and desktop) is a Gate 3 UX decision. The existing 481 px CSS breakpoint rule shall be reclassified as a mobile-internal implementation detail with an explanatory comment; it does not constitute a new design tier. Mobile behavior (≤767 px) is frozen from the `podium-fab-collapse` slice and must not change.

---

## Problem and Expected Outcome

The Debate Screen was built mobile-first and has never been designed or tested above 767 px. On tablet and desktop viewports the layout is unspecified — layout expands without structure. This slice delivers intentional, designed responsive layouts for the two wider tiers.

Expected outcome:
- Tablet users (768–1023 px) see a Debate Screen layout purposefully designed for their viewport.
- Desktop users (≥1024 px) see a Debate Screen layout purposefully designed for their viewport.
- The CSS breakpoint model is clean: three tiers (Mobile / Tablet / Desktop) with no ambiguous intermediate boundaries.
- All existing mobile behavior is untouched.

---

## Slice Complexity Classification

**Standard** — responsive CSS + React layout extension, no API, no new module boundaries, single screen.

---

## Domain Glossary (Active Terms)

| Term | Definition |
|---|---|
| Debate Screen | The primary screen showing the debate topic, timeline of Arguments, and the Podium entry point. |
| Mobile tier | Viewports ≤767 px. Frozen from `podium-fab-collapse`. |
| Tablet tier | Viewports 768–1023 px. New in this slice. |
| Desktop tier | Viewports ≥1024 px. New in this slice. |
| 481 px rule | A CSS breakpoint rule present in the existing mobile CSS, treated as a mobile-internal implementation detail, not a design-tier boundary. |
| Podium | The FAB-triggered, bottom-sheet input area used by a Debater to create and publish a new Post. |
| FAB | A Material 3 Floating Action Button; the always-visible collapsed entry point for the Podium on mobile. |
| Spine | The vertical divider or structural centre-line separating content columns in wider layouts (exact position defined by Gate 3 UX). |
| Layout values | Column count, card width, Podium panel width, spine position, gutters — all owned by Gate 3 Figma frames. |

---

## In-Scope

| ID | Item |
|---|---|
| IS-1 | Tablet-tier responsive layout for the Debate Screen (768–1023 px) |
| IS-2 | Desktop-tier responsive layout for the Debate Screen (≥1024 px) |
| IS-3 | Reclassify existing 481 px CSS breakpoint as a mobile-internal detail (add comment; no design-tier change) |
| IS-4 | All exact layout values (columns, widths, gutters, spine) defined by Gate 3 UX in Figma frames |
| IS-5 | Tablet and desktop Podium entry pattern (FAB behaviour on wider viewports) defined by Gate 3 UX |

## Out-of-Scope

| ID | Item |
|---|---|
| OOS-1 | Authentication / login |
| OOS-2 | Backend / API changes |
| OOS-3 | New debate features (posting, validation, side-selection logic) |
| OOS-4 | A new design tier for 481–767 px — that range is mobile internal and receives no new Figma frames |
| OOS-5 | Changes to any mobile-tier (≤767 px) behavior — frozen from `podium-fab-collapse` |

---

## Acceptance Criteria

| ID | Acceptance Criterion |
|---|---|
| AC-25 | On a viewport 768–1023 px wide (tablet tier), the Debate Screen renders the tablet-tier layout matching the Gate 3 Figma tablet frames. |
| AC-26 | On a viewport ≥1024 px wide (desktop tier), the Debate Screen renders the desktop-tier layout matching the Gate 3 Figma desktop frames. |
| AC-27 | All existing Debate Screen behavior on viewports ≤767 px (mobile tier) is fully preserved and unchanged by this slice. |
| AC-28 | The existing 481 px CSS breakpoint rule is annotated with a comment identifying it as a mobile-internal implementation detail; no new design tier is introduced for 481–767 px. |

> **Note — Gate 3 UX deferred ACs:** Two acceptance criteria covering (a) tablet Podium entry pattern and (b) desktop Podium entry pattern are deliberately absent here. Per the hardened `design-gate-orchestration` skill (Gate 3A step 12 + Completion Rule step 4), Gate 3 UX must draft and append these ACs to `02-prd.md` annotated with `*(Added at Gate 3 — resolves OQ-1/OQ-2 deferred from Gate 1; <date>)*`. Gate 3 cannot close until both exist.

---

## Open Questions — Resolution Record

All OQs raised by `requirement-challenger` are resolved. Gate 1 is frozen.

| ID | Question | Resolution |
|---|---|---|
| OQ-1 | What is the tablet Podium / FAB entry pattern on ≥768 px? | **Deferred to Gate 3 UX.** UX will recommend the optimal pattern in Figma frames and write the corresponding AC. |
| OQ-2 | What is the desktop Podium / FAB entry pattern on ≥1024 px? | **Deferred to Gate 3 UX.** UX will recommend the optimal pattern in Figma frames and write the corresponding AC. |
| OQ-3 | Are AC-1/AC-2 (post/reply button trigger) binding for wider viewports? | **Deferred to Gate 3 UX.** UX will determine if those ACs need extension for tablet/desktop and amend as needed. |
| OQ-4 | What is the scope of the 481 px breakpoint in the new tier model? | **IS-3 in this slice.** 481–767 px is folded into the mobile tier as an internal detail. No new design tier. CSS cleanup (comment) ships in this slice. |
| OQ-5 | Do measurable layout targets (columns, widths, gutters) come from Figma or from PO-defined numbers? | **A — Figma.** UX owns all exact layout values in Gate 3 frames. Dev reads from there. |
