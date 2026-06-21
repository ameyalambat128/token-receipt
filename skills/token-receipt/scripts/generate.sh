#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"
OUT_DIR="${PWD}/token-receipt-output"
INSTALLER="$SCRIPT_DIR/install-runtime.sh"
FORCE_UPDATE=0
PASSTHROUGH_ARGS=()
HAS_PROVIDER=0

while (($#)); do
  case "$1" in
    --update-runtime)
      FORCE_UPDATE=1
      ;;
    --provider)
      HAS_PROVIDER=1
      PASSTHROUGH_ARGS+=("$1")
      if (($# > 1)); then
        PASSTHROUGH_ARGS+=("$2")
        shift
      fi
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
RECEIPT_PATH="$OUT_DIR/receipt.png"

detect_host_provider() {
  if [[ -n "${TOKEN_RECEIPT_HOST_PROVIDER:-}" ]]; then
    printf '%s\n' "$TOKEN_RECEIPT_HOST_PROVIDER"
    return 0
  fi

  if [[ "$SCRIPT_DIR" == *"/.codex/"* ]] || [[ -n "${CODEX_THREAD_ID:-}" || -n "${CODEX_SHELL:-}" || "${__CFBundleIdentifier:-}" == "com.openai.codex" ]]; then
    printf 'codex\n'
    return 0
  fi

  if [[ "$SCRIPT_DIR" == *"/.claude/"* ]] || [[ -n "${CLAUDECODE:-}" || -n "${CLAUDE_CODE:-}" || -n "${CLAUDE_PROJECT_DIR:-}" ]]; then
    printf 'claude\n'
    return 0
  fi

  if [[ "$SCRIPT_DIR" == *"/.kiro/"* ]] || [[ -n "${KIRO_HOME:-}" ]]; then
    printf 'kiro\n'
    return 0
  fi

  if [[ "${TERM_PROGRAM:-}" == "Cursor" || -n "${CURSOR_TRACE_ID:-}" || -n "${CURSOR_SESSION_ID:-}" ]]; then
    printf 'cursor\n'
    return 0
  fi

  printf 'all\n'
}

if [[ "$HAS_PROVIDER" -eq 0 ]]; then
  PASSTHROUGH_ARGS=(--provider "$(detect_host_provider)" "${PASSTHROUGH_ARGS[@]}")
fi

run_local_runtime() {
  bun --cwd "$LOCAL_RUNTIME_DIR" ./src/cli.ts generate --out "$OUT_DIR" "${PASSTHROUGH_ARGS[@]}"
}

open_receipt() {
  if [[ "${TOKEN_RECEIPT_DISABLE_OPEN:-0}" == "1" || ! -f "$RECEIPT_PATH" ]]; then
    return 0
  fi

  case "$(uname -s)" in
    Darwin)
      command -v open >/dev/null && open "$RECEIPT_PATH" >/dev/null 2>&1 || true
      ;;
    Linux)
      command -v xdg-open >/dev/null && xdg-open "$RECEIPT_PATH" >/dev/null 2>&1 || true
      ;;
    CYGWIN*|MINGW*|MSYS*)
      if command -v explorer.exe >/dev/null; then
        explorer.exe "$(cygpath -w "$RECEIPT_PATH" 2>/dev/null || printf '%s' "$RECEIPT_PATH")" >/dev/null 2>&1 || true
      elif command -v cmd.exe >/dev/null; then
        cmd.exe /c start "" "$RECEIPT_PATH" >/dev/null 2>&1 || true
      fi
      ;;
  esac
}

run_and_finalize() {
  local stdout_file
  stdout_file="$(mktemp "${TMPDIR:-/tmp}/token-receipt.XXXXXX")"

  if "$@" >"$stdout_file"; then
    cat "$stdout_file"
    rm -f "$stdout_file"
    open_receipt
    return 0
  fi

  local status=$?
  cat "$stdout_file"
  rm -f "$stdout_file"
  return "$status"
}

if [[ -n "${TOKEN_RECEIPT_RUNTIME_PATH:-}" ]]; then
  run_and_finalize "$TOKEN_RECEIPT_RUNTIME_PATH" generate --out "$OUT_DIR" "${PASSTHROUGH_ARGS[@]}"
  exit 0
fi

if [[ -f "$LOCAL_RUNTIME_ENTRY" ]]; then
  run_and_finalize bun --cwd "$LOCAL_RUNTIME_DIR" ./src/cli.ts generate --out "$OUT_DIR" "${PASSTHROUGH_ARGS[@]}"
  exit 0
fi

if [[ "$FORCE_UPDATE" -eq 1 ]]; then
  INSTALL_COMMAND=(bash "$INSTALLER" --force)
else
  INSTALL_COMMAND=(bash "$INSTALLER")
fi

if BINARY_PATH="$("${INSTALL_COMMAND[@]}")"; then
  run_and_finalize "$BINARY_PATH" generate --out "$OUT_DIR" "${PASSTHROUGH_ARGS[@]}"
  exit 0
fi

printf 'Token Receipt runtime install failed and no local repo fallback was available.\n' >&2
exit 1
