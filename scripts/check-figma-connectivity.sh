#!/usr/bin/env bash
set -euo pipefail

token="${FIGMA_ACCESS_TOKEN:-${FIGMA_TOKEN:-}}"
file_key="${FIGMA_FILE_KEY:-}"

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

echo "SUCCESS: Figma connectivity is ready for UX agent automation."
