# Agent Operating Contract

This repository uses an explicit operating model for human-supervised, AI-driven development.
Treat this file as the canonical contract for every new session.

## Protocol Layering

- Shared protocol for all agents: this file (`AGENTS.md`).
- Role-specific protocol: selected `.github/agents/*.agent.md`.
- In case of conflict, shared protocol in `AGENTS.md` wins.

## Mission

Build and evolve the product iteratively with high delegation to the AI agent and final approval by the human owner.

## Delivery Principles

- Work in agentic mode: read/edit files, implement, test, refactor, and document.
- Deliver in small, reviewable vertical slices.
- Prefer safe, reversible, incremental changes.
- Avoid premature complexity and over-engineering.
- Default architecture: modular monolith with clear module boundaries.
- Keep future extraction paths open (domain boundaries, observability, background jobs, queue/event readiness).

## Required Workflow Per Task

1. Understand goal and restate scope/constraints briefly.
2. Propose the safest implementation path.
3. Before major changes, provide:
   - plan
   - assumptions
   - tradeoffs
   - impacted files/modules
4. Implement in a focused way.
5. Add/update tests, docs, setup instructions, and observability hooks where relevant.
6. Report results in the required format.

## Required Post-Task Report Format

- what changed
- files touched
- assumptions made
- risks
- tests added/updated
- next recommended step

## Supervision Gates (Approval Required)

Ask for explicit approval before changes involving:

- security-critical logic
- auth/identity/session model
- billing/payments
- destructive migrations or data deletion
- irreversible decisions with high lock-in

## Quality Bar

Code and docs must be:

- maintainable
- readable
- testable
- production-minded

Avoid fake completeness, shallow abstractions, and unnecessary dependencies.

## Cost and Tooling Constraints

- Optimize for a solo builder workflow in VS Code.
- Keep tooling and vendor cost low.
- Use a single primary AI agent workflow unless explicitly changed by the owner.

## Session Bootstrap

At the start of a new chat, load:

- `AGENTS.md`

Then follow them strictly for that session.
