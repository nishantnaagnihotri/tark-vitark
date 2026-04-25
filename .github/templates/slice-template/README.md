# Slice Template

This template provides a standardized structure for all delivery slices in the tark-vitark project.

## What Is a Slice?

A **slice** is a vertical, end-to-end delivery container that flows through six gates from requirement → design → architecture → build → merge.

Each slice:
- Exists in **two places**: as versioned markdown artifacts in `docs/slices/<slice-name>/` AND as a GitHub issue tracker with linked story issues
- Is **atomic**: designed to complete in one sprint or shorter
- Is **traceable**: every design decision and implementation task is linked back to acceptance criteria

---

## Slice Lifecycle

```
Gate 1 (Requirement Challenge)
  ↓ 01-requirement.md created
Gate 2 (PRD)
  ↓ 02-prd.md created
Gate 3 (UX + Design + Design QA)
  ↓ 03-ux.md created
  ↓ 04-design-qa.md created
Gate 4 (Architecture)
  ↓ 05-architecture.md created
  ↓ 06-tasks.md created (+ GitHub issues)
Gate 5 (Build)
  ↓ One PR per task; all merged
Gate 6 (Merge Review)
  ↓ Slice tracker closed; audit trail preserved
```

---

## File Descriptions

### 01-requirement.md

**Gate:** 1 (Requirement Challenge)

**Owner:** requirement-challenger agent

**Purpose:** Validates the initial product intent for completeness and testability.

**Contains:**
- Requirement statement (one-line problem + outcome)
- User scenarios and primary flow
- Scope boundaries (in-scope, out-of-scope, constraints)
- Success criteria (5-7 observable outcomes)
- Proposed acceptance criteria (AC-1 through AC-5, always testable)
- Open questions (all must be resolved or explicitly accepted)

**How to use:** Fill in from actual requirement statement. Collaborate with Product Owner to ensure no ambiguity.

---

### 02-prd.md

**Gate:** 2 (Product Requirements Document)

**Owner:** prd-agent

**Purpose:** Expands the requirement into a full product specification with traceability.

**Contains:**
- PRD readiness statement (why input was sufficient)
- Overview and purpose (what is being built and why)
- Target users and scenarios (detailed descriptions)
- Problem statement and expected outcome
- User stories (expanded from requirements, mapped to ACs)
- Detailed acceptance criteria (testable, with verification strategy)
- Scope and boundaries (refined from Gate 1)
- Traceability map (requirement → PRD → UX → architecture)
- Quality gaps and open questions (none should remain)

**How to use:** Start from 01-requirement.md. Work with PRD agent to map each requirement to user stories and acceptance criteria. This doc becomes the source of truth for design and architecture.

---

### 03-ux.md

**Gate:** 3A (UX Design & Flow Definition)

**Owner:** ux-agent

**Purpose:** Translates PRD into user flows, state definitions, and interaction specifications.

**Contains:**
- UX readiness statement (why design can proceed)
- User flows (steps, states, edge cases for each flow)
- State matrix (every distinct UI state defined)
- Interaction notes (component behaviors, focus states, etc.)
- Design artifact reference (link to Figma file)
- Traceability to acceptance criteria
- Quality gaps and open questions

**How to use:** Start from 02-prd.md user stories. Document each flow and state. Produce Figma screens for each state. Link back to AC IDs so designer understands what is being satisfied.

---

### 04-design-qa.md

**Gate:** 3C (Design QA & Verification)

**Owner:** design-qa-agent

**Purpose:** Verifies that Figma design fully implements PRD and UX specifications.

**Contains:**
- Design QA readiness statement
- PRD traceability review (every AC mapped to a design element)
- UX coverage review (every flow and state in Figma)
- Component and token consistency review (design system compliance)
- Edge state coverage (empty, loading, error, success)
- Quality gaps and open questions
- Product Owner sign-off (approval required before architecture)

**How to use:** Design QA agent reads Figma directly via MCP. Maps each AC to a screen/component. Flags any gaps. Loops back to ux-agent if revisions needed. Only closes when Product Owner approves.

---

### 05-architecture.md

**Gate:** 4 (Architecture & Task Decomposition)

**Owner:** architecture-agent

**Purpose:** Defines technical implementation strategy, module boundaries, risks, and atomic tasks.

**Contains:**
- Architecture readiness statement
- High-level design overview (why this technical approach)
- Module responsibilities (what each part does, boundaries, files)
- Integration points (how modules talk to each other)
- Impact analysis (files created, modified, deleted)
- Risk and mitigation plan (for each technical risk)
- Verification strategy (unit tests, integration tests, e2e, manual)
- Rollback plan (how to undo if needed)
- Task decomposition (T1–T5, dependencies, acceptance criteria)

**How to use:** Start from 04-design-qa.md. Design the codebase structure. Break work into atomic tasks (typically 5–7). Each task should be completable in 4–8 hours. Document dependencies so orchestrator can sequence them properly.

---

### 06-tasks.md

**Gate:** 4 End (Task Ledger & Issue Mapping)

**Owner:** orchestrator (after architecture approved)

**Purpose:** Maps each task to a GitHub issue; serves as single source of truth for build progress.

**Contains:**
- Slice tracker issue link (the GitHub issue that groups all stories)
- T1–T5 task definitions with:
  - GitHub issue link
  - Architecture section reference
  - Scope and files affected
  - Acceptance criteria (linked back to PRD)
  - Dependencies
- Execution table (progress tracking as tasks are built and merged)
- Completion checklist (what must be true when slice is done)

**How to use:** Orchestrator creates this after Gate 4 passes. GitHub issues are created with labels `user-story` and `slice:<slice-name>`. Each issue includes a `Slice tracker:` backlink. This file is the reference for developers handoff at Gate 5.

---

## How to Use This Template

### For a New Slice

1. Copy this template folder to a new location at `docs/slices/<your-slice-name>/`
2. At Gate 1: orchestrator invokes requirement-challenger, receives Requirement Context Package
3. requirement-challenger fills in 01-requirement.md and returns it
4. At Gate 2: orchestrator invokes prd-agent, receives PRD Draft Package
5. prd-agent fills in 02-prd.md and returns it
6. At Gate 3A: orchestrator invokes ux-agent, receives UX Flow/State Package
7. ux-agent fills in 03-ux.md and returns it
8. At Gate 3B: orchestrator routes a final sync ux-agent handoff, and ux-agent invokes design-qa-agent with the UX Flow/State Package plus PRD
9. design-qa-agent reviews Figma frames (created by ux-agent in Gate 3A); orchestrator mechanically persists the returned critique verbatim to 04-design-qa.md without content edits
10. At Gate 4: orchestrator invokes architecture-agent, receives Architecture Plan
11. architecture-agent fills in 05-architecture.md and returns it
12. Orchestrator creates GitHub issues and fills in 06-tasks.md
13. Gate 5: dev agent works one task at a time, creating PRs

---

## Template Sections Explained

### Standard Headers (All Files)

Every file has:
- **Slice:** kebab-case slice name (e.g., `coming-soon-splash-page`)
- **Gate:** Which gate produced this artifact
- **Status:** READY | Needs Clarification | Blocked
- **Version:** Semantic versioning (0.1.0 initial, 0.1.1 revision, etc.)
- **Date:** ISO 8601 (YYYY-MM-DD)
- **Author:** Which agent created it
- **Source:** Which file was used as input

### Acceptance Criteria Tables

Every file traces back to PRD acceptance criteria (AC-1, AC-2, etc.) to ensure no requirement is orphaned.

### Open Questions Sections

Every file documents unresolved questions. When status is "Resolved," the resolution is recorded. When status is "Accepted," it means the PO accepted it as non-blocking.

### Quality Gaps Sections

Every file documents gaps or ambiguities found during that gate. These gaps must be closed before progression.

### Gate Decision Sections

Every file ends with an explicit gate decision:
- **can proceed to [next gate]** — all criteria met, progression authorized
- **must loop back** — gaps exist, agent will revise and resubmit

---

## Traceability Across Gates

```
01-requirement.md (AC-1, AC-2, AC-3, AC-4, AC-5)
       ↓ must map to ↓
02-prd.md (expand ACs, add user stories)
       ↓ must map to ↓
03-ux.md (flows and states that satisfy ACs)
       ↓ must map to ↓
04-design-qa.md (Figma screens that cover each AC)
       ↓ must map to ↓
05-architecture.md (modules, files, tasks that implement ACs)
       ↓ must map to ↓
06-tasks.md (GitHub issues, each tied to AC)
       ↓ must map to ↓
Built code (pull requests that close issues)
```

Every AC must be traceable end-to-end from requirement to merged PR.

---

## Labels & GitHub Integration

All user story issues for this slice must have:
- **Label:** `user-story` (required)
- **Label:** `slice:<slice-name>` (required, e.g., `slice:coming-soon-splash-page`)
- **Issue body includes:** `Slice tracker: [#XX](...)` backlink
- **Slice tracker issue includes:** `User stories:` section with links to all story issues

---

## When to Create a New Slice

New slices should be created for:
- Independent, end-to-end user-facing features
- Bug fixes that require design/architecture review
- Technical infrastructure work with clear acceptance criteria
- Refactoring or optimization with measurable outcomes

Do NOT create a new slice for:
- Bug fixes without design implications
- Typos or minor copy updates
- Dependency upgrades without feature impact
- Comments or internal documentation

---

## Questions?

Refer to `.github/AGENTS.md` for shared protocol and `.github/agents/architect-orchestrator.agent.md` for orchestrator execution rules.
