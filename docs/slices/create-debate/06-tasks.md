# Task Breakdown — create-debate
## Gate 4 End — 2026-04-27

---

## Slice Tracker

https://github.com/nishantnaagnihotri/tark-vitark/issues/202

## Architecture Reference

[05-architecture.md](05-architecture.md)

---

## Task Issues

| Task | GitHub Issue | Title | Dependency | Architecture Section | Status |
|---|---|---|---|---|---|
| T1 | [#203](https://github.com/nishantnaagnihotri/tark-vitark/issues/203) | Active-debate storage foundation | None | Section 2.2, Section 2.4, Section 6 (T1) | Closed via [PR #212](https://github.com/nishantnaagnihotri/tark-vitark/pull/212) |
| T2 | [#204](https://github.com/nishantnaagnihotri/tark-vitark/issues/204) | Shared topic form and topic validation | None | Section 2.2, Section 2.3, Section 5, Section 6 (T2) | Closed via [PR #211](https://github.com/nishantnaagnihotri/tark-vitark/pull/211) |
| T3 | [#205](https://github.com/nishantnaagnihotri/tark-vitark/issues/205) | Active header chrome | Merge after T1 and T2 | Section 2.2, Section 2.3, Section 6 (T3) | Closed via [PR #213](https://github.com/nishantnaagnihotri/tark-vitark/pull/213) |
| T4 | [#206](https://github.com/nishantnaagnihotri/tark-vitark/issues/206) | DebateScreen empty-state and create integration | T1 (#203), T2 (#204) | Section 2.5, Section 5, Section 6 (T4) | Closed via [PR #214](https://github.com/nishantnaagnihotri/tark-vitark/pull/214) |
| T5 | [#207](https://github.com/nishantnaagnihotri/tark-vitark/issues/207) | Replace-flow integration | T3 (#205), T4 (#206) | Section 2.5, Section 5, Section 6 (T5) | Closed via [PR #215](https://github.com/nishantnaagnihotri/tark-vitark/pull/215) |
| T6 | [#208](https://github.com/nishantnaagnihotri/tark-vitark/issues/208) | Persisted Podium publish and no-cap behavior | T1 (#203), T4 (#206) | Section 2.5, Section 5, Section 6 (T6) | Closed via [PR #216](https://github.com/nishantnaagnihotri/tark-vitark/pull/216) |
| T7 | [#209](https://github.com/nishantnaagnihotri/tark-vitark/issues/209) | Acceptance and regression migration | T4 (#206), T5 (#207), T6 (#208) | Section 3, Section 5, Section 6 (T7) | Closed via [PR #217](https://github.com/nishantnaagnihotri/tark-vitark/pull/217) |

---

## Slice Closure

- Final slice completion: 2026-04-29 via merged slice PR #219
- Task issues #203 through #209 closed through merged task PRs #212, #211, #213, #214, #215, #216, and #217

---

## Parallelism Map

```text
T1 (#203) ───────────────────────┐
                                 ├──→ T4 (#206) ──→ T5 (#207) ──┐
T2 (#204) ───────────────────────┘                               ├──→ T7 (#209)
                                                                 │
T3 (#205) can be prepared in parallel, but should merge after T1 and T2 ─┘

T1 (#203) ───────────────────────┐
                                 └──→ T6 (#208) ─────────────────┘
```

Parallelizable at start: T1 and T2.

Best real dispatcher replacement-test issue: T2 (#204).

---

## Traceability Checklist

- [x] `06-tasks.md` contains created issue numbers and architecture section references
- [x] Slice tracker issue #202 links to story issues #203-#209
- [x] Labels `slice`, `slice:create-debate`, and `user-story` exist and are applied
- [x] Each story issue includes objective, acceptance criteria, slice path, architecture reference, and slice-tracker backlink
- [x] Gate 5 (Build) is authorized for issue-scoped implementation handoff