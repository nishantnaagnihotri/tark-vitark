# Operating Model

The canonical operating agreement lives in `AGENTS.md`.

This file defines how to preserve practical continuity across chats while avoiding duplication and drift.

If additional guidance is needed for a specific role, put it in the corresponding custom agent file under `.github/agents/*.agent.md`.

## Startup Protocol
Every new chat should load context in this order:

1. `AGENTS.md`
2. `docs/current-state.md`
3. `docs/functional-requirements-index.md`
4. active slice specs (`docs/functional-requirements-*.md`, `docs/ux-spec-*.md`)
5. `docs/decision-log.md`

This ensures the chat starts from current state first, then drills down.

## Persistence Protocol
All significant outputs must be write-through persisted in repo docs during the same task.

- Requirements updates: requirements index + active slice requirement spec
- UX updates: active UX spec
- Process updates: decision log and patterns/roles docs
- State updates: current-state doc

## Canonical Artifacts
- `docs/current-state.md` for one-page startup context
- `docs/functional-requirements-index.md` for cross-slice requirement registry
- `docs/decision-log.md` for durable decisions
- `docs/functional-requirements-*.md` and `docs/ux-spec-*.md` for slice-level detail
