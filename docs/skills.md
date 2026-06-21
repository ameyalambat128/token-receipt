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

Repo-local install uses `~/.agents/skills/token-receipt` as the canonical local skill and links the Codex, Claude Code, and Kiro skill directories back to it. When `KIRO_HOME` is set, the installer also writes a Kiro link into `$KIRO_HOME/skills/token-receipt`.

The installed skill bootstraps a standalone macOS arm64 runtime into `~/Library/Application Support/token-receipt/bin/token-receipt`. Download caches live in `~/Library/Caches/token-receipt/`.

## Usage

When the skill is invoked inside a host agent such as Codex, Claude Code, Kiro, or Cursor, the skill instructions should pass the matching provider by default. If the user explicitly asks for cross-agent output, the skill should use `--provider all`. If the host agent cannot be identified confidently, the skill should also fall back to `--provider all`.

Primary usage inside the coding session:

```text
/token-receipt
```

Optional in-session prompt:

```text
/token-receipt Generate a receipt for my last 30 days of agent usage.
```

On supported systems, the wrapper opens `receipt.png` after a successful run. Set `TOKEN_RECEIPT_DISABLE_OPEN=1` to skip that behavior in tests or automation.

Manual wrapper paths for debugging or direct shell usage:

```bash
~/.agents/skills/token-receipt/scripts/generate.sh --since 30d
~/.codex/skills/token-receipt/scripts/generate.sh --since 30d
~/.claude/skills/token-receipt/scripts/generate.sh --since 30d
~/.kiro/skills/token-receipt/scripts/generate.sh --since 30d
```

Kiro CLI logs are also included automatically when you run the runtime with `--provider kiro` or `--provider all`. Kiro spend is based on local credit usage rather than token-derived API pricing.

Experimental Cursor local sessions are included automatically when you run the runtime with `--provider cursor` or `--provider all`. Cursor currently contributes behavior-rich local activity analysis, but local spend and token accounting are lower fidelity than Codex or Claude Code.

Force a fresh runtime install:

```bash
~/.agents/skills/token-receipt/scripts/generate.sh --update-runtime --since 30d
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

Installed skill runs are global-first today and write to `~/Library/Application Support/token-receipt/runs/<timestamp>/`.

Repo-scoped output in `token-receipt-output/` is only reliable for direct repo runs where the process actually executes with a project `cwd`.

Pass `--out <path>` to export artifacts somewhere explicit in either mode.

Each run directory contains:

- `analysis.json`
- `receipt.json`
- `receipt.png`
- `share.txt`

`receipt.json` also contains the display metadata used by the PNG renderer so the generated receipt can stay visually aligned with the landing-page example.

The full renderer produces the PNG from a self-contained HTML receipt and a local Chromium-compatible browser. This keeps the output local while matching the marketing-site receipt treatment more closely than the older lightweight renderer path. A future `lite` option should remain available for users who prefer a faster renderer with no browser dependency.
