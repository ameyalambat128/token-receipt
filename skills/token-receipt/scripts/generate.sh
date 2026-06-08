#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"
OUT_DIR="${PWD}/token-receipt-output"
INSTALLER="$SCRIPT_DIR/install-runtime.sh"
FORCE_UPDATE=0
PASSTHROUGH_ARGS=()

while (($#)); do
  case "$1" in
    --update-runtime)
      FORCE_UPDATE=1
      ;;
    *)
      PASSTHROUGH_ARGS+=("$1")
      ;;
  esac
  shift
done

REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd -P)"
LOCAL_RUNTIME_ENTRY="$REPO_ROOT/packages/runtime/src/cli.ts"
LOCAL_RUNTIME_DIR="$REPO_ROOT/packages/runtime"

run_local_runtime() {
  bun --cwd "$LOCAL_RUNTIME_DIR" ./src/cli.ts generate --out "$OUT_DIR" "${PASSTHROUGH_ARGS[@]}"
}

if [[ -n "${TOKEN_RECEIPT_RUNTIME_PATH:-}" ]]; then
  "$TOKEN_RECEIPT_RUNTIME_PATH" generate --out "$OUT_DIR" "${PASSTHROUGH_ARGS[@]}"
  exit 0
fi

if [[ "$FORCE_UPDATE" -eq 1 ]]; then
  INSTALL_COMMAND=(bash "$INSTALLER" --force)
else
  INSTALL_COMMAND=(bash "$INSTALLER")
fi

if BINARY_PATH="$("${INSTALL_COMMAND[@]}")"; then
  "$BINARY_PATH" generate --out "$OUT_DIR" "${PASSTHROUGH_ARGS[@]}"
  exit 0
fi

if [[ -f "$LOCAL_RUNTIME_ENTRY" ]]; then
  run_local_runtime
  exit 0
fi

printf 'Token Receipt runtime install failed and no local repo fallback was available.\n' >&2
exit 1
