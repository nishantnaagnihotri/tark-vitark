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

1. **Figma write operations:** ALL Figma MCP write operations (creation, editing, restructuring, alignment, variable/binding changes - regardless of size) route through Figma Agent. No other agent uses Figma write tools directly.
2. **Figma read access:** Agents whose domain requires Figma data (UX Agent, Design QA Agent, Dev Agent, Orchestrator) may use Figma MCP only for read-only operations (screenshots, metadata, design context) for their own domain work. Even if the available MCP tool grant is broader, those agents must not invoke write operations or write-capable endpoints directly; any creation, editing, restructuring, alignment, variable/binding change, or other write need must be routed to the Figma Agent. The orchestrator uses read-only Figma MCP access for gate validation and agent output spot-checks.
3. **Design proposals:** Visual and UX alternatives (layout options, component shapes, interaction patterns, label strategies) are UX Agent-owned. Other agents may challenge for clarity but do not originate design proposals.
4. **Artifact updates:** Each gate artifact's content is authored only by its owning agent. PRD changes -> PRD Agent. UX changes -> UX Agent. Design QA changes -> Design QA Agent. Architecture changes -> Architecture Agent. No agent edits another agent's gate artifact content. (The orchestrator may mechanically persist/commit an owning agent's output to the slice folder - this is not a content edit.)
5. **No threshold exception:** There is no "small change" threshold below which cross-domain direct action is acceptable. Even minor tweaks route through the owning agent.
6. **Escalation path:** If an agent identifies a needed change outside its domain, it reports the gap to the orchestrator, who routes to the owning agent. Agents do not self-serve across boundaries.

### Orchestrator-Specific Rules

7. **Orchestrator scope:** Supervise agents, enforce gates, challenge Product Owner for clarity, decide general direction, facilitate discussion between Product Owner and agent team. Route domain work - don't execute it.
8. **No Figma writes:** Orchestrator never uses Figma MCP write operations directly - all Figma write operations route through Figma Agent. Read-only Figma MCP access (screenshots, metadata, design context) is allowed for gate validation and spot-checks per Universal Rule #2.
9. **No design origination:** Orchestrator does not originate visual or UX design proposals. Route design questions to UX Agent.
10. **No artifact editing:** Orchestrator does not directly edit gate-owned artifacts (`01-requirement.md`, `02-prd.md`, `03-ux.md`, etc.). Route updates through the owning agent.