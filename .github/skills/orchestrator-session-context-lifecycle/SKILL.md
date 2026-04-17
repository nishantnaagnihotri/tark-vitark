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
5. Write or update `/memories/session/active-state.md` with current slice, gate, blockers, and next micro-goal. When updating an existing file, preserve and merge the `## Pending Async Runs` section and all prior rows — do not replace the whole file.
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

## Async Run Tracking Protocol

Any `run_async_subagents` call creates a fire-and-forget session. Without active tracking these `run-id` values get lost in chat history.

**On dispatch** — immediately after `run_async_subagents` returns a `runId`, write or update `/memories/session/active-state.md` with an `## Pending Async Runs` section, recording the value as `run-id`:

```
## Pending Async Runs

| run-id | dispatched | tasks | purpose | status |
|--------|------------|-------|---------|--------|
| <uuid> | <ISO timestamp> | <task ids> | <one-line context> | running |
```

Do this before any other response content. If `/memories/session/active-state.md` does not exist yet, create it.

**Tool naming note** — the canonical tool name is `mcp_agent-orchest_get_run_status`. References to `get_run_status` (short form) in this skill mean the same tool; use whichever name the current environment exposes. All other skills in this repo use the full canonical name.

**On resume** — as the very first action of the Resume Protocol (before returning the resume snapshot), scan `## Pending Async Runs` in session memory. For each row with status `running`, call `mcp_agent-orchest_get_run_status` immediately and update the row to reflect the current state (`running` / `done` / `pending-clarification` / `failed`). Surface any completed or blocked runs in the resume snapshot.

**On every turn while runs are active** — if `## Pending Async Runs` contains any row with status `running` at the start of a turn, do both of the following before processing the user message:

1. **Poll `mcp_agent-orchest_get_run_status`** for each running row. If the result has moved to `done` or `pending-clarification`, surface it immediately and continue with the next gate step autonomously.
2. **GitHub PR cross-check (parallel, always)** — list open PRs targeting the active slice branch (`slice/<slice-name>`). For each dispatched task issue number, check whether a PR that closes or references that issue is present. If a PR is found for a task that the poll still reports as `running`, treat that task as **done** regardless of poll status — GitHub PRs are ground truth. Update session memory accordingly and continue autonomously.

**Why the cross-check is mandatory:** `mcp_agent-orchest_get_run_status` has a known reliability gap — it can remain in state `running` indefinitely even after agents have finished and opened PRs. Relying on the poll alone causes the orchestrator to stall invisibly. The GitHub PR list is authoritative because agents always open a PR as their final act and the PR timestamp is immutable evidence of completion. Both checks must run on every turn; neither alone is sufficient.

**On completion** — when `mcp_agent-orchest_get_run_status` returns `done` or `pending-clarification` for a run, update its row status in session memory and record the outcome (output preview or challenge text). Do not delete the row — keep it as an audit trail for the session.

**Standing rule** — never leave a turn where `run_async_subagents` was called without updating session memory. This is not optional. Forgetting to write the `run-id` to session memory is a protocol violation.

## Log Archiving Protocol

When a slice reaches Gate 6 ✅ Complete:

1. Pre-archive: extract universal principles to `Known Rules From User Decisions` or permanent shared protocol docs before archiving.
2. Move only slice-specific log entries for that slice from `.github/orchestrator-context.md` to `docs/slices/<slice-name>/context-log.md`.
3. Keep repo-wide/global governance history in `.github/orchestrator-context.md` (or move old global history to `.github/orchestrator-context.archive.md` when needed).
4. Replace moved slice history with a one-line summary:
   `### <slice-name> — Gate 6 ✅ Complete (<date>) — Full log: docs/slices/<slice-name>/context-log.md`

Periodic archival rule:

5. If context update log grows beyond 15 entries or 100 lines without a slice completion event, archive oldest governance entries to `.github/orchestrator-context.archive.md` and keep a short summary line in `.github/orchestrator-context.md`.