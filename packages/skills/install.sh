#!/bin/bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_DIR="$(cd "$ROOT_DIR/../.." && pwd)/skills/token-receipt"

mkdir -p "$HOME/.codex/skills" "$HOME/.claude/skills" "$HOME/.agents/skills"

ln -sfn "$SKILL_DIR" "$HOME/.codex/skills/token-receipt"
ln -sfn "$SKILL_DIR" "$HOME/.claude/skills/token-receipt"
ln -sfn "$SKILL_DIR" "$HOME/.agents/skills/token-receipt"

printf 'Installed Token Receipt skills:\n'
printf '  Codex: %s\n' "$HOME/.codex/skills/token-receipt"
printf '  Claude Code: %s\n' "$HOME/.claude/skills/token-receipt"
printf '  Shared agents: %s\n' "$HOME/.agents/skills/token-receipt"
