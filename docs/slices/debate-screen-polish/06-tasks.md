# Task Breakdown — debate-screen-polish
## Gate 4 End — 2026-04-17

---

## Slice Tracker

https://github.com/nishantnaagnihotri/tark-vitark/issues/127

## Architecture Reference

[05-architecture.md](05-architecture.md)

---

## Task Issues

| Task | GitHub Issue | Title | Dependency | Architecture Section | Status |
|---|---|---|---|---|---|
| T-1 | #124 | `[debate-screen-polish] Item 1 — Widen mobile argument cards to 85% in timeline.css` | None | §2.3 | ✅ Complete |
| T-2 | #125 | `[debate-screen-polish] Item 2 — Fix Vitark spine-cell grid-row to 1 in timeline.css` | None (sequential after T-1) | §2.4 | ✅ Complete |
| T-3 | #126 | `[debate-screen-polish] BDD feature file and step definitions for both items` | T-1 + T-2 | §6 | ✅ Complete |
---

## Slice Closure

**Status:** All dev tasks complete, all changes present in master, no merge or PR needed — slice fully integrated and CLOSED as of 2026-04-19.

---

## GitHub Issue Links

- T-1 (#124): https://github.com/nishantnaagnihotri/tark-vitark/issues/124
- T-2 (#125): https://github.com/nishantnaagnihotri/tark-vitark/issues/125
- T-3 (#126): https://github.com/nishantnaagnihotri/tark-vitark/issues/126
- Slice tracker (#127): https://github.com/nishantnaagnihotri/tark-vitark/issues/127

---

## Execution Order

```
T-1 (Item 1 CSS — 1 line) ─────→ PR merged → 
T-2 (Item 2 CSS — 1 line) ─────→ PR merged → 
T-3 (BDD — new files) ──────────→ PR merged →
                                               Gate 5.5 Runtime QA → Gate 6
```

T-1 and T-2 are parallel-feasible (non-overlapping hunks in the same file, zero merge conflict risk). Sequential execution recommended — total change is 2 lines, parallel overhead not justified.

T-3 depends on both T-1 and T-2 merged.

---

## Dev Protocol for Each Task

1. `git worktree add ../worktree-<issue-number> -b <branch-name> slice/debate-screen-polish`
2. Make change in worktree
3. Run `npm test` — all tests must pass
4. `git push` and open PR targeting `slice/debate-screen-polish`
5. Dev agent runs Copilot review loop per `pr-review-loop` skill
6. Once review passes (0 comments), dev agent marks PR merge-ready for PO review against `slice/debate-screen-polish`

## Figma Authority

For all dimensional values, **Figma frames are the source of truth**:
- Item 1 mobile width: frame `620:145` → https://www.figma.com/design/CsPAyUdLSStdmNpmiBMESQ?node-id=620:145
- Item 2 spine dot intent: frame `630:292` → https://www.figma.com/design/CsPAyUdLSStdmNpmiBMESQ?node-id=630-292
