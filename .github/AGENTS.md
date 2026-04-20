<!-- Protocol-Version: 3.19 -->
<!-- Last-Updated: 2026-04-11 -->

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
5. Avoid redundancy unless inevitable. Do not create a duplicate artifact, layer, token, file, or component if an equivalent already exists. When in doubt, check first — create second.

## Protocol Reuse Policy

1. This file is the canonical source for shared cross-agent rules.
2. Agent files under `.github/agents/` must reference shared sections in this file instead of duplicating full text.
3. Agent files should only define role-specific constraints, inputs, and outputs.

## Slice Complexity Classification

Applied by orchestrator at Gate 1 intake. Product Owner confirms classification.

| Level | Description | Example | Gate Flow |
|---|---|---|---|
| Trivial | Static content, copy change, config-only update | Splash page, copy update, favicon | Gate 1 (lightweight) -> Gate 5 -> Gate 5.5 (if UI-impacting) -> Gate 6 |
| Standard | Single-module UI feature, no API | Form, component, page with logic | Full 6-gate flow with Gate 5.5 runtime QA for UI-impacting issues. Architecture focuses on Implementation Design first. |
| Complex | Multi-module, API integration, data/infrastructure changes | Auth flow, checkout, dashboard | Full 6-gate flow with Gate 5.5 runtime QA for UI-impacting issues and full architecture depth. |

Classification criteria:

1. Trivial: no new module boundaries, no state-management changes, no integration points, and no design-system expansion.
2. Standard: meaningful UI or module logic in one bounded area.
3. Complex: cross-module boundaries, APIs, data models, or infrastructure impact.

Product Owner may override classification at any time.

## Required Gates

1. Requirement challenge gate must pass before PRD freeze for Standard and Complex slices.
2. PRD drafting uses Requirement Context Package and must pass PRD quality gate before PRD freeze (Standard and Complex slices; Trivial slices skip Gate 2).
3. Gate 2 (PRD) must preserve Gate 1 intent: no silent reinterpretation of requirement statement, scope boundaries, or acceptance criteria.
4. Design freeze must happen before coding for Standard and Complex slices. Gate 3 includes two substeps: (A) UX+Design single-pass — Orchestrator executes UX work directly using the `ux-design-execution` skill (`.github/skills/ux-design-execution/SKILL.md`) under the **single-screen-first** protocol: create the primary frame (Default/Light/Mobile) first, return it to the Product Owner for explicit approval, then create all remaining frames in a follow-up pass; (B) Design QA. There is no separate UX Agent or Figma Agent substep.
5. Design artifact is mandatory for every UX task: each Gate 3A UX output must include a Figma artifact reference (Figma file URL) before progression. Raw file keys must never appear in git-tracked artifacts — store them only in `.figma-config.local`.
6. Orchestrator must run an internal challenge phase (per `ux-design-execution` skill) before producing UX flow/state artifacts: all `Must Resolve` UX gaps must be addressed or accepted by Product Owner before Gate 3A can pass.
7. Architecture signoff must happen before coding for Standard and Complex slices.
8. Architecture Agent must run an internal challenge phase before producing any architecture output: all `Must Resolve` architecture gaps must be addressed or accepted by Product Owner before Gate 4 can pass.
9. Architecture Agent must run a Discussion Phase before freezing the plan: key technical decisions across System Design, Solution Architecture, and Implementation Design must be surfaced, discussed with Product Owner, and confirmed before the full plan is written.
10. UI-impacting implementation issues must pass the Gate 5.5 Runtime QA substep before Gate 6 progression, unless Product Owner explicitly accepts residual runtime risk.
11. Merge requires passing tests, review closure, docs update when applicable, and rollback note.
12. After Gate 3A (UX+Design single-pass) execution, orchestrator must return a Product Owner `Design Review Access Packet` with: node-targeted Figma URL(s) (include `?node-id=`), page list, key frame/state names with node IDs, pass-level change summary, and the exact review decision requested next. Packet links must prioritize runtime-preview visual frames (minimal/no QA overlays); annotated traceability frames may be included as secondary evidence links. Root file URL alone is insufficient. If node IDs are missing, loop back for clarification before claiming review-ready.

## Architecture Reference Documents

1. Architecture discussion topics are maintained in `.github/references/architecture-discussion-topics.md`.
2. Architecture quality checks and package schema are maintained in `.github/references/architecture-quality-checks.md`.
3. Architecture and orchestrator agents reference these documents instead of duplicating large checklists.

## Requirement Gate Orchestration Workflow

The full Gate 1 orchestration workflow - slice complexity classification, requirement-challenger handoff, readiness/open-question checks, and Requirement Context Package transfer - is defined in the `requirement-gate-orchestration` skill (`.github/skills/requirement-gate-orchestration/SKILL.md`). Orchestrator must follow this skill when running Gate 1 or deciding progression to PRD.

## PRD Gate Orchestration Workflow

The full Gate 2 orchestration workflow - PRD handoff trigger, local/cloud execution checks, readiness/open-question progression rules, and cloud-return validation - is defined in the `prd-gate-orchestration` skill (`.github/skills/prd-gate-orchestration/SKILL.md`). Orchestrator must follow this skill when running Gate 2 or deciding progression to Design.

## Requirement-To-PRD Alignment Workflow

The full Requirement-to-PRD alignment workflow - Gate 1 contract freeze, one-to-one alignment evidence, template completeness rules, and Gate 2 loop-back checks - is defined in the `requirement-prd-alignment` skill (`.github/skills/requirement-prd-alignment/SKILL.md`). Agents must follow this skill when drafting PRD artifacts, validating Gate 2 readiness, or reviewing cloud-returned PRD packages.

## Design Gate Orchestration Workflow

The full Gate 3 orchestration workflow - UX/Figma/Design QA substep triggers, local-only execution constraints, validation checks, Design QA revision loop, and Product Owner approval closure - is defined in the `design-gate-orchestration` skill (`.github/skills/design-gate-orchestration/SKILL.md`). Agents must follow this skill when running Gate 3 or deciding Gate 3 progression.

## Architecture Gate Orchestration Workflow

The full Gate 4 orchestration workflow - architecture handoff trigger, local-only signoff policy, readiness/loop-back checks, and completion/traceability validation - is defined in the `architecture-gate-orchestration` skill (`.github/skills/architecture-gate-orchestration/SKILL.md`). Orchestrator must follow this skill when running Gate 4 or authorizing Build progression.

## Build And Merge Gate Orchestration Workflow

The full Gate 5, Gate 5.5 Runtime QA, and Gate 6 orchestration workflow - issue-based Build handoff, runtime QA validation, local merge-review execution, readiness/loop-back rules, and checklist/output validation - is defined in the `build-merge-gate-orchestration` skill (`.github/skills/build-merge-gate-orchestration/SKILL.md`). Orchestrator must follow this skill when running Gate 5, Gate 5.5 Runtime QA, and Gate 6 decisions.

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

## Owner Question Protocol

1. All questions directed to the Product Owner must be presented using the VS Code `vscode_askQuestions` tool. Plain inline text questions are not permitted when a tool-based question can be asked.
2. Every `vscode_askQuestions` call must keep `allowFreeformInput: true` (the default — must never be overridden to false).
3. **Context in chat, choices in the tool.** Before invoking `vscode_askQuestions`, print the elaborated context, tradeoffs, and recommendation in the chat message. The tool call itself contains only concise choice labels — not the full explanation. The `question` field in the tool is a short one-line prompt only.
4. The `header` must be a short unique identifier (3–6 words). Batch related decisions into a single `vscode_askQuestions` call.
5. **Always mark one option as `recommended: true`** — the option the agent would choose given available information. The only exception is when all options are genuinely cost-equivalent with no clear recommendation; in that case, explicitly note in the chat context why no recommendation is given.
6. Cross-ref: `orchestrator-context.md` Known Rule #69 and #72.

## Figma Canvas Layout Protocol

1. Design page frames are organized in horizontal journey rows following the UX-defined user flow sequence.
2. Within each journey row (left to right, 100px horizontal gap): Light/Mobile → Dark/Mobile → Light/Desktop → Dark/Desktop.
3. Journey row vertical gap: 300px minimum from the bottom of the tallest frame in a row to the top of the next row.
4. First journey row origin: x=0, y=0. Subsequent rows stack downward. y-coordinate for each new row = y_start of previous row + previous row max height + 300.
5. Baseline-lock frames occupy a dedicated Baseline Zone: x≥1200 (or ≥1000px right of the last design frame column), y=0, labeled with a text node `_label/baseline-zone`. Baseline frames are named with the `_baseline/` prefix to distinguish them from active design frames of the same state name.
6. Stale or unrecognized frames are always reported as QGs by the Orchestrator — never silently left in place or deleted without Product Owner confirmation.
7. Orchestrator must read current frame positions and heights via MCP before computing any new row coordinates. No hardcoded y values in handoff prompts.
8. Cross-ref: `orchestrator-context.md` Known Rule #75.

## PO Actionable Link Policy

1. Every message that requires a Product Owner action (publish, review, approve, merge, navigate, or any other step PO must perform) must include a direct clickable URL to the exact destination — no searching, no raw keys, no vague references.
2. **Figma files:** always `https://www.figma.com/design/<file-key>` — never a raw file key alone.
3. **GitHub issues:** always `https://github.com/nishantnaagnihotri/tark-vitark/issues/<n>`.
4. **GitHub PRs:** always `https://github.com/nishantnaagnihotri/tark-vitark/pull/<n>`.
5. If multiple PO actions exist in one message, each action must have its own link on its own line.
6. Applies to all agents without exception. Orchestrator enforces this in every gate-closure and handoff message.
7. Cross-ref: `orchestrator-context.md` Known Rule #74.

## GitHub Interaction Policy

1. For GitHub repository, issue, pull request, review, comment, label, and status interactions, agents must use the GitHub MCP server as the primary and required interface.
2. Agents must not rely on `gh`, raw GitHub API terminal calls, or editor-cached GitHub payloads when an equivalent GitHub MCP capability exists.
3. Local git commands remain allowed for repository-local branch, commit, diff, and workspace inspection tasks that are not GitHub API interactions.
4. If a required GitHub action is not available through the GitHub MCP server, the agent must explicitly state the MCP gap and request Product Owner approval before using any fallback path.

## Gate Handoff And Decision Workflow

The full gate handoff and decision workflow - Cloud Handoff Policy, Handoff Contract Format, Decision Challenge Standard, and copy-paste gate prompts - is defined in the `gate-handoff-packet` skill (`.github/skills/gate-handoff-packet/SKILL.md`). Agents must follow this skill when preparing handoff packets, handling cloud handoff, or running gate-critical decision hardening.

## Domain Ownership Policy

The full Domain Ownership Policy - universal rules, Figma read/write routing, cross-domain escalation, and orchestrator-specific execution boundaries - is defined in the `domain-ownership-governance` skill (`.github/skills/domain-ownership-governance/SKILL.md`). All agents must follow this skill when determining ownership boundaries or routing cross-domain work.

## PR Review Workflow

The full PR review workflow — Strict Accept-vs-Challenge Lens, PR Review Intake Protocol, and Copilot Review Loop Protocol — is defined in the `pr-review-loop` skill (`.github/skills/pr-review-loop/SKILL.md`). All agents must follow that skill when creating PRs, handling review comments, or running the Copilot review loop.

## Stacked PR Review-Loop Workflow

The stacked PR review-loop workflow - pipelined review requests, base-to-tip disposition sequencing, retarget/sync order, and rebase-compatibility recovery - is defined in the `stacked-pr-review-loop` skill (`.github/skills/stacked-pr-review-loop/SKILL.md`). Agents must follow this skill when handling dependent PR chains.

For orchestrator-managed dependent PR chains, ownership is split: orchestrator owns stack sequencing (merge order, base-to-tip progression, PR retargeting); dev agents own their assigned PR's full review loop (request Copilot review, poll to review-clean, triage and fix `Accept` comments, escalate `Challenge` / `Needs Product Owner Decision` items to orchestrator, return review-clean handback). Dev agents do not advance stack sequencing, trigger merges, or retarget PR bases.

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

## Deferred Issue Protocol

When deferring a decision, UX option, or requirement gap out of scope for the active slice, apply the `deferred` label and follow `.github/skills/defer-issue/SKILL.md` for required body fields, trigger condition, gate re-entry point, and triage rules.

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

## Runtime QA Validation Workflow

The runtime QA validation workflow - acceptance-criterion journey checks in a live browser session, viewport/theme coverage, runtime verdict packaging, and loop-back gating - is defined in the `runtime-qa-validation` skill (`.github/skills/runtime-qa-validation/SKILL.md`). For UI-impacting issues, this Gate 5.5 substep is required before Gate 6 progression unless Product Owner explicitly accepts residual runtime risk.

## Figma File Structure Convention

Follow the `figma-governance-and-fidelity` skill (`.github/skills/figma-governance-and-fidelity/SKILL.md`) for the full file structure convention and project-placement rules.

## Figma Baseline-Lock Policy

1. **One Figma file per screen.** All slices that add to or modify the same screen share one Figma file for that screen. Frames from different screens must never share a single Figma file. The file key is recorded in `.figma-config.local` (gitignored); the file URL may appear in git-tracked artifacts. Cross-ref: `orchestrator-context.md` Known Rule #73.
2. **Mandatory baseline-lock for continuation slices.** When a slice modifies or extends an existing approved screen, the Orchestrator's first Figma action (during Gate 3A using the `ux-design-execution` skill) must be to call `node.clone()` on the approved baseline frame(s) within the same file — not recreate, reinterpret, or approximate them. The source node ID(s) and resulting clone node ID(s) must be recorded as provenance in the `Design Review Access` packet. Because the file is shared, `node.clone()` works natively — no cross-file workaround is needed.
3. **No rebuilding approved elements.** Any element already present in the approved baseline frame (cards, typography, spacing, spine, layout) must come from the clone — never rebuilt from raw shapes or primitives. Only net-new additions for this slice (e.g., a composer bar) are authored fresh by the agent.
4. **New-screen slices.** When a slice introduces a brand-new screen with no approved predecessor, a new dedicated file is created for that screen. No baseline duplication is required. All elements must still use Design System library variables only — no raw values.
5. Violation of rules 2–3 is a loop-back condition: orchestrator must reject `UX Readiness: Ready` claims and re-execute Gate 3A compliant with baseline-lock rules.

## Design System Foundation Policy

Follow the `figma-governance-and-fidelity` skill (`.github/skills/figma-governance-and-fidelity/SKILL.md`) for design system library, token governance, and M3 component library-first requirements.

Key mandate: the design system follows a strict 3-layer library chain — (L1) M3 Baseline Kit (Material 3 Design Kit, read-only, enabled only in the TV Library file), (L2+L3) TarkVitark Design System file (TV brand token overrides + TV functional components), and slice files (design frames only, import TV Library only). M3 primitives are imported from L1 — never recreated. TV functional components are built in L2+L3 using M3 primitives as building blocks. Slice frames import TV Library components only — no direct M3 Kit enablement in slice files. Orchestrator enforces this via a Component Coverage Check (self-blocking, per `ux-design-execution` skill) before any frame creation. If a required TV Library component is absent, Orchestrator creates it directly in the DS library before proceeding. See `3-Layer Design System Architecture` in the skill for full detail.

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

