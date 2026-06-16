import { execFileSync } from "node:child_process";
import { basename, isAbsolute, join } from "node:path";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";

export type Provider = "claude" | "codex" | "kiro";

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

export type ParsedSession = {
  provider: Provider;
  sourceFile: string;
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
  creditsUsed: number;
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
  wasteSignals: WasteSignal[];
};

export type ReceiptLineItem = {
  label: string;
  amountUsd: number;
  detail: string;
  kind: "summary" | "waste";
};

export type ReceiptDisplayRow = {
  label: string;
  value: string;
};

export type ReceiptActivity = {
  title: string;
  periodLabel: string;
  startLabel: string;
  endLabel: string;
  columns: number[][];
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
  display: {
    orderLabel: string;
    generatedDate: string;
    providerLabel: string;
    stats: ReceiptDisplayRow[];
    details: ReceiptDisplayRow[];
    activity: ReceiptActivity;
    note: string;
    footerLink: string;
  };
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
    creditsUsed: number;
    apiEquivalentCostUsd: number;
  };
  sessions: ParsedSession[];
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
    content?: Array<Record<string, unknown>>;
  };
};

type KiroSessionRow = {
  conversationId: string;
  projectPath: string;
  createdAtMs: number;
  updatedAtMs: number;
  payload: KiroSessionPayload;
};

type KiroSessionPayload = {
  user_turn_metadata?: {
    usage_info?: Array<{
      unit?: string;
      value?: number;
    }>;
  };
  history?: KiroHistoryEntry[];
};

type KiroHistoryEntry = {
  user?: {
    env_context?: {
      env_state?: {
        current_working_directory?: string;
      };
    };
  };
  assistant?: {
    ToolUse?: {
      content?: string;
      tool_uses?: Array<{
        name?: string;
        args?: Record<string, unknown>;
      }>;
    };
    TextResponse?: {
      content?: string;
    };
    Response?: {
      content?: string;
    };
  };
  request_metadata?: {
    model_id?: string;
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

const kiroCreditRateUsd = 0.04;

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

export function parseArgs(argv: string[]): {
  command: string;
  options: CliOptions;
} {
  const options = defaultOptions();
  const baseCwd = process.env.INIT_CWD ?? process.cwd();
  const [command = "generate", ...rest] = argv;

  for (let index = 0; index < rest.length; index += 1) {
    const flag = rest[index];
    const next = rest[index + 1];

    if (flag === "--provider" && next) {
      if (
        next === "claude" ||
        next === "codex" ||
        next === "kiro" ||
        next === "all"
      ) {
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

export function analyzeLogs(options: CliOptions): Analysis {
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
    ...(options.provider === "all" || options.provider === "kiro"
      ? parseKiroSessions(options)
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
      creditsUsed: aggregate.creditsUsed + session.creditsUsed,
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
      creditsUsed: 0,
      apiEquivalentCostUsd: 0,
    },
  );

  const signalRollup = sessions.reduce<SignalAccumulator>(
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
    },
  );

  const topSignals = buildTopSignals(signalRollup);
  const generatedAt = new Date().toISOString();
  const providerNames = uniqueProviders(sessions);
  const filteredSessions = options.anonymize
    ? sessions.map((session) => ({
        ...session,
        projectPath: anonymizePath(session.projectPath),
        projectName: anonymizeProject(session.projectName),
      }))
    : sessions;
  const receipt = buildReceipt({
    apiEquivalentCostUsd: totals.apiEquivalentCostUsd,
    generatedAt,
    options,
    providerNames,
    sessions: filteredSessions,
    topSignals,
    totals,
  });

  return {
    generatedAt,
    options,
    providerNames,
    totals,
    sessions: filteredSessions,
    topSignals,
    receipt,
    share: buildShareCopy(receipt),
  };
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
  const kiroSessions = detectKiroSessionRows();
  const kiroDb = getKiroDbPath();

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
    kiro: {
      detected: kiroSessions.length > 0,
      path: kiroDb,
      sqlite3Available: canUseSqlite3(),
      sessions: kiroSessions.slice(0, 3).map((session) => ({
        conversationId: session.conversationId,
        projectPath: session.projectPath,
      })),
    },
  };
}

function parseCodexSessions(options: CliOptions) {
  return detectCodexFiles()
    .map((file) => parseCodexFile(file))
    .filter((session): session is ParsedSession => session !== null)
    .filter((session) => applyFilters(session, options));
}

function parseClaudeSessions(options: CliOptions) {
  return detectClaudeFiles()
    .map((file) => parseClaudeFile(file))
    .filter((session): session is ParsedSession => session !== null)
    .filter((session) => applyFilters(session, options));
}

function parseKiroSessions(options: CliOptions) {
  return detectKiroSessionRows()
    .map((row) => parseKiroRow(row))
    .filter((session): session is ParsedSession => session !== null)
    .filter((session) => applyFilters(session, options));
}

function parseCodexFile(file: string): ParsedSession | null {
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

    if (payloadType === "function_call") {
      functionCalls += 1;
      const name = String(line.payload?.name ?? "");
      const args = String(line.payload?.arguments ?? "");
      model = model;

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

  const session: ParsedSession = {
    provider: "codex",
    sourceFile: file,
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
    creditsUsed: 0,
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
    wasteSignals: [],
  };

  session.wasteSignals = deriveWasteSignals(session);
  return session;
}

function parseClaudeFile(file: string): ParsedSession | null {
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

  for (const line of lines) {
    if (line.timestamp && !startedAt) startedAt = line.timestamp;
    if (line.timestamp) endedAt = line.timestamp;
    if (line.cwd) projectPath = line.cwd;
    if (line.message?.model) model = line.message.model;

    if (line.type === "file-history-snapshot") {
      editsObserved += 1;
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

      const content = line.message.content ?? [];
      let sawTool = false;
      for (const item of content) {
        if (item.type !== "tool_use") continue;
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
  const session: ParsedSession = {
    provider: "claude",
    sourceFile: file,
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
    creditsUsed: 0,
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
    wasteSignals: [],
  };

  session.wasteSignals = deriveWasteSignals(session);
  return session;
}

function parseKiroRow(row: KiroSessionRow): ParsedSession | null {
  const history = row.payload.history ?? [];
  const readTargets = new Set<string>();
  const readCalls: string[] = [];
  const shellCommands = new Set<string>();
  const shellCalls: string[] = [];
  let model = "kiro-auto";
  let projectPath = row.projectPath;
  let functionCalls = 0;
  let subagentCalls = 0;
  let planningMessages = 0;
  let editsObserved = 0;

  for (const entry of history) {
    const cwd =
      entry.user?.env_context?.env_state?.current_working_directory?.trim() ??
      "";
    if (!projectPath && cwd) {
      projectPath = cwd;
    }

    const nextModel = entry.request_metadata?.model_id?.trim();
    if (nextModel) {
      model = nextModel;
    }

    const assistant = entry.assistant;
    if (!assistant) continue;

    const toolUse = assistant.ToolUse;
    if (toolUse?.tool_uses?.length) {
      for (const tool of toolUse.tool_uses) {
        functionCalls += 1;
        const name = String(tool.name ?? "");
        const args = tool.args ?? {};

        if (isKiroReadTool(name)) {
          const target = normalizeKiroReadTarget(args);
          readCalls.push(target);
          readTargets.add(target);
        }

        if (isKiroShellTool(name)) {
          const command = normalizeKiroShellCommand(args);
          shellCalls.push(command);
          shellCommands.add(command);
        }

        if (isKiroSubagentTool(name)) {
          subagentCalls += 1;
        }

        if (isKiroEditTool(name)) {
          editsObserved += 1;
        }
      }
      continue;
    }

    const text =
      assistant.TextResponse?.content?.trim() ??
      assistant.Response?.content?.trim() ??
      "";
    if (text) {
      planningMessages += 1;
    }
  }

  const creditsUsed = extractKiroCredits(row.payload);
  const session: ParsedSession = {
    provider: "kiro",
    sourceFile: getKiroDbPath(),
    projectPath: projectPath || row.conversationId,
    projectName: basename(projectPath || row.conversationId),
    startedAt: formatKiroTimestamp(row.createdAtMs),
    endedAt: formatKiroTimestamp(row.updatedAtMs),
    model,
    inputTokens: 0,
    cachedInputTokens: 0,
    cacheCreation5mTokens: 0,
    cacheCreation1hTokens: 0,
    outputTokens: 0,
    reasoningTokens: 0,
    creditsUsed,
    apiEquivalentCostUsd: creditsUsed * kiroCreditRateUsd,
    functionCalls,
    toolSearchCalls: 0,
    readCalls: readCalls.length,
    shellCalls: shellCalls.length,
    subagentCalls,
    repeatedReadCalls: Math.max(0, readCalls.length - readTargets.size),
    repeatedShellCalls: Math.max(0, shellCalls.length - shellCommands.size),
    planningMessages,
    editsObserved,
    wasteSignals: [],
  };

  session.wasteSignals = deriveWasteSignals(session);
  return session;
}

function deriveWasteSignals(session: ParsedSession) {
  const signals: WasteSignal[] = [];
  const cacheRatio =
    session.cachedInputTokens /
    Math.max(1, session.inputTokens - session.cachedInputTokens);

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

function buildReceipt({
  apiEquivalentCostUsd,
  generatedAt,
  options,
  providerNames,
  sessions,
  topSignals,
  totals,
}: {
  apiEquivalentCostUsd: number;
  generatedAt: string;
  options: CliOptions;
  providerNames: string[];
  sessions: ParsedSession[];
  topSignals: WasteSignal[];
  totals: Analysis["totals"];
}): Receipt {
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
  const providerLabel = providerNames
    .map((provider) => provider.toUpperCase())
    .join(" + ");
  const orderLabel = buildReceiptOrderLabel({
    options,
    sessions,
    totals,
    apiEquivalentCostUsd,
  });

  return {
    title: "Your monthly AI bill",
    subtitle: "officially itemized",
    providerNames,
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
    display: {
      orderLabel,
      generatedDate: formatReceiptDate(generatedAt),
      providerLabel,
      stats: [
        {
          label: "Sessions",
          value: formatCount(totals.sessions),
        },
        {
          label: "Tool calls",
          value: formatCount(sumSessionMetric(sessions, "functionCalls")),
        },
        {
          label: "Tokens burned",
          value: formatCompactCount(
            totals.inputTokens +
              totals.cachedInputTokens +
              totals.outputTokens +
              totals.cacheCreation1hTokens +
              totals.cacheCreation5mTokens,
          ),
        },
        {
          label: "Peak spiral",
          value: buildPeakSpiralLabel(sessions),
        },
      ],
      details: [
        {
          label: "CARD",
          value: `**** **** **** ${String(new Date(generatedAt).getUTCFullYear()).slice(-4)}`,
        },
        {
          label: "AUTH CODE",
          value: buildReceiptAuthCode(totals),
        },
        {
          label: "AVOIDABLE WASTE",
          value: `$${formatUsd(avoidableUsd)}`,
        },
        {
          label: "USEFUL WORK",
          value: `$${formatUsd(usefulUsd)}`,
        },
      ],
      activity: buildReceiptActivity(generatedAt, options.since, sessions),
      note: "generated from local agent logs",
      footerLink: "skills.sh/ameyalambat128/token-receipt",
    },
  };
}

function buildShareCopy(receipt: Receipt) {
  const topWaste = receipt.lines.find((line) => line.kind === "waste");

  return {
    x: [
      `I spent $${formatUsd(receipt.totalUsd)} of imaginary agent money this month.`,
      topWaste ? `Biggest line item: ${topWaste.label}.` : null,
      "Generated from my local Codex, Claude Code, and Kiro CLI logs.",
      "satirical estimate based on local agent logs",
    ]
      .filter((line): line is string => Boolean(line))
      .join("\n"),
    linkedin: [
      `This month my coding-agent bill came out to $${formatUsd(receipt.totalUsd)} in completely unserious but annoyingly plausible expenses.`,
      topWaste
        ? `The biggest offender was ${topWaste.label.toLowerCase()}.`
        : null,
      "Token Receipt turns local Codex, Claude Code, and Kiro CLI logs into a satirical receipt, a thermal-paper PNG, and share-ready copy.",
      "satirical estimate based on local agent logs",
    ]
      .filter((line): line is string => Boolean(line))
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

function detectKiroSessionRows() {
  const dbPath = getKiroDbPath();
  if (!existsSync(dbPath)) return [];

  const rows = runSqlite3Query(
    dbPath,
    "SELECT conversation_id, key, created_at, updated_at, hex(value) FROM conversations_v2 ORDER BY updated_at DESC",
  );

  return rows
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const [conversationId, projectPath = "", createdAt, updatedAt, hex = ""] =
        line.split("\t");
      const payload = parseKiroPayload(hex);

      if (!conversationId || !payload) {
        return null;
      }

      return {
        conversationId,
        projectPath,
        createdAtMs: Number(createdAt) || 0,
        updatedAtMs: Number(updatedAt) || 0,
        payload,
      } satisfies KiroSessionRow;
    })
    .filter((row): row is KiroSessionRow => row !== null);
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

function runSqlite3Query(dbPath: string, query: string) {
  try {
    return execFileSync("sqlite3", ["-separator", "\t", dbPath, query], {
      encoding: "utf8",
    }).trim();
  } catch (error) {
    if (
      existsSync(dbPath) &&
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "ENOENT"
    ) {
      throw new Error(
        `Kiro CLI sessions were found at ${dbPath}, but the \`sqlite3\` CLI is not installed. Install \`sqlite3\` to analyze Kiro sessions.`,
      );
    }
    throw error;
  }
}

function uniqueProviders(sessions: ParsedSession[]) {
  return [
    ...new Set(sessions.map((session) => session.provider)),
  ] as Provider[];
}

function applyFilters(session: ParsedSession, options: CliOptions) {
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

function formatUsd(value: number) {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatCount(value: number) {
  return value.toLocaleString("en-US", {
    maximumFractionDigits: 0,
  });
}

function formatCompactCount(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(value);
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

function getKiroDbPath() {
  return (
    process.env.TOKEN_RECEIPT_KIRO_DB_PATH ??
    join(
      homeDir(),
      "Library",
      "Application Support",
      "kiro-cli",
      "data.sqlite3",
    )
  );
}

function canUseSqlite3() {
  try {
    execFileSync("sqlite3", ["-version"], { encoding: "utf8" });
    return true;
  } catch {
    return false;
  }
}

function parseKiroPayload(hex: string) {
  if (!hex) return null;

  try {
    return JSON.parse(
      Buffer.from(hex, "hex").toString("utf8"),
    ) as KiroSessionPayload;
  } catch {
    return null;
  }
}

function extractKiroCredits(payload: KiroSessionPayload) {
  return (payload.user_turn_metadata?.usage_info ?? []).reduce((sum, item) => {
    if (item.unit !== "credit") return sum;
    return sum + (item.value ?? 0);
  }, 0);
}

function formatKiroTimestamp(value: number) {
  if (!value) return null;
  return new Date(value).toISOString();
}

function isKiroReadTool(name: string) {
  return /^(read|open)$/i.test(name);
}

function isKiroShellTool(name: string) {
  return /^(bash|command|exec)$/i.test(name);
}

function isKiroSubagentTool(name: string) {
  return /^(task|spawn|agent)$/i.test(name);
}

function isKiroEditTool(name: string) {
  return /^(write|edit|multiedit)$/i.test(name);
}

function normalizeKiroReadTarget(args: Record<string, unknown>) {
  return (
    firstKiroString(args, [
      "path",
      "file_path",
      "filePath",
      "target_file",
      "target",
      "uri",
    ]) ?? stableStringify(args)
  );
}

function normalizeKiroShellCommand(args: Record<string, unknown>) {
  return (
    firstKiroString(args, ["command", "cmd", "script", "input"]) ??
    stableStringify(args)
  );
}

function firstKiroString(
  args: Record<string, unknown>,
  keys: string[],
): string | null {
  for (const key of keys) {
    const value = args[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return null;
}

function stableStringify(input: unknown): string {
  if (Array.isArray(input)) {
    return `[${input.map((item) => stableStringify(item)).join(",")}]`;
  }

  if (input && typeof input === "object") {
    return `{${Object.entries(input as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, value]) => `${JSON.stringify(key)}:${stableStringify(value)}`)
      .join(",")}}`;
  }

  return JSON.stringify(input);
}

function buildDemoAnalysis(options: CliOptions): Analysis {
  const generatedAt = new Date().toISOString();
  const providerNames = ["codex", "claude"];
  const totals = {
    sessions: 12,
    inputTokens: 1_285_000,
    cachedInputTokens: 942_000,
    cacheCreation5mTokens: 28_000,
    cacheCreation1hTokens: 0,
    outputTokens: 44_000,
    reasoningTokens: 6_200,
    creditsUsed: 0,
    apiEquivalentCostUsd: 17.42,
  };
  const topSignals = [
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
  ];
  const receipt = buildReceipt({
    apiEquivalentCostUsd: 17.42,
    generatedAt,
    options,
    providerNames,
    sessions: [],
    topSignals,
    totals,
  });

  return {
    generatedAt,
    options,
    providerNames,
    totals,
    sessions: [],
    topSignals: receipt.lines
      .filter((line) => line.kind === "waste")
      .map((line, index) => ({
        label: line.label,
        detail: line.detail,
        score: 20 - index * 3,
      })),
    receipt,
    share: buildShareCopy(receipt),
  };
}

function sumSessionMetric(
  sessions: ParsedSession[],
  key: "functionCalls" | "outputTokens",
) {
  return sessions.reduce((sum, session) => sum + session[key], 0);
}

function buildReceiptOrderLabel({
  options,
  sessions,
  totals,
  apiEquivalentCostUsd,
}: {
  options: CliOptions;
  sessions: ParsedSession[];
  totals: Analysis["totals"];
  apiEquivalentCostUsd: number;
}) {
  const raw = Math.round(
    apiEquivalentCostUsd * 100 +
      totals.sessions * 17 +
      sumSessionMetric(sessions, "functionCalls"),
  );
  const orderNumber = String(Math.abs(raw % 10_000)).padStart(4, "0");
  const scope =
    options.project?.toUpperCase() ??
    (sessions.length === 1
      ? sessions[0]?.projectName.toUpperCase()
      : "ALL PROJECTS");

  return `ORDER #${orderNumber} FOR ${scope}`;
}

function formatReceiptDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })
    .format(new Date(value))
    .toUpperCase();
}

function buildPeakSpiralLabel(sessions: ParsedSession[]) {
  const peakSession = [...sessions].sort(
    (left, right) => right.apiEquivalentCostUsd - left.apiEquivalentCostUsd,
  )[0];

  if (!peakSession?.endedAt) return "N/A";

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(peakSession.endedAt));
}

function buildReceiptAuthCode(totals: Analysis["totals"]) {
  return String(
    Math.abs(
      Math.round(
        totals.outputTokens + totals.reasoningTokens + totals.sessions * 13,
      ) % 1_000_000,
    ),
  ).padStart(6, "0");
}

function buildReceiptActivity(
  generatedAt: string,
  since: string,
  sessions: ParsedSession[],
): ReceiptActivity {
  const days = parseSinceDays(since) ?? 30;
  const end = new Date(generatedAt);
  const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);
  const span = Math.max(1, end.getTime() - start.getTime());
  const columns = Array.from({ length: 16 }, () => Array(7).fill(0));

  if (!sessions.length) {
    return {
      title: "Got Helped",
      periodLabel: formatPeriodLabel(since),
      startLabel: formatMonthLabel(start),
      endLabel: formatMonthLabel(end),
      columns: columns.map((column, columnIndex) =>
        column.map((_, rowIndex) =>
          Math.min(
            4,
            Math.max(
              0,
              Math.round(
                2 + Math.sin((columnIndex + 1) * 0.65 + rowIndex * 0.85) * 1.7,
              ),
            ),
          ),
        ),
      ),
    };
  }

  sessions.forEach((session) => {
    if (!session.endedAt) return;

    const date = new Date(session.endedAt);
    const time = date.getTime();

    if (Number.isNaN(time)) return;

    const columnIndex = Math.min(
      15,
      Math.max(0, Math.floor(((time - start.getTime()) / span) * 16)),
    );
    const rowIndex = date.getDay();
    const intensity = Math.min(
      4,
      1 +
        Math.floor(
          Math.log10(
            Math.max(10, session.functionCalls + session.outputTokens / 1500),
          ),
        ),
    );

    const column = columns[columnIndex];

    if (!column) return;

    column[rowIndex] = Math.min(4, (column[rowIndex] ?? 0) + intensity);
  });

  return {
    title: "Got Helped",
    periodLabel: formatPeriodLabel(since),
    startLabel: formatMonthLabel(start),
    endLabel: formatMonthLabel(end),
    columns,
  };
}

function parseSinceDays(since: string) {
  const dayMatch = since.match(/^(\d+)d$/i);
  const weekMatch = since.match(/^(\d+)w$/i);

  if (dayMatch) return Number(dayMatch[1]);
  if (weekMatch) return Number(weekMatch[1]) * 7;

  return null;
}

function formatPeriodLabel(since: string) {
  const dayMatch = since.match(/^(\d+)d$/i);
  const weekMatch = since.match(/^(\d+)w$/i);
  const hourMatch = since.match(/^(\d+)h$/i);

  if (dayMatch) {
    const days = Number(dayMatch[1]);
    return `LAST ${days} DAY${days === 1 ? "" : "S"}`;
  }

  if (weekMatch) {
    const weeks = Number(weekMatch[1]);
    return `LAST ${weeks} WEEK${weeks === 1 ? "" : "S"}`;
  }

  if (hourMatch) {
    const hours = Number(hourMatch[1]);
    return `LAST ${hours} HOUR${hours === 1 ? "" : "S"}`;
  }

  return since.toUpperCase();
}

function formatMonthLabel(value: Date) {
  return new Intl.DateTimeFormat("en-US", { month: "short" })
    .format(value)
    .toUpperCase();
}
