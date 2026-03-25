# Current State

Single-page startup context for every new chat.

## Last Updated
- Date: 2026-03-25
- Updated by role: Studio Architect

## Active Slice
- Slice key: debate-screen
- Status: UX Gate complete, ready for Build Gate
- Execution issue: https://github.com/nishantnaagnihotri/tark-vitark/issues/1

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
- Confirm final label text choice: "In Favour/Against" vs "For/Against"
- Confirm desktop behavior preference if stream and columns diverge for long content

## Next Gate
- Build Gate
- Expected artifact: first read-only UI implementation with static sample data

## Update Rule
When a significant decision, requirement, or gate transition happens, update this file in the same task as:
- docs/decision-log.md
- docs/functional-requirements-index.md
