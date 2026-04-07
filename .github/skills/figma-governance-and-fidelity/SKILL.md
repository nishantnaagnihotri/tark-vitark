---
name: figma-governance-and-fidelity
description: "Figma design governance workflow: enforce file structure conventions, design system token/library rules, and Figma-to-code fidelity evidence. Use when: preparing Gate 3 artifacts, creating or validating Figma files, enforcing tokenized design values, or verifying frame-level parity requirements."
---

# Figma Governance And Fidelity

Use this skill to enforce shared Figma conventions and fidelity expectations across design and implementation gates.

## When To Use

- Preparing or validating Gate 3 UX, Figma, and Design QA artifacts
- Creating, updating, or reviewing slice Figma files
- Enforcing design-system token and variable usage
- Verifying Figma-to-code parity evidence in PRs

## Figma File Structure Convention

1. One Figma file per slice under the designated project in `.figma-config.local`.
2. Standard page structure: `UX Flows`, `Design`, `QA Notes`.
3. Frame naming convention: `<Screen>/<State>/<Theme>`.
4. Enhancement slices are self-contained and reference prior slice files as baseline.
5. Figma file URL is recorded in `03-ux.md` and `04-design-qa.md`. Raw file keys must not appear in git-tracked artifacts - store them only in `.figma-config.local`.
6. All Figma files must reside in the designated project (not Drafts). MCP `create_new_file` creates files in Drafts (API limitation); the Product Owner must manually move the file to the designated project before any further design work proceeds. No design activity on files in Drafts.

## Design System Foundation Policy

1. The Design System uses a dedicated Figma library file.
2. If the library does not exist, first Gate 3 run bootstraps it and records `design_system_library_file_key` in `.figma-config.local`.
3. Variables use categories: `color/*`, `spacing/*`, `typography/*`, `radius/*`, `shadow/*`, `breakpoint/*`.
4. Theme collection must provide Light and Dark modes from day one.
5. Slice designs must use library variables only.
6. Every screen and state must provide Light and Dark variants.
7. Canonical code-side token file path is `src/styles/tokens.css`. It must define both theme variants using `[data-theme]` selectors plus `prefers-color-scheme` fallback. Slice CSS files import this token file.
8. Figma variable names map 1:1 to CSS custom properties.
9. Design QA must enforce token compliance.
10. New shared tokens/components are added to the library first.
11. `.figma-config.local.example` is the committed schema reference for local `.figma-config.local` files.

## Figma Fidelity Policy

1. For Figma-parity tasks, extract and apply frame-level values from Figma as source of truth.
2. Screenshot-only approximation is insufficient when extractable frame values are available.
3. Responsive implementations map approved Figma frames to explicit breakpoints.
4. PR evidence must include frame-to-code traceability and intentional deviations.

## Validation Checklist

Before approving design or parity work, verify:

1. File/project placement and page/frame naming conventions are satisfied.
2. All design values use Design System library variables.
3. Both Light and Dark variants exist for required states.
4. Figma-to-code evidence is explicit where fidelity is in scope.
