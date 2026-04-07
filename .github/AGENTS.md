<!-- Protocol-Version: 3.1 -->
<!-- Last-Updated: 2026-04-07 -->

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
5. Design artifact is mandatory for every UX task: each Gate 3A UX output must include a Figma artifact reference (Figma file URL) before progression. Raw file keys must never appear in git-tracked artifacts — store them only in `.figma-config.local`.
6. UX Agent must run an internal challenge phase before producing UX flow/state artifacts: all `Must Resolve` UX gaps must be addressed or accepted by Product Owner before Gate 3A can pass.
7. Architecture signoff must happen before coding for Standard and Complex slices.
8. Architecture Agent must run an internal challenge phase before producing any architecture output: all `Must Resolve` architecture gaps must be addressed or accepted by Product Owner before Gate 4 can pass.
9. Architecture Agent must run a Discussion Phase before freezing the plan: key technical decisions across System Design, Solution Architecture, and Implementation Design must be surfaced, discussed with Product Owner, and confirmed before the full plan is written.
10. Merge requires passing tests, review closure, docs update when applicable, and rollback note.

## Architecture Reference Documents

1. Architecture discussion topics are maintained in `.github/references/architecture-discussion-topics.md`.
2. Architecture quality checks and package schema are maintained in `.github/references/architecture-quality-checks.md`.
3. Architecture and orchestrator agents reference these documents instead of duplicating large checklists.

## Requirement Gate Orchestration Workflow

The full Gate 1 orchestration workflow - slice complexity classification, requirement-challenger handoff, readiness/open-question checks, and Requirement Context Package transfer - is defined in the `requirement-gate-orchestration` skill (`.github/skills/requirement-gate-orchestration/SKILL.md`). Orchestrator must follow this skill when running Gate 1 or deciding progression to PRD.

## Requirement-To-PRD Alignment Workflow

The full Requirement-to-PRD alignment workflow - Gate 1 contract freeze, one-to-one alignment evidence, template completeness rules, and Gate 2 loop-back checks - is defined in the `requirement-prd-alignment` skill (`.github/skills/requirement-prd-alignment/SKILL.md`). Agents must follow this skill when drafting PRD artifacts, validating Gate 2 readiness, or reviewing cloud-returned PRD packages.

## Design Gate Orchestration Workflow

The full Gate 3 orchestration workflow - UX/Figma/Design QA substep triggers, local-only execution constraints, validation checks, Design QA revision loop, and Product Owner approval closure - is defined in the `design-gate-orchestration` skill (`.github/skills/design-gate-orchestration/SKILL.md`). Agents must follow this skill when running Gate 3 or deciding Gate 3 progression.

## Architecture Gate Orchestration Workflow

The full Gate 4 orchestration workflow - architecture handoff trigger, local-only signoff policy, readiness/loop-back checks, and completion/traceability validation - is defined in the `architecture-gate-orchestration` skill (`.github/skills/architecture-gate-orchestration/SKILL.md`). Orchestrator must follow this skill when running Gate 4 or authorizing Build progression.

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

## Gate Handoff And Decision Workflow

The full gate handoff and decision workflow - Cloud Handoff Policy, Handoff Contract Format, Decision Challenge Standard, and copy-paste gate prompts - is defined in the `gate-handoff-packet` skill (`.github/skills/gate-handoff-packet/SKILL.md`). Agents must follow this skill when preparing handoff packets, handling cloud handoff, or running gate-critical decision hardening.

## Domain Ownership Policy

No agent may perform work owned by another agent's domain. Each agent executes only within its own domain and delegates cross-domain tasks to the owning agent via the orchestrator.

### Universal Rules (all agents)

1. **Figma write operations:** ALL Figma MCP write operations (creation, editing, restructuring, alignment, variable/binding changes — regardless of size) route through Figma Agent. No other agent uses Figma write tools directly.
2. **Figma read access:** Agents whose domain requires Figma data (UX Agent, Design QA Agent, Dev Agent, Orchestrator) may use Figma MCP only for read-only operations (screenshots, metadata, design context) for their own domain work. Even if the available MCP tool grant is broader, those agents must not invoke write operations or write-capable endpoints directly; any creation, editing, restructuring, alignment, variable/binding change, or other write need must be routed to the Figma Agent. The orchestrator uses read-only Figma MCP access for gate validation and agent output spot-checks.
3. **Design proposals:** Visual and UX alternatives (layout options, component shapes, interaction patterns, label strategies) are UX Agent-owned. Other agents may challenge for clarity but do not originate design proposals.
4. **Artifact updates:** Each gate artifact's content is authored only by its owning agent. PRD changes → PRD Agent. UX changes → UX Agent. Design QA changes → Design QA Agent. Architecture changes → Architecture Agent. No agent edits another agent's gate artifact content. (The orchestrator may mechanically persist/commit an owning agent's output to the slice folder — this is not a content edit.)
5. **No threshold exception:** There is no "small change" threshold below which cross-domain direct action is acceptable. Even minor tweaks route through the owning agent.
6. **Escalation path:** If an agent identifies a needed change outside its domain, it reports the gap to the orchestrator, who routes to the owning agent. Agents do not self-serve across boundaries.

### Orchestrator-Specific Rules

7. **Orchestrator scope:** Supervise agents, enforce gates, challenge Product Owner for clarity, decide general direction, facilitate discussion between Product Owner and agent team. Route domain work — don't execute it.
8. **No Figma writes:** Orchestrator never uses Figma MCP write operations directly — all Figma write operations route through Figma Agent. Read-only Figma MCP access (screenshots, metadata, design context) is allowed for gate validation and spot-checks per Universal Rule #2.
9. **No design origination:** Orchestrator does not originate visual or UX design proposals. Route design questions to UX Agent.
10. **No artifact editing:** Orchestrator does not directly edit gate-owned artifacts (`01-requirement.md`, `02-prd.md`, `03-ux.md`, etc.). Route updates through the owning agent.

## PR Review Workflow

The full PR review workflow — Strict Accept-vs-Challenge Lens, PR Review Intake Protocol, and Copilot Review Loop Protocol — is defined in the `pr-review-loop` skill (`.github/skills/pr-review-loop/SKILL.md`). All agents must follow that skill when creating PRs, handling review comments, or running the Copilot review loop.

## Gate Recovery And Resume Workflow

The full recovery and resume workflow - partial artifact recovery, Figma MCP failure handling, Copilot poll timeout handling, config validation on resume, and escalation - is defined in the `gate-recovery-and-resume` skill (`.github/skills/gate-recovery-and-resume/SKILL.md`). All agents must follow this skill when a gate run fails, is resumed, or is blocked by external tooling.

## Orchestrator Session And Context Lifecycle Workflow

The full orchestrator session and context lifecycle workflow - activity resume protocol, part-time session checkpoints, context update requirements, universal principle persistence, and Gate 6 log archiving - is defined in the `orchestrator-session-context-lifecycle` skill (`.github/skills/orchestrator-session-context-lifecycle/SKILL.md`). Orchestrator must follow this skill when starting/resuming sessions or maintaining `.github/orchestrator-context.md`.

## Protocol Versioning

1. Keep protocol metadata at top of this file:
   - `Protocol-Version`
   - `Last-Updated`
2. Bump protocol version whenever a shared rule is added, changed, or removed.
3. Include protocol version in gate-critical output packages where applicable.

## Slice Traceability And Issue Operations Workflow

The full slice traceability workflow - artifact persistence, slice/story issue linkage, and Gate 4 issue operations - is defined in the `slice-traceability-and-issue-ops` skill (`.github/skills/slice-traceability-and-issue-ops/SKILL.md`). Agents must follow this skill when writing `06-tasks.md`, creating/updating slice and story issues, or validating traceability before Build.

## Domain Language Policy

All agents use domain language — not framework, infrastructure, or implementation vocabulary — for domain-facing concepts in every artifact, from requirement through code. Shared design-system token taxonomies are the exception: global tokens, CSS custom properties in `src/styles/tokens.css`, and Figma variable categories may use standardized infrastructure-oriented token names such as `color/*`, `spacing/*`, `--color-*`, and `--space-*`.

1. **Glossary origin:** At Gate 1, the requirement-challenger produces a Domain Glossary (5–15 canonical terms) as part of the Requirement Context Package. Product Owner confirms the glossary before Gate 1 closes.
2. **Downstream binding:** Every agent from Gate 2 onward must use only glossary terms when referring to domain concepts in artifacts. If a new domain concept emerges, the agent flags it for glossary addition via orchestrator (routed back to requirement-challenger or Product Owner).
3. **Figma binding:** Figma layer names, component names, and frame names use glossary terms (e.g., `ArgumentCard/Tark/Light` not `Frame 47` or `Card Component`). Figma variable categories used for shared design tokens follow the token taxonomy rather than the domain glossary.
4. **Architecture binding:** At Gate 4, the architecture agent maps each glossary term to its code identifier (function name, class name, CSS class, variable). This mapping lives in `05-architecture.md`.
5. **Code binding:** Implementation code uses glossary-derived identifiers for domain-facing names (variables, functions, classes, selectors, and component-specific custom properties). Global design tokens and their CSS custom properties follow the shared token taxonomy in `src/styles/tokens.css`. Infrastructure terms (`div`, `span`, `render`, `component`) appear only in framework-required positions or in standardized token taxonomy names, never in domain-facing names.
6. **Validation:** Each gate checks that output artifacts use glossary terms consistently for domain concepts and use the standardized token taxonomy consistently for shared design tokens. Non-glossary domain terms are flagged as quality gaps.

## Build Evidence And Merge Readiness Workflow

The full build and merge readiness workflow - Implementation Protocol, PR Provenance Convention, Build/Merge checklists, and merge recommendation criteria - is defined in the `build-evidence-and-merge-readiness` skill (`.github/skills/build-evidence-and-merge-readiness/SKILL.md`). Agents must follow this skill when validating Gate 5 evidence and Gate 6 merge readiness.

## Figma File Structure Convention

Follow the `figma-governance-and-fidelity` skill (`.github/skills/figma-governance-and-fidelity/SKILL.md`) for the full file structure convention and project-placement rules.

## Design System Foundation Policy

Follow the `figma-governance-and-fidelity` skill (`.github/skills/figma-governance-and-fidelity/SKILL.md`) for design system library and token governance requirements.

## Figma Fidelity Policy

Follow the `figma-governance-and-fidelity` skill (`.github/skills/figma-governance-and-fidelity/SKILL.md`) for Figma parity and frame-to-code fidelity evidence requirements.

## Accessibility Baseline

1. All screens must meet baseline accessibility by default: semantic HTML, keyboard navigation, sufficient color contrast (WCAG 2.1 AA), and appropriate ARIA attributes.
2. Accessibility is not a per-slice opt-in — it is a standing requirement for every UI deliverable.
3. Screen reader announcement order and focus management must be considered during UX and Design QA gates.

## Semantic Neutrality in Debate UI

1. Argument colors must not imply value judgment. "For" is not positive and "against" is not negative — both sides of a debate carry equal weight.
2. Tark (arguments for) uses blue tones; Vitark (arguments against) uses amber/warm tones.
3. Do not use green/red or any other color pair with inherent positive/negative connotation for debate argument differentiation.
4. This rule applies to all debate-related UI across all slices and platforms.

