---
name: design-gate-orchestration
description: "Design gate orchestration workflow: execute Gate 3 UX+Design single-pass and Design QA substeps, enforce local-only execution and validation checks, run revision loops, and require Product Owner approval before gate closure. Use when: running Gate 3, validating substep readiness, or deciding Gate 3 progression."
---

# Design Gate Orchestration Workflow

Use this skill to coordinate Gate 3 execution from UX handoff through Design QA closure.

## When To Use

- Running Gate 3 substeps in the orchestrator
- Validating UX/Figma/Design QA readiness and progression decisions
- Handling Design QA revision loops with UX Agent
- Determining whether Gate 3 may close and Gate 4 may begin

## Gate 3 Execution Rule

1. Gate 3 is local-only for all substeps.
2. Do not offer cloud mode for UX, Figma, or Design QA substeps.
3. Progression between substeps must follow the readiness and gate-decision checks below.
4. Gate 3A's canonical operating mode is async `run-agent.ts` dispatch to `ux-agent` with live `03-ux.md` checkpointing.
5. Each async Gate 3A pass is bounded and single-shot. Orchestrator dispatches, records the terminal in session memory, and then pauses Gate 3 until the Product Owner explicitly returns to resume.
6. If the Product Owner explicitly wants to stay in the current chat for a short critique/revision loop instead of the separate async lane, orchestrator may use sync `runSubagent` rounds with `ux-agent` and explicit model `claude-sonnet-4.6`, still checkpointing stable decisions into `03-ux.md`.
7. On any resumed orchestrator session, Gate 3 must not continue until the orchestrator verifies that `docs/slices/<slice-name>/03-ux.md` exists and contains either a valid in-progress checkpoint or the final `UX Flow/State Package` plus `Orchestrator Resume Packet`.
8. During both async passes and in-chat fallback loops, `ux-agent` must progressively persist stable decisions and completed sections into `docs/slices/<slice-name>/03-ux.md` using `STATUS: IN PROGRESS` until the final package is complete.

## Product Owner Design Access Packet (Mandatory)

After Gate 3A execution, orchestrator must return a `Design Review Access Packet` to Product Owner.

Required packet fields:

1. Node-targeted Figma URL(s) using `?node-id=` for the primary review states (root file URL may be included as secondary context only).
2. Relevant page list.
3. Frame/state index with node IDs (for the states created, changed, or required for review).
4. Pass-level change summary (what changed since the previous pass).
5. Explicit review action requested from Product Owner.
6. Primary links must point to runtime-preview visual frames (minimal/no QA overlays). Annotated traceability frames are secondary.

Validation rule:

1. If frame/state node IDs are missing for review-critical states, loop back to the owning agent for clarification before claiming review-ready status.
2. If links are provided without `?node-id=`, treat review access as incomplete and loop back.
3. If only annotated/instruction-heavy frames are linked and runtime-preview frames exist, treat review access as incomplete and loop back.
4. For continuation slices (any slice that adds to or modifies an existing approved screen), runtime-preview links must reference frames derived via mandatory MCP duplication of approved baseline frame(s). Missing baseline provenance (source node ID + duplicate node ID) requires loop back.

## In-Chat Critique Fallback (Only When Explicitly Requested)

When the Product Owner explicitly wants to stay in the current orchestrator chat for a short critique/revision loop before or between async passes:

1. Use sync `runSubagent` with `ux-agent` and explicit model `claude-sonnet-4.6`.
2. Treat each round as a bounded critique/revision pass inside the current orchestrator chat, not as final execution.
3. Provide the latest `03-ux.md` checkpoint, current PRD, and Product Owner feedback to each round.
4. Require `ux-agent` to update the live `03-ux.md` checkpoint whenever stable decisions are reached.
5. Continue discussion rounds until the Product Owner explicitly indicates the direction is ready for the next async execution pass.
6. Do not describe async `run-agent.ts` as the discussion lane; it is single-shot execution/consolidation only.

## Substep A: UX + Design Single-Pass Trigger (Gate 3A)

Gate 3A is executed by `ux-agent` using the `ux-design-execution` skill (`.github/skills/ux-design-execution/SKILL.md`). Orchestrator owns routing, validation, Product Owner review, and artifact persistence. Gate 3A defaults to async passes; use the in-chat critique fallback above only when explicitly requested. Once the pass goal is defined, Gate 3A runs in **two phases** under the single-screen-first protocol:

Dispatch rule:

1. Default to async `run-agent.ts` dispatch to `ux-agent` for Phase 1, Phase 2, and any rerun or revision pass.
2. Every async pass must be bounded to one concrete goal for that pass and must checkpoint `03-ux.md` as it progresses.
3. After dispatch, orchestrator records the terminal and pauses; it does not auto-progress Gate 3 when the terminal exits.
4. Gate progression resumes only when the Product Owner explicitly returns and the returned `UX Flow/State Package` and `Orchestrator Resume Packet` pass validation.
5. Use sync `runSubagent` only when the Product Owner explicitly asks to stay in the current chat for a short critique/revision loop or async dispatch is unavailable.
6. If the execution pass is interrupted, rejected, or needs follow-up, rehydrate the next async UX pass from the latest checkpointed `docs/slices/<slice-name>/03-ux.md` artifact rather than restarting from chat history or trying to reopen the old session.

**Phase 1 (mandatory first):** `ux-agent` runs the full Challenge Phase, produces the complete `UX Flow/State Package` text artifact (flows, states, UI Control Contract, M3 Control Mapping, Frame Blueprint, DS Coverage Declaration), creates only the primary frame `Default/Light/Mobile`, and returns an `Orchestrator Resume Packet`. Orchestrator then returns this frame to the Product Owner for explicit visual approval before any additional frames are created.

**Phase 2 (after Product Owner approves Phase 1 frame):** `ux-agent` creates all remaining Figma pixel frames in one follow-up pass, following the Frame Blueprint, and returns an updated `Orchestrator Resume Packet`.

Product Owner must explicitly approve the Phase 1 frame (topic bar, card layout, bubble arrows, typography, colors — all match baseline) before Phase 2 is authorized. If visual issues are found in Phase 1, iterate with UX Agent until Product Owner approves, then proceed to Phase 2.

Gate 3 Delta Triage rule:

If UX work, Design QA, or Product Owner review during Gate 3 reveals that the approved user journey or screen design refines the earlier requirement/PRD contract, orchestrator must classify the delta before allowing gate progression:

1. `Visual-only refinement`: changes visual treatment, layout, copy tone, or non-behavioral presentation without changing user-visible behavior, AC intent, FR scope, or in-scope/out-of-scope boundaries. Record in `03-ux.md` and design artifacts only. No requirement or PRD amendment is required.
2. `Behavioral refinement within scope`: changes interaction steps, control type, validation timing, state transitions, replacement/confirmation mechanics, or other user-visible behavior while preserving the slice goal and scope boundaries. Require explicit Product Owner approval, update canonical AC prose in `01-requirement.md` as an amendment, append the affected FR/AC references in `## Amendments` in `02-prd.md`, and cross-reference the amendment from downstream artifacts before Gate 3 may close.
3. `Material scope change`: adds or removes a capability, changes persistence/integration/data-model assumptions, or moves an in-scope/out-of-scope boundary. Do not continue Gate 3 on the stale contract. Loop back to Gate 2 for PRD re-analysis, and loop back to Gate 1 as well if the requirement boundary itself changed.
4. If the correct classification is uncertain, treat the delta as `Material scope change` until Product Owner explicitly approves a narrower classification.

Proceeding rule:

1. Continue to Gate 3B only when UX result is `UX Readiness: Ready`, `Gate Decision: can proceed to design-qa`, and UX has completed its internal Challenge Phase.
2. Before returning `UX Readiness: Ready`, UX must have all `Must Resolve` items from its internal Challenge Phase either resolved or explicitly accepted by Product Owner.
3. Require a `Design Artifact` reference (Figma file URL) in UX output for every UX task.
4. If Design System library is missing, or a required TV Library component is absent, UX Agent handles DS library creation directly (DS bootstrap fast-path), require populated `design_system_library_file_key` in `.figma-config.local`, and require all declared components to be published before UX Agent creates any frame.
5. If open questions remain, continue only when explicitly accepted by Product Owner.
6. For slices with input or submit journeys, require a `UI Control Contract` in UX output with explicit control-level decisions (control type, validation timing, error presentation, state behavior, and keyboard/focus behavior).
7. For Design System-governed slices with input or submit journeys, require explicit `M3 Control Mapping` in UX output (M3 component, variant, required states, and token/state references).
8. Require a `Frame Blueprint` in UX output: for every required frame, exact frame name (`<Screen>/<State>/<Theme>/<Viewport>`), viewport dimensions, and an ordered component list with DS library-canonical names.
9. Require a `DS Component Coverage Declaration` in UX output: flat deduplicated list of all DS components required across all frames. Component Coverage Check must be completed before any frame is created.
10. Require a `Design Review Access` section in UX output with node-targeted Figma URL(s) (`?node-id=` with actual node IDs from frames created in this pass), expected pages, and review focus.
11. Require an `Orchestrator Resume Packet` in UX output with gate phase reached, persistence-ready summary, AC delta status, OQ resolution status, design access snapshot, and the exact next orchestrator action.
12. Otherwise, loop back to UX clarification and Phase 1 correction before Phase 2 can proceed.

Local-validation rule:

1. Validate `UX Flow/State Package` against UX substep checklist.
2. Validate `Design Artifact` reference. Missing/invalid reference must loop back.
3. Validate `.figma-config.local` has populated, non-empty `design_system_library_file_key`. Treat blank/empty as missing. `design_system_library_url` is recommended but optional.
4. For interactive journeys, validate presence and completeness of `UI Control Contract`. Missing or implicit control decisions must loop back.
5. For Design System-governed interactive journeys, validate presence and completeness of `M3 Control Mapping`. Missing M3 component/variant/state mapping must loop back.
6. Validate `Frame Blueprint` is present for every required frame with exact name, dimensions, and ordered component list (DS library-canonical names). Vague or missing Frame Blueprint must loop back.
7. Validate `DS Component Coverage Declaration` is present as a flat deduplicated component list, and that Component Coverage Check was completed before frame creation.
8. Validate `Design Review Access` is present with node-targeted Figma URL(s) (`?node-id=`) containing actual node IDs — not placeholders. Missing node IDs are a loop-back condition.
9. Validate no top-level frames on the Design page have overlapping bounding boxes. Any overlap must be fixed before review-ready status is claimed.
10. For continuation slices, validate baseline provenance (source node ID + clone node ID) is present in `Design Review Access`.
11. **AC-DELTA Check:** Review every AC referenced in `02-prd.md` against its canonical prose in `01-requirement.md` and the finalized UX flows and states. Identify any AC whose prose describes behavior that the UX phase has refined or superseded (e.g., interaction step count changed, component type changed, a state was split). Flag all deltas as `AC-DELTA: <AC-ID> — <brief description of discrepancy>` in the Gate 3A status output. Flagged deltas must be resolved (AC prose updated in `01-requirement.md` as an annotated amendment; AC ID reference recorded in `## Amendments` of `02-prd.md`) before Gate 3 closes per the AC Writeback Check in the Gate 3 Completion Rule.
12. Validate that every UX- or Design-QA-raised contract delta was classified using the Gate 3 Delta Triage rule before progression. Unclassified deltas are a loop-back condition.
13. **OQ-Deferred AC Creation Check:** Review `01-requirement.md` for any open questions that were explicitly deferred to Gate 3 UX (e.g., marked "Gate 3 UX deliverable", "UX to decide", or "interaction pattern TBD"). For each such OQ, verify the finalized UX Flow/State Package resolves the behavior. Gate 3 UX must then author the new AC prose as an amendment to `01-requirement.md` (the canonical prose source at this gate), and add the new AC ID reference(s) to the `## Amendments` section of `02-prd.md` carrying this annotation: `*(Added at Gate 3 — resolves OQ-<N> deferred from Gate 1; <YYYY-MM-DD>)*`. AC prose must not be placed in the `02-prd.md` body per the `requirement-prd-alignment` skill — only ID references go in the PRD. Missing AC coverage for a UX-resolved OQ is a loop-back condition.
14. Validate `Orchestrator Resume Packet` completeness. Missing phase reached, persistence-ready summary, AC delta status, OQ resolution state, design access snapshot, or next orchestrator action is a loop-back condition.

## Substep B: Design QA Handoff Trigger (Gate 3B)

When executing Gate 3B, orchestrator routes a final sync `ux-agent` handoff. `ux-agent` invokes `design-qa-agent` with the finalized `UX Flow/State Package` (which includes the Figma design reference) and `PRD Draft Package` using explicit model `gpt-5.3-codex`, then returns the critique package for persistence in `04-design-qa.md`.

Design feedback loop rule:

1. Gate 3B is a sync nested QA lane: `ux-agent` owns the dispatch packet, and `design-qa-agent` owns the verdict.
2. Design QA reads the Figma design directly via MCP on every pass.
3. If structural gaps exist, Design QA routes back to `ux-agent` with specific revision instructions.
4. Orchestrator persists every Gate 3B pass, including `Needs Revision`, into `04-design-qa.md` before the next revision or Product Owner review.
5. `ux-agent` revises design frames using the `ux-design-execution` skill and re-submits an updated `UX Flow/State Package`, `Orchestrator Resume Packet`, and refreshed nested Design QA critique.
6. Repeat the loop until no structural gaps remain.

Product Owner approval rule:

1. Once nested Design QA reaches `Agent-Ready`, orchestrator presents the persisted `Design QA Verdict Package` to Product Owner.
2. Product Owner reviews design directly and explicitly approves or requests changes.
3. If changes are requested, Orchestrator routes the revisions to `ux-agent` and Gate 3B loop restarts.
4. Gate 3 closes only when Product Owner explicitly approves.

Local-validation rule:

1. Validate `Design QA Verdict Package` against Design QA checklist before closure.
2. Validate that `04-design-qa.md` exists and captures the latest Gate 3B pass before closure or Product Owner review.

## Gate 3 Completion Rule

1. Both substeps (UX+Design single-pass, Design QA) must pass before Gate 3 is closed.
2. Closing Gate 3 requires the latest persisted `04-design-qa.md`, a `Design QA Verdict Package`, and explicit Product Owner approval on record.
3. **Delta Triage Completion Check (mandatory before Gate 3 closes):** Every UX- or Design-QA-raised refinement that touches requirement intent, PRD wording, or scope must be explicitly classified as `Visual-only refinement`, `Behavioral refinement within scope`, or `Material scope change`. Gate 3 must not close while any such delta remains unclassified.
4. **AC Writeback Check (mandatory before Gate 3 closes):** Compare every AC referenced in `02-prd.md` against its canonical prose in `01-requirement.md` and the finalized UX Flow/State Package. For any AC where the UX phase refined, amended, or replaced the originally-stated interaction model (e.g., single-tap became multi-step, a component changed type, a flow added a state not reflected in the AC prose), the orchestrator MUST update that AC prose in `01-requirement.md` (as an amendment annotated with `*(Amended at Gate <N> — <one-line rationale>; <YYYY-MM-DD>)*`, where `<N>` is the gate at which the amendment was actually made) and record the amended AC ID reference in the `## Amendments` section of `02-prd.md`. AC prose must not be copied into `02-prd.md`. Gate 3 must not be declared closed while any AC prose in `01-requirement.md` for an AC referenced in this PRD contradicts the approved UX flow.
5. **OQ-Deferred AC Completeness Check (mandatory before Gate 3 closes):** Verify that every OQ deferred to Gate 3 UX in `01-requirement.md` now has at least one corresponding AC ID referenced in the `## Amendments` section of `02-prd.md` carrying the `*(Added at Gate 3 — resolves OQ-<N>…)*` annotation. AC prose lives in `01-requirement.md` (as an amendment) and will become the Gherkin canonical source in the feature file at Gate 5; it must not be copied into `02-prd.md`. If any deferred OQ remains without an AC ID reference in `02-prd.md`, Gate 3 must not be declared closed.
6. Gate 4 (Architecture) must not begin until Gate 3 is formally closed and the Delta Triage Completion Check, AC Writeback Check, and OQ-Deferred AC Completeness Check are complete.

## Cross-Slice Continuation Rule

When Gate 3 closes with a scope that cannot be built in the current slice (e.g., the original slice was already built and merged before the amendment design was complete):

1. **Gate 3 is not fully closed until the continuation slice folder exists.** Closing the session or writing a session checkpoint while a "will continue as new slice" note is only a text note — without the slice folder — is a protocol violation.
2. Before the session ends, orchestrator must:
   a. Create `docs/slices/<new-slice-name>/` folder.
   b. Write `01-requirement.md` for the new slice (referencing the approved amendment).
   c. Write reference artifacts `02-prd.md`, `03-ux.md`, `04-design-qa.md` pointing to the source slice amendment.
   d. Update the source slice's `06-tasks.md` amendment status table to reflect the continuation slice name and folder.
3. Only after the continuation slice folder and reference artifacts are committed is Gate 3 considered formally closed for the amendment scope.
4. The orchestrator records the continuation slice name and gate-ready state in `.github/orchestrator-context.md` before ending the session.