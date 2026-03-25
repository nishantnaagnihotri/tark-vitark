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

## Core Role Set

1. Studio Architect
- Owns slice planning, scope control, and final sign-off.
- Maintains lifecycle continuity across UX, implementation, review, and release.
- Ensures each slice has clear acceptance criteria and measurable outcomes.

2. Product Manager
- Owns problem framing, functional scope definition, and acceptance criteria quality.
- Ensures requirements are clear, testable, and aligned with user outcomes.
- Maintains the Functional Requirements Spec and resolves requirement ambiguity before Build Gate.

3. UX Strategist
- Converts product intent into concrete user flows and interaction states.
- Defines copy intent, empty/loading/error states, and accessibility expectations.
- Produces a focused UX spec per slice.

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

1. Plan Gate
- Owner: Studio Architect
- Exit criteria:
  - Problem statement, target user, and scope are explicit.
  - Functional Requirements Spec is complete and linked.
  - Baseline NFR inheritance is acknowledged; any exception is documented.
  - Functional Requirements Index entry is created or updated for the slice.
  - Acceptance criteria are measurable.
  - Risk profile and required roles are declared.

2. UX Gate
- Owner: UX Strategist
- Exit criteria:
  - Primary flow and alternative states are specified.
  - Accessibility and responsive behavior expectations are stated.
  - UX spec is linked in slice docs.
  - UX spec includes Figma Production Contract and Code Translation Contract sections.
  - Figma artifact link is provided, or an explicit "Figma not required for this slice" waiver is documented with rationale.

3. Build Gate
- Owner: Feature Engineer
- Exit criteria:
  - Implementation satisfies UX spec and build contract.
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
- [ ] UX artifacts linked.
- [ ] Figma Production Contract and Code Translation Contract are complete.
- [ ] Figma artifact link or explicit waiver with rationale is documented.

### Feature Engineer
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
