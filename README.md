# /token-receipt

Token Receipt turns Codex, Claude Code, and Kiro CLI logs into your coding-agent bill.

Token Receipt is a skill-first local tool for people using coding agents heavily and wanting one artifact that instantly shows how they work.

It parses local agent logs, scores the most defensible forms of waste, renders a thermal-paper receipt PNG, and generates share-ready post copy grounded in real local habits.

- Skill-first UX for Codex and Claude Code, with Kiro CLI session support
- Screenshot-first artifact for agent-heavy developers
- Local parsing and local image generation
- No separate model API required in v1
- Satirical output grounded in real local usage signals
- Open source and macOS-first
- Renderer output uses the same receipt composition shown on the landing page

## Installation

Recommended public install:

```bash
npx skills add ameyalambat128/token-receipt --skill token-receipt
```

On first use, the skill downloads the standalone macOS arm64 runtime from GitHub Releases.

More install details and runtime notes live in [`docs/skills.md`](/Users/ameya/Code/oss/token-receipt/docs/skills.md).

## Usage

Run the installed skill directly:

### Codex

```bash
~/.codex/skills/token-receipt/scripts/generate.sh --since 30d
```

### Claude Code

```bash
~/.claude/skills/token-receipt/scripts/generate.sh --since 30d
```

### Kiro CLI

Kiro CLI sessions are included automatically when you run the skill or runtime with Kiro enabled. Kiro spend is based on local credit usage rather than token-derived API pricing.

### Refresh the runtime

```bash
~/.codex/skills/token-receipt/scripts/generate.sh --update-runtime --since 30d
```

### Direct runtime usage

```bash
bun run -F token-receipt doctor
bun run -F token-receipt generate -- --since 30d --out ./token-receipt-output
```

## For Contributors

Repo-local install:

```bash
bun install
bun run skill:install
```

Validation:

```bash
bun run format
bun run check
bun run -F @token-receipt/skills test:skill-smoke
```

MIT licensed.
