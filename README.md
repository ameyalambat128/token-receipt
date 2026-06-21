# /token-receipt

Token Receipt turns Codex, Claude Code, Kiro CLI, and experimental Cursor local session logs into your coding-agent bill.

Token Receipt is a skill-first local tool for people using coding agents heavily and wanting one artifact that instantly shows how they work.

It parses local agent logs, scores the most defensible forms of waste, renders a thermal-paper receipt PNG, and generates optional share text grounded in real local habits.

- Skill-first UX for Codex and Claude Code, plus Kiro CLI and experimental Cursor local session support
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

Installed skill runs are global-first today and write to `~/Library/Application Support/token-receipt/runs/<timestamp>/` unless you pass `--out <path>`.

Direct repo runs that actually execute with a project `cwd` write to `./token-receipt-output`.

More install details and runtime notes live in [`docs/skills.md`](/Users/ameya/Code/oss/token-receipt/docs/skills.md).

---

## Usage

In Codex, Claude Code, or another supported host that exposes the installed skill, invoke it directly in the session:

```text
/token-receipt
```

You can add context in the same message when needed, for example:

```text
/token-receipt Generate a receipt for my last 30 days of agent usage.
```

Kiro CLI sessions are included automatically when you run the skill or runtime with Kiro enabled. Kiro spend is based on local credit usage rather than token-derived API pricing.

Cursor local sessions are supported experimentally when you run the runtime with `--provider cursor` or `--provider all`. Cursor support is currently behavior-first, so tool activity is stronger than token or spend fidelity.

---

## Advanced

Manual skill wrapper usage:
Use this for debugging or direct shell usage when you do not want to invoke the installed skill from the agent session.

```bash
~/.codex/skills/token-receipt/scripts/generate.sh --since 30d
~/.claude/skills/token-receipt/scripts/generate.sh --since 30d
```

Refresh the runtime:
Force a fresh download of the standalone runtime from GitHub Releases.

```bash
~/.codex/skills/token-receipt/scripts/generate.sh --update-runtime --since 30d
```

Direct runtime usage:
Bypass the skill wrapper and call the runtime CLI directly. `--filter token-receipt` tells Bun to run the script from the `packages/runtime` workspace package.

```bash
bun run --filter token-receipt doctor
bun run --filter token-receipt generate -- --since 30d --out ./token-receipt-output
```

Repo-scoped direct run:
Run the wrapper from inside a repo when you want output in `./token-receipt-output`.

```bash
cd /path/to/repo
bash skills/token-receipt/scripts/generate.sh --since 30d
```

---

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
bun run --filter @token-receipt/skills test:skill-smoke
```

MIT licensed.
