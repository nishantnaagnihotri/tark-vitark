# Requirements Lifecycle

Purpose: ensure one agent role can maintain full, current knowledge of functional requirements while all other roles consume the same source of truth.

## Canonical Artifacts
- Functional requirements spec per slice:
  - Use docs/functional-requirements-template.md
- Cross-slice requirements registry:
  - Use docs/functional-requirements-index.md
- Process and rationale history:
  - Use docs/decision-log.md

## GitHub Mapping Policy
- Source of truth for functional requirements remains in repo docs.
- GitHub Issues and Projects are execution trackers, not requirement truth.
- Every implementation issue must reference requirement IDs (example: FR-auth-001).
- Every requirement row in the index should link to its primary GitHub issue/project item.
- If issue status and requirements status diverge, update the requirements index first, then sync issue/project metadata.
- Default issue intake form: `.github/ISSUE_TEMPLATE/feature-slice-intake.yml`.
- Required labels bootstrap: `bash scripts/setup-github-labels.sh`.

## Ownership Model
- Primary owner: Product Manager
- Fallback owner (lean mode): Studio Architect
- Consumers: UX Strategist, Feature Engineer, Quality Engineer, Code Steward

## Lifecycle Steps
1. Intake and framing
- Capture problem, target user, scope, and success outcomes.
- Create or update a slice spec using the template.

2. Requirement definition
- Define functional requirements and acceptance criteria.
- Assign stable IDs using FR-<slice>-<number>.

3. Plan Gate sync
- Add or update the slice row in the requirements index.
- Mark status as Proposed or Approved.
- Create or link the corresponding GitHub issue/project item for execution.

4. Build and QA traceability
- Feature Engineer references requirement IDs in implementation notes/tasks.
- Quality Engineer maps test evidence to requirement IDs.
- Pull requests and test notes should include the same requirement IDs for end-to-end traceability.

5. Change control
- If requirements change, update the spec and index in the same session.
- Record rationale and tradeoffs in the decision log.

6. Ship and maintenance
- Mark implemented requirements as Implemented.
- Mark replaced requirements as Deprecated with replacement links.

## Cadence and Hygiene
- Per slice start: verify that requirements index entry exists.
- Per gate transition: update requirement status.
- Weekly (or every 3 slices): run a consistency pass across spec, index, and decision log.

## Practical Guardrails
- Keep specs short; avoid long narrative docs.
- Prefer explicit non-goals to prevent scope creep.
- No Build Gate if acceptance criteria are not testable.
- No Ship Gate if requirements status is stale.
