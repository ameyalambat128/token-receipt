# Overview

Token Receipt is a skill-first, local-first tool that turns coding-agent usage into a shareable artifact.

Today the hero artifact is a satirical wrinkled-paper receipt. The longer-term direction is a richer breakdown of agentic development behavior that stays grounded in local logs and generated analysis artifacts.

## Product direction

The current product thesis is:

1. Start with the funniest and most shareable artifact.
2. Make the joke feel true by grounding it in real behavior.
3. Build one analysis layer that can later support deeper summaries and reports.

The product is intentionally receipt-first, not dashboard-first.

We want inspiration from Paxel's analysis shape:

- session facts
- steering patterns
- planning behavior
- recurring prompt patterns
- decision-style signals
- memorable stats

But we do not want to copy Paxel's primary hosted-report posture in the initial phase.

## What Token Receipt is becoming

Token Receipt should evolve from a token-cost satire generator into a local-first artifact generator for agentic development.

That means the output should increasingly explain:

- how a user prompts
- how they steer the agent
- how often they plan first
- how repetitive or cryptic their behavior is
- how they move from idea to edit to ship

The first wedge remains a wrinkled receipt because it is:

- instantly understandable
- easy to screenshot and post
- funny without requiring a large product surface
- a good viral shell for deeper analytics

## System shape

Primary surfaces:

- `apps/web`
  - marketing site
- `packages/core`
  - log parsing, heuristics, analysis schema, share text
- `packages/render`
  - receipt SVG and PNG rendering
- `packages/runtime`
  - CLI and standalone runtime
- `skills/token-receipt`
  - canonical skill package and wrapper scripts
- `packages/skills`
  - local skill install and validation helpers

Primary local outputs:

- `token-receipt-output/analysis.json`
- `token-receipt-output/receipt.json`
- `token-receipt-output/receipt.png`
- `token-receipt-output/share/x.txt`
- `token-receipt-output/share/linkedin.txt`

Skill-path enrichment outputs:

- `token-receipt-output/agentic-profile.json`
- `token-receipt-output/agentic-profile.md`

## Analysis pipeline direction

The durable asset is not the PNG. The durable asset is the structured analysis behind it.

That analysis layer should move toward three levels:

### 1. Session facts

Structured metrics directly derived from one session.

Examples:

- session duration
- prompt count
- average prompt length
- repeated reads
- repeated shell commands
- edits observed
- provider mix
- plan-mode rate

### 2. Behavior signals

Computed interpretations derived from session facts.

Examples:

- planning-heavy behavior
- course-correction frequency
- tool tourism
- cryptic prompting
- context-heavy sessions
- low-output sessions

### 3. Output packaging

Presentation-specific outputs using the same data.

Examples:

- receipt line items
- receipt headline
- supporting stats
- social copy
- persisted host-agent profile artifacts
- future report-card or narrative outputs

## Runtime facts and host-agent enrichment

The architecture is intentionally split:

- The runtime computes deterministic session facts, behavior metrics, and bounded evidence.
- The host coding agent running the skill interprets those facts in-session.
- The skill path persists the interpreted result as `agentic-profile.json` and `agentic-profile.md`.

That keeps the runtime local-first and model-free while still using the host agent's reasoning ability for higher-level summaries.

## Current defaults

- Local-first is the default product posture.
- The satirical receipt is the primary output.
- Humor sits on top of defensible metrics.
- Structured analysis should support future outputs without reworking the pipeline.

## Docs map

- `docs/adr/`
  - major architectural and product decisions
- `docs/product/`
  - product specs and initiative-level docs
- `docs/operations/`
  - install, release, and workflow docs
- `docs/marketing/`
  - launch and share content docs

Key docs:

- `docs/adr/001-local-first-receipt-first-direction.md`
- `docs/product/agentic-development-receipt.md`

## Near-term priority

The next meaningful phase is to expand the analysis schema in `packages/core` so the receipt can be driven by richer agentic-development metrics instead of a narrow set of token and waste heuristics.

## System diagram

```text
┌────────────────────────────────────────────────────────────────────────────┐
│                              TOKEN RECEIPT                                │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  Inputs                                                                    │
│  ┌──────────────────────┐    ┌──────────────────────┐                     │
│  │ Codex session logs   │    │ Claude Code logs     │                     │
│  │ ~/.codex/sessions    │    │ ~/.claude/projects   │                     │
│  └──────────┬───────────┘    └──────────┬───────────┘                     │
│             │                           │                                 │
│             └───────────────┬───────────┘                                 │
│                             ▼                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ skills/token-receipt                                                │  │
│  │ Wrapper scripts, install flow, agent entrypoint                     │  │
│  └───────────────────────────────┬──────────────────────────────────────┘  │
│                                  ▼                                         │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ packages/runtime                                                    │  │
│  │ CLI and standalone runtime orchestration                            │  │
│  └───────────────────────────────┬──────────────────────────────────────┘  │
│                                  ▼                                         │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ packages/core                                                       │  │
│  │ Parse logs, compute session facts, derive behavior signals          │  │
│  └───────────────────────────────┬──────────────────────────────────────┘  │
│                                  ▼                                         │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ analysis.json                                                       │  │
│  │ Structured analysis artifact                                        │  │
│  └───────────────────────┬──────────────────────────────┬───────────────┘  │
│                          │                              │                  │
│                          ▼                              ▼                  │
│  ┌──────────────────────────────────┐   ┌──────────────────────────────┐   │
│  │ packages/render                  │   │ share text artifacts         │   │
│  │ Receipt SVG and PNG generation   │   │ receipt.json, x.txt,         │   │
│  │                                  │   │ linkedin.txt                 │   │
│  └──────────────────┬───────────────┘   └──────────────┬───────────────┘   │
│                     ▼                                  ▼                   │
│  ┌──────────────────────────────────┐   ┌──────────────────────────────┐   │
│  │ receipt.png                      │   │ token-receipt-output/        │   │
│  │ Wrinkled satirical artifact      │   │ Final generated outputs      │   │
│  └──────────────────┬───────────────┘   └──────────────┬───────────────┘   │
│                     └──────────────────────┬────────────┘                   │
│                                            ▼                                │
│                                  ┌──────────────────────┐                   │
│                                  │ User reads or shares │                   │
│                                  │ the receipt          │                   │
│                                  └──────────────────────┘                   │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```
