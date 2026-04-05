<!-- Protocol-Version: 2.1 -->
<!-- Last-Updated: 2026-04-05 -->

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

## Protocol Reuse Policy

1. This file is the canonical source for shared cross-agent rules.
2. Agent files under `.github/agents/` must reference shared sections in this file instead of duplicating full text.
3. Agent files should only define role-specific constraints, inputs, and outputs.

## Slice Complexity Classification

Applied by orchestrator at Gate 1 intake. Product Owner confirms classification.

| Level | Description | Example | Gate Flow |
|---|---|---|---|
| Trivial | Static content, copy change, config-only update | Splash page, copy update, favicon | Gate 1 (lightweight) -> Gate 5 -> Gate 6 |
| Standard | Single-module UI feature, no API | Form, component, page with logic | Full 6-gate flow. Architecture focuses on Implementation Design first. |
| Complex | Multi-module, API integration, data/infrastructure changes | Auth flow, checkout, dashboard | Full 6-gate flow with full architecture depth. |

Classification criteria:

1. Trivial: no new module boundaries, no state-management changes, no integration points, and no design-system expansion.
2. Standard: meaningful UI or module logic in one bounded area.
3. Complex: cross-module boundaries, APIs, data models, or infrastructure impact.

Product Owner may override classification at any time.

## Required Gates

1. Requirement challenge gate must pass before PRD freeze for Standard and Complex slices.
2. PRD drafting uses Requirement Context Package and must pass PRD quality gate before PRD freeze (Standard and Complex slices; Trivial slices skip Gate 2).
3. Gate 2 (PRD) must preserve Gate 1 intent: no silent reinterpretation of requirement statement, scope boundaries, or acceptance criteria.
4. Design freeze must happen before coding for Standard and Complex slices. Gate 3 includes UX, Figma, and Design QA substeps.
5. Design artifact is mandatory for every UX task: each Gate 3A UX output must include a Figma artifact reference (file URL or file key) before progression.
6. UX Agent must run an internal challenge phase before producing UX flow/state artifacts: all `Must Resolve` UX gaps must be addressed or accepted by Product Owner before Gate 3A can pass.
7. Architecture signoff must happen before coding for Standard and Complex slices.
8. Architecture Agent must run an internal challenge phase before producing any architecture output: all `Must Resolve` architecture gaps must be addressed or accepted by Product Owner before Gate 4 can pass.
9. Architecture Agent must run a Discussion Phase before freezing the plan: key technical decisions across System Design, Solution Architecture, and Implementation Design must be surfaced, discussed with Product Owner, and confirmed before the full plan is written.
10. Merge requires passing tests, review closure, docs update when applicable, and rollback note.

## Architecture Reference Documents

1. Architecture discussion topics are maintained in `.github/references/architecture-discussion-topics.md`.
2. Architecture quality checks and package schema are maintained in `.github/references/architecture-quality-checks.md`.
3. Architecture and orchestrator agents reference these documents instead of duplicating large checklists.

## Requirement-To-PRD Alignment Protocol

1. `01-requirement.md` is the source contract for Gate 2 and must be treated as immutable input during PRD drafting.
2. Requirement statement, in-scope/out-of-scope boundaries, and AC IDs (AC-1..AC-N) must carry forward unchanged unless Product Owner explicitly approves a change.
3. PRD must include a Requirement-to-PRD Alignment Check section showing one-to-one mapping from requirement IDs to PRD sections and user stories.
4. If PRD introduces new scope, changed wording, or rewritten AC intent without explicit owner decision, Gate 2 must loop back.
5. Templates should only be filled after requirement refinement is complete: no unresolved placeholders in Gate 1 output except explicitly accepted open questions.

## Environment Routing

1. Default execution mode is Local for all gates.
2. Product Owner may opt a specific gate invocation into cloud mode by explicitly requesting cloud execution.
3. Gate 3 design work is always local-only.
4. Final verification and merge readiness decisions are always local.

## Terminal Mutation Override Policy

1. Default orchestrator terminal behavior remains diagnostics-first.
2. If Product Owner explicitly requests mutation (for example `git add`, `git commit`, `git push`, branch creation, or PR creation), orchestrator may execute those commands.
3. Allowed mutations must stay narrowly scoped to the approved task and referenced files.
4. Destructive commands (`git reset --hard`, force-push, history rewrite, mass deletion) remain disallowed unless Product Owner gives explicit command-level approval for that exact operation.
5. Orchestrator must summarize intended commands before execution and record the decision in orchestration context updates.
6. PR merge commands (for example `gh pr merge` or any equivalent merge operation) are never executed by any agent. PR merges are always performed by the Product Owner directly.

## GitHub Interaction Policy

1. For GitHub repository, issue, pull request, review, comment, label, and status interactions, agents must use the GitHub MCP server as the primary and required interface.
2. Agents must not rely on `gh`, raw GitHub API terminal calls, or editor-cached GitHub payloads when an equivalent GitHub MCP capability exists.
3. Local git commands remain allowed for repository-local branch, commit, diff, and workspace inspection tasks that are not GitHub API interactions.
4. If a required GitHub action is not available through the GitHub MCP server, the agent must explicitly state the MCP gap and request Product Owner approval before using any fallback path.

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

Before accepting major owner decisions (scope, sequencing, architecture tradeoffs, gate bypass requests, or timeline-risk swaps), agents must:

1. Present at least two viable alternatives, including a conservative option.
2. State tradeoffs explicitly: delivery speed, quality risk, rework risk, and operational impact.
3. Recommend one option with clear rationale.
4. Confirm final owner choice and record it in orchestration context.

The orchestrator challenges Product Owner decisions with alternatives and tradeoffs. This applies directly to scope, sequencing, architecture, and risk posture. For domain-specific design decisions, the orchestrator may still challenge for clarity, ask tradeoff questions, and surface concerns, but must route origination of design alternatives to the UX Agent per the Domain Ownership Policy.

## Domain Ownership Policy

No agent may perform work owned by another agent's domain. Each agent executes only within its own domain and delegates cross-domain tasks to the owning agent via the orchestrator.

### Universal Rules (all agents)

1. **Figma write operations:** ALL Figma MCP write operations (creation, editing, restructuring, alignment, variable/binding changes — regardless of size) route through Figma Agent. No other agent uses Figma write tools directly.
2. **Figma read access:** Agents whose domain requires Figma data (UX Agent, Design QA Agent, Dev Agent) may use Figma MCP read-only operations (screenshots, metadata, design context) for their own domain work. The orchestrator may not use Figma MCP tools at all.
2. **Design proposals:** Visual and UX alternatives (layout options, component shapes, interaction patterns, label strategies) are UX Agent-owned. Other agents may challenge for clarity but do not originate design proposals.
3. **Artifact updates:** Each gate artifact's content is authored only by its owning agent. PRD changes → PRD Agent. UX changes → UX Agent. Design QA changes → Design QA Agent. Architecture changes → Architecture Agent. No agent edits another agent's gate artifact content. (The orchestrator may mechanically persist/commit an owning agent's output to the slice folder — this is not a content edit.)
4. **No threshold exception:** There is no "small change" threshold below which cross-domain direct action is acceptable. Even minor tweaks route through the owning agent.
5. **Escalation path:** If an agent identifies a needed change outside its domain, it reports the gap to the orchestrator, who routes to the owning agent. Agents do not self-serve across boundaries.

### Orchestrator-Specific Rules

6. **Orchestrator scope:** Supervise agents, enforce gates, challenge Product Owner for clarity, decide general direction, facilitate discussion between Product Owner and agent team. Route domain work — don't execute it.
7. **No Figma tools:** Orchestrator never uses Figma MCP tools directly — all Figma operations route through Figma Agent.
8. **No design origination:** Orchestrator does not originate visual or UX design proposals. Route design questions to UX Agent.
9. **No artifact editing:** Orchestrator does not directly edit gate-owned artifacts (`01-requirement.md`, `02-prd.md`, `03-ux.md`, etc.). Route updates through the owning agent.

## Strict Accept-vs-Challenge Lens

1. Every suggestion, review comment, or proposed change must be explicitly classified as: `Accept`, `Challenge`, or `Needs Product Owner Decision`.
2. Agents must not accept feedback blindly. Each accepted item must include concise reasoning.
3. Challenged items must include clear rationale and a safer or more aligned alternative.
4. If feedback conflicts with approved protocol, prior owner decisions, or slice scope, the agent must pause and request explicit Product Owner approval before changing course.
5. Internal triage may classify an item as `Challenge`, but the agent must first discuss that challenge with the Product Owner, get explicit agreement on the external position, and only then post the agreed `Challenge` reply on the PR thread.
6. Final disposition and rationale must be recorded in the relevant output (PR reply, handoff, or context update).
7. When fixing a review comment, agents must also post a review response that explains their position: what was accepted or challenged, what changed (or why no change), and the rationale/tradeoff.
8. After an `Accept` or fully-executed `Challenge` disposition is completed, the agent must resolve the review thread when no Product Owner decision or reviewer follow-up remains.

## PR Review Intake Protocol

1. Before summarizing PR feedback, offering to fix it, or editing code/docs, the agent must first enumerate each actionable review comment and classify it as `Accept`, `Challenge`, or `Needs Product Owner Decision`.
2. Each classification must include concise reasoning tied to scope, correctness, protocol alignment, or readability.
3. Only after this triage step is complete may the agent propose or implement changes.
4. If the user asks what comments exist on a PR, the response must include both the comment summary and the disposition for each actionable item.
5. If the agent skips this sequence, that is a workflow failure and must be corrected before changes proceed.
6. Review-state definitions:
   - `semantic-open`: the comment has no executed disposition yet, still needs Product Owner or reviewer follow-up, or the accepted/challenged path is not fully executed.
   - `semantic-closed`: the `Accept` or fully-executed `Challenge` disposition is complete and no Product Owner or reviewer follow-up remains.
   - `semantically-closed/tooling-unresolved`: the comment is semantically closed, but the thread cannot be marked resolved because the required MCP mutation capability is unavailable.

## Copilot Review Loop Protocol

1. Immediately after creating a PR, the agent must request Copilot review on that PR and begin the bounded polling window.
2. After pushing a commit that addresses PR feedback, the agent must request a fresh Copilot review on that PR before considering the review cycle complete.
3. Once an active PR review loop has started, the agent must continue it automatically after each push and review request; it must not pause for another Product Owner prompt unless a blocker, protocol conflict, missing capability, or explicit owner-decision point is reached.
4. Historical Copilot review records may remain on the PR; success is defined as zero `semantic-open` Copilot comments or threads, not zero total Copilot reviews.
5. Each new Copilot comment must go through the PR Review Intake Protocol before any additional changes are proposed or made.
6. If the loop cannot continue because of a challenge, protocol conflict, or missing capability, the agent must pause, discuss the issue with the Product Owner, and proceed only with the agreed position.
7. After requesting a fresh Copilot review, the agent must poll the live GitHub PR state for a bounded window before concluding the result is pending. Default polling window: up to 5 minutes at a practical cadence.
8. Polling must use live GitHub MCP review data as the source of truth rather than relying on cached editor extension payloads.
9. When a non-MCP polling fallback is used, prefer `python3 scripts/wait_for_copilot_review.py --owner <owner> --repo <repo> --pr <number>`.
10. Review threads should normally be resolved as part of disposition execution.
11. If no new Copilot review arrives within the bounded polling window, the agent must report that the loop is blocked on external async review completion.
12. If a thread still remains outdated and unresolved after disposition execution, the agent must reconcile that thread state before declaring the loop complete, or explicitly record it as `semantically-closed/tooling-unresolved` when MCP lacks the required resolution capability.

## Recovery Protocol

### Partial Gate Artifact

1. If an agent fails mid-gate and a partial artifact is written to `docs/slices/<slice-name>/`, do not advance gate status.
2. Mark the artifact with `STATUS: INCOMPLETE` at the top.
3. Re-invoke the same agent with the same inputs and overwrite the incomplete artifact.
4. If re-invocation fails twice, escalate to Product Owner for manual intervention.

### Figma MCP Failure

1. If a Figma MCP call fails, retry once.
2. If retry fails, report the MCP error to Product Owner and pause gate progression.
3. Do not fall back to screenshot-only approximation without explicit Product Owner approval.

### Copilot Review Poll Timeout

1. If the bounded polling window times out, report `status: timeout` and pause.
2. If timeout occurs three consecutive times for the same PR, escalate with options: extend wait, accept current review state, or investigate service status.
3. Do not silently skip the review loop.

### Config File Validation

On resume, before any Gate 3 or later work:

1. Validate that `.figma-config.local` exists and is parseable as key-value configuration.
2. Before the first Gate 3 bootstrap, require `project_name` and `plan_key`. `design_system_library_file_key` may be absent or empty at this stage and must not block the first Gate 3 bootstrap.
3. After the first Gate 3 bootstrap, require `design_system_library_file_key` to be present and non-empty.
4. If any key that is required for the current stage is missing, empty, or malformed, report the gap and block Gate 3 progression until resolved.

## Escalation

Escalate to Product Owner when:

1. Requirement readiness is blocked.
2. Scope, security, or architecture tradeoffs need human choice.
3. Test and review findings conflict with delivery timeline.

## Protocol Versioning

1. Keep protocol metadata at top of this file:
   - `Protocol-Version`
   - `Last-Updated`
2. Bump protocol version whenever a shared rule is added, changed, or removed.
3. Include protocol version in gate-critical output packages where applicable.

## Artifact Storage Model

1. Each approved gate output is persisted as a versioned markdown file under `docs/slices/<slice-name>/`.
2. Orchestrator is responsible for creating the slice folder and writing gate artifacts after each gate passes.
3. File naming convention:
   - `01-requirement.md`
   - `02-prd.md`
   - `03-ux.md`
   - `04-design-qa.md`
   - `05-architecture.md`
   - `06-tasks.md`
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
4. Story issues must include objective, acceptance criteria, slice path, architecture section reference, and `Slice tracker:` backlink.
5. Bidirectional traceability is mandatory.
6. Build and merge progression is blocked if required traceability links are missing.

## Domain Language Policy

All agents use domain language — not framework, infrastructure, or implementation vocabulary — in every artifact, from requirement through code.

1. **Glossary origin:** At Gate 1, the requirement-challenger produces a Domain Glossary (5–15 canonical terms) as part of the Requirement Context Package. Product Owner confirms the glossary before Gate 1 closes.
2. **Downstream binding:** Every agent from Gate 2 onward must use only glossary terms when referring to domain concepts in artifacts. If a new domain concept emerges, the agent flags it for glossary addition via orchestrator (routed back to requirement-challenger or Product Owner).
3. **Figma binding:** Figma layer names, component names, and frame names use glossary terms (e.g., `ArgumentCard/Tark/Light` not `Frame 47` or `Card Component`).
4. **Architecture binding:** At Gate 4, the architecture agent maps each glossary term to its code identifier (function name, class name, CSS class, variable). This mapping lives in `05-architecture.md`.
5. **Code binding:** Implementation code (variable names, function names, class names, CSS custom properties) uses glossary-derived identifiers. Infrastructure terms (`div`, `span`, `render`, `component`) appear only in framework-required positions, never in domain-facing names.
6. **Validation:** Each gate checks that the output artifact uses glossary terms consistently. Non-glossary domain terms are flagged as quality gaps.

## Implementation Protocol (Test-First BDD + Domain-Oriented Development)

1. Tests are written before implementation code whenever feasible.
2. Each acceptance criterion (AC-N) has exactly one Given-When-Then scenario.
3. At Gate 4, `05-architecture.md` includes a BDD section with all GWT scenarios.
4. Implementation and tests use domain language (per Domain Language Policy) rather than infrastructure vocabulary.
5. PR evidence must include scenario-to-test mapping, passing tests, and rollback note.

## Figma File Structure Convention

1. One Figma file per slice under the designated project in `.figma-config.local`.
2. Standard page structure: `UX Flows`, `Design`, `QA Notes`.
3. Frame naming convention: `<Screen>/<State>/<Theme>`.
4. Enhancement slices are self-contained and reference prior slice files as baseline.
5. Figma file URL or key is recorded in `03-ux.md` and `04-design-qa.md`.

## Design System Foundation Policy

1. The Design System uses a dedicated Figma library file.
2. If the library does not exist, first Gate 3 run bootstraps it and records `design_system_library_file_key` in `.figma-config.local`.
3. Variables use categories: `color/*`, `spacing/*`, `typography/*`, `radius/*`, `shadow/*`, `breakpoint/*`.
4. Theme collection must provide Light and Dark modes from day one.
5. Slice designs must use library variables only.
6. Every screen and state must provide Light and Dark variants.
7. Canonical code-side token file path is `src/styles/tokens.css`. It must define both theme variants using `[data-theme]` selectors plus `prefers-color-scheme` fallback. Slice CSS files import this token file.
8. Figma variable names map 1:1 to CSS custom properties.
9. Design QA must enforce token compliance.
10. New shared tokens/components are added to the library first.
11. `.figma-config.local.example` is the committed schema reference for local `.figma-config.local` files.

## Figma Fidelity Policy

1. For Figma-parity tasks, extract and apply frame-level values from Figma as source of truth.
2. Screenshot-only approximation is insufficient when extractable frame values are available.
3. Responsive implementations map approved Figma frames to explicit breakpoints.
4. PR evidence must include frame-to-code traceability and intentional deviations.

## Accessibility Baseline

1. All screens must meet baseline accessibility by default: semantic HTML, keyboard navigation, sufficient color contrast (WCAG 2.1 AA), and appropriate ARIA attributes.
2. Accessibility is not a per-slice opt-in — it is a standing requirement for every UI deliverable.
3. Screen reader announcement order and focus management must be considered during UX and Design QA gates.

## Semantic Neutrality in Debate UI

1. Argument colors must not imply value judgment. "For" is not positive and "against" is not negative — both sides of a debate carry equal weight.
2. Tark (arguments for) uses blue tones; Vitark (arguments against) uses amber/warm tones.
3. Do not use green/red or any other color pair with inherent positive/negative connotation for debate argument differentiation.
4. This rule applies to all debate-related UI across all slices and platforms.

## PR Provenance Convention

1. Every Gate 5 PR must include an issue-closing keyword (for example, `Closes #123`).
2. Every Gate 5 PR must include `Execution-Agent: dev` in the PR body.
3. Orchestrator verifies linkage and provenance before merge recommendation.

## Merge Gate Policy

1. Gate 6 is an orchestrator-owned decision gate for issue-level merge readiness.
2. Merge recommendation requires tests, provenance/linkage, review closure, docs/release updates when needed, and rollback note.
3. Product Owner remains the only authority who performs the actual merge.
4. If merge readiness evidence is incomplete, the PR must loop back with explicit remediation items.
