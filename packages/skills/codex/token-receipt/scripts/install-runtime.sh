#!/bin/bash
set -euo pipefail

FORCE_UPDATE=0

while (($#)); do
  case "$1" in
    --force)
      FORCE_UPDATE=1
      ;;
    *)
      printf 'Unknown install-runtime flag: %s\n' "$1" >&2
      exit 1
      ;;
  esac
  shift
done

if [[ "$(uname -s)" != "Darwin" ]]; then
  printf 'Token Receipt runtime install currently supports macOS only.\n' >&2
  exit 1
fi

if [[ "$(uname -m)" != "arm64" ]]; then
  printf 'Token Receipt runtime install currently supports macOS arm64 only.\n' >&2
  exit 1
fi

APP_SUPPORT_DIR="${TOKEN_RECEIPT_APP_SUPPORT_DIR:-$HOME/Library/Application Support/token-receipt}"
CACHE_DIR="${TOKEN_RECEIPT_CACHE_DIR:-$HOME/Library/Caches/token-receipt}"
BIN_DIR="$APP_SUPPORT_DIR/bin"
BIN_PATH="${TOKEN_RECEIPT_RUNTIME_PATH:-$BIN_DIR/token-receipt}"
INSTALL_JSON="$APP_SUPPORT_DIR/install.json"
REPO="${TOKEN_RECEIPT_GITHUB_REPO:-ameya/token-receipt}"
VERSION="${TOKEN_RECEIPT_VERSION:-latest}"
ASSET_NAME="token-receipt-darwin-arm64.tar.gz"
DOWNLOAD_URL="${TOKEN_RECEIPT_DOWNLOAD_URL:-}"

if [[ "$FORCE_UPDATE" -eq 0 && -x "$BIN_PATH" ]]; then
  printf '%s\n' "$BIN_PATH"
  exit 0
fi

mkdir -p "$BIN_DIR" "$CACHE_DIR"

if [[ -z "$DOWNLOAD_URL" ]]; then
  if [[ "$VERSION" == "latest" ]]; then
    DOWNLOAD_URL="https://github.com/$REPO/releases/latest/download/$ASSET_NAME"
  else
    DOWNLOAD_URL="https://github.com/$REPO/releases/download/$VERSION/$ASSET_NAME"
  fi
fi

TEMP_DIR="$(mktemp -d "$CACHE_DIR/install.XXXXXX")"
ARCHIVE_PATH="$TEMP_DIR/$ASSET_NAME"
trap 'rm -rf "$TEMP_DIR"' EXIT

curl -fL "$DOWNLOAD_URL" -o "$ARCHIVE_PATH"
tar -xzf "$ARCHIVE_PATH" -C "$TEMP_DIR"

EXTRACTED_DIR="$TEMP_DIR/token-receipt-darwin-arm64"
EXTRACTED_BIN="$EXTRACTED_DIR/token-receipt"

if [[ ! -x "$EXTRACTED_BIN" ]]; then
  printf 'Downloaded archive did not contain token-receipt binary.\n' >&2
  exit 1
fi

install -m 755 "$EXTRACTED_BIN" "$BIN_PATH"

INSTALLED_VERSION="$("$BIN_PATH" --version 2>/dev/null || printf 'unknown')"
INSTALLED_AT="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"

cat > "$INSTALL_JSON" <<EOF
{
  "installedAt": "$INSTALLED_AT",
  "version": "$INSTALLED_VERSION",
  "repo": "$REPO",
  "downloadUrl": "$DOWNLOAD_URL",
  "binaryPath": "$BIN_PATH"
}
EOF

printf '%s\n' "$BIN_PATH"
