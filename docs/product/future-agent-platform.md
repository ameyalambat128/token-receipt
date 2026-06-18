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

## Future distribution and client shape

If Token Receipt grows into a hosted platform, the cleanest client split is still:

- skill as the in-agent UX inside Codex, Claude Code, and similar hosts
- local runtime as the canonical engine for parsing logs and generating receipt artifacts
- hosted platform as the aggregation and report layer across many runs
- optional npm CLI as the account, upload, sync, and automation surface outside the agent

That means the future system should not collapse into "the website does everything" or "the skill does everything."

Instead, each layer should keep a narrow job:

- the skill invokes local flows from inside the coding-agent session
- the runtime produces canonical artifacts such as `analysis.json`, `receipt.json`, `receipt.png`, and share text
- the hosted platform ingests structured artifacts and computes leaderboard, cohort, and trend views
- a future npm package can handle commands such as `login`, `submit`, `sync`, `status`, or export helpers without becoming the primary analysis engine

This repo is TypeScript and Bun-based, so if a packaged client is added later, npm is the more natural distribution surface than a Python or `uv`-style packaging model.

The important architectural boundary is:

- local artifact generation remains the source of truth
- hosted analytics remain downstream of those artifacts
- install and sync convenience layers should not redefine the core analysis contract

In practice, the likely future flow is:

1. A user installs the skill for in-agent use.
2. The skill runs the local runtime and generates canonical receipt artifacts.
3. The user optionally signs into a hosted account through a future npm CLI or web flow.
4. The user opts in to submit one or more generated receipts to the hosted platform.
5. The hosted platform computes cross-run analytics, profile views, and leaderboard surfaces from those submitted artifacts.

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

## Future memory and archive layer

If the product grows into leaderboard and workflow-analysis territory, it likely needs a separate memory or archive layer on top of the canonical Token Receipt artifacts.

The key boundary should stay clear:

- `token-receipt` remains the source of truth for parsing, pricing snapshots, cost-equivalent estimates, and structured per-run analysis
- a future analytics backend remains the source of truth for leaderboard math, cohort comparisons, and normalized multi-run rollups
- a memory layer remains an optional retrieval surface for summaries, tags, prior incidents, and cross-run narrative context

That means the memory layer should not be treated as the accounting engine or the primary analytics database.

Instead, it should help answer questions like:

- "show me prior expensive runs in this repo"
- "find sessions where pricing parsing broke"
- "what waste patterns have repeated across projects"
- "pull recent receipts related to Claude pricing refresh work"

One plausible future flow is:

1. Local or hosted ingestion produces canonical artifacts such as `analysis.json`, `receipt.json`, and share or summary text.
2. Structured fields are written into a purpose-built analytics store for aggregation and leaderboard features.
3. A compact summary document plus metadata tags are mirrored into a memory layer for agent retrieval.
4. Agents query that memory layer for recall, comparisons, prior-incident lookup, and weekly or monthly narrative digests.

### Replaceable backend stance

This layer should stay hot-swappable.

The product should define a small archive contract rather than committing early to a specific memory product. For example:

- stable run id
- generated-at timestamp
- repo or project identity
- provider and model metadata
- estimated cost and token totals
- top waste or behavior signals
- artifact paths or artifact hashes
- short natural-language summary
- optional tags and labels

With that contract in place, the backend can be replaced without changing the core Token Receipt analysis layer.

### Plausible local-first options

Depending on the eventual product shape, several backend classes could fit:

- plain files plus SQLite FTS metadata index: likely the simplest local-first option and the easiest to debug
- MCP-friendly knowledge store such as Agent Library: useful when the main goal is agent retrieval over archived summaries and artifacts
- local vector or hybrid search store such as Chroma or LanceDB: useful when semantic retrieval matters more than agent-native document workflows
- graph-oriented memory system such as Graphiti or Zep: potentially useful later if the product needs temporal relationships and entity-level workflow history

The likely order of operations should be:

1. start with the simplest durable archive contract
2. prove the retrieval use cases
3. keep the backend replaceable
4. only adopt a heavier memory system if the query patterns justify it

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
