# Functional Requirements Index

Single source of truth for functional requirements across all slices.

## Usage Rules
- Every non-trivial slice must have one entry.
- Requirement IDs use format: FR-<slice>-<number> (example: FR-auth-001).
- Keep status current as work moves through gates.
- Link requirement changes to decision log entries.

## Requirement Status
- Proposed: drafted, not approved for build.
- Approved: accepted at Plan Gate and ready for build.
- Implemented: merged and behavior available.
- Deprecated: intentionally replaced or removed.

## Registry

| Slice | Requirement IDs | Summary | Status | Source Spec | Execution Link | Acceptance Evidence | Decision Links | Owner |
|---|---|---|---|---|---|---|---|---|
| debate-screen | FR-debate-screen-001, FR-debate-screen-002, FR-debate-screen-003, FR-debate-screen-004, FR-debate-screen-005, FR-debate-screen-006 | User can view one debate topic with For and Against arguments in a mobile-first read-only stream and a two-column desktop layout | Approved | docs/functional-requirements-debate-screen.md | https://github.com/nishantnaagnihotri/tark-vitark/issues/1 | _TBD_ | docs/decision-log.md | Product Manager |

## Handoff Checklist
- Product Manager:
  - Requirements are unambiguous and IDs assigned.
  - Acceptance criteria are measurable.
- UX Strategist:
  - Flow/states cover each approved requirement.
- Feature Engineer:
  - Implementation references requirement IDs in PR/task notes.
- Quality Engineer:
  - Test cases map to requirement IDs and acceptance criteria.
- Studio Architect:
  - Gate decisions and tradeoffs are reflected in docs and decision log.
