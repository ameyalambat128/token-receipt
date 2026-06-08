---
name: token-receipt
description: Generate a satirical AI bill from recent Codex and Claude Code logs. Use when the user asks for a token receipt, AI bill, satire receipt, or shareable roast of their agent usage.
---

# token-receipt

## What this is

A local skill that ensures the Token Receipt macOS runtime is installed, produces a thermal-paper PNG plus share files, and then uses those structured facts to help you write the final roast.

## Setup check

If `~/.claude/skills/token-receipt/scripts/generate.sh` does not exist, tell the user to run this from the repo root:

```bash
bun install && bun run skill:install
```

On first run, the helper script downloads the standalone Token Receipt runtime into `~/Library/Application Support/token-receipt/bin/token-receipt`. Cached downloads go in `~/Library/Caches/token-receipt/`.

## How to use

1. Run the helper script with the user's requested filters if they gave any. Default to `--since 30d`.
2. Read `token-receipt-output/analysis.json`, `receipt.json`, `share/x.txt`, and `share/linkedin.txt`.
3. Show the receipt image path and summarize the funniest defensible takeaways.
4. If the user wants share copy, refine the generated caption text without inventing unsupported metrics.

## Commands

Default run:

```bash
~/.claude/skills/token-receipt/scripts/generate.sh --since 30d
```

Examples:

```bash
~/.claude/skills/token-receipt/scripts/generate.sh --provider claude --since 7d
~/.claude/skills/token-receipt/scripts/generate.sh --project token-receipt --since 30d
~/.claude/skills/token-receipt/scripts/generate.sh --update-runtime --since 30d
```

## Non-negotiables

- Keep the response grounded in the generated `analysis.json`.
- Treat the dollar amounts as satire, not literal billing.
- Do not paste raw prompts or code from the source logs unless the user explicitly asks.
