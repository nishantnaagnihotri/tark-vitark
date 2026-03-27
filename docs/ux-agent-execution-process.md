# UX Agent Execution Process

Purpose: allow UX Strategist to autonomously execute the next UX task based on repository knowledge artifacts.

Ownership rule:
- UX Strategist is the only role that may create or author slice UX contracts under `docs/ux-spec-*.md`.
- Any non-UX-authored UX contract draft is a process violation and must be removed or reset to `TBD` references.
- Functional and baseline NFR constraints must still be preserved unless explicitly changed through governance.

Creation timing rule:
- Final UX contract is created/authored in UX Gate by UX Strategist.
- Before UX Gate, requirement artifacts may include UX intent notes, but not a finalized UX contract.

## Inputs (Required Load Order)
1. AGENTS.md
2. docs/current-state.md
3. docs/non-functional-requirements-baseline.md
4. docs/functional-requirements-index.md
5. active slice requirements spec
6. active slice UX contract (if present from prior UX iterations)
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
3. Run iterative UX exploration loop:
- Propose direction A/B (layout, hierarchy, and visual style options)
- Converge with user feedback
- Repeat until one direction is approved for execution
4. Produce or update UX artifact details:
- Create the active `docs/ux-spec-*.md` from template if it does not exist yet.
- Treat Figma as the primary visual artifact for layout and style decisions.
- Complete minimal UX contract for non-visual behavior (flow, states, responsiveness, accessibility, copy intent).
- Add Figma file/frame link and code translation mapping.
5. Synchronize artifacts:
- Update active `docs/ux-spec-*.md`
- Update linked issue body sections (UX contract link, Figma link)
- Update docs/current-state.md gate status and open questions
6. Report completion with evidence links.
7. Run `./scripts/validate-process-guards.sh` before finalizing task updates.

## Multi-Slice Sequencing Rules
- Process one slice at a time to avoid cross-slice state drift.
- Complete full synchronization for a slice before starting next slice.
- After each slice, update docs/current-state.md with progress in queue.
- When final queued slice completes, advance `Next Gate` from UX Gate to Build Gate.

## Guardrails
- Do not change functional requirements unless ambiguity blocks UX output.
- If FR changes are required, request PM/Architect clarification and log assumptions.
- Preserve mobile-first baseline unless a documented exception exists.
- Keep UX execution agent-first; use manual fallback only for external platform blockers.
- In fallback mode, still generate complete contracts in-repo, then request minimal manual link placement.

## Done Criteria
- UX Gate exit criteria in docs/roles-and-gates.md are all satisfied.
- Active slice shows updated UX artifact links.
- UX contract captures non-visual constraints and code translation mapping, with linked Figma artifact.
- Current-state `Next Gate` advances appropriately.

## Output Format
- UX artifacts updated
- Files touched
- Open risks/questions
- Next gate recommendation
