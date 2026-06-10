# Launch checklist

- Run `bun run format`
- Run `bun run check`
- Build the release artifact with `bun run runtime:build:darwin-arm64`
- Confirm `skills/token-receipt/` is the canonical skill package
- Run `bun run skill:install`
- Verify public install docs use `npx skills add ameyalambat128/token-receipt --skill token-receipt`
- Run `bun run -F token-receipt doctor`
- Generate a demo receipt with `bun run -F token-receipt generate -- --seed demo`
- Generate a real receipt with `~/.codex/skills/token-receipt/scripts/generate.sh --since 30d`
- Review `token-receipt-output/receipt.png`
- Review `token-receipt-output/share/x.txt`
- Review `token-receipt-output/share/linkedin.txt`
- Pick one screenshot for X and one for LinkedIn
- Keep the satirical disclaimer visible somewhere in the thread or post
