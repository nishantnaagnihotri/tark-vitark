# UX Spec: Debate Screen (Read-Only, Mobile-First)

## 1. Scope Alignment
- Slice: debate-screen
- Related requirements: FR-debate-screen-001, FR-debate-screen-002, FR-debate-screen-003, FR-debate-screen-004
- Source requirements: docs/functional-requirements-debate-screen.md
- Execution issue: https://github.com/nishantnaagnihotri/tark-vitark/issues/1

## 2. UX Goal
Provide a clean, low-friction reading experience where users can understand a debate topic and compare favour versus against arguments without interaction.

## 3. Information Hierarchy
1. Debate topic (highest visual priority)
2. Chronological argument stream on mobile
3. Side signal per argument (favour/against)
4. Section grouping for larger screens (optional two-column treatment)

## 4. Layout Blueprint
### Mobile (default)
- Single-column flow.
- Order:
  - Topic header block
  - Mixed argument stream (chronological by posted order)
- Each argument item carries side styling:
  - In favour items are left-aligned
  - Against items are right-aligned
- Mobile must preserve chronological order even when side switches between adjacent items.

### Tablet/Desktop
- Topic header remains full-width at top.
- Favour and Against sections may switch to two-column layout for comparability.
- If content is highly uneven, allow independent column heights without forced equalization.

## 5. Content and Copy
- Topic label: "Debate Topic"
- Side labels: "In Favour" and "Against"
- Keep argument text language neutral and readable.
- For this slice, all content is static sample content.

## 6. Visual and Spacing Rules
- Clear contrast between background and text.
- Distinct visual treatment between favour and against containers (for example, border accent or heading marker).
- Minimum 16px horizontal padding on mobile.
- Consistent vertical rhythm between topic, section headings, and cards.
- Argument cards should prioritize readability over decorative styling.
- In mobile stream, alignment itself is a side cue: favour cards anchor left, against cards anchor right.

## 7. Responsive Rules
- Mobile-first CSS structure.
- Breakpoint suggestion:
  - <768px: single column
  - >=768px: optional two-column favour/against layout
- Prevent horizontal overflow for long topic or argument text.

## 8. Accessibility Expectations
- Use semantic heading structure:
  - h1: topic
  - h2: side labels
- Ensure text contrast meets WCAG AA.
- Logical reading order should match DOM order.
- No interactive controls in this slice, so focus behavior is not required beyond normal page flow.

## 9. States
- Empty/loading/error states are out of scope for this read-only static slice.
- Mandatory demo content:
  - 1 topic
  - >=3 favour arguments
  - >=3 against arguments
  - Mixed ordering in stream that demonstrates alternation across sides

## 10. UX Acceptance Checklist
- [ ] Topic is immediately identifiable at the top.
- [ ] On mobile, arguments render in posted order in one mixed stream.
- [ ] Favour arguments are left-aligned and against arguments are right-aligned on mobile.
- [ ] At least 3 arguments per side are present in rendered content.
- [ ] Mobile layout is readable without zoom or horizontal scroll.
- [ ] Desktop/tablet layout preserves side-by-side comparability.
- [ ] Typography and spacing support scanning long argument text.

## 11. Implementation Notes
- Keep structure simple and reusable for future interactive enhancements.
- Use semantic containers so later features (vote/comment) can attach without major layout refactor.

## 12. Figma Artifact
- Figma link: TBD
- Waiver: Not applied
