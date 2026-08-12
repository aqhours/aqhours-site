#!/usr/bin/env bash
set -Eeuo pipefail

APP_DIR="${AQHOURS_APP_DIR:-/opt/apps/homepage}"
BRANCH="${AQHOURS_BRANCH:-main}"
REMOTE="${AQHOURS_REMOTE:-origin}"
LOCK_FILE="${AQHOURS_LOCK_FILE:-/run/aqhours-webhook/deploy.lock}"
LOCK_WAIT_SECONDS="${AQHOURS_LOCK_WAIT_SECONDS:-900}"
SITE_URL="${AQHOURS_SITE_URL:-https://aqhours.cn/}"

log() {
  printf '[%s] %s\n' "$(date '+%Y-%m-%dT%H:%M:%S%z')" "$*"
}

fail() {
  log "ERROR: $*" >&2
  exit 1
}

on_error() {
  local exit_code=$?
  log "Deployment failed at line ${BASH_LINENO[0]} with exit code ${exit_code}."
  exit "$exit_code"
}
trap on_error ERR

for command_name in git docker flock; do
  command -v "$command_name" >/dev/null 2>&1 || fail "Required command not found: ${command_name}"
done

[[ -d "$APP_DIR/.git" ]] || fail "Not a Git checkout: ${APP_DIR}"
[[ -f "$APP_DIR/compose.yaml" ]] || fail "compose.yaml not found in ${APP_DIR}"

exec 9>"$LOCK_FILE"
log "Waiting for deployment lock."
flock -w "$LOCK_WAIT_SECONDS" 9 || fail "Timed out waiting for ${LOCK_FILE}"

cd "$APP_DIR"
log "Fetching ${REMOTE}/${BRANCH}."
git fetch --prune "$REMOTE" "$BRANCH"

target_commit="$(git rev-parse --verify "${REMOTE}/${BRANCH}^{commit}")"
current_commit="$(git rev-parse --verify HEAD)"
log "Updating checkout from ${current_commit} to ${target_commit}."
git reset --hard "$target_commit"

log "Building production image."
docker compose build

log "Starting production service."
docker compose up -d --remove-orphans --no-build
docker compose ps

if [[ -n "$SITE_URL" ]]; then
  command -v curl >/dev/null 2>&1 || fail "curl is required when AQHOURS_SITE_URL is set"

  for attempt in {1..12}; do
    if curl --fail --silent --show-error --head --max-time 10 "$SITE_URL" >/dev/null; then
      log "Health check passed: ${SITE_URL}"
      log "Deployment completed at ${target_commit}."
      exit 0
    fi

    log "Health check ${attempt}/12 failed; retrying in 5 seconds."
    sleep 5
  done

  fail "Health check did not pass: ${SITE_URL}"
fi

log "Deployment completed at ${target_commit}."
