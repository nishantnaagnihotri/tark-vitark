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
3. Gate 3 design work, including the UX substep, is local-only.
4. Cloud-preferred gates require execution mode confirmation (`local` or `cloud`) before handoff.
5. If cloud mode is chosen, manual handoff is required and return artifact must be pasted back.
6. Final verification and merge readiness decisions happen in local context.

## Implemented Agents (Current)

1. Architect + Orchestrator: `.github/agents/architect-orchestrator.agent.md`
2. Requirement Challenger: `.github/agents/requirement-challenger.agent.md`
3. PRD Agent: `.github/agents/prd.agent.md`
4. UX Agent: `.github/agents/ux.agent.md`
5. Figma Agent: `.github/agents/figma.agent.md`
6. Design QA Agent: `.github/agents/design-qa.agent.md`
7. Architecture Agent: `.github/agents/architecture.agent.md`
8. Dev Agent: `.github/agents/dev.agent.md`

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

3. Gate 3 (Design)
- Gate intent: complete the full design gate before architecture or coding.
- Current planned substeps:
  - UX substep
  - Figma substep
  - Design QA substep
- Current implemented substeps:
  - UX substep
  - Figma substep
  - Design QA substep
- UX substep input: PRD Draft Package.
- UX substep output required from UX Agent:
  - UX Readiness
  - UX Flows
  - State Matrix
  - Interaction Notes
  - Quality Gaps
  - Open Questions with owner decision status
  - Gate Decision
  - UX Flow/State Package
- Figma substep input: UX Flow/State Package.
- Figma substep output required from Figma Agent:
  - Figma Readiness
  - Screen/Flow Mapping
  - Component and Token Guidance
  - Interaction and Edge-State Design Notes
  - Quality Gaps
  - Open Questions with owner decision status
  - Gate Decision
  - Design Draft Package
- Design QA substep input: Design Draft Package + UX Flow/State Package + PRD Draft Package.
- Design QA substep output required from Design QA Agent:
  - Design QA Readiness
  - PRD Traceability Review
  - UX Coverage Review
  - Component and Token Consistency Review
  - Edge State Coverage Review
  - Quality Gaps
  - Open Questions with owner decision status
  - Gate Decision
  - Design QA Verdict Package
- Gate 3 design feedback loop: Design QA reads Figma via MCP, routes gaps back to Figma Agent, iterates until Agent-Ready, then escalates to Product Owner for explicit approval.
- Gate 3 is closed only when all three substeps pass, Design QA Verdict Package is produced, and Product Owner has explicitly approved the design.

4. Gate 4 (Architecture)
- Gate intent: convert approved requirement, PRD, UX, and Design QA artifacts into an implementation-ready architecture and task plan.
- Input required from slice folder:
  - `01-requirement.md`
  - `02-prd.md`
  - `03-ux.md`
  - `04-design-qa.md`
- Output required from Architecture Agent:
  - Architecture Readiness
  - Architecture Plan
  - Impact Analysis
  - Risk and Mitigation Plan
  - Verification Strategy
  - Task Decomposition
  - Quality Gaps
  - Open Questions with owner decision status
  - Gate Decision
  - Architecture Plan Package
- Gate 4 completion outputs:
  - `05-architecture.md`
  - `06-tasks.md` (includes GitHub Issue numbers created at Gate 4 end)

5. Gate 5 (Build)
- Gate intent: implement one approved Gate 4 issue at a time using architecture references and produce merge-ready evidence.
- Input required:
  - one GitHub Issue link or number from `06-tasks.md`
  - issue metadata with acceptance criteria, slice path, and architecture reference
- Output required from Dev Agent:
  - Build Readiness
  - Implementation Summary
  - Files Changed
  - Verification Evidence
  - BDD Evidence
  - PR Package (with issue-closing reference)
  - Quality Gaps
  - Open Questions with owner decision status
  - Gate Decision
  - Build Output Package

6. Gate 6 (Merge)
- Gate intent: verify issue-level PR merge readiness using Build Output Package evidence and recommend merge or loop-back.
- Input required:
  - GitHub Issue reference
  - PR link
  - Build Output Package
- Output required from Orchestrator merge review:
  - Merge Readiness
  - Merge Review Summary
  - Outstanding Gaps
  - Gate Decision
  - Owner Action

## Known Rules From User Decisions

1. Requirement Challenger is primary owner of requirement detailing.
2. Orchestrator forwards only requirement statement at Gate 1 and does not reinterpret details.
3. Challenger continues clarification rounds until no open questions remain or Product Owner accepts remaining open questions.
4. Challenger drafts acceptance criteria detailed enough for PRD writing.
5. Product Owner manually reviews and merges all PRs.
6. Dev is cloud-first for coding implementation, with local verification before merge.
7. Gate 3 is a full design gate and is local-only.
8. Gate 1 and Gate 2 stay separate: Gate 1 is Requirement Challenger only, Gate 2 is PRD Agent only.
9. Orchestrator must challenge major decisions, provide alternatives with tradeoffs, and recommend a balanced option before owner finalization.
10. Gate 6 structure (compound substeps vs split gates) is deferred until Gate 5 Dev output contract is known. Do not design Gate 6 before Gate 5 is implemented.
11. Gate 3 never closes on agent decision alone. Figma Agent produces dual output (real Figma design via MCP + text Design Coverage Report). Design QA reads Figma via MCP, loops gaps back to Figma Agent, then escalates to Product Owner. Product Owner explicit approval is required to close Gate 3.
12. Slice artifacts are stored in `docs/slices/<slice-name>/` as versioned markdown. Orchestrator creates the slice folder when Gate 1 passes and writes gate artifacts after each gate closes.
13. GitHub Issues (one per atomic coding task) are created by the orchestrator at the end of Gate 4, after the architecture plan is approved. Gate 5 (Build) is purely implementation — no planning overhead.
14. Architecture governance is orchestrator-owned and enforced through an explicit Gate 4 checklist (scope, traceability, boundaries, risk, verification, rollback, decomposition, issue linkage, and owner acceptance).
15. Gate 5 defaults to GitHub Copilot cloud Dev execution. Local execution is permitted only when Product Owner explicitly overrides for a specific Issue. Final build evidence is verified in Local before merge recommendation.
16. Gate 5 implementation uses BDD discipline: behavior scenarios, test-first workflow, and scenario-to-test evidence are required before merge progression.
17. Issue-centric handoff is supported for Gate 5: issue link/number is sufficient only when issue metadata includes acceptance criteria, slice path, and architecture reference.
18. Gate 5 PR provenance is mandatory: PR body must include issue-closing keyword and `Execution-Agent: dev` marker for attribution and orchestration traceability.
19. Gate 6 is orchestrator-owned and Local-only. It recommends merge or loop-back based on evidence, but Product Owner alone performs the actual merge.
20. Design artifact is mandatory for every UX task: Gate 3A must include a valid Figma or Penpot artifact reference (file URL or key) before progression.
21. Orchestrator terminal policy is diagnostics-first, but explicit Product Owner requests may authorize scoped git mutating commands (including add/commit/push/branch/PR operations); destructive commands still require command-level approval.
22. Slice/story traceability policy: each slice has a GitHub slice tracker issue labeled `slice`; each story issue is labeled `user-story` only and must contain a `Slice tracker:` backlink; slice tracker must list all story issue links; `06-tasks.md` must mirror story issue links and architecture references.
23. Review-response policy is repo-wide: when an agent fixes a review comment, it must also post a PR reply explaining what was accepted or challenged, what changed (or why no change), and the rationale/tradeoff.
24. Universal principle persistence: repo-wide principles may be stored in either (a) `Known Rules From User Decisions` (this section) or (b) permanent shared protocol docs (.github/AGENTS.md, .github/agents/*.agent.md) with explicit cross-reference. This avoids duplication while ensuring traceability and centralized visibility. Pre-archive checks validate presence in either location before archiving a slice.

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

1. Gate 1 and Gate 2 are implemented.
2. Gate 3 is fully implemented: UX, Figma, and Design QA substeps are all defined and wired.
3. Gate 4 is implemented at contract level: Architecture Agent and orchestrator handoff rules are defined.
4. Gate 5 is implemented at contract level: Dev Agent and orchestrator handoff rules are defined.
5. Gate 6 is implemented at contract level: merge readiness review is orchestrator-owned.
6. Current protocol baseline is complete through Merge gate.

## Default Next Step

1. Run one dry-run of the full Gate 4 -> Gate 6 flow on a sample issue/PR path.

## Current Slice Status

| Slice | Gate 1 | Gate 2 | Gate 3 | Gate 4 | Gate 5 | Gate 6 |
|---|---|---|---|---|---|---|
| `coming-soon-splash-page` | ✅ Pass | ✅ Full Pass | ✅ Pass (PO approved 2026-03-29) | ✅ Pass | ✅ Complete (T3 PR #18, T4 PR #19, T5 PR #20 all merged) | ✅ Complete (2026-03-29) |

## Log Archive Protocol

When a slice reaches Gate 6 ✅ Complete:
1. **Pre-archive: extract universal principles.** Review each log entry being archived. If any entry records a principle or rule that applies to all future slices (not just the current one), verify it is already present in either (a) `Known Rules From User Decisions` OR (b) permanent shared protocol docs (.github/AGENTS.md, .github/agents/*.agent.md) with explicit cross-reference (see Known Rule #24). If neither, add it to Known Rules before archiving. Do not archive principles; only archive slice-specific history.
2. Move only **slice-specific** log entries for that slice from this file to `docs/slices/<slice-name>/context-log.md`.
3. **Do not move** repo-wide/global context updates (for example: no-active-slice governance updates, baseline policy decisions, cross-slice standards). Keep those in this file, or copy to a dedicated global archive if one is later defined.
4. Replace the moved slice-specific entries with a single archive summary line in this file (see format below).
5. This keeps the main context file lean for session loading while preserving full audit history per slice and keeping global baseline context centrally visible.

Archive summary format:
```
### <slice-name> — Gate 6 ✅ Complete (<date>) — Full log: docs/slices/<slice-name>/context-log.md
```

## Context Update Log

Append new entries here after each gate transition.

Template:

### YYYY-MM-DD
- Gate status:
- Artifact changes:
- Open questions status:
- Next micro-goal:
- Blockers/owner decisions:

### coming-soon-splash-page — Gate 6 ✅ Complete (2026-03-29) — Full log: docs/slices/coming-soon-splash-page/context-log.md

### 2026-03-30
- Gate status: No active slice. Governance protocol hardened.
- Artifact changes: PR #29 merged — added rule 6 to AGENTS.md and constraint 8 to architect-orchestrator.agent.md prohibiting all agents from executing PR merge operations. PR merges are now unconditionally reserved for the Product Owner.
- Open questions status: None.
- Next micro-goal: Await next slice or issue assignment.
- Blockers/owner decisions: None.

### 2026-03-30 (Public Portfolio + Proprietary Licensing)
- Gate status: No active slice. Repository governance/documentation update only.
- Artifact changes: Added root LICENSE with all-rights-reserved proprietary terms. Added root README clarifying public showcase intent, non-open-source usage restrictions, contribution policy, and permission-request contact path.
- Open questions status: None.
- Next micro-goal: Use this baseline for all future public-facing repository onboarding and resume sharing.
- Blockers/owner decisions: Owner selected public visibility with proprietary licensing model (showcase allowed; reuse requires explicit permission).

### 2026-03-31
- Gate status: No active slice. Review-governance policy hardened.
- Artifact changes: Added repo-wide review-response rule in `.github/AGENTS.md` and `.github/agents/architect-orchestrator.agent.md`; added Known Rule #23 in this file.
- Open questions status: None.
- Next micro-goal: Enforce this policy on all future PR review fixes.
- Blockers/owner decisions: Decision challenged with options and tradeoffs. Option A code-only fixes with no PR reply (fastest, low traceability). Option B mandatory comment replies only for challenged items (moderate consistency). Option C mandatory reply for every fixed review comment with accept/challenge rationale (highest clarity/auditability). Owner selected Option C.

### 2026-03-30 (Final)
- Gate status: Implementation protocol hardened with Test-First Development, BDD with GWT scenarios, and Domain-Oriented Development.
- Artifact changes: Updated .github/AGENTS.md with new "Implementation Protocol (Test-First BDD + Domain-Oriented Development)" section (7 rules). Updated architect-orchestrator.agent.md Architecture Gate Checklist (added BDD lock, item 10) and Build Gate Checklist (expanded TFD/BDD/domain language locks, items 3-5). Updated slice-template 05-architecture.md to include BDD section (10) with five GWT sentence templates (one per AC), test implementation guidance, and domain language requirements. Updated Gate Decision rationale to reference BDD scenarios.
- Open questions status: No open questions.
- Blockers/owner decisions: Owner requested three specific hardening requirements: (1) Test-First Development (tests before code), (2) BDD with GWT at acceptance criteria level (not module level), (3) Domain-Oriented Development (code uses domain terminology, not infrastructure terms). All three implemented in protocol and templates. Decision rationale: TFD ensures tests drive design and prevent test-last brittleness. GWT at AC level ensures functional behavior (not module internals) drives development. Domain language ensures code reads as specification for the problem domain, making it maintainable and clear to non-technical stakeholders. Principle persisted in: .github/AGENTS.md (Implementation Protocol section), architect-orchestrator.agent.md (Architecture/Build checklists), slice-template 05-architecture.md (BDD section). See cross-references for full content.

### 2026-03-30 (Gate1-Gate2 Alignment)
- Gate status: Requirement challenge and PRD drafting alignment hardened.
- Artifact changes: Added Requirement-To-PRD Alignment Protocol to .github/AGENTS.md. Updated orchestrator Gate 1->2 rules to freeze requirement statement/scope/AC intent unless owner-approved. Added mandatory Requirement-to-PRD Alignment Check output in PRD handoff contracts (local and cloud prompts). Updated slice templates: 01-requirement.md now includes requirement IDs (R-1..R-N) and completeness lock; 02-prd.md now includes mandatory alignment table mapping requirements to PRD sections/user stories/AC IDs.
- Open questions status: No open questions.
- Blockers/owner decisions: Owner requested that challenger and PRD agents move in the same direction and that templates only be filled after proper requirement gathering/refinement. Selected approach: explicit contract freeze + alignment table + loop-back on unauthorized deltas. Principle persisted in: .github/AGENTS.md (Requirement-To-PRD Alignment Protocol section), orchestrator Gate 1->2 freeze rules. See cross-references for full content.

### 2026-03-30 (Slice/Story Maintenance)
- Gate status: Slice/story maintenance protocol standardized across repo and GitHub.
- Artifact changes: Added explicit rules for slice tracker issue, story issue label policy (`user-story` only), mandatory bidirectional slice <-> story links, and `06-tasks.md` traceability requirements in shared and orchestrator contracts.
- Open questions status: No open questions.
- Blockers/owner decisions: Decision challenged with options and tradeoffs. Option A keep label-heavy model (fast filtering, more metadata overhead). Option B reference-first with minimal labels (`slice` for tracker, `user-story` for stories) and mandatory links (balanced). Option C links-only with no labels (lowest metadata, weakest queryability). Owner selected Option B. Principle persisted in: .github/AGENTS.md (Known Rule #22, Slice and Issue Management section), architect-orchestrator.agent.md (Slice and Issue Management section). See cross-references for full content.


