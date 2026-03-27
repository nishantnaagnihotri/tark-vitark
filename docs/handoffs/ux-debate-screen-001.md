# Gate Input Packet: ux-debate-screen-001

- target gate: UX Gate
- active slice key: debate-screen
- execution issue: https://github.com/nishantnaagnihotri/tark-vitark/issues/1
- delegated owner: UX Strategist
- allowed write scope (files/modules):
  - docs/ux-spec-debate-screen.md (create/update by UX Strategist only)
  - docs/current-state.md (queue status, open questions, gate status)
  - docs/decision-log.md (UX decisions and blocker/fallback notes)
  - issue #1 sections: UX contract link, Figma link, UX notes
- temporary file locks (if any):
  - docs/ux-spec-debate-screen.md: UX Strategist

## Required Artifacts
- Minimal UX contract in docs/ux-spec-debate-screen.md authored by UX Strategist.
- Figma file/frame link for debate-screen UX artifact.
- Code translation mapping section in UX contract.
- Completed Gate Output Packet in docs/handoffs/ux-debate-screen-001-output.md.

## Acceptance Checks To Verify
- UX Gate exit criteria from docs/roles-and-gates.md are satisfied:
  - UX direction explicitly approved.
  - Figma artifact is the primary visual source.
  - Minimal UX contract captures states, responsiveness, accessibility, and copy intent.
  - UX contract includes Figma link plus code translation mapping.
- FR alignment with docs/functional-requirements-debate-screen.md:
  - Mobile stream preserves mixed chronological order.
  - For left / Against right alignment on mobile.
  - Two-column desktop layout with For left and Against right.

## Known Constraints / Non-Goals
- Do not modify functional requirements unless ambiguity blocks UX output.
- Keep interaction scope static (no voting, posting, reacting, sorting).
- Figma mandatory policy remains active: no UX Gate exit without real final file/frame URL.

## Figma Access Context
- Project URL: https://www.figma.com/files/team/1302618729378439898/project/115942335
- Verified project key: 115942335
- Verified file key: ltU4U9jpQuWKGInUHC9Bwq

## Escalation and Clarification Loop
If any ambiguity or access issue blocks progress:
1. Return blocker summary to Studio Architect.
2. Include exact missing input/decision.
3. Include resume point and suggested next action.
4. Resume same packet after clarification.

## Decision Deadline / Timebox
- UX packet timebox: 1 working day (or 2 iteration rounds if design direction changes).
