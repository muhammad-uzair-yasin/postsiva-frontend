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

SHA="${1:?Usage: deploy-frontend.sh COMMIT_SHA [DEPLOYMENT_ID]}"
DEPLOYMENT_ID="${2:-$SHA}"
SOURCE_REPO="${POSTSIVA_FRONTEND_SOURCE:-/root/unified-postsiva-ui}"
COMPONENT_ROOT="$DEPLOY_ROOT/frontend"
RELEASES_DIR="$COMPONENT_ROOT/releases"
SHARED_DIR="$DEPLOY_ROOT/shared"
ACTIVE_SLOT="$(state_get frontend active_slot blue)"
ACTIVE_RELEASE="$(state_get frontend active_release legacy)"
TARGET_SLOT="$(inactive_slot "$ACTIVE_SLOT")"
RELEASE_DIR="$RELEASES_DIR/$SHA"
FRONTEND_PORT=6002
[[ "$TARGET_SLOT" == "green" ]] && FRONTEND_PORT=6003
SNAPSHOT="$(mktemp -d "$DEPLOY_ROOT/deploy/state/nginx-frontend.XXXXXX")"
SWITCHED=false
CONFIG_MUTATED=false

cleanup_failure() {
  local exit_code=$?
  trap - ERR
  local safe_to_stop=true
  if [[ "$CONFIG_MUTATED" == true ]]; then
    log "deployment=$DEPLOYMENT_ID component=frontend phase=rollback"
    if restore_nginx_snapshot "$SNAPSHOT"; then
      state_write frontend "$ACTIVE_SLOT" "$ACTIVE_RELEASE" "" "" rolled_back
    else
      safe_to_stop=false
      log "CRITICAL rollback failed; keeping target frontend alive to preserve traffic"
    fi
  fi
  if [[ "$safe_to_stop" == true ]]; then
    pm2_delete_names "unified-postsiva-ui-$TARGET_SLOT" ecosystem.frontend || true
  fi
  log "deployment=$DEPLOYMENT_ID component=frontend result=failed exit=$exit_code"
  exit "$exit_code"
}
trap cleanup_failure ERR

require_command curl
require_command flock
require_command git
require_command nginx
require_command npm
require_command pm2
require_command python3
acquire_lock frontend
acquire_nginx_lock
mkdir -p "$RELEASES_DIR" "$COMPONENT_ROOT/slots" "$SHARED_DIR"
log "deployment=$DEPLOYMENT_ID component=frontend target=$TARGET_SLOT phase=prepare"

prepare_git_release "$SOURCE_REPO" "$SHA" "$RELEASE_DIR"
mkdir -p "$RELEASE_DIR/logs"
ln -sfn "$SHARED_DIR/frontend.env" "$RELEASE_DIR/.env"
set -a
# shellcheck source=/dev/null
source "$SHARED_DIR/frontend.runtime.env"
set +a
export POSTSIVA_RELEASE="$SHA"

(
  cd "$RELEASE_DIR"
  npm ci
  npm run build
)

# Retain immutable chunks needed by browsers that loaded the previous release.
PREVIOUS_STATIC="$COMPONENT_ROOT/releases/$ACTIVE_RELEASE/.next/static"
if [[ -d "$PREVIOUS_STATIC" ]]; then
  cp -an "$PREVIOUS_STATIC/." "$RELEASE_DIR/.next/static/"
fi
ln -sfn "$RELEASE_DIR" "$COMPONENT_ROOT/slots/$TARGET_SLOT"

export POSTSIVA_SLOT="$TARGET_SLOT"
export POSTSIVA_RELEASE_DIR="$RELEASE_DIR"
export POSTSIVA_FRONTEND_PORT="$FRONTEND_PORT"
pm2_delete_names "unified-postsiva-ui-$TARGET_SLOT" || true
pm2 start "$SCRIPT_DIR/ecosystem.frontend.config.js" --update-env
wait_for_release "http://127.0.0.1:$FRONTEND_PORT/api/health" "$SHA"

nginx_snapshot "$SNAPSHOT"
CONFIG_MUTATED=true
write_upstream frontend "$FRONTEND_PORT"
reload_nginx
SWITCHED=true
wait_for_release "https://www.postsiva.com/api/health" "$SHA" 15 2

state_write frontend "$TARGET_SLOT" "$SHA" "$ACTIVE_SLOT" "$ACTIVE_RELEASE" healthy
ln -sfn "$RELEASE_DIR" "$COMPONENT_ROOT/current"
sleep "${POSTSIVA_DRAIN_SECONDS:-20}"
# The target is committed. Cleanup is best-effort and must never remove it.
trap - ERR
SWITCHED=false
CONFIG_MUTATED=false
pm2_delete_names "unified-postsiva-ui-$ACTIVE_SLOT" unified-postsiva-ui || true
pm2 save --force >/dev/null || log "WARNING PM2 state save failed; live process unchanged"
rm -rf "$SNAPSHOT" || true
cleanup_releases "$RELEASES_DIR" "$SHA" "$ACTIVE_RELEASE" ||
  log "WARNING old release cleanup failed; live release unchanged"
log "deployment=$DEPLOYMENT_ID component=frontend result=succeeded release=$SHA slot=$TARGET_SLOT"
