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

## Figma Frame Authority Rule (Gate 5)

Figma frames documented in `04-design-qa.md` are the **authoritative design source of truth** for all visual implementation decisions at Gate 5. Text specs in markdown files are secondary; Figma frames win on all visual properties.

Dev agent handoff must include:

1. GitHub Issue link (primary input).
2. Figma frame URLs with node IDs from `04-design-qa.md` — include in prompt **only if those URLs are not already present in the issue body**; when the issue already contains Figma references, the issue link alone is sufficient and inlining them is a duplication anti-pattern.
3. Statement: "Implement exact values from Figma frames. When text spec and Figma frame conflict, Figma frame wins."

Dev agent must:

1. Read Figma frames (via MCP or URL reference) to extract exact implementation values (CSS widths, spacing, color tokens) before writing code.
2. Never hardcode a visual value from a text spec if the corresponding Figma frame is accessible.
3. Record each Figma-derived value in the PR description under "Design Reference" with the source node ID.

## Git Worktree Isolation Protocol

Each dev agent task runs in an isolated `git worktree` to prevent parallel agents from sharing working-tree state.

Orchestrator must include in every dev agent handoff:

```
Git setup (required before any code changes):
  git worktree add ../worktree-<issue-number> -b <branch-name> slice/<slice-name>
  cd ../worktree-<issue-number>
```

After PR is merged, clean up:

```
  cd "$(git rev-parse --show-toplevel)"
  git worktree remove ../worktree-<issue-number>
```

Dev agent must confirm worktree setup before creating any files or making any commits.

## Parallel Build Sequencing (Multi-Issue Gates)

When Gate 4 decomposes a slice into N issues, the orchestrator must evaluate independence before choosing sequential vs parallel execution.

**Independence check (both conditions must hold for parallel execution):**

1. **File independence:** the two issues modify **different files**, OR the same file at clearly non-overlapping sections where no diff hunk touches a shared context line. Same file with overlapping hunks → sequential only.
2. **Test independence:** their test files do not share a describe/suite block in the same test file.

**Parallel execution protocol (when independence check passes):**

1. For each parallel task, launch one `run_in_terminal (mode=async)` call with staggered `--pre-sleep` to avoid simultaneous rate-limit spikes:
   ```bash
   set -a && source local.env && set +a
   npx tsx scripts/run-agent.ts --pre-sleep <0|15|30…> dev "<issue-link>" 2>&1
   ```
   Capture the terminal ID returned by each `run_in_terminal` call.
2. **Immediately** write all terminal IDs to `/memories/session/active-state.md` under `## Pending Async Runs` before any other action.
3. Arm an alarm (600 s interval, alarm skill) immediately after all terminals are launched. On each alarm wake:
   - Check `get_terminal_output <terminal-id>` for each running agent. If the terminal has exited **and** its output reports `REVIEW_CLEAN`, treat that task as done.
   - If the terminal has exited **and** its output reports `REVIEW_CLEAN_WITH_ESCALATIONS`, do **not** treat the task as done; route it to the Post-Loop Orchestrator Challenge Consolidation step and block sequencing until all escalations are resolved by PO.
   - If the terminal has exited but no review status is present, inspect the handback for errors or escalation notes and act accordingly.
   - If still running, re-arm and wait.
4. Terminal exit **combined with** `REVIEW_CLEAN` in the output is the authoritative task-done signal. `REVIEW_CLEAN_WITH_ESCALATIONS` is not a completion signal — it must remain blocked until escalations are resolved. A review status present in output before terminal exit is preliminary evidence only — wait for process exit to confirm. Dev agents run their own full review loop before returning; a PR being open is evidence of progress, not completion.
5. Validate each task PR independently (each targets `slice/<slice-name>`). After all task PRs are merged into the slice branch, open a single `slice/<slice-name> → master` PR for PO merge.

**Sequential execution (when independence check fails or issues = 1):**

1. Invoke one `dev` subagent, complete full review loop, merge, then invoke next.

**Default:** if independence is ambiguous, choose sequential. Parallel execution is an optimization, not a requirement.

## Build Gate Handoff Trigger

When executing Gate 5, invoke `dev` with one GitHub Issue at a time. Minimum handoff input is Issue link/number.

**Prompt content rule:** Do NOT inline issue body content (acceptance criteria, diffs, Figma node IDs, implementation notes) into the dev agent prompt when the issue already contains that information. The dev agent reads the issue directly. Inlining is a duplication anti-pattern that creates drift risk and violates the issue-as-single-source-of-truth principle. The only additions allowed in the prompt beyond the issue link are: PR base branch override, execution mode override (if not local), and `Orchestrator-Managed Stacked Review Mode` flag when applicable.

Pre-handoff confirmation rule:

1. Default Build execution mode is `local`.
2. If Product Owner explicitly requests `cloud` for a specific issue, provide a manual handoff prompt and wait for returned `Build Output Package`.
3. If cloud mode is not requested, continue normal local subagent invocation.

Task PR ownership rule:

1. Gate 5 task PR creation is dev-owned by default.
2. Orchestrator does not wait for or solicit a separate Product Owner PR-open confirmation before dispatching `dev` unless the handoff is explicitly marked `branch-only`, `prepare PR package only`, or `do not open PR yet`.
3. If Product Owner wants a non-default hold before PR creation for a specific issue, orchestrator must state that override explicitly in the dev handoff.

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
3. For UI-impacting issues, Gate 5.5 Runtime QA must pass before Gate 6 progression (or Product Owner must explicitly accept residual runtime risk via `vscode_askQuestions` — see Explicit PO Acceptance Enforcement rule below).
4. Gate 6 (Merge) may begin for that Issue only after required Gate 5 and Gate 5.5 checks pass.

Local-validation rule:

1. Validate build and runtime evidence (tests, issue linkage, runtime QA status/evidence (verdict package or `Runtime QA: Not Required` marker), rollback note) in Local before merge recommendation.

Build Gate Checklist (Orchestrator-owned):

1. Run the canonical checklist in `build-evidence-and-merge-readiness` (`.github/skills/build-evidence-and-merge-readiness/SKILL.md`).

## Runtime QA Substep Trigger (Gate 5.5)

When Gate 5 implementation output is ready, run Runtime QA before Gate 6 for UI-impacting issues.

Execution rule:

1. If issue scope is UI-impacting, invoke `runtime-qa` with:
   - PR link and issue reference
   - Acceptance-criterion journey mapping (AC IDs and literal AC text)
   - **Figma frame index from `04-design-qa.md`** — include the full node-ID-to-AC mapping table so the QA agent can run Figma Frame Fidelity checks against the live browser. This is mandatory for UI-impacting issues. Without it, QA can only validate against AC text and will miss Figma-vs-AC drift.
   - Route list and expected states
   - Test data/setup notes and known-risk notes
2. If issue scope is non-UI, orchestrator may mark `Runtime QA: Not Required` with explicit rationale.
3. Runtime QA execution is Local by default.

Proceeding rule:

1. Continue to Gate 6 when either:
   - `Runtime QA Verdict: Pass`, or
   - `Runtime QA: Not Required` is explicitly recorded for a non-UI issue with rationale; in this case, no runtime QA verdict is required.
2. If runtime QA runs and verdict is `Fail`, return findings to Dev and loop implementation.
3. If runtime QA runs and verdict is `Blocked`, apply `gate-recovery-and-resume` and pause progression.
4. If runtime QA runs and verdict is `AC-DELTA` (blocking): stop Gate 5.5 progression. Route the flagged AC IDs to the Orchestrator for AC writeback in `02-prd.md` (amending each affected AC to match the approved behavior). After writeback is confirmed, re-invoke `runtime-qa` and obtain a new verdict. Gate 5.5 remains open and cannot be closed until the re-run returns `Pass` or Product Owner explicitly accepts residual risk via `vscode_askQuestions`.
5. Product Owner may explicitly accept residual runtime risk to proceed from `Fail`, `Blocked`, or `AC-DELTA`; this must be recorded in merge evidence.

**Explicit PO Acceptance Enforcement (blocking):** The phrase "explicitly accept residual runtime risk" is only satisfied when the orchestrator has invoked `vscode_askQuestions` presenting the specific risk to Product Owner and received an explicit in-session confirmation. An agent unilaterally declaring "PO accepted residual runtime risk" in a gate closure summary — without a `vscode_askQuestions` call in that session — is a workflow failure and an invalid skip path. Gate 5.5 remains open and cannot be closed until either a passing verdict is attached or a `vscode_askQuestions` confirmation is on record.

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