---
name: slice-traceability-and-issue-ops
description: "Slice artifact and issue traceability workflow: persist gate artifacts, manage slice tracker and story issues, enforce bidirectional links, and validate issue metadata before Build gate. Use when: closing Gate 4, writing 06-tasks.md, creating or updating slice/story issues, or checking traceability readiness."
---

# Slice Traceability And Issue Operations

Use this skill to keep gate artifacts, slice tracker issues, and story issues synchronized.

## When To Use

- Closing Gate 4 and creating task issues
- Updating or validating `06-tasks.md`
- Creating or updating slice tracker issue links
- Verifying story issue metadata and backlinks
- Checking traceability before Build and Merge progression

## Artifact Storage Model

1. Each approved gate output is persisted as a versioned markdown file under `docs/slices/<slice-name>/`.
2. Orchestrator is responsible for creating the slice folder and writing gate artifacts after each gate passes.
3. File naming convention:
   - `01-requirement.md`
   - `02-prd.md`
   - `03-ux.md`
   - `04-design-qa.md`
   - `05-architecture.md`
   - `06-tasks.md`
4. GitHub Issues for coding tasks are created by the orchestrator at the end of Gate 4, after the architecture plan is approved.
5. Each Issue must include acceptance criteria, slice folder path, and relevant architecture section reference.
6. Coder agents at Gate 5 read the Issue and linked slice folder files for full context.
7. A PR that closes the Issue is the unit of completion for each coding task.

## Slice And Story Maintenance Protocol

1. Every slice must exist in both places:
   - Repo artifacts under `docs/slices/<slice-name>/` with `01` through `06` files.
   - GitHub slice tracker issue titled `[Slice] <slice-name>`.
2. Slice tracker issue must use label `slice` and include:
   - Slice folder path.
   - Links to `01` through `06` artifacts.
   - A section listing all user stories (issue links).
3. Every user story must be one GitHub issue and use labels `user-story` and `slice:<slice-name>`.
4. Story issues must include objective, acceptance criteria, slice path, architecture section reference, and `Slice tracker:` backlink.
5. Bidirectional traceability is mandatory.
6. Build and merge progression is blocked if required traceability links are missing.

## Slice And Issue Management

### Slice Folder

Create a slice folder at `docs/slices/<slice-name>/` when Gate 1 passes. Use lowercase kebab-case for `<slice-name>`. Write the approved artifact to the folder after each gate passes:

| File | Gate | Content |
|---|---|---|
| `01-requirement.md` | Gate 1 | Requirement Context Package |
| `02-prd.md` | Gate 2 | PRD Draft Package |
| `03-ux.md` | Gate 3A | UX Flow/State Package |
| `04-design-qa.md` | Gate 3C | Design QA Verdict Package (includes Figma design reference) |
| `05-architecture.md` | Gate 4 | Architecture Plan |
| `06-tasks.md` | Gate 4 end | Task breakdown with GitHub Issue numbers |

Downstream agents receive the slice folder path in their handoff packet and read artifacts directly from it instead of requiring full pasted context.

### GitHub Issues

At the end of Gate 4, after the architecture plan is approved:

1. Create or update one slice tracker issue titled `[Slice] <slice-name>` with label `slice`.
2. Decompose the architecture plan into atomic coding tasks.
3. Create one GitHub Issue per task with labels `user-story` and `slice:<slice-name>`, and required fields: task description, acceptance criteria, slice folder path, relevant `05-architecture.md` section reference, and a `Slice tracker:` link back to the slice issue.
4. Update the slice tracker issue with a `User stories` section containing links to all created story issues.
5. Record Issue numbers in `06-tasks.md`.
6. Gate 5 (Build) is authorized only after Issues are created and recorded.
7. Coder agents at Gate 5 receive an Issue number and slice folder path as their primary input.
8. Each coder agent opens a PR that closes its Issue. PR merge is the unit of completion.

## Validation Checklist

Run this before authorizing Build:

1. `06-tasks.md` contains created issue numbers and architecture section references.
2. Slice tracker <-> story issue links are bidirectional.
3. Required labels exist (`slice`, `user-story`, `slice:<slice-name>`).
4. Each story issue has acceptance criteria, slice path, architecture reference, and `Slice tracker:` backlink.
