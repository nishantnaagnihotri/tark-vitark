---
name: domain-ownership-governance
description: "Domain ownership governance workflow: enforce cross-agent domain boundaries, route Figma write ownership, prevent cross-domain artifact edits, and apply orchestrator-specific execution limits. Use when: validating ownership boundaries, deciding cross-domain routing, or reviewing agent scope compliance."
---

# Domain Ownership Governance Workflow

Use this skill to apply consistent domain boundaries and cross-agent routing rules across all gates.

## When To Use

- Validating whether a task belongs to the current agent domain
- Deciding routing for cross-domain changes or ownership conflicts
- Enforcing Figma write ownership and design proposal boundaries
- Reviewing artifact-edit ownership before applying updates

## Domain Ownership Policy

No agent may perform work owned by another agent's domain. Each agent executes only within its own domain and delegates cross-domain tasks to the owning agent via the orchestrator.

### Universal Rules (all agents)

1. **Figma write operations:** ALL Figma MCP write operations (creation, editing, restructuring, alignment, variable/binding changes — regardless of size, including both design frames and DS library) are executed by `ux-agent`, exclusively when performing Gate 3A UX work using the `ux-design-execution` skill. No other agent invokes Figma write operations.
2. **Figma read access:** Agents whose domain requires Figma data (Design QA Agent, Dev Agent) may use Figma MCP only for read-only operations (screenshots, metadata, design context) for their own domain work. Even if the available MCP tool grant is broader, those agents must not invoke write operations or write-capable endpoints directly; any creation, editing, restructuring, alignment, variable/binding change, or other write need must be reported to the Orchestrator for routing to `ux-agent`. The Orchestrator remains read-only for Figma operations and does not perform those writes directly.
3. **Design proposals:** Visual and UX design execution (flows, states, Figma frames) is performed by `ux-agent` in Gate 3A using the `ux-design-execution` skill. Other agents do not originate design proposals or execute Figma frame work.
4. **Artifact updates:** Each gate artifact's content is authored only by its owning agent. PRD changes → PRD Agent. UX/Gate 3A artifacts (`03-ux.md`) → UX Agent. Design QA changes → Design QA Agent. Architecture changes → Architecture Agent. Runtime QA verdict changes → Runtime QA Agent. No agent edits another agent's gate artifact content. (The orchestrator may mechanically persist/commit returned `ux-agent` output to the slice folder — this is not a content edit.)
5. **No threshold exception:** There is no "small change" threshold below which cross-domain direct action is acceptable. Even minor tweaks route through the owning agent.
6. **Escalation path:** If an agent identifies a needed change outside its domain, it reports the gap to the orchestrator, who routes to the owning agent. Agents do not self-serve across boundaries.

### Orchestrator-Specific Rules

7. **Orchestrator scope:** Supervise agents, enforce gates, challenge Product Owner for clarity, decide general direction, facilitate discussion between Product Owner and agent team. Route domain work to the owning agent.
8. **Figma reads for validation only:** Orchestrator uses Figma MCP read-only for gate validation and spot-checks. Gate 3A Figma write ownership remains with `ux-agent`.
9. **No design origination outside routing/validation:** Orchestrator does not originate visual or UX design proposals directly. It routes Gate 3A design work to `ux-agent` and validates the returned package.
10. **No artifact editing:** Orchestrator does not directly edit other agents' gate-owned artifacts (`01-requirement.md`, `02-prd.md`, etc.). Route updates through the owning agent. Verbatim mechanical persistence of returned `ux-agent` output into `03-ux.md` is allowed.