---
name: defer-issue
description: "Deferred issue protocol: when to defer, required body fields, label taxonomy, trigger condition, gate re-entry point, and triage rules. Use when: consciously deferring a decision, UX option, or requirement gap that is out of scope for the current slice."
---

# Defer Issue

Use this skill whenever an agent identifies a decision, UX option, or requirement gap that is valid but out of scope for the active slice, and needs to be reliably tracked for future pickup.

## When To Use

- A UX option was identified but the simpler option was chosen for this slice
- A requirement gap is out of scope but must not be forgotten
- A Product Owner decision is consciously deferred to a future slice
- A cross-cutting concern (performance, accessibility improvement, interaction pattern) is noted but blocked on prerequisites

## When NOT To Use

- The item is an active defect in the current slice → create a `bug` issue instead
- The item is in-scope and should be in `06-tasks.md` → use `slice-traceability-and-issue-ops` skill
- The item is a question needing immediate Product Owner answer → raise in current session, do not defer

---

## Label Taxonomy

| Label | Meaning | When to apply |
|---|---|---|
| `deferred` | **Required on all deferred issues.** Consciously deferred decision or option; requires explicit trigger to re-enter the gate sequence. | Always |
| `ux` | The deferral is a UX option, interaction pattern, or design decision | When the deferred item is UX-domain |
| `enhancement` | The deferral is a feature addition or behaviour improvement | When the deferred item adds capability |
| `question` | The deferral is a Product Owner decision that can't be made yet | When prerequisites are unresolved |

**`future` label is retired.** Do not apply it. If an existing issue has `future`, replace with `deferred`.

---

## Required Body Fields

Every deferred issue must contain all six fields. Missing fields are a quality gap — do not create the issue without them.

### 1. Context
What discussion or analysis produced this deferral. Why it was deferred now rather than resolved. Which slice or gate surfaced it.

### 2. Options
Concrete, named options being deferred. Each option must include:
- What it changes or adds
- Rough implementation consequence (new component, new state, new gate coverage needed)

### 3. Trigger Condition
The specific, observable event that should cause this issue to be picked up. Must be concrete — not "someday" or "when relevant".

Examples of good trigger conditions:
- "Next slice that modifies the Debate Screen Podium"
- "When auth / user identity is introduced"
- "When the argument list exceeds N items and scrolling becomes a UX concern"

Vague trigger conditions ("future", "later", "when ready") are not acceptable.

### 4. Prerequisites
What must be true before this decision can be made. Examples: domain glossary terms confirmed, another issue closed, a gate artifact existing.

### 5. Gate Entry Point
Which gate this re-enters at when the trigger fires. Usually Gate 1 (new requirement slice), Gate 3 (UX change on existing screen), or Gate 4 (architecture impact only).

### 6. References
Links to the artifacts that provide context: UX spec file path, Figma node ID and URL, PRD section, related issue numbers.

---

## Issue Title Convention

`{Domain}: {What is being deferred} — {Options summary}`

Examples:
- `UX: Podium collapse — Option 2 (collapsed strip) or Option 3 (enter-debate CTA)`
- `Requirement: Character counter on Podium — show live count or submit-only feedback`
- `Architecture: Argument list pagination — infinite scroll or load-more button`

---

## Body Template

```markdown
## Context

[Why this was deferred and from which slice/discussion]

## Options

### Option 2 — [Name]
[Description + implementation consequence]

### Option 3 — [Name]
[Description + implementation consequence]

## Trigger Condition

[Specific observable event that causes pickup]

## Prerequisites

- [Prerequisite 1]
- [Prerequisite 2]

## Gate Entry Point

Gate [N] — [reason]

## References

- [Artifact or file path]
- [Figma URL with node-id]
- [Related issue]
```

---

## Triage Rules

When triaging deferred issues at Gate 1 of a new slice:

1. Search open issues with label `deferred` for any whose **Trigger Condition** matches the current slice intent.
2. If a match is found, link the deferred issue in the new slice's `01-requirement.md` under a "Deferred Pickups" section.
3. If the trigger has not fired, leave the issue open — do not close or modify it.
4. If prerequisites are still unmet, note this in the Gate 1 Requirement Context Package as a known dependency.

---

## Output

After creating a deferred issue, report:
- Issue number and direct URL
- Trigger condition (one line)
- Gate entry point
- Any label correction made (e.g., `future` → `deferred`)
