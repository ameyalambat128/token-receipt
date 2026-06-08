#!/bin/bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

mkdir -p "$HOME/.codex/skills" "$HOME/.claude/skills" "$HOME/.agents/skills"

ln -sfn "$ROOT_DIR/codex/token-receipt" "$HOME/.codex/skills/token-receipt"
ln -sfn "$ROOT_DIR/claude/token-receipt" "$HOME/.claude/skills/token-receipt"
ln -sfn "$ROOT_DIR/claude/token-receipt" "$HOME/.agents/skills/token-receipt"

printf 'Installed Token Receipt skills:\n'
printf '  Codex: %s\n' "$HOME/.codex/skills/token-receipt"
printf '  Claude Code: %s\n' "$HOME/.claude/skills/token-receipt"
