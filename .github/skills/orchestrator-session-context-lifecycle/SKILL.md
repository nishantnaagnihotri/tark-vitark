---
name: orchestrator-session-context-lifecycle
description: "Orchestrator session and context lifecycle workflow: run resume protocol, manage part-time session checkpoints, emit context updates, persist universal principles, and archive completed-slice logs. Use when: starting/resuming sessions, closing sessions, or maintaining orchestrator context after gate transitions."
---

# Orchestrator Session And Context Lifecycle Workflow

Use this skill to keep orchestrator sessions resumable, auditable, and consistent across gate transitions.

## When To Use

- Starting or resuming an orchestrator activity
- Closing a part-time session checkpoint
- Recording gate transitions or major Product Owner decisions
- Archiving slice-specific context logs after Gate 6 completion

## Resume Protocol (Start Of Activity)

On first response in any new activity:

1. Read `.github/AGENTS.md`.
2. Read `.github/orchestrator-context.md`.
3. Identify current gate from context.
4. Read only gate-relevant agent files under `.github/agents/`.
5. Write `/memories/session/active-state.md` with current slice, gate, blockers, and next micro-goal.
6. Return a short resume snapshot:
   - current gate
   - known artifacts present or missing
   - immediate next micro-goal
   - blockers and owner decisions needed

## Part-Time Session Protocol

At session start:

1. Read latest checkpoint.
2. Propose one micro-goal only.
3. Select smallest next action.

At session end:

1. Record done, next, blockers.
2. Record unresolved assumptions.
3. Record the exact next handoff packet.

## Context Maintenance Protocol

After any gate transition or major owner decision:

1. Emit a `Context Update` block in plain markdown.
2. Include: date, gate status, artifact created or updated, open-questions state, next micro-goal.
   Include: major decision challenged, options presented, tradeoff summary, and owner-selected option.
3. Universal principle rule: if the transition/decision creates a reusable repo-wide principle, write it to `Known Rules From User Decisions` in `.github/orchestrator-context.md` immediately (not only in log entries).
4. Ask Product Owner to append the log block into `.github/orchestrator-context.md`.
5. Use the updated context file as next-session baseline.

## Log Archiving Protocol

When a slice reaches Gate 6 ✅ Complete:

1. Pre-archive: extract universal principles to `Known Rules From User Decisions` or permanent shared protocol docs before archiving.
2. Move only slice-specific log entries for that slice from `.github/orchestrator-context.md` to `docs/slices/<slice-name>/context-log.md`.
3. Keep repo-wide/global governance history in `.github/orchestrator-context.md` (or move old global history to `.github/orchestrator-context.archive.md` when needed).
4. Replace moved slice history with a one-line summary:
   `### <slice-name> — Gate 6 ✅ Complete (<date>) — Full log: docs/slices/<slice-name>/context-log.md`

Periodic archival rule:

5. If context update log grows beyond 15 entries or 100 lines without a slice completion event, archive oldest governance entries to `.github/orchestrator-context.archive.md` and keep a short summary line in `.github/orchestrator-context.md`.