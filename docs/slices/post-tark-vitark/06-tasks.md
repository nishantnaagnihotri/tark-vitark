# Task Breakdown — post-tark-vitark
## Gate 4 End — 2026-04-16

---

## Slice Tracker

https://github.com/nishantnaagnihotri/tark-vitark/issues/85

## Architecture Reference

[05-architecture.md](05-architecture.md)

---

## Task Issues

| Task | GitHub Issue | Title | Dependency | Architecture Section | Status |
|---|---|---|---|---|---|
| T-1 | [#86](https://github.com/nishantnaagnihotri/tark-vitark/issues/86) | Token additions — `--color-on-surface-variant` + `--color-error` | None | §4 Token Additions | ✅ PR #96 merged |
| T-2 | [#87](https://github.com/nishantnaagnihotri/tark-vitark/issues/87) | Extract `validatePost` pure utility | None | §2.5 Interface Contracts | ✅ PR #97 merged |
| T-3 | [#88](https://github.com/nishantnaagnihotri/tark-vitark/issues/88) | Native `SegmentedControl` component | T-1 (#86) | §2.5, §2.6 Native Component Specifications | ✅ PR #104 merged |
| T-4 | [#89](https://github.com/nishantnaagnihotri/tark-vitark/issues/89) | `Podium` component (Composer bar) | T-1 (#86), T-2 (#87), T-3 (#88) | §2.5, §2.6 Podium CSS | ✅ PR #100 merged |
| T-5 | [#90](https://github.com/nishantnaagnihotri/tark-vitark/issues/90) | Wire `Podium` into `DebateScreen` + layout fix | T-2 (#87), T-3 (#88), T-4 (#89) | §2.2 Module Boundary Map, §2.3 Data Flow, §2.4 State Ownership | ✅ PR #102 merged |
| T-6 | [#91](https://github.com/nishantnaagnihotri/tark-vitark/issues/91) | Amendment-1 — Mobile 4-line clamp + Read more in `ArgumentCard` | None | §7 T-6 | ✅ PR #98 merged |
| T-7 | [#92](https://github.com/nishantnaagnihotri/tark-vitark/issues/92) | BDD Cucumber feature file + step definitions | T-4 (#89), T-5 (#90) | §6 BDD Cucumber Scenarios | ✅ PR #103 merged |
| T-8 | [#93](https://github.com/nishantnaagnihotri/tark-vitark/issues/93) | Accessibility tests for `Podium` | T-4 (#89) | §6 AC coverage C-4 | ✅ PR #101 merged |

---

## Post-Build QA

| Task | Title | Issue / PR | Status |
|---|---|---|---|
| Theme-toggle overlap fix | Reposition theme toggle to top on mobile/tablet to avoid Podium | PR #106 | ✅ merged 2026-04-16 |
| Chip replace | Replace Podium `SegmentedControl` with inline `ChipFilter` pill | [#107](https://github.com/nishantnaagnihotri/tark-vitark/issues/107) / PR #108 | ✅ merged 2026-04-16 |
| Slice merge | Stacked PR merge of post-tark-vitark feature into master | PR #109 | ✅ merged 2026-04-17 |
| Theme-toggle reposition | Reposition to top-right to avoid Podium (second pass) | PR #111 | ✅ merged 2026-04-17 |
| a11y: Podium chip | `role="switch"` + static `aria-label="Post as Tark"` + `aria-checked` | [#110](https://github.com/nishantnaagnihotri/tark-vitark/issues/110) / PR #112 | ✅ merged 2026-04-17 |
| WCAG 2.5.3 bugfix | Dynamic aria-label for Podium chip to match visible label (Tark/Vitark) | [#116](https://github.com/nishantnaagnihotri/tark-vitark/issues/116) / PR #118 | ✅ merged 2026-04-17 |

---

## Parallelism Map

```
T-1 (#86) ──────────────────────────────────────────────────────┐
T-2 (#87) ──────────────────────────────────────────────────────┤
                                                                 ↓
T-6 (#91 — independent) ──── T-3 (#88, needs T-1) → T-4 (#89, needs T-1+T-2+T-3) → T-5 (#90) → T-7 (#92)
                                                                  └──────────────────────────────→ T-8 (#93)
```

Parallelizable at start: **T-1, T-2, T-6** (no dependencies).

---

## Traceability Checklist

- [x] `06-tasks.md` contains created issue numbers and architecture section references
- [x] Slice tracker issue #85 ↔ story issues #86–#93 bidirectional links
- [x] Labels: `slice`, `slice:post-tark-vitark`, `user-story` applied
- [x] Each story issue has acceptance criteria, slice path, architecture reference, and `Slice Tracker:` backlink
- [x] Gate 5 (Build) authorized after this file is committed
