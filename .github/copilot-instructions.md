# Copilot Instructions

## Project

tark-vitark is a personal portfolio/product project. Current implementation is static HTML/CSS with an orchestrated gate workflow for future slices.

## Coding Conventions

- Use CSS custom properties from the token system for colors, spacing, and shared style values.
- Canonical token file path is `src/styles/tokens.css`.
- Support both Light and Dark themes via `[data-theme]` selectors and `prefers-color-scheme` fallback.
- Use domain-oriented naming in code and tests.
- Follow test-first behavior-driven development when feasible.

## Branching

- Never commit directly to `master`.
- Create a new branch for each task.
- Open a pull request for review.

## Key Files

- `.github/AGENTS.md`: shared protocol source of truth.
- `.github/agents/*.agent.md`: role-specific agent instructions.
- `docs/slices/<slice-name>/`: gate artifacts per slice.
- `src/`: implementation code.

## Proprietary

This repository is proprietary. All rights reserved. See `LICENSE`.
