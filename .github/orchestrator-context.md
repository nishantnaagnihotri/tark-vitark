# Orchestrator Context Transfer

This file is the canonical handover context for the Architect + Orchestrator agent.

## Purpose

Enable the orchestrator to resume work as primary control agent for all activities without losing prior planning decisions.

## Product Owner Model

1. Product Owner is the human user.
2. Product Owner owns final decisions on scope, ambiguity acceptance, PR merge, and release.
3. Agents prepare artifacts and recommendations only.

## Delivery Mode

1. Part-time execution.
2. One active implementation slice at a time.
3. One micro-goal per session.
4. Session closeout always includes: done, next, blockers.

## Environment Model

1. Requirement challenge: local-first.
2. PRD drafting: cloud-preferred, local-allowed.
3. Cloud-preferred gates require execution mode confirmation (`local` or `cloud`) before handoff.
4. If cloud mode is chosen, manual handoff is required and return artifact must be pasted back.
5. Final verification and merge readiness decisions happen in local context.

## Implemented Agents (Current)

1. Architect + Orchestrator: `.github/agents/architect-orchestrator.agent.md`
2. Requirement Challenger: `.github/agents/requirement-challenger.agent.md`
3. PRD Agent: `.github/agents/prd-agent.agent.md`

## Current Gate Contracts

1. Gate 1 (Requirement Challenge)
- Input minimum: requirement statement.
- Output required from Challenger:
  - Readiness
  - Missing Information
  - Assumptions
  - Challenge Questions
  - Edge Cases
  - Proposed Acceptance Criteria
  - Open Questions with owner decision status
  - Gate Decision
  - Requirement Context Package

2. Gate 2 (PRD)
- Primary input: Requirement Context Package.
- Output required from PRD Agent:
  - PRD Readiness
  - PRD v0
  - Traceability Map
  - Quality Gaps
  - Open Questions with owner decision status
  - Gate Decision
  - PRD Draft Package

## Known Rules From User Decisions

1. Requirement Challenger is primary owner of requirement detailing.
2. Orchestrator forwards only requirement statement at Gate 1 and does not reinterpret details.
3. Challenger continues clarification rounds until no open questions remain or Product Owner accepts remaining open questions.
4. Challenger drafts acceptance criteria detailed enough for PRD writing.
5. Product Owner manually reviews and merges all PRs.
6. Builder is cloud-first for coding drafts, with local verification before merge.

## Resume Protocol For Orchestrator

On first response in any new activity:

1. Read `.github/AGENTS.md`.
2. Read this file (`.github/orchestrator-context.md`).
3. Read implemented agent files under `.github/agents/`.
4. Return a short resume snapshot:
- current gate
- known artifacts present or missing
- immediate next micro-goal
- blockers and owner decisions needed

## Current Program Status

1. Gate 1 and Gate 2 orchestration are implemented.
2. Remaining agents to implement, in order:
- UX Agent
- Figma Agent
- Design QA Agent
- Builder Agent
- Test + Review Agent
- Docs + Release Agent

## Default Next Step

1. Implement UX Agent.
2. Wire Gate 3 handoff from PRD Draft Package to UX flow/state package.
3. Add quality gate for UX output before Figma handoff.

## Context Update Log

Append new entries here after each gate transition.

Template:

### YYYY-MM-DD
- Gate status:
- Artifact changes:
- Open questions status:
- Next micro-goal:
- Blockers/owner decisions:
