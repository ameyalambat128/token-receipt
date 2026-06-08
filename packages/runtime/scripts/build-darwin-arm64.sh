#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PACKAGE_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
DIST_DIR="$PACKAGE_DIR/dist"
STAGING_DIR="$DIST_DIR/token-receipt-darwin-arm64"
ARCHIVE_PATH="$DIST_DIR/token-receipt-darwin-arm64.tar.gz"

VERSION="$(cd "$PACKAGE_DIR" && bun -e 'const pkg = JSON.parse(await Bun.file("./package.json").text()); console.log(pkg.version)')"

rm -rf "$STAGING_DIR" "$ARCHIVE_PATH"
mkdir -p "$STAGING_DIR"

cd "$PACKAGE_DIR"

bun build \
  --compile \
  --target=bun-darwin-arm64 \
  ./src/cli.ts \
  --outfile "$STAGING_DIR/token-receipt"

printf '%s\n' "$VERSION" > "$STAGING_DIR/VERSION"

cat > "$STAGING_DIR/README.txt" <<EOF
Token Receipt macOS arm64 runtime

Binary:
  token-receipt

Version:
  $VERSION
EOF

tar -C "$DIST_DIR" -czf "$ARCHIVE_PATH" "token-receipt-darwin-arm64"

printf 'Built archive: %s\n' "$ARCHIVE_PATH"
