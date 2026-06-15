# Future Agent Platform

## Status

This document captures a far-future product direction.

It is intentionally not part of the current implementation plan for the main branch.

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

## Future community and leaderboard layer

One additional future surface worth capturing is an opt-in public leaderboard around token and agent-usage stats.

That is not part of the current local-first receipt product, but it fits the broader long-term direction if the underlying analytics become strong enough.

A future leaderboard layer could include:

- opt-in public profiles
- project or codebase-level usage stats
- normalized usage breakdowns by host, model, or tool category
- "most expensive habits" rollups across many runs
- cohort views such as solo builders, heavy Codex users, or multi-agent teams

If this exists, it should not just reward raw spend or raw token volume. The more useful version would compare:

- token usage over time
- cost-equivalent estimates over time
- tool-call density
- planning versus editing behavior
- delegation and handoff patterns
- output quality or ship outcomes, if those become measurable later

That kind of surface only works if it is:

- explicitly opt-in
- clear about what is measured versus inferred
- normalized enough that different hosts and workflows are not compared unfairly
- privacy-safe at the project and artifact level

In other words, the interesting future leaderboard is not "who burned the most tokens." It is "what working styles emerge across real agent-heavy development workflows."

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

## Principles to borrow later

For the future agentic analytics direction, there are a few principles worth adopting even if they do not become part of the current Token Receipt product shape.

### Truthfulness over completion

Future analytics should prefer omission over bluffing.

If the system cannot confidently derive a field from evidence, it should:

- leave the field out
- mark it unknown
- or clearly label it as an estimate

That applies especially to:

- model mapping
- token-class mapping
- price estimation
- tool attribution
- session boundary inference
- project attribution

The rule should be: unknown stays unknown unless the transform is explicit and defensible.

### Host discipline over cross-tool guessing

Future multi-host support should be adapter-driven, not inference-driven.

If more than one agent host is present in local or uploaded artifacts, the system should not silently guess which one the user meant. It should instead:

- use the explicitly selected host
- use the host implied by the current integration surface
- or fail with a clear request for disambiguation

This matters because the product becomes less trustworthy the moment it quietly bills one tool using another tool's logs.

### Adapter-first expansion

If this grows into a broader agent analytics platform, each host should have its own parser and evidence contract.

That means every supported tool should define:

- where data comes from
- which fields are first-party versus inferred
- what is cumulative versus per-turn
- what pricing fields are truly available
- what fallbacks are allowed
- what conditions should produce an unknown result instead of a fabricated one

The platform should expand one adapter at a time rather than through a single generic parser that "mostly works."

### Evidence-backed artifact fields

Future reports should separate three classes of output:

- raw evidence
- deterministic transforms
- opinionated interpretation

That separation matters because the hosted product will likely need stronger trust guarantees than the current satire artifact.

The system should always be able to explain, for any displayed field:

- where it came from
- what transform created it
- whether it is measured, inferred, or editorial

### Satire stays optional in the future platform

The current product benefits from satire and brand voice.

The future platform should keep that layer optional and clearly downstream from the evidence model. In other words:

- evidence first
- deterministic structure second
- personality last

That preserves room for playful outputs without making the analytics substrate untrustworthy.

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
