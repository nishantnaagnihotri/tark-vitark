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

### Figma MCP Failure

1. If a Figma MCP call fails, retry once.
2. If retry fails, report the MCP error to Product Owner and pause gate progression.
3. Do not fall back to screenshot-only approximation without explicit Product Owner approval.

### Copilot Review Poll Timeout

1. If the bounded polling window times out, report `status: timeout` and pause.
2. If timeout occurs three consecutive times for the same PR, escalate with options: extend wait, accept current review state, or investigate service status.
3. Do not silently skip the review loop.

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
