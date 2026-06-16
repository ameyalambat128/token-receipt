import { describe, expect, test } from "bun:test";
import { execFileSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { analyzeLogs, defaultOptions, doctor } from "../src/index";

const fixturePath = join(import.meta.dir, "fixtures", "kiro-session.json");

describe("Kiro CLI support", () => {
  test("parses Kiro sessions, credit spend, and fallback project paths", () => {
    const tempHome = mkdtempSync(join(tmpdir(), "token-receipt-kiro-"));

    try {
      writeKiroDb(tempHome, [
        {
          conversationId: "kiro-session-main",
          projectPath: "/Users/kiro/project-alpha",
          createdAtMs: Date.parse("2026-06-14T10:00:00.000Z"),
          updatedAtMs: Date.parse("2026-06-14T10:30:00.000Z"),
          payload: loadFixture(),
        },
        {
          conversationId: "kiro-session-fallback",
          projectPath: "",
          createdAtMs: Date.parse("2026-06-14T09:00:00.000Z"),
          updatedAtMs: Date.parse("2026-06-14T09:30:00.000Z"),
          payload: loadFixture({
            conversation_id: "kiro-session-fallback",
            user_turn_metadata: {
              usage_info: [{ unit: "credit", value: 0.1 }],
            },
          }),
        },
      ]);

      const previousHome = process.env.HOME;
      process.env.HOME = tempHome;

      try {
        const analysis = analyzeLogs({
          ...defaultOptions(),
          provider: "kiro",
          anonymize: false,
        });

        expect(analysis.totals.sessions).toBe(2);
        expect(analysis.totals.creditsUsed).toBeCloseTo(0.85, 6);
        expect(analysis.totals.apiEquivalentCostUsd).toBeCloseTo(0.034, 6);
        const mainSession = analysis.sessions.find(
          (session) => session.projectPath === "/Users/kiro/project-alpha",
        );
        expect(mainSession).toBeDefined();
        expect(mainSession?.model).toBe("kiro-claude-sonnet-4.6");
        expect(mainSession?.functionCalls).toBe(8);
        expect(mainSession?.readCalls).toBe(2);
        expect(mainSession?.shellCalls).toBe(2);
        expect(mainSession?.repeatedReadCalls).toBe(1);
        expect(mainSession?.repeatedShellCalls).toBe(1);
        expect(mainSession?.subagentCalls).toBe(1);
        expect(mainSession?.editsObserved).toBe(3);
        expect(mainSession?.planningMessages).toBe(1);
        expect(mainSession?.creditsUsed).toBeCloseTo(0.75, 6);
        expect(mainSession?.apiEquivalentCostUsd).toBeCloseTo(0.03, 6);
        expect(mainSession?.inputTokens).toBe(0);
        expect(mainSession?.outputTokens).toBe(0);

        const fallbackSession = analysis.sessions.find(
          (session) => session.projectPath === "/Users/kiro/fallback-project",
        );
        expect(fallbackSession).toBeDefined();

        const filtered = analyzeLogs({
          ...defaultOptions(),
          provider: "kiro",
          anonymize: false,
          project: "fallback-project",
        });
        expect(filtered.sessions).toHaveLength(1);
        expect(filtered.sessions[0]?.projectPath).toBe(
          "/Users/kiro/fallback-project",
        );
      } finally {
        restoreEnv("HOME", previousHome);
      }
    } finally {
      rmSync(tempHome, { recursive: true, force: true });
    }
  });

  test("doctor reports detected Kiro sessions and provider all includes Codex and Claude", () => {
    const tempHome = mkdtempSync(join(tmpdir(), "token-receipt-all-"));

    try {
      writeKiroDb(tempHome, [
        {
          conversationId: "kiro-session-main",
          projectPath: "/Users/kiro/project-alpha",
          createdAtMs: Date.parse("2026-06-14T10:00:00.000Z"),
          updatedAtMs: Date.parse("2026-06-14T10:30:00.000Z"),
          payload: loadFixture(),
        },
      ]);
      writeCodexFixture(tempHome);
      writeClaudeFixture(tempHome);

      const previousHome = process.env.HOME;
      process.env.HOME = tempHome;

      try {
        const report = doctor(defaultOptions());
        expect(report.kiro.detected).toBe(true);
        expect(report.kiro.sessions[0]?.conversationId).toBe(
          "kiro-session-main",
        );
        expect(report.kiro.sessions[0]?.projectPath).toBe(
          "/Users/kiro/project-alpha",
        );

        const analysis = analyzeLogs({
          ...defaultOptions(),
          provider: "all",
          anonymize: false,
        });
        expect(analysis.sessions).toHaveLength(3);
        expect(new Set(analysis.providerNames)).toEqual(
          new Set(["codex", "claude", "kiro"]),
        );
        expect(analysis.totals.creditsUsed).toBeCloseTo(0.75, 6);
        expect(analysis.pricing.providerNames).toEqual([
          "codex",
          "claude",
          "kiro",
        ]);
        expect(Object.keys(analysis.pricing.sources)).toEqual([
          "codex",
          "claude",
          "kiro",
        ]);
        expect(analysis.totals.apiEquivalentCostUsd).toBeCloseTo(0.0366525, 8);
      } finally {
        restoreEnv("HOME", previousHome);
      }
    } finally {
      rmSync(tempHome, { recursive: true, force: true });
    }
  });
});

function loadFixture(
  overrides?: Partial<Record<string, unknown>>,
): Record<string, unknown> {
  return {
    ...JSON.parse(readFileSync(fixturePath, "utf8")),
    ...overrides,
  };
}

function writeKiroDb(
  home: string,
  sessions: Array<{
    conversationId: string;
    projectPath: string;
    createdAtMs: number;
    updatedAtMs: number;
    payload: Record<string, unknown>;
  }>,
) {
  const dbPath = join(
    home,
    "Library",
    "Application Support",
    "kiro-cli",
    "data.sqlite3",
  );
  mkdirSync(join(home, "Library", "Application Support", "kiro-cli"), {
    recursive: true,
  });

  const statements = [
    "CREATE TABLE conversations_v2 (key TEXT, conversation_id TEXT, value TEXT, created_at INTEGER, updated_at INTEGER);",
    ...sessions.map((session) => {
      const json = JSON.stringify(session.payload).replaceAll("'", "''");
      const path = session.projectPath.replaceAll("'", "''");
      return `INSERT INTO conversations_v2 VALUES ('${path}', '${session.conversationId}', '${json}', ${session.createdAtMs}, ${session.updatedAtMs});`;
    }),
  ].join("\n");

  execFileSync("sqlite3", [dbPath], { input: statements, encoding: "utf8" });
}

function writeCodexFixture(home: string) {
  const codexDir = join(home, ".codex", "sessions", "2026", "06", "14");
  mkdirSync(codexDir, { recursive: true });
  writeFileSync(
    join(codexDir, "session.jsonl"),
    [
      JSON.stringify({
        timestamp: "2026-06-14T12:00:00.000Z",
        type: "turn_context",
        payload: { cwd: "/Users/codex/project" },
      }),
      JSON.stringify({
        timestamp: "2026-06-14T12:00:01.000Z",
        payload: {
          type: "function_call",
          name: "read_file",
          arguments: '{"path":"src/index.ts"}',
        },
      }),
      JSON.stringify({
        timestamp: "2026-06-14T12:00:02.000Z",
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
      timestamp: "2026-06-14T13:00:00.000Z",
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
