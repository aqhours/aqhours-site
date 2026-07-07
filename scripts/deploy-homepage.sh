#!/usr/bin/env bash
set -euo pipefail

REMOTE_URL="${REMOTE_URL:-git@github.com:aqhours/aqhours-site.git}"
SERVER="${AQHOURS_SERVER:-aqhours-server}"
SERVER_DIR="${AQHOURS_SERVER_DIR:-/opt/apps/homepage}"
SITE_URL="${AQHOURS_SITE_URL:-https://aqhours.cn/}"

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

git fetch origin main
if ! git merge-base --is-ancestor origin/main HEAD; then
  echo "origin/main has commits that are not in local main. Pull/rebase before deploy." >&2
  exit 1
fi

git push "$REMOTE_URL" main

ssh "$SERVER" "cd '$SERVER_DIR' && git pull --ff-only origin main && docker compose up -d --build && docker compose ps"

curl -fsSI "$SITE_URL" | sed -n '1,12p'
