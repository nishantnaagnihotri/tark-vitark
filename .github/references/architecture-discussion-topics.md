# Architecture Discussion Topics

Use this checklist during Architecture Agent Discussion Phase before plan freeze.

## Tier 1: System Design

1. Scalability model: expected growth, bottlenecks, and scaling strategy.
2. Availability and fault tolerance: failure modes, graceful degradation, retry/fallback strategy.
3. Data consistency and integrity: strong vs eventual requirements and chosen approach.
4. Service/component boundaries: ownership seams and integration boundaries.
5. Data flow and coordination: synchronous vs asynchronous coordination choices.
6. Security posture: authn/authz, validation, data exposure, and mitigation plan.
7. Observability strategy: required metrics, logs, traces, and alerting hooks.

## Tier 2: Solution Architecture

1. Architectural pattern selection and rationale.
2. Technology and library options with tradeoffs and recommendation.
3. Integration contracts: protocol, payloads, errors, and versioning.
4. Deployment topology and required infrastructure changes.
5. State management strategy: ownership and lifecycle of state.
6. Migration/backward-compatibility strategy (flags, versioning, migrations).

## Tier 3: Implementation Design

1. File/folder structure and repository placement.
2. Data shape decisions and schema/type definitions.
3. Interface contracts: signatures, events, payloads, error paths.
4. Cross-cutting concerns: error handling, logging, auth propagation, caching.
5. Existing codebase conventions and compatibility constraints.

## Decision Recording Format

For every architecture-impacting decision:

1. Question
2. Options considered
3. Tradeoffs
4. Recommended option
5. Product Owner decision
6. Rationale and implications
