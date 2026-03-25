# UX Agent Execution Process

Purpose: allow UX Strategist to autonomously execute the next UX task based on repository knowledge artifacts.

## Inputs (Required Load Order)
1. AGENTS.md
2. docs/current-state.md
3. docs/non-functional-requirements-baseline.md
4. docs/functional-requirements-index.md
5. active slice requirements spec
6. active slice UX spec
7. docs/decision-log.md

## Task Selection Rule
- Read `Next Gate` in docs/current-state.md.
- If `Next Gate` is UX Gate, identify UX slice queue:
	- Preferred source: `UX Gate Queue` section in docs/current-state.md (ordered list).
	- Fallback source: single `Active Slice` in docs/current-state.md.
- If queue has one slice, execute UX Gate deliverables for that slice.
- If queue has more than one slice:
	- Ask user whether to run a selected subset or `all`.
	- If user says `all`, execute slices sequentially in queue order.
	- If user selects subset, execute only selected slices in the order provided.
- If `Next Gate` is not UX Gate, report handoff and stop.

## Queue Entry Format
Expected `UX Gate Queue` line format in docs/current-state.md:

`<order>. <slice-key> | issue: <url> | status: <pending|in-progress|done>`

Example:

`1. debate-screen | issue: https://github.com/nishantnaagnihotri/tark-vitark/issues/1 | status: in-progress`

## UX Gate Execution Checklist
1. Validate active slice key and execution issue link.
2. Validate inherited NFR baseline constraints relevant to UX output.
3. Produce or update UX artifact details:
- UX spec completeness (flow, states, responsiveness, accessibility)
- Figma file/frame link, or approved waiver if allowed
4. Synchronize artifacts:
- Update active `docs/ux-spec-*.md`
- Update linked issue body sections (UX Spec link, Figma link/waiver)
- Update docs/current-state.md gate status and open questions
5. Report completion with evidence links.

## Multi-Slice Sequencing Rules
- Process one slice at a time to avoid cross-slice state drift.
- Complete full synchronization for a slice before starting next slice.
- After each slice, update docs/current-state.md with progress in queue.
- When final queued slice completes, advance `Next Gate` from UX Gate to Build Gate.

## Guardrails
- Do not change functional requirements unless ambiguity blocks UX output.
- If FR changes are required, request PM/Architect clarification and log assumptions.
- Preserve mobile-first baseline unless a documented exception exists.

## Done Criteria
- UX Gate exit criteria in docs/roles-and-gates.md are all satisfied.
- Active slice shows updated UX artifact links.
- Current-state `Next Gate` advances appropriately.

## Output Format
- UX artifacts updated
- Files touched
- Open risks/questions
- Next gate recommendation
