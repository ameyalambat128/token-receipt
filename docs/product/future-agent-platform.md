# Future Agent Platform

## Status

This document captures a far-future product direction.

It is intentionally not part of the current implementation plan for this branch.

The current branch remains focused on stronger local analysis, better behavior signals, and a more credible product foundation on top of the existing data collection flow.

## Idea

Long term, Token Receipt should be able to grow from a local artifact generator into a fuller product around coding-session and agent-session analytics.

That future product could analyze not just one exported run, but an ongoing stream of agent activity across coding sessions:

- session history
- coding workflow patterns
- prompt behavior
- tool usage
- planning and delegation habits
- edit and ship behavior
- project-level evolution over time

The product would move from "funny receipt" toward "agentic development analytics".

## Future hosted workflow

A future hosted workflow could look more like this:

1. A user connects or uploads session artifacts.
2. The system ingests structured logs and bounded supporting files.
3. Processing runs in an isolated background environment.
4. The product computes reusable analytics artifacts and trend views.
5. The user gets a richer profile of how they work with coding agents over time.

That could support:

- recurring reports
- project timelines
- workstyle changes over time
- agent usage breakdowns
- benchmark views
- team or cohort comparisons
- stronger "what kind of builder are you?" outputs

## Execution model inspiration

One plausible future direction is a sandboxed execution model where analysis jobs run inside isolated containers, for example Docker-backed workers or similar sandbox infrastructure.

The point of that model would be:

- safer processing of uploaded or synced artifacts
- clearer separation between ingestion and reporting
- background job execution
- easier scaling for heavier parsing and enrichment pipelines
- better control over what code and data each job can access

This should be treated as inspiration for a future system shape, not as a current commitment to a specific vendor or deployment design.

## Product shape if we go there

If Token Receipt grows into that larger product, the system likely becomes:

- local-first capture or export
- optional hosted ingestion
- sandboxed processing jobs
- persisted analytics artifacts
- richer user-facing report surfaces

Possible future surfaces:

- recurring report cards
- narrative summaries
- decision-pattern tracking
- prompt-pattern tracking across many sessions
- project memory and progress views
- analytics for individual developers and later teams

## Why this is far future

This direction is intentionally deferred because it introduces a different class of product and infrastructure work:

- hosted architecture
- privacy and trust requirements
- ingestion contracts
- sandbox execution
- storage and retention policy
- multi-run analytics design
- account and product UX

That is meaningfully different from the current goal, which is to make the analysis chain stronger using the data we already collect locally.

## What remains current now

The near-term work remains:

- improve local analysis quality
- expand deterministic behavior metrics
- keep evidence bounded and defensible
- use the host coding agent as the interpretation layer
- evolve toward a more real product without jumping into hosted infrastructure yet

## Non-goals for the current phase

This document does not authorize work right now on:

- Docker infrastructure
- hosted background workers
- account systems
- cloud storage
- long-running ingestion pipelines
- multi-tenant analytics
- team dashboards

Those belong to a later planning phase if and when the local-first product foundation proves valuable.
