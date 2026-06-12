# Release

This is the canonical release runbook for Token Receipt.

Use it before pushing a release tag or manually dispatching the release workflow.

## What gets published

The release workflow publishes the macOS arm64 runtime assets used by the installed skill:

- `token-receipt-darwin-arm64.tar.gz`
- `token-receipt-darwin-arm64.tar.gz.sha256`

The skill installer downloads these assets from GitHub Releases on first run.

## Preconditions

Before releasing:

1. Make sure `main` contains the exact code you want to publish.
2. Make sure the public install path is still:

```bash
npx skills add ameyalambat128/token-receipt --skill token-receipt
```

3. Make sure the canonical skill package is still:

```text
skills/token-receipt/
```

4. Make sure the runtime release asset names still match the installer expectations in:

- `skills/token-receipt/scripts/install-runtime.sh`
- `.github/workflows/release.yml`
- `packages/runtime/scripts/build-darwin-arm64.sh`

## Local validation

Run these from the repo root:

```bash
bun install
bun run format
bun run check
bun run -F @token-receipt/skills test:skill-smoke
bun run runtime:build:darwin-arm64
```

Confirm these files exist after the local build:

```text
packages/runtime/dist/token-receipt-darwin-arm64.tar.gz
packages/runtime/dist/token-receipt-darwin-arm64.tar.gz.sha256
```

## Recommended release path

Create and push a semantic version tag:

```bash
git checkout main
git pull --ff-only origin main
git tag v0.1.0
git push origin v0.1.0
```

That triggers `.github/workflows/release.yml`.

## Manual release path

If you need to re-run the release without pushing a new tag:

1. Open the GitHub Actions page for the `Release` workflow.
2. Use `Run workflow`.
3. Set `tag_name` to the existing semantic tag, for example `v0.1.0`.

This matches the current workflow configuration, which uses `workflow_dispatch` inputs and `contents: write`.

## What the workflow does

The release workflow:

1. Checks out the repo on `macos-latest`
2. Installs Bun
3. Runs:
   - `bun run format`
   - `git diff --exit-code`
   - `bun run check`
4. Builds the macOS arm64 runtime
5. Creates a GitHub release with generated notes
6. Uploads the tarball and checksum as release assets

## Post-release verification

After the workflow completes:

1. Open the GitHub release page.
2. Confirm the tag matches the intended version.
3. Confirm both assets are attached:
   - `token-receipt-darwin-arm64.tar.gz`
   - `token-receipt-darwin-arm64.tar.gz.sha256`
4. Confirm the public install docs still point at:

```bash
npx skills add ameyalambat128/token-receipt --skill token-receipt
```

5. Smoke test the install flow on a clean machine or a temporary override path:

```bash
TOKEN_RECEIPT_APP_SUPPORT_DIR="$PWD/.tmp/app-support" \
TOKEN_RECEIPT_CACHE_DIR="$PWD/.tmp/cache" \
bash skills/token-receipt/scripts/generate.sh --since 30d --seed demo
```

6. Confirm output lands in:

```text
./token-receipt-output
```

## If the release fails

Check these first:

- Wrong tag name format
- Asset name drift between build script and installer
- Formatting drift introduced by generated files
- Broken checksum generation
- Workflow permissions or missing release write access

If the tag already exists but the assets are wrong, fix `main`, then re-run the workflow manually against the same tag only if you intend to overwrite the release assets. Otherwise cut a new version tag.

## Notes for Codex

When asked to publish a release in this repo, Codex should:

1. Read this file first.
2. Run local validation.
3. Inspect `.github/workflows/release.yml`.
4. Confirm the canonical skill package and release asset names still align.
5. Only then create and push the semantic tag.
