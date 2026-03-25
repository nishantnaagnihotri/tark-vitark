# Non-Functional Requirements Baseline

Repository-wide non-functional requirements inherited by every slice unless explicitly overridden.

## Status
- Version: 1.0
- Effective date: 2026-03-25
- Owner: Product Manager + Studio Architect

## Baseline NFRs
- NFR-BASE-001 (Mobile First): All user-facing experiences must be designed and implemented mobile-first.
- NFR-BASE-002 (Responsive Scaling): Layouts must adapt cleanly from mobile to larger viewports without horizontal overflow.
- NFR-BASE-003 (Readable Typography): Content must remain readable with long text and dense content.
- NFR-BASE-004 (Accessibility Minimum): User-facing slices must target WCAG AA contrast and semantic structure.
- NFR-BASE-005 (Performance Hygiene): Avoid unnecessary render or payload bloat in the initial slice implementation.

## Inheritance Rule
- Every functional requirements spec inherits this baseline automatically.
- Slice specs should list only additions, exceptions, or stricter constraints.
- Any exception must include rationale and explicit approval in the decision log.

## Slice Authoring Rule
When creating or updating `docs/functional-requirements-*.md`:
- Add a short note acknowledging inherited baseline NFRs.
- Document only slice-specific NFR additions or deviations.

## Change Control
- Baseline changes must be recorded in `docs/decision-log.md`.
- Update references in `AGENTS.md`, `docs/OPERATING_MODEL.md`, and `docs/functional-requirements-template.md` in the same task.
