---
name: alarm
description: "Parameterised self-wake alarm: arm an async sleep alarm at a caller-chosen interval so the orchestrator auto-resumes from any wait state. Use when: entering any wait state — PR review pending, agent build in progress, merge sequencing block, or any other bounded wait."
---

# Alarm Skill

## Purpose

The orchestrator has no built-in signal when background agents finish or when a Copilot review arrives. Without an alarm the only resumption path is a user ping. This skill converts every wait state into a bounded, self-resuming one.

## How To Arm

Step 1 — Run `date` to get the real current time (sync terminal call, before arming):

```bash
TZ=Asia/Kolkata date "+%H:%M %Z"
```

Step 2 — Arm the alarm (async):

```bash
sleep <SECONDS> && echo "ORCHESTRATOR WAKE CHECK: <one-line context>"
```

Run with `mode=async`. Record the terminal ID.

Step 3 — Immediately output the confirmation line — no exceptions:

```
Alarm armed — terminal <id>, armed at <HH:MM IST>, ETA <HH:MM IST>.
```

Both times must be derived from the actual `date` output — not guessed or calculated from context. Fabricating times is a protocol violation. Omitting either time is a protocol violation.

## Interval Reference

| Situation | Interval |
|---|---|
| Copilot review pending (new PR or post-push) | **180 s (3 min)** |
| Agent build in progress — no PR yet | **600 s (10 min)** |
| Near-complete review loop — last comment addressed, review re-requested | **180 s (3 min)** |
| Merge sequencing block — waiting for base branch merge | **300 s (5 min)** |

Use the table as the default. If urgency justifies a shorter interval, caller may override — document the reason inline.

## On Wake

When the alarm fires, VS Code sends a turn-start notification. On that turn:

1. Check the condition that triggered the wait (caller's skill defines what to check).
2. Act on findings autonomously without waiting for PO.
3. If the wait state has not resolved, re-arm immediately with the same interval.

## Re-Arm Rule

After every wake-and-check where the wait state has not resolved, re-arm before doing anything else. Never leave a wait state without an active alarm.

## Cancellation

When the wait state resolves, let the existing alarm expire harmlessly (do not attempt to kill the sleep terminal). Simply stop re-arming.

## Disallowed Alternatives

- Do **not** use sync `sleep` — it blocks the chat session.
