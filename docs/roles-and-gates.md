# Roles and Gates

## Purpose
Define a lightweight, scalable role model for supervised AI-driven delivery.

This document is designed for incremental adoption: start with a core set of roles and activate additional roles only when risk or complexity justifies it.

Agent-first execution is mandatory by default. Manual steps are fallback-only for external platform blockers and must be documented with an automation follow-up.

## Functional Requirements Ownership
To keep slices implementation-ready, every non-trivial slice should have a short Functional Requirements Spec.

- Ownership can be fulfilled by a dedicated Product Manager role or by the Studio Architect when the team is lean.
- The artifact should be concise, testable, and directly usable by UX, engineering, and QA.
- Use `docs/functional-requirements-template.md` as the default template.
- Track approved requirements in `docs/functional-requirements-index.md` to preserve continuity across sessions.
- Inherit baseline non-functional requirements from `docs/non-functional-requirements-baseline.md` by default.

UX ownership boundary:
- Product Manager defines requirement intent and acceptance criteria.
- Product Manager does not author the final UX contract.
- UX Strategist authors and owns the final UX contract during UX Gate.
- Non-UX roles must not create or author `docs/ux-spec-*.md`; keep links as `TBD` until UX Gate outputs exist.

## Role Boundary: Studio Architect vs Product Manager

Studio Architect accountability:
- Owns gate transition decisions (Plan -> UX -> Build -> Review -> Ship).
- Owns slice sizing, sequencing, and risk-based role activation.
- Owns final gate sign-off and lifecycle continuity in `docs/current-state.md`.

Product Manager accountability:
- Owns requirement quality before Build Gate.
- Owns problem framing, scope boundaries, FR IDs, and measurable ACs.
- Owns requirement truth in requirements artifacts and issue traceability fields.

Working rule:
- Product Manager defines what/why and acceptance quality.
- Studio Architect decides when scope and artifacts are sufficient to advance gates.

## Orchestration Protocol (Single Human Interface)

- Human owner primarily interacts with Studio Architect.
- Delegated roles do not directly request decisions from the human owner.
- Delegated roles return findings, blockers, and open questions to Studio Architect.
- Studio Architect either resolves within existing contracts or escalates to the human owner.
- Escalation is required when unresolved ambiguity affects:
  - scope or acceptance criteria
  - UX direction approval
  - risk activation or supervision-gate triggers
  - gate transition readiness

## New Requirement Start Flow

When a new requirement is introduced, start with this sequence:
1. Initiate with Studio Architect using a short idea brief (problem, target user, desired outcome).
2. Studio Architect frames candidate slice boundary and confirms Plan Gate intake path.
3. Product Manager creates or updates the slice requirements spec and FR IDs.
4. Create/update execution issue using `.github/ISSUE_TEMPLATE/feature-slice-intake.yml`.
5. Keep UX Contract Link and Figma Link as `TBD` until UX Gate outputs exist.
6. Studio Architect checks Plan Gate exit criteria and records next-gate decision.
7. Before changing `Next Gate` in `docs/current-state.md`, run `./scripts/preflight-gate-transition.sh <target-gate>`.

## Core Role Set

1. Studio Architect
- Owns slice planning, scope control, and final sign-off.
- Maintains lifecycle continuity across UX, implementation, review, and release.
- Ensures each slice has clear acceptance criteria and measurable outcomes.
- Owns Plan Gate interrogation depth before downstream delegation.

2. Product Manager
- Owns problem framing, functional scope definition, and acceptance criteria quality.
- Ensures requirements are clear, testable, and aligned with user outcomes.
- Maintains the Functional Requirements Spec and resolves requirement ambiguity before Build Gate.

3. UX Strategist
- Converts product intent into concrete user flows and interaction states.
- Defines copy intent, empty/loading/error states, and accessibility expectations.
- Produces and owns the final UX contract per slice.
- Leads creative iteration rounds with the user until UX direction is approved.

4. Feature Engineer
- Implements approved slice scope end-to-end.
- Keeps changes reversible, modular, and testable.
- Adds required tests and run instructions.

5. Quality Engineer
- Designs and validates test coverage for the critical path.
- Verifies acceptance criteria and regression safety.
- Documents test results and unresolved risks.

6. Code Steward
- Reviews maintainability, architectural fit, and code clarity.
- Checks modular boundaries and avoids unnecessary complexity.
- Ensures docs and implementation stay aligned.

7. Security Steward
- Reviews auth/session implications, data exposure, secrets handling, and dependency risk.
- Runs targeted threat-minded checks for high-risk changes.
- Required for security-sensitive slices.

8. Release Engineer
- Owns build, migration safety checks, rollout plan, and rollback plan.
- Verifies release readiness and operational safety.
- Required when deployment risk is non-trivial.

## Optional Specialized Roles
Activate only when justified by slice risk/profile.

1. Performance Engineer
- Focuses on latency, throughput, bundle size, query efficiency, and resource cost.

2. Accessibility Reviewer
- Performs accessibility checks for keyboard navigation, focus, semantics, and assistive technology compatibility.

3. Reliability Engineer
- Focuses on observability, failure modes, SLO/SLI alignment, and incident readiness.

4. Data Steward
- Owns event taxonomy, analytics quality, schema evolution, and data consistency.

5. Documentation Steward
- Ensures runbooks, onboarding docs, and architecture notes remain current and useful.

## Recommended Adoption Sequence

Phase 1: Default active roles
- Studio Architect
- Product Manager
- UX Strategist
- Feature Engineer
- Quality Engineer
- Code Steward

Phase 2: Mandatory conditional gates
- Security Steward: activate for security-sensitive or trust-boundary changes.
- Release Engineer: activate for operationally risky deploys and migrations.

Phase 3: Contextual specialists
- Performance Engineer, Accessibility Reviewer, Reliability Engineer, Data Steward, Documentation Steward based on slice needs.

## Slice Gate Model
Every slice should pass through these gates.

## Throughput Controls

### Gate Timeboxes (Default)
- Plan Gate: <= 1 working day
- UX Gate: <= 2 iteration rounds by default, <= 1 working day per round
- Build Gate: <= 3 working days for one slice
- Review Gate: <= 1 working day
- Risk Gate (when active): <= 1 working day

If a gate exceeds timebox, split scope or log an explicit exception in `docs/decision-log.md`.

### Fast-Lane Eligibility (Low-Risk Slices)
Use fast-lane only when all are true:
- no auth/security/billing/data migration impact
- no new external integration
- no major UX complexity (single-path UI or backend-only)
- expected implementation <= 1 working day

Fast-lane behavior:
- keep FR IDs and ACs mandatory
- keep required tests mandatory
- allow compact UX artifact if UX Strategist marks full spec unnecessary
- still require decision-log and current-state synchronization

1. Plan Gate
- Owner: Studio Architect
- Exit criteria:
  - Problem statement, target user, and scope are explicit.
  - Product user story is captured at outcome level.
  - Functional Requirements Spec is complete and linked.
  - Baseline NFR inheritance is acknowledged; any exception is documented.
  - Functional Requirements Index entry is created or updated for the slice.
  - Acceptance criteria are measurable.
  - Risk profile and required roles are declared.
  - Architect challenge checklist is completed; unresolved material ambiguity is either resolved or escalated to the human owner.

### Plan Gate Challenge Checklist (Studio Architect)
- What exact user problem is in scope for this slice now?
- Which user/persona is in scope, and who is explicitly out of scope?
- What measurable outcome defines success for this slice?
- What is explicitly out of scope to prevent drift?
- Which acceptance criteria are objectively testable?
- Which edge cases could cause interpretation drift later?
- Which dependencies or blockers could stall downstream gates?
- Which risks require conditional role activation (Security/Release/Risk Gate)?

2. UX Gate
- Owner: UX Strategist
- Exit criteria:
  - UX direction is explicitly approved after iteration rounds when needed.
  - Figma artifact is the primary visual source for the slice.
  - Minimal UX contract is authored or finalized by UX Strategist in `docs/ux-spec-*.md`.
  - Minimal UX contract captures non-visual implementation constraints: states, responsiveness, accessibility, and copy intent.
  - Minimal UX contract includes Figma link plus code translation mapping section.
  - UX contract is linked in slice docs.

3. Build Gate
- Owner: Feature Engineer
- Exit criteria:
  - Implementation Story Pack exists and maps FR/AC/UX into concrete build tasks.
  - Implementation satisfies UX contract and build contract.
  - Tests for critical path are present.
  - Non-goals and boundaries are respected.

4. Review Gate
- Owners: Code Steward + Quality Engineer
- Exit criteria:
  - Maintainability and architecture checks pass.
  - Acceptance criteria and regression checks pass.
  - Known risks and follow-ups are documented.

5. Risk Gate (Conditional)
- Owners: Security Steward and/or Release Engineer
- Exit criteria:
  - Security checks complete where applicable.
  - Rollout/rollback and migration safety validated where applicable.

6. Ship Gate
- Owner: Studio Architect
- Exit criteria:
  - Required gate approvals recorded.
  - Decision log updated.
  - Next slice inputs captured.

## Role Activation Triggers
Use these triggers to avoid process overhead.

- Security Steward trigger:
  - Auth/session model changes
  - Secret handling changes
  - Sensitive data flow changes
  - New external integrations crossing trust boundaries

- Release Engineer trigger:
  - Non-trivial migrations
  - Infra/runtime config changes
  - Rollout requiring staged release or rollback choreography

- Performance Engineer trigger:
  - User-facing latency regressions
  - Resource cost spikes
  - Large frontend bundles or heavy query paths

- Product Manager trigger (when PM is not default-active):
  - Scope ambiguity or conflicting stakeholder expectations
  - New feature area without existing requirement patterns
  - Repeated rework due to unclear acceptance criteria

- Accessibility Reviewer trigger:
  - Critical user-facing flows
  - Public-facing features with broad usage

- Reliability Engineer trigger:
  - Slices introducing background jobs, async workflows, or higher operational criticality

## Per-Role Slice Checklist Template
Copy this section into slice docs and fill per role.

### Studio Architect
- [ ] Scope is small, reviewable, and measurable.
- [ ] Acceptance criteria are explicit.
- [ ] Required roles selected based on triggers.
- [ ] Final gate decision and follow-ups recorded.

### Product Manager
- [ ] Problem statement and user outcome are explicit.
- [ ] In-scope and out-of-scope are defined.
- [ ] Acceptance criteria are testable and unambiguous.
- [ ] Functional Requirements Spec is linked and current.
- [ ] Functional Requirements Index is updated with IDs, status, and links.
- [ ] Baseline NFR inheritance is explicit; additions/deviations are documented.

### UX Strategist
- [ ] Primary flow documented.
- [ ] Empty/loading/error states documented.
- [ ] Mobile and accessibility expectations documented.
- [ ] Creative direction reviewed and approved with user.
- [ ] UX artifacts linked.
- [ ] Figma artifact is complete and linked.
- [ ] Minimal UX contract is complete for non-visual behavior and code translation mapping.

### Feature Engineer
- [ ] Implementation Story Pack is present and concrete before coding starts.
- [ ] Implementation aligns with UX and contract.
- [ ] Boundaries/non-goals respected.
- [ ] Tests added or updated.
- [ ] Run/verification steps documented.

### Quality Engineer
- [ ] Critical path tests pass.
- [ ] Regression checks executed.
- [ ] Defects or risks documented.
- [ ] Approval/rejection rationale recorded.

### Code Steward
- [ ] Code is maintainable and readable.
- [ ] Module boundaries and architecture fit are preserved.
- [ ] Unnecessary abstractions/dependencies avoided.
- [ ] Docs and code are aligned.

### Security Steward (when active)
- [ ] Trust boundary impacts reviewed.
- [ ] Secrets/data exposure checks complete.
- [ ] Auth/session implications reviewed.
- [ ] Security risks and mitigations documented.

### Release Engineer (when active)
- [ ] Build and deploy path validated.
- [ ] Migration safety reviewed.
- [ ] Rollback plan defined.
- [ ] Release risk acknowledged.

## Decision Persistence
To preserve continuity across sessions, treat these as mandatory updates per slice:

1. Append decisions to `docs/decision-log.md`.
2. Update durable patterns in `docs/patterns.md`.
3. Update `docs/functional-requirements-index.md` for requirement status changes.
4. Record role trigger refinements in this file when process changes.

This creates a stable source of truth for future delegation and automation.
