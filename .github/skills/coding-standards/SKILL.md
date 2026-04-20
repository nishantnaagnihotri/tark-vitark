---
name: coding-standards
description: "Coding standards authoring workflow: write, structure, and organize Copilot instruction files for code review and dev agent guidance. Covers file types, applyTo targeting, character limits, content rules, and what not to include. Use when: creating or updating .github/instructions/*.instructions.md files or copilot-instructions.md."
last-refreshed: "2026-04-20"
refresh-interval-days: 7
refresh-source: "https://docs.github.com/en/copilot/tutorials/customize-code-review"
---

# Coding Standards

Use this skill whenever writing or updating Copilot instruction files — for code review, dev agent guidance, or both.

**Source authority:** [GitHub Docs — Customize Code Review](https://docs.github.com/en/copilot/tutorials/customize-code-review)

**Last refreshed:** 2026-04-20 — refresh every 7 days.

---

## Refresh Protocol

This skill must be kept in sync with the source authority page. Stale rules lead to wrong instruction files being created.

**Trigger:** Any of the following:
- Today's date minus `last-refreshed` in the frontmatter is ≥ 7 days.
- A PR reviewer ignores an instruction that this skill says should work (observable, concrete signal).
- A PR reviewer flags something that this skill says is unsupported.
- A new `*.instructions.md` file is being authored and any limit or behavior in this skill is being relied upon.

**How to refresh:**
1. Fetch the source page: `https://docs.github.com/en/copilot/tutorials/customize-code-review`
2. Check for changes in: character limits, supported/unsupported instruction types, `applyTo` behavior, file type support.
3. Update the affected sections in this file.
4. Update `last-refreshed` in the frontmatter and the **Last refreshed** line above to today's date (`YYYY-MM-DD`).
5. Create a branch `chore/refresh-coding-standards-skill`, open a PR, and merge via the normal review flow. Never commit directly to `master`.

---

## File Types

Two types of instruction files are supported:

| File | Scope | `applyTo` required? |
|---|---|---|
| `.github/copilot-instructions.md` | Repository-wide (all files) | No |
| `.github/instructions/*.instructions.md` | Path-specific | Yes |

Both types are read by **Copilot code review (PR reviewer)** and by the **dev agent in VS Code** when editing matching files.

---

## Hard Constraints

| Constraint | Limit | What happens if exceeded |
|---|---|---|
| File character limit (code review) | **4,000 characters** | Instructions beyond this point are silently ignored by the PR reviewer |
| File line soft limit | **~1,000 lines** | Response quality degrades |

> Measure files before committing. `wc -c` for chars, `wc -l` for lines.

---

## `applyTo` Frontmatter

Every path-specific file **must** include an `applyTo` glob in YAML frontmatter:

```yaml
---
applyTo: "**/*.tsx"
---
```

Common patterns for this repo:

| File | `applyTo` |
|---|---|
| `react.instructions.md` | `"**/*.tsx"` |
| `css.instructions.md` | `"**/*.css"` |
| `tests.instructions.md` | `["**/tests/**", "**/features/**/*.feature", "**/features/step-definitions/**/*.ts"]` |

---

## Content Rules

### DO

- **Short, imperative directives** — not narrative paragraphs.
- **Distinct headings** separating different topics.
- **Bullet points** for rules that can be scanned independently.
- **Concrete code examples** showing correct and incorrect patterns.

```
## Naming Conventions

Use descriptive, intention-revealing names.

\`\`\`ts
// Avoid
const d = new Date();

// Prefer
const currentDate = new Date();
\`\`\`
```

- **Start minimal** — 10–20 specific instructions, then iterate based on actual review results.
- **One purpose per file** — React rules in React file, CSS rules in CSS file; don't mix.

### DO NOT

The following instruction types are **not supported** by the code review agent and must not be included:

| Unsupported type | Example |
|---|---|
| UX/formatting changes | `Use bold text for critical issues` |
| PR overview modifications | `Add a testing checklist to the PR overview` |
| Core function changes | `Block PR merging unless all comments addressed` |
| External links used as rules in instruction files | `In .github/*instructions*.md: review code per standards at https://example.com` |
| Vague quality improvements | `Be more accurate`, `Don't miss any issues` |

> Workaround for external links: if an instruction rule would otherwise point to an external standard, copy the relevant content directly into the instruction file instead of linking.

---

## Recommended File Structure

```
.github/
  copilot-instructions.md          ← global: branching, domain naming, process
  instructions/
    react.instructions.md          ← applyTo: **/*.tsx
    css.instructions.md            ← applyTo: **/*.css
    tests.instructions.md          ← applyTo: **/tests/**, **/features/**/*.feature, **/features/step-definitions/**/*.ts
```

### What belongs in `copilot-instructions.md` (global)

- Branching and PR rules
- Domain naming policy
- Cross-cutting concerns (security requirements, error handling philosophy)
- Pointers to the scoped instruction files

### What belongs in scoped `*.instructions.md` files

- Language-specific coding standards
- Framework-specific patterns
- Technology-specific security concerns
- Different rules for different parts of the codebase

---

## Recommended Template for a Scoped File

```markdown
---
applyTo: "**/*.{ts,tsx}"
---
# [Domain or Technology] Standards

## Purpose

One sentence: what this file covers and when it applies.

## [Topic 1]

- Rule 1
- Rule 2

\`\`\`ts
// Avoid
...

// Prefer
...
\`\`\`

## [Topic 2]

- Rule 1
- Rule 2
```

---

## Testing Instruction Files

After creating or updating an instruction file:

1. Open a PR that touches files matching the `applyTo` glob.
2. Request a Copilot code review.
3. Observe which instructions are followed.
4. Note instructions that are consistently missed — rewrite to be more specific, or add examples.
5. Add new instructions one at a time; test before adding more.

---

## When Instructions Are Ignored (Troubleshooting)

| Symptom | Likely cause | Fix |
|---|---|---|
| Instructions completely ignored | File over 4,000 chars | Trim to under limit |
| Language rules applied to wrong files | Missing/wrong `applyTo` | Add or correct frontmatter |
| Inconsistent behavior | Too many instructions; too vague | Prioritize; add examples |
| Instructions in repo-wide file not taking effect for specific language | Rules in wrong file | Move to path-specific file |
