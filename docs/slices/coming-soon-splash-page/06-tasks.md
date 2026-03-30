# Task Breakdown — Coming Soon Splash Page

## Task List

### T1: Static Page Boundary Scaffold
- [GitHub Issue #5](https://github.com/nishantnaagnihotri/tark-vitark/issues/5)
- Establish static HTML and CSS page boundary for this slice.
- Enforce no JavaScript, no runtime/build dependency, and breakpoint targets.
- Acceptance: Static entry renders and supports downstream tasks T2-T5.
- Files: src/coming-soon-splash-page/index.html, styles.css
- Architecture ref: 05-architecture.md, Task 1

### T2: Core Content Hierarchy And Copy
- [GitHub Issue #6](https://github.com/nishantnaagnihotri/tark-vitark/issues/6)
- Implement required core copy and semantic hierarchy.
- Ensure dominant name, supporting tagline, and distinct coming-soon status.
- Acceptance: Hierarchy validates on desktop and mobile.
- Files: src/coming-soon-splash-page/index.html
- Architecture ref: 05-architecture.md, Task 1

### T3: Visual System (Colorful, Excitement-Oriented Styling)
- [GitHub Issue #7](https://github.com/nishantnaagnihotri/tark-vitark/issues/7)
- Implement and refine CSS to apply at least two non-neutral colors.
- Ensure the visual style is energetic and excitement-oriented.
- Acceptance: Reviewer describes as "colorful" and "exciting."
- Files: src/coming-soon-splash-page/styles.css
- Architecture ref: 05-architecture.md, Task 2

### T4: Responsive Layout QA
- [GitHub Issue #8](https://github.com/nishantnaagnihotri/tark-vitark/issues/8)
- Test and adjust for 1280px (desktop) and 375px (mobile).
- Ensure no overflow, all content visible, no horizontal scroll.
- Acceptance: No layout breakage at required breakpoints.
- Files: src/coming-soon-splash-page/styles.css, index.html
- Architecture ref: 05-architecture.md, Task 3

### T5: Self-Containment & Manual Verification
- [GitHub Issue #9](https://github.com/nishantnaagnihotri/tark-vitark/issues/9)
- Remove any JS, external fonts, or asset dependencies.
- Visual QA at both breakpoints.
- Acceptance: Page renders core content with no network dependency; all criteria met.
- Files: src/coming-soon-splash-page/index.html, styles.css
- Architecture ref: 05-architecture.md, Task 4, 5
