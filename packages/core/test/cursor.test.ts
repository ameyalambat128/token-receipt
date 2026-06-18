import { describe, expect, test } from "bun:test";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { analyzeLogs, defaultOptions, doctor } from "../src/index";

describe("Cursor support", () => {
  test("parses Cursor traces, groups by composer, and skips DB-only workspaces", () => {
    const tempHome = mkdtempSync(join(tmpdir(), "token-receipt-cursor-"));
    const alphaProject = "/Users/cursor/project-alpha";
    const betaProject = "/Users/cursor/project-beta";

    try {
      writeCursorWorkspace(tempHome, {
        workspaceId: "workspace-alpha",
        projectPath: alphaProject,
        generations: [
          {
            generationUUID: "cursor-req-1",
            textDescription: "inspect project alpha",
            type: "composer",
            unixMs: Date.parse("2026-06-18T00:15:10.000Z"),
          },
          {
            generationUUID: "cursor-req-2",
            textDescription: "think more",
            type: "composer",
            unixMs: Date.parse("2026-06-18T00:15:20.000Z"),
          },
        ],
        composerIds: ["composer-alpha"],
      });
      writeCursorWorkspace(tempHome, {
        workspaceId: "workspace-beta",
        projectPath: betaProject,
        generations: [
          {
            generationUUID: "cursor-req-db-only",
            textDescription: "no usable trace",
            type: "composer",
            unixMs: Date.parse("2026-06-18T00:15:40.000Z"),
          },
        ],
        composerIds: ["composer-beta"],
      });
      writeCursorTrace(tempHome, [
        traceLine("2026-06-18T00:15:10.084Z", "span_started", {
          composerId: "composer-alpha",
          name: "ComposerChatService.localProcessingBeforeStream",
          requestId: "cursor-req-1",
        }),
        traceLine("2026-06-18T00:15:13.466Z", "span_started", {
          name: "AgentResponseAdapter.thinkingCompleted",
          requestId: "cursor-req-1",
        }),
        traceLine("2026-06-18T00:15:13.639Z", "span_started", {
          name: "AgentResponseAdapter.toolCallStarted",
          requestId: "cursor-req-1",
        }),
        traceLine("2026-06-18T00:15:13.715Z", "span_started", {
          name: "AgentResponseAdapter.toolCallStarted",
          requestId: "cursor-req-1",
        }),
        traceLine("2026-06-18T00:15:13.828Z", "span_started", {
          composerId: "composer-alpha",
          name: "LocalGrepExecutor.execute",
          requestId: "cursor-req-1",
        }),
        traceLine("2026-06-18T00:15:15.737Z", "span_started", {
          name: "AgentResponseAdapter.toolCallStarted",
          requestId: "cursor-req-1",
        }),
        traceLine("2026-06-18T00:15:15.852Z", "span_started", {
          composerId: "composer-alpha",
          name: "LocalReadExecutor.execute",
          requestId: "cursor-req-1",
        }),
        traceLine("2026-06-18T00:15:15.853Z", "span_started", {
          composerId: "composer-alpha",
          name: "LocalReadExecutor.execute",
          requestId: "cursor-req-1",
        }),
        traceLine("2026-06-18T00:15:15.854Z", "span_started", {
          composerId: "composer-alpha",
          name: "LocalReadExecutor.execute",
          requestId: "cursor-req-1",
        }),
        traceLine("2026-06-18T00:15:15.855Z", "span_started", {
          composerId: "composer-alpha",
          name: "LocalReadExecutor.execute",
          requestId: "cursor-req-1",
        }),
        traceLine("2026-06-18T00:15:19.762Z", "span_started", {
          name: "AgentResponseAdapter.thinkingCompleted",
          requestId: "cursor-req-1",
        }),
        traceLine("2026-06-18T00:15:22.827Z", "span_started", {
          composerId: "composer-alpha",
          name: "AgentResponseAdapter.turnEnded",
          requestId: "cursor-req-1",
        }),
        traceLine("2026-06-18T00:15:25.000Z", "span_started", {
          composerId: "composer-alpha",
          name: "ComposerChatService.localProcessingBeforeStream",
          requestId: "cursor-req-2",
        }),
        traceLine("2026-06-18T00:15:28.000Z", "span_started", {
          composerId: "composer-alpha",
          name: "AgentResponseAdapter.turnEnded",
          requestId: "cursor-req-2",
        }),
      ]);

      const previousHome = process.env.HOME;
      process.env.HOME = tempHome;

      try {
        const analysis = analyzeLogs({
          ...defaultOptions(),
          provider: "cursor",
          anonymize: false,
        });

        expect(analysis.sessions).toHaveLength(1);
        expect(analysis.providerNames).toEqual(["cursor"]);
        expect(analysis.totals.sessions).toBe(1);
        expect(analysis.totals.inputTokens).toBe(0);
        expect(analysis.totals.outputTokens).toBe(0);
        expect(analysis.totals.apiEquivalentCostUsd).toBe(0);

        const session = analysis.sessions[0];
        expect(session?.projectPath).toBe(alphaProject);
        expect(session?.projectName).toBe("project-alpha");
        expect(session?.model).toBe("cursor-composer-unknown");
        expect(session?.functionCalls).toBe(3);
        expect(session?.toolSearchCalls).toBe(1);
        expect(session?.readCalls).toBe(4);
        expect(session?.shellCalls).toBe(0);
        expect(session?.repeatedReadCalls).toBe(3);
        expect(session?.repeatedShellCalls).toBe(0);
        expect(session?.planningMessages).toBe(3);
        expect(session?.editsObserved).toBe(0);
        expect(session?.startedAt).toBe("2026-06-18T00:15:10.084Z");
        expect(session?.endedAt).toBe("2026-06-18T00:15:28.000Z");
        expect(analysis.receipt.providerNames).toEqual(["cursor"]);
      } finally {
        restoreEnv("HOME", previousHome);
      }
    } finally {
      rmSync(tempHome, { recursive: true, force: true });
    }
  });

  test("separates multiple composers and falls back to the only workspace when DB metadata is missing", () => {
    const tempHome = mkdtempSync(
      join(tmpdir(), "token-receipt-cursor-fallback-"),
    );
    const alphaProject = "/Users/cursor/project-alpha";

    try {
      writeCursorWorkspace(tempHome, {
        workspaceId: "workspace-alpha",
        projectPath: alphaProject,
      });
      writeCursorTrace(tempHome, [
        traceLine("2026-06-18T01:00:00.000Z", "span_started", {
          composerId: "composer-a",
          name: "ComposerChatService.localProcessingBeforeStream",
          requestId: "cursor-req-a",
        }),
        traceLine("2026-06-18T01:00:01.000Z", "span_started", {
          name: "AgentResponseAdapter.toolCallStarted",
          requestId: "cursor-req-a",
        }),
        traceLine("2026-06-18T01:00:02.000Z", "span_started", {
          composerId: "composer-a",
          name: "LocalReadExecutor.execute",
          requestId: "cursor-req-a",
        }),
        traceLine("2026-06-18T01:00:03.000Z", "span_started", {
          composerId: "composer-a",
          name: "AgentResponseAdapter.turnEnded",
          requestId: "cursor-req-a",
        }),
        traceLine("2026-06-18T01:05:00.000Z", "span_started", {
          composerId: "composer-b",
          name: "ComposerChatService.localProcessingBeforeStream",
          requestId: "cursor-req-b",
        }),
        traceLine("2026-06-18T01:05:01.000Z", "span_started", {
          name: "AgentResponseAdapter.toolCallStarted",
          requestId: "cursor-req-b",
        }),
        traceLine("2026-06-18T01:05:02.000Z", "span_started", {
          composerId: "composer-b",
          name: "LocalGrepExecutor.execute",
          requestId: "cursor-req-b",
        }),
        traceLine("2026-06-18T01:05:03.000Z", "span_started", {
          composerId: "composer-b",
          name: "AgentResponseAdapter.turnEnded",
          requestId: "cursor-req-b",
        }),
      ]);

      const previousHome = process.env.HOME;
      process.env.HOME = tempHome;

      try {
        const analysis = analyzeLogs({
          ...defaultOptions(),
          provider: "cursor",
          anonymize: false,
        });

        expect(analysis.sessions).toHaveLength(2);
        expect(
          new Set(analysis.sessions.map((session) => session.projectPath)),
        ).toEqual(new Set([alphaProject]));
        expect(
          analysis.sessions.map((session) => session.functionCalls),
        ).toEqual([1, 1]);
      } finally {
        restoreEnv("HOME", previousHome);
      }
    } finally {
      rmSync(tempHome, { recursive: true, force: true });
    }
  });

  test("doctor reports Cursor workspaces and provider all includes Cursor", () => {
    const tempHome = mkdtempSync(join(tmpdir(), "token-receipt-cursor-all-"));
    const cursorProject = "/Users/cursor/project-alpha";

    try {
      writeCursorWorkspace(tempHome, {
        workspaceId: "workspace-alpha",
        projectPath: cursorProject,
        generations: [
          {
            generationUUID: "cursor-req-1",
            textDescription: "inspect alpha",
            type: "composer",
            unixMs: Date.parse("2026-06-18T02:00:00.000Z"),
          },
        ],
        composerIds: ["composer-alpha"],
      });
      writeCursorTrace(tempHome, [
        traceLine("2026-06-18T02:00:00.000Z", "span_started", {
          composerId: "composer-alpha",
          name: "ComposerChatService.localProcessingBeforeStream",
          requestId: "cursor-req-1",
        }),
        traceLine("2026-06-18T02:00:01.000Z", "span_started", {
          name: "AgentResponseAdapter.toolCallStarted",
          requestId: "cursor-req-1",
        }),
        traceLine("2026-06-18T02:00:02.000Z", "span_started", {
          composerId: "composer-alpha",
          name: "LocalReadExecutor.execute",
          requestId: "cursor-req-1",
        }),
        traceLine("2026-06-18T02:00:03.000Z", "span_started", {
          composerId: "composer-alpha",
          name: "AgentResponseAdapter.turnEnded",
          requestId: "cursor-req-1",
        }),
      ]);
      writeCodexFixture(tempHome);
      writeClaudeFixture(tempHome);

      const previousHome = process.env.HOME;
      process.env.HOME = tempHome;

      try {
        const report = doctor(defaultOptions());
        expect(report.cursor.detected).toBe(true);
        expect(report.cursor.experimental).toBe(true);
        expect(report.cursor.sqlite3Available).toBe(true);
        expect(report.cursor.workspaces[0]?.projectPath).toBe(cursorProject);

        const analysis = analyzeLogs({
          ...defaultOptions(),
          provider: "all",
          anonymize: false,
        });
        expect(analysis.sessions).toHaveLength(3);
        expect(new Set(analysis.providerNames)).toEqual(
          new Set(["codex", "claude", "cursor"]),
        );
      } finally {
        restoreEnv("HOME", previousHome);
      }
    } finally {
      rmSync(tempHome, { recursive: true, force: true });
    }
  });
});

function writeCursorWorkspace(
  home: string,
  {
    workspaceId,
    projectPath,
    generations = [],
    composerIds = [],
  }: {
    workspaceId: string;
    projectPath: string;
    generations?: Array<{
      unixMs?: number;
      generationUUID?: string;
      type?: string;
      textDescription?: string;
    }>;
    composerIds?: string[];
  },
) {
  const workspaceDir = join(
    home,
    "Library",
    "Application Support",
    "Cursor",
    "User",
    "workspaceStorage",
    workspaceId,
  );
  const dbPath = join(workspaceDir, "state.vscdb");
  mkdirSync(workspaceDir, { recursive: true });
  writeFileSync(
    join(workspaceDir, "workspace.json"),
    JSON.stringify({ folder: `file://${projectPath}` }),
  );

  const values = [
    {
      key: "aiService.generations",
      value: JSON.stringify(generations),
    },
    {
      key: "composer.composerData",
      value: JSON.stringify({
        hasMigratedComposerData: true,
        lastFocusedComposerIds: composerIds,
        selectedComposerIds: composerIds,
      }),
    },
  ];
  const statements = [
    "CREATE TABLE ItemTable (key TEXT UNIQUE ON CONFLICT REPLACE, value BLOB);",
    ...values.map(
      ({ key, value }) =>
        `INSERT INTO ItemTable VALUES ('${key}', x'${Buffer.from(value, "utf8").toString("hex")}');`,
    ),
  ].join("\n");

  execFileSync("sqlite3", [dbPath], { input: statements, encoding: "utf8" });
}

function writeCursorTrace(home: string, lines: string[]) {
  const logDir = join(
    home,
    "Library",
    "Application Support",
    "Cursor",
    "logs",
    "20260618T020000",
    "window1",
    "output_20260618T020003",
  );
  mkdirSync(logDir, { recursive: true });
  writeFileSync(
    join(logDir, "cursor.requestTraces.log"),
    `${lines.join("\n")}\n`,
  );
}

function traceLine(
  timestamp: string,
  event: "span_started" | "span_completed",
  {
    name,
    requestId,
    composerId,
  }: {
    name: string;
    requestId: string;
    composerId?: string;
  },
) {
  return [
    timestamp,
    event,
    `name="${name}"`,
    `traceId=${requestId.replaceAll("-", "").slice(0, 32).padEnd(32, "0")}`,
    `spanId=${requestId.replaceAll("-", "").slice(0, 16).padEnd(16, "0")}`,
    `requestId=${requestId}`,
    composerId ? `composerId=${composerId}` : null,
  ]
    .filter((part): part is string => Boolean(part))
    .join(" ");
}

function writeCodexFixture(home: string) {
  const codexDir = join(home, ".codex", "sessions", "2026", "06", "18");
  mkdirSync(codexDir, { recursive: true });
  writeFileSync(
    join(codexDir, "session.jsonl"),
    [
      JSON.stringify({
        timestamp: "2026-06-18T03:00:00.000Z",
        type: "turn_context",
        payload: { cwd: "/Users/codex/project" },
      }),
      JSON.stringify({
        timestamp: "2026-06-18T03:00:01.000Z",
        payload: {
          type: "function_call",
          name: "read_file",
          arguments: '{"path":"src/index.ts"}',
        },
      }),
      JSON.stringify({
        timestamp: "2026-06-18T03:00:02.000Z",
        payload: {
          type: "token_count",
          info: {
            total_token_usage: {
              input_tokens: 1000,
              cached_input_tokens: 100,
              output_tokens: 200,
              reasoning_output_tokens: 50,
            },
          },
        },
      }),
    ].join("\n"),
  );
}

function writeClaudeFixture(home: string) {
  const claudeDir = join(home, ".claude", "projects", "project");
  mkdirSync(claudeDir, { recursive: true });
  writeFileSync(
    join(claudeDir, "session.jsonl"),
    `${JSON.stringify({
      timestamp: "2026-06-18T04:00:00.000Z",
      type: "assistant",
      cwd: "/Users/claude/project",
      requestId: "claude-1",
      message: {
        model: "claude-sonnet-4",
        id: "message-1",
        usage: {
          input_tokens: 500,
          cache_read_input_tokens: 50,
          output_tokens: 100,
        },
        content: [
          {
            type: "tool_use",
            name: "Read",
            input: { path: "src/index.ts" },
          },
        ],
      },
    })}\n`,
  );
}

function restoreEnv(key: string, value: string | undefined) {
  if (value === undefined) {
    delete process.env[key];
    return;
  }

  process.env[key] = value;
}
