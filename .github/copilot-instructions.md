# Copilot Instructions

## Project

tark-vitark is a personal portfolio/product project. Current implementation is static HTML/CSS with an orchestrated gate workflow for future slices.

## Coding Conventions

- Use domain-oriented naming in code, tests, and PR descriptions.
- Follow test-first behavior-driven development when feasible.
- Language- and technology-specific rules live in `.github/instructions/`:
  - React/TSX → `.github/instructions/react.instructions.md`
  - CSS → `.github/instructions/css.instructions.md`
  - Tests → `.github/instructions/tests.instructions.md`
- To add or update instruction files, follow `.github/skills/coding-standards/SKILL.md`.

## Branching

- Never commit directly to `master`.
- Create a new branch for each task.
- Open a pull request for review.

## Key Files

- `.github/AGENTS.md`: shared protocol source of truth.
- `.github/agents/*.agent.md`: role-specific agent instructions.
- `docs/slices/<slice-name>/`: gate artifacts per slice.
- `src/`: implementation code.

## Skill Hardening

- Whenever a workflow gap, repeated mistake, or missing guardrail is identified, propose hardening it into the relevant skill file (`.github/skills/<skill-name>/SKILL.md`) or creating a new skill if none exists.
- Skill hardening suggestions should be concrete: specify the skill file, the rule or checklist item to add, and the trigger condition.
- Apply this principle after gate closures, incident reviews, and any time a protocol deviation is caught.

## Code Review Specs

When reviewing a pull request, Copilot must:

- If the provided PR context includes existing review threads and their reply state, leave a review comment when any review thread has no response from the author. Point out the unanswered thread(s) explicitly so the author knows they need to reply before the review loop can close.
- If the provided review context does not include existing review threads or their reply state, explicitly say that thread status is unavailable and do not guess, infer, or fabricate unanswered threads.

## Proprietary

This repository is proprietary. All rights reserved. See `LICENSE`.
