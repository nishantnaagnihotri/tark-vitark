# Task Breakdown — Coming Soon Splash Page

Slice: coming-soon-splash-page
Gate: 4 end output
Status: ISSUE MAPPING COMPLETE
Date: 2026-03-29

## Purpose

This file maps Gate 4 architecture tasks to GitHub Issues for Gate 5 build execution.

## Task-to-Issue Map

| Task ID | Task Title | Architecture Reference | Acceptance Focus | GitHub Issue |
|--------|------------|------------------------|------------------|--------------|
| T1 | Scaffold static page boundary | 05-architecture.md Section 6 (T1) | Static HTML/CSS baseline; no JS/build | #5 (https://github.com/nishantnaagnihotri/tark-vitark/issues/5) |
| T2 | Implement core content hierarchy | 05-architecture.md Section 6 (T2) | Name/tagline/status content and hierarchy | #6 (https://github.com/nishantnaagnihotri/tark-vitark/issues/6) |
| T3 | Implement responsive colorful visual system | 05-architecture.md Section 6 (T3) | Energetic colorful default + responsive behavior | #7 (https://github.com/nishantnaagnihotri/tark-vitark/issues/7) |
| T4 | Implement graceful fallback mode | 05-architecture.md Section 6 (T4) | Plain fallback readability without decoration dependency | #8 (https://github.com/nishantnaagnihotri/tark-vitark/issues/8) |
| T5 | Verification and release readiness | 05-architecture.md Section 6 (T5) | Compliance checks, viewport evidence, rollback note | #9 (https://github.com/nishantnaagnihotri/tark-vitark/issues/9) |

## Issue Drafts (Ready To Create)

### Issue Draft: T1 Scaffold static page boundary
Title: [coming-soon-splash-page][T1] Scaffold static HTML/CSS page boundary

Body:
Objective
- Implement the static page boundary for the coming-soon splash page with no runtime dependencies.

Scope
- In scope: static HTML entry and CSS stylesheet (or equivalent minimal static structure).
- Out of scope: JavaScript, forms, backend, analytics, build pipeline additions.

Inputs
- Slice path: docs/slices/coming-soon-splash-page/
- Architecture reference: docs/slices/coming-soon-splash-page/05-architecture.md (Section 6, T1)
- PRD acceptance references: AC-1, AC-6, AC-7, AC-8, AC-9 in docs/slices/coming-soon-splash-page/02-prd.md

Acceptance Criteria
- Static HTML/CSS entry exists and renders in browser.
- No script tags, inline handlers, or javascript: links.
- No framework/build/runtime dependency introduced.
- Baseline structure supports later tasks T2-T5.

Guardrails
- HTML/CSS only.
- Desktop 1280 and mobile 375 must remain target breakpoints.

Definition of Done
- Code merged in PR with issue-closing keyword.
- PR body includes Execution-Agent: dev-agent marker.

### Issue Draft: T2 Implement core content hierarchy
Title: [coming-soon-splash-page][T2] Implement required content hierarchy and copy

Body:
Objective
- Add and structure required core messages with clear priority.

Scope
- In scope: heading/tagline/status copy and semantic hierarchy.
- Out of scope: final visual polish and fallback styling details (covered in later tasks).

Inputs
- Slice path: docs/slices/coming-soon-splash-page/
- Architecture reference: docs/slices/coming-soon-splash-page/05-architecture.md (Section 6, T2)
- PRD acceptance references: AC-2, AC-3, AC-4 in docs/slices/coming-soon-splash-page/02-prd.md

Acceptance Criteria
- TarkVitark appears as dominant heading.
- A debate platform tagline is present and readable.
- Coming Soon!! status message is present and distinct.
- Semantic hierarchy reflects name > tagline > status.

Guardrails
- Keep copy substance exact or substantively equivalent per PRD.
- No JS/forms/navigation.

Definition of Done
- Hierarchy validated in desktop and mobile render checks.
- PR includes issue-closing keyword and Execution-Agent marker.

### Issue Draft: T3 Implement responsive colorful visual system
Title: [coming-soon-splash-page][T3] Implement responsive colorful default visual system

Body:
Objective
- Implement energetic colorful default visuals and responsive behavior at approved breakpoints.

Scope
- In scope: palette, typography scale, spacing, layout responsiveness.
- Out of scope: fallback degradation behavior details (covered in T4).

Inputs
- Slice path: docs/slices/coming-soon-splash-page/
- Architecture reference: docs/slices/coming-soon-splash-page/05-architecture.md (Section 6, T3)
- PRD acceptance references: AC-5, AC-6, AC-7, AC-9 in docs/slices/coming-soon-splash-page/02-prd.md
- Design QA reference: docs/slices/coming-soon-splash-page/04-design-qa.md

Acceptance Criteria
- Default visual treatment uses at least two non-neutral colors and reads as energetic.
- Desktop 1280 render has no clipping/overflow/hidden core copy.
- Mobile 375 render has no horizontal overflow and remains coherent.
- Styling remains static HTML/CSS only.

Guardrails
- Avoid external required asset dependencies for core message rendering.

Definition of Done
- Viewport evidence captured for 1280 and 375.
- PR includes issue-closing keyword and Execution-Agent marker.

### Issue Draft: T4 Implement graceful fallback mode
Title: [coming-soon-splash-page][T4] Implement readable fallback mode without decorative dependencies

Body:
Objective
- Ensure graceful visual degradation where decorative styling/assets fail while preserving all core messaging.

Scope
- In scope: fallback background/treatment, readable text preservation, decoration non-essentiality.
- Out of scope: broader resiliency architecture beyond static page.

Inputs
- Slice path: docs/slices/coming-soon-splash-page/
- Architecture reference: docs/slices/coming-soon-splash-page/05-architecture.md (Section 6, T4)
- PRD acceptance references: AC-6, AC-7, AC-9 in docs/slices/coming-soon-splash-page/02-prd.md
- Design QA edge-state reference: docs/slices/coming-soon-splash-page/04-design-qa.md

Acceptance Criteria
- Fallback mode remains readable with all required copy visible.
- Core meaning preserved when gradients/decorative assets are absent.
- No functional dependency on expiring remote decorative URLs.

Guardrails
- Keep implementation CSS-only and self-contained.

Definition of Done
- Evidence shows fallback behavior on desktop and mobile.
- PR includes issue-closing keyword and Execution-Agent marker.

### Issue Draft: T5 Verification and release readiness
Title: [coming-soon-splash-page][T5] Complete compliance verification and release readiness package

Body:
Objective
- Produce final verification evidence and rollback note to satisfy merge readiness.

Scope
- In scope: checklist validation, viewport evidence, rollback note.
- Out of scope: net-new feature additions.

Inputs
- Slice path: docs/slices/coming-soon-splash-page/
- Architecture reference: docs/slices/coming-soon-splash-page/05-architecture.md (Section 6, T5)
- PRD acceptance references: AC-1 through AC-9 in docs/slices/coming-soon-splash-page/02-prd.md

Acceptance Criteria
- Static compliance checks completed (no JS, no prohibited dependencies).
- Desktop/mobile viewport checks captured and attached.
- Rollback approach documented (static artifact revert).
- Residual risks called out explicitly.

Guardrails
- Do not expand feature scope in this issue.

Definition of Done
- Merge-ready evidence package attached in PR.
- PR includes issue-closing keyword and Execution-Agent marker.

## Creation Commands (Run Manually)

If using GitHub CLI, run from repository root after authentication:

gh issue create --title "[coming-soon-splash-page][T1] Scaffold static HTML/CSS page boundary" --body-file /tmp/t1.md
gh issue create --title "[coming-soon-splash-page][T2] Implement required content hierarchy and copy" --body-file /tmp/t2.md
gh issue create --title "[coming-soon-splash-page][T3] Implement responsive colorful default visual system" --body-file /tmp/t3.md
gh issue create --title "[coming-soon-splash-page][T4] Implement readable fallback mode without decorative dependencies" --body-file /tmp/t4.md
gh issue create --title "[coming-soon-splash-page][T5] Complete compliance verification and release readiness package" --body-file /tmp/t5.md

After creation, replace PENDING in the task map with concrete issue numbers.

## Issue Body Template (use for each task)

- Slice path: docs/slices/coming-soon-splash-page/
- Architecture reference: docs/slices/coming-soon-splash-page/05-architecture.md (Task section)
- Acceptance criteria: include task row acceptance focus + related AC IDs from 02-prd.md
- Scope guardrails:
  - HTML/CSS only
  - no JavaScript/forms/backend/analytics
  - desktop 1280 + mobile 375 required
  - preserve graceful fallback readability

## Gate 5 Trigger Condition

Gate 5 trigger condition is satisfied: all tasks now have concrete GitHub issue numbers.

Gate 5 execution order:
1. Start with T1 / Issue #5.
2. Proceed sequentially T2 -> T3 -> T4 -> T5 unless Product Owner reprioritizes.

## Notes

- Decorative asset durability (OQ-A1) should be decided in T3/T4 implementation and documented in PR.
- Each PR must include issue-closing keyword and `Execution-Agent: dev-agent` marker per orchestration policy.
