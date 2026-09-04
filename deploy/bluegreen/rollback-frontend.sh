#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMMON_SH="${POSTSIVA_COMMON_SH:-/srv/postsiva/deploy/bin/common.sh}"
[[ -r "$COMMON_SH" ]] || {
  printf 'Shared deployment library not found: %s\n' "$COMMON_SH" >&2
  exit 1
}
# shellcheck source=/dev/null
source "$COMMON_SH"

acquire_lock frontend
acquire_nginx_lock
ACTIVE_SLOT="$(state_get frontend active_slot)"
ACTIVE_RELEASE="$(state_get frontend active_release)"
TARGET_SLOT="$(state_get frontend previous_slot)"
TARGET_RELEASE="$(state_get frontend previous_release)"
[[ -n "$TARGET_SLOT" && -n "$TARGET_RELEASE" ]] || die "No previous frontend release recorded"
RELEASE_DIR="$DEPLOY_ROOT/frontend/releases/$TARGET_RELEASE"
[[ -d "$RELEASE_DIR" ]] || die "Previous release directory is missing"
SNAPSHOT="$(mktemp -d "$DEPLOY_ROOT/deploy/state/nginx-rollback-frontend.XXXXXX")"
CONFIG_MUTATED=false

rollback_failure() {
  local exit_code=$?
  trap - ERR
  local restored=true
  if [[ "$CONFIG_MUTATED" == true ]]; then
    restore_nginx_snapshot "$SNAPSHOT" || restored=false
  fi
  if [[ "$restored" == true ]]; then
    pm2_delete_names "unified-postsiva-ui-$TARGET_SLOT" || true
  else
    log "CRITICAL rollback recovery failed; target frontend kept alive"
  fi
  exit "$exit_code"
}
trap rollback_failure ERR

FRONTEND_PORT=6002
[[ "$TARGET_SLOT" == "green" ]] && FRONTEND_PORT=6003
set -a
# shellcheck source=/dev/null
source "$DEPLOY_ROOT/shared/frontend.runtime.env"
set +a
export POSTSIVA_SLOT="$TARGET_SLOT"
export POSTSIVA_RELEASE_DIR="$RELEASE_DIR"
export POSTSIVA_RELEASE="$TARGET_RELEASE"
export POSTSIVA_FRONTEND_PORT="$FRONTEND_PORT"

pm2 start "$SCRIPT_DIR/ecosystem.frontend.config.js" --update-env
wait_for_release "http://127.0.0.1:$FRONTEND_PORT/api/health" "$TARGET_RELEASE"
nginx_snapshot "$SNAPSHOT"
CONFIG_MUTATED=true
write_upstream frontend "$FRONTEND_PORT"
reload_nginx
wait_for_release "https://www.postsiva.com/api/health" "$TARGET_RELEASE" 15 2
state_write frontend "$TARGET_SLOT" "$TARGET_RELEASE" "$ACTIVE_SLOT" "$ACTIVE_RELEASE" rolled_back
ln -sfn "$RELEASE_DIR" "$DEPLOY_ROOT/frontend/current"
sleep "${POSTSIVA_DRAIN_SECONDS:-20}"
trap - ERR
CONFIG_MUTATED=false
pm2_delete_names "unified-postsiva-ui-$ACTIVE_SLOT" unified-postsiva-ui || true
pm2 save --force >/dev/null || log "WARNING PM2 state save failed"
rm -rf "$SNAPSHOT" || true
log "component=frontend rollback=succeeded release=$TARGET_RELEASE slot=$TARGET_SLOT"
