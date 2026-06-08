# Skills

## Install

From the repo root:

```bash
bun install
bun run skill:install
```

The installed skill bootstraps a standalone macOS arm64 runtime into `~/Library/Application Support/token-receipt/bin/token-receipt`. Download caches live in `~/Library/Caches/token-receipt/`.

## Codex

Invoke the skill from a thread and ask for a token receipt, or run:

```bash
~/.codex/skills/token-receipt/scripts/generate.sh --since 30d
```

## Claude Code

Ask Claude Code to use `token-receipt`, or run:

```bash
~/.claude/skills/token-receipt/scripts/generate.sh --since 30d
```

To force a fresh runtime install:

```bash
~/.codex/skills/token-receipt/scripts/generate.sh --update-runtime --since 30d
```

## Release artifact

Build the macOS arm64 archive that the skill installer expects:

```bash
bun run runtime:build:darwin-arm64
```

This writes `packages/runtime/dist/token-receipt-darwin-arm64.tar.gz`.

## Output

Every run writes to `token-receipt-output/` in the current working directory:

- `analysis.json`
- `receipt.json`
- `receipt.png`
- `share/x.txt`
- `share/linkedin.txt`
