#!/usr/bin/env bash
set -euo pipefail

token="${FIGMA_ACCESS_TOKEN:-${FIGMA_TOKEN:-}}"

fetch_json_with_retry() {
  local url="$1"
  local max_attempts=5
  local attempt=1
  local wait_seconds=2
  local body_file
  body_file=$(mktemp)

  while [[ $attempt -le $max_attempts ]]; do
    local http_code
    http_code=$(curl -sS -o "$body_file" -w "%{http_code}" -H "X-Figma-Token: ${token}" "$url")

    if [[ "$http_code" == "200" ]]; then
      cat "$body_file"
      rm -f "$body_file"
      return 0
    fi

    if [[ "$http_code" == "429" ]]; then
      if [[ $attempt -lt $max_attempts ]]; then
        sleep "$wait_seconds"
        wait_seconds=$((wait_seconds * 2))
        attempt=$((attempt + 1))
        continue
      fi
      echo "ERROR: Figma API rate limited (429) after ${max_attempts} attempts." >&2
      rm -f "$body_file"
      return 1
    fi

    echo "ERROR: Figma API request failed with HTTP ${http_code}." >&2
    rm -f "$body_file"
    return 1
  done
}

usage() {
  cat <<'EOF'
Usage: ./scripts/check-figma-visual-evidence.sh <figma-url-or-file-key>

Examples:
  ./scripts/check-figma-visual-evidence.sh ltU4U9jpQuWKGInUHC9Bwq
  ./scripts/check-figma-visual-evidence.sh "https://www.figma.com/file/ltU4U9jpQuWKGInUHC9Bwq/debate-screen?node-id=12%3A34"
EOF
}

if [[ $# -ne 1 ]]; then
  usage
  exit 1
fi

if [[ -z "${token}" ]]; then
  echo "ERROR: Missing Figma token. Set FIGMA_ACCESS_TOKEN (or FIGMA_TOKEN)."
  exit 1
fi

input="$1"
file_key=""
node_id=""

if [[ "$input" == *"figma.com"* ]]; then
  file_key=$(printf '%s' "$input" | sed -n 's#.*figma.com/file/\([^/\?]*\).*#\1#p')
  node_id=$(printf '%s' "$input" | sed -n 's#.*[?&]node-id=\([^&]*\).*#\1#p' | sed 's/%3A/:/g;s/%3a/:/g')
else
  file_key="$input"
fi

if [[ -z "${file_key}" ]]; then
  echo "ERROR: Could not extract Figma file key from input."
  exit 1
fi

file_json=$(fetch_json_with_retry "https://api.figma.com/v1/files/${file_key}")
frame_count=$(printf '%s' "$file_json" | grep -o '"type":"FRAME"' | wc -l | tr -d ' ')

if [[ "$frame_count" -eq 0 ]]; then
  echo "ERROR: No FRAME nodes found in file ${file_key}. Visual design artifact is missing."
  exit 1
fi

echo "OK: Found ${frame_count} FRAME node(s) in file ${file_key}."

if [[ -n "${node_id}" ]]; then
  node_json=$(fetch_json_with_retry "https://api.figma.com/v1/files/${file_key}/nodes?ids=${node_id}")
  if ! printf '%s' "$node_json" | grep -q '"type":"FRAME"'; then
    echo "ERROR: node-id ${node_id} does not resolve to a FRAME node."
    exit 1
  fi
  echo "OK: node-id ${node_id} resolves to a FRAME node."
fi

echo "SUCCESS: Figma visual evidence check passed."
