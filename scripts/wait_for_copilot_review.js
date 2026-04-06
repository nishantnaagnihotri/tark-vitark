#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { parseArgs } from "node:util";

// GraphQL returns login without [bot] suffix; REST includes it
const BOT_LOGIN = "copilot-pull-request-reviewer";

const REVIEW_QUERY = `
query($owner:String!, $repo:String!, $pr:Int!) {
  repository(owner:$owner, name:$repo) {
    pullRequest(number:$pr) {
      headRefOid
      reviews(last:50) {
        nodes {
          author { login }
          state
          body
          submittedAt
          url
          commit { oid }
          comments(first:100) {
            nodes {
              path
              line: originalLine
              body
              url
              createdAt
            }
          }
        }
      }
      commits(last:1) {
        nodes {
          commit {
            statusCheckRollup {
              contexts(first:20) {
                nodes {
                  ... on CheckRun {
                    __typename
                    name
                    status
                    conclusion
                    startedAt
                    completedAt
                    detailsUrl
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}`;

function ghGraphQL(query, variables) {
  const args = ["api", "graphql", "-f", `query=${query}`];
  for (const [key, value] of Object.entries(variables)) {
    const flag = typeof value === "number" ? "-F" : "-f";
    args.push(flag, `${key}=${value}`);
  }
  try {
    const result = execFileSync("gh", args, {
      encoding: "utf-8",
      timeout: 30_000,
    });
    const parsed = JSON.parse(result);
    if (parsed.errors || !parsed.data) {
      const message = parsed.errors
        ? parsed.errors.map((e) => e.message).join("; ")
        : "GraphQL response missing data field";
      console.log(
        JSON.stringify({ status: "error", error: "graphql_response_error", message }, null, 2)
      );
      process.exit(1);
    }
    return parsed;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.log(
      JSON.stringify({
        status: "error",
        error: "gh_graphql_failed",
        message,
      }, null, 2)
    );
    process.exit(1);
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function exitError(message, code = 2) {
  console.log(JSON.stringify({ status: "error", error: "cli_validation", message }, null, 2));
  process.exit(code);
}

function parseCliArgs() {
  let values;
  try {
    ({ values } = parseArgs({
      options: {
        owner: { type: "string" },
        repo: { type: "string" },
        pr: { type: "string" },
        "head-sha": { type: "string" },
        "timeout-seconds": { type: "string", default: "300" },
        "interval-seconds": { type: "string", default: "15" },
      },
      strict: true,
    }));
  } catch (err) {
    exitError(err instanceof Error ? err.message : String(err));
  }

  const owner = values.owner;
  const repo = values.repo;
  const pr = parseInt(values.pr, 10);
  const headSha = values["head-sha"] || null;
  const timeoutSeconds = parseInt(values["timeout-seconds"], 10);
  const intervalSeconds = parseInt(values["interval-seconds"], 10);

  if (!owner || !repo || !values.pr) {
    exitError("Usage: wait_for_copilot_review.js --owner OWNER --repo REPO --pr NUMBER");
  }
  if (!Number.isInteger(pr) || pr <= 0) {
    exitError("--pr must be a positive integer");
  }

  if (Number.isNaN(timeoutSeconds) || timeoutSeconds <= 0) {
    exitError("--timeout-seconds must be a positive number");
  }
  if (Number.isNaN(intervalSeconds) || intervalSeconds < 1) {
    exitError("--interval-seconds must be at least 1");
  }
  if (intervalSeconds > timeoutSeconds) {
    exitError("--interval-seconds must not exceed --timeout-seconds");
  }

  return { owner, repo, pr, headSha, timeoutSeconds, intervalSeconds };
}

function formatCheckRuns(commitNodes) {
  const rollup =
    commitNodes?.[0]?.commit?.statusCheckRollup?.contexts?.nodes ?? [];
  return rollup
    .filter((n) => n.__typename === "CheckRun")
    .map((r) => ({
      name: r.name,
      status: r.status,
      conclusion: r.conclusion,
      started_at: r.startedAt,
      completed_at: r.completedAt,
      html_url: r.detailsUrl,
    }));
}

async function main() {
  const { owner, repo, pr, headSha, timeoutSeconds, intervalSeconds } =
    parseCliArgs();
  const start = Date.now();

  // First query to resolve target SHA
  const initial = ghGraphQL(REVIEW_QUERY, { owner, repo, pr });
  const targetSha =
    headSha || initial.data.repository.pullRequest.headRefOid;

  while (true) {
    const elapsed = Math.round((Date.now() - start) / 1000);
    const result = ghGraphQL(REVIEW_QUERY, { owner, repo, pr });
    const pullRequest = result.data.repository.pullRequest;
    const liveSha = pullRequest.headRefOid;

    if (liveSha !== targetSha) {
      console.log(
        JSON.stringify(
          {
            status: "head-changed",
            elapsed_seconds: elapsed,
            expected_head_sha: targetSha,
            live_head_sha: liveSha,
          },
          null,
          2
        )
      );
      process.exit(3);
    }

    const botReviews = (pullRequest.reviews.nodes ?? [])
      .filter(
        (r) =>
          r.author?.login === BOT_LOGIN &&
          r.commit?.oid === targetSha &&
          r.state !== "PENDING" &&
          r.submittedAt
      )
      .sort((a, b) => a.submittedAt.localeCompare(b.submittedAt));

    if (botReviews.length > 0) {
      const latest = botReviews.at(-1);
      const comments = latest.comments.nodes ?? [];
      const checkRuns = formatCheckRuns(pullRequest.commits.nodes);

      console.log(
        JSON.stringify(
          {
            status: "review-found",
            elapsed_seconds: elapsed,
            owner,
            repo,
            pull_number: pr,
            head_sha: targetSha,
            review: {
              state: latest.state,
              submitted_at: latest.submittedAt,
              html_url: latest.url,
              body: latest.body,
            },
            review_comment_count: comments.length,
            review_comments: comments.map((c) => ({
              path: c.path,
              line: c.line,
              created_at: c.createdAt,
              html_url: c.url,
              body: c.body,
            })),
            check_runs: checkRuns,
          },
          null,
          2
        )
      );
      process.exit(0);
    }

    if (elapsed >= timeoutSeconds) {
      const checkRuns = formatCheckRuns(pullRequest.commits.nodes);
      console.log(
        JSON.stringify(
          {
            status: "timeout",
            elapsed_seconds: elapsed,
            owner,
            repo,
            pull_number: pr,
            head_sha: targetSha,
            check_runs: checkRuns,
          },
          null,
          2
        )
      );
      process.exit(2);
    }

    const remaining = timeoutSeconds - elapsed;
    if (remaining > 0) {
      await sleep(Math.min(intervalSeconds, remaining) * 1000);
    }
  }
}

main().catch((error) => {
  console.log(
    JSON.stringify(
      {
        status: "error",
        error: "unexpected_failure",
        message: error instanceof Error ? error.message : String(error),
      },
      null,
      2
    )
  );
  process.exit(1);
});
