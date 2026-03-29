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
3. Design freeze must happen before coding. Gate 3 is the full design gate and includes UX, Figma, and Design QA substeps.
4. Architecture signoff must happen before coding.
5. Merge requires passing tests, review closure, docs update, and rollback note.

## Environment Routing

1. Draft anywhere, decide and verify in Local.
2. Local is preferred for requirement challenge and required for all Gate 3 design substeps; cloud is preferred for PRD drafts and Gate 5 Dev first-pass code + PR drafts.
3. Local is mandatory for final integration checks and merge readiness.
4. Copilot CLI is used for command-heavy scaffolding and repetitive transformations.

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
   - `03-ux.md` — UX Flow/State Package (Gate 3A)
   - `04-design-qa.md` — Design QA Verdict Package (Gate 3C; includes Figma design reference)
   - `05-architecture.md` — Architecture Plan (Gate 4)
   - `06-tasks.md` — Task breakdown with GitHub Issue numbers (Gate 4 end)
4. GitHub Issues for coding tasks are created by the orchestrator at the end of Gate 4, after the architecture plan is approved.
5. Each Issue references the slice folder path and the relevant architecture section.
6. Coder agents at Gate 5 read the Issue and linked slice folder files for full context.
7. A PR that closes the Issue is the unit of completion for each coding task.
