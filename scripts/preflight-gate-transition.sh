#!/usr/bin/env bash
set -euo pipefail

state_file="docs/current-state.md"

usage() {
  cat <<'EOF'
Usage: ./scripts/preflight-gate-transition.sh <target-gate>

Accepted target gates:
  plan | ux | build | review | risk | ship

Example:
  ./scripts/preflight-gate-transition.sh build
EOF
}

read_state_value() {
  local key="$1"
  awk -F': ' -v target="$key" '$0 ~ "^- " target ":" {print $2; exit}' "$state_file"
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

if [[ $# -ne 1 ]]; then
  usage
  exit 1
fi

target_gate=$(printf '%s' "$1" | tr '[:upper:]' '[:lower:]')
case "$target_gate" in
  plan|ux|build|review|risk|ship) ;;
  *)
    echo "ERROR: Invalid target gate '$1'"
    usage
    exit 1
    ;;
esac

slice_key=$(read_state_value "Slice key")
execution_issue=$(read_state_value "Execution issue")

if [[ -z "${slice_key:-}" ]]; then
  echo "ERROR: Could not read active slice key from $state_file"
  exit 1
fi

if [[ -z "${execution_issue:-}" ]]; then
  echo "ERROR: Could not read execution issue from $state_file"
  exit 1
fi

# Always run baseline process guards first.
./scripts/validate-process-guards.sh >/dev/null

if ! command -v gh >/dev/null 2>&1; then
  echo "ERROR: gh CLI is required for preflight issue checks."
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

requirements_owner=$(extract_issue_field "$issue_body" "Requirements Owner")
gate_decision_owner=$(extract_issue_field "$issue_body" "Gate Decision Owner")
plan_readiness=$(extract_issue_field "$issue_body" "Plan Gate Readiness")
ux_contract_link=$(extract_issue_field "$issue_body" "UX Contract Link")
figma_link=$(extract_issue_field "$issue_body" "Figma Link")
implementation_story_pack=$(extract_issue_field "$issue_body" "Implementation Story Pack")

if [[ -z "${requirements_owner:-}" ]]; then
  echo "ERROR: Issue missing 'Requirements Owner' field content."
  exit 1
fi

if [[ -z "${gate_decision_owner:-}" ]] || [[ "$gate_decision_owner" != "Studio Architect" ]]; then
  echo "ERROR: Issue must set 'Gate Decision Owner' to 'Studio Architect'."
  exit 1
fi

if [[ -z "${plan_readiness:-}" ]]; then
  echo "ERROR: Issue missing 'Plan Gate Readiness' field content."
  exit 1
fi

slice_requirements_doc="docs/functional-requirements-${slice_key}.md"
slice_ux_contract="docs/ux-spec-${slice_key}.md"

case "$target_gate" in
  plan)
    if [[ ! -f "$slice_requirements_doc" ]]; then
      echo "ERROR: Missing $slice_requirements_doc required for Plan Gate."
      exit 1
    fi
    ;;
  ux)
    if [[ ! -f "$slice_requirements_doc" ]]; then
      echo "ERROR: Missing $slice_requirements_doc required before UX Gate."
      exit 1
    fi
    if contains_tbd "$plan_readiness"; then
      echo "ERROR: Plan Gate Readiness cannot be TBD when advancing to UX Gate."
      exit 1
    fi
    ;;
  build)
    if [[ ! -f "$slice_ux_contract" ]]; then
      echo "ERROR: Missing $slice_ux_contract required before Build Gate."
      exit 1
    fi
    if [[ -z "${ux_contract_link:-}" ]] || contains_tbd "$ux_contract_link"; then
      echo "ERROR: UX Contract Link must be set before Build Gate."
      exit 1
    fi
    if [[ -z "${figma_link:-}" ]] || contains_tbd "$figma_link"; then
      echo "ERROR: Figma Link must be set before Build Gate."
      exit 1
    fi
    if [[ -x "./scripts/check-figma-visual-evidence.sh" ]]; then
      if ! ./scripts/check-figma-visual-evidence.sh "$figma_link" >/dev/null; then
        echo "ERROR: Figma Link does not have verified visual frame evidence required for Build Gate."
        exit 1
      fi
    else
      echo "ERROR: Missing scripts/check-figma-visual-evidence.sh required for Build Gate visual verification."
      exit 1
    fi
    if [[ -z "${implementation_story_pack:-}" ]] || contains_tbd "$implementation_story_pack"; then
      echo "ERROR: Implementation Story Pack must be set before Build Gate."
      exit 1
    fi
    ;;
  review)
    if [[ -z "${implementation_story_pack:-}" ]] || contains_tbd "$implementation_story_pack"; then
      echo "ERROR: Implementation Story Pack must be set before Review Gate."
      exit 1
    fi
    ;;
  risk|ship)
    # Lightweight automation currently validates only baseline consistency for late gates.
    ;;
esac

echo "OK: Gate transition preflight passed for target gate '$target_gate' on slice '$slice_key'."
