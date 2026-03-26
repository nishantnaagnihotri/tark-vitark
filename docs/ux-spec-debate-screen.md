# UX Spec: Debate Screen (Round 1, UX Strategist Draft)

## 1. Scope Alignment
- Slice: debate-screen
- Related requirements: FR-debate-screen-001, FR-debate-screen-002, FR-debate-screen-003, FR-debate-screen-004, FR-debate-screen-005
- Source requirements spec: docs/functional-requirements-debate-screen.md
- Execution issue: https://github.com/nishantnaagnihotri/tark-vitark/issues/1

## 2. UX Goal
Provide a bold but readable debate view where users can compare both sides quickly while preserving strict chronological flow on mobile.

## 3. Information Hierarchy
1. Debate topic header with strong typographic emphasis
2. Chronological mixed argument stream on mobile
3. Side distinction for each argument card (favour or against)
4. Comparative two-lane layout for tablet and desktop

## 4. Layout Blueprint
### Mobile (default)
- Single vertical stream.
- Order:
  - Topic header block
  - Argument cards in posted order across both sides
- Side signal behavior per card:
  - Favour card aligns left
  - Against card aligns right
- Preserve chronological order even when side alternates card-to-card.

### Tablet/Desktop
- Topic header remains full-width at top.
- Body uses two independent lanes for comparison:
  - left lane: In Favour
  - right lane: Against
- Lanes keep natural card heights (no forced equal-height rows).

## 5. Content and Copy
- Topic label: Debate Topic
- Side labels: In Favour, Against
- Tone: neutral and clear, without persuasive styling bias.
- This slice uses static sample content only.

## 6. Visual and Spacing Rules
- Editorial style with calm neutrals and side-accent colors.
- Distinct side cues by accent border, heading marker, and alignment.
- Minimum 16px page padding on mobile.
- Card spacing rhythm:
  - 12px between cards
  - 20px between major sections
- Long text must wrap and stay scannable.

## 7. Responsive Rules
- Mobile-first CSS.
- Breakpoint suggestion:
  - <768px: mixed single stream
  - >=768px: two-lane comparative layout
- Prevent horizontal scroll for topic and argument text.

## 8. Accessibility Expectations
- Semantic headings:
  - h1: debate topic
  - h2: side labels
- Color contrast must meet WCAG AA.
- Reading order in DOM must match visual reading order on mobile.
- Side distinction must not rely only on color; alignment and labels are mandatory.

## 9. States
- Empty: out of scope for this read-only static slice.
- Loading: out of scope for this read-only static slice.
- Error: out of scope for this read-only static slice.
- Required demo payload:
  - 1 topic
  - >=3 favour arguments
  - >=3 against arguments
  - Alternating sides in mobile stream at least twice

## 10. UX Acceptance Checklist
- [ ] Topic is visually dominant and immediately identifiable.
- [ ] Mobile stream preserves posted order across both sides.
- [ ] Favour cards align left and against cards align right on mobile.
- [ ] At least three arguments per side are visible.
- [ ] Mobile layout remains readable without zoom or overflow.
- [ ] Tablet/desktop layout supports quick side-by-side comparison.
- [ ] Side differentiation remains clear in grayscale (label + alignment).

## 11. Implementation Notes
- Round-1 creative direction name: Split Chronicle.
- This is a UX Strategist draft for iteration; final approval pending.
- If user prefers stronger contrast, increase side accent saturation while preserving AA contrast.

## 12. Figma Production Contract
- Figma page name: Debate
- Frame list:
  - mobile: debate-screen-mobile-default
  - tablet: debate-screen-tablet-default
  - desktop: debate-screen-desktop-default
- Component instances:
  - cmp/debate/topic-header/default
  - cmp/debate/argument-card/favour
  - cmp/debate/argument-card/against
  - cmp/debate/side-lane-header/default
  - cmp/layout/page-container/default
- Token usage:
  - tk/color/surface/base
  - tk/color/surface/favour-bg
  - tk/color/surface/against-bg
  - tk/color/text/primary
  - tk/color/accent/favour
  - tk/color/accent/against
  - tk/space/inset/16
  - tk/space/stack/12
  - tk/space/section/20
- State matrix coverage:
  - default: included in this slice
  - empty/loading/error: out of scope

## 13. Code Translation Contract
- frame -> frontend component mapping:
  - debate-screen-mobile-default -> DebateScreenMobile
  - debate-screen-tablet-default -> DebateScreenTablet
  - debate-screen-desktop-default -> DebateScreenDesktop
- figma component -> reusable UI component mapping:
  - cmp/debate/topic-header/default -> TopicHeader
  - cmp/debate/argument-card/favour -> ArgumentCard variant="favour"
  - cmp/debate/argument-card/against -> ArgumentCard variant="against"
  - cmp/debate/side-lane-header/default -> SideLaneHeader
  - cmp/layout/page-container/default -> PageContainer
- token -> code variable mapping:
  - tk/color/surface/base -> --color-surface-base
  - tk/color/surface/favour-bg -> --color-surface-favour
  - tk/color/surface/against-bg -> --color-surface-against
  - tk/color/text/primary -> --color-text-primary
  - tk/color/accent/favour -> --color-accent-favour
  - tk/color/accent/against -> --color-accent-against
  - tk/space/inset/16 -> --space-16
  - tk/space/stack/12 -> --space-12
  - tk/space/section/20 -> --space-20
- interaction/state -> implementation expectation mapping:
  - chronological mixed mobile stream -> render source order without side grouping
  - favour side signal -> left alignment + favour accent token
  - against side signal -> right alignment + against accent token
  - tablet/desktop comparison -> two independent side lanes at >=768px

## 14. Figma Artifact
- Figma link: TBD (blocked: direct Figma API/MCP availability not confirmed)
- Waiver: Not allowed for this slice
