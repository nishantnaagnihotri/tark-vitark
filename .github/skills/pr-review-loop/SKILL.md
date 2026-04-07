---
name: pr-review-loop
description: "PR review workflow: Copilot review loop, PR review intake triage, and Accept-vs-Challenge disposition. Use when: creating a PR, addressing PR review comments, running the Copilot review loop, classifying review feedback, resolving review threads, polling for Copilot review results, or handling review dispositions."
---

# PR Review Loop

On-demand workflow for handling PR reviews end-to-end: intake triage, disposition classification, Copilot review loop execution, and review thread resolution.

## When to Use

- After creating a PR (review loop auto-entry)
- When addressing Copilot or human review comments on a PR
- When classifying review feedback as Accept / Challenge / Needs PO Decision
- When polling for Copilot review completion
- When resolving or reconciling review threads

## Procedure Overview

1. **Create PR** → immediately request Copilot review → enter polling loop
2. **Review arrives** → enumerate comments → classify each (Intake Protocol)
3. **Execute dispositions** → fix accepted items, post challenge replies, escalate PO items
4. **Push fixes** → request fresh Copilot review → poll again
5. **Exit Copilot polling loop** when the latest Copilot review body says "generated 0 comments" (or equivalent). **Complete the overall PR review workflow** only when both conditions are met: no `semantic-open` review threads remain from the latest pass, and all challenges are resolved with Product Owner.

---

## 1. Strict Accept-vs-Challenge Lens

1. Every suggestion, review comment, or proposed change must be explicitly classified as: `Accept`, `Challenge`, or `Needs Product Owner Decision`.
2. Agents must not accept feedback blindly. Each accepted item must include concise reasoning.
3. Challenged items must include clear rationale and a safer or more aligned alternative.
4. If feedback conflicts with approved protocol, prior owner decisions, or slice scope, the agent must decide whether it is (a) a `Challenge` that can be safely posted while the review loop continues unchanged, or (b) a true blocker / `Needs Product Owner Decision` item that would require changing approved direction, scope, or implementation before the loop can continue. Only case (b) requires pausing and requesting explicit Product Owner approval before changing course.
5. Internal triage may classify an item as `Challenge`. The agent posts the `Challenge` reply on the PR thread immediately — including rationale, the safer alternative, and a citation of the grounding rule/decision — and continues the review loop without pausing. Once the loop reaches a clean pass (no `semantic-open` review threads remain from the latest pass), the agent presents all open challenges to the Product Owner one by one for final disposition. If the Product Owner overrides any challenge (decides to accept/fix), the agent implements the fix, re-enters the review loop, and repeats until both conditions are met: (1) no `semantic-open` review threads remain from the latest pass, and (2) all challenges resolved with Product Owner.
6. Final disposition and rationale must be recorded in the relevant output (PR reply, handoff, or context update).
7. When fixing a review comment, agents must also post a review response that explains their position: what was accepted or challenged, what changed (or why no change), and the rationale/tradeoff.
8. After an `Accept` or fully-executed `Challenge` disposition is completed, the agent must resolve the review thread when no Product Owner decision or reviewer follow-up remains.

## 2. PR Review Intake Protocol

1. Before summarizing PR feedback, offering to fix it, or editing code/docs, the agent must first enumerate each actionable review comment and classify it as `Accept`, `Challenge`, or `Needs Product Owner Decision`.
2. Each classification must include concise reasoning tied to scope, correctness, protocol alignment, or readability.
3. Only after this triage step is complete may the agent propose or implement changes.
4. If the user asks what comments exist on a PR, the response must include both the comment summary and the disposition for each actionable item.
5. If the agent skips this sequence, that is a workflow failure and must be corrected before changes proceed.
6. Review-state definitions:
   - `semantic-open`: the comment has no executed disposition yet, still needs Product Owner or reviewer follow-up, or the accepted/challenged path is not fully executed.
   - `semantic-closed`: the `Accept` or fully-executed `Challenge` disposition is complete and no Product Owner or reviewer follow-up remains.
   - `semantically-closed/tooling-unresolved`: the comment is semantically closed, but the thread cannot be marked resolved because the required MCP mutation capability is unavailable.

## 3. Copilot Review Loop Protocol

1. Immediately after creating a PR, the agent must request Copilot review on that PR and begin the bounded polling window. This is automatic and unconditional — the agent must not pause, ask for confirmation, or wait for PO input before entering the loop. PR creation and review-loop entry are a single atomic sequence.
2. After pushing a commit that addresses PR feedback, the agent must request a fresh Copilot review on that PR before considering the review cycle complete.
3. Once an active PR review loop has started, the agent must continue it automatically after each push and review request; it must not pause for another Product Owner prompt unless a blocker, protocol conflict, missing capability, or explicit owner-decision point is reached.
4. The **only exit condition** from the review loop is when the latest Copilot review body semantically indicates **zero new comments**, including known variants such as **"generated 0 comments"**, **"0 new comments"**, or **"generated no new comments"**. Historical review records may remain on the PR; outdated or resolved threads do not count. The agent must not declare the loop complete based on thread-level analysis alone — the zero-comments result in the newest review is the sole pass criterion.
5. Each new Copilot comment must go through the PR Review Intake Protocol (section 2 above) before any additional changes are proposed or made.
6. If the loop cannot continue because of a protocol conflict, missing capability, or explicit owner-decision point, the agent must pause, discuss the issue with the Product Owner, and proceed only with the agreed position.
7. After requesting a fresh Copilot review, the agent must poll the live GitHub PR state for a bounded window before concluding the result is pending. Default polling window: up to 5 minutes at a practical cadence.
8. Polling must use live GitHub MCP review data as the source of truth rather than relying on cached editor extension payloads.
9. When a non-MCP polling fallback is used, prefer `node scripts/wait_for_copilot_review.js --owner <owner> --repo <repo> --pr <number>`.
10. Review threads should normally be resolved as part of disposition execution.
11. If no new Copilot review arrives within the bounded polling window, the agent must report that the loop is blocked on external async review completion.
12. If a thread still remains outdated and unresolved after disposition execution, the agent must reconcile that thread state before declaring the loop complete, or explicitly record it as `semantically-closed/tooling-unresolved` when MCP lacks the required resolution capability.
