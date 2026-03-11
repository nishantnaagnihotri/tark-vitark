# tark-vitark

Project reset to a clean foundation for fresh development.

## Agentic Collaboration Contract

Shared protocol for all future work:

- `AGENTS.md`
- `.github/copilot-instructions.md`

Current primary agent:

- `.github/agents/studio-architect.agent.md`

Additional role-specific agents:

- `.github/agents/ux-designer.agent.md`

## Agent Selection Guide

- Use `.github/agents/studio-architect.agent.md` for end-to-end delivery: planning, architecture, implementation, tests, docs, and release-ready increments.
- Use `.github/agents/ux-designer.agent.md` for UI/UX-heavy work: user flows, interaction behavior, accessibility, responsive layouts, and visual direction.
- If a task spans both, start with `studio-architect` for scope and sequencing, then hand focused interface tasks to `ux-designer`.

## Current State

- Previous React/Cra scaffolding has been removed.
- The repository is ready to initialize a new stack from scratch.

## Next Step

Define the first vertical slice (product goal + stack choice), then scaffold only what is needed for that slice.
