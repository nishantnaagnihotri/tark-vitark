#!/usr/bin/env python3

import argparse
import json
import subprocess
import sys
import time
from typing import Any


BOT_LOGIN = "copilot-pull-request-reviewer[bot]"


def gh_api(path: str) -> Any:
    result = subprocess.run(
        ["gh", "api", path],
        check=True,
        text=True,
        capture_output=True,
    )
    return json.loads(result.stdout)


def maybe_gh_api(path: str) -> tuple[Any | None, str | None]:
    result = subprocess.run(
        ["gh", "api", path],
        text=True,
        capture_output=True,
    )
    if result.returncode != 0:
        stderr = (result.stderr or result.stdout).strip()
        return None, stderr or f"gh api failed for {path}"
    return json.loads(result.stdout), None


def get_pull_request(owner: str, repo: str, pull_number: int) -> dict[str, Any]:
    return gh_api(f"repos/{owner}/{repo}/pulls/{pull_number}")


def get_reviews(owner: str, repo: str, pull_number: int) -> list[dict[str, Any]]:
    return gh_api(f"repos/{owner}/{repo}/pulls/{pull_number}/reviews?per_page=100")


def get_review_comments(owner: str, repo: str, pull_number: int) -> list[dict[str, Any]]:
    return gh_api(f"repos/{owner}/{repo}/pulls/{pull_number}/comments?per_page=100")


def summarize_check_runs(owner: str, repo: str, head_sha: str) -> dict[str, Any]:
    data, error = maybe_gh_api(f"repos/{owner}/{repo}/commits/{head_sha}/check-runs")
    if error:
        return {"available": False, "error": error, "runs": []}

    runs = []
    for run in data.get("check_runs", []):
        runs.append(
            {
                "name": run.get("name"),
                "status": run.get("status"),
                "conclusion": run.get("conclusion"),
                "started_at": run.get("started_at"),
                "completed_at": run.get("completed_at"),
                "html_url": run.get("html_url"),
            }
        )

    return {"available": True, "error": None, "runs": runs}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Wait for a GitHub Copilot PR review on a specific PR head."
    )
    parser.add_argument("--owner", required=True, help="GitHub repository owner")
    parser.add_argument("--repo", required=True, help="GitHub repository name")
    parser.add_argument("--pr", required=True, type=int, help="Pull request number")
    parser.add_argument(
        "--head-sha",
        help="Optional exact PR head SHA to watch. If omitted, the script derives the current PR head from GitHub.",
    )
    parser.add_argument(
        "--timeout-seconds",
        type=int,
        default=300,
        help="Maximum time to wait before returning timeout status. Default: 300.",
    )
    parser.add_argument(
        "--interval-seconds",
        type=int,
        default=15,
        help="Polling interval in seconds. Default: 15.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    start = time.time()

    pull_request = get_pull_request(args.owner, args.repo, args.pr)
    target_head_sha = args.head_sha or pull_request["head"]["sha"]

    while True:
        elapsed = int(time.time() - start)
        pull_request = get_pull_request(args.owner, args.repo, args.pr)
        live_head_sha = pull_request["head"]["sha"]

        if live_head_sha != target_head_sha:
            print(
                json.dumps(
                    {
                        "status": "head-changed",
                        "elapsed_seconds": elapsed,
                        "expected_head_sha": target_head_sha,
                        "live_head_sha": live_head_sha,
                        "pull_request_url": pull_request.get("html_url"),
                    },
                    indent=2,
                )
            )
            return 3

        reviews = get_reviews(args.owner, args.repo, args.pr)
        matches = [
            review
            for review in reviews
            if review.get("user", {}).get("login") == BOT_LOGIN
            and review.get("commit_id") == target_head_sha
        ]

        if matches:
            latest_review = sorted(matches, key=lambda review: review.get("submitted_at") or "")[-1]
            review_comments = [
                comment
                for comment in get_review_comments(args.owner, args.repo, args.pr)
                if comment.get("user", {}).get("login") == BOT_LOGIN
                and comment.get("commit_id") == target_head_sha
            ]
            print(
                json.dumps(
                    {
                        "status": "review-found",
                        "elapsed_seconds": elapsed,
                        "owner": args.owner,
                        "repo": args.repo,
                        "pull_number": args.pr,
                        "head_sha": target_head_sha,
                        "review": {
                            "id": latest_review.get("id"),
                            "state": latest_review.get("state"),
                            "submitted_at": latest_review.get("submitted_at"),
                            "html_url": latest_review.get("html_url"),
                            "body": latest_review.get("body"),
                        },
                        "review_comment_count": len(review_comments),
                        "review_comments": [
                            {
                                "path": comment.get("path"),
                                "line": comment.get("line"),
                                "created_at": comment.get("created_at"),
                                "html_url": comment.get("html_url"),
                                "body": comment.get("body"),
                            }
                            for comment in review_comments
                        ],
                        "check_runs": summarize_check_runs(args.owner, args.repo, target_head_sha),
                    },
                    indent=2,
                )
            )
            return 0

        if elapsed >= args.timeout_seconds:
            print(
                json.dumps(
                    {
                        "status": "timeout",
                        "elapsed_seconds": elapsed,
                        "owner": args.owner,
                        "repo": args.repo,
                        "pull_number": args.pr,
                        "head_sha": target_head_sha,
                        "pull_request_url": pull_request.get("html_url"),
                        "check_runs": summarize_check_runs(args.owner, args.repo, target_head_sha),
                    },
                    indent=2,
                )
            )
            return 2

        time.sleep(args.interval_seconds)


if __name__ == "__main__":
    sys.exit(main())