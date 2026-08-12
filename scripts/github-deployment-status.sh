#!/usr/bin/env bash
set -Eeuo pipefail

API_ROOT="${GITHUB_API_URL:-https://api.github.com}"
TOKEN="${AQHOURS_GITHUB_TOKEN:?AQHOURS_GITHUB_TOKEN is required}"

usage() {
  echo "Usage: $0 create <repository> <sha> <environment> <environment-url> | status <repository> <deployment-id> <state> <environment> <environment-url>" >&2
  exit 64
}

github_api() {
  local method="$1"
  local path="$2"
  local body="$3"

  curl --fail-with-body --silent --show-error \
    --request "$method" \
    --header "Accept: application/vnd.github+json" \
    --header "Authorization: Bearer ${TOKEN}" \
    --header "X-GitHub-Api-Version: 2026-03-10" \
    --header "Content-Type: application/json" \
    --data "$body" \
    "${API_ROOT}${path}"
}

case "${1:-}" in
  create)
    [[ $# -eq 5 ]] || usage
    body="$(python3 -c 'import json, sys; print(json.dumps({"ref": sys.argv[1], "environment": sys.argv[2], "environment_url": sys.argv[3], "description": "Server webhook deployment", "auto_merge": False, "required_contexts": [], "production_environment": True}))' "$3" "$4" "$5")"
    response="$(github_api POST "/repos/$2/deployments" "$body")"
    python3 -c 'import json, sys; print(json.load(sys.stdin)["id"])' <<<"$response"
    ;;
  status)
    [[ $# -eq 6 ]] || usage
    body="$(python3 -c 'import json, sys; print(json.dumps({"state": sys.argv[1], "environment": sys.argv[2], "environment_url": sys.argv[3], "description": f"Production deployment: {sys.argv[1]}", "auto_inactive": True}))' "$4" "$5" "$6")"
    github_api POST "/repos/$2/deployments/$3/statuses" "$body" >/dev/null
    ;;
  *)
    usage
    ;;
esac
