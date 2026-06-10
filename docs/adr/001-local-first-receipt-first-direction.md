# ADR-001: Local-first, Receipt-first Direction

- Status: Accepted
- Date: 2026-06-09

## Context

Token Receipt currently turns local Codex and Claude Code logs into a satirical AI expense receipt.

We want to align some of the product ambition with Paxel:

- richer behavioral analysis
- stronger cross-session stats
- more legible summaries of how someone works with coding agents

At the same time, Token Receipt has a different wedge:

- local-first by default
- lightweight artifact generation
- comedic, screenshot-friendly output

We need to lock the product direction before expanding the analysis pipeline.

## Decision

Token Receipt will remain local-first and receipt-first, while adopting a richer Paxel-inspired behavioral analysis model underneath.

This means:

1. The first-class output remains a satirical receipt PNG plus share copy.
2. The analysis layer will expand beyond token totals into agentic development metrics.
3. We will not introduce a hosted dashboard as the primary experience in the initial phase.
4. We will design the analysis schema so it can support future report-card and narrative outputs.
5. Humor stays on the surface, but the underlying metrics must remain defensible and traceable to local logs.

## What we are explicitly choosing

### 1. A local-first default

Token Receipt should not require users to upload processed session data in order to get the core product value.

Rationale:

- aligns with the current product promise
- keeps trust and install friction favorable
- keeps the initial scope manageable

### 2. A receipt wedge before a report wedge

The initial product should optimize for:

- virality
- visual novelty
- memorable headlines
- fast comprehension

Rather than:

- long narrative reports
- account systems
- hosted historical dashboards

Rationale:

- the receipt is the clearest differentiator
- the artifact is easy to post
- it gives us a sharper first impression than a dense report page

### 3. Paxel-inspired metrics, not Paxel-style positioning

We want the analytical depth of:

- session stats
- steering patterns
- planning behavior
- recurring prompt patterns
- episode-like grouping over time

But we do not want to position Token Receipt as a formal developer performance product.

Rationale:

- Token Receipt should feel playful first
- users should feel roasted, not surveilled
- the product can become more reflective later without losing its voice

### 4. One structured analysis layer for multiple outputs

We will treat the structured behavioral analysis as the core asset.

That layer should be able to drive:

- receipt line items
- summary stats
- social copy
- future report cards
- future narrative summaries

Rationale:

- avoids redoing the pipeline for each new surface
- keeps the product architecture coherent
- makes future expansion cheaper

## Consequences

### Positive

- Preserves the current product identity
- Makes room for richer, more interesting stats
- Keeps privacy and trust messaging simple
- Supports a staged roadmap from joke artifact to serious reflection tool

### Negative

- We will not match Paxel's hosted, longitudinal report depth in the first phase
- Some higher-order analytics may be weaker without a server-side memory layer
- Cross-run persistence and historical comparisons will need local-first solutions

## What this means for implementation

The next implementation phase should focus on:

1. expanding the analysis schema
2. adding Paxel-inspired behavioral metrics
3. improving receipt content and supporting stats
4. keeping output artifacts grounded in local files such as `analysis.json`, `receipt.json`, `receipt.png`, and share text

## Revisit conditions

We should revisit this ADR if any of these become true:

- users want longitudinal history across many runs
- the report experience becomes more valuable than the receipt
- we need optional upload for collaboration, storage, or richer comparisons
- the local-first model blocks obviously high-value product capabilities
