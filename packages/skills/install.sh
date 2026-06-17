#!/bin/bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_DIR="$(cd "$ROOT_DIR/../.." && pwd)/skills/token-receipt"
CANONICAL_SKILL_DIR="$HOME/.agents/skills"
CANONICAL_SKILL_PATH="$CANONICAL_SKILL_DIR/token-receipt"
DEFAULT_KIRO_HOME="$HOME/.kiro"
DEFAULT_KIRO_SKILL_DIR="$DEFAULT_KIRO_HOME/skills"
KIRO_HOME_DIR="${KIRO_HOME:-}"

link_path() {
  local target="$1"
  local path="$2"

  rm -rf "$path"
  ln -s "$target" "$path"
}

mkdir -p \
  "$HOME/.codex/skills" \
  "$HOME/.claude/skills" \
  "$CANONICAL_SKILL_DIR" \
  "$DEFAULT_KIRO_SKILL_DIR"

if [[ -n "$KIRO_HOME_DIR" ]]; then
  mkdir -p "$KIRO_HOME_DIR/skills"
fi

link_path "$SKILL_DIR" "$CANONICAL_SKILL_PATH"
link_path "$CANONICAL_SKILL_PATH" "$HOME/.codex/skills/token-receipt"
link_path "$CANONICAL_SKILL_PATH" "$HOME/.claude/skills/token-receipt"
link_path "$CANONICAL_SKILL_PATH" "$DEFAULT_KIRO_SKILL_DIR/token-receipt"

if [[ -n "$KIRO_HOME_DIR" ]]; then
  link_path "$CANONICAL_SKILL_PATH" "$KIRO_HOME_DIR/skills/token-receipt"
fi

printf 'Installed Token Receipt skills:\n'
printf '  Canonical: %s\n' "$CANONICAL_SKILL_PATH"
printf '  Codex: %s\n' "$HOME/.codex/skills/token-receipt"
printf '  Claude Code: %s\n' "$HOME/.claude/skills/token-receipt"
printf '  Kiro: %s\n' "$DEFAULT_KIRO_SKILL_DIR/token-receipt"

if [[ -n "$KIRO_HOME_DIR" ]]; then
  printf '  Kiro (KIRO_HOME): %s\n' "$KIRO_HOME_DIR/skills/token-receipt"
fi
