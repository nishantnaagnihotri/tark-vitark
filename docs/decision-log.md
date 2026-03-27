# Decision Log

Tracks durable product/process decisions so future sessions and agents can inherit context.

## 2026-03-12 - Multi-Role Delivery Model
- Status: Accepted
- Context: Team wants lifecycle coverage from UX through deployment using delegated agents.
- Decision:
  - Adopt role-and-gate model defined in `docs/roles-and-gates.md`.
  - Use a lean default role set for every slice:
    - Studio Architect
    - UX Strategist
    - Feature Engineer
    - Quality Engineer
    - Code Steward
  - Activate Security Steward and Release Engineer via explicit triggers.
  - Add specialized roles only when slice profile requires them.
- Consequences:
  - Improves consistency and risk control.
  - Adds small process overhead offset by conditional activation rules.
- Follow-up:
  - Revisit triggers after first 3 implemented slices.

## 2026-03-12 - Role and Agent Naming Alignment
- Status: Accepted
- Context: Agent invocation is simpler when role names and agent names match.
- Decision:
  - Standardize orchestrator role name to `Studio Architect`.
  - Prefer one-to-one naming between role labels and agent names where feasible.
- Consequences:
  - Faster delegation with less ambiguity.
  - Lower cognitive load when assigning slice tasks.

## 2026-03-25 - Lightweight Product Management Lane
- Status: Accepted
- Context: Slices need clearer functional requirements to reduce rework and improve handoff quality.
- Decision:
  - Add Product Manager to the default active role set.
  - Require a concise Functional Requirements Spec for non-trivial slices before implementation.
  - Standardize the requirements artifact using `docs/functional-requirements-template.md`.
- Consequences:
  - Better clarity for UX, engineering, and QA handoffs.
  - Slight additional process overhead at Plan Gate.
- Follow-up:
  - Reassess after 3 slices whether PM remains always-active or becomes trigger-based.

## 2026-03-25 - Functional Requirements Continuity System
- Status: Accepted
- Context: Team needs one role/agent to retain complete functional requirement knowledge across the full lifecycle.
- Decision:
  - Introduce Product Manager custom agent as the default requirements owner.
  - Establish `docs/functional-requirements-index.md` as the cross-slice requirements source of truth.
  - Define lifecycle operating rules in `docs/requirements-lifecycle.md`.
  - Require requirements index updates during Plan Gate and requirement status transitions.
- Consequences:
  - Stronger cross-session continuity and lower ambiguity at handoff points.
  - Requires disciplined index maintenance to avoid drift.
- Follow-up:
  - After first 3 implemented slices, audit traceability from requirement IDs to tests and ship decisions.

## 2026-03-25 - Baseline Non-Functional Requirements Inheritance
- Status: Accepted
- Context: Cross-slice NFRs (for example mobile-first) were duplicated in slice docs and risked inconsistency.
- Decision:
  - Introduce a single canonical baseline under `docs/non-functional-requirements-baseline.md`.
  - Require all slices to inherit baseline NFRs by default.
  - Keep slice specs focused on additions or explicit exceptions only.
- Consequences:
  - Stronger consistency across deliverables.
  - Lower duplication and reduced drift risk.
- Follow-up:
  - Revisit baseline after first implementation slice to validate sufficiency and clarity.

## 2026-03-25 - Dual UX Artifact Policy
- Status: Accepted
- Context: UX behavior needs a durable text spec for implementation plus a visual artifact for design validation.
- Decision:
  - Keep UX spec docs in-repo as canonical behavioral guidance.
  - Require a Figma link for UX slices, or an explicit waiver with rationale when not needed.
  - Enforce this in UX Gate criteria and issue intake template.
- Consequences:
  - Better cross-role clarity between behavior and visual design intent.
  - Slight process overhead for maintaining an additional link field.
- Follow-up:
  - After 3 slices, evaluate whether waiver usage is clear and consistent.

## 2026-03-26 - Agent-First Default and UX Figma Handoff Contract
- Status: Accepted
- Context: Team requires fully agentic execution by default, with minimal manual intervention even for UX/Figma work, and stronger reuse from design to code.
- Decision:
  - Enforce agent-first as mandatory in shared protocol and operating docs.
  - Restrict manual actions to external blockers only, with explicit blocker and automation follow-up logging.
  - Introduce deterministic UX Figma protocol in `docs/ux-figma-agentic-protocol.md`.
  - Require every active UX spec to include both Figma Production Contract and Code Translation Contract.
- Consequences:
  - Lower design-to-code ambiguity and cleaner developer handoff.
  - Slightly higher UX documentation rigor per slice.
- Follow-up:
  - Revisit after first 2 implemented slices to evaluate whether contract granularity should be tightened or reduced.

## 2026-03-26 - UX Strategist Creative Ownership and Iterative Approval
- Status: Accepted
- Context: Pre-created UX specs can unintentionally constrain UX creativity and reduce quality.
- Decision:
  - Treat architect-authored UX specs as bootstrap drafts only when present.
  - Assign final UX creative ownership to UX Strategist.
  - Allow multiple UX iteration rounds with user feedback before UX Gate approval.
- Consequences:
  - Better UX quality and stronger design ownership.
  - Slightly longer UX Gate cycle for complex slices.
- Follow-up:
  - Track average iteration rounds across next 3 slices to calibrate UX Gate throughput.

## 2026-03-26 - UX Spec Creation Timing and Ownership Boundary
- Status: Accepted
- Context: Requirements ownership was being conflated with UX artifact authorship.
- Decision:
  - Do not require a finalized UX spec before UX Gate.
  - UX Strategist creates/authors the final UX spec and Figma artifacts during UX Gate.
- Consequences:
  - Preserves UX creative freedom while keeping requirements clarity.
  - Requires clear issue placeholders (`TBD`) until UX Gate outputs are available.

## 2026-03-26 - Throughput and Build-Handoff Optimization
- Status: Accepted
- Context: Process quality was strong, but Build Gate start could still suffer from vague implementation decomposition.
- Decision:
  - Add gate timeboxes and low-risk fast-lane eligibility rules.
  - Keep product user story at Plan Gate, and generate implementation stories after UX Gate.
  - Require an Implementation Story Pack for non-trivial slices before Build Gate.
- Consequences:
  - Faster build-start clarity and reduced rework for Feature Engineer.
  - Slightly more structure in issue/update workflow.
- Follow-up:
  - Track lead time and rework over next 3 slices to validate impact.

## 2026-03-26 - UX Artifact Ownership Enforcement and Guard Script
- Status: Accepted
- Context: A process breach occurred when a non-UX role created a slice UX spec before UX Gate execution.
- Decision:
  - Enforce explicit ownership rule: only UX Strategist may create or author `docs/ux-spec-*.md`.
  - Require non-UX roles to keep UX references as `TBD` until UX Gate outputs exist.
  - Add executable guard `scripts/validate-process-guards.sh` to detect current-state and UX artifact mismatch for the active slice.
- Consequences:
  - Reduces cross-role process drift for UX artifacts.
  - Adds one lightweight verification step when governance artifacts are touched.
- Follow-up:
  - Expand guard checks after next 2 slices to cover issue-body link consistency.

## 2026-03-27 - Hybrid UX Artifact Model (Figma-First + Minimal UX Contract)
- Status: Accepted
- Context: Figma-only artifacts are strong for visual intent but weaker for deterministic agent implementation of edge cases and traceability.
- Decision:
  - Adopt hybrid UX model as default.
  - Figma is the primary visual source for layout/style decisions.
  - `docs/ux-spec-*.md` remains required as a minimal UX contract for non-visual behavior, accessibility, responsiveness, state handling, and code translation mapping.
  - Remove waiver-oriented language from default UX Gate expectations.
- Consequences:
  - More reliable agentic implementation with clearer automation-friendly constraints.
  - Slight documentation overhead, reduced by keeping the contract minimal.
- Follow-up:
  - After next 2 slices, review whether template sections can be further reduced without hurting implementation reliability.

## 2026-03-27 - Hybrid Terminology Alignment and Issue Consistency Guards
- Status: Accepted
- Context: Two residual risks remained: naming ambiguity from `ux-spec-*.md` path retention and missing automated checks for issue UX/Figma field consistency.
- Decision:
  - Standardize user-facing language to "UX contract" while retaining `docs/ux-spec-*.md` path for compatibility.
  - Update issue template labels to "UX Contract Link" and "Figma Link".
  - Extend `scripts/validate-process-guards.sh` to enforce issue body consistency with active gate and UX contract file state.
- Consequences:
  - Lower contributor confusion without introducing file rename churn.
  - Stronger process drift detection before task finalization.
- Follow-up:
  - After next slice, evaluate whether broad historical-slice checks should be added to the same script.

## 2026-03-27 - Plan Gate Ownership Clarification and New Requirement Kickoff
- Status: Accepted
- Context: Role overlap between Studio Architect and Product Manager created ambiguity when starting new requirements.
- Decision:
  - Clarify decision split: Studio Architect owns gate transitions and sequencing; Product Manager owns requirement quality and FR/AC integrity.
  - Add explicit "New Requirement Start Flow" in `docs/roles-and-gates.md`.
  - Add explicit "New Requirement Kickoff" sequence in `docs/requirements-lifecycle.md`.
  - Add required issue fields: `Gate Decision Owner` and `Requirements Owner` in `.github/ISSUE_TEMPLATE/feature-slice-intake.yml`.
- Consequences:
  - Cleaner entry point for new requirement discussions.
  - Lower handoff ambiguity before UX and Build Gates.
- Follow-up:
  - Validate across next 2 slices whether fallback usage (Studio Architect as requirements owner) remains rare and justified.

## 2026-03-27 - Architect-Centric Orchestration Automation
- Status: Accepted
- Context: Human owner requested a single discussion interface through Studio Architect, with delegated roles reporting back through architect and preflight checks before gate transitions.
- Decision:
  - Enforce Studio Architect as primary human-facing orchestrator in shared protocol and role docs.
  - Require delegated roles to escalate unresolved questions to Studio Architect first.
  - Add required gate handoff packet format in `docs/requirements-lifecycle.md`.
  - Add `scripts/preflight-gate-transition.sh` and require it before updating `Next Gate` in `docs/current-state.md`.
- Consequences:
  - More deterministic gate flow with lower direct role-to-human interruption.
  - Stronger guardrails before gate-state updates.
- Follow-up:
  - After next slice, evaluate whether late-gate (`risk`/`ship`) checks should be expanded in preflight automation.

## 2026-03-27 - High-Rigor Plan Gate Interrogation Standard
- Status: Accepted
- Context: Efficient downstream delegation requires stronger ambiguity removal at Plan Gate so later gates do not repeatedly bounce back to the human owner.
- Decision:
  - Assign explicit responsibility to Studio Architect for high-rigor Plan Gate interrogation.
  - Add mandatory Plan Gate challenge checklist in `docs/roles-and-gates.md`.
  - Require no gate advancement while material ambiguity remains unresolved unless escalated and clarified by the human owner.
- Consequences:
  - Higher clarity before UX and Build delegation.
  - Slightly higher upfront questioning effort at Plan Gate.
- Follow-up:
  - Review after next 2 slices whether clarification loops after Plan Gate decreased.

## 2026-03-27 - Debate Screen UX Direction Clarifications
- Status: Accepted
- Context: UX Gate required closure on copy labels and desktop layout behavior before UX contract authoring.
- Decision:
  - Use labels: "For" and "Against".
  - Use desktop layout: two columns with For on left and Against on right.
  - Keep mobile behavior unchanged: mixed chronological stream with For left and Against right alignment.
- Consequences:
  - Removes interpretation ambiguity for UX Strategist and Feature Engineer.
  - Enables deterministic UX contract completion for the active slice.
- Follow-up:
  - Reflect these decisions in UX contract and Figma frames during UX Gate execution.

## 2026-03-27 - Figma Connectivity Setup Kickoff
- Status: Accepted
- Context: Team chose to reduce manual fallback by setting up direct Figma connectivity for UX agent workflow.
- Decision:
  - Add explicit connectivity setup instructions to `docs/ux-figma-agentic-protocol.md`.
  - Add executable verification script `scripts/check-figma-connectivity.sh`.
  - Track connectivity completion in `docs/current-state.md` until verification passes.
- Consequences:
  - Clear path to enable agent-first UX artifact production.
  - Requires token/API configuration once per environment.
- Follow-up:
  - Run connectivity script after setting `FIGMA_ACCESS_TOKEN` and optional `FIGMA_FILE_KEY`.

## 2026-03-27 - Debate Screen UX Gate Rollback (Figma Mandatory)
- Status: Accepted
- Context: Human owner required strict Figma mandatory policy and blocked progression when only placeholder Figma links were available.
- Decision:
  - Revert active slice progression back to UX Gate.
  - Do not allow UX Gate exit or Build Gate entry with placeholder Figma values (for example `Pending-manual-link`).
  - Require final real Figma file/frame URL in issue and UX contract before gate advancement.
- Consequences:
  - Prevents premature Build Gate starts without final design artifact linkage.
  - Adds stricter gating discipline for UX completion criteria.
- Follow-up:
  - Update guard/preflight scripts so placeholder Figma values fail gate checks.

## 2026-03-27 - Subagent Usage Policy (Architect-Controlled)
- Status: Accepted
- Context: Team requested clarity on when to use subagents versus single-agent orchestration.
- Decision:
  - Keep Studio Architect as the single authoritative writer for gate transitions, state updates, and final artifact synchronization.
  - Allow subagents only for bounded discovery/analysis tasks.
  - Treat subagent outputs as advisory context requiring Studio Architect validation before authoritative updates.
- Consequences:
  - Retains speed benefits from delegated analysis while reducing multi-writer drift risk.
  - Preserves deterministic gate control through one orchestrator.
- Follow-up:
  - Reassess after next 2 slices whether discovery latency improved without increasing governance corrections.

## 2026-03-27 - Supervised Parallel Writer Mode (Architect-Controlled)
- Status: Accepted
- Context: Team requested a more team-like execution model where role owners can clear independent queues in parallel.
- Decision:
  - Keep Studio Architect as single authority for gate transitions, state updates, and final artifact synchronization.
  - Allow supervised parallel writers for independent, architect-scoped packets.
  - Require explicit packet scope, temporary file lock ownership, and Studio Architect reconciliation before authoritative sync.
- Consequences:
  - Increases throughput for independent workstreams while keeping deterministic governance control.
  - Adds reconciliation overhead and requires stricter packet discipline.
- Follow-up:
  - Reassess after next 2 slices for queue throughput gain versus reconciliation overhead.
