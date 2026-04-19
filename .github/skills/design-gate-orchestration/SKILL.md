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

## Substep A: UX + Design Single-Pass Trigger (Gate 3A)

Gate 3A is executed **directly by the Orchestrator** using the `ux-design-execution` skill (`.github/skills/ux-design-execution/SKILL.md`). Do NOT delegate to a separate agent. Gate 3A runs in **two phases** under the single-screen-first protocol:

**Phase 1 (mandatory first):** Orchestrator runs the full Challenge Phase, produces the complete `UX Flow/State Package` text artifact (flows, states, UI Control Contract, M3 Control Mapping, Frame Blueprint, DS Coverage Declaration), AND creates only the primary frame: `Default/Light/Mobile`. Return this frame to the Product Owner for explicit visual approval before creating any additional frames.

**Phase 2 (after Product Owner approves Phase 1 frame):** Orchestrator creates all remaining Figma pixel frames in one follow-up pass, following the Frame Blueprint.

Product Owner must explicitly approve the Phase 1 frame (topic bar, card layout, bubble arrows, typography, colors — all match baseline) before Phase 2 is authorized. If visual issues are found in Phase 1, iterate with UX Agent until Product Owner approves, then proceed to Phase 2.

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
11. Otherwise, loop back to UX clarification and Phase 1 correction before Phase 2 can proceed.

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

## Substep B: Design QA Handoff Trigger (Gate 3B)

When executing Gate 3B, invoke `design-qa-agent` with `UX Flow/State Package` (which includes the Figma design reference) and `PRD Draft Package`.

Design feedback loop rule:

1. Design QA reads the Figma design directly via MCP on every pass.
2. If structural gaps exist, Design QA routes back to Orchestrator with specific revision instructions.
3. Orchestrator revises design frames using the `ux-design-execution` skill and re-submits an updated `UX Flow/State Package`.
4. Repeat the loop until no structural gaps remain.

Product Owner approval rule:

1. Once Design QA reaches `Agent-Ready`, present `Design QA Verdict Package` to Product Owner.
2. Product Owner reviews design directly and explicitly approves or requests changes.
3. If changes are requested, Orchestrator revises using the `ux-design-execution` skill and Gate 3B loop restarts.
4. Gate 3 closes only when Product Owner explicitly approves.

Local-validation rule:

1. Validate `Design QA Verdict Package` against Design QA checklist before closure.

## Gate 3 Completion Rule

1. Both substeps (UX+Design single-pass, Design QA) must pass before Gate 3 is closed.
2. Closing Gate 3 requires `Design QA Verdict Package` and explicit Product Owner approval on record.
3. Gate 4 (Architecture) must not begin until Gate 3 is formally closed.

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