---
name: gate-handoff-packet
description: "Gate handoff and decision workflow: build handoff packets, run decision hardening, handle cloud manual handoff, and use copy-paste prompts for Gate 1-6 subagent routing. Use when: routing work to another agent, preparing gate-critical owner decisions, or running cloud handoff."
---

# Gate Handoff And Decision Workflow

Use this skill to prepare high-quality handoff packets, enforce decision hardening, and apply standard copy-paste prompts across gates.

## When To Use

- Routing work to a downstream agent
- Preparing a gate-critical owner decision
- Running cloud manual handoff for a gate invocation
- Building or validating handoff packet completeness

## Cloud Handoff Policy

1. For any cloud invocation, orchestrator provides a manual handoff prompt and pauses progression until return artifact is pasted.
2. Gate progression resumes only after returned artifact is validated in local context.

## Handoff Contract Format

Every handoff should include:

1. Context: objective, scope, constraints.
2. Inputs: files, requirements, acceptance criteria.
3. Output expected: concrete artifact format.
4. Done criteria: objective conditions to accept output.
5. Risks and assumptions: explicit, testable, and reviewable.

## Decision Challenge Standard

Apply this standard (also referred to in this skill as the decision hardening protocol) before finalizing any decision that affects scope, sequencing, architecture, risk posture, or gate progression:

1. Challenge assumptions: identify hidden assumptions, dependencies, and failure modes.
2. Present alternatives: provide at least two viable options and include one conservative fallback.
3. Quantify tradeoffs: compare delivery speed, quality risk, rework risk, and operational impact.
4. Recommend explicitly: state one preferred option and why.
5. Confirm and log: capture owner choice and rationale in orchestration context updates.

The orchestrator challenges Product Owner decisions with alternatives and tradeoffs. This applies directly to scope, sequencing, architecture, and risk posture. For domain-specific design decisions, the orchestrator may still challenge for clarity, ask tradeoff questions, and surface concerns, but must route origination of design alternatives to the UX Agent per the Domain Ownership Policy.

Proceed only after step 5 is complete.

## Example PRD Handoff Message (Copy-Paste)

Use this message when invoking `prd-agent` at Gate 2:

```text
Draft PRD v0 for this slice using the Requirement Context Package below.

Requirement Context Package:
<paste full package>

Additional Product Owner updates (optional):
<new decisions/constraints, if any>

Return only:
1) PRD Readiness: Ready | Needs Clarification | Blocked
2) PRD v0
3) Requirement-to-PRD Alignment Check (explicit one-to-one mapping from Gate 1 inputs to PRD sections; highlight any owner-approved deltas)
4) Traceability Map
5) Quality Gaps
6) Open Questions (full table: ID, Question, Source, Status, Resolution - no blank Resolution fields)
7) Gate Decision: can proceed to design | must loop back
8) PRD Draft Package (for UX/design handoff)
9) PR Description (ready-to-paste GitHub PR body including: one-line PRD summary, slice folder path, gate status, open questions table with Status and Resolution columns, which unresolved questions block which future gate, artifact path)
```

Use this message when asynchronously dispatching `ux-agent` at Gate 3A:

```text
Draft UX flow and state package for this slice using the PRD Draft Package below.

PRD Draft Package:
<paste full package>

Additional Product Owner updates (optional):
<new decisions/constraints, if any>

Return only:
1) UX Readiness: Ready | Needs Clarification | Blocked
2) UX Flows
3) State Matrix
4) UI Control Contract
5) M3 Control Mapping
6) Frame Blueprint
7) DS Component Coverage Declaration
8) Component Coverage Check
9) Design Execution
10) Design Coverage Map
11) Interaction Notes
12) Quality Gaps
13) Open Questions (with owner decision status)
14) Gate Decision: can proceed to design-qa | must loop back
15) Design Artifact (mandatory Figma file URL for this UX task)
16) Design Review Access
17) UX Flow/State Package (for Design QA handoff)
18) Orchestrator Resume Packet (gate phase reached, persistence-ready summary, AC delta status, OQ resolution status, design access snapshot, exact next orchestrator action)
```

## Example Design QA Handoff Message (Copy-Paste)

Use this message when `ux-agent` invokes `design-qa-agent` at Gate 3 Substep B.

Dispatch model: `gpt-5.3-codex` via sync `runSubagent`. Exact sync `xhigh` remains a tool limitation and must be recorded honestly rather than inferred.

```text
Review the UX Flow/State Package and Figma design for this slice using the artifacts below.

UX Flow/State Package (from UX Agent — includes Figma design reference and Design Coverage Map):
<paste full package>

PRD Draft Package:
<paste full package>

Additional Product Owner updates (optional):
<new decisions/constraints, if any>

Return only:
1) Design QA Readiness: Agent-Ready | Needs Revision | Blocked
2) Figma Access Confirmation
3) PRD Traceability Review
4) UX Coverage Review
5) Component and Token Consistency Review
6) Edge State Coverage Review
7) Quality Gaps (route back to ux-agent if revision needed)
8) Open Questions (with owner decision status)
9) Gate Decision: escalate to Product Owner for approval | route back to ux-agent with revision instructions
10) Design QA Verdict Package (for architecture handoff)
```

## Example Architecture Handoff Message (Copy-Paste)

Use this message when invoking `architecture-agent` at Gate 4:

```text
Draft architecture plan for this slice using the approved artifacts below.

Slice artifact folder:
docs/slices/<slice-name>/

Required artifacts:
- 01-requirement.md
- 02-prd.md
- 03-ux.md
- 04-design-qa.md

Additional Product Owner updates (optional):
<new constraints/preferences, if any>

Return only:
1) Architecture Readiness: Ready | Needs Clarification | Blocked
2) Architecture Plan
3) Impact Analysis
4) Risk and Mitigation Plan
5) Verification Strategy
6) Task Decomposition
7) Quality Gaps
8) Open Questions (with owner decision status)
9) Gate Decision: can proceed to build | must loop back
10) Architecture Plan Package (for Gate 5 issue creation)
```

## Example Dev Handoff Message (Copy-Paste)

Use this message when invoking `dev` at Gate 5:

```text
Implement one approved Gate 4 task using the issue and slice artifacts below.

Issue:
<issue-number and task title>

The issue must contain:
- acceptance criteria
- slice artifact folder path
- architecture section reference

Additional Product Owner updates (optional):
<new constraints/preferences, if any>

Return only:
1) Build Readiness: Ready | Needs Clarification | Blocked
2) Implementation Summary
3) Files Changed
4) Verification Evidence
5) PR Package (with issue-closing reference)
6) Quality Gaps
7) Open Questions (with owner decision status)
8) Gate Decision: can proceed to merge | must loop back
9) Build Output Package
```

## Example Merge Review Message (Copy-Paste)

Use this message when executing Gate 6 for one PR:

```text
Review merge readiness for the PR and issue below using Build Output Package evidence.

Issue:
<issue-number and title>

PR:
<pr-link>

Required evidence:
- Build Output Package
- issue-closing reference
- `## Agent Provenance` block
- test results
- review status
- docs/release note status
- rollback note

Return only:
1) Merge Readiness: Ready | Needs Clarification | Blocked
2) Merge Review Summary
3) Outstanding Gaps
4) Gate Decision: recommend merge | must loop back
5) Owner Action: merge PR | request fixes
```

## Example Cloud Manual Handoff Prompt (Copy-Paste)

Use this when Product Owner selects `cloud` mode for PRD drafting:

```text
Use prd-agent and draft PRD v0 for this slice.

Requirement Context Package:
<paste full package>

Additional Product Owner updates (optional):
<new decisions/constraints, if any>

Return only:
1) PRD Readiness: Ready | Needs Clarification | Blocked
2) PRD v0
3) Requirement-to-PRD Alignment Check (explicit one-to-one mapping from Gate 1 inputs to PRD sections; highlight any owner-approved deltas)
4) Traceability Map
5) Quality Gaps
6) Open Questions (full table: ID, Question, Source, Status, Resolution - no blank Resolution fields)
7) Gate Decision: can proceed to design | must loop back
8) PRD Draft Package (for UX/design handoff)
9) PR Description (ready-to-paste GitHub PR body including: one-line PRD summary, slice folder path, gate status, open questions table with Status and Resolution columns, which unresolved questions block which future gate, artifact path)
```

## Example Requirement Handoff Message (Copy-Paste)

Use this message when invoking `requirement-challenger` at Gate 1:

```text
Run requirement readiness challenge for this slice.

Requirement statement:
<describe the feature/request>

If requirement statement is missing, ask for it first, then continue with requirement detailing.

Return only:
1) Readiness: Ready | Needs Clarification | Blocked
2) Missing Information
3) Assumptions
4) Challenge Questions
5) Edge Cases
6) Proposed Acceptance Criteria
7) Domain Glossary (5-15 canonical terms with brief definitions)
8) Open Questions (with owner decision status)
9) Gate Decision: can proceed to PRD | must loop back
10) Requirement Context Package (for PRD handoff)
```

## Handoff Packet Checklist

When routing to another agent, always produce:

1. Objective.
2. Scope boundaries.
3. Inputs and references.
4. Output contract.
5. Done criteria.
6. Risk assumptions.
7. Escalation conditions.
