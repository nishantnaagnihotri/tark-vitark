# Current State

Single-page startup context for every new chat.

## Last Updated
- Date: 2026-03-26
- Updated by role: Studio Architect

## Active Slice
- Slice key: debate-screen
- Status: UX Gate in progress (Figma required; waiver not allowed)
- Execution issue: https://github.com/nishantnaagnihotri/tark-vitark/issues/1
- UX ownership note: UX Strategist draft created in round 1; user approval pending for final direction

## UX Gate Queue
Use this ordered list when multiple slices are in UX Gate.
Line format:
`<order>. <slice-key> | issue: <url> | status: <pending|in-progress|done>`

1. debate-screen | issue: https://github.com/nishantnaagnihotri/tark-vitark/issues/1 | status: in-progress

## Canonical Context (Load In This Order)
1. AGENTS.md
2. docs/current-state.md
3. docs/non-functional-requirements-baseline.md
4. docs/functional-requirements-index.md
5. docs/functional-requirements-debate-screen.md
6. docs/ux-spec-debate-screen.md
7. docs/decision-log.md

## Current Requirements Snapshot
- FR-debate-screen-001: show debate topic heading
- FR-debate-screen-002: include at least 3 favour arguments
- FR-debate-screen-003: include at least 3 against arguments
- FR-debate-screen-004: visually distinguish sides
- FR-debate-screen-005: mobile stream preserves posted order; favour left, against right

## Open Questions
- Approve or revise round-1 UX direction (Split Chronicle) for debate-screen.
- Add Figma file/frame link for debate-screen UX artifact.
- Confirm final label text choice: "In Favour/Against" vs "For/Against"
- Confirm desktop behavior preference if stream and columns diverge for long content
- Confirm Figma API/MCP availability to remove manual fallback for link placement.

## Next Gate
- UX Gate
- Expected artifact: Figma link added for debate-screen (no waiver), then proceed to Build Gate

## Agentic UX Protocol Status
- Agent-first policy: enforced
- UX Figma protocol: `docs/ux-figma-agentic-protocol.md`
- Active fallback blocker: direct Figma API/MCP availability not yet confirmed
- UX spec timing rule: final UX spec is authored by UX Strategist during UX Gate

## Process Optimization Baseline
- Gate timeboxes: active
- Fast-lane eligibility: active for low-risk slices
- Build input contract: Implementation Story Pack required before Build Gate for non-trivial slices

## Update Rule
When a significant decision, requirement, or gate transition happens, update this file in the same task as:
- docs/decision-log.md
- docs/functional-requirements-index.md
