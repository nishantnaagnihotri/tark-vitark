# Shared Agent Protocol

This repository follows a human-led, agent-executed workflow.

## Authority Model

1. Product Owner (human) owns product vision, priority, scope, and final decisions.
2. Agents prepare drafts, recommendations, and implementation artifacts.
3. Product Owner personally reviews and merges pull requests.

## Core Rules

1. Work one implementation slice at a time (WIP limit: 1).
2. Use part-time session mode: one micro-goal per session.
3. Close each session with a short checkpoint: done, next, blockers.
4. Keep changes small and reversible.

## Required Gates

1. Requirement challenge gate must pass before PRD freeze.
2. PRD drafting uses Requirement Context Package and must pass PRD quality gate before PRD freeze.
3. Gate 2 (PRD) must preserve Gate 1 intent: no silent reinterpretation of requirement statement, scope boundaries, or acceptance criteria.
4. Design freeze must happen before coding. Gate 3 is the full design gate and includes UX, Figma, and Design QA substeps.
5. Design artifact is mandatory for every UX task: each Gate 3A UX output must include a Figma or Penpot artifact reference (file URL or file key) before progression.
6. UX Agent must run an internal challenge phase before producing UX flow/state artifacts: all `Must Resolve` UX gaps must be addressed or accepted by Product Owner before Gate 3A can pass.
7. Architecture signoff must happen before coding.
8. Architecture Agent must run an internal challenge phase before producing any architecture output: all `Must Resolve` architecture gaps must be addressed or accepted by Product Owner before Gate 4 can pass.
9. Architecture Agent must run a Discussion Phase before freezing the plan: key technical decision points across System Design, Solution Architecture, and Implementation Design (e.g., system and service boundaries, data flows and contracts, integration patterns, file/module structure, and cross-cutting concerns) must be surfaced, discussed with Product Owner, and confirmed before the full plan is written. Vague architectural plans are not accepted.
10. Merge requires passing tests, review closure, docs update, and rollback note.

## Requirement-To-PRD Alignment Protocol

1. `01-requirement.md` is the source contract for Gate 2 and must be treated as immutable input during PRD drafting.
2. Requirement statement, in-scope/out-of-scope boundaries, and AC IDs (AC-1..AC-N) must carry forward unchanged unless Product Owner explicitly approves a change.
3. PRD must include a Requirement-to-PRD Alignment Check section showing one-to-one mapping from requirement IDs to PRD sections and user stories.
4. If PRD introduces new scope, changed wording, or rewritten AC intent without explicit owner decision, Gate 2 must loop back.
5. Templates should only be filled after requirement refinement is complete: no unresolved placeholders in Gate 1 output except explicitly accepted open questions.

## Environment Routing

1. Draft anywhere, decide and verify in Local.
2. Local is preferred for requirement challenge and required for all Gate 3 design substeps; cloud is preferred for PRD drafts and Gate 5 Dev first-pass code + PR drafts.
3. Local is mandatory for final integration checks and merge readiness.
4. Copilot CLI is used for command-heavy scaffolding and repetitive transformations.

## Terminal Mutation Override Policy

1. Default orchestrator terminal behavior remains diagnostics-first.
2. If Product Owner explicitly requests mutation (for example `git add`, `git commit`, `git push`, branch creation, or PR creation), orchestrator may execute those commands.
3. Allowed mutations must stay narrowly scoped to the approved task and referenced files.
4. Destructive commands (`git reset --hard`, force-push, history rewrite, mass deletion) remain disallowed unless Product Owner gives explicit command-level approval for that exact operation.
5. Orchestrator must summarize intended commands before execution and record the decision in orchestration context updates.
6. PR merge commands (for example `gh pr merge` or any equivalent merge operation) are never executed by any agent. PR merges are always performed by the Product Owner directly (via GitHub UI or their own tooling). This is not a delegatable mutation.

## Cloud Handoff Policy

1. Before any cloud-preferred gate handoff, Architect + Orchestrator must ask Product Owner to confirm `local` or `cloud` execution mode.
2. If `cloud` is chosen, Orchestrator provides a manual handoff prompt and pauses progression until return artifact is pasted.
3. Gate progression resumes only after returned artifact is validated in Local context.
4. Gate 3 design work is local-only and does not use cloud handoff.
5. Gate 5 build work defaults to GitHub Copilot cloud Dev execution; local execution is allowed only via explicit Product Owner override for a specific Issue.

## Handoff Contract Format

Every handoff should include:

1. Context: objective, scope, constraints.
2. Inputs: files, requirements, acceptance criteria.
3. Output expected: concrete artifact format.
4. Done criteria: objective conditions to accept output.
5. Risks and assumptions: explicit, testable, and reviewable.

## Decision Challenge Standard

Before accepting major owner decisions (scope, sequencing, architecture tradeoffs, gate bypass requests, or timeline-risk swaps), agents must:

1. Present at least two viable alternatives, including a conservative option.
2. State tradeoffs explicitly: delivery speed, quality risk, rework risk, and operational impact.
3. Recommend one option with clear rationale.
4. Confirm final owner choice and record it in orchestration context.

This standard exists to support balanced decision-making and must be applied even when the owner has a preferred direction.

## Strict Accept-vs-Challenge Lens

1. Every suggestion, review comment, or proposed change must be explicitly classified as: `Accept`, `Challenge`, or `Needs Product Owner Decision`.
2. Agents must not accept feedback blindly. Each accepted item must include concise reasoning.
3. Challenged items must include clear rationale and a safer or more aligned alternative.
4. If feedback conflicts with approved protocol, prior owner decisions, or slice scope, the agent must pause and request explicit Product Owner approval before changing course.
5. Final disposition and rationale must be recorded in the relevant output (PR reply, handoff, or context update).
6. When fixing a review comment, agents must also post a review response that explains their position: what was accepted or challenged, what changed (or why no change), and the rationale/tradeoff.

## Escalation

Escalate to Product Owner when:

1. Requirement readiness is blocked.
2. Scope, security, or architecture tradeoffs need human choice.
3. Test and review findings conflict with delivery timeline.

## Artifact Storage Model

1. Each approved gate output is persisted as a versioned markdown file under `docs/slices/<slice-name>/`.
2. Orchestrator is responsible for creating the slice folder and writing gate artifacts after each gate passes.
3. File naming convention:
   - `01-requirement.md` — Requirement Context Package (Gate 1)
   - `02-prd.md` — PRD Draft Package (Gate 2)
   - `03-ux.md` — UX Flow/State Package (Gate 3A), including mandatory design artifact reference (Figma or Penpot file URL or key)
   - `04-design-qa.md` — Design QA Verdict Package (Gate 3C; includes Figma design reference)
   - `05-architecture.md` — Architecture Plan (Gate 4)
   - `06-tasks.md` — Task breakdown with GitHub Issue numbers (Gate 4 end)
4. GitHub Issues for coding tasks are created by the orchestrator at the end of Gate 4, after the architecture plan is approved.
5. Each Issue must include acceptance criteria, slice folder path, and relevant architecture section reference.
6. Coder agents at Gate 5 read the Issue and linked slice folder files for full context.
7. A PR that closes the Issue is the unit of completion for each coding task.

## Slice and Story Maintenance Protocol

1. Every slice must exist in both places:
   - Repo artifacts under `docs/slices/<slice-name>/` with `01` through `06` files.
   - GitHub slice tracker issue titled `[Slice] <slice-name>`.
2. Slice tracker issue must use label `slice` and include:
   - Slice folder path.
   - Links to `01` through `06` artifacts.
   - A section listing all user stories (issue links).
3. Every user story must be one GitHub issue and use labels `user-story` and `slice:<slice-name>`.
4. Story issues must include:
   - Story objective and acceptance criteria that define boundaries clearly.
   - Acceptance criteria (mapped to PRD AC IDs).
   - Slice artifact folder path.
   - Architecture section reference.
   - `Slice tracker:` section with issue link.
5. Bidirectional traceability is mandatory:
   - Slice tracker lists all story issues.
   - Each story links back to the slice tracker.
   - `06-tasks.md` lists all story issues and references architecture sections.
6. Build/merge progression is blocked if any traceability link above is missing.
7. Closed slices keep their slice tracker issue (typically closed) as audit history; links must remain intact.

## Implementation Protocol (Test-First BDD + Domain-Oriented Development)

1. **Test-First Development (TFD):** Tests are written before implementation code. Tests fail first, implementation makes them pass.
2. **Behavior Driven Development (BDD):** Each acceptance criterion (AC-N) has exactly one Given-When-Then (GWT) scenario.
   - **Given:** The precondition (domain state, data, user context)
   - **When:** The action or event (what the user does, what the system triggers)
   - **Then:** The expected outcome (assertion that verifies the behavior)
3. **GWT Scenarios in Architecture:** At Gate 4, `05-architecture.md` includes a BDD section with all GWT scenarios (one per AC). These scenarios become the contract between architecture and developer.
4. **Domain-Oriented Code:** Implementation uses domain language and concepts, not infrastructure terms.
   - Names reflect the problem domain, not the tech stack.
   - Variables, functions, classes use domain vocabulary (e.g., `displayBrandMessage()` not `renderDOMElement()`).
   - Tests read as domain behavior specifications, not technical implementation details.
5. **Test Implementation:** Developer converts each GWT scenario into an executable test (unit, integration, or e2e).
   - Test structure mirrors GWT: given-when-then or arrange-act-assert.
   - Test names read as domain behavior (e.g., `test: SplashPage displays brand name when loaded`).
6. **Code Quality Gate:** PR evidence must include:
   - All GWT scenarios from `05-architecture.md` mapped to tests.
   - All tests passing (automated test results required).
   - Code review sign-off confirming domain language clarity.
   - Rollback note (how to undo if issues arise).
7. **Orchestrator Validation:** Build gate checklist includes BDD evidence verification (test-to-scenario mapping, passing results, domain clarity).

## Figma File Structure Convention

1. **One Figma file per slice.** Each slice gets its own Figma file under the designated Figma project (see `.github/orchestrator-context.md` → Figma Project Metadata), named after the slice (e.g., "Coming Soon Splash Page").
2. **Standard page structure within each file:**
   - Page 1: `UX Flows` — wireframes and flow diagrams (UX Agent output).
   - Page 2: `Design` — final screens, states, and variants (Figma Agent output).
   - Page 3: `QA Notes` — annotations for Design QA review.
3. **Frame naming convention:** `<Screen>/<State>` (e.g., `Home/Default`, `Home/Loading`, `Home/Error`).
4. **Enhancement slices are self-contained.** When a slice enhances an existing screen, the Figma Agent reads the most recent Figma file for that screen (referenced from the relevant prior slice's `03-ux.md` or `04-design-qa.md`), recreates the current-state screen in the new slice's file, then applies the enhancement. The new file shows the complete post-enhancement screen, not a diff. The previous slice's file is not modified.
5. **Artifact reference storage:** The Figma file URL or key is recorded in `03-ux.md` and `04-design-qa.md` for each slice. Enhancement slices must also reference the prior slice's Figma file as the baseline source.
6. **No shared master file required.** If a "current state" reference file becomes needed later, it can be added without restructuring existing slice files.

## Figma Fidelity Policy

1. For any task requiring Figma parity, agents must extract and apply frame-level values from Figma as source of truth before visual polish passes.
2. Required extracted values include layout coordinates, dimensions, spacing, typography, colors, gradients, radii, shadows, blur/effects, and breakpoint-specific variants.
3. Screenshot-only approximation is not sufficient when extractable frame values are available.
4. Responsive implementations must map each approved Figma frame to explicit breakpoint rules.
5. PR evidence for Figma-parity tasks must include frame-to-code traceability and list any intentional deviations with Product Owner approval status.

## PR Provenance Convention

1. Every Gate 5 PR must include an issue-closing keyword in the PR body (for example: `Closes #123`).
2. Every Gate 5 PR must include a provenance marker in the PR body: `Execution-Agent: dev`.
3. Orchestrator must verify both linkage and provenance before recommending progression from Build to Merge gate.

## Merge Gate Policy

1. Gate 6 is an orchestrator-owned decision gate for issue-level merge readiness.
2. Merge recommendation requires: passing tests, PR provenance/linkage, review closure, docs or release-note updates when applicable, and a documented rollback note.
3. Product Owner remains the only authority who performs the actual merge.
4. If merge readiness evidence is incomplete, the PR must loop back with explicit remediation items.
