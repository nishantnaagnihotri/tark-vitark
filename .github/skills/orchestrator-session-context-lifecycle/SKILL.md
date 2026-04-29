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
5. If the current gate is Gate 3 and the slice has been routed through async `ux-agent` dispatch, inspect `docs/slices/<slice-name>/03-ux.md`. If it contains the final `UX Flow/State Package` and `Orchestrator Resume Packet`, Gate 3 is resumable. If it instead contains `STATUS: IN PROGRESS` with checkpoint metadata (`Last Updated`, `Checkpoint Ledger`, design access snapshot, and a checkpointed `Orchestrator Resume Packet`), treat Gate 3 as blocked pending UX completion but use that artifact as the rehydration source for the resumed UX lane. If neither final output nor checkpoint metadata is present, treat Gate 3 as blocked pending UX return and do not continue orchestration beyond reporting the blocker.
6. Write or update `/memories/session/active-state.md` with current slice, gate, blockers, and next micro-goal. When updating an existing file, preserve and merge the `## Pending Async Runs` section and all prior rows — do not replace the whole file.
7. Return a short resume snapshot:
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
4. **Pending slice-creation check (blocking):** Before writing the checkpoint, verify no gate closure in the current session declared "will continue as new slice" without a corresponding slice folder in `docs/slices/`. If a deferred slice folder is missing, create it (with at minimum `01-requirement.md`) before the checkpoint is written. Skipping this step is a protocol violation.

## Context Maintenance Protocol

After any gate transition or major owner decision:

1. Emit a `Context Update` block in plain markdown.
2. Include: date, gate status, artifact created or updated, open-questions state, next micro-goal.
   Include: major decision challenged, options presented, tradeoff summary, and owner-selected option.
3. Universal principle rule: if the transition/decision creates a reusable repo-wide principle, write it to `Known Rules From User Decisions` in `.github/orchestrator-context.md` immediately (not only in log entries).
4. Ask Product Owner to append the log block into `.github/orchestrator-context.md`.
5. Use the updated context file as next-session baseline.

## Async Run Tracking Protocol

Any parallel `run-agent.ts` dispatch via `run_in_terminal (mode=async)` creates a fire-and-forget terminal session. Without active tracking these terminal IDs get lost in chat history.

**On dispatch** — immediately after each `run_in_terminal` call returns a terminal ID, write or update `/memories/session/active-state.md` with an `## Pending Async Runs` section, recording each ID as `terminal-id`:

```
## Pending Async Runs

| terminal-id | dispatched | issue | purpose | status |
|-------------|------------|-------|---------|--------|
| <terminal-id> | <ISO timestamp> | #<n> | <one-line context> | running |
```

Do this before any other response content. If `/memories/session/active-state.md` does not exist yet, create it.

**On resume** — as the very first action of the Resume Protocol (before returning the resume snapshot), scan `## Pending Async Runs` in session memory. For each row with status `running`, call `get_terminal_output <terminal-id>` immediately and update the row to reflect the current state (`running` / `done` / `failed`). Surface any completed or blocked runs in the resume snapshot.

**Gate 3A UX-return check (mandatory on resume)** — if any pending or recently completed async run is a Gate 3A `ux-agent` dispatch, inspect `docs/slices/<slice-name>/03-ux.md` before resuming the gate. Terminal completion alone is not sufficient. If the file contains the final `UX Flow/State Package` and `Orchestrator Resume Packet`, mark Gate 3 as resumable but do not auto-progress; wait for explicit Product Owner instruction to resume. If it contains `STATUS: IN PROGRESS` with checkpoint metadata, keep Gate 3 blocked for progression but surface the artifact as the authoritative recovery source for the next UX pass. If the file or checkpoint metadata is missing, keep the async run record, mark Gate 3 as blocked pending UX return, and report that the orchestrator cannot resume until the UX artifact is reconstructed and/or persisted.

**On every turn while runs are active** — if `## Pending Async Runs` contains any row with status `running` at the start of a turn, do both of the following before processing the user message:

1. **Poll `get_terminal_output`** for each running terminal ID. If the process has exited (exit code present), surface it immediately. For Gate 3A `ux-agent` runs, update memory and inspect `03-ux.md`, then keep the gate paused pending explicit Product Owner resume. For other roles, continue with the next gate step autonomously.
2. **GitHub PR cross-check (parallel, always)** — list open PRs targeting the active slice branch (`slice/<slice-name>`). For each dispatched task issue number, check whether a PR that closes or references that issue is present. If a PR is found for a task whose terminal still appears running, treat that task as **done** regardless of terminal poll state — GitHub PRs are ground truth. Update session memory accordingly and continue autonomously.

**Why the cross-check is mandatory:** Terminal poll state is advisory — a process can exit without the shell reporting cleanly, or `get_terminal_output` can be called before the exit code is flushed. GitHub PRs are immutable timestamped evidence: agents always open a PR as their final act, so a PR closing the issue is definitive proof of completion. Both checks must run on every turn; neither alone is sufficient.

**On completion** — when `get_terminal_output` confirms a terminal has exited or GitHub PR cross-check marks a task done, update its row status in session memory and record the outcome (output preview or error). Do not delete the row — keep it as an audit trail for the session. For Gate 3A `ux-agent` completion, recording the outcome does not itself authorize gate progression; the Product Owner must explicitly ask to resume.

**Silent dev-lane tracking (Gate 5)** — when a running Gate 5 dev lane reaches a wake check with no visible PR and no meaningful new terminal output, track the quiet interval explicitly in session memory and follow the ladder below:

1. First silent wake: update the run status to `silent-1`, re-arm the 10-minute alarm, and do external-only checks.
2. Second silent wake: update the run status to `silent-2`, re-arm first, then run one read-only salvage probe on the assigned branch or worktree. If useful local progress exists, change the run status to `silent-progress`; otherwise keep `silent-2` and prepare for recovery on the next wake.
3. Third silent wake or terminal exit without PR: if useful local progress exists, dispatch one recovery pass in the same branch or worktree and mark the row `recovery-running`. If no useful progress exists, mark the old row `suspect-stalled`, kill that terminal, and dispatch one fresh canonical recovery pass in the same prepared branch or worktree.
4. If the recovery pass also stalls or exits without a task PR, mark the row `escalated-silent-stall` and stop automatic retries pending Product Owner direction.

Useful local progress means one or more of: non-trivial changed files in the assigned worktree, a new local commit on the assigned branch, or a valid prepared task worktree containing the expected implementation surface. Silence alone never outweighs this evidence.

**Standing rule** — never leave a turn where parallel `run-agent.ts` agents were dispatched without updating session memory with all terminal IDs. This is not optional. Forgetting to write terminal IDs to session memory is a protocol violation.

## Log Archiving Protocol

When a slice reaches Gate 6 ✅ Complete:

1. Pre-archive: extract universal principles to `Known Rules From User Decisions` or permanent shared protocol docs before archiving.
2. Move only slice-specific log entries for that slice from `.github/orchestrator-context.md` to `docs/slices/<slice-name>/context-log.md`.
3. Keep repo-wide/global governance history in `.github/orchestrator-context.md` (or move old global history to `.github/orchestrator-context.archive.md` when needed).
4. Replace moved slice history with a one-line summary:
   `### <slice-name> — Gate 6 ✅ Complete (<date>) — Full log: docs/slices/<slice-name>/context-log.md`

Periodic archival rule:

5. If context update log grows beyond 15 entries or 100 lines without a slice completion event, archive oldest governance entries to `.github/orchestrator-context.archive.md` and keep a short summary line in `.github/orchestrator-context.md`.
