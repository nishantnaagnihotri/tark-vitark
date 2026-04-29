---
name: runtime-qa-validation
description: "Runtime QA workflow: validate acceptance-criterion user journeys in a live app session with Chrome DevTools MCP across required viewport and theme matrix, produce a Runtime QA Verdict Package, and gate merge progression for UI-impacting issues. Use when: running Gate 5.5 runtime QA, validating UI behavior after dev handoff, or deciding loop-back on runtime failures."
---

# Runtime QA Validation

Use this skill to validate runtime behavior in a real browser session when manual QA is not available.

## When To Use

- Running Gate 5.5 Runtime QA for a UI-impacting issue
- Running the final slice-level integrated runtime QA pass before recommending a `slice/* -> master` PR
- Verifying that implemented acceptance criteria work in a live browser session
- Checking responsive behavior and theme behavior before Gate 6 merge recommendation
- Producing a runtime verdict package for orchestrator progression decisions

## Scope Classification

1. This skill supports two scopes only:
   - `Issue-level Gate 5.5 runtime QA` for a single UI-impacting task PR.
   - `Slice-level integrated runtime QA` for the fully merged `slice/<slice-name>` branch before recommending the final slice PR to `master`.
2. Runtime QA is required for UI-impacting issues at Gate 5.5.
3. Slice-level integrated runtime QA is required when the slice contains one or more UI-impacting issues.
4. Non-UI work may skip runtime QA only when orchestrator records `Runtime QA: Not Required` or `Slice Runtime QA: Not Required` with rationale, as appropriate to the scope.
5. If the handoff does not make the validation scope explicit, request orchestrator clarification and do not self-classify within this skill.

## Default Validation Matrix

1. Viewports: `360x800`, `768x1024`, `1366x768`, `1920x1080`.
2. Themes: Light and Dark for themed UI surfaces; Light-only is acceptable only when the issue has no theme-affecting surface.
3. Routes and states: all acceptance-criterion journeys plus relevant loading, empty, and error states.

## Dev Server Launch Protocol

The runtime QA agent is responsible for starting the dev server. Follow this exact sequence:

```bash
# 1. Checkout the correct branch first
git fetch origin
git checkout <branch>

# 2. Background the dev server — do NOT run it in the foreground
# --port 5173 --strictPort ensures a deterministic URL; the server fails fast if 5173 is in use
npm run dev -- --port 5173 --strictPort &
DEV_SERVER_PID=$!  # capture PID for cleanup after QA completes

# 3. Poll until Vite is ready (up to 15 s) before connecting Chrome
server_ready=false
for i in $(seq 1 15); do
  if curl -s -o /dev/null -w "%{http_code}" http://localhost:5173 | grep -q 200; then
    server_ready=true
    break
  fi
  sleep 1
done

if [ "$server_ready" != true ]; then
  echo "Blocked: Vite dev server did not become reachable at http://localhost:5173 within 15 seconds."
  exit 1
fi
```

**Critical rules:**
- Always background with `&`. Running `npm run dev` in the foreground blocks the agent and eventually exits when the agent process ends.
- Do NOT use `nohup`, `disown`, or detached shells — the process must stay as a child of the agent's execute shell so it remains alive during the full browser session.
- Always pass `--port 5173 --strictPort` so the dev-server URL is deterministic (`http://localhost:5173`). If port 5173 is already in use, Vite exits immediately — free the port and retry.
- The poll loop waits up to 15 s for the server to respond with HTTP 200; if still unreachable after 15 s, abort and report `Blocked`.
- If the browser fails to connect mid-session, confirm the server is still running: `curl -s -o /dev/null -w "%{http_code}" http://localhost:5173` should return `200`.
- If the server exits unexpectedly during testing, re-launch and re-run the failing check before reporting `Blocked`.
- After QA completes (Pass, Fail, or Blocked), stop the dev server to free the port: `kill $DEV_SERVER_PID 2>/dev/null || true`. This prevents port-conflict `Blocked` verdicts on consecutive runs.

## Figma Frame Fidelity Protocol

Figma frames are the **canonical design authority** for all visual and interaction intent. Runtime QA must cross-reference the live browser against Figma frames, not just AC text. AC text is a compressed summary — Figma frames are the full contract.

**When Figma frame node IDs are provided in the handoff prompt:**

1. Before executing browser journeys, call Figma MCP `get_design_context` for each AC-mapped frame.
2. For each state in the Coverage Matrix, record which Figma frame was consulted (`Frame: <node-id>`).
3. Compare the live browser screenshot against the Figma frame for:
   - **Component presence and placement** — FAB position, sheet anchor point, handle bar, close affordance, scrim
   - **Interaction flow and tap sequence** — if AC text says "single tap → sheet" but Figma frame shows a two-step expansion → side-select → sheet, the Figma frame is correct; flag the discrepancy as `AC-DELTA` (see below) and do NOT auto-Fail based on the stale AC text
   - **Color token resolution** — use `getComputedStyle` to resolve CSS custom property values; verify they match the Figma-specified token names and computed hex values
   - **Layout dimensions** — spot-check component sizes (FAB diameter, sheet height, handle dimensions, scrim opacity) against Figma frame measurements
   - **Typography** — font size, weight, line-height against Figma text styles
4. Add a `Figma Fidelity` column to the Coverage Matrix: `Pass | Delta | Not Consulted`.

**AC-DELTA Escalation (blocking — do not issue a verdict until resolved):**

If AC text and Figma frame conflict, halt the verdict and surface the conflict immediately:

```
AC-DELTA: <AC-ID>
- AC text says: "<literal AC wording>"
- Figma frame <node-id> shows: <what the frame actually depicts>
- Recommendation: AC text must be amended by orchestrator before a QA verdict is issued
```

This is a hard stop — do NOT mark the AC as Fail or Pass while an `AC-DELTA` is unresolved. Report it to the orchestrator and await instruction.

**When no Figma frame node IDs are provided in the handoff:**

- Record `Figma fidelity check: skipped — no frame node IDs in handoff` in Evidence.
- Validate against AC text only.
- Add a finding: `[Medium] Figma fidelity check was not possible — orchestrator must include 04-design-qa.md frame index in future QA handoffs.`

## Execution Protocol

1. Start the dev server using the Dev Server Launch Protocol above. Confirm page load before proceeding.
2. **Fetch Figma design context first (pre-browser)** — call `get_design_context` for all provided frame node IDs. This establishes the Figma ground truth before any browser observation. Do not open the browser until this step completes.
3. Execute acceptance-criterion journeys in a browser session. During browser execution, run the Figma Frame Fidelity Protocol: compare live browser state against the design context fetched in step 2.
4. For each required viewport and theme, validate:
   - No blocking console errors or uncaught runtime exceptions
   - No critical layout regression (including horizontal overflow)
   - Primary interactions are functional and map to Figma frame states (not just AC text)
   - Expected content and state transitions appear correctly and match Figma frame composition
5. Capture concise evidence per journey, per required viewport, and per required theme when the surface is theme-affecting. Include the Figma frame node ID alongside each browser screenshot as a paired reference.
6. If execution fails due to infrastructure/tooling issues, follow `gate-recovery-and-resume` before progression.

Scope-specific expectations:

1. For `Issue-level Gate 5.5 runtime QA`, validate the issue's literal acceptance-criterion journeys and immediate regressions needed for that task PR to merge into `slice/<slice-name>`.
2. For `Slice-level integrated runtime QA`, validate the full slice branch as an integrated product surface:
   - all primary slice acceptance journeys end-to-end
   - cross-task seams and state handoffs
   - regressions that emerge only after multiple task PRs have merged together
3. Slice-level integrated QA is additive. It does not waive, replace, or retroactively satisfy issue-level Gate 5.5 evidence for earlier UI-impacting task PRs.

## Verdict Rules

1. `Pass` only when all required checks pass for all required journeys, viewports, and themes.
2. `Fail` when any acceptance-criterion journey fails or a blocking runtime error/regression is detected.
3. `Blocked` when app startup, environment setup, or MCP/browser tooling prevents valid execution.
4. `AC-DELTA` is a **held verdict state** — not a final verdict. It means a Figma-vs-AC conflict was detected that prevents issuing any Pass or Fail. The QA agent halts, surfaces the conflict to the orchestrator, and awaits AC amendment. Once the AC is amended, the verdict is re-issued based on the corrected AC and the Figma frame ground truth.
5. `Fail` or `Blocked` halts progression by default; continuation requires explicit Product Owner risk acceptance.

## Runtime QA Output Contract

1. Output must use exactly one of these forms:
   - `Runtime QA Verdict Package` for issue-level Gate 5.5.
   - `Slice Runtime QA Verdict Package` for slice-level integrated QA.
   - Non-UI skip package when orchestrator has recorded `Runtime QA: Not Required` or `Slice Runtime QA: Not Required` with rationale.
2. Executed runtime QA package:
   - `Runtime QA Verdict Package` when `Validation Scope: Issue-Level Gate 5.5`.
   - `Slice Runtime QA Verdict Package` when `Validation Scope: Slice-Level Integrated`.
   - `Validation Scope: Issue-Level Gate 5.5 | Slice-Level Integrated`
   - `Runtime QA Verdict: Pass | Fail | Blocked | AC-DELTA` (use `AC-DELTA` when a Figma-vs-AC conflict was found and must be resolved before a verdict can be issued).
   - `Coverage Matrix`: journey × viewport × theme × Figma Fidelity status table. When no Figma frame node IDs were provided, still emit the full matrix and set `Figma Fidelity` to `Not Consulted` for every row.
   - `Figma Frames Consulted`: list of node IDs fetched, paired to the AC state they cover. When no Figma frame node IDs were provided, output `none`.
   - `Findings`: defects, severity, and reproducibility notes. `AC-DELTA` conflicts listed separately before any Pass/Fail findings.
   - `Evidence`: command list, route list, captured runtime observations, paired browser screenshots, plus Figma frame design context (node IDs) when available. If no Figma frame node IDs were provided, include the runtime evidence only and record that design context was not consulted.
   - `Gate Recommendation`: proceed to Gate 6 | proceed to final slice merge review | loop back to Dev | AC-DELTA — orchestrator must amend AC before verdict | blocked pending owner action.
3. Non-UI skip package:
   - `Runtime QA: Not Required` or `Slice Runtime QA: Not Required`.
   - `Rationale`: concise explanation of why the issue is non-UI and does not require live browser validation.
   - `Gate Recommendation`: proceed according to orchestrator flow for non-UI work.
