import { basename, isAbsolute, join } from "node:path";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";

export type Provider = "claude" | "codex";

export type CliOptions = {
  provider: Provider | "all";
  since: string;
  outDir: string;
  project?: string;
  anonymize: boolean;
  seed?: string;
};

export type WasteSignal = {
  label: string;
  detail: string;
  score: number;
};

export type PromptExcerpt = {
  text: string;
  normalized: string;
  wordCount: number;
  timestamp: string | null;
};

export type PromptCandidate = {
  text: string;
  normalized: string;
  count: number;
  sessionKeys: string[];
};

export type CrypticPromptCandidate = {
  text: string;
  normalized: string;
  score: number;
  reason: string;
  sessionKey: string;
};

export type BehaviorLabel = {
  label: string;
  reason: string;
};

export type ParsedSession = {
  provider: Provider;
  sourceFile: string;
  sessionKey: string;
  projectPath: string;
  projectName: string;
  startedAt: string | null;
  endedAt: string | null;
  model: string;
  inputTokens: number;
  cachedInputTokens: number;
  cacheCreation5mTokens: number;
  cacheCreation1hTokens: number;
  outputTokens: number;
  reasoningTokens: number;
  apiEquivalentCostUsd: number;
  functionCalls: number;
  toolSearchCalls: number;
  readCalls: number;
  shellCalls: number;
  subagentCalls: number;
  repeatedReadCalls: number;
  repeatedShellCalls: number;
  planningMessages: number;
  editsObserved: number;
  durationMinutes: number;
  promptCount: number;
  avgPromptWords: number;
  planningRate: number;
  repeatedPromptCount: number;
  courseCorrectionCount: number;
  isLongestSessionCandidate: boolean;
  promptExcerpts: PromptExcerpt[];
  repeatedPrompts: PromptCandidate[];
  courseCorrectionPrompts: PromptExcerpt[];
  wasteSignals: WasteSignal[];
};

export type BehaviorSession = {
  sessionKey: string;
  provider: Provider;
  projectName: string;
  startedAt: string | null;
  endedAt: string | null;
  durationMinutes: number;
  promptCount: number;
  avgPromptWords: number;
  planningRate: number;
  repeatedPromptCount: number;
  repeatedReadCalls: number;
  repeatedShellCalls: number;
  courseCorrectionCount: number;
  editsObserved: number;
  isLongestSessionCandidate: boolean;
};

export type BehaviorAggregates = {
  totalTimeMinutes: number;
  longestSessionMinutes: number;
  promptsPerSessionAverage: number;
  promptWordsAverage: number;
  planModeSessionRate: number;
  courseCorrectionRate: number;
  repeatedPromptRate: number;
  talkativenessBand: BehaviorLabel;
  workStyleCandidate: BehaviorLabel;
  builderArchetypeCandidate: BehaviorLabel;
};

export type BehaviorAnalysis = {
  summary: {
    totalTimeMinutes: number;
    longestSessionMinutes: number;
    promptsPerSessionAverage: number;
    promptWordsAverage: number;
    planModeSessionRate: number;
    talkativenessBand: BehaviorLabel;
    workStyleCandidate: BehaviorLabel;
    builderArchetypeCandidate: BehaviorLabel;
  };
  sessions: BehaviorSession[];
  aggregates: BehaviorAggregates;
};

export type PromptPatterns = {
  repeatedPromptCandidates: PromptCandidate[];
  goToPromptCandidates: PromptCandidate[];
  crypticPromptCandidates: CrypticPromptCandidate[];
  courseCorrections: PromptExcerpt[];
};

export type SessionEvidence = {
  sessionKey: string;
  provider: Provider;
  projectName: string;
  promptExcerpts: PromptExcerpt[];
  courseCorrections: PromptExcerpt[];
  repeatedPrompts: PromptCandidate[];
};

export type Evidence = {
  sessions: SessionEvidence[];
};

export type ReceiptLineItem = {
  label: string;
  amountUsd: number;
  detail: string;
  kind: "summary" | "waste";
};

export type Receipt = {
  title: string;
  subtitle: string;
  providerNames: string[];
  totalUsd: number;
  budgetedUsd: number;
  avoidableUsd: number;
  usefulUsd: number;
  percentile: number;
  lines: ReceiptLineItem[];
  footer: string;
  disclaimer: string;
};

export type Analysis = {
  generatedAt: string;
  options: CliOptions;
  providerNames: string[];
  totals: {
    sessions: number;
    inputTokens: number;
    cachedInputTokens: number;
    cacheCreation5mTokens: number;
    cacheCreation1hTokens: number;
    outputTokens: number;
    reasoningTokens: number;
    apiEquivalentCostUsd: number;
  };
  sessions: ParsedSession[];
  behavior: BehaviorAnalysis;
  promptPatterns: PromptPatterns;
  evidence: Evidence;
  topSignals: WasteSignal[];
  receipt: Receipt;
  share: {
    x: string;
    linkedin: string;
  };
};

type CodexLine = {
  timestamp?: string;
  type?: string;
  payload?: Record<string, unknown>;
};

type ClaudeLine = {
  timestamp?: string;
  type?: string;
  cwd?: string;
  requestId?: string;
  message?: {
    model?: string;
    id?: string;
    role?: string;
    content?: unknown;
    usage?: {
      input_tokens?: number;
      cache_read_input_tokens?: number;
      cache_creation_input_tokens?: number;
      output_tokens?: number;
      cache_creation?: {
        ephemeral_5m_input_tokens?: number;
        ephemeral_1h_input_tokens?: number;
      };
    };
  };
};

type SignalAccumulator = {
  repeatedReads: number;
  repeatedShells: number;
  toolTourism: number;
  subagents: number;
  planning: number;
  context: number;
  idle: number;
};

type PromptSample = PromptExcerpt & {
  isCourseCorrection: boolean;
  crypticScore: number;
  crypticReason: string | null;
};

type BuildSessionInput = {
  provider: Provider;
  sourceFile: string;
  sessionKey: string;
  projectPath: string;
  projectName: string;
  startedAt: string | null;
  endedAt: string | null;
  model: string;
  inputTokens: number;
  cachedInputTokens: number;
  cacheCreation5mTokens: number;
  cacheCreation1hTokens: number;
  outputTokens: number;
  reasoningTokens: number;
  apiEquivalentCostUsd: number;
  functionCalls: number;
  toolSearchCalls: number;
  readCalls: number;
  shellCalls: number;
  subagentCalls: number;
  repeatedReadCalls: number;
  repeatedShellCalls: number;
  planningMessages: number;
  editsObserved: number;
  userPrompts: PromptSample[];
};

type ParsedSessionInternal = ParsedSession & {
  userPrompts: PromptSample[];
};

const codexRates = {
  input: 1.25,
  cachedInput: 0.125,
  output: 10,
};

const claudeRateCards = [
  {
    match: /opus-4-8|opus 4\.8|opus/i,
    input: 5,
    cacheRead: 0.5,
    cacheWrite5m: 6.25,
    cacheWrite1h: 10,
    output: 25,
  },
  {
    match: /sonnet-4|sonnet/i,
    input: 3,
    cacheRead: 0.3,
    cacheWrite5m: 3.75,
    cacheWrite1h: 6,
    output: 15,
  },
  {
    match: /haiku/i,
    input: 0.8,
    cacheRead: 0.08,
    cacheWrite5m: 1,
    cacheWrite1h: 1.6,
    output: 4,
  },
];

const fallbackClaudeRateCard = {
  match: /fallback/,
  input: 3,
  cacheRead: 0.3,
  cacheWrite5m: 3.75,
  cacheWrite1h: 6,
  output: 15,
};

const promptExcerptLimit = 3;
const promptCandidateLimit = 5;
const promptTextLimit = 160;

export function defaultOptions(): CliOptions {
  const baseCwd = process.env.INIT_CWD ?? process.cwd();

  return {
    provider: "all",
    since: "30d",
    outDir: join(baseCwd, "token-receipt-output"),
    anonymize: true,
  };
}

export function ensureDir(path: string) {
  mkdirSync(path, { recursive: true });
}

export function parseArgs(argv: string[]) {
  const options: CliOptions = defaultOptions();
  const baseCwd = process.env.INIT_CWD ?? process.cwd();
  const [command = "generate", ...rest] = argv;

  for (let index = 0; index < rest.length; index += 1) {
    const flag = rest[index];
    const next = rest[index + 1];

    if (flag === "--provider" && next) {
      if (next === "claude" || next === "codex" || next === "all") {
        options.provider = next;
      }
      index += 1;
      continue;
    }

    if (flag === "--since" && next) {
      options.since = next;
      index += 1;
      continue;
    }

    if (flag === "--out" && next) {
      options.outDir = isAbsolute(next) ? next : join(baseCwd, next);
      index += 1;
      continue;
    }

    if (flag === "--project" && next) {
      options.project = next;
      index += 1;
      continue;
    }

    if (flag === "--seed" && next) {
      options.seed = next;
      index += 1;
      continue;
    }

    if (flag === "--no-anonymize") {
      options.anonymize = false;
    }
  }

  return { command, options };
}

export function analyzeLogs(options: CliOptions) {
  if (options.seed === "demo") {
    return buildDemoAnalysis(options);
  }

  const sessions = [
    ...(options.provider === "all" || options.provider === "codex"
      ? parseCodexSessions(options)
      : []),
    ...(options.provider === "all" || options.provider === "claude"
      ? parseClaudeSessions(options)
      : []),
  ].sort((left, right) =>
    (left.endedAt ?? "").localeCompare(right.endedAt ?? ""),
  );

  if (!sessions.length) {
    throw new Error(
      "No supported session logs were found for the requested filters. Run `bun run -F token-receipt doctor` to inspect the detected paths.",
    );
  }

  const totals = sessions.reduce(
    (aggregate, session) => ({
      sessions: aggregate.sessions + 1,
      inputTokens: aggregate.inputTokens + session.inputTokens,
      cachedInputTokens:
        aggregate.cachedInputTokens + session.cachedInputTokens,
      cacheCreation5mTokens:
        aggregate.cacheCreation5mTokens + session.cacheCreation5mTokens,
      cacheCreation1hTokens:
        aggregate.cacheCreation1hTokens + session.cacheCreation1hTokens,
      outputTokens: aggregate.outputTokens + session.outputTokens,
      reasoningTokens: aggregate.reasoningTokens + session.reasoningTokens,
      apiEquivalentCostUsd:
        aggregate.apiEquivalentCostUsd + session.apiEquivalentCostUsd,
    }),
    {
      sessions: 0,
      inputTokens: 0,
      cachedInputTokens: 0,
      cacheCreation5mTokens: 0,
      cacheCreation1hTokens: 0,
      outputTokens: 0,
      reasoningTokens: 0,
      apiEquivalentCostUsd: 0,
    },
  );

  const longestSessionMinutes = Math.max(
    0,
    ...sessions.map((session) => session.durationMinutes),
  );

  const sessionsWithLongest: ParsedSessionInternal[] = sessions.map(
    (session) => ({
      ...session,
      isLongestSessionCandidate:
        session.durationMinutes > 0 &&
        session.durationMinutes === longestSessionMinutes,
    }),
  );

  const signalRollup = sessionsWithLongest.reduce(
    (aggregate, session) => {
      const contextRatio =
        session.cachedInputTokens /
        Math.max(1, session.inputTokens - session.cachedInputTokens);

      return {
        repeatedReads: aggregate.repeatedReads + session.repeatedReadCalls,
        repeatedShells: aggregate.repeatedShells + session.repeatedShellCalls,
        toolTourism:
          aggregate.toolTourism +
          session.toolSearchCalls +
          Math.max(0, session.functionCalls - 3),
        subagents: aggregate.subagents + session.subagentCalls * 2,
        planning:
          aggregate.planning +
          Math.max(0, session.planningMessages - session.functionCalls),
        context: aggregate.context + Math.floor(contextRatio * 3),
        idle:
          aggregate.idle +
          (session.editsObserved === 0 && session.outputTokens < 800 ? 2 : 0),
      };
    },
    {
      repeatedReads: 0,
      repeatedShells: 0,
      toolTourism: 0,
      subagents: 0,
      planning: 0,
      context: 0,
      idle: 0,
    } satisfies SignalAccumulator,
  );

  const { behavior, promptPatterns, evidence } = buildBehaviorArtifacts(
    sessionsWithLongest,
    options.anonymize,
  );
  const topSignals = buildTopSignals(signalRollup);
  const receipt = buildReceipt(totals.apiEquivalentCostUsd, totals, topSignals);

  const publicSessions = sessionsWithLongest.map((session) =>
    toPublicSession(session, options.anonymize),
  );

  return {
    generatedAt: new Date().toISOString(),
    options,
    providerNames: uniqueProviders(sessionsWithLongest),
    totals,
    sessions: publicSessions,
    behavior,
    promptPatterns,
    evidence,
    topSignals,
    receipt,
    share: buildShareCopy(receipt, behavior),
  } satisfies Analysis;
}

export function writeAnalysis(analysis: Analysis, outDir: string) {
  ensureDir(outDir);
  ensureDir(join(outDir, "share"));
  writeFileSync(
    join(outDir, "analysis.json"),
    JSON.stringify(analysis, null, 2),
  );
  writeFileSync(
    join(outDir, "receipt.json"),
    JSON.stringify(analysis.receipt, null, 2),
  );
  writeFileSync(join(outDir, "share", "x.txt"), `${analysis.share.x}\n`);
  writeFileSync(
    join(outDir, "share", "linkedin.txt"),
    `${analysis.share.linkedin}\n`,
  );
}

export function doctor(options: CliOptions) {
  const codexFiles = detectCodexFiles();
  const claudeFiles = detectClaudeFiles();

  return {
    provider: options.provider,
    codex: {
      detected: codexFiles.length > 0,
      path: join(homeDir(), ".codex", "sessions"),
      files: codexFiles.slice(-3),
    },
    claude: {
      detected: claudeFiles.length > 0,
      path: join(homeDir(), ".claude", "projects"),
      files: claudeFiles.slice(-3),
    },
  };
}

function parseCodexSessions(options: CliOptions) {
  return detectCodexFiles()
    .map((file) => parseCodexFile(file))
    .filter((session): session is ParsedSessionInternal => session !== null)
    .filter((session) => applyFilters(session, options));
}

function parseClaudeSessions(options: CliOptions) {
  return detectClaudeFiles()
    .map((file) => parseClaudeFile(file))
    .filter((session): session is ParsedSessionInternal => session !== null)
    .filter((session) => applyFilters(session, options));
}

function parseCodexFile(file: string): ParsedSessionInternal | null {
  const lines = readJsonLines<CodexLine>(file);

  if (!lines.length) return null;

  let latestTotals = {
    inputTokens: 0,
    cachedInputTokens: 0,
    outputTokens: 0,
    reasoningTokens: 0,
  };
  let model = "gpt-5-codex";
  let projectPath = "";
  const readTargets = new Set<string>();
  const readCalls: string[] = [];
  const shellCommands = new Set<string>();
  const shellCalls: string[] = [];
  let functionCalls = 0;
  let toolSearchCalls = 0;
  let planningMessages = 0;
  let editsObserved = 0;
  let startedAt: string | null = null;
  let endedAt: string | null = null;
  const userPrompts: PromptSample[] = [];

  for (const line of lines) {
    if (line.timestamp && !startedAt) startedAt = line.timestamp;
    if (line.timestamp) endedAt = line.timestamp;

    if (line.type === "turn_context") {
      const payload = line.payload as { cwd?: string } | undefined;
      if (payload?.cwd) projectPath = payload.cwd;
    }

    const payloadType = String(line.payload?.type ?? "");

    if (payloadType === "token_count") {
      const info = line.payload?.info as
        | {
            total_token_usage?: {
              input_tokens?: number;
              cached_input_tokens?: number;
              output_tokens?: number;
              reasoning_output_tokens?: number;
            };
          }
        | undefined;
      if (info?.total_token_usage) {
        latestTotals = {
          inputTokens:
            info.total_token_usage.input_tokens ?? latestTotals.inputTokens,
          cachedInputTokens:
            info.total_token_usage.cached_input_tokens ??
            latestTotals.cachedInputTokens,
          outputTokens:
            info.total_token_usage.output_tokens ?? latestTotals.outputTokens,
          reasoningTokens:
            info.total_token_usage.reasoning_output_tokens ??
            latestTotals.reasoningTokens,
        };
      }
    }

    if (payloadType === "reasoning" || payloadType === "agent_message") {
      planningMessages += 1;
    }

    if (payloadType === "tool_search_call") {
      toolSearchCalls += 1;
    }

    if (payloadType === "message") {
      const messageRole = String(line.payload?.role ?? "");
      if (messageRole === "user") {
        const prompt = extractCodexPrompt(line.payload);
        if (prompt) {
          userPrompts.push(buildPromptSample(prompt, line.timestamp ?? null));
        }
      }
    }

    if (payloadType === "function_call") {
      functionCalls += 1;
      const name = String(line.payload?.name ?? "");
      const args = String(line.payload?.arguments ?? "");

      if (/read|open/i.test(name)) {
        readCalls.push(args);
        readTargets.add(args);
      }

      if (/exec|bash|command/i.test(name)) {
        shellCalls.push(args);
        shellCommands.add(args);
      }

      if (/apply_patch|write/i.test(name)) {
        editsObserved += 1;
      }
    }
  }

  const project = projectPath || file;
  const apiEquivalentCostUsd =
    perMillion(
      latestTotals.inputTokens - latestTotals.cachedInputTokens,
      codexRates.input,
    ) +
    perMillion(latestTotals.cachedInputTokens, codexRates.cachedInput) +
    perMillion(
      latestTotals.outputTokens + latestTotals.reasoningTokens,
      codexRates.output,
    );

  return buildParsedSession({
    provider: "codex",
    sourceFile: file,
    sessionKey: buildSessionKey("codex", file),
    projectPath: project,
    projectName: basename(project),
    startedAt,
    endedAt,
    model,
    inputTokens: latestTotals.inputTokens,
    cachedInputTokens: latestTotals.cachedInputTokens,
    cacheCreation5mTokens: 0,
    cacheCreation1hTokens: 0,
    outputTokens: latestTotals.outputTokens,
    reasoningTokens: latestTotals.reasoningTokens,
    apiEquivalentCostUsd,
    functionCalls,
    toolSearchCalls,
    readCalls: readCalls.length,
    shellCalls: shellCalls.length,
    subagentCalls: 0,
    repeatedReadCalls: Math.max(0, readCalls.length - readTargets.size),
    repeatedShellCalls: Math.max(0, shellCalls.length - shellCommands.size),
    planningMessages,
    editsObserved,
    userPrompts,
  });
}

function parseClaudeFile(file: string): ParsedSessionInternal | null {
  const lines = readJsonLines<ClaudeLine>(file);

  if (!lines.length) return null;

  const seenUsage = new Set<string>();
  const readTargets = new Set<string>();
  const readCalls: string[] = [];
  const shellCommands = new Set<string>();
  const shellCalls: string[] = [];
  let model = "claude-opus-4-8";
  let projectPath = "";
  let startedAt: string | null = null;
  let endedAt: string | null = null;
  let inputTokens = 0;
  let cachedInputTokens = 0;
  let cacheCreation5mTokens = 0;
  let cacheCreation1hTokens = 0;
  let outputTokens = 0;
  let functionCalls = 0;
  let subagentCalls = 0;
  let planningMessages = 0;
  let editsObserved = 0;
  const userPrompts: PromptSample[] = [];

  for (const line of lines) {
    if (line.timestamp && !startedAt) startedAt = line.timestamp;
    if (line.timestamp) endedAt = line.timestamp;
    if (line.cwd) projectPath = line.cwd;
    if (line.message?.model) model = line.message.model;

    if (line.type === "file-history-snapshot") {
      editsObserved += 1;
    }

    if (line.type === "user") {
      const prompt = extractClaudePrompt(line.message?.content);
      if (prompt) {
        userPrompts.push(buildPromptSample(prompt, line.timestamp ?? null));
      }
    }

    if (line.type === "assistant" && line.message?.usage) {
      const usageKey =
        line.requestId ?? line.message.id ?? line.timestamp ?? file;
      if (!seenUsage.has(usageKey)) {
        seenUsage.add(usageKey);
        inputTokens += line.message.usage.input_tokens ?? 0;
        cachedInputTokens += line.message.usage.cache_read_input_tokens ?? 0;
        cacheCreation5mTokens +=
          line.message.usage.cache_creation?.ephemeral_5m_input_tokens ??
          line.message.usage.cache_creation_input_tokens ??
          0;
        cacheCreation1hTokens +=
          line.message.usage.cache_creation?.ephemeral_1h_input_tokens ?? 0;
        outputTokens += line.message.usage.output_tokens ?? 0;
      }

      const content = asArray(line.message.content);
      let sawTool = false;
      for (const item of content) {
        if (item?.type !== "tool_use") continue;
        sawTool = true;
        functionCalls += 1;
        const name = String(item.name ?? "");
        const input = JSON.stringify(item.input ?? {});

        if (name === "Agent") {
          subagentCalls += 1;
        }

        if (/read/i.test(name)) {
          readCalls.push(input);
          readTargets.add(input);
        }

        if (/bash/i.test(name)) {
          shellCalls.push(input);
          shellCommands.add(input);
        }
      }

      if (!sawTool) {
        planningMessages += 1;
      }
    }
  }

  const rateCard =
    claudeRateCards.find((card) => card.match.test(model)) ??
    fallbackClaudeRateCard;

  const apiEquivalentCostUsd =
    perMillion(inputTokens, rateCard.input) +
    perMillion(cachedInputTokens, rateCard.cacheRead) +
    perMillion(cacheCreation5mTokens, rateCard.cacheWrite5m) +
    perMillion(cacheCreation1hTokens, rateCard.cacheWrite1h) +
    perMillion(outputTokens, rateCard.output);

  const project = projectPath || file;

  return buildParsedSession({
    provider: "claude",
    sourceFile: file,
    sessionKey: buildSessionKey("claude", file),
    projectPath: project,
    projectName: basename(project),
    startedAt,
    endedAt,
    model,
    inputTokens,
    cachedInputTokens,
    cacheCreation5mTokens,
    cacheCreation1hTokens,
    outputTokens,
    reasoningTokens: 0,
    apiEquivalentCostUsd,
    functionCalls,
    toolSearchCalls: 0,
    readCalls: readCalls.length,
    shellCalls: shellCalls.length,
    subagentCalls,
    repeatedReadCalls: Math.max(0, readCalls.length - readTargets.size),
    repeatedShellCalls: Math.max(0, shellCalls.length - shellCommands.size),
    planningMessages,
    editsObserved,
    userPrompts,
  });
}

function buildParsedSession(base: BuildSessionInput): ParsedSessionInternal {
  const durationMinutes = minutesBetween(base.startedAt, base.endedAt);
  const promptCount = base.userPrompts.length;
  const avgPromptWords = average(
    base.userPrompts.map((prompt) => prompt.wordCount).filter(Boolean),
  );
  const planningRate =
    base.planningMessages /
      Math.max(1, base.planningMessages + base.functionCalls) || 0;
  const repeatedPrompts = buildPromptCandidates(
    base.userPrompts,
    base.sessionKey,
  ).filter((candidate) => candidate.count > 1);
  const repeatedPromptCount = repeatedPrompts.reduce(
    (sum, candidate) => sum + candidate.count - 1,
    0,
  );
  const courseCorrectionPrompts = base.userPrompts
    .filter((prompt) => prompt.isCourseCorrection)
    .slice(0, promptExcerptLimit)
    .map(toPromptExcerpt);

  const session = {
    ...base,
    durationMinutes,
    promptCount,
    avgPromptWords: roundMetric(avgPromptWords),
    planningRate: roundMetric(planningRate),
    repeatedPromptCount,
    courseCorrectionCount: base.userPrompts.filter(
      (prompt) => prompt.isCourseCorrection,
    ).length,
    isLongestSessionCandidate: false,
    promptExcerpts: base.userPrompts
      .slice(0, promptExcerptLimit)
      .map(toPromptExcerpt),
    repeatedPrompts: repeatedPrompts.slice(0, promptExcerptLimit),
    courseCorrectionPrompts,
    wasteSignals: [] as WasteSignal[],
  };

  session.wasteSignals = deriveWasteSignals(session);
  return session;
}

function deriveWasteSignals(session: ParsedSessionInternal) {
  const signals: WasteSignal[] = [];
  const cacheRatio =
    session.cachedInputTokens /
    Math.max(1, session.inputTokens - session.cachedInputTokens);

  if (session.repeatedPromptCount > 0) {
    signals.push({
      label: "Reusing the same prompt like a lucky charm",
      detail: `${session.repeatedPromptCount} repeated prompts showed up in this session.`,
      score: session.repeatedPromptCount * 2,
    });
  }

  if (session.repeatedReadCalls > 0) {
    signals.push({
      label: "Reading the same file again for vibes",
      detail: `${session.repeatedReadCalls} repeated reads were detected.`,
      score: session.repeatedReadCalls * 3,
    });
  }

  if (session.repeatedShellCalls > 0) {
    signals.push({
      label: "Running the same command again for confidence",
      detail: `${session.repeatedShellCalls} repeated shell loops were detected.`,
      score: session.repeatedShellCalls * 4,
    });
  }

  if (session.toolSearchCalls > 0 || session.functionCalls > 6) {
    signals.push({
      label: "MCP tool tourism",
      detail: `${session.functionCalls} tool calls and ${session.toolSearchCalls} searches turned up in this session.`,
      score:
        session.toolSearchCalls * 2 + Math.max(0, session.functionCalls - 4),
    });
  }

  if (session.subagentCalls > 0) {
    signals.push({
      label: "Subagent middle management",
      detail: `${session.subagentCalls} delegated detours made an appearance.`,
      score: session.subagentCalls * 5,
    });
  }

  if (session.courseCorrectionCount > 0) {
    signals.push({
      label: "Changing course mid-flight",
      detail: `${session.courseCorrectionCount} course-correction prompts were detected.`,
      score: session.courseCorrectionCount * 2,
    });
  }

  if (session.planningMessages > session.functionCalls) {
    signals.push({
      label: "Explaining the plan instead of coding",
      detail: `${session.planningMessages} planning beats landed before the work settled down.`,
      score: session.planningMessages - session.functionCalls + 2,
    });
  }

  if (cacheRatio > 2.5) {
    signals.push({
      label: "Context window emotional support",
      detail: `Cached context outweighed fresh input by ${cacheRatio.toFixed(1)}x.`,
      score: Math.floor(cacheRatio * 3),
    });
  }

  if (session.editsObserved === 0 && session.outputTokens < 800) {
    signals.push({
      label: "A session that mostly believed in itself",
      detail: "Low-output session with no observed edits.",
      score: 3,
    });
  }

  return signals.sort((left, right) => right.score - left.score);
}

function buildTopSignals(accumulator: SignalAccumulator) {
  return [
    {
      label: "Reading the same file again for vibes",
      detail: `${accumulator.repeatedReads} repeated reads crossed the line from caution into ritual.`,
      score: accumulator.repeatedReads,
    },
    {
      label: "Running the same command again for confidence",
      detail: `${accumulator.repeatedShells} repeated shell loops were detected.`,
      score: accumulator.repeatedShells,
    },
    {
      label: "MCP tool tourism",
      detail: `${accumulator.toolTourism} tool detours padded the trip.`,
      score: accumulator.toolTourism,
    },
    {
      label: "Subagent middle management",
      detail: `${accumulator.subagents} delegation points showed up in the logs.`,
      score: accumulator.subagents,
    },
    {
      label: "Explaining the plan instead of coding",
      detail: `${accumulator.planning} planning-heavy moments were detected.`,
      score: accumulator.planning,
    },
    {
      label: "Context window emotional support",
      detail: `${accumulator.context} context-heavy signals were found.`,
      score: accumulator.context,
    },
    {
      label: "A session that mostly believed in itself",
      detail: `${accumulator.idle} low-output idle bursts were observed.`,
      score: accumulator.idle,
    },
  ]
    .filter((signal) => signal.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, 5);
}

function buildBehaviorArtifacts(
  sessions: ParsedSessionInternal[],
  anonymize: boolean,
) {
  const totalTimeMinutes = roundMetric(
    sessions.reduce((sum, session) => sum + session.durationMinutes, 0),
  );
  const longestSessionMinutes = roundMetric(
    Math.max(0, ...sessions.map((session) => session.durationMinutes)),
  );
  const totalPromptCount = sessions.reduce(
    (sum, session) => sum + session.promptCount,
    0,
  );
  const totalCourseCorrections = sessions.reduce(
    (sum, session) => sum + session.courseCorrectionCount,
    0,
  );
  const totalRepeatedPrompts = sessions.reduce(
    (sum, session) => sum + session.repeatedPromptCount,
    0,
  );
  const promptsPerSessionAverage = roundMetric(
    totalPromptCount / Math.max(1, sessions.length),
  );
  const promptWordsAverage = roundMetric(
    average(
      sessions
        .flatMap((session) => session.userPrompts)
        .map((prompt) => prompt.wordCount),
    ),
  );
  const planModeSessionRate = roundMetric(
    sessions.filter((session) => session.planningRate >= 0.5).length /
      Math.max(1, sessions.length),
  );
  const courseCorrectionRate = roundMetric(
    totalCourseCorrections / Math.max(1, totalPromptCount),
  );
  const repeatedPromptRate = roundMetric(
    totalRepeatedPrompts / Math.max(1, totalPromptCount),
  );

  const talkativenessBand = buildTalkativenessBand({
    promptsPerSessionAverage,
    promptWordsAverage,
  });
  const workStyleCandidate = buildWorkStyleCandidate({
    sessions,
    promptsPerSessionAverage,
    planModeSessionRate,
    courseCorrectionRate,
  });
  const builderArchetypeCandidate = buildBuilderArchetypeCandidate(sessions);

  const behaviorSessions = sessions.map((session) => {
    const next = {
      sessionKey: session.sessionKey,
      provider: session.provider,
      projectName: anonymize
        ? anonymizeProject(session.projectName)
        : session.projectName,
      startedAt: session.startedAt,
      endedAt: session.endedAt,
      durationMinutes: session.durationMinutes,
      promptCount: session.promptCount,
      avgPromptWords: session.avgPromptWords,
      planningRate: session.planningRate,
      repeatedPromptCount: session.repeatedPromptCount,
      repeatedReadCalls: session.repeatedReadCalls,
      repeatedShellCalls: session.repeatedShellCalls,
      courseCorrectionCount: session.courseCorrectionCount,
      editsObserved: session.editsObserved,
      isLongestSessionCandidate: session.isLongestSessionCandidate,
    } satisfies BehaviorSession;

    return next;
  });

  const aggregates = {
    totalTimeMinutes,
    longestSessionMinutes,
    promptsPerSessionAverage,
    promptWordsAverage,
    planModeSessionRate,
    courseCorrectionRate,
    repeatedPromptRate,
    talkativenessBand,
    workStyleCandidate,
    builderArchetypeCandidate,
  } satisfies BehaviorAggregates;

  const behavior = {
    summary: {
      totalTimeMinutes,
      longestSessionMinutes,
      promptsPerSessionAverage,
      promptWordsAverage,
      planModeSessionRate,
      talkativenessBand,
      workStyleCandidate,
      builderArchetypeCandidate,
    },
    sessions: behaviorSessions,
    aggregates,
  } satisfies BehaviorAnalysis;

  const allPrompts = sessions.flatMap((session) =>
    session.userPrompts.map((prompt) => ({
      ...prompt,
      sessionKey: session.sessionKey,
    })),
  );

  const repeatedPromptCandidates = buildPromptCandidates(allPrompts)
    .filter((candidate) => candidate.count > 1)
    .slice(0, promptCandidateLimit);

  const courseCorrections = allPrompts
    .filter((prompt) => prompt.isCourseCorrection)
    .slice(0, promptCandidateLimit)
    .map(toPromptExcerpt);

  const crypticPromptCandidates = allPrompts
    .filter((prompt) => prompt.crypticReason && prompt.crypticScore >= 4)
    .sort((left, right) => right.crypticScore - left.crypticScore)
    .slice(0, promptCandidateLimit)
    .map((prompt) => ({
      text: prompt.text,
      normalized: prompt.normalized,
      score: prompt.crypticScore,
      reason: prompt.crypticReason ?? "Short and underspecified.",
      sessionKey: prompt.sessionKey,
    }));

  const promptPatterns = {
    repeatedPromptCandidates,
    goToPromptCandidates: repeatedPromptCandidates.slice(
      0,
      promptCandidateLimit,
    ),
    crypticPromptCandidates,
    courseCorrections,
  } satisfies PromptPatterns;

  const evidenceSessions = sessions.map((session) => ({
    sessionKey: session.sessionKey,
    provider: session.provider,
    projectName: anonymize
      ? anonymizeProject(session.projectName)
      : session.projectName,
    promptExcerpts: session.promptExcerpts,
    courseCorrections: session.courseCorrectionPrompts,
    repeatedPrompts: session.repeatedPrompts,
  }));

  const evidence = {
    sessions: evidenceSessions,
  } satisfies Evidence;

  return { behavior, promptPatterns, evidence };
}

function buildReceipt(
  apiEquivalentCostUsd: number,
  totals: Analysis["totals"],
  topSignals: WasteSignal[],
) {
  const exaggerationFactor =
    8 +
    Math.min(
      12,
      totals.cachedInputTokens / Math.max(1, totals.inputTokens) +
        topSignals.reduce((sum, signal) => sum + signal.score, 0) / 12,
    );
  const totalUsd = roundCurrency(
    Math.max(48, apiEquivalentCostUsd * exaggerationFactor),
  );
  const usefulUsd = roundCurrency(Math.max(12, totalUsd * 0.18));
  const budgetedUsd = roundCurrency(totalUsd * 0.2);
  const wastePool = Math.max(0, totalUsd - usefulUsd);
  const rawScore = topSignals.reduce((sum, signal) => sum + signal.score, 0);
  const lines = topSignals.length
    ? topSignals.map((signal) => ({
        label: signal.label,
        detail: signal.detail,
        amountUsd: roundCurrency(
          (wastePool * signal.score) / Math.max(1, rawScore),
        ),
        kind: "waste" as const,
      }))
    : [];
  const avoidableUsd = roundCurrency(
    lines.reduce((sum, line) => sum + line.amountUsd, 0),
  );
  const percentile = Math.min(
    99,
    Math.max(
      68,
      Math.floor(60 + Math.log10(Math.max(10, totals.outputTokens)) * 9),
    ),
  );

  return {
    title: "Your monthly AI bill",
    subtitle: "officially itemized",
    providerNames: [],
    totalUsd,
    budgetedUsd,
    avoidableUsd,
    usefulUsd,
    percentile,
    lines: [
      {
        label: "Actual useful LLM work",
        amountUsd: usefulUsd,
        detail: `${totals.sessions} sessions did eventually produce something.`,
        kind: "summary",
      },
      ...lines,
    ],
    footer: "Thank you for your tokens.",
    disclaimer: "satirical estimate based on local agent logs",
  } satisfies Receipt;
}

function buildShareCopy(receipt: Receipt, behavior: BehaviorAnalysis) {
  const topWaste = receipt.lines.find((line) => line.kind === "waste");
  const workStyle = behavior.summary.workStyleCandidate.label;
  const longestSession = behavior.summary.longestSessionMinutes;

  return {
    x: [
      `I spent $${formatUsd(receipt.totalUsd)} of imaginary agent money this month.`,
      topWaste ? `Biggest line item: ${topWaste.label}.` : null,
      `Apparently my work style is ${workStyle}.`,
      longestSession
        ? `Longest session: ${Math.round(longestSession)} minutes.`
        : null,
      "Generated from my local Codex and Claude Code logs.",
      "satirical estimate based on local agent logs",
    ]
      .filter(Boolean)
      .join("\n"),
    linkedin: [
      `This month my coding-agent bill came out to $${formatUsd(receipt.totalUsd)} in completely unserious but annoyingly plausible expenses.`,
      topWaste
        ? `The biggest offender was ${topWaste.label.toLowerCase()}.`
        : null,
      `The local behavior pass tagged my work style as ${workStyle}.`,
      "Token Receipt turns local Codex and Claude Code logs into a satirical receipt, a thermal-paper PNG, structured behavior facts, and share-ready copy.",
      "satirical estimate based on local agent logs",
    ]
      .filter(Boolean)
      .join("\n\n"),
  };
}

function detectCodexFiles() {
  return walkJsonl(join(homeDir(), ".codex", "sessions"));
}

function detectClaudeFiles() {
  return walkJsonl(join(homeDir(), ".claude", "projects")).filter(
    (file) => !file.includes("/subagents/"),
  );
}

function walkJsonl(root: string) {
  if (!existsSync(root)) return [];
  const matches: string[] = [];

  const visit = (current: string) => {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const fullPath = join(current, entry.name);
      if (entry.isDirectory()) {
        visit(fullPath);
        continue;
      }
      if (entry.isFile() && fullPath.endsWith(".jsonl")) {
        matches.push(fullPath);
      }
    }
  };

  visit(root);
  return matches.sort();
}

function readJsonLines<T>(file: string) {
  return readFileSync(file, "utf8")
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      try {
        return JSON.parse(line) as T;
      } catch {
        return null;
      }
    })
    .filter((line): line is T => line !== null);
}

function uniqueProviders(sessions: ParsedSessionInternal[]) {
  return [...new Set(sessions.map((session) => session.provider))];
}

function applyFilters(session: ParsedSessionInternal, options: CliOptions) {
  if (options.project) {
    const haystack =
      `${session.projectPath} ${session.projectName}`.toLowerCase();
    if (!haystack.includes(options.project.toLowerCase())) {
      return false;
    }
  }

  const sinceDate = parseSince(options.since);
  const endedAt = session.endedAt
    ? new Date(session.endedAt)
    : new Date(statSync(session.sourceFile).mtimeMs);
  return endedAt >= sinceDate;
}

function parseSince(input: string) {
  const match = /^(\d+)([dhw])$/.exec(input.trim());
  if (!match) return new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const value = Number(match[1]);
  const unit = match[2];
  const multiplier =
    unit === "h"
      ? 60 * 60 * 1000
      : unit === "w"
        ? 7 * 24 * 60 * 60 * 1000
        : 24 * 60 * 60 * 1000;
  return new Date(Date.now() - value * multiplier);
}

function perMillion(tokens: number, rate: number) {
  return (Math.max(0, tokens) / 1_000_000) * rate;
}

function roundCurrency(value: number) {
  return Math.round(value * 100) / 100;
}

function roundMetric(value: number) {
  return Math.round(value * 100) / 100;
}

function formatUsd(value: number) {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function anonymizePath(input: string) {
  return input.replace(homeDir(), "~");
}

function anonymizeProject(input: string) {
  if (!input) return "project";
  if (input.length <= 3) return "***";
  return `${input.slice(0, 1)}${"*".repeat(Math.max(3, input.length - 2))}${input.slice(-1)}`;
}

function homeDir() {
  return process.env.HOME ?? process.env.USERPROFILE ?? "";
}

function buildSessionKey(provider: Provider, file: string) {
  return `${provider}:${basename(file, ".jsonl")}`;
}

function minutesBetween(startedAt: string | null, endedAt: string | null) {
  if (!startedAt || !endedAt) return 0;
  const start = new Date(startedAt).getTime();
  const end = new Date(endedAt).getTime();
  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return 0;
  return roundMetric((end - start) / (60 * 1000));
}

function average(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function collapseWhitespace(input: string) {
  return input.replace(/\s+/g, " ").trim();
}

function sanitizePromptText(input: string) {
  return truncateText(
    collapseWhitespace(anonymizePath(input)),
    promptTextLimit,
  );
}

function normalizePromptText(input: string) {
  return sanitizePromptText(input).toLowerCase();
}

function truncateText(input: string, maxLength: number) {
  if (input.length <= maxLength) return input;
  return `${input.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}

function countWords(input: string) {
  const normalized = collapseWhitespace(input);
  if (!normalized) return 0;
  return normalized.split(" ").length;
}

function isBoilerplatePrompt(input: string) {
  const text = collapseWhitespace(input);
  if (!text) return true;
  if (text.startsWith("# AGENTS.md instructions for ")) return true;
  if (text.startsWith("<environment_context>")) return true;
  if (/^<INSTRUCTIONS>/.test(text)) return true;
  if (/^(clear|reset)$/i.test(text)) return true;
  return false;
}

function extractCodexPrompt(
  payload: Record<string, unknown> | undefined,
): string | null {
  if (!payload) return null;
  const content = asArray(payload.content);
  const text = content
    .filter((item) => item?.type === "input_text")
    .map((item) => String(item.text ?? ""))
    .join("\n");
  const normalized = collapseWhitespace(text);
  if (!normalized || isBoilerplatePrompt(normalized)) return null;
  return normalized;
}

function extractClaudePrompt(content: unknown) {
  if (typeof content === "string") {
    const normalized = collapseWhitespace(content);
    return normalized && !isBoilerplatePrompt(normalized) ? normalized : null;
  }

  const text = asArray(content)
    .filter((item) => item?.type === "text")
    .map((item) => String(item.text ?? item.content ?? ""))
    .join("\n");
  const normalized = collapseWhitespace(text);
  if (!normalized || isBoilerplatePrompt(normalized)) return null;
  return normalized;
}

function buildPromptSample(text: string, timestamp: string | null) {
  const visible = sanitizePromptText(text);
  const cryptic = classifyCrypticPrompt(visible);
  return {
    text: visible,
    normalized: normalizePromptText(visible),
    wordCount: countWords(visible),
    timestamp,
    isCourseCorrection: looksLikeCourseCorrection(visible),
    crypticScore: cryptic.score,
    crypticReason: cryptic.reason,
  } satisfies PromptSample;
}

function buildPromptCandidates(
  prompts: Array<PromptSample | (PromptSample & { sessionKey: string })>,
  fallbackSessionKey?: string,
) {
  const groups = new Map<
    string,
    { text: string; count: number; sessionKeys: Set<string> }
  >();

  for (const prompt of prompts) {
    if (!prompt.normalized) continue;
    const current = groups.get(prompt.normalized) ?? {
      text: prompt.text,
      count: 0,
      sessionKeys: new Set<string>(),
    };
    current.count += 1;
    if ("sessionKey" in prompt) {
      current.sessionKeys.add(prompt.sessionKey);
    } else if (fallbackSessionKey) {
      current.sessionKeys.add(fallbackSessionKey);
    }
    groups.set(prompt.normalized, current);
  }

  return [...groups.entries()]
    .map(([normalized, value]) => ({
      text: value.text,
      normalized,
      count: value.count,
      sessionKeys: [...value.sessionKeys],
    }))
    .sort((left, right) =>
      right.count === left.count
        ? left.text.localeCompare(right.text)
        : right.count - left.count,
    );
}

function looksLikeCourseCorrection(input: string) {
  const text = input.toLowerCase();
  if (countWords(text) < 3) return false;
  return [
    /\bactually\b/,
    /\binstead\b/,
    /\brather than\b/,
    /\bfocus on\b/,
    /\bonly\b/,
    /\bkeep it\b/,
    /\bno[, ]/,
    /\bdon't\b/,
    /\bdo not\b/,
    /\bwait\b/,
    /\bscratch that\b/,
    /\bchange\b/,
    /\bnarrow\b/,
    /\bscope\b/,
    /\bjust\b.*\b(need|want|do|fix)\b/,
  ].some((pattern) => pattern.test(text));
}

function classifyCrypticPrompt(input: string) {
  const text = input.toLowerCase();
  const wordCount = countWords(text);
  let score = 0;
  let reason: string | null = null;

  if (wordCount <= 3) {
    score += 4;
    reason ??= "Very short prompt with little explicit scope.";
  } else if (wordCount <= 6) {
    score += 2;
    reason ??= "Short prompt with limited context.";
  }

  if (text.length <= 24) {
    score += 2;
    reason ??= "Compact prompt that leaves room for interpretation.";
  }

  if (
    /\b(check|fix|ship|review|do it|all of it|make it better|handle it|look into it)\b/.test(
      text,
    )
  ) {
    score += 3;
    reason = "Vague imperative without much detail.";
  }

  return { score, reason };
}

function buildTalkativenessBand({
  promptsPerSessionAverage,
  promptWordsAverage,
}: {
  promptsPerSessionAverage: number;
  promptWordsAverage: number;
}) {
  if (promptsPerSessionAverage >= 14 || promptWordsAverage >= 60) {
    return {
      label: "verbose",
      reason:
        "You send a high volume of prompts or longer-than-average prompt text.",
    } satisfies BehaviorLabel;
  }

  if (promptsPerSessionAverage <= 6 && promptWordsAverage <= 25) {
    return {
      label: "concise",
      reason:
        "Your prompts tend to be short and you do not overtalk the agent.",
    } satisfies BehaviorLabel;
  }

  return {
    label: "conversational",
    reason: "Your prompt volume and prompt length land in a middle band.",
  } satisfies BehaviorLabel;
}

function buildWorkStyleCandidate({
  sessions,
  promptsPerSessionAverage,
  planModeSessionRate,
  courseCorrectionRate,
}: {
  sessions: ParsedSessionInternal[];
  promptsPerSessionAverage: number;
  planModeSessionRate: number;
  courseCorrectionRate: number;
}) {
  const totalSubagents = sessions.reduce(
    (sum, session) => sum + session.subagentCalls,
    0,
  );
  const totalEdits = sessions.reduce(
    (sum, session) => sum + session.editsObserved,
    0,
  );

  if (courseCorrectionRate >= 0.18 || promptsPerSessionAverage >= 12) {
    return {
      label: "back-and-forth",
      reason:
        "You steer actively mid-session and keep the conversation moving turn by turn.",
    } satisfies BehaviorLabel;
  }

  if (planModeSessionRate >= 0.5) {
    return {
      label: "planner",
      reason:
        "A large share of your sessions spend more time planning than firing tools immediately.",
    } satisfies BehaviorLabel;
  }

  if (totalSubagents >= Math.max(3, sessions.length)) {
    return {
      label: "delegator",
      reason:
        "You regularly offload work to subagents instead of carrying every step directly.",
    } satisfies BehaviorLabel;
  }

  if (promptsPerSessionAverage <= 6 && totalEdits >= sessions.length) {
    return {
      label: "sprinter",
      reason: "You tend to keep prompting light and move quickly into edits.",
    } satisfies BehaviorLabel;
  }

  return {
    label: "steady driver",
    reason:
      "Your sessions balance prompting, tool use, and edits without a single dominant pattern.",
  } satisfies BehaviorLabel;
}

function buildBuilderArchetypeCandidate(sessions: ParsedSessionInternal[]) {
  const uniqueProjects = new Set(sessions.map((session) => session.projectName))
    .size;
  const totalReads = sessions.reduce(
    (sum, session) => sum + session.readCalls,
    0,
  );
  const totalShells = sessions.reduce(
    (sum, session) => sum + session.shellCalls,
    0,
  );
  const totalFunctions = sessions.reduce(
    (sum, session) => sum + session.functionCalls,
    0,
  );
  const totalToolSearch = sessions.reduce(
    (sum, session) => sum + session.toolSearchCalls,
    0,
  );

  if (uniqueProjects >= 3) {
    return {
      label: "generalist",
      reason:
        "Your sessions span multiple project surfaces instead of clustering tightly around one lane.",
    } satisfies BehaviorLabel;
  }

  if (totalReads >= Math.max(12, totalShells * 1.5)) {
    return {
      label: "investigator",
      reason:
        "You spend more of the session budget reading and inspecting than shelling or delegating.",
    } satisfies BehaviorLabel;
  }

  if (totalShells >= Math.max(12, totalReads * 1.2)) {
    return {
      label: "operator",
      reason:
        "Your sessions lean heavily on command execution and terminal-driven progress.",
    } satisfies BehaviorLabel;
  }

  if (
    totalFunctions >= sessions.length * 8 ||
    totalToolSearch >= sessions.length
  ) {
    return {
      label: "orchestrator",
      reason:
        "You use the agent like a control plane, with lots of tool turns and coordination steps.",
    } satisfies BehaviorLabel;
  }

  return {
    label: "builder",
    reason:
      "Your sessions are centered on making direct progress without one extreme behavioral skew.",
  } satisfies BehaviorLabel;
}

function toPromptExcerpt(prompt: PromptSample) {
  return {
    text: prompt.text,
    normalized: prompt.normalized,
    wordCount: prompt.wordCount,
    timestamp: prompt.timestamp,
  } satisfies PromptExcerpt;
}

function toPublicSession(session: ParsedSessionInternal, anonymize: boolean) {
  const { userPrompts: _userPrompts, ...rest } = session;
  return {
    ...rest,
    projectPath: anonymize ? anonymizePath(rest.projectPath) : rest.projectPath,
    projectName: anonymize
      ? anonymizeProject(rest.projectName)
      : rest.projectName,
  } satisfies ParsedSession;
}

function asArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter(
        (item): item is Record<string, unknown> =>
          typeof item === "object" && item !== null,
      )
    : [];
}

function buildDemoAnalysis(options: CliOptions) {
  const receipt = buildReceipt(
    17.42,
    {
      sessions: 12,
      inputTokens: 1_285_000,
      cachedInputTokens: 942_000,
      cacheCreation5mTokens: 28_000,
      cacheCreation1hTokens: 0,
      outputTokens: 44_000,
      reasoningTokens: 6_200,
      apiEquivalentCostUsd: 17.42,
    },
    [
      {
        label: "Context window emotional support",
        detail: "Cached context outweighed fresh input by 5.4x.",
        score: 22,
      },
      {
        label: "Subagent middle management",
        detail: "Seven delegated detours made an appearance.",
        score: 14,
      },
      {
        label: "MCP tool tourism",
        detail: "Tool hopping padded the trip.",
        score: 9,
      },
      {
        label: "Running the same command again for confidence",
        detail: "Shell loops happened three extra times.",
        score: 7,
      },
    ],
  );

  const behavior = {
    summary: {
      totalTimeMinutes: 304,
      longestSessionMinutes: 108,
      promptsPerSessionAverage: 11.7,
      promptWordsAverage: 43.5,
      planModeSessionRate: 0.42,
      talkativenessBand: {
        label: "conversational",
        reason: "Prompt volume and prompt length sit in a middle band.",
      },
      workStyleCandidate: {
        label: "back-and-forth",
        reason: "You steer actively and revisit direction mid-session.",
      },
      builderArchetypeCandidate: {
        label: "generalist",
        reason: "The sample activity spans multiple project surfaces.",
      },
    },
    sessions: [],
    aggregates: {
      totalTimeMinutes: 304,
      longestSessionMinutes: 108,
      promptsPerSessionAverage: 11.7,
      promptWordsAverage: 43.5,
      planModeSessionRate: 0.42,
      courseCorrectionRate: 0.14,
      repeatedPromptRate: 0.08,
      talkativenessBand: {
        label: "conversational",
        reason: "Prompt volume and prompt length sit in a middle band.",
      },
      workStyleCandidate: {
        label: "back-and-forth",
        reason: "You steer actively and revisit direction mid-session.",
      },
      builderArchetypeCandidate: {
        label: "generalist",
        reason: "The sample activity spans multiple project surfaces.",
      },
    },
  } satisfies BehaviorAnalysis;

  return {
    generatedAt: new Date().toISOString(),
    options,
    providerNames: ["codex", "claude"],
    totals: {
      sessions: 12,
      inputTokens: 1_285_000,
      cachedInputTokens: 942_000,
      cacheCreation5mTokens: 28_000,
      cacheCreation1hTokens: 0,
      outputTokens: 44_000,
      reasoningTokens: 6_200,
      apiEquivalentCostUsd: 17.42,
    },
    sessions: [],
    behavior,
    promptPatterns: {
      repeatedPromptCandidates: [
        {
          text: "check all of it",
          normalized: "check all of it",
          count: 3,
          sessionKeys: ["demo:session-1", "demo:session-4"],
        },
      ],
      goToPromptCandidates: [
        {
          text: "check all of it",
          normalized: "check all of it",
          count: 3,
          sessionKeys: ["demo:session-1", "demo:session-4"],
        },
      ],
      crypticPromptCandidates: [
        {
          text: "check all of it",
          normalized: "check all of it",
          score: 7,
          reason: "Vague imperative without much detail.",
          sessionKey: "demo:session-4",
        },
      ],
      courseCorrections: [
        {
          text: "actually just fix the landing page first",
          normalized: "actually just fix the landing page first",
          wordCount: 7,
          timestamp: new Date().toISOString(),
        },
      ],
    },
    evidence: {
      sessions: [
        {
          sessionKey: "demo:session-4",
          provider: "codex",
          projectName: "w****p-am",
          promptExcerpts: [
            {
              text: "check all of it",
              normalized: "check all of it",
              wordCount: 4,
              timestamp: new Date().toISOString(),
            },
          ],
          courseCorrections: [
            {
              text: "actually just fix the landing page first",
              normalized: "actually just fix the landing page first",
              wordCount: 7,
              timestamp: new Date().toISOString(),
            },
          ],
          repeatedPrompts: [
            {
              text: "check all of it",
              normalized: "check all of it",
              count: 3,
              sessionKeys: ["demo:session-1", "demo:session-4"],
            },
          ],
        },
      ],
    },
    topSignals: receipt.lines
      .filter((line) => line.kind === "waste")
      .map((line, index) => ({
        label: line.label,
        detail: line.detail,
        score: 20 - index * 3,
      })),
    receipt,
    share: buildShareCopy(receipt, behavior),
  } satisfies Analysis;
}
