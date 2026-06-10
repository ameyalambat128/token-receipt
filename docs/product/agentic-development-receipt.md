# PRD: Agentic Development Receipt

## Summary

Token Receipt should evolve from a token-themed satire generator into a local-first product that explains how someone uses coding agents during development.

The first release in this direction should still center on the wrinkled satirical receipt. The difference is that the receipt should be powered by a richer analysis model inspired by products like Paxel:

- how the user prompts
- how they steer
- how often they plan first
- how long they stay in-session
- how repetitive or cryptic their behavior is
- how they move from idea to edit to ship

## Problem

Current Token Receipt output is amusing, but still narrow. It focuses mostly on token usage and a small set of waste heuristics.

That leaves three gaps:

1. It does not yet explain how the user actually works with coding agents.
2. It does not produce enough memorable stats to feel deeply personalized.
3. It does not yet create a bridge from a funny artifact to a more serious reflection product.

## Product goal

Generate the funniest, most shareable artifact for agentic development behavior, while keeping the underlying analysis grounded in real local logs.

## Non-goals

- Build a hosted dashboard in the first phase
- Upload processed session summaries by default
- Turn Token Receipt into a formal employee or developer evaluation tool
- Reproduce Paxel feature-for-feature

## Target users

- Developers who use Codex and Claude Code regularly
- Builders who want something funny to post
- Power users who also want a truthful picture of how they operate with agents

## Product principles

1. Local-first by default
2. Receipt-first as the wedge
3. Grounded metrics under a playful surface
4. One analysis pipeline that can support future outputs

## User experience

### Primary output

A wrinkled-paper receipt PNG with:

- a headline roast
- total imaginary bill
- line items mapped to real behaviors
- a compact set of high-signal supporting stats
- share-ready social copy

### Secondary output

Structured artifacts in `token-receipt-output/` that explain the receipt:

- `analysis.json`
- `receipt.json`
- `receipt.png`
- `share/x.txt`
- `share/linkedin.txt`

When run through the skill path, the host coding agent should also persist:

- `agentic-profile.json`
- `agentic-profile.md`

Future phases may add a dedicated stats or report artifact, but the receipt remains primary.

## Scope for the next phase

### In scope

- Expand the analysis schema beyond token totals
- Add Paxel-inspired local metrics
- Improve the receipt headline and line items
- Add memorable, defensible supporting stats
- Keep the experience local-first and file-based

### Out of scope

- hosted report pages
- user accounts
- server-side storage
- cross-user benchmarking

## Functional requirements

### 1. Session fact extraction

The analyzer should derive, at minimum:

- session count
- provider mix
- total time spent
- longest single session
- prompt count
- prompts per session
- average prompt length
- plan-mode usage rate
- repeated reads
- repeated shell commands
- subagent usage
- project count or project spread

### 2. Steering and behavior signals

The analyzer should derive behavior signals such as:

- course-correction frequency
- repeated prompt patterns
- likely go-to prompt
- likely cryptic prompt
- planning-heavy versus execution-heavy sessions
- context-heavy sessions
- low-output sessions

### 3. Receipt generation

The receipt renderer should support:

- a stronger headline
- line items that map to behavioral patterns, not only token costs
- a small set of top stats that can appear on the receipt or in adjacent share surfaces
- satirical framing without pretending the bill is literal

### 4. Supporting stats

The product should expose a compact set of user-facing stats inspired by Paxel-style report cards.

Initial candidate stats:

- What kind of agent user are you?
- How do you work with your agent?
- How often do you plan first?
- What is your go-to prompt?
- What was your longest session?
- How often do you change course?
- How long are your prompts?
- How much time did you put in?
- What was your most cryptic prompt?
- How much do you talk to your agent?

These do not all need to appear on the paper receipt. Some can live in `analysis.json` and future share surfaces first.

### 5. Artifact grounding

Every user-facing claim should be traceable to a structured field in the local analysis output.

This is required so the product stays:

- inspectable
- debuggable
- trustworthy

The first implementation should explicitly split responsibilities:

- runtime: deterministic metrics, bounded prompt evidence, output files
- host coding agent in the skill: higher-level interpretation and persisted profile artifacts

## Data model direction

The analysis layer should move toward three levels:

### Session facts

Raw but structured metrics derived from one session.

Examples:

- timestamps
- duration
- prompt counts
- tool counts
- repeated reads
- repeated commands
- edits observed

### Behavior signals

Computed interpretations based on session facts.

Examples:

- planning-heavy
- tool tourism
- context emotional support
- command confidence loops
- cryptic prompting

### Output packaging

Presentation-specific summaries that use the same underlying data.

Examples:

- receipt line items
- social copy
- top stats
- future report cards

## Rollout plan

### Phase 1: Schema expansion

- extend `analysis.json` with richer session facts and higher-level stats
- keep existing receipt output working
- add fields needed for future headline and stats improvements

### Phase 2: Better receipt

- upgrade headline logic
- improve line-item generation
- add compact supporting stats
- improve share text so it reflects the new behavior model

### Phase 3: Optional report surface

- add a concise narrative or card-based breakdown
- keep it secondary to the receipt

## Success metrics

The next phase succeeds if:

1. receipt output feels more personalized
2. the headline and line items are funnier without becoming arbitrary
3. users can recognize their real working style in the stats
4. the product remains local-first and easy to run
5. the analysis schema supports future report-like outputs without major redesign

## Defaults chosen

- Default product posture: local-first
- Default hero artifact: satirical wrinkled receipt
- Default inspiration source: Paxel's analysis shape, not its hosted product shape
- Default expansion path: richer stats first, long-form reports later
