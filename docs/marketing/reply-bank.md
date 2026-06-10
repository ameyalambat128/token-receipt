# Reply bank

## What data does it use?

Only local Codex and Claude Code logs in v1. No prompt upload by default.

## Do I need another API key?

No. The runtime computes the facts locally and the skill uses the agent session you are already in for the final wording.

## Is this financially accurate?

No. It is grounded in real local usage signals, but the bill itself is satirical.

## Can it work without the skill?

Yes. The runtime can be called directly with `bun run -F token-receipt generate -- --since 30d --out ./token-receipt-output`.

## Why not build a dashboard?

Because the screenshot is the product.
