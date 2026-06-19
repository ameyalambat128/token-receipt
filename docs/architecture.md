# Architecture

Token Receipt is a skill-first local tool. The skill layer handles agent-facing discovery and invocation, the runtime does the actual log analysis and artifact generation, and the renderer turns structured receipt data into the PNG output.

## Main pieces

- `skills/token-receipt/`: canonical skill package, helper scripts, and skill instructions
- `packages/core/`: session parsing, heuristics, analysis, share text, and provider-specific logic
- `packages/render/`: receipt rendering from structured receipt data
- `packages/runtime/`: CLI entrypoint and standalone packaged runtime
- `apps/web/`: marketing site and install copy

## Execution flow

1. An agent discovers or invokes the `token-receipt` skill.
2. `scripts/generate.sh` ensures the standalone runtime is installed.
3. The runtime analyzes local Codex, Claude Code, and Kiro CLI logs, plus experimental local Cursor session artifacts.
4. The runtime writes `analysis.json`, `receipt.json`, `receipt.png`, and share copy into `./token-receipt-output`.
5. The host agent reads those artifacts and writes the in-session summary or roast.

## Receipt rendering model

`receipt.json` is the renderer contract. It carries the analytical values and display metadata needed to render the final visual artifact, including line items, totals, stats rows, card details, activity grid labels, footer copy, and disclaimer text.

The current full renderer is HTML-first:

- `packages/render` converts `Receipt` into a self-contained HTML document.
- The HTML template mirrors the landing-page receipt treatment from `apps/web/components/proof-strip.tsx`.
- The renderer screenshots that HTML with a local Chromium-compatible browser through Puppeteer Core.
- The wrinkled paper texture is embedded in `packages/render/src/paper-texture.generated.ts`, so the compiled runtime does not depend on repo-relative web assets.
- If Chrome, Chromium, or Edge is installed, the renderer uses it. Otherwise, it installs Chrome Headless Shell into `~/Library/Caches/token-receipt/chromium`.

This keeps receipt generation local while making the shareable PNG match the marketing-site visual direction. The tradeoff is that full rendering is heavier than the older SVG path because it needs a browser process and may download a browser on first use.

The intended renderer modes are:

- `full`: HTML screenshot rendering, highest visual fidelity, local browser required.
- `lite`: fast local renderer kept as the fallback direction for users who want no browser dependency.
- `auto`: future default candidate that can use `full` when a browser is already available and fall back to `lite` otherwise.

Until renderer modes are exposed in the CLI, the runtime should continue producing the full receipt PNG by default. When `lite` is added, it should still consume the same `Receipt` contract instead of deriving display values inside the renderer.

## Local skill install model

For local development, `~/.agents/skills/token-receipt` is the canonical user-level skill location. The repo-local installer replaces that entry for this skill and points agent-specific directories back to the single canonical skill:

- `~/.codex/skills/token-receipt -> ~/.agents/skills/token-receipt`
- `~/.claude/skills/token-receipt -> ~/.agents/skills/token-receipt`
- `~/.kiro/skills/token-receipt -> ~/.agents/skills/token-receipt`

This keeps one local source of truth while still matching the discovery rules of each agent.

## Kiro note

Kiro CLI looks for global skills in `~/.kiro/skills/`, or under `KIRO_HOME` when that variable is set. The repo-local installer should link both the default Kiro directory and the `KIRO_HOME` directory when `KIRO_HOME` is present.
