---
name: stacked-pr-review-loop
description: "Stacked PR review-loop workflow: run pipelined review requests across dependent PRs, resolve review feedback base-to-tip, and preserve linear history for rebase-merge compatibility. Use when: managing two or more dependent PRs, syncing stacked branches after merges, or recovering from rebase-merge failures."
---

# Stacked PR Review-Loop Workflow

Use this skill to run stacked pull requests efficiently without sacrificing review quality or merge safety.

## When To Use

- Managing two or more dependent pull requests in one chain
- Running Copilot reviews in parallel across a PR stack
- Syncing remaining PRs after a base PR merge
- Recovering from `This branch can't be rebased` errors

## Efficient Sequence (Pipeline First)

1. Create `PR1` (base: `master`) and request Copilot review immediately.
2. Create `PR2` (base: `PR1` branch) and request Copilot review immediately.
3. Create `PR3` (base: `PR2` branch) and request Copilot review immediately.
4. Continue for deeper stacks with the same pattern.
5. Poll and triage comments as they arrive, but execute fixes from base to tip.

## Disposition And Fix Sequence (Base To Tip)

1. Classify each comment using `Accept | Challenge | Needs Product Owner Decision` per `pr-review-loop`.
2. Start fixes on the lowest open PR in the stack first.
3. After each fix push, request a fresh Copilot review immediately on that PR.
4. Consider that PR review-clean only when the latest Copilot review body indicates zero new comments.
5. Move to the next PR in the stack only after the lower PR reaches review-clean state.

## Merge And Retarget Sequence (Base To Tip)

1. Merge the lowest PR first.
2. Retarget the next PR base to `master`.
3. Rebase the next PR branch onto current `master`, resolve conflicts during rebase, and avoid merge commits in PR head history.
4. Request a fresh Copilot review on the rebased head.
5. Repeat until the top PR is merged.

## Rebase-Compatibility Guard

1. If your merge policy prefers `Rebase and merge`, keep PR branches linear (no merge commits in head history).
2. If a PR shows `This branch can't be rebased`, create a linear replacement branch from `master` and cherry-pick only non-merge commits.
3. Open replacement PR, run the review loop to clean pass, then close the superseded PR.

## Completion Criteria

1. Latest Copilot review on each active PR semantically indicates zero new comments (for example, `generated 0 comments`, `0 new comments`, or `generated no new comments`).
2. No `semantic-open` comments remain for the latest review pass.
3. All `Challenge` items are resolved with the Product Owner.
4. Stack is merged base-to-tip, or superseded PRs are explicitly closed with replacement links.