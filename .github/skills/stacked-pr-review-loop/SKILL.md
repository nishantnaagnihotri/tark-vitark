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
2. In this mode, orchestrator owns stack sequencing: merge order, base-to-tip progression, and PR retargeting.
3. Dev agents own their assigned PR's full review loop: implement, push, request Copilot review, poll to review-clean, fix `Accept` comments, escalate `Challenge` / `Needs Product Owner Decision` items to orchestrator, and return the `pr-review-loop` section-6 exit status package — either `REVIEW_CLEAN` (zero new comments, no open escalations) or `REVIEW_CLEAN_WITH_ESCALATIONS` (zero new comments but escalations pending).
4. Dev agents do not advance stack sequencing, trigger merges, or retarget PR bases.

## Efficient Sequence (Pipeline First)

1. Assigned dev agents open `PR1` (base: `master`), `PR2` (base: `PR1` branch), `PR3` (base: `PR2` branch), and deeper PRs as needed, each running their own review loop in parallel.
2. Each dev agent requests Copilot review immediately after opening its PR and polls to review-clean independently.
3. Orchestrator monitors dev handbacks and executes stack sequencing (merge order, retarget) once lower PRs reach `REVIEW_CLEAN` status. `REVIEW_CLEAN_WITH_ESCALATIONS` does not unblock sequencing — escalations must be resolved first.

## Disposition And Fix Sequence (Base To Tip)

1. Dev agent classifies each Copilot comment using `Accept | Challenge | Needs Product Owner Decision` per `pr-review-loop`.
2. For `Accept` items: dev agent applies fixes, pushes, and requests a fresh Copilot review on its own PR immediately — no orchestrator involvement required.
3. For `Challenge` or `Needs Product Owner Decision` items: dev agent sends a disposition report to the orchestrator and waits for resolution before pushing the challenged change itself. Unrelated `Accept` fixes on the same PR may still be applied, pushed, and re-reviewed immediately — only the challenged change is paused.
4. Consider a PR review-clean only when the latest Copilot review body indicates zero new comments.
5. Orchestrator does not dispatch fix instructions for `Accept` items — dev handles them directly.
6. Orchestrator advances stack sequencing only after the lower PR reaches review-clean state.

## Post-Loop Orchestrator Challenge Consolidation

After all dev agents have returned their exit status packages (per `pr-review-loop` section 6):

1. Orchestrator collects every `REVIEW_CLEAN_WITH_ESCALATIONS` package across all PRs in the stack.
2. If any escalations exist, orchestrator presents them to the Product Owner as a single consolidated cross-PR challenge list before advancing any stack sequencing. Group items by PR for clarity.
3. For each escalation the PO resolves (accept / fix), orchestrator dispatches the fix to the owning dev agent. Dev implements, pushes, re-runs its review loop, and returns a new exit status package.
4. Stack sequencing (merge order, retarget) does not advance until all escalations across all PRs are either resolved by PO or explicitly deferred by PO with a recorded rationale.
5. If all packages are `REVIEW_CLEAN`, orchestrator proceeds directly to merge sequencing.

## Merge And Retarget Sequence (Base To Tip)

1. Product Owner merges the lowest ready PR first. While waiting: arm an alarm (300 s interval, alarm skill). On each alarm wake, call GitHub MCP `pull_request_read` with `method=get` for the base PR; read response fields `state` and `merged`. If `state=closed` and `merged=true` → proceed to step 2. If not → re-arm.
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