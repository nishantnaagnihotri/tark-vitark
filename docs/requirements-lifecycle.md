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

## New Requirement Kickoff (How To Start)
Use this sequence when a requirement is new and not yet shaped into a slice:

1. Entry discussion with Studio Architect
- Provide a concise brief: problem, target user, desired outcome, success signal, constraints.

2. Plan intake framing by Studio Architect
- Propose safe initial slice boundary and declare risk profile.
- Confirm required roles and whether fast-lane is eligible.

3. Requirement shaping by Product Manager
- Produce or update slice requirements spec with FR IDs and ACs.
- Confirm baseline NFR inheritance and explicit non-goals.

4. Execution tracker creation
- Open/update issue using `.github/ISSUE_TEMPLATE/feature-slice-intake.yml`.
- Set `Gate Decision Owner` to Studio Architect.
- Set `Requirements Owner` to Product Manager (or Studio Architect in lean fallback).
- Keep UX Contract Link and Figma Link as `TBD` until UX Gate completion.

5. Plan Gate decision
- Studio Architect validates Plan Gate exit criteria and either:
  - advances to UX Gate, or
  - requests requirement refinement.

## Gate Handoff Packets (Required)
Use these packet formats for all delegated gate work so Studio Architect can orchestrate consistently.

### Gate Input Packet (Architect -> Gate Owner)
- target gate:
- active slice key:
- execution issue:
- required artifacts:
- acceptance checks to verify:
- known constraints/non-goals:
- decision deadline or timebox:

### Gate Output Packet (Gate Owner -> Architect)
- gate evaluated:
- status: `pass` | `needs-clarification` | `fail`
- evidence links:
- assumptions made:
- open questions:
- risk notes:
- recommendation: `advance` | `hold` | `re-scope`

Escalation rule:
- Gate owners escalate only to Studio Architect.
- Studio Architect is responsible for consulting the human owner when needed.

## Standard Issue Structure
Every feature-slice issue should follow this structure:
- Top summary section listing in-scope FR IDs.
- Problem/outcome, scope, and acceptance criteria sections.
- NFR baseline inheritance acknowledgement section.
- Traceability Matrix section mapping FR ID -> behavior -> AC IDs -> evidence.
- UX contract link section (or `TBD` until UX Gate completes).
- Figma link section (or `TBD` until UX Gate completes).
- Implementation Story Pack section (or `TBD` until UX Gate outputs are approved).

Rationale: top FR summary provides fast triage scanning, while matrix provides full traceability detail.

## Ownership Model
- Primary owner: Product Manager
- Fallback owner (lean mode): Studio Architect
- Consumers: UX Strategist, Feature Engineer, Quality Engineer, Code Steward

UX artifact ownership boundary:
- Product Manager owns functional requirements and acceptance criteria.
- Product Manager does not own final UX contract content.
- UX Strategist owns and authors the final UX contract and Figma artifact during UX Gate.

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
- Capture product-level user story (outcome-oriented, not code-task decomposition).

4. UX Gate completion
- UX Strategist produces approved UX contract + Figma artifact state.
- Keep UX and FR traceability links current in issue and docs.

5. Build input decomposition
- Studio Architect and/or Feature Engineer creates Implementation Story Pack from FR + AC + approved UX.
- Each implementation story must map to FR IDs and AC IDs.
- Mark issue section "Implementation Story Pack" as ready before Build Gate starts.

6. Build and QA traceability
- Feature Engineer references requirement IDs in implementation notes/tasks.
- Quality Engineer maps test evidence to requirement IDs.
- Pull requests and test notes should include the same requirement IDs for end-to-end traceability.

7. Change control
- If requirements change, update the spec and index in the same session.
- Record rationale and tradeoffs in the decision log.

8. Ship and maintenance
- Mark implemented requirements as Implemented.
- Mark replaced requirements as Deprecated with replacement links.

## Cadence and Hygiene
- Per slice start: verify that requirements index entry exists.
- Per gate transition: update requirement status.
- Weekly (or every 3 slices): run a consistency pass across spec, index, and decision log.

## Practical Guardrails
- Keep specs short; avoid long narrative docs.
- Prefer explicit non-goals to prevent scope creep.
- No Build Gate for non-trivial slices if Implementation Story Pack is missing.
- No Build Gate if acceptance criteria are not testable.
- No Ship Gate if requirements status is stale.
