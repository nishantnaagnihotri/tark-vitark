# Task Breakdown — debate-screen

**Slice tracker:** https://github.com/nishantnaagnihotri/tark-vitark/issues/37
**Architecture:** `docs/slices/debate-screen/05-architecture.md` (Revision 1.1)

## Tasks

| Task | Title | Issue | Architecture Section | Dependencies | Status |
|---|---|---|---|---|---|
| T1 | Scaffold React 19 + Vite project with test stack and PWA baseline | https://github.com/nishantnaagnihotri/tark-vitark/issues/38 | §2.7, §2.8, §2.10, §2.14 | None | ✅ PR #49 merged |
| T2 | Expand token system with M3 3-layer architecture | https://github.com/nishantnaagnihotri/tark-vitark/issues/39 | §2.6 | T1 (#38) | ✅ PR #51 merged |
| T3 | Create static debate data module | https://github.com/nishantnaagnihotri/tark-vitark/issues/40 | §2.4 | T1 (#38) | ✅ PR #52 merged |
| T4 | Implement DS primitives (Typography, Card, Divider) | https://github.com/nishantnaagnihotri/tark-vitark/issues/47 | §2.2, §2.5, §2.7 | T2 (#39) | ✅ PR #53 merged |
| T5 | Implement ArgumentCard component | https://github.com/nishantnaagnihotri/tark-vitark/issues/41 | §2.5, §2.13 | T2 (#39), T3 (#40), T4 | ⬜ |
| T6 | Implement Topic and LegendBar components | https://github.com/nishantnaagnihotri/tark-vitark/issues/42 | §2.5, §2.11 | T2 (#39), T4 | ✅ PR #55 merged |
| T7 | Implement Timeline and DebateScreen components | https://github.com/nishantnaagnihotri/tark-vitark/issues/43 | §2.5, §2.11, §2.12 | T3 (#40), T4, T5 (#41), T6 (#42) | ⬜ |
| T8 | Accessibility and theme verification | https://github.com/nishantnaagnihotri/tark-vitark/issues/44 | §5.1 | T7 (#43) | ⬜ |
| T9 | Deployment cutover — update GitHub Pages workflow | https://github.com/nishantnaagnihotri/tark-vitark/issues/45 | §2.15 | T7 (#43), T8 (#44) | ⬜ |

## Dependency Graph

```
T1 (scaffold)
├── T2 (tokens)  ── T4 (DS primitives)  ── T5 (ArgumentCard) ─┐
│                                        ── T6 (Topic + LegendBar) ─┤
├── T3 (data) ─────────────────────────── T5 (ArgumentCard)    ─┤
│                                                                ├── T7 (Timeline + DebateScreen) ── T8 (a11y) ── T9 (deploy)
```

## Critical Path

T1 → T2 → T4 → T5 → T7 → T8 → T9

## Parallel Opportunities

- T2 + T3 can execute in parallel after T1
- T5 + T6 can execute in parallel after T4 (T5 also needs T3)

## Related Issues

- Slice tracker: https://github.com/nishantnaagnihotri/tark-vitark/issues/37
- Font evaluation (deferred): https://github.com/nishantnaagnihotri/tark-vitark/issues/46
