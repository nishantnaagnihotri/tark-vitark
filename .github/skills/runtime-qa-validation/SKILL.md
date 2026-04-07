---
name: runtime-qa-validation
description: "Runtime QA workflow: validate acceptance-criterion user journeys in a live app session with Chrome DevTools MCP across required viewport and theme matrix, produce a Runtime QA Verdict Package, and gate merge progression for UI-impacting issues. Use when: running Gate 5.5 runtime QA, validating UI behavior after dev handoff, or deciding loop-back on runtime failures."
---

# Runtime QA Validation

Use this skill to validate runtime behavior in a real browser session when manual QA is not available.

## When To Use

- Running Gate 5.5 Runtime QA for a UI-impacting issue
- Verifying that implemented acceptance criteria work in a live browser session
- Checking responsive behavior and theme behavior before Gate 6 merge recommendation
- Producing a runtime verdict package for orchestrator progression decisions

## Scope Classification

1. Runtime QA is required for UI-impacting issues.
2. Non-UI issues may skip runtime QA only when orchestrator records `Runtime QA: Not Required` with rationale.
3. If issue metadata does not clearly indicate UI impact, request orchestrator clarification and do not self-classify within this skill.

## Default Validation Matrix

1. Viewports: `360x800`, `768x1024`, `1366x768`, `1920x1080`.
2. Themes: Light and Dark for themed UI surfaces; Light-only is acceptable only when the issue has no theme-affecting surface.
3. Routes and states: all acceptance-criterion journeys plus relevant loading, empty, and error states.

## Execution Protocol

1. Start the app from the PR branch or exact head SHA being validated for Gate 5.5 in local mode and confirm page load.
2. Execute acceptance-criterion journeys in a browser session.
3. For each required viewport and theme, validate:
   - No blocking console errors or uncaught runtime exceptions
   - No critical layout regression (including horizontal overflow)
   - Primary interactions are functional and map to acceptance criteria
   - Expected content and state transitions appear correctly
4. Capture concise evidence per journey, per required viewport, and per required theme when the surface is theme-affecting.
5. If execution fails due to infrastructure/tooling issues, follow `gate-recovery-and-resume` before progression.

## Verdict Rules

1. `Pass` only when all required checks pass for all required journeys, viewports, and themes.
2. `Fail` when any acceptance-criterion journey fails or a blocking runtime error/regression is detected.
3. `Blocked` when app startup, environment setup, or MCP/browser tooling prevents valid execution.
4. `Fail` or `Blocked` halts progression by default; continuation requires explicit Product Owner risk acceptance.

## Runtime QA Output Contract

1. Output must use exactly one of these forms:
   - Executed runtime QA package for UI-impacting issues.
   - Non-UI skip package when orchestrator has recorded `Runtime QA: Not Required` with rationale.
2. Executed runtime QA package:
   - `Runtime QA Verdict: Pass | Fail | Blocked`.
   - `Coverage Matrix`: journey x viewport x theme status table.
   - `Findings`: defects, severity, and reproducibility notes.
   - `Evidence`: command list, route list, and captured runtime observations.
   - `Gate Recommendation`: proceed to Gate 6 | loop back to Dev | blocked pending owner action.
3. Non-UI skip package:
   - `Runtime QA: Not Required`.
   - `Rationale`: concise explanation of why the issue is non-UI and does not require live browser validation.
   - `Gate Recommendation`: proceed according to orchestrator flow for non-UI work.
