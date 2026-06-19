# /token-receipt

Token Receipt turns Codex, Claude Code, and Kiro CLI logs into your coding-agent bill.

## What is this?

Token Receipt is a skill-first local tool for people using coding agents heavily and wanting one artifact that instantly shows how they work.

It parses local agent logs, scores the most defensible forms of waste, renders a thermal-paper receipt PNG, and generates share-ready post copy grounded in real local habits.

- Skill-first UX for Codex and Claude Code, with Kiro CLI session support
- Screenshot-first artifact for agent-heavy developers
- Local parsing and local image generation
- No separate model API required in v1
- Satirical output grounded in real local usage signals
- Open source and macOS-first
- Renderer output uses the same receipt composition shown on the landing page

## Current status

What works today:

- Codex skill wrapper
- Claude Code skill wrapper
- Kiro CLI session parsing
- Local runtime for parsing and rendering
- Marketing site
- macOS arm64 standalone runtime build
- GitHub Actions release workflow for runtime artifacts

What is still being finalized:

- Update-check UX for installed runtimes
- Linux and Windows runtime support

## Installation

### Using `skills.sh` CLI

Recommended public install:

```bash
npx skills add ameyalambat128/token-receipt --skill token-receipt
```

This installs the canonical skill package from:

```text
skills/token-receipt/
```

On first use, the skill downloads the standalone macOS arm64 runtime from GitHub Releases.

### Repo-local install

From the repo root:

```bash
bun install
bun run skill:install
```

This installs the local skill wrappers into detected skill directories such as:

- `~/.codex/skills/token-receipt`
- `~/.claude/skills/token-receipt`
- `~/.agents/skills/token-receipt`

### Runtime install model

The skill and the runtime are intentionally separate:

- The skill is installed globally into the agent skill directory.
- The runtime binary is installed per-user on macOS.
- Generated receipt artifacts stay in the current working directory.

Current macOS paths:

- Runtime binary: `~/Library/Application Support/token-receipt/bin/token-receipt`
- Install metadata: `~/Library/Application Support/token-receipt/install.json`
- Download cache: `~/Library/Caches/token-receipt/`
- Generated output: `./token-receipt-output`

### Release artifact build

Build the macOS arm64 archive that the installer expects:

```bash
bun run runtime:build:darwin-arm64
```

This writes:

```text
packages/runtime/dist/token-receipt-darwin-arm64.tar.gz
```

## How it works

1. The user invokes the Token Receipt skill in Codex or Claude Code.
2. The wrapper script checks for a local installed runtime binary.
3. If the runtime is missing, the installer downloads the macOS arm64 release artifact and installs it into Application Support.
4. The runtime parses local Codex, Claude Code, and Kiro CLI logs.
5. It writes:
   - `analysis.json`
   - `receipt.json`
   - `receipt.png`
   - `share/x.txt`
   - `share/linkedin.txt`
6. The skill reads those generated artifacts and writes the final in-session roast.

## Receipt contract

`receipt.json` is not just totals and line items. It also carries the display metadata that the PNG renderer uses for the final visual artifact.

That means the receipt boundary is:

- analytical fields such as totals, waste lines, and disclaimer text
- display fields such as the order header, stats rows, detail rows, activity grid, and footer copy

The goal is to keep `packages/render` grounded in the `Receipt` contract while keeping the generated receipt visually aligned with the landing-page example.

The current full renderer converts `Receipt` into a self-contained HTML document and screenshots it with a local Chromium-compatible browser. This gives the PNG the same paper texture and layout language as the landing-page receipt. The paper texture is embedded in the renderer package so compiled runtimes do not depend on repo-relative web assets.

The planned lightweight renderer should remain behind an explicit option or feature flag. It should still consume `Receipt`, but it can trade visual fidelity for speed and avoid the browser dependency.

## Supported agents

### Codex

Run directly:

```bash
~/.codex/skills/token-receipt/scripts/generate.sh --since 30d
```

### Claude Code

Run directly:

```bash
~/.claude/skills/token-receipt/scripts/generate.sh --since 30d
```

### Kiro CLI session support

Kiro CLI sessions are detected from:

```text
~/Library/Application Support/kiro-cli/data.sqlite3
```

Kiro does not expose the same local token counters as Codex and Claude Code in this tool, so Token Receipt prices Kiro usage from local `usage_info` credits at the published `$0.04` per credit overage rate.

### Force a runtime refresh

```bash
~/.codex/skills/token-receipt/scripts/generate.sh --update-runtime --since 30d
```

## Direct runtime usage

You can also run the runtime without going through the skill wrapper:

```bash
bun run -F token-receipt doctor
bun run -F token-receipt generate -- --since 30d --out ./token-receipt-output
```

## Output

Every run writes to `token-receipt-output/` in the current working directory:

- `analysis.json`
- `receipt.json`
- `receipt.png`
- `share/x.txt`
- `share/linkedin.txt`

## Project structure

```text
token-receipt/
├── apps/
│   └── web/                      # Marketing site
├── docs/                         # Public docs and product notes
├── packages/
│   ├── core/                     # Log parsing, heuristics, analysis
│   ├── render/                   # Receipt HTML and PNG rendering
│   ├── runtime/                  # CLI and standalone runtime build
│   ├── skills/                   # Codex and Claude Code skill wrappers
│   ├── typescript-config/        # Shared TS config
│   ├── eslint-config/            # Shared lint config
│   └── ui/                       # Shared UI primitives
├── AGENTS.md                     # Repo-local agent instructions
└── README.md
```

## Validation

```bash
bun run format
bun run check
bun run -F @token-receipt/skills test:skill-smoke
```

Notes:

- `bun run check` is the fast default validation path.
- `bun run -F @token-receipt/skills test:skill-smoke` runs the real `generate.sh` wrapper against deterministic demo data and asserts the output artifact contract.

## Releasing

Push a semantic version tag to publish the macOS runtime archive and checksum through GitHub Actions:

```bash
git tag v0.1.0
git push origin v0.1.0
```

Release assets:

- `token-receipt-darwin-arm64.tar.gz`
- `token-receipt-darwin-arm64.tar.gz.sha256`

## Who this is for

- People using Codex, Claude Code, or Kiro CLI daily
- Developers who want a funny but grounded snapshot of agent habits
- People posting receipts, screenshots, or launch content about coding-agent workflows
- Anyone who wants a local-first artifact instead of a hosted dashboard

## Related docs

- `docs/skills.md`
- `docs/release.md`
