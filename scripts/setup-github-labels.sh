#!/usr/bin/env bash
set -euo pipefail

# Creates required workflow labels if missing.
# Safe to run multiple times.

REQUIRED_LABELS=(
  "slice|1D76DB|Feature slice work item"
  "needs-triage|FBCA04|Needs triage and prioritization"
)

if ! command -v gh >/dev/null 2>&1; then
  echo "Error: GitHub CLI (gh) is not installed."
  echo "Install with: sudo apt install gh"
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "Error: gh is not authenticated."
  echo "Run: gh auth login"
  exit 1
fi

repo=$(gh repo view --json nameWithOwner -q .nameWithOwner)
echo "Using repository: $repo"

existing_names=$(gh label list --limit 200 --json name -q '.[].name')

for spec in "${REQUIRED_LABELS[@]}"; do
  IFS='|' read -r name color description <<<"$spec"

  if printf '%s\n' "$existing_names" | grep -Fx "$name" >/dev/null 2>&1; then
    echo "Exists: $name"
  else
    gh label create "$name" --color "$color" --description "$description"
    echo "Created: $name"
  fi
done

echo "Done. Current required labels:"
gh label list --limit 200 --json name,color,description -q '.[] | select(.name=="slice" or .name=="needs-triage") | "- \(.name) (\(.color)): \(.description)"'
