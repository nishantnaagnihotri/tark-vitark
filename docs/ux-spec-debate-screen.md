# UX Contract: Debate Screen

## 1. Scope Alignment
- Slice: debate-screen
- Related requirements: FR-debate-screen-001, FR-debate-screen-002, FR-debate-screen-003, FR-debate-screen-004, FR-debate-screen-005, FR-debate-screen-006
- Source requirements spec: docs/functional-requirements-debate-screen.md
- Execution issue: https://github.com/nishantnaagnihotri/tark-vitark/issues/1

## 2. UX Goal
Provide a clear, mobile-first, read-only debate view where users can quickly scan For and Against arguments without interaction controls.

## 3. Information Hierarchy
1. Debate topic heading
2. Argument stream or two-column argument regions by side
3. Side labels and argument content blocks

## 4. Layout Blueprint
### Mobile (default)
- Single mixed chronological stream.
- For arguments are left-aligned.
- Against arguments are right-aligned.
- No interaction controls.

### Tablet/Desktop
- Two-column structure.
- For column on left, Against column on right.
- Preserve readability for dense/long text content.

## 5. Content and Copy
- Side labels: For and Against.
- Copy style is neutral and argument-focused.
- No interaction-oriented copy such as vote, post, or react.

## 6. Non-Visual Behavioral Rules
- Keep argument render order stable and deterministic.
- No loading, empty, or error flows in this static-sample slice.
- No user-triggered state transitions in this slice.

## 7. Responsive Rules
- Mobile-first defaults at narrow widths.
- Shift to two-column presentation on desktop-width breakpoints.
- Prevent horizontal overflow for long text.

## 8. Accessibility Expectations
- Use semantic heading structure with a single visible primary heading.
- Keep side distinction perceivable by both alignment and non-color cues.
- Maintain WCAG AA contrast targets for text and labels.
- Maintain natural keyboard reading order in read-only flow.

## 9. States
- Empty: Not required in this slice.
- Loading: Not required in this slice.
- Error: Not required in this slice.
- Populated: Required with at least three For and three Against arguments.

## 10. UX Acceptance Checklist
- [x] Mobile mixed stream keeps posted order and side alignment.
- [x] Desktop two-column layout uses For left and Against right.
- [x] No interactive controls are present.
- [x] Dense text remains readable on mobile and desktop.
- [x] UX contract links to Figma and code translation mapping.

## 11. Implementation Notes
- Treat Figma as primary visual reference.
- Implement visual side distinction without relying on color alone.
- Keep component structure simple and reusable for future interactive slices.

## 12. Figma Production Contract
- Figma page name: Page 1
- Frame list:
  - mobile: Debate Screen - Mobile Stream (in file destination)
  - tablet: Debate Screen - Tablet Transitional Layout
  - desktop: Debate Screen - Two Column
- Component instances:
  - TopicHeading
  - ArgumentItem (variant: For, Against)
  - DebateColumn
- Token usage:
  - Spacing scale tokens for vertical rhythm and column gap
  - Typography tokens for heading/body hierarchy
  - Color tokens for side distinction and neutral text/background
- State matrix coverage:
  - populated/mobile
  - populated/desktop
  - long-topic and long-argument readability

## 13. Code Translation Contract
- frame -> frontend component mapping:
  - Debate Screen - Mobile Stream -> DebateScreen + DebateStream
  - Debate Screen - Two Column -> DebateScreen + DebateColumns
- figma component -> reusable UI component mapping:
  - TopicHeading -> DebateTopicHeader
  - ArgumentItem (For/Against) -> DebateArgumentCard with side variant prop
  - DebateColumn -> DebateSideColumn
- token -> code variable mapping:
  - spacing tokens -> CSS custom properties for gaps and paddings
  - typography tokens -> heading/body font-size and line-height variables
  - side color tokens -> semantic CSS variables for For/Against accents
- interaction/state -> implementation expectation mapping:
  - read-only populated state only
  - no interactive actions
  - stable chronological ordering on mobile

## 14. Figma Artifact
- Figma link: https://www.figma.com/file/ltU4U9jpQuWKGInUHC9Bwq/debate-screen?node-id=0%3A1
