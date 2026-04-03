# Orchestrator Context Archive

Detailed repo-wide governance history moved out of `.github/orchestrator-context.md` to keep the live orchestrator context small enough for efficient session loading.

## Repo-Wide Governance Archive

### 2026-03-30
- Gate status: No active slice. Governance protocol hardened.
- Artifact changes: PR #29 merged — added rule 6 to `.github/AGENTS.md` and constraint 8 to `.github/agents/architect-orchestrator.agent.md` prohibiting all agents from executing PR merge operations. PR merges are now unconditionally reserved for the Product Owner.
- Open questions status: None.
- Next micro-goal: Await next slice or issue assignment.
- Blockers/owner decisions: None.

### 2026-03-30 (Public Portfolio + Proprietary Licensing)
- Gate status: No active slice. Repository governance/documentation update only.
- Artifact changes: Added `LICENSE` with all-rights-reserved proprietary terms. Added `README.md` clarifying public showcase intent, non-open-source usage restrictions, contribution policy, and permission-request contact path.
- Open questions status: None.
- Next micro-goal: Use this baseline for all future public-facing repository onboarding and resume sharing.
- Blockers/owner decisions: Owner selected public visibility with proprietary licensing model (showcase allowed; reuse requires explicit permission).

### 2026-03-31
- Gate status: No active slice. Review-governance policy hardened.
- Artifact changes: Added repo-wide review-response rule in `.github/AGENTS.md` and `.github/agents/architect-orchestrator.agent.md`; added Known Rule #23 in `.github/orchestrator-context.md`.
- Open questions status: None.
- Next micro-goal: Enforce this policy on all future PR review fixes.
- Blockers/owner decisions: Decision challenged with options and tradeoffs. Option A code-only fixes with no PR reply (fastest, low traceability). Option B mandatory comment replies only for challenged items (moderate consistency). Option C mandatory reply for every fixed review comment with accept/challenge rationale (highest clarity/auditability). Owner selected Option C.

### 2026-03-30 (Final)
- Gate status: Implementation protocol hardened with Test-First Development, BDD with GWT scenarios, and Domain-Oriented Development.
- Artifact changes: Updated `.github/AGENTS.md` with new "Implementation Protocol (Test-First BDD + Domain-Oriented Development)" section (7 rules). Updated `.github/agents/architect-orchestrator.agent.md` Architecture Gate Checklist (added BDD lock, item 10) and Build Gate Checklist (expanded TFD/BDD/domain language locks, items 3-5). Updated `.github/templates/slice-template/05-architecture.md` to include BDD section (10) with five GWT sentence templates (one per AC), test implementation guidance, and domain language requirements. Updated Gate Decision rationale to reference BDD scenarios.
- Open questions status: No open questions.
- Blockers/owner decisions: Owner requested three specific hardening requirements: (1) Test-First Development (tests before code), (2) BDD with GWT at acceptance criteria level (not module level), (3) Domain-Oriented Development (code uses domain terminology, not infrastructure terms). All three implemented in protocol and templates. Decision rationale: TFD ensures tests drive design and prevent test-last brittleness. GWT at AC level ensures functional behavior (not module internals) drives development. Domain language ensures code reads as specification for the problem domain, making it maintainable and clear to non-technical stakeholders. Principle persisted in: `.github/AGENTS.md` (Implementation Protocol section), `.github/agents/architect-orchestrator.agent.md` (Architecture/Build checklists), `.github/templates/slice-template/05-architecture.md` (BDD section). See cross-references for full content.

### 2026-03-30 (Gate1-Gate2 Alignment)
- Gate status: Requirement challenge and PRD drafting alignment hardened.
- Artifact changes: Added Requirement-To-PRD Alignment Protocol to `.github/AGENTS.md`. Updated orchestrator Gate 1->2 rules to freeze requirement statement/scope/AC intent unless owner-approved. Added mandatory Requirement-to-PRD Alignment Check output in PRD handoff contracts (local and cloud prompts). Updated slice templates: `docs/slices/slice-template/01-requirement.md` now includes requirement IDs (R-1..R-N) and completeness lock; `docs/slices/slice-template/02-prd.md` now includes mandatory alignment table mapping requirements to PRD sections/user stories/AC IDs.
- Open questions status: No open questions.
- Blockers/owner decisions: Owner requested that challenger and PRD agents move in the same direction and that templates only be filled after proper requirement gathering/refinement. Selected approach: explicit contract freeze + alignment table + loop-back on unauthorized deltas. Principle persisted in: `.github/AGENTS.md` (Requirement-To-PRD Alignment Protocol section), `.github/agents/architect-orchestrator.agent.md` Gate 1->2 freeze rules. See cross-references for full content.

### 2026-03-30 (Slice/Story Maintenance)
- Gate status: Slice/story maintenance protocol standardized across repo and GitHub.
- Artifact changes: Added explicit rules for slice tracker issue, story issue label policy (`user-story` and `slice:<slice-name>`), mandatory bidirectional slice <-> story links, and `06-tasks.md` traceability requirements in shared and orchestrator contracts.
- Open questions status: No open questions.
- Blockers/owner decisions: Decision challenged with options and tradeoffs. Option A keep label-heavy model (fast filtering, more metadata overhead). Option B reference-first with minimal labels (`slice` for tracker, `user-story` for stories) and mandatory links (balanced). Option C links-only with no labels (lowest metadata, weakest queryability). Owner selected Option B. Principle persisted in: `.github/AGENTS.md` (Known Rule #22, Slice and Issue Management section), `.github/agents/architect-orchestrator.agent.md` (Slice and Issue Management section). See cross-references for full content.

### 2026-04-01
- Gate status: No active slice. Gate 3A and Gate 4 challenge discipline hardened.
- Artifact changes: Added embedded Challenge Phase sections to `.github/agents/ux.agent.md` and `.github/agents/architecture.agent.md`. Updated Gate 3A and Gate 4 execution rules in `.github/agents/architect-orchestrator.agent.md` to enforce challenge-first behavior. Added rules 6 and 8 to Required Gates in `.github/AGENTS.md`. Added Known Rule #25 in `.github/orchestrator-context.md`.
- Open questions status: None.
- Next micro-goal: Await next slice assignment.
- Blockers/owner decisions: Decision challenged with three options before owner selection. Option A embed challenge phase inside UX and Architecture agents (no new agents, no new gate substeps, specialist-owned quality judgment). Option B create separate UX Challenger and Architecture Challenger agents (symmetric to Gate 1, higher structural overhead). Option C orchestrator-owned challenge checklist per gate (fast, but challenge quality depends on generalist). Owner selected Option A. Rationale: specialists know their domain best; embedded challenge avoids pipeline complexity and keeps quality judgment co-located with expertise. Principle persisted in Known Rule #25 and in `.github/agents/ux.agent.md`, `.github/agents/architecture.agent.md`, `.github/agents/architect-orchestrator.agent.md`, and `.github/AGENTS.md`.

### 2026-04-01 (Architecture Expert Standard)
- Gate status: No active slice. Architecture Agent standard upgraded to expert architect level.
- Artifact changes: Updated `.github/agents/architecture.agent.md` (Role upgraded, Discussion Phase section added, Approach expanded, Architecture Quality Checks deepened, Architecture Plan Package Schema expanded). Updated `.github/agents/architect-orchestrator.agent.md` (Architecture Gate Checklist expanded with additional detail and discussion lock items). Added Known Rule #26 in `.github/orchestrator-context.md`.
- Open questions status: None.
- Next micro-goal: Await next slice assignment.
- Blockers/owner decisions: Decision challenged with two options. Option A discussion-first + deep implementation detail (one alignment round before plan freeze, then full concrete spec — highest fidelity, slight upfront cost). Option B deep detail only with no discussion round (faster initial output, higher rework risk if technical assumptions are wrong). Owner selected Option A. Rationale: expert architects align on key bets before writing the full plan; the discussion round prevents expensive downstream rework. Principle persisted in Known Rule #26 and in `.github/agents/architecture.agent.md`, `.github/agents/architect-orchestrator.agent.md`.

### 2026-04-01 (Architecture Three-Tier Discussion Model)
- Gate status: No active slice. Architecture Agent Discussion Phase expanded to three tiers.
- Artifact changes: Expanded `.github/agents/architecture.agent.md` Discussion Phase from 7 flat topics to three structured tiers: Tier 1 System Design (7 topics: scalability, fault-tolerance, data consistency, service boundaries, data flow and coordination, security, observability), Tier 2 Solution Architecture (6 topics: architectural patterns, technology choices, integration architecture, deployment topology, state management, migration strategy), Tier 3 Implementation Design (5 topics: file/folder structure, data shapes, interface contracts, cross-cutting concerns, codebase conventions). Architecture Quality Checks expanded to 25 items grouped by tier. Architecture Plan Package Schema expanded to 25 items grouped by tier. Updated `.github/agents/architect-orchestrator.agent.md` Architecture Gate Checklist: added system design lock (item 6) and solution architecture lock (item 7), total 15 items. Updated Known Rule #26 in `.github/orchestrator-context.md`.
- Open questions status: None.
- Next micro-goal: Await next slice assignment.
- Blockers/owner decisions: Owner indicated Architecture Agent should discuss all aspects including System Design and Solution Architecture, not just implementation detail. No options presented — this was a directional refinement within the previously owner-selected Option A (discussion-first + deep implementation detail), not a new gate-critical decision; the Decision Challenge Standard applies to gate-critical choices only. Extended the Discussion Phase tiers accordingly. The three-tier model ensures no architectural concern is skipped regardless of slice size or complexity.

### 2026-04-01 (Figma File Structure Convention)
- Gate status: No active slice. Figma file organization convention established.
- Artifact changes: Added `Figma File Structure Convention` section to `.github/AGENTS.md`. Updated `.github/agents/ux.agent.md` (Approach section: create Figma file per slice with standard pages, enhancement baseline). Updated `.github/agents/figma.agent.md` (Approach section: verify convention compliance, frame naming). Added Known Rule #27 in `.github/orchestrator-context.md`.
- Open questions status: None.
- Next micro-goal: Await next slice assignment.
- Blockers/owner decisions: Decision challenged with three options. Option A one Figma file per slice, self-contained (simple, maps to slice folder model, no cross-file dependencies). Option B one shared Figma file for entire project (single source of truth, but grows large and breaks slice isolation). Option C hybrid — shared library + per-slice files (best at scale, overkill for solo builder). Owner selected Option A. For enhancement slices: Option A self-contained enhancement files (recreate base screen in new file, apply enhancement, don't touch original). Option B modify original slice file (breaks isolation). Option C maintain separate current-state master file (extra maintenance). Owner selected Option A. Rationale: matches solo-builder workflow, preserves slice isolation, avoids premature design system overhead. Current-state file can be added later if needed. Owner refinement: project name is metadata, not agent logic — hardcoding project name in agent files prevents reuse across projects. Historical note: this entry originally treated `.github/orchestrator-context.md` as the only storage location for project-specific Figma metadata. That policy has since been superseded: agents now read runtime project metadata from `.figma-config.local`, while `.github/orchestrator-context.md` remains handover and history context only.

### 2026-04-02 (Design System Foundation + Dual-Theme)
- Gate status: No active slice. Design system foundation and dual-theme policy established.
- Artifact changes: Added `Design System Foundation Policy` section to `.github/AGENTS.md` (10 rules including first-slice bootstrap). Updated `Figma File Structure Convention` frame naming to `<Screen>/<State>/<Theme>`. Updated `.github/agents/figma.agent.md` (Approach: library bootstrap/extension, variable verification, dual-theme frame production; Quality Checks: theme variants + token compliance). Updated `.github/agents/ux.agent.md` (Approach: library bootstrap and consumption). Updated `.github/agents/design-qa.agent.md` (Approach: token compliance + theme variant verification; QA Checks: 2 new items). Updated `.github/agents/dev.agent.md` (Constraints: token-only + dual-theme rules; Approach: token system translation; Quality Checks: token compliance). Updated `.github/agents/architect-orchestrator.agent.md` (Gate 3A progression + local validation require library bootstrap and `.figma-config.local` persistence before Gate 3B). Added Known Rule #28 in `.github/orchestrator-context.md`.
- Open questions status: None.
- Next micro-goal: Await next slice assignment.
- Blockers/owner decisions: Decision challenged with three options. Option A dedicated Design System Figma library file (standard Figma workflow, single source of truth, clean dev handoff, one shared file to maintain). Option B design system as a formal slice through full gate process (maximum rigor, heavy overhead for infrastructure, delays real slices). Option C inline tokens in first slice, extract later (fastest start, token drift risk, deferred extraction rarely happens). Owner selected Option A. Sub-decision on theming: Option i ship Light-only first, Dark as future slice (foundation defined but activation deferred). Option ii ship both themes from first slice (complete from day one, minimal incremental cost since tokens are already dual-mode). Owner challenged Option i — if tokens are already dual-mode, the incremental cost of shipping both is minimal and deferring creates retroactive verification debt. Owner selected Option ii. Rationale: Figma variables natively support modes for Light/Dark; CSS custom properties with theme selectors map 1:1; defining both from day one prevents token drift, ensures every slice is visually verified in both themes, and avoids catch-up rework.
- Bootstrap refinement accepted on 2026-04-03: Option A is instantiated by the first slice entering Gate 3. UX Agent creates the Design System library first when absent, records the library reference in `.figma-config.local`, then creates the slice file that consumes it. This avoids speculative standalone setup while still ensuring the library exists before Figma design work proceeds.

### 2026-04-03 (PR Review Intake Hardening)
- Gate status: No active slice. PR review workflow hardened.
- Artifact changes: Added explicit `PR Review Intake Protocol` to `.github/AGENTS.md`, `.github/agents/architect-orchestrator.agent.md`, and `.github/agents/dev.agent.md`. Added Known Rule #29 in `.github/orchestrator-context.md`.
- Open questions status: None.
- Next micro-goal: Apply this protocol when addressing PR #33 review comments.
- Blockers/owner decisions: Root-cause review concluded this was not a missing principle but a missing operational sequence. Existing protocol already required accept-vs-challenge classification, but it did not force that triage to happen before comment summary or fix recommendation. Hardening decision: make PR review intake an explicit mandatory step. This removes reliance on memory and reduces the chance of skipping the challenge lens during review handling.

### 2026-04-03 (Copilot Review Loop Hardening)
- Gate status: No active slice. PR review automation workflow hardened.
- Artifact changes: Added explicit `Copilot Review Loop Protocol` to `.github/AGENTS.md` and `.github/agents/architect-orchestrator.agent.md`. Expanded Merge Gate Checklist with a Copilot review loop lock. Added Known Rule #30 in `.github/orchestrator-context.md`.
- Open questions status: None.
- Next micro-goal: Run the Copilot review loop on PR #33 until no actionable Copilot comments remain or a blocker is reached.
- Blockers/owner decisions: Owner accepted the recommendation to operationalize the review loop in governance and use it on the active PR. Merge authority remains with Product Owner; the automation target is zero unresolved actionable Copilot comments, not zero total historical Copilot review events.

### 2026-04-03 (PR #33 Merged)
- Gate status: No active slice. Governance PR #33 merged by Product Owner.
- Artifact changes: PR #33 `Add design system bootstrap governance` merged to `master` after the live GitHub MCP Copilot review loop completed on head `dc19aa1` with review `4055836354` reporting no new comments. Final merged governance includes design-system bootstrap policy, dual-theme/token foundation rules, PR review intake discipline, Copilot bounded polling, GitHub MCP-first interaction policy, active review-loop continuity, review-thread resolution discipline, and semantic review-state handling.
- Open questions status: None. No semantic-open Copilot comments remained on the final reviewed head at merge time.
- Next micro-goal: Refresh local `master` and use the merged governance baseline for the next slice or PR review cycle.
- Blockers/owner decisions: Product Owner completed the merge. Residual note: thread-resolution mutation capability is still not exposed through the current MCP surface, so semantically closed outdated threads continue to be tracked via the `semantically-closed/tooling-unresolved` model when needed.