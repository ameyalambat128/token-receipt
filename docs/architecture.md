# Architecture

Token Receipt is a skill-first local tool. The skill layer handles agent-facing discovery and invocation, the runtime does the actual log analysis and artifact generation, and the renderer turns structured receipt data into the PNG output.

## Main pieces

- `skills/token-receipt/`: canonical skill package, helper scripts, and skill instructions
- `packages/core/`: session parsing, heuristics, analysis, share text, and provider-specific logic
- `packages/render/`: pure receipt rendering from structured receipt data
- `packages/runtime/`: CLI entrypoint and standalone packaged runtime
- `apps/web/`: marketing site and install copy

## Execution flow

1. An agent discovers or invokes the `token-receipt` skill.
2. `scripts/generate.sh` ensures the standalone runtime is installed.
3. The runtime analyzes local Codex, Claude Code, and Kiro CLI logs.
4. The runtime writes `analysis.json`, `receipt.json`, `receipt.png`, and share copy into `./token-receipt-output`.
5. The host agent reads those artifacts and writes the in-session summary or roast.

## Local skill install model

For local development, `~/.agents/skills/token-receipt` is the canonical user-level skill location. The repo-local installer replaces that entry for this skill and points agent-specific directories back to the single canonical skill:

- `~/.codex/skills/token-receipt -> ~/.agents/skills/token-receipt`
- `~/.claude/skills/token-receipt -> ~/.agents/skills/token-receipt`
- `~/.kiro/skills/token-receipt -> ~/.agents/skills/token-receipt`

This keeps one local source of truth while still matching the discovery rules of each agent.

## Kiro note

Kiro CLI looks for global skills in `~/.kiro/skills/`, or under `KIRO_HOME` when that variable is set. The repo-local installer should link both the default Kiro directory and the `KIRO_HOME` directory when `KIRO_HOME` is present.
