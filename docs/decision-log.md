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
