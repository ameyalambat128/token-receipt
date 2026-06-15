---
name: token-receipt
description: Generate a coding-agent bill from recent Codex and Claude Code logs. Use when the user asks for a token receipt, AI bill, satire receipt, or shareable roast of their agent usage.
metadata:
  openclaw:
    os: ["darwin"]
---

# token-receipt

## What this is

A packaged local skill that ensures the Token Receipt macOS runtime is installed, produces a thermal-paper PNG plus share files, and then uses those structured facts to help write the final roast.

## Setup check

If the bundled `scripts/generate.sh` helper is missing, tell the user to install the skill with:

```bash
npx skills add ameyalambat128/token-receipt --skill token-receipt
```

On first run, the helper script downloads the standalone Token Receipt runtime into `~/Library/Application Support/token-receipt/bin/token-receipt`. Cached downloads go in `~/Library/Caches/token-receipt/`.

## How to use

1. Run the bundled helper script with the user's requested filters if they gave any. Default to `--since 30d`.
2. Read `token-receipt-output/analysis.json`, `receipt.json`, `share/x.txt`, and `share/linkedin.txt`.
3. Show the receipt image path and summarize the funniest defensible takeaways.
4. If the user wants share copy, refine the generated caption text without inventing unsupported metrics.

## Commands

Default run:

```bash
scripts/generate.sh --since 30d
```

Examples:

```bash
scripts/generate.sh --provider codex --since 7d
scripts/generate.sh --provider claude --since 7d
scripts/generate.sh --project whoop-am --since 30d
scripts/generate.sh --update-runtime --since 30d
```

## Non-negotiables

- Keep the response grounded in the generated `analysis.json`.
- Treat the dollar amounts as satire, not literal billing.
- Do not paste raw prompts or code from the source logs unless the user explicitly asks.
