# /token-receipt

Token Receipt turns Codex and Claude Code logs into a satirical AI expense receipt.

## What is this?

Token Receipt is a skill-first local tool for people using coding agents heavily and wondering where all the tokens went.

It parses local agent logs, scores the most defensible forms of waste, renders a thermal-paper receipt PNG, and generates share-ready captions for X and LinkedIn.

- Skill-first UX for Codex and Claude Code
- Local parsing and local image generation
- No separate model API required in v1
- Satirical output grounded in real local usage signals
- Open source and macOS-first

## Current status

What works today:

- Codex skill wrapper
- Claude Code skill wrapper
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
4. The runtime parses local Codex and Claude Code logs.
5. It writes:
   - `analysis.json`
   - `receipt.json`
   - `receipt.png`
   - `share/x.txt`
   - `share/linkedin.txt`
6. The skill reads those generated artifacts and writes the final in-session roast.

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
├── docs/                         # Launch, virality, and skill docs
├── packages/
│   ├── core/                     # Log parsing, heuristics, analysis
│   ├── render/                   # Receipt SVG and PNG rendering
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
```

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

- People using Codex or Claude Code daily
- Developers who want a funny but grounded summary of agent usage
- People posting receipts, screenshots, or launch content about AI spend
- Anyone who wants a local-first artifact instead of a hosted dashboard

## Related docs

- `docs/skills.md`
- `docs/release.md`
- `docs/x.md`
- `docs/linkedin.md`
- `docs/launch-checklist.md`
- `docs/reply-bank.md`
