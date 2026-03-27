# Current State

Single-page startup context for every new chat.

## Last Updated
- Date: 2026-03-27
- Updated by role: Studio Architect

## Active Slice
- Slice key: debate-screen
- Status: UX Gate in-progress (Figma required)
- Execution issue: https://github.com/nishantnaagnihotri/tark-vitark/issues/1
- UX ownership note: UX contract not created yet; UX Strategist will author it during UX Gate

## Execution Mode
- Active mode: supervised parallel writers (architect-controlled)
- Gate transition authority: Studio Architect only
- Final artifact synchronization authority: Studio Architect only

## UX Gate Queue
Use this ordered list when multiple slices are in UX Gate.
Line format:
`<order>. <slice-key> | issue: <url> | status: <pending|in-progress|done>`

1. debate-screen | issue: https://github.com/nishantnaagnihotri/tark-vitark/issues/1 | status: in-progress

## Active Role Queues
Use this list when supervised parallel mode is active.
Line format:
`<order>. <role> | packet: <id> | scope: <files/modules> | status: <pending|in-progress|done>`

1. Studio Architect | packet: orchestrator-sync | scope: governance reconciliation and gate control | status: in-progress
2. UX Strategist | packet: ux-debate-screen-001 | scope: docs/handoffs/ux-debate-screen-001.md | status: needs-clarification (dispatch cycle 3: UX-role execution context)

## Canonical Context (Load In This Order)
1. AGENTS.md
2. docs/current-state.md
3. docs/non-functional-requirements-baseline.md
4. docs/functional-requirements-index.md
5. docs/functional-requirements-debate-screen.md
7. docs/decision-log.md

Load active UX contract only after UX Strategist creates it during UX Gate.

## Current Requirements Snapshot
- FR-debate-screen-001: show debate topic heading
- FR-debate-screen-002: include at least 3 For arguments
- FR-debate-screen-003: include at least 3 Against arguments
- FR-debate-screen-004: visually distinguish sides
- FR-debate-screen-005: mobile stream preserves posted order; For left, Against right
- FR-debate-screen-006: desktop renders two columns; For left, Against right

## Open Questions
- Create minimal UX contract and add Figma file/frame link for debate-screen UX artifact.
- Add final debate-screen frame URL in Figma after UX frame authoring in file key `ltU4U9jpQuWKGInUHC9Bwq`.
- Confirm execution context for UX Strategist authoring step so `docs/ux-spec-debate-screen.md` can be produced in this cycle.

## Next Gate
- UX Gate
- Expected artifact: Figma link + minimal UX contract added for debate-screen, then proceed to Build Gate

## Agentic UX Protocol Status
- Agent-first policy: enforced
- UX Figma protocol: `docs/ux-figma-agentic-protocol.md`
- Active fallback blocker: none (project and file-level Figma access verified)
- UX contract timing rule: final UX contract is authored by UX Strategist during UX Gate
- UX direction decisions: labels use For/Against; desktop uses two-column layout

## Process Optimization Baseline
- Gate timeboxes: active
- Fast-lane eligibility: active for low-risk slices
- Build input contract: Implementation Story Pack required before Build Gate for non-trivial slices
- Process guard script: `./scripts/validate-process-guards.sh`
- Gate transition preflight: `./scripts/preflight-gate-transition.sh <target-gate>`

## Update Rule
When a significant decision, requirement, or gate transition happens, update this file in the same task as:
- docs/decision-log.md
- docs/functional-requirements-index.md
- Before changing `Next Gate`, run `./scripts/preflight-gate-transition.sh <target-gate>`.
