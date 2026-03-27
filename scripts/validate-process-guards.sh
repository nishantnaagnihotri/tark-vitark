#!/usr/bin/env bash
set -euo pipefail

state_file="docs/current-state.md"

read_state_value() {
  local key="$1"
  awk -F': ' -v target="$key" '$0 ~ "^- " target ":" {print $2; exit}' "$state_file"
}

read_next_gate() {
  awk '
    /^## Next Gate/ {in_section=1; next}
    in_section && /^- / {
      line=$0
      sub(/^- /, "", line)
      print line
      exit
    }
  ' "$state_file"
}

extract_issue_field() {
  local body="$1"
  local section_title="$2"
  printf '%s\n' "$body" | awk -v title="$section_title" '
    $0 == "## " title {in_section=1; next}
    in_section && /^## / {exit}
    in_section && $0 !~ /^[[:space:]]*$/ {print; exit}
  '
}

contains_tbd() {
  local value="$1"
  local upper
  upper=$(printf '%s' "$value" | tr '[:lower:]' '[:upper:]')
  [[ "$upper" == *"TBD"* ]]
}

if [[ ! -f "$state_file" ]]; then
  echo "ERROR: Missing $state_file"
  exit 1
fi

slice_key=$(read_state_value "Slice key")
ownership_note=$(read_state_value "UX ownership note")
execution_issue=$(read_state_value "Execution issue")
next_gate=$(read_next_gate)

if [[ -z "${slice_key:-}" ]]; then
  echo "ERROR: Could not read active slice key from $state_file"
  exit 1
fi

if [[ -z "${execution_issue:-}" ]]; then
  echo "ERROR: Could not read execution issue from $state_file"
  exit 1
fi

if [[ -z "${next_gate:-}" ]]; then
  echo "ERROR: Could not read Next Gate from $state_file"
  exit 1
fi

expected_ux_contract="docs/ux-spec-${slice_key}.md"

if [[ "${ownership_note:-}" == *"not created yet"* ]] && [[ -f "$expected_ux_contract" ]]; then
  echo "ERROR: Process violation: $expected_ux_contract exists while current-state says UX contract is not created yet."
  exit 1
fi

if [[ "$next_gate" != "UX Gate" ]] && [[ ! -f "$expected_ux_contract" ]]; then
  echo "ERROR: Process violation: $expected_ux_contract must exist before leaving UX Gate."
  exit 1
fi

if ! command -v gh >/dev/null 2>&1; then
  echo "ERROR: gh CLI is required for issue consistency checks."
  exit 1
fi

if ! issue_body=$(gh issue view "$execution_issue" --json body --jq .body 2>/dev/null); then
  issue_number=$(printf '%s' "$execution_issue" | sed -n 's#.*/issues/\([0-9][0-9]*\)$#\1#p')
  if [[ -n "${issue_number:-}" ]]; then
    issue_body=$(gh issue view "$issue_number" --json body --jq .body 2>/dev/null || true)
  else
    issue_body=""
  fi
fi

if [[ -z "${issue_body:-}" ]]; then
  echo "ERROR: Could not read issue body for $execution_issue"
  exit 1
fi

ux_issue_value=$(extract_issue_field "$issue_body" "UX Contract Link")
if [[ -z "${ux_issue_value:-}" ]]; then
  ux_issue_value=$(extract_issue_field "$issue_body" "UX Spec Link")
fi

figma_issue_value=$(extract_issue_field "$issue_body" "Figma Link")
if [[ -z "${figma_issue_value:-}" ]]; then
  figma_issue_value=$(extract_issue_field "$issue_body" "Figma Link or Waiver")
fi

if [[ -z "${ux_issue_value:-}" ]]; then
  echo "ERROR: Missing UX contract/spec field in issue body for $execution_issue"
  exit 1
fi

if [[ -z "${figma_issue_value:-}" ]]; then
  echo "ERROR: Missing Figma field in issue body for $execution_issue"
  exit 1
fi

if [[ -f "$expected_ux_contract" ]]; then
  if contains_tbd "$ux_issue_value"; then
    echo "ERROR: Issue UX contract link is still TBD while $expected_ux_contract exists."
    exit 1
  fi
  if [[ "$ux_issue_value" != *"$expected_ux_contract"* ]]; then
    echo "ERROR: Issue UX contract link does not reference $expected_ux_contract"
    exit 1
  fi
else
  if ! contains_tbd "$ux_issue_value"; then
    echo "ERROR: Issue UX contract/spec field must be TBD while $expected_ux_contract does not exist."
    exit 1
  fi
fi

if [[ "$next_gate" != "UX Gate" ]] && contains_tbd "$figma_issue_value"; then
  echo "ERROR: Figma link must not be TBD after UX Gate."
  exit 1
fi

echo "OK: Process guards passed for active slice '$slice_key' and issue consistency checks."
