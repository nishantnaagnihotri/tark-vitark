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
4. If `run-id` is an orchestrator-generated identifier, it must trace back to the `run_async_subagents` call recorded in `/memories/session/active-state.md`; if `run-id: direct-invocation`, this session-memory linkage requirement is explicitly N/A.
5. Orchestrator verifies provenance completeness for every Gate 5 PR and verifies `/memories/session/active-state.md` linkage when the `run-id` is an orchestrator-generated identifier.

## Merge Gate Policy

1. Gate 6 is an orchestrator-owned decision gate for issue-level merge readiness.
2. Merge recommendation requires tests, provenance/linkage, review closure, docs/release updates when needed, and rollback note.
3. Product Owner remains the only authority who performs the actual merge.
4. If merge readiness evidence is incomplete, the PR must loop back with explicit remediation items.

## Build Gate Checklist (Orchestrator-owned)

1. Scope lock: verify implementation stayed within assigned Issue scope and architecture boundaries.
2. Issue metadata lock: verify issue includes acceptance criteria, slice path, architecture reference, and `Slice tracker:` backlink before invoking Dev.
3. BDD lock: verify each GWT scenario from `05-architecture.md` has a corresponding test, and all tests are written in domain language (not infrastructure terms).
4. Test-first lock: verify tests were written before or alongside implementation (not after). Tests must fail before implementation, pass after.
5. Domain language lock: verify code uses domain terminology and concepts (e.g., `displayBrandMessage()` not `renderDOMElement()`). Variable names, function names, and class names reflect the problem domain.
6. Verification lock: verify required test commands passed and evidence is explicit. All tests passing is mandatory.
7. PR lock: verify PR exists and includes explicit issue-closing reference and scenario-to-test mapping evidence.
8. Provenance lock: verify PR body includes a full `## Agent Provenance` block with `run-id`, `task-id`, `role`, and `dispatched` fields.
9. Risk lock: verify residual risks and rollback note are documented.
10. Approval lock: verify unresolved open questions are resolved or explicitly accepted by Product Owner.
11. Runtime QA scope lock: verify issue is classified as `UI-impacting` or `Runtime QA: Not Required` with explicit rationale.
12. Runtime QA evidence lock: for `UI-impacting` issues, verify Runtime QA Verdict Package is present with coverage matrix and findings disposition.

## Merge Gate Checklist (Orchestrator-owned)

1. Scope lock: verify PR still maps cleanly to the intended Issue and approved slice boundaries.
2. Verification lock: verify required tests passed and Build evidence remains sufficient.
3. Provenance lock: verify PR includes issue-closing keyword and a full `## Agent Provenance` block with `run-id` tracing back to session memory.
4. Review lock: verify review comments are resolved or explicitly accepted by Product Owner.
5. Copilot review loop lock: verify the latest Copilot review on the latest commit reports zero comments in its review body, including known phrasings such as **"generated 0 comments"**, **"0 new comments"**, or **"generated no new comments"**. This is the only exit condition. Historical outdated threads do not count. If the latest review still reports >0 comments, the loop must continue. `semantically-closed/tooling-unresolved` items must be reported explicitly and do not block merge unless Product Owner decides otherwise.
6. Runtime QA lock: for `UI-impacting` issues, verify latest Runtime QA verdict is `Pass`, or explicit Product Owner risk acceptance is documented via `vscode_askQuestions` (unilateral agent declaration is not valid — see `build-merge-gate-orchestration` Explicit PO Acceptance Enforcement rule).
7. Documentation lock: verify docs and release notes are updated when applicable.
8. Rollback lock: verify rollback note is documented and feasible.
9. Risk acceptance lock: verify residual risks are visible and explicitly accepted when required.

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
6. For UI-impacting issues, runtime QA verdict is `Pass` or Product Owner has explicitly accepted residual runtime risk via `vscode_askQuestions` in the current session (unilateral agent declaration is not valid).
