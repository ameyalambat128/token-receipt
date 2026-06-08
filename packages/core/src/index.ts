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
  const receipt = buildReceipt(totals.apiEquivalentCostUsd, totals, topSignals);

  return {
    generatedAt: new Date().toISOString(),
    options,
    providerNames: uniqueProviders(sessions),
    totals,
    sessions: options.anonymize
      ? sessions.map((session) => ({
          ...session,
          projectPath: anonymizePath(session.projectPath),
          projectName: anonymizeProject(session.projectName),
        }))
      : sessions,
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
    .filter((session): session is ParsedSession => session !== null)
    .filter((session) => applyFilters(session, options));
}

function parseClaudeSessions(options: CliOptions) {
  return detectClaudeFiles()
    .map((file) => parseClaudeFile(file))
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

function buildReceipt(
  apiEquivalentCostUsd: number,
  totals: Analysis["totals"],
  topSignals: WasteSignal[],
): Receipt {
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
  };
}

function buildShareCopy(receipt: Receipt) {
  const topWaste = receipt.lines.find((line) => line.kind === "waste");

  return {
    x: [
      `I spent $${formatUsd(receipt.totalUsd)} of imaginary agent money this month.`,
      topWaste ? `Biggest line item: ${topWaste.label}.` : null,
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
      "Token Receipt turns local Codex and Claude Code logs into a satirical receipt, a thermal-paper PNG, and share-ready copy.",
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

function uniqueProviders(sessions: ParsedSession[]) {
  return [...new Set(sessions.map((session) => session.provider))];
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

function buildDemoAnalysis(options: CliOptions): Analysis {
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
