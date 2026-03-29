# Architecture Plan Package — Coming Soon Splash Page

Slice: coming-soon-splash-page
Gate: 4 (Architecture)
Status: READY
Date: 2026-03-29
Author: architecture-agent (Gate 4), validated by orchestrator

## 1) Architecture Readiness

Ready.

Gate 3 is closed with Product Owner approval recorded in 04-design-qa.md. Source artifacts are complete and consistent:
- 01-requirement.md
- 02-prd.md
- 03-ux.md
- 04-design-qa.md

## 2) Architecture Plan

### Scope-Constrained Architecture
- Single static web entry boundary: one public coming-soon page rendered with HTML/CSS only.
- No runtime application logic: no client JS, no server handlers, no data services, no telemetry.
- One-way presentation flow: browser request -> HTML parse -> CSS apply -> visual render.

### Module Boundaries

1. Content structure module (HTML)
- Owns semantic document structure and message hierarchy.
- Must contain the three canonical message intents:
  - TarkVitark
  - A debate platform
  - Coming Soon!!
- Exposes stable classes/selectors for styling.

2. Visual system module (CSS)
- Owns palette, typography scale, spacing, responsive rules, and optional CSS-only motion.
- Must implement default colorful mode and graceful fallback mode.
- Must preserve legibility if decorative styling fails.

3. Asset module (optional local decorative resources)
- Owns non-essential decorative assets only.
- Must be local/self-contained and removable without content loss.
- Must not become a functional dependency.

4. Static delivery module
- Owns static file serving only.
- No build step, no runtime compilation, no API coupling.

### Interface Contracts
- HTML->CSS contract:
  - Selectors map to stable structural elements for heading/tagline/status.
  - Styling cannot depend on script-injected classes.
- Content contract:
  - Core meaning preserved exactly or substantively equivalent per PRD.
  - Priority maintained: name > tagline > status.
- Responsive contract:
  - Desktop target: 1280.
  - Mobile target: 375.
  - No horizontal overflow at either target.
- Fallback contract:
  - If gradients/decorative assets fail, required copy remains fully readable.
  - No external dependency can block core copy rendering.

### Data Flow and Persistence
- Stateless static delivery only.
- No user input, cookies, sessions, storage, backend, or API calls.

### Rollout and Rollback
- Rollout:
  1. Deploy static page artifact(s).
  2. Verify desktop/mobile acceptance in staging snapshot.
  3. Publish with simple content swap.
- Rollback:
  1. Revert to prior static artifact version.
  2. Keep fallback visual mode if default visuals regress.
  3. No data migration/state recovery required.

## 3) Impact Analysis

Affected areas:
- Static web presentation surface only.
- Slice artifacts under docs/slices/coming-soon-splash-page.

No expected impact:
- Backend
- Auth
- Storage
- Analytics
- Service interfaces

## 4) Risk and Mitigation Plan

1. Visual regression across target browsers
- Mitigation: viewport/browser checks before release.

2. Decorative asset fragility (expiring generated URLs)
- Mitigation: use local embedded/recreated decorative assets or pure CSS shapes.

3. Readability loss on colorful backgrounds
- Mitigation: contrast sanity checks during implementation QA.

4. Scope creep into JS/forms/analytics
- Mitigation: enforce static-only acceptance criteria and review checklist.

## 5) Verification Strategy

Static compliance checks:
- No script tags, inline handlers, or javascript: links.
- No external brand asset dependency for core rendering.
- Required copy and hierarchy present.

Render checks:
- 1280 desktop:
  - all core messages visible without interaction
  - no clipping/overflow/hidden core copy
- 375 mobile:
  - coherent layout
  - no horizontal overflow
  - mobile scroll acceptable

Design conformance checks:
- Default mode: energetic/colorful intent preserved.
- Fallback mode: readability and message clarity preserved.

## 6) Task Decomposition

T1 Scaffold static page boundary
- Deliverables:
  1. static HTML entry + CSS stylesheet (or equivalent minimal structure)
  2. no JS/build tooling
- Depends on: none

T2 Implement core content hierarchy
- Deliverables:
  1. dominant product name
  2. debate-platform tagline
  3. coming-soon status message
- Depends on: T1

T3 Implement responsive colorful visual system
- Deliverables:
  1. colorful default state (>= 2 non-neutral colors)
  2. responsive behavior at 1280 and 375
- Depends on: T2

T4 Implement graceful fallback mode
- Deliverables:
  1. readable plain fallback state
  2. optional decoration made non-essential
- Depends on: T3

T5 Verification and release readiness
- Deliverables:
  1. static compliance checklist
  2. viewport verification evidence
  3. rollback note
- Depends on: T1-T4

## 7) Quality Gaps

- No architecture blockers.
- One implementation caution: decorative asset durability must be handled locally.
- Residual subjectivity in "excitement" is accepted by Product Owner process.

## 8) Open Questions

| ID | Question | Status | Resolution |
|----|----------|--------|------------|
| OQ-A1 | Decorative asset durability strategy in implementation | Open | Owner deferred to Build gate; non-blocking |

All prior product/UX questions are resolved in 02-prd.md.

## 9) Gate Decision

can proceed to build (subject to task->issue mapping completion in 06-tasks.md)

## 10) Architecture Plan Package

Traceability baseline artifacts:
- 01-requirement.md
- 02-prd.md
- 03-ux.md
- 04-design-qa.md

Dependency graph:
- T1 -> T2 -> T3 -> T4 -> T5

Primary guardrails:
- static-only HTML/CSS
- no JS/forms/backend/analytics
- responsive at 1280 and 375
- graceful fallback readability
