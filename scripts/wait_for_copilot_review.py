#!/usr/bin/env python3

import argparse
import json
import subprocess
import sys
import time
from typing import Any, Dict, List, NoReturn, Optional, Tuple


BOT_LOGIN = "copilot-pull-request-reviewer[bot]"


def exit_with_error(
    status: str,
    error: str,
    *,
    path: Optional[str] = None,
    stderr: Optional[str] = None,
    stdout: Optional[str] = None,
    exit_code: int = 2,
) -> NoReturn:
    payload = {
        "status": status,
        "error": error,
        "path": path,
        "stderr": stderr,
        "stdout": stdout,
        "exit_code": exit_code,
    }
    print(json.dumps(payload, indent=2))
    raise SystemExit(exit_code)


def gh_api(path: str) -> Any:
    try:
        result = subprocess.run(
            ["gh", "api", path],
            check=True,
            text=True,
            capture_output=True,
        )
    except FileNotFoundError:
        exit_with_error(
            "error",
            "gh executable not found",
            path=path,
            stderr="Install GitHub CLI and ensure `gh` is on PATH.",
            exit_code=2,
        )
    except subprocess.CalledProcessError as error:
        exit_with_error(
            "error",
            "gh api command failed",
            path=path,
            stderr=(error.stderr or "").strip() or None,
            stdout=(error.stdout or "").strip() or None,
            exit_code=error.returncode or 2,
        )

    try:
        return json.loads(result.stdout)
    except json.JSONDecodeError as error:
        exit_with_error(
            "error",
            f"gh api returned invalid JSON: {error}",
            path=path,
            stdout=(result.stdout or "").strip() or None,
            exit_code=2,
        )


def maybe_gh_api(path: str) -> Tuple[Optional[Any], Optional[str]]:
    try:
        result = subprocess.run(
            ["gh", "api", path],
            text=True,
            capture_output=True,
        )
    except FileNotFoundError:
        return None, "gh executable not found"

    if result.returncode != 0:
        stderr = (result.stderr or result.stdout).strip()
        return None, stderr or f"gh api failed for {path}"

    try:
        return json.loads(result.stdout), None
    except json.JSONDecodeError as error:
        stdout = (result.stdout or "").strip() or "empty response"
        return None, f"gh api returned invalid JSON for {path}: {error}; output: {stdout}"


def parse_paginated_json_output(output: str) -> List[Dict[str, Any]]:
    decoder = json.JSONDecoder()
    items: List[Dict[str, Any]] = []
    index = 0
    text = output.strip()

    while index < len(text):
        while index < len(text) and text[index].isspace():
            index += 1

        if index >= len(text):
            break

        page, next_index = decoder.raw_decode(text, index)
        if isinstance(page, list):
            items.extend(page)
        elif isinstance(page, dict):
            items.append(page)
        index = next_index

    return items


def gh_api_paginated(path: str) -> List[Dict[str, Any]]:
    try:
        result = subprocess.run(
            ["gh", "api", "--paginate", path],
            check=True,
            text=True,
            capture_output=True,
        )
    except FileNotFoundError:
        exit_with_error(
            "error",
            "gh executable not found",
            path=path,
            stderr="Install GitHub CLI and ensure `gh` is on PATH.",
            exit_code=2,
        )
    except subprocess.CalledProcessError as error:
        exit_with_error(
            "error",
            "gh api pagination command failed",
            path=path,
            stderr=(error.stderr or "").strip() or None,
            stdout=(error.stdout or "").strip() or None,
            exit_code=error.returncode or 2,
        )

    try:
        return parse_paginated_json_output(result.stdout)
    except json.JSONDecodeError as error:
        exit_with_error(
            "error",
            f"gh api returned invalid paginated JSON: {error}",
            path=path,
            stdout=(result.stdout or "").strip() or None,
            exit_code=2,
        )


def get_pull_request(owner: str, repo: str, pull_number: int) -> Dict[str, Any]:
    return gh_api(f"repos/{owner}/{repo}/pulls/{pull_number}")


def get_reviews(owner: str, repo: str, pull_number: int) -> List[Dict[str, Any]]:
    return gh_api_paginated(f"repos/{owner}/{repo}/pulls/{pull_number}/reviews?per_page=100")


def get_review_comments(owner: str, repo: str, pull_number: int) -> List[Dict[str, Any]]:
    return gh_api_paginated(f"repos/{owner}/{repo}/pulls/{pull_number}/comments?per_page=100")


def summarize_check_runs(owner: str, repo: str, head_sha: str) -> Dict[str, Any]:
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
    args = parser.parse_args()
    if args.timeout_seconds <= 0:
        parser.error("--timeout-seconds must be greater than 0")
    if args.interval_seconds < 1:
        parser.error("--interval-seconds must be at least 1")
    if args.interval_seconds > args.timeout_seconds:
        parser.error("--interval-seconds must be less than or equal to --timeout-seconds")
    return args


def main() -> int:
    args = parse_args()
    start = time.monotonic()

    pull_request = get_pull_request(args.owner, args.repo, args.pr)
    target_head_sha = args.head_sha or pull_request["head"]["sha"]

    while True:
        elapsed = int(time.monotonic() - start)
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