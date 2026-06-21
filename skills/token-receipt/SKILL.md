---
name: token-receipt
description: Generate a coding-agent bill from recent Codex, Claude Code, Kiro CLI, and experimental Cursor local session logs. Use when the user asks for a token receipt, AI bill, satire receipt, or shareable roast of their agent usage.
metadata:
  openclaw:
    os: ["darwin"]
---

# token-receipt

## What this is

A packaged local skill that ensures the Token Receipt macOS runtime is installed, produces a thermal-paper PNG plus share text, opens the receipt locally, and then uses those structured facts to help write the final roast.

## Setup check

If the bundled `scripts/generate.sh` helper is missing, tell the user to install the skill with:

```bash
npx skills add ameyalambat128/token-receipt --skill token-receipt
```

On first run, the helper script downloads the standalone Token Receipt runtime into `~/Library/Application Support/token-receipt/bin/token-receipt`. Cached downloads go in `~/Library/Caches/token-receipt/`.

## How to use

1. Decide the provider before running the helper script.
2. If the user explicitly asks for one provider, pass that exact `--provider` value.
3. If the user explicitly asks for cross-agent output or comparison, pass `--provider all`.
4. Otherwise determine which host agent you are running in. Use `codex`, `claude`, `kiro`, or `cursor` and pass the matching `--provider`.
5. If you cannot determine the host agent confidently, say so briefly and fall back to `--provider all`.
6. Pass the user's requested filters if they gave any. Default to `--since 30d`.
7. Read the JSON stdout from `scripts/generate.sh` first and use its `outDir`, `receipt`, and `share` paths.
8. Then read `analysis.json`, `receipt.json`, and `share.txt` from that reported `outDir`.
9. Tell the user the receipt opens locally by default and include the absolute `receipt.png` path in the response.
10. Present the generated caption in a short `Share` section using a fenced `text` block.
11. Summarize the funniest defensible takeaways grounded in `analysis.json`.
12. If the user wants share copy, refine the generated generic caption text without inventing unsupported metrics.

## Provider selection

Use this precedence order every time:

1. Explicit user provider request
2. Explicit user request for cross-agent output with `--provider all`
3. Host-agent default based on who you are
4. Fallback to `--provider all` if host detection is uncertain

Host-agent defaults:

- Codex -> `--provider codex`
- Claude Code -> `--provider claude`
- Kiro -> `--provider kiro`
- Cursor -> `--provider cursor`

Do not ask the user which agent they are using just to choose the default provider. Infer it from the current host agent when possible.

## Commands

Default host-aware run:

```bash
scripts/generate.sh --provider <host-agent> --since 30d
```

Examples:

```bash
scripts/generate.sh --provider codex --since 7d
scripts/generate.sh --provider claude --since 7d
scripts/generate.sh --provider cursor --since 7d
scripts/generate.sh --provider kiro --since 7d
scripts/generate.sh --provider all --since 30d
scripts/generate.sh --project whoop-am --since 30d
scripts/generate.sh --update-runtime --since 30d
```

## Non-negotiables

- Keep the response grounded in the generated `analysis.json`.
- Treat the dollar amounts as satire, not literal billing.
- Kiro cost is based on local credit usage, not token-derived API pricing.
- Do not paste raw prompts or code from the source logs unless the user explicitly asks.
