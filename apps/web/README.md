# Web

The marketing site is a Next.js app in the monorepo workspace.

## Commands

Run from the repo root:

```bash
bun run format
bun run check
```

## GitHub metrics strip

The top-right header badge reads GitHub repo stars and latest runtime download
count from the GitHub API.

Optional server env var:

```bash
GITHUB_TOKEN=github_pat_or_equivalent
```

When `GITHUB_TOKEN` is present, the server uses it for higher-rate-limit GitHub
API requests. Without it, the site falls back to unauthenticated public GitHub
requests and still renders gracefully if those requests fail.
