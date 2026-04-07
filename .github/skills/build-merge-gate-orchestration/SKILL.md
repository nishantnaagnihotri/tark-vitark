---
name: build-merge-gate-orchestration
description: "Build and merge gate orchestration workflow: execute Gate 5 issue-based handoff, Gate 5.5 runtime QA validation, and Gate 6 local merge-readiness review; enforce readiness/loop-back checks and apply checklist contracts for progression. Use when: running Gate 5, Gate 5.5, or Gate 6, validating build/runtime evidence, or deciding merge recommendation."
---

# Build And Merge Gate Orchestration Workflow

Use this skill to run Gate 5, Gate 5.5 Runtime QA, and Gate 6 consistently from build handoff through merge recommendation.

## When To Use

- Running Gate 5 implementation handoff from orchestrator
- Running Gate 5.5 runtime QA validation for UI-impacting issues
- Validating Build Output Package readiness and progression decisions
- Running Gate 6 merge-readiness review in local context
- Applying build and merge checklist contracts before recommendation

## Build Gate Handoff Trigger

When executing Gate 5, invoke `dev` with one GitHub Issue at a time. Minimum handoff input is Issue link/number.

Pre-handoff confirmation rule:

1. Default Build execution mode is `local`.
2. If Product Owner explicitly requests `cloud` for a specific issue, provide a manual handoff prompt and wait for returned `Build Output Package`.
3. If cloud mode is not requested, continue normal local subagent invocation.

Execution rule:

1. Gate 5 is implementation-only and works one Issue at a time.
2. Issue must contain acceptance criteria, slice path, and architecture reference for issue-only handoff to proceed.
3. Final merge-readiness evidence must be validated in Local context.
4. Cloud coding is optional and owner-directed; local execution remains the default.

Proceeding rule:

1. Continue only when build result is `Build Readiness: Ready` and `Gate Decision: can proceed to merge`.
2. If open questions remain, continue only when they are explicitly marked as accepted by Product Owner.
3. Otherwise, return quality gaps to Product Owner and loop dev clarification.

Gate 5 completion rule:

1. Each Issue is complete only when code, tests, and PR package are produced.
2. PR must include explicit issue-closing reference.
3. For UI-impacting issues, Gate 5.5 Runtime QA must pass before Gate 6 progression (or Product Owner must explicitly accept residual runtime risk).
4. Gate 6 (Merge) may begin for that Issue only after required Gate 5 and Gate 5.5 checks pass.

Local-validation rule:

1. Validate build and runtime evidence (tests, issue linkage, runtime QA status/evidence (verdict package or `Runtime QA: Not Required` marker), rollback note) in Local before merge recommendation.

Build Gate Checklist (Orchestrator-owned):

1. Run the canonical checklist in `build-evidence-and-merge-readiness` (`.github/skills/build-evidence-and-merge-readiness/SKILL.md`).

## Runtime QA Substep Trigger (Gate 5.5)

When Gate 5 implementation output is ready, run Runtime QA before Gate 6 for UI-impacting issues.

Execution rule:

1. If issue scope is UI-impacting, invoke `runtime-qa` with PR link, issue reference, acceptance-criterion journey mapping, route list, expected states, test data/setup notes, and known-risk notes.
2. If issue scope is non-UI, orchestrator may mark `Runtime QA: Not Required` with explicit rationale.
3. Runtime QA execution is Local by default.

Proceeding rule:

1. Continue to Gate 6 when either:
   - `Runtime QA Verdict: Pass`, or
   - `Runtime QA: Not Required` is explicitly recorded for a non-UI issue with rationale; in this case, no runtime QA verdict is required.
2. If runtime QA runs and verdict is `Fail`, return findings to Dev and loop implementation.
3. If runtime QA runs and verdict is `Blocked`, apply `gate-recovery-and-resume` and pause progression.
4. Product Owner may explicitly accept residual runtime risk to proceed from `Fail` or `Blocked`; this must be recorded in merge evidence.

Gate 5.5 completion rule:

1. Attach one of the following to the issue/PR evidence set:
   - Runtime QA verdict package, when runtime QA was executed, or
   - explicit `Runtime QA: Not Required` marker with rationale, when the issue is non-UI.
2. Any runtime defects are either fixed and revalidated, or explicitly accepted by Product Owner.

Runtime QA Checklist (Orchestrator-owned):

1. Run the canonical runtime QA workflow in `runtime-qa-validation` (`.github/skills/runtime-qa-validation/SKILL.md`).

## Merge Gate Trigger

When executing Gate 6, perform orchestrator-owned merge readiness verification for one PR at a time using the corresponding `Build Output Package`, GitHub Issue reference, and PR evidence.

Execution rule:

1. Gate 6 is Local-only and is owned by Architect + Orchestrator.
2. Gate 6 does not implement code; it verifies merge readiness evidence and recommends merge or loop-back.
3. Product Owner is the only actor who actually merges the PR.

Proceeding rule:

1. Continue only when merge review result is `Merge Readiness: Ready` and `Gate Decision: recommend merge`.
2. If review, documentation, or rollback evidence is incomplete, return explicit remediation items and `Gate Decision: must loop back`.
3. After Product Owner merges, record the merge result in orchestration context and advance to the next Issue.

Merge Gate Checklist (Orchestrator-owned):

1. Run the canonical checklist in `build-evidence-and-merge-readiness` (`.github/skills/build-evidence-and-merge-readiness/SKILL.md`).

Merge Gate Output:

1. Follow the output contract in `build-evidence-and-merge-readiness` (`.github/skills/build-evidence-and-merge-readiness/SKILL.md`).