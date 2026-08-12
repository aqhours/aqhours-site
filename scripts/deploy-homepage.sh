#!/usr/bin/env bash
set -euo pipefail

REMOTE_URL="${REMOTE_URL:-origin}"

cd "$(git rev-parse --show-toplevel)"

branch="$(git branch --show-current)"
if [[ "$branch" != "main" ]]; then
  echo "Deploy must run from main; current branch is $branch." >&2
  exit 1
fi

if [[ -n "$(git status --porcelain)" ]]; then
  echo "Working tree is not clean. Commit or stash changes before deploy." >&2
  git status --short
  exit 1
fi

pnpm run typecheck
pnpm run build

git fetch "$REMOTE_URL" main
if ! git merge-base --is-ancestor "$REMOTE_URL/main" HEAD; then
  echo "$REMOTE_URL/main has commits that are not in local main. Pull/rebase before deploy." >&2
  exit 1
fi

git push "$REMOTE_URL" main
echo "Push completed. GitHub will notify the production webhook receiver."
