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
