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

## Execution Ownership (Orchestrated Stacks)

1. For multi-task dependent chains delegated by orchestrator, run in `Orchestrator-Managed Stacked Review Mode`.
2. In this mode, orchestrator owns review-loop control for every PR in the chain: review requests, polling, disposition triage, and base-to-tip progression.
3. Dev agents are code-only executors for assigned issues: implement changes, push commits, and return handback status.
4. Dev agents do not independently start or continue review loops in this mode unless orchestrator explicitly delegates a specific review action.

## Efficient Sequence (Pipeline First)

1. Assigned dev agents open `PR1` (base: `master`), `PR2` (base: `PR1` branch), `PR3` (base: `PR2` branch), and deeper PRs as needed, then hand back to orchestrator.
2. Orchestrator requests Copilot review immediately on each opened PR; do not wait for lower PR review completion before requesting upper PR reviews.
3. Orchestrator polls and triages comments as they arrive, then executes fix progression from base to tip.

## Disposition And Fix Sequence (Base To Tip)

1. Orchestrator classifies each comment using `Accept | Challenge | Needs Product Owner Decision` per `pr-review-loop`.
2. Orchestrator dispatches fix instructions to the owning dev agent on the lowest open PR in the stack first.
3. Dev agent applies code changes, pushes commits, and hands back without running an independent review loop unless delegated.
4. After each fix push, orchestrator requests a fresh Copilot review immediately on that PR.
5. Consider that PR review-clean only when the latest Copilot review body indicates zero new comments.
6. Move to the next PR in the stack only after the lower PR reaches review-clean state.

## Merge And Retarget Sequence (Base To Tip)

1. Product Owner merges the lowest ready PR first.
2. Orchestrator retargets the next PR base to `master`.
3. Rebase the next PR branch onto current `master`, resolve conflicts during rebase, avoid merge commits in PR head history, and hand back to orchestrator.
4. Orchestrator requests a fresh Copilot review on the rebased head.
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