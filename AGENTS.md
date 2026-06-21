# AGENTS.md

## Repo Summary

Token Receipt is a skill-first local tool that turns Codex, Claude Code, and Kiro CLI logs into a satirical AI expense receipt.

Primary surfaces:

- `apps/web`: marketing site
- `packages/core`: log parsing, heuristics, analysis, share text
- `packages/render`: receipt SVG and PNG rendering
- `packages/runtime`: CLI and compiled standalone runtime
- `skills/token-receipt`: canonical marketplace skill package
- `packages/skills`: local install and validation helpers
- `docs/`: launch, share, and install docs

## Commands

Use Bun for repo work.

```bash
bun install
bun run format
bun run check
bun run -F @token-receipt/skills test:skill-smoke
bun run skill:install
bun run runtime:build:darwin-arm64
```

## Skill Install Model

- The skill is installed globally under the user's agent skill directory.
- The runtime binary is installed per-user on macOS.
- Installed skill runs are global-first today.
- Repo-scoped output is only reliable when the process actually runs with a project `cwd`, such as a direct repo invocation.

macOS paths:

- Skill: `~/.codex/skills/token-receipt` or `~/.claude/skills/token-receipt`
- Runtime binary: `~/Library/Application Support/token-receipt/bin/token-receipt`
- Install metadata: `~/Library/Application Support/token-receipt/install.json`
- Download cache: `~/Library/Caches/token-receipt/`
- Repo-scoped output: `./token-receipt-output`
- Global output: `~/Library/Application Support/token-receipt/runs/<timestamp>/`

## Agent Workflow

When working on this repo:

1. Do not start a dev server unless the user explicitly asks.
2. Prefer functional patterns and concise TypeScript.
3. Use `apply_patch` for manual edits.
4. Run `bun run format` and `bun run check` after changes.
5. Keep skill behavior grounded in `analysis.json` and generated artifacts.
6. Treat `receipt.json` as the renderer contract. If the PNG needs new sections or display details, add them to `Receipt` in `packages/core` instead of deriving them ad hoc inside `packages/render`.

## Renderer Notes

- The generated PNG is expected to match the landing-page receipt treatment closely, including the paper styling and section layout.
- `packages/render` should stay a pure `Receipt -> PNG` layer.
- Use `bun run -F @token-receipt/skills test:skill-smoke` for wrapper-level validation when touching install flow or receipt rendering.

## Text Diagram

This is the agent-compatible text version of the current install and execution flow:

```text
1. User installs the Token Receipt skill from a global skill source such as skills.sh.
2. The installed skill provides wrapper scripts like generate.sh.
3. User invokes the skill in Codex or Claude Code.
4. generate.sh checks for an installed runtime binary in:
   ~/Library/Application Support/token-receipt/bin/token-receipt
5. If the binary is missing, install-runtime.sh downloads the macOS arm64 release archive,
   extracts it, installs the binary, and records install.json metadata.
6. The runtime binary runs locally and:
   - parses Codex, Claude Code, and Kiro CLI logs
   - writes analysis.json
   - writes receipt.json
   - writes receipt.png
   - writes share.txt
7. All generated artifacts are written to:
   - `~/Library/Application Support/token-receipt/runs/<timestamp>/` for installed skill runs by default
   - `./token-receipt-output` only when the process truly runs with a repo `cwd`
8. The skill reads those generated files and writes the final in-session roast.
```

## Current Gaps

- TODO: Publish the macOS arm64 runtime archive in GitHub Releases
- TODO: Finalize marketplace packaging for skills.sh
- TODO: Add a non-invasive update-check UX
- TODO: Add Linux and Windows runtime support
