# PRD v0 - post-tark-vitark

## 1. Problem Statement and Expected Outcome

The current Debate Screen is read-only. This slice enables any visitor to create and Publish a text-only Post as Tark or Vitark directly on the existing Debate Screen through an always-visible, bottom-anchored Composer.

Expected outcome:
- The Composer is inline (WhatsApp-style), not full-screen.
- Side Selection uses a Material 3 single-select Segmented Control with Tark and Vitark.
- Trimmed Text validation enforces min 10 and max 300 (inclusive), rejects whitespace-only input, and allows internal spaces/newlines.
- Valid submit immediately Publishes in-page via Chronological Append at the bottom.
- On initial load, Tark is preselected; after interaction, last selected side is remembered until refresh.
- On mobile keyboard open, Composer remains visible and pinned above keyboard overlap with submit action reachable.
- Full page refresh restores Baseline Static Debate Content and removes newly added local Posts.

## 2. Target Users and Primary Scenarios

| User | Primary Scenario |
|---|---|
| Public visitor on desktop or mobile | Creates a Post from Composer, selects Tark or Vitark, submits, and sees immediate Chronological Append at the bottom of Debate Screen. |

Mobile scenario:
- Visitor composes while keyboard is open; Composer remains visible, pinned, and usable.

## 3. In-Scope and Out-of-Scope

### In-Scope

| ID | Item |
|---|---|
| IS-1 | Existing single static Debate Screen only |
| IS-2 | Always-visible, bottom-anchored Composer (WhatsApp-style, non-full-screen) |
| IS-3 | Material 3 single-select Segmented Control with Tark and Vitark |
| IS-4 | Initial default Side Selection is Tark on page load |
| IS-5 | Side memory after interaction until page refresh |
| IS-6 | Text-only input |
| IS-7 | Trimmed Text length validation min 10 and max 300 (inclusive) |
| IS-8 | Whitespace-only input rejection |
| IS-9 | Internal spaces/newlines allowed |
| IS-10 | Immediate in-page Publish for valid Posts |
| IS-11 | Chronological Append at bottom |
| IS-12 | Create-Only Lifecycle (no edit/delete) |

### Out-of-Scope

| ID | Item |
|---|---|
| OOS-1 | Authentication/login |
| OOS-2 | Moderation/approval workflow |
| OOS-3 | Edit/delete Post actions |
| OOS-4 | Backend persistence or account history |
| OOS-5 | Media/link attachments |
| OOS-6 | Network failure handling UX |
| OOS-7 | Retaining newly added Posts after full page refresh |

## 4. Functional Requirements

| ID | Requirement | Priority | Traced To |
|---|---|---|---|
| FR-1 | Debate Screen shall show an always-visible, bottom-anchored Composer on load and during normal scrolling. | Must | AC-1 |
| FR-2 | Composer shall be inline (WhatsApp-style) and not full-screen. | Must | AC-2 |
| FR-3 | Composer shall include a Material 3 single-select Segmented Control with exactly two options: Tark and Vitark. | Must | AC-3 |
| FR-4 | On initial page load, Tark shall be preselected. | Must | AC-4 |
| FR-5 | After user Side Selection, the most recently selected side shall be preselected for subsequent Posts until page refresh. | Must | AC-5 |
| FR-6 | Any visitor shall be able to Publish without authentication. | Must | AC-6 |
| FR-7 | Composer input shall accept text-only content. | Must | AC-7 |
| FR-8 | Validation shall use Trimmed Text length (leading/trailing whitespace removed). | Must | AC-8 |
| FR-9 | Whitespace-only input shall be rejected. | Must | AC-9 |
| FR-10 | Trimmed Text length below 10 shall be rejected. | Must | AC-10 |
| FR-11 | Trimmed Text length above 300 shall be rejected. | Must | AC-11 |
| FR-12 | Trimmed Text length from 10 to 300 inclusive shall be accepted. | Must | AC-12 |
| FR-13 | Internal spaces and newline characters shall be allowed. | Must | AC-13 |
| FR-14 | On valid submit, Post shall Publish immediately in-page. | Must | AC-14 |
| FR-15 | Newly published Posts shall append at the bottom in chronological order. | Must | AC-15 |
| FR-16 | Post lifecycle shall be Create-Only; edit/delete actions are absent. | Must | AC-16 |
| FR-17 | On mobile keyboard open, Composer shall remain visible and pinned above keyboard overlap with submit action reachable. | Must | AC-17 |
| FR-18 | Full page refresh shall restore Baseline Static Debate Content and remove newly added local Posts. | Must | AC-18 |

## 5. Constraints and Non-Goals

| ID | Constraint / Non-Goal |
|---|---|
| C-1 | Slice is static/local only; no network/backend dependency is required for posting behavior. |
| C-2 | Full page refresh resets to Baseline Static Debate Content. |
| C-3 | Posting is open to any visitor in this slice. |
| C-4 | Accessibility baseline remains a standing requirement. |
| C-5 | No auth required in this slice. |
| C-6 | No edit/delete in this slice. |
| C-7 | Network failure handling is out of scope. |

## 6. Success Metrics

| ID | Metric | Measurement Method |
|---|---|---|
| SM-1 | Visitors can Publish valid Tark and Vitark Posts from Composer. | Acceptance journey pass for both sides. |
| SM-2 | Validation behavior is consistent. | Boundary checks for whitespace-only, below 10, 10, 300, above 300. |
| SM-3 | Valid submit immediately Publishes and Chronological Append is correct. | Runtime journey verifies immediate insertion as last item. |
| SM-4 | Side Selection default and memory behavior are correct until refresh. | Runtime journey verifies default Tark and remembered last selection. |
| SM-5 | Mobile keyboard-open usability is preserved. | Runtime check at mobile viewport with keyboard overlap verifies Composer visibility and submit reachability. |
| SM-6 | Refresh behavior restores baseline static state. | Full refresh removes newly added local Posts and restores Baseline Static Debate Content. |

## 7. Acceptance Criteria

| ID | Acceptance Criterion |
|---|---|
| AC-1 | The debate screen shows an always-visible, bottom-anchored composer on load and during normal scrolling. |
| AC-2 | The composer is inline (WhatsApp-style) and not full-screen. |
| AC-3 | The composer includes a Material 3 single-select segmented control with exactly two options: Tark and Vitark. |
| AC-4 | On initial page load, Tark is preselected. |
| AC-5 | After user side selection, the most recently selected side is preselected for subsequent posts until page refresh. |
| AC-6 | Any visitor can post without authentication. |
| AC-7 | Input accepts text-only content. |
| AC-8 | Validation uses trimmed text length (leading/trailing whitespace removed). |
| AC-9 | Whitespace-only input is rejected. |
| AC-10 | Trimmed text length below 10 is rejected. |
| AC-11 | Trimmed text length above 300 is rejected. |
| AC-12 | Trimmed text length between 10 and 300 inclusive is accepted. |
| AC-13 | Internal spaces and newline characters are allowed. |
| AC-14 | On valid submit, the post publishes immediately in-page. |
| AC-15 | Newly published posts append at the bottom in chronological order. |
| AC-16 | Post lifecycle is create-only in this slice; edit/delete actions are absent. |
| AC-17 | On mobile keyboard open, composer remains visible and pinned above keyboard overlap with submit action reachable. |
| AC-18 | Full page refresh restores baseline static debate content and removes newly added local posts. |

## 8. Dependencies and Risks

| Type | Description | Mitigation |
|---|---|---|
| Dependency | Existing Debate Screen structure must support dynamic append-at-bottom behavior. | Validate in build and runtime QA journeys. |
| Dependency | Composer layout must handle mobile viewport changes when keyboard opens. | Validate viewport and keyboard scenarios in runtime QA. |
| Risk | Mobile browser keyboard behavior varies by device/browser and can affect pinning behavior. | Explicit mobile matrix checks at runtime QA. |
| Risk | Rapid repeated submissions may duplicate Posts if submit state is not guarded. | Include duplicate-submit test coverage in build validation. |
| Risk | Local-only behavior may confuse visitors expecting persistence across refresh. | Keep refresh behavior explicit in acceptance verification. |

## 9. Open Questions

| ID | Question | Source | Status | Resolution |
|---|---|---|---|---|
| OQ-NA | No open questions remain for this slice. | Requirement Context Package Open Questions section | Resolved | Product Owner provided complete Gate 1 decisions; Gate 2 introduces no additional open question. |

## Requirement-to-PRD Alignment Check

### Contract Freeze Validation

| Requirement Context Package Element | PRD Coverage | Status |
|---|---|---|
| Requirement Statement | Sections 1, 3, 4, 7 | Preserved exactly in intent and scope |
| Problem and Expected Outcome | Section 1 | Preserved |
| Users and Scenarios | Section 2 | Preserved |
| Scope Boundaries (In-Scope) | Section 3 In-Scope | Preserved one-to-one |
| Scope Boundaries (Out-of-Scope) | Section 3 Out-of-Scope | Preserved one-to-one |
| Constraints and Non-Goals | Section 5 | Preserved |
| Success Criteria | Section 6 | Preserved and made measurable |
| Dependencies and Risks | Section 8 | Preserved |
| Acceptance Criteria AC-1..AC-18 | Sections 4 and 7 | Preserved one-to-one |
| Open Questions | Section 9 | Preserved (none) |
| Accepted Assumptions | Sections 5 and 6 | Preserved |
| Owner Decisions Log | Sections 1 to 9 | Preserved |

### Acceptance Criteria One-to-One Mapping

| Gate 1 AC ID | Functional Requirement | PRD AC ID | Status |
|---|---|---|---|
| AC-1 | FR-1 | AC-1 | Complete |
| AC-2 | FR-2 | AC-2 | Complete |
| AC-3 | FR-3 | AC-3 | Complete |
| AC-4 | FR-4 | AC-4 | Complete |
| AC-5 | FR-5 | AC-5 | Complete |
| AC-6 | FR-6 | AC-6 | Complete |
| AC-7 | FR-7 | AC-7 | Complete |
| AC-8 | FR-8 | AC-8 | Complete |
| AC-9 | FR-9 | AC-9 | Complete |
| AC-10 | FR-10 | AC-10 | Complete |
| AC-11 | FR-11 | AC-11 | Complete |
| AC-12 | FR-12 | AC-12 | Complete |
| AC-13 | FR-13 | AC-13 | Complete |
| AC-14 | FR-14 | AC-14 | Complete |
| AC-15 | FR-15 | AC-15 | Complete |
| AC-16 | FR-16 | AC-16 | Complete |
| AC-17 | FR-17 | AC-17 | Complete |
| AC-18 | FR-18 | AC-18 | Complete |

Owner-approved deltas:
- None.

## Traceability Map

| PRD Section | Requirement Context Package Source |
|---|---|
| Section 1 | Requirement Statement; Problem and Expected Outcome |
| Section 2 | Users and Scenarios |
| Section 3 | Scope Boundaries (In-Scope and Out-of-Scope) |
| Section 4 | Acceptance Criteria AC-1..AC-18 |
| Section 5 | Constraints and Non-Goals; Accepted Assumptions |
| Section 6 | Success Criteria |
| Section 7 | Acceptance Criteria AC-1..AC-18 |
| Section 8 | Dependencies and Risks |
| Section 9 | Open Questions |

## Quality Gaps

None. All Gate 2 quality checks pass with complete traceability and no contract drift.

## PRD Draft Package

### Canonical Requirement Summary

| Field | Value |
|---|---|
| Slice | post-tark-vitark |
| Core capability | Create and Publish text-only Post on Debate Screen |
| Side Selection | Tark or Vitark via Material 3 Segmented Control |
| Validation | Trimmed Text min 10, max 300 (inclusive), whitespace-only rejected |
| Publish behavior | Immediate in-page Publish |
| Ordering | Chronological Append at bottom |
| Lifecycle | Create-Only |
| Persistence | Local/session only; refresh resets to baseline |
| Mobile behavior | Composer stays visible/pinned above keyboard overlap |
| Auth | Not required |

### Gate Decision

**PRD Readiness:** Ready  
**Gate Decision:** can proceed to design

## PR Description

## Gate 2 - PRD v0: post-tark-vitark

One-line summary:
PRD for enabling any visitor to create and immediately Publish a text-only Tark or Vitark Post on the existing Debate Screen via a bottom-anchored Composer, with Trimmed Text validation (10 to 300 inclusive), Chronological Append, mobile keyboard-safe visibility, and Create-Only Lifecycle.

Slice folder path:
[docs/slices/post-tark-vitark](docs/slices/post-tark-vitark)

Gate status:
Ready - can proceed to design.

Open questions:
| ID | Question | Status | Resolution |
|---|---|---|---|
| OQ-NA | No open questions remain for this slice. | Resolved | Product Owner provided complete Gate 1 decisions; no unresolved item blocks progression. |

Unresolved question blocking map:
- None. No unresolved question blocks Gate 3, Gate 4, Gate 5, Gate 5.5, or Gate 6.

Artifact:
[docs/slices/post-tark-vitark/02-prd.md](docs/slices/post-tark-vitark/02-prd.md)
