# Requirement Context Package - post-tark-vitark

## Requirement Statement

Enable users to post a Tark or Vitark directly on the existing single static debate screen via an always-visible, bottom-anchored composer (WhatsApp-style, not full-screen), using a Material 3 single-select segmented control for side selection (Tark | Vitark). Posting is open to any visitor, text-only, validated on trimmed text length with min 10 and max 300, immediate in-page publish appending at the bottom, and create-only lifecycle. On initial load, side defaults to Tark; after user interaction, composer remembers and preselects the last selected side. On mobile keyboard open, composer remains visible and pinned above keyboard. Since this slice is static/local, network failure handling is out of scope and page refresh resets to baseline static debate content (newly added posts are forgotten).

Additional explicit decisions:
- Whitespace-only input is invalid.
- Leading/trailing whitespace is trimmed for validation.
- Internal spaces/newlines are allowed.
- No auth required in this slice.
- No edit/delete in this slice.

## Problem and Expected Outcome

The current debate screen is read-only. This slice enables lightweight participation by allowing any visitor to publish a text-only Tark or Vitark directly on the same page, with immediate local visibility and clear validation boundaries.

## Domain Glossary

| Term | Definition |
|---|---|
| Debate Screen | The existing single static page where Tark and Vitark content is displayed. |
| Podium | The bottom-anchored, always-visible input area used by a Debater to create and publish a new Post. |
| Audience | A person who reads and follows the debate without posting an argument. The primary user type on the Debate Screen. |
| Debater | A person who posts an argument (Tark or Vitark) to actively participate in the debate. |
| Post | A user-submitted text entry added to the debate flow. |
| Tark | A post that supports the debate position. |
| Vitark | A post that challenges/opposes the debate position. |
| Side Selection | User choice of Tark or Vitark for a post. |
| Segmented Control | The single-select two-option control used for side selection. |
| Trimmed Text | Input after removing leading and trailing whitespace for validation. |
| Publish | Making a valid post appear immediately in the current page view. |
| Chronological Append | Rendering new posts at the bottom in submission order. |
| Create-Only Lifecycle | Behavior allowing creation of posts, without edit/delete actions. |
| Baseline Static Debate Content | The original preloaded debate content restored on refresh. |

## Users and Scenarios

Public visitors using the debate screen on desktop and mobile.

Primary scenario:
- Visitor enters text, selects Tark or Vitark, submits, and sees the post appended at the bottom immediately.

Mobile scenario:
- Visitor composes while keyboard is open; composer remains visible and usable above the keyboard.

## Scope Boundaries

### In-Scope

- Existing single static debate screen only
- Always-visible, bottom-anchored composer (WhatsApp-style, non-full-screen)
- Material 3 single-select segmented control with Tark and Vitark
- Initial default side set to Tark on page load
- Side memory after interaction (preselect last selected side for subsequent posts until refresh)
- Text-only input
- Validation on trimmed text length:
  - minimum 10 (inclusive)
  - maximum 300 (inclusive)
- Whitespace-only input rejection
- Internal spaces/newlines allowed
- Immediate in-page publish for valid posts
- New posts appended at the bottom (chronological flow)
- Create-only lifecycle (no edit/delete)

### Out-of-Scope

- Authentication/login
- Moderation/approval workflow
- Edit/delete post actions
- Backend persistence or account history
- Media/link attachments
- Network failure handling UX
- Retaining newly added posts after full page refresh

## Constraints and Non-Goals

- Slice is static/local only; no network/backend dependency is required for posting behavior.
- Full page refresh resets to baseline static debate content.
- Posting is open to any visitor in this slice.
- Accessibility baseline remains a standing requirement.

## Success Criteria

Users can post valid text arguments as Tark or Vitark from the bottom composer and see them appear immediately at the bottom of the debate flow, with consistent validation behavior and mobile keyboard-safe usability.

## Dependencies and Risks

| Type | Description |
|---|---|
| Dependency | Existing debate screen structure must support dynamic append-at-bottom behavior. |
| Dependency | Composer layout must handle mobile viewport changes when keyboard opens. |
| Risk | Mobile browser keyboard behavior may vary by device/browser and can affect pinning behavior. |
| Risk | Rapid repeated submissions can create duplicate entries if submit state is not guarded. |
| Risk | Local-only behavior may confuse users expecting persistence across refresh. |

## Acceptance Criteria

| ID | Criterion |
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

## Open Questions

None.

## Accepted Assumptions

1. Remembered side state is session-local and resets on full refresh.
2. Character counting for validation follows trimmed input length semantics as stated.
3. Immediate publish is local UI insertion only (no persistence requirement in this slice).

## Complexity Classification

**Standard** - Full 6-gate flow. This is a bounded but meaningful UI-interaction slice with validation, responsive behavior, and acceptance-journey impact.

## Owner Decisions Log

| Decision | Date |
|---|---|
| Bottom-anchored, always-visible composer on existing debate screen | 2026-04-08 |
| Material 3 single-select side control (Tark/Vitark) | 2026-04-08 |
| Open posting without auth | 2026-04-08 |
| Text-only input with trimmed length validation 10-300 | 2026-04-08 |
| Whitespace-only invalid; internal spaces/newlines allowed | 2026-04-08 |
| Immediate local publish with append-at-bottom behavior | 2026-04-08 |
| Create-only lifecycle (no edit/delete) | 2026-04-08 |
| Mobile keyboard-open composer pinning required | 2026-04-08 |
| Network failure handling out of scope; refresh resets to baseline static content | 2026-04-08 |
