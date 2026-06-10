---
name: token-receipt
description: Generate a satirical AI bill from recent Codex and Claude Code logs. Use when the user asks for a token receipt, AI bill, satire receipt, or shareable roast of their agent usage.
metadata:
  openclaw:
    os: ["darwin"]
---

# token-receipt

## What this is

A packaged local skill that ensures the Token Receipt macOS runtime is installed, produces a thermal-paper PNG plus structured analysis files, and then uses those facts to write the final roast plus a reusable agentic-development profile.

## Setup check

If the bundled `scripts/generate.sh` helper is missing, tell the user to install the skill with:

```bash
npx skills add ameyalambat128/token-receipt --skill token-receipt
```

On first run, the helper script downloads the standalone Token Receipt runtime into `~/Library/Application Support/token-receipt/bin/token-receipt`. Cached downloads go in `~/Library/Caches/token-receipt/`.

## How to use

1. Run the bundled helper script with the user's requested filters if they gave any. Default to `--since 30d`.
2. Read `token-receipt-output/analysis.json`, `receipt.json`, `share/x.txt`, and `share/linkedin.txt`.
3. Write both of these files into `token-receipt-output/`:
   - `agentic-profile.json`
   - `agentic-profile.md`
4. Show the receipt image path and summarize the funniest defensible takeaways.
5. If the user wants share copy, refine the generated caption text without inventing unsupported metrics.

## Persisted profile artifacts

The host agent should persist both files after reading `analysis.json`.

### `agentic-profile.json`

Write a structured JSON object with this shape:

```json
{
  "generatedAt": "ISO-8601 timestamp",
  "analysisSource": "absolute path to token-receipt-output/analysis.json",
  "providerScope": ["codex", "claude"],
  "summary": "One-paragraph behavioral synopsis grounded in analysis.json",
  "workstyle": {
    "label": "selected work style label",
    "reason": "short rationale grounded in behavior.summary/workStyleCandidate"
  },
  "builderArchetype": {
    "label": "selected archetype label",
    "reason": "short rationale grounded in behavior.summary/builderArchetypeCandidate"
  },
  "supportingStats": {
    "totalTimeMinutes": 0,
    "longestSessionMinutes": 0,
    "promptsPerSessionAverage": 0,
    "promptWordsAverage": 0,
    "planModeSessionRate": 0,
    "courseCorrectionRate": 0,
    "repeatedPromptRate": 0,
    "talkativenessBand": {
      "label": "label",
      "reason": "reason"
    }
  },
  "promptFindings": {
    "goToPrompt": null,
    "crypticPrompt": null,
    "repeatedPromptPatterns": []
  },
  "evidence": [],
  "roastHooks": []
}
```

Rules:

- Use only facts and bounded evidence from `analysis.json`.
- Do not invent metrics or unstated causal claims.
- Keep `evidence` brief and cited by session key or prompt excerpt.
- Keep `roastHooks` to 3-5 short factual hooks.

### `agentic-profile.md`

Write a compact Markdown summary with these sections:

- `# Agentic Development Profile`
- `## Overview`
- `## How You Work`
- `## Prompt Habits`
- `## Strongest Patterns`
- `## Evidence`

Rules:

- Ground every claim in `analysis.json`.
- Do not paste raw long prompts or transcript dumps.
- Use bounded prompt excerpts only when they add value.
- Prefer short evidence bullets with session keys.

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
- Treat `analysis.json` as the source of truth for `agentic-profile.json` and `agentic-profile.md`.
- Persist the profile artifacts in `token-receipt-output/` when running through the skill.
- Treat the dollar amounts as satire, not literal billing.
- Do not paste raw prompts or code from the source logs unless the user explicitly asks.
