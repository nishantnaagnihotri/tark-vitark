---
name: gate-recovery-and-resume
description: "Gate recovery and resume workflow: recover partial artifacts, handle Figma MCP failures, handle Copilot poll timeouts, validate .figma-config.local on resume, and escalate to Product Owner when blocked. Use when: a gate fails mid-run, MCP/tool calls fail, review polling times out, or resuming Gate 3+ work."
---

# Gate Recovery And Resume

Use this skill for failure handling and safe recovery before continuing gate progression.

## When To Use

- An agent fails mid-gate and a partial artifact exists
- Figma MCP calls fail during gate work
- Copilot review polling times out
- You are resuming before any Gate 3 or later work
- You need explicit escalation criteria

## Recovery Protocol

### Partial Gate Artifact

1. If an agent fails mid-gate and a partial artifact is written to `docs/slices/<slice-name>/`, do not advance gate status.
2. Mark the artifact with `STATUS: INCOMPLETE` at the top.
3. Re-invoke the same agent with the same inputs and overwrite the incomplete artifact.
4. If re-invocation fails twice, escalate to Product Owner for manual intervention.

Gate 3A-specific recovery rule:

5. If `docs/slices/<slice-name>/03-ux.md` exists with `STATUS: IN PROGRESS` or `STATUS: INCOMPLETE`, treat it as the authoritative recovery source for the async UX lane. Re-invoke `ux-agent` with that artifact as required context; do not restart Gate 3A from chat history alone.
6. If the partial `03-ux.md` is missing the latest checkpoint metadata (`Last Updated`, `Checkpoint Ledger`, current design access snapshot, or checkpointed `Orchestrator Resume Packet`), first preserve the file as `STATUS: INCOMPLETE`, then re-invoke `ux-agent` to reconstruct and overwrite it from the surviving artifact and Figma state.

### Figma MCP Failure

1. If a Figma MCP call fails, retry once.
2. If retry fails, report the MCP error to Product Owner and pause gate progression.
3. Do not fall back to screenshot-only approximation without explicit Product Owner approval.

### Copilot Review Poll Timeout

1. If the bounded polling window times out, report `status: timeout` and pause.
2. If timeout occurs three consecutive times for the same PR, escalate with options: extend wait, accept current review state, or investigate service status.
3. Do not silently skip the review loop.

### Silent Async Dev Lane

Use this ladder when a Gate 5 async dev lane stays quiet for a long interval and no PR is visible yet.

Definitions:

- `silent wake`: an alarm fires, the dev terminal is still running, and there is no new terminal output, PR, or issue activity proving completion.
- `silent-progress`: the lane is quiet externally, but the prepared branch or worktree shows real local progress such as changed files, new commits, or a valid task worktree.
- `suspect-stalled`: the lane is quiet externally and the prepared branch or worktree shows no useful progress, or the terminal exited without producing a PR.

Recovery ladder:

1. First silent wake (about 10 minutes): do external-only checks. Poll the dev terminal once and cross-check GitHub for a task PR or issue activity. If still unresolved, re-arm the alarm and wait.
2. Second silent wake (about 20 minutes): re-arm first, then do exactly one read-only salvage probe in the existing prepared branch or worktree. Check branch name, `git status --short`, changed files, and the latest commit. Do not edit files, run tests, kill the lane, or open a competing lane during this probe.
3. If the salvage probe shows useful local progress, classify the lane as `silent-progress`, keep the existing lane alive, and continue waiting with alarms.
4. Third silent wake (about 30 minutes total) or terminal exit without a PR: if useful local progress exists, launch one recovery pass in the same prepared branch or worktree with instructions to inspect and reuse the existing state first and only rewrite code if a local defect blocks PR creation or review readiness.
5. If the third silent wake shows no useful progress, or the exited lane left no usable worktree state, kill the stale lane and relaunch one fresh dev pass in the same prepared branch or worktree.
6. Only one automatic recovery pass is allowed. If that recovery pass also stalls, exits without a PR, or fails to become review-ready, escalate to Product Owner with the evidence trail.
7. Terminal silence alone is not proof of failure. A task PR, issue activity, local commits, or worktree diffs outweigh missing terminal chatter.

## Resume Validation

On resume, before any Gate 3 or later work:

1. Validate that `.figma-config.local` exists and is parseable as key-value configuration.
2. Before the first Gate 3 bootstrap, require `project_name` and `plan_key`. `design_system_library_file_key` may be absent or empty at this stage and must not block the first Gate 3 bootstrap.
3. After the first Gate 3 bootstrap, require `design_system_library_file_key` to be present and non-empty.
4. If any key that is required for the current stage is missing, empty, or malformed, report the gap and block Gate 3 progression until resolved.

## Escalation

Escalate to Product Owner when:

1. Requirement readiness is blocked.
2. Scope, security, or architecture tradeoffs need human choice.
3. Test and review findings conflict with delivery timeline.

## Reporting Checklist

When pausing for recovery or escalation, report:

1. Failure mode and affected gate/substep.
2. Recovery actions attempted.
3. Current gate status (Ready, Needs Clarification, or Blocked).
4. Explicit owner action needed to continue.
