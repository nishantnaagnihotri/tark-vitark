# Orchestrator Context Transfer

This file is the canonical handover context for the Architect + Orchestrator agent.

## Purpose

Enable the orchestrator to resume work as primary control agent for all activities without losing prior planning decisions.

## Product Owner Model

1. Product Owner is the human user.
2. Product Owner owns final decisions on scope, ambiguity acceptance, PR merge, and release.
3. Agents prepare artifacts and recommendations only.

## Delivery Mode

1. Part-time execution.
2. One active implementation slice at a time.
3. One micro-goal per session.
4. Session closeout always includes: done, next, blockers.

## Environment Model

1. Requirement challenge: local-first.
2. PRD drafting: cloud-preferred, local-allowed.
3. Gate 3 design work, including the UX substep, is local-only.
4. Cloud-preferred gates require execution mode confirmation (`local` or `cloud`) before handoff.
5. If cloud mode is chosen, manual handoff is required and return artifact must be pasted back.
6. Final verification and merge readiness decisions happen in local context.

## Implemented Agents (Current)

1. Architect + Orchestrator: `.github/agents/architect-orchestrator.agent.md`
2. Requirement Challenger: `.github/agents/requirement-challenger.agent.md`
3. PRD Agent: `.github/agents/prd.agent.md`
4. UX Agent: `.github/agents/ux.agent.md`
5. Figma Agent: `.github/agents/figma.agent.md`
6. Design QA Agent: `.github/agents/design-qa.agent.md`
7. Architecture Agent: `.github/agents/architecture.agent.md`
8. Dev Agent: `.github/agents/dev.agent.md`

## Current Gate Contracts

1. Gate 1 (Requirement Challenge)
- Input minimum: requirement statement.
- Output required from Challenger:
  - Readiness
  - Missing Information
  - Assumptions
  - Challenge Questions
  - Edge Cases
  - Proposed Acceptance Criteria
  - Open Questions with owner decision status
  - Gate Decision
  - Requirement Context Package

2. Gate 2 (PRD)
- Primary input: Requirement Context Package.
- Output required from PRD Agent:
  - PRD Readiness
  - PRD v0
  - Traceability Map
  - Quality Gaps
  - Open Questions with owner decision status
  - Gate Decision
  - PRD Draft Package

3. Gate 3 (Design)
- Gate intent: complete the full design gate before architecture or coding.
- Current planned substeps:
  - UX substep
  - Figma substep
  - Design QA substep
- Current implemented substeps:
  - UX substep
  - Figma substep
  - Design QA substep
- UX substep input: PRD Draft Package.
- UX substep output required from UX Agent:
  - UX Readiness
  - UX Flows
  - State Matrix
  - Interaction Notes
  - Quality Gaps
  - Open Questions with owner decision status
  - Gate Decision
  - UX Flow/State Package
- Figma substep input: UX Flow/State Package.
- Figma substep output required from Figma Agent:
  - Figma Readiness
  - Screen/Flow Mapping
  - Component and Token Guidance
  - Interaction and Edge-State Design Notes
  - Quality Gaps
  - Open Questions with owner decision status
  - Gate Decision
  - Design Draft Package
- Design QA substep input: Design Draft Package + UX Flow/State Package + PRD Draft Package.
- Design QA substep output required from Design QA Agent:
  - Design QA Readiness
  - PRD Traceability Review
  - UX Coverage Review
  - Component and Token Consistency Review
  - Edge State Coverage Review
  - Quality Gaps
  - Open Questions with owner decision status
  - Gate Decision
  - Design QA Verdict Package
- Gate 3 design feedback loop: Design QA reads Figma via MCP, routes gaps back to Figma Agent, iterates until Agent-Ready, then escalates to Product Owner for explicit approval.
- Gate 3 is closed only when all three substeps pass, Design QA Verdict Package is produced, and Product Owner has explicitly approved the design.

4. Gate 4 (Architecture)
- Gate intent: convert approved requirement, PRD, UX, and Design QA artifacts into an implementation-ready architecture and task plan.
- Input required from slice folder:
  - `01-requirement.md`
  - `02-prd.md`
  - `03-ux.md`
  - `04-design-qa.md`
- Output required from Architecture Agent:
  - Architecture Readiness
  - Architecture Plan
  - Impact Analysis
  - Risk and Mitigation Plan
  - Verification Strategy
  - Task Decomposition
  - Quality Gaps
  - Open Questions with owner decision status
  - Gate Decision
  - Architecture Plan Package
- Gate 4 completion outputs:
  - `05-architecture.md`
  - `06-tasks.md` (includes GitHub Issue numbers created at Gate 4 end)

5. Gate 5 (Build)
- Gate intent: implement one approved Gate 4 issue at a time using architecture references and produce merge-ready evidence.
- Input required:
  - one GitHub Issue link or number from `06-tasks.md`
  - issue metadata with acceptance criteria, slice path, and architecture reference
- Output required from Dev Agent:
  - Build Readiness
  - Implementation Summary
  - Files Changed
  - Verification Evidence
  - BDD Evidence
  - PR Package (with issue-closing reference)
  - Quality Gaps
  - Open Questions with owner decision status
  - Gate Decision
  - Build Output Package

6. Gate 6 (Merge)
- Gate intent: verify issue-level PR merge readiness using Build Output Package evidence and recommend merge or loop-back.
- Input required:
  - GitHub Issue reference
  - PR link
  - Build Output Package
- Output required from Orchestrator merge review:
  - Merge Readiness
  - Merge Review Summary
  - Outstanding Gaps
  - Gate Decision
  - Owner Action

## Known Rules From User Decisions

1. Requirement Challenger is primary owner of requirement detailing.
2. Orchestrator forwards only requirement statement at Gate 1 and does not reinterpret details.
3. Challenger continues clarification rounds until no open questions remain or Product Owner accepts remaining open questions.
4. Challenger drafts acceptance criteria detailed enough for PRD writing.
5. Product Owner manually reviews and merges all PRs.
6. Dev is cloud-first for coding implementation, with local verification before merge.
7. Gate 3 is a full design gate and is local-only.
8. Gate 1 and Gate 2 stay separate: Gate 1 is Requirement Challenger only, Gate 2 is PRD Agent only.
9. Orchestrator must challenge major decisions, provide alternatives with tradeoffs, and recommend a balanced option before owner finalization.
10. Gate 6 structure (compound substeps vs split gates) is deferred until Gate 5 Dev output contract is known. Do not design Gate 6 before Gate 5 is implemented.
11. Gate 3 never closes on agent decision alone. Figma Agent produces dual output (real Figma design via MCP + text Design Coverage Report). Design QA reads Figma via MCP, loops gaps back to Figma Agent, then escalates to Product Owner. Product Owner explicit approval is required to close Gate 3.
12. Slice artifacts are stored in `docs/slices/<slice-name>/` as versioned markdown. Orchestrator creates the slice folder when Gate 1 passes and writes gate artifacts after each gate closes.
13. GitHub Issues (one per atomic coding task) are created by the orchestrator at the end of Gate 4, after the architecture plan is approved. Gate 5 (Build) is purely implementation — no planning overhead.
14. Architecture governance is orchestrator-owned and enforced through an explicit Gate 4 checklist (scope, traceability, boundaries, risk, verification, rollback, decomposition, issue linkage, and owner acceptance).
15. Gate 5 defaults to GitHub Copilot cloud Dev execution. Local execution is permitted only when Product Owner explicitly overrides for a specific Issue. Final build evidence is verified in Local before merge recommendation.
16. Gate 5 implementation uses BDD discipline: behavior scenarios, test-first workflow, and scenario-to-test evidence are required before merge progression.
17. Issue-centric handoff is supported for Gate 5: issue link/number is sufficient only when issue metadata includes acceptance criteria, slice path, and architecture reference.
18. Gate 5 PR provenance is mandatory: PR body must include issue-closing keyword and `Execution-Agent: dev-agent` marker for attribution and orchestration traceability.
19. Gate 6 is orchestrator-owned and Local-only. It recommends merge or loop-back based on evidence, but Product Owner alone performs the actual merge.

## Resume Protocol For Orchestrator

On first response in any new activity:

1. Read `.github/AGENTS.md`.
2. Read this file (`.github/orchestrator-context.md`).
3. Read implemented agent files under `.github/agents/`.
4. Return a short resume snapshot:
- current gate
- known artifacts present or missing
- immediate next micro-goal
- blockers and owner decisions needed

## Current Program Status

1. Gate 1 and Gate 2 are implemented.
2. Gate 3 is fully implemented: UX, Figma, and Design QA substeps are all defined and wired.
3. Gate 4 is implemented at contract level: Architecture Agent and orchestrator handoff rules are defined.
4. Gate 5 is implemented at contract level: Dev Agent and orchestrator handoff rules are defined.
5. Gate 6 is implemented at contract level: merge readiness review is orchestrator-owned.
6. Current protocol baseline is complete through Merge gate.

## Default Next Step

1. Run one dry-run of the full Gate 4 -> Gate 6 flow on a sample issue/PR path.

## Context Update Log

Append new entries here after each gate transition.

Template:

### YYYY-MM-DD
- Gate status:
- Artifact changes:
- Open questions status:
- Next micro-goal:
- Blockers/owner decisions:

### 2026-03-29
- Gate status: Gate 3 is a full design gate; UX substep is implemented, Figma and Design QA substeps remain pending.
- Artifact changes: Added UX Agent, updated Gate 3 to be described as a full design gate with substeps, and made Gate 3 local-only.
- Open questions status: No new owner decisions required for this setup slice.
- Next micro-goal: Implement Figma substep and formalize post-UX design handoff.
- Blockers/owner decisions: None for current slice.

### 2026-03-29
- Gate status: Gate 3 remains active; UX and Figma substeps are implemented, Design QA remains pending.
- Artifact changes: Added Figma Agent and wired Gate 3 Figma handoff from UX Flow/State Package to Design Draft Package.
- Open questions status: No new owner decisions required for this setup slice.
- Next micro-goal: Implement Design QA substep and finalize Gate 3 completion checks.
- Blockers/owner decisions: None for current slice.

### 2026-03-29
- Gate status: Gate sequencing confirmed; Gate 1 and Gate 2 remain separate before Gate 3 design work.
- Artifact changes: Updated decision log to lock Gate 1 = Requirement Challenge and Gate 2 = PRD.
- Open questions status: Owner accepted recommended separation model.
### 2026-03-29
- Gate status: Gate 3 is now fully implemented.
- Artifact changes: Created Design QA Agent; added Substep C trigger, Gate 3 completion criteria, and example Design QA handoff message to orchestrator; added design-qa-agent to allow-list frontmatter; updated context with full Gate 3 contract.
- Open questions status: None pending.
- Next micro-goal: Implement Gate 4 (Architecture gate).
- Blockers/owner decisions: None for current slice.

### 2026-03-29
- Gate status: Gate 3 design loop model updated.
- Artifact changes: Figma Agent now produces dual output (real Figma design + Design Coverage Report); Design QA Agent gains Figma MCP read access, feedback loop routing to Figma Agent, and Product Owner escalation; Gate 3 completion rule updated to require explicit Product Owner approval; orchestrator Substep C rules updated with loop and PO approval mechanics.
- Open questions status: Owner accepted merged A+B+C model; owner explicit approval required to close Gate 3.
- Next micro-goal: Implement Gate 4 (Architecture gate).
- Blockers/owner decisions: None for current slice.### 2026-03-29
- Gate status: Orchestration policy hardened for challenge-first decision support.
- Artifact changes: Added mandatory decision-challenge and alternatives protocol to shared and orchestrator contracts.
- Open questions status: Owner requested stronger challenge behavior; accepted.
- Next micro-goal: Resume Gate 3 with Design QA substep using hardened decision protocol.
- Blockers/owner decisions: None for current slice.

### 2026-03-29
- Gate status: Protocol review complete; all three issues addressed.
- Artifact changes: Fixed "may include" → "includes" in AGENTS.md Gate 3 description; fixed Gate Sequence body in orchestrator to include Design QA; recorded Gate 6 deferral decision.
- Open questions status: Gate 6 structure decision deferred by owner to post-Gate-5. Options A/B/C were presented; owner accepted Option C (conservative — defer).
- Next micro-goal: Implement Design QA substep inside Gate 3.
- Blockers/owner decisions: None for current slice.

### 2026-03-29
- Gate status: Gate 4 contract is now implemented.
- Artifact changes: Added Architecture Agent (`architecture.agent.md`); wired Architecture Gate handoff trigger, proceeding rules, and completion criteria in orchestrator; added Architecture handoff message template; updated gate context to include Gate 4 I/O and outputs (`05-architecture.md`, `06-tasks.md`).
- Open questions status: None pending for this setup slice.
- Next micro-goal: Implement Gate 5 (Dev gate) contract for Issue-driven execution.
- Blockers/owner decisions: None for current slice.

### 2026-03-29
- Gate status: Gate 4 governance hardened.
- Artifact changes: Added explicit Architecture Gate Checklist to orchestrator, codifying orchestrator-owned responsibilities before Build gate authorization.
- Open questions status: No open questions for this change.
- Next micro-goal: Implement Gate 5 (Dev gate) contract for Issue-driven execution.
- Blockers/owner decisions: None for current slice.

### 2026-03-29
- Gate status: Gate 5 contract is now implemented.
- Artifact changes: Added Dev Agent (`dev.agent.md`); wired Build Gate handoff trigger, execution mode confirmation, and completion rules in orchestrator; added Build handoff message template; updated context with Gate 5 input/output contract.
- Open questions status: None pending for this setup slice.
- Next micro-goal: Implement Gate 6 (Merge gate) contract.
- Blockers/owner decisions: None for current slice.

### 2026-03-29
- Gate status: Gate 5 execution policy corrected.
- Artifact changes: Updated Build gate default execution to GitHub Copilot cloud Dev implementation; local execution now explicit owner override only; aligned shared protocol, dev agent environment policy, and context known rules.
- Open questions status: Owner clarified desired executor as GitHub cloud coding agent that creates PR.
- Next micro-goal: Implement Gate 6 (Merge gate) contract.
- Blockers/owner decisions: None for current slice.

### 2026-03-29
- Gate status: Gate 5 quality protocol hardened.
- Artifact changes: Added BDD/test-first policy to shared protocol; updated Dev agent contract with scenario-first testing and BDD evidence output; added Build Gate checklist in orchestrator to enforce BDD evidence before merge progression.
- Open questions status: Owner requested BDD + test-first implementation discipline.
- Next micro-goal: Implement Gate 6 (Merge gate) contract.
- Blockers/owner decisions: None for current slice.

### 2026-03-29
- Gate status: Gate 5 handoff model refined.
- Artifact changes: Enabled issue-centric handoff where issue link/number is sufficient when issue metadata includes acceptance criteria, slice path, and architecture reference; added issue metadata validation lock in Build gate checklist.
- Open questions status: Owner requested issue-link-first handoff model.
- Next micro-goal: Implement Gate 6 (Merge gate) contract.
- Blockers/owner decisions: None for current slice.

### 2026-03-29
- Gate status: Gate 5 attribution model hardened.
- Artifact changes: Added mandatory PR provenance convention (`Execution-Agent: dev-agent`) and issue-closing keyword requirement; added Provenance lock in Build gate checklist; updated Dev output schema to include provenance confirmation.
- Open questions status: Owner requested deterministic PR attribution to Dev executions.
- Next micro-goal: Implement Gate 6 (Merge gate) contract.
- Blockers/owner decisions: None for current slice.

### 2026-03-29
- Gate status: Gate 6 contract is now implemented.
- Artifact changes: Added Merge gate policy to shared protocol; wired orchestrator-owned Merge Gate trigger, checklist, and output contract; updated context with Gate 6 I/O and Local-only owner-merge rule.
- Open questions status: None pending for this setup slice.
- Next micro-goal: Dry-run the end-to-end Issue -> Dev PR -> Merge recommendation flow.
- Blockers/owner decisions: None for current slice.
