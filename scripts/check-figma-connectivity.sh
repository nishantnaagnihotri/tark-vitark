#!/usr/bin/env bash
set -euo pipefail

token="${FIGMA_ACCESS_TOKEN:-${FIGMA_TOKEN:-}}"
file_key="${FIGMA_FILE_KEY:-}"
check_comment_write="${FIGMA_CHECK_COMMENT_WRITE:-0}"
write_suffix=""

if [[ -z "${token}" ]]; then
  echo "ERROR: Missing Figma token. Set FIGMA_ACCESS_TOKEN (or FIGMA_TOKEN) and retry."
  echo "Hint: export FIGMA_ACCESS_TOKEN=<your-token>"
  exit 1
fi

if ! command -v curl >/dev/null 2>&1; then
  echo "ERROR: curl is required for connectivity checks."
  exit 1
fi

echo "Checking Figma API identity..."
me_response=$(curl -fsS -H "X-Figma-Token: ${token}" https://api.figma.com/v1/me)
if [[ -z "${me_response}" ]]; then
  echo "ERROR: Empty response from Figma /v1/me"
  exit 1
fi

echo "OK: Figma API identity check passed."

if [[ -n "${file_key}" ]]; then
  echo "Checking Figma file access for key ${file_key}..."
  file_response=$(curl -fsS -H "X-Figma-Token: ${token}" "https://api.figma.com/v1/files/${file_key}")
  if [[ -z "${file_response}" ]]; then
    echo "ERROR: Empty response from Figma /v1/files/${file_key}"
    exit 1
  fi
  echo "OK: Figma file access check passed."
else
  echo "INFO: FIGMA_FILE_KEY not set; skipped file access check."
fi

if [[ "${check_comment_write}" == "1" ]]; then
  if [[ -z "${file_key}" ]]; then
    echo "ERROR: FIGMA_CHECK_COMMENT_WRITE=1 requires FIGMA_FILE_KEY to be set."
    exit 1
  fi
  echo "Checking Figma write capability via comments API..."
  comment_response=$(curl -fsS -X POST \
    -H "X-Figma-Token: ${token}" \
    -H "Content-Type: application/json" \
    "https://api.figma.com/v1/files/${file_key}/comments" \
    -d '{"message":"Connectivity write check marker from scripts/check-figma-connectivity.sh","client_meta":{"x":100,"y":100}}')
  if [[ -z "${comment_response}" ]]; then
    echo "ERROR: Empty response from Figma comments write check."
    exit 1
  fi
  echo "OK: Figma comment write check passed."
  write_suffix=" + comment write"
fi

echo "SUCCESS: Figma connectivity checks passed (identity + file access${write_suffix})."
echo "NOTE: This script does not create or update visual frames."
