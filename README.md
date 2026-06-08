# token-receipt

Token Receipt is a skill-first local tool that turns Codex and Claude Code logs into a satirical AI bill.

## What ships here

- `apps/web`: marketing site cloned from the `swiftui-skills` landing-page structure
- `packages/core`: log detection, parsing, heuristics, and share-copy facts
- `packages/render`: thermal-paper receipt renderer
- `packages/runtime`: Bun CLI/runtime
- `packages/skills`: Codex and Claude Code skill assets plus install script
- `docs/`: launch and share docs in Markdown

The skill-first install path is:

- install the skill
- first run downloads a standalone macOS arm64 runtime to `~/Library/Application Support/token-receipt/bin/token-receipt`
- generated artifacts still land in `./token-receipt-output`

## Commands

```bash
bun install
bun run skill:install
bun run -F token-receipt doctor
bun run -F token-receipt generate -- --since 30d --out ./token-receipt-output
bun run runtime:build:darwin-arm64
```

## Validation

```bash
bun run format
bun run check
```
