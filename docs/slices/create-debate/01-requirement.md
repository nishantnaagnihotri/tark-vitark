# Gate 1 — Requirement — create-debate

**Date:** 2026-04-23
**Complexity:** Standard (full 6-gate flow)
**Gate Decision:** ✅ Pass — OQ-1 accepted for Gate 3 UX; OQ-2 and OQ-3 accepted for Gate 4 architecture

---

## Requirement Statement

Remove the hardcoded debate from the landing page and replace it with a debate-creation empty state. A user can create one active debate per device by entering a topic of 10 to 120 characters. Both the topic and all Tark/Vitark arguments persist in localStorage on that device. The Podium composer appears only after a debate exists. A user can start a new debate while another one is already running; completing that flow replaces the current topic and deletes all current Tark/Vitark arguments on that device. There is no argument count cap and no standalone clear-to-empty-state action. The existing hardcoded debate and seeded posts are fully removed.

---

## Problem and Expected Outcome

The current landing page behaves like a static demo: it always shows a fixed debate topic and seeded arguments, so the product cannot function as a user-owned debate space. Expected outcome: a first-time visitor lands on an empty state, creates a debate topic, posts Tark/Vitark on it, and returns later to find that debate restored on the same device. Replacing an active debate should start a fresh discussion and wipe the old one clean.

---

## Users and Scenarios

- **First-time visitor:** lands on the page, sees an empty state, creates a debate topic, and begins posting arguments.
- **Returning visitor on the same device:** reloads or revisits the page and sees the same topic and previously posted arguments restored from localStorage.
- **Visitor replacing an active debate:** starts a new debate while one is active, confirms the new topic flow, and lands in a fresh debate with zero carried-over arguments.

---

## Scope Boundaries

**In-scope:**
- Remove the hardcoded `DEBATE` constant and seeded runtime content.
- Render an empty state when no active debate exists in localStorage.
- Allow creation of one active debate topic per device.
- Persist debate topic and all posted arguments in localStorage.
- Gate Podium availability behind the existence of an active debate.
- Support debate replacement that atomically overwrites the topic and clears all persisted arguments.
- Migrate tests and step definitions away from hardcoded `DEBATE` assumptions.

**Out-of-scope:**
- Cross-device sync or backend persistence.
- Multiple concurrent debates or debate history.
- Authentication, ownership, or collaboration.
- Editing or deleting individual arguments.
- Separate clear-to-empty-state action.
- Navigation to a new route or screen for this slice.

---

## Constraints

- localStorage is the only persistence layer in this slice.
- One active debate exists per browser-storage context at a time.
- Topic validation is 10 to 120 characters.
- No argument count cap is enforced in this slice.
- UX owns the exact interaction patterns for creation and replacement during Gate 3.
- Accessibility baseline is mandatory: keyboard support, semantic structure, and WCAG 2.1 AA must not regress.

---

## Acceptance Criteria

| ID | Criterion | Status |
|---|---|---|
| AC-29 | When no debate exists in localStorage, the landing page displays an empty state with a debate-creation entry affordance and no Podium composer. Exact interaction pattern is deferred to Gate 3 UX. | Ready |
| AC-30 | The debate topic input enforces a 10-to-120 character constraint. Submitting outside that range is blocked and a visible validation error is communicated to the user. | Ready |
| AC-31 | Submitting a valid topic creates a debate, persists the topic to localStorage, and transitions the UI from empty state to active debate view. | Ready |
| AC-32 | The Podium composer is not visible or reachable when no debate exists, and becomes visible and operable immediately after a debate is created. | Ready |
| AC-33 | Arguments posted in a debate are persisted to localStorage and reloaded into the timeline when the user returns to the page on the same device. | Ready |
| AC-34 | A user can initiate a new debate while an active debate exists. Completing that flow atomically replaces the current topic and deletes all current arguments from localStorage and the timeline. | Ready |
| AC-35 | Abandoning the new-debate flow before completion leaves the current debate topic and all existing arguments fully intact. | Ready |
| AC-36 | There is no standalone in-app action to clear a debate to an empty state; replacement is the only in-app path away from an active debate. | Ready |
| AC-37 | The hardcoded `DEBATE` constant and all seeded posts are removed from the codebase and never shown in the production render path. | Ready |
| AC-38 | No argument count cap is enforced in this slice. | Ready |
| AC-39 | If localStorage is unavailable or returns invalid/corrupted data, the app renders the empty state gracefully without throwing a runtime error. | Ready |

---

## Domain Glossary

| Term | Definition |
|---|---|
| Debate | A user-created discussion defined by a topic and its Tark/Vitark arguments. |
| Topic | The 10-to-120-character statement or question framing a debate. |
| Tark | A user-posted argument supporting the topic. |
| Vitark | A user-posted argument opposing or challenging the topic. |
| Argument | A single Tark or Vitark post within the active debate. |
| Podium | The composer flow used to create and publish a new argument. |
| Empty State | The landing-page state shown when no active debate exists on the device. |
| Active Debate | The single debate currently stored in localStorage for the device. |
| Replace Flow | The user-initiated flow that creates a new debate while one is active, replacing the topic and clearing all arguments. |
| localStorage | The browser-native persistence layer used for debate state in this slice. |
| Device | The browser-storage scope in which localStorage persists data; debates are not shared across devices or browsers. |

---

## Open Questions

| # | Question | Blocking? | Status |
|---|---|---|---|
| OQ-1 | Must the replace flow include a confirmation/warning guard before deleting all current arguments? | No | **PO-accepted open** — deferred to Gate 3 UX |
| OQ-2 | Is topic length evaluated on trimmed input or raw input? | No | **PO-accepted open** — deferred to Gate 4 architecture |
| OQ-3 | When localStorage is unavailable, should the product block creation or fall back to an in-memory session? | No | **PO-accepted open** — deferred to Gate 4 architecture; AC-39 sets the no-crash floor |

---

## Requirement Context Package

```text
Slice: create-debate
Complexity: Standard
Gate 1 Decision: ✅ Pass

Requirement: Replace the hardcoded landing-page debate with an empty-state-driven,
user-created debate persisted in localStorage. One active debate per device. Topic
and arguments persist. Podium only appears after debate creation. Starting a new
debate replaces the current topic and wipes all current arguments.

Resolved / frozen decisions:
- Topic and arguments persist in localStorage on the same device.
- One active debate per device.
- No separate clear-to-empty-state action.
- No argument count cap in this slice.
- Topic length: 10 to 120 characters.
- Hardcoded debate and seeded posts are fully removed.

Accepted open questions:
- OQ-1 confirmation guard on replace flow -> Gate 3 UX
- OQ-2 trimmed vs raw topic validation -> Gate 4 architecture
- OQ-3 localStorage unavailable fallback contract -> Gate 4 architecture

Acceptance criteria: AC-29 through AC-39.
Domain Glossary: 11 terms as listed above.
```