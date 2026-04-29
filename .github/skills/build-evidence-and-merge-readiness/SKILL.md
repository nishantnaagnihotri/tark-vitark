---
name: build-evidence-and-merge-readiness
description: "Build evidence and merge readiness workflow: enforce test-first BDD implementation evidence, PR provenance markers, build and merge checklists, and merge recommendation criteria. Use when: evaluating Gate 5 output, validating Gate 6 readiness, or preparing merge recommendations."
---

# Build Evidence And Merge Readiness

Use this skill to validate implementation evidence and merge readiness for Gate 5, Gate 5.5 Runtime QA, and Gate 6.

## When To Use

- Reviewing Build Output Package completeness
- Running Gate 5, Gate 5.5 Runtime QA, and Gate 6 checklists
- Validating Gate 5.5 runtime QA verdict evidence for UI-impacting issues
- Validating scenario-to-test evidence and provenance markers
- Determining merge recommendation or loop-back

## Implementation Protocol (Test-First BDD + Domain-Oriented Development)

1. Tests are written before implementation code whenever feasible.
2. Each acceptance criterion (AC-N) has exactly one Given-When-Then scenario.
3. At Gate 4, `05-architecture.md` includes a BDD section with all GWT scenarios.
4. Implementation and tests use domain language (per Domain Language Policy) rather than infrastructure vocabulary.
5. PR evidence must include scenario-to-test mapping, passing tests, and rollback note.
6. For UI-impacting issues, runtime QA evidence must include acceptance-criterion journey coverage in a live browser session with required viewport/theme matrix.

## PR Provenance Convention

Every Gate 5 PR must include an `## Agent Provenance` section in its body. The block must contain at least these required fields:

```
## Agent Provenance

run-id: <uuid or direct-invocation>
task-id: <task id or issue ref>
role: dev
dispatched: <ISO timestamp or direct-invocation>
```

A superset block injected by the orchestrator (with additional fields such as `title`, `model`, `repo`) also satisfies this requirement; dev must copy it verbatim. This `## Agent Provenance` block replaces the legacy `Execution-Agent: dev` marker everywhere provenance completeness is evaluated; `Execution-Agent: dev` alone is not provenance-complete.

1. Every Gate 5 PR must include an issue-closing keyword (for example, `Closes #123`).
2. Every Gate 5 PR must include an `## Agent Provenance` block containing at minimum `run-id`, `task-id`, `role`, and `dispatched` fields; a superset block (e.g., orchestrator-injected) also satisfies this requirement.
3. This `## Agent Provenance` block replaces the legacy `Execution-Agent: dev` marker everywhere provenance completeness is evaluated; `Execution-Agent: dev` alone is not provenance-complete.
4. If `run-id` is an orchestrator-generated identifier, it must trace back to a terminal-dispatch record in `/memories/session/active-state.md` (`## Pending Async Runs` `terminal-id` entry) and the corresponding `run-agent.ts` output/log evidence; if `run-id: direct-invocation`, this session-memory linkage requirement is explicitly N/A.
5. Orchestrator verifies provenance completeness for every Gate 5 PR and verifies `/memories/session/active-state.md` linkage when the `run-id` is an orchestrator-generated identifier.

## Merge Gate Policy

1. Gate 6 is an orchestrator-owned decision gate for issue-level task PR merge readiness.
2. Merge recommendation requires tests, provenance/linkage, review closure, docs/release updates when needed, and rollback note.
3. Product Owner remains the only authority who performs the actual merge.
4. If merge readiness evidence is incomplete, the PR must loop back with explicit remediation items.

Final slice PR rule:

1. Task PR merge readiness and final `slice/<slice-name> -> master` merge readiness are distinct checks.
2. For task PRs, runtime evidence is satisfied by issue-level Gate 5.5 verdicts.
3. For the final slice PR, runtime evidence is satisfied only by the integrated slice-level runtime QA verdict package, or explicit `Slice Runtime QA: Not Required` rationale.
4. The final slice PR may not rely on task-level Gate 5.5 verdicts alone as a substitute for integrated slice runtime evidence.
5. The final slice PR uses the same merge-evidence framework as a task PR, plus the additional integrated slice runtime QA requirement.

## Architecture Delta Protocol (Dev-owned, Gate 5)

During Gate 5 implementation, if any task:
- changes an interface contract documented in `05-architecture.md` (e.g., prop types, return types, callback signatures), or
- touches a component listed as "No changes" in `05-architecture.md`,

then the dev agent **must** append an `## Architecture Delta` section to `05-architecture.md` before opening the PR. Format:

```md
## Architecture Delta

### <Task ID> — <short title> (<date>)

**Trigger:** <brief reason the deviation was necessary>

| Item | Architecture doc says | What shipped | Justification |
|---|---|---|---|
| `ComponentName.prop` | `type A` | `type B` | <reason> |
| `OtherComponent.tsx` | No changes | Modified | <reason> |
```

Rules:
1. The original `05-architecture.md` content is **never rewritten** — the delta section is append-only.
2. The delta is not a bug report. Justified deviations are expected; they just need to be recorded.
3. If no interface contracts or "no-changes" components were touched, no delta section is needed — the dev agent explicitly states `Architecture Delta: none` in the PR description.

## Build Gate Checklist (Orchestrator-owned)

1. Scope lock: verify implementation stayed within assigned Issue scope and architecture boundaries.
2. Issue metadata lock: verify issue includes acceptance criteria, slice path, architecture reference, and `Slice tracker:` backlink before invoking Dev.
3. BDD lock: verify each GWT scenario from `05-architecture.md` has a corresponding test, and all tests are written in domain language (not infrastructure terms).
4. Test-first lock: verify tests were written before or alongside implementation (not after). Tests must fail before implementation, pass after.
5. Domain language lock: verify code uses domain terminology and concepts (e.g., `displayBrandMessage()` not `renderDOMElement()`). Variable names, function names, and class names reflect the problem domain.
6. Verification lock: verify required test commands passed and evidence is explicit. All tests passing is mandatory.
7. PR lock: verify PR exists and includes explicit issue-closing reference and scenario-to-test mapping evidence.
7a. Description accuracy lock: verify the PR body's `Files Changed` section matches `git diff --stat origin/<base-branch>` (where `<base-branch>` is the PR target branch) — every changed file must appear in the description and no file may be listed that was not changed. A mismatch is a Build Gate loop-back condition.
8. Provenance lock: verify PR body includes a full `## Agent Provenance` block with `run-id`, `task-id`, `role`, and `dispatched` fields.
9. Risk lock: verify residual risks and rollback note are documented.
10. Approval lock: verify unresolved open questions are resolved or explicitly accepted by Product Owner.
11. Runtime QA scope lock: verify issue is classified as `UI-impacting` or `Runtime QA: Not Required` with explicit rationale.
12. Runtime QA evidence lock: for `UI-impacting` issues, verify Runtime QA Verdict Package is present with coverage matrix and findings disposition.
12a. Runtime QA provenance lock: for `UI-impacting` issues, verify the issue-level Runtime QA Verdict Package is attached to the current PR head and was produced after the latest dev fix batch. If dev invoked the QA lane directly, verify the verdict is still runtime-qa-authored rather than a dev-written summary.
13. Final slice runtime QA lock: when preparing a `slice/<slice-name> -> master` PR and the slice contains UI-impacting work, verify a `Slice Runtime QA Verdict Package` is present, or `Slice Runtime QA: Not Required` is explicitly recorded with rationale.

## Merge Gate Checklist (Orchestrator-owned)

1. Scope lock: verify PR still maps cleanly to the intended Issue and approved slice boundaries.
2. Verification lock: verify required tests passed and Build evidence remains sufficient.
3. Provenance lock: verify PR includes issue-closing keyword and a full `## Agent Provenance` block with `run-id` tracing back to session memory terminal-dispatch records.
4. Review lock: verify review comments are resolved or explicitly accepted by Product Owner.
5. Copilot review loop lock: verify the latest Copilot review on the latest commit reports zero comments in its review body, including known phrasings such as **"generated 0 comments"**, **"0 new comments"**, or **"generated no new comments"**. This is the only exit condition. Historical outdated threads do not count. If the latest review still reports >0 comments, the loop must continue. `semantically-closed/tooling-unresolved` items must be reported explicitly and do not block merge unless Product Owner decides otherwise.
6. Runtime QA lock: for task PRs tied to `UI-impacting` issues, verify latest issue-level Runtime QA verdict is `Pass`, or explicit Product Owner risk acceptance is documented via `vscode_askQuestions` (unilateral agent declaration is not valid — see `build-merge-gate-orchestration` Explicit PO Acceptance Enforcement rule).
7. Final slice runtime QA lock: for the final `slice/<slice-name> -> master` PR when the slice contains UI-impacting work, verify the latest slice-level integrated Runtime QA verdict is `Pass`, or explicit Product Owner risk acceptance is documented via `vscode_askQuestions`.
8. Documentation lock: verify docs and release notes are updated when applicable.
9. Rollback lock: verify rollback note is documented and feasible.
10. Risk acceptance lock: verify residual risks are visible and explicitly accepted when required.
11. AC SSoT lock: verify `02-prd.md`, `05-architecture.md`, and `06-tasks.md` do not contain copied AC prose — they must reference AC IDs and link to the canonical `.feature` file. Flag any artifact that re-states AC text as a drift risk.
12. Architecture delta lock: if the task changed an interface contract or a previously "no-changes" component, verify `05-architecture.md` includes an appended `## Architecture Delta` section as the canonical record; the PR description may link to or summarize that delta, but is not the source of truth. If there is no architecture delta, verify the PR description includes an explicit `Architecture Delta: none` statement. Missing the required evidence is a Build Gate loop-back condition.

## Merge Gate Output Contract

1. `Merge Readiness`: Ready | Needs Clarification | Blocked.
2. `Merge Review Summary`: concise summary of evidence reviewed.
3. `Outstanding Gaps`: list of missing items before merge, if any.
4. `Gate Decision`: recommend merge | must loop back.
5. `Owner Action`: merge PR | request fixes.

## Merge Recommendation Checklist

Recommend merge only if all are true:

1. Scope stayed within approved slice.
2. Required tests passed.
3. Review issues are resolved or explicitly accepted by Product Owner.
4. Documentation and release notes are updated.
5. Rollback approach is documented.
6. For task PRs tied to UI-impacting issues, issue-level runtime QA verdict is `Pass` or Product Owner has explicitly accepted residual runtime risk via `vscode_askQuestions` in the current session (unilateral agent declaration is not valid).
7. For the final `slice/<slice-name> -> master` PR when the slice contains UI-impacting work, slice-level integrated runtime QA verdict is `Pass` or Product Owner has explicitly accepted residual runtime risk via `vscode_askQuestions` in the current session.
