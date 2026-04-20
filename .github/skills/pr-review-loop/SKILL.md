---
name: pr-review-loop
description: "PR review workflow: Copilot review loop, PR review intake triage, and Accept-vs-Challenge disposition. Use when: creating a PR, addressing PR review comments, running the Copilot review loop, classifying review feedback, resolving review threads, polling for Copilot review results, or handling review dispositions. IMPORTANT: this skill also triggers automatically after any PR is opened as the final step of a multi-step workflow or todo list — not only when the user's top-level request is explicitly to create a PR."
---

# PR Review Loop

On-demand workflow for handling PR reviews end-to-end: intake triage, disposition classification, Copilot review loop execution, and review thread resolution.

## When to Use

- After creating a PR (review loop auto-entry)
- When addressing Copilot or human review comments on a PR
- When classifying review feedback as Accept / Challenge / Needs Product Owner Decision
- When polling for Copilot review completion
- When resolving or reconciling review threads

## Procedure Overview

1. **Create PR** → **[REVIEW REQUESTED]** → **[POLLING STARTED]** (single atomic sequence — no step between request and poll)
2. **Review arrives** → enumerate comments → classify each (Intake Protocol)
3. **Execute dispositions** → fix accepted items, post challenge replies, escalate PO items
4. **Reply to all threads** → push fixes → **[REVIEW REQUESTED]** → **[POLLING STARTED]** (single atomic sequence)
5. **Exit Copilot polling loop** when the latest Copilot review body says "generated 0 comments" (or equivalent). Before declaring merge-ready, verify the branch is up-to-date with the base branch (see Branch Sync Protocol, section 4). If behind, rebase, push, and re-enter the polling loop. **Complete the overall PR review workflow** only when both conditions are met: no `semantic-open` review threads remain from the latest pass, and all challenges are resolved with Product Owner.

## Review Loop Ownership

1. By default, the implementing agent for a PR is the review-loop owner and runs this workflow.
2. For dependent PR chains explicitly declared as `Orchestrator-Managed Stacked Review Mode`, ownership is split: each dev agent owns the full review loop for its own assigned PR; the orchestrator owns stack sequencing (merge order, base-to-tip progression, PR retargeting).
3. In `Orchestrator-Managed Stacked Review Mode`, dev agents run this full review loop per-PR and exit with a formal Review Loop Exit Status package (see section 6). They do not advance stack sequencing, trigger merges, or retarget PR bases.

---

## 1. Strict Accept-vs-Challenge Lens

1. Every suggestion, review comment, or proposed change must be explicitly classified as: `Accept`, `Challenge`, or `Needs Product Owner Decision`.
2. Agents must not accept feedback blindly. Each accepted item must include concise reasoning.
3. Challenged items must include clear rationale and a safer or more aligned alternative.
4. If feedback conflicts with approved protocol, prior owner decisions, or slice scope, the agent must decide whether it is (a) a `Challenge` that can be safely posted while the review loop continues unchanged, or (b) a true blocker / `Needs Product Owner Decision` item that would require changing approved direction, scope, or implementation before the loop can continue. Only case (b) requires pausing and requesting explicit Product Owner approval before changing course.
5. Internal triage may classify an item as `Challenge`. The agent posts the `Challenge` reply on the PR thread immediately — including rationale, the safer alternative, and a citation of the grounding rule/decision — and continues the review loop without pausing. Once the loop reaches a clean pass (no `semantic-open` review threads remain from the latest pass), the agent presents all open challenges to the Product Owner one by one for final disposition. If the Product Owner overrides any challenge (decides to accept/fix), the agent implements the fix, re-enters the review loop, and repeats until both conditions are met: (1) no `semantic-open` review threads remain from the latest pass, and (2) all challenges resolved with Product Owner.
6. Final disposition and rationale must be recorded in the relevant output (PR reply, handoff, or context update).
7. **Thread reply is a required blocking step — not optional.** Posting a reply on the review thread is part of the disposition, not a follow-up. A disposition is `semantic-open` until the reply is posted, regardless of whether the code fix is already pushed or committed. An agent that pushes a fix without posting the thread reply has not completed the disposition.
8. After an `Accept` or fully-executed `Challenge` disposition is completed, the agent must resolve the review thread when no Product Owner decision or reviewer follow-up remains.

## 1B. Per-Comment Disposition Execution Checklist (Mandatory — Run for Every Actioned Comment)

For every review comment actioned in a pass, execute these steps **in order**. No step may be skipped. The comment is `semantic-open` until all three are confirmed.

1. **Fix** — implement the code or content change (Accept path) or document the rationale (Challenge path). Push is deferred until all comments in this pass have completed steps 1 and 2.
2. **Reply** — post a reply on the GitHub PR review thread for this comment stating:
   - Disposition: `Accept` / `Challenge` / `Needs PO Decision`
   - What changed (Accept): brief description of the fix, or
   - Why no change (Challenge): rationale, safer alternative, and citation of grounding rule/decision
   - **This reply must be posted before the fix commit is pushed.** Pushing first and replying later is not permitted — the reply may be forgotten if the session ends between push and reply.
3. **Resolve** — mark the thread resolved (or record as `semantically-closed/tooling-unresolved` if MCP lacks the capability).

Log format per comment:
```
[DISPOSITION] Thread: <thread ID or comment excerpt>
Step 1 Fix: ✅ implemented | ⏭ no change (Challenge)
Step 2 Reply: ✅ posted | 🔴 MISSING — must post before push
Step 3 Resolve: ✅ resolved | ⚠️ tooling-unresolved
Status: semantic-closed | semantic-open (reason)
```

---

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

1. Immediately after creating a PR — whether the PR was opened in direct response to a user request **or** as the final step of a multi-step todo list or workflow — the review-loop owner must request Copilot review on that PR and begin the bounded polling window. This is automatic and unconditional — the review-loop owner must not pause, ask for confirmation, or wait for PO input before entering the loop. PR creation and review-loop entry are a single atomic sequence. The trigger is the act of opening a PR, not the scope of the originating user request.
2. **Thread Reply Completeness Check (mandatory before every push):** Before pushing any fix commit, the review-loop owner must verify that a reply has been posted on every comment actioned in this pass. Run through the Per-Comment Disposition Execution Checklist (section 1B) for each comment and confirm Step 2 (Reply) shows ✅ for all. If any reply is missing, post it first — then push. Pushing without all replies posted is a workflow failure.

3. After pushing a commit that addresses PR feedback, the review-loop owner must request a fresh Copilot review and immediately begin polling. Review request and polling are a single atomic sequence — see rule 8 below.

   **Dev agent fix dispatch rule:** when delegating review fixes to a dev agent, dispatch via `run_in_terminal (mode=async)`, not `runSubagent`. Dev agent output (commits, thread replies) is a GitHub side effect — it does not need to flow into the orchestrator's reasoning context. Using `runSubagent` here blocks the chat session for the full agent duration unnecessarily. Capture the terminal ID and record it in `active-state.md` under `## Pending Async Runs`. Verify completion via `get_terminal_output` or GitHub PR cross-check.

   **Dev agent autonomous loop (mandatory when delegating review fixes):** the dispatch prompt for a dev agent fixing PR review comments MUST include self-directed loop instructions. The dev agent must not exit after a single fix pass. Required loop behavior for dispatched dev agents:
   > After pushing all fixes and replying to all threads:
   > 1. Use the GitHub MCP `request_copilot_review` tool to request a fresh Copilot review on the PR.
   > 2. Run `node scripts/wait_for_copilot_review.js --owner <owner> --repo <repo> --pr <number>` synchronously via the execute tool (do NOT background it — wait for the JSON output).
   > 3. If the review body says "0 comments" / "0 new comments" / "generated 0 comments" → report done and exit.
   > 4. If there are new comments → run PR Review Intake Protocol (Accept/Challenge/Needs PO Decision), fix all Accepted items, commit, push, reply to threads, then return to step 1.
   > 5. Only exit the loop when: (a) the review is clean, or (b) there is a genuine blocker requiring Product Owner input. For blockers, state the exact decision needed and exit.
   >
   > Exit condition: review body semantically indicates zero new comments. Do NOT exit based on thread resolution state alone.

   Dispatch prompts that omit these loop instructions are incomplete. A dev agent dispatched without them will exit after one pass and leave the review loop to the orchestrator — which is a workflow failure when the intent is autonomous resolution.
4. The **only exit condition** from the review loop is when the latest Copilot review body semantically indicates **zero new comments**, including known variants such as **"generated 0 comments"**, **"0 new comments"**, or **"generated no new comments"**. Historical review records may remain on the PR; outdated or resolved threads do not count. The agent must not declare the loop complete based on thread-level analysis alone — the zero-comments result in the newest review is the sole pass criterion.
5. Each new Copilot comment must go through the PR Review Intake Protocol (section 2 above) before any additional changes are proposed or made.
6. If the loop cannot continue because of a protocol conflict, missing capability, or explicit owner-decision point, the agent must pause, discuss the issue with the Product Owner, and proceed only with the agreed position.
7. **Review request and polling are a single atomic sequence (no gap permitted).** The tool call return value from the review request — including `(empty)` — is a trigger to begin polling immediately. It is not a completion signal, not a status, and not a reason to summarize or report. Any return value from the review request tool must be followed by polling without pause. Immediately after calling the review request tool, emit the log entry `[REVIEW REQUESTED] → [POLLING STARTED]` and begin the polling window. If this log entry is absent, the atomic sequence was broken — that is a workflow failure.
8. Polling must use live GitHub MCP review data as the source of truth rather than relying on cached editor extension payloads.
9. When synchronous polling is not possible (orchestrator context — no blocking execute tool):
    - **Orchestrator context** (running in VS Code chat session): use the alarm skill (180 s interval) instead of the poll script. Immediately after `request_copilot_review` returns, arm the alarm and emit the required log entry `[REVIEW REQUESTED] → [POLLING STARTED]` at that moment. In orchestrator context, arming the alarm counts as polling having started for rule 7; alarm wakes are the polling mechanism. On each alarm wake:
      1. Call `get_reviews` on the PR via GitHub MCP.
      2. If latest Copilot review body says "generated 0 comments" / "0 new comments" / "generated no new comments" → review-clean; proceed.
      3. If new comments are present → run PR Review Intake Protocol, address, push, then immediately re-request review and re-arm the alarm so polling restarts atomically after the new review request.
      4. If no review yet → apply rule 11 (1-hour retry ladder): re-request and immediately re-arm if within 60 min of `T0`; escalate if `≥ 60 min`.
    - **Dev agent context** (running inside `run-agent.ts` with `execute` tool): run the poll script **synchronously** via the execute tool — the agent has a 1-hour timeout and can block on the script:
      ```
      node scripts/wait_for_copilot_review.js --owner <owner> --repo <repo> --pr <number>
      ```
      Read the JSON output directly and act on it within the same session.
10. Review threads should normally be resolved as part of disposition execution.
11. **Review timeout — keep retrying for 1 hour.** If Copilot hasn't posted a review yet, don't stop immediately. Keep re-requesting and re-polling for up to 1 hour from when the last push happened, then escalate.

    How to track the 1-hour window:

    - **Clock start (push time):** Call `pull_request_read` with `method=get` and read `updated_at`. This tells you when the PR head ref last changed — i.e., the actual push wall-clock time. Don't use the git commit's author/committer date; on rebases or cherry-picks that can be much earlier than the real push. If `pull_request_read` isn't available, fall back to `gh api repos/<owner>/<repo>/pulls/<number> --jq '.updated_at'` — only after confirming the MCP gap and getting Product Owner approval.
    - **On each wake with no review yet:** Check how long it's been since the push. If it's under 1 hour → re-request Copilot review, re-arm the alarm, emit `[REVIEW REQUESTED] → [POLLING STARTED]`, and keep going.
    - **Once 1 hour has passed with still no review:** Stop retrying. Report to the Product Owner: PR link, head SHA, push time, how long you've been waiting, and how many re-request attempts were made. Something is stuck on GitHub's side.

    Do not escalate while still within the 1-hour window.

12. If a thread still remains outdated and unresolved after disposition execution, the agent must reconcile that thread state before declaring the loop complete, or explicitly record it as `semantically-closed/tooling-unresolved` when MCP lacks the required resolution capability.

## 4. Branch Sync Protocol

1. **Mandatory sync check before merge-ready declaration.** Before declaring any PR merge-ready, the review-loop owner must verify the PR branch is up-to-date with the base branch. The GitHub UI warning "This branch is out-of-date with the base branch" is the authoritative signal. A merge-ready declaration while the branch is behind the base is a workflow failure.

2. **How to sync:** run `git fetch origin && git rebase origin/<base-branch>` on the PR branch. Resolve any conflicts. Push with `git push --force-with-lease` (never bare `--force`).

3. **After a rebase push:** the PR head SHA changes and prior Copilot review passes are against a superseded SHA. Request a fresh Copilot review and re-enter the polling loop. Do not declare merge-ready until a clean pass (0 new comments) is received on the rebased head SHA.

4. **Policy:** prefer `rebase` over `merge` for branch updates to maintain linear history and preserve rebase-merge compatibility.

5. **If rebase fails** (non-trivial conflicts or history divergence): do not attempt to force-resolve. Surface the conflict summary to the Product Owner and await explicit authorization before proceeding.

6. **Ongoing check frequency:** verify sync status at minimum once per review loop completion (after 0-comments clean pass). If the PR has been open for multiple sessions or large changes have landed on the base branch since the PR was opened, also check before each fix-push batch.

---

## 5. Pre-Completion Self-Check (Mandatory Before Declaring Done)

Before declaring the PR review workflow complete or saying the PR is "merge-ready", the agent **must** answer each question below. Answering "no" to any item is a blocking condition.

| # | Question | Pass condition |
|---|---|---|
| 1 | **Are there any open comments?** Fetch both PR review comments via GitHub MCP `pull_request_read` with `method=get_review_comments` and top-level PR conversation comments via GitHub MCP `issue_read` with `method=get_comments`, then verify there are no unresolved review comments or PR conversation comments that still require a disposition reply from the **PR author**. (`gh api` is a confirmed-gap fallback only — requires PO approval before use.) | Zero unresolved review comments or PR conversation comments awaiting PR-author reply |
| 2 | **Did the latest Copilot review body indicate zero new comments (for example, "generated 0 comments", "0 new comments", or equivalent wording)?** | Yes — any semantically equivalent zero-comments wording, on the current head SHA |
| 3 | **Is the branch up-to-date with the base?** | Branch sync check passed (Section 4) |
| 4 | **Are all challenges resolved with Product Owner?** | No pending `Challenge` items awaiting PO disposition |

**Hardening rule:** the agent must not declare "merge-ready" or call the overall task complete until it has explicitly run this self-check and confirmed all four items pass. Skipping this check is a workflow failure.
---

## 6. Review Loop Exit Status (Mandatory — Emit On Every Exit)

Every agent must emit one of the two exit status packages below when completing its review loop. Exiting without a status package is a workflow failure.

### `REVIEW_CLEAN`

Condition: latest Copilot review body indicates zero new comments **and** no `Challenge` or `Needs Product Owner Decision` items are open.

Required package fields:
- `status: REVIEW_CLEAN`
- `pr`: PR link
- `head_sha`: head SHA of the reviewed commit
- `copilot_review_excerpt`: verbatim opening line of the latest Copilot review body

### `REVIEW_CLEAN_WITH_ESCALATIONS`

Condition: latest Copilot review body indicates zero new comments **but** ≥ 1 `Challenge` or `Needs Product Owner Decision` items remain open (posted as thread replies, awaiting PO resolution).

Required package fields:
- `status: REVIEW_CLEAN_WITH_ESCALATIONS`
- `pr`: PR link
- `head_sha`: head SHA of the reviewed commit
- `copilot_review_excerpt`: verbatim opening line of the latest Copilot review body
- `escalations`: list — one entry per deferred item:
  - `thread_link`: GitHub PR thread URL
  - `classification`: `Challenge` or `Needs Product Owner Decision`
  - `summary`: one-line description of the open item

**Routing rule:** `REVIEW_CLEAN` → proceed to merge-ready declaration. `REVIEW_CLEAN_WITH_ESCALATIONS` → return package to orchestrator (stacked mode) or Product Owner (standalone mode) and wait for resolution before proceeding.