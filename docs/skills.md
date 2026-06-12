# Skills

## Public install

Recommended install via `skills.sh`:

```bash
npx skills add ameyalambat128/token-receipt --skill token-receipt
```

This installs the canonical skill package from `skills/token-receipt/`.

## Repo-local install

From the repo root:

```bash
bun install
bun run skill:install
```

The installed skill bootstraps a standalone macOS arm64 runtime into `~/Library/Application Support/token-receipt/bin/token-receipt`. Download caches live in `~/Library/Caches/token-receipt/`.

## Usage

Codex:

```bash
~/.codex/skills/token-receipt/scripts/generate.sh --since 30d
```

Claude Code:

```bash
~/.claude/skills/token-receipt/scripts/generate.sh --since 30d
```

Force a fresh runtime install:

```bash
~/.codex/skills/token-receipt/scripts/generate.sh --update-runtime --since 30d
```

Deterministic smoke test during repo development:

```bash
bun run -F @token-receipt/skills test:skill-smoke
```

## Release artifact

Build the macOS arm64 archive that the skill installer expects:

```bash
bun run runtime:build:darwin-arm64
```

This writes:

- `packages/runtime/dist/token-receipt-darwin-arm64.tar.gz`
- `packages/runtime/dist/token-receipt-darwin-arm64.tar.gz.sha256`

## GitHub Releases

Push a semantic version tag to publish the release assets:

```bash
git tag v0.1.0
git push origin v0.1.0
```

The release workflow validates the workspace, builds the runtime, and uploads the archive plus checksum.

## Output

Every run writes to `token-receipt-output/` in the current working directory:

- `analysis.json`
- `receipt.json`
- `receipt.png`
- `share/x.txt`
- `share/linkedin.txt`

`receipt.json` also contains the display metadata used by the PNG renderer so the generated receipt can stay visually aligned with the landing-page example.
