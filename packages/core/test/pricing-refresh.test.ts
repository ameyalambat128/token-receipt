import { describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { analyzeLogs, defaultOptions } from "../src/index";
import {
  buildPricingCatalogFromHtml,
  parseAnthropicPricing,
  parseOpenAiPricing,
  renderPricingCatalogModule,
} from "../src/pricing-refresh";
import { getPricingCatalog } from "../src/pricing";

const fixtureDir = join(import.meta.dir, "fixtures");
const openAiFixturePath = join(fixtureDir, "openai-pricing.html");
const anthropicFixturePath = join(fixtureDir, "anthropic-pricing.html");
const coreRoot = join(import.meta.dir, "..");

describe("pricing refresh", () => {
  test("parses OpenAI and Anthropic fixture snapshots", () => {
    const openAiPricing = parseOpenAiPricing(
      readFileSync(openAiFixturePath, "utf8"),
    );
    const anthropicPricing = parseAnthropicPricing(
      readFileSync(anthropicFixturePath, "utf8"),
    );

    expect(openAiPricing.defaultModel).toBe("gpt-5-codex");
    expect(openAiPricing.models["gpt-5-codex"]).toEqual({
      input: 1.25,
      cachedInput: 0.125,
      output: 10,
    });
    expect(openAiPricing.models["gpt-5.1-codex-mini"]).toEqual({
      input: 0.25,
      cachedInput: 0.025,
      output: 2,
    });
    expect(anthropicPricing.defaultFamily).toBe("sonnet");
    expect(anthropicPricing.families.opus.sourceModel).toBe("Claude Opus 4.8");
    expect(anthropicPricing.families.sonnet).toMatchObject({
      input: 3,
      cacheRead: 0.3,
      cacheWrite5m: 3.75,
      cacheWrite1h: 6,
      output: 15,
    });
    expect(anthropicPricing.families.haiku.sourceModel).toBe(
      "Claude Haiku 4.5",
    );
  });

  test("renders generated output deterministically", () => {
    const catalog = buildPricingCatalogFromHtml({
      openAiHtml: readFileSync(openAiFixturePath, "utf8"),
      anthropicHtml: readFileSync(anthropicFixturePath, "utf8"),
      fetchedAt: "2026-06-15T12:00:00.000Z",
    });

    const first = renderPricingCatalogModule({
      ...catalog,
      codex: {
        ...catalog.codex,
        models: {
          "gpt-5.3-codex": catalog.codex.models["gpt-5.3-codex"],
          "gpt-5-codex": catalog.codex.models["gpt-5-codex"],
          "codex-mini-latest": catalog.codex.models["codex-mini-latest"],
          "gpt-5.2-codex": catalog.codex.models["gpt-5.2-codex"],
          "gpt-5.1-codex": catalog.codex.models["gpt-5.1-codex"],
          "gpt-5.1-codex-max": catalog.codex.models["gpt-5.1-codex-max"],
          "gpt-5.1-codex-mini": catalog.codex.models["gpt-5.1-codex-mini"],
        },
      },
    });
    const second = renderPricingCatalogModule(catalog);

    expect(first).toBe(second);
    expect(second).toContain('"gpt-5-codex"');
    expect(second).toContain('"sourceModel": "Claude Sonnet 4.6"');
  });

  test("computes provider costs from the catalog and emits pricing metadata", () => {
    const tempHome = mkdtempSync(join(tmpdir(), "token-receipt-pricing-"));

    try {
      writeCodexFixture(tempHome);
      writeClaudeFixture(tempHome);

      const previousHome = process.env.HOME;
      process.env.HOME = tempHome;

      try {
        const catalog = getPricingCatalog();
        const codexAnalysis = analyzeLogs({
          ...defaultOptions(),
          provider: "codex",
          anonymize: false,
        });
        const claudeAnalysis = analyzeLogs({
          ...defaultOptions(),
          provider: "claude",
          anonymize: false,
        });

        expect(codexAnalysis.totals.apiEquivalentCostUsd).toBeCloseTo(
          0.0036375,
          8,
        );
        expect(claudeAnalysis.totals.apiEquivalentCostUsd).toBeCloseTo(
          0.003015,
          8,
        );
        expect(codexAnalysis.pricing.providerNames).toEqual(["codex"]);
        expect(codexAnalysis.pricing.sources.codex).toEqual(
          catalog.sources.codex,
        );
        expect(claudeAnalysis.pricing.providerNames).toEqual(["claude"]);
        expect(claudeAnalysis.pricing.sources.claude).toEqual(
          catalog.sources.claude,
        );
      } finally {
        restoreEnv("HOME", previousHome);
      }
    } finally {
      rmSync(tempHome, { recursive: true, force: true });
    }
  });

  test("refresh script writes required models and does not overwrite on parse failure", () => {
    const tempDir = mkdtempSync(join(tmpdir(), "token-receipt-refresh-"));
    const outputPath = join(tempDir, "pricing-catalog.generated.ts");
    const invalidOpenAiPath = join(tempDir, "invalid-openai.html");

    try {
      const goodResult = spawnSync(
        process.execPath,
        ["./scripts/refresh-pricing.ts"],
        {
          cwd: coreRoot,
          env: {
            ...process.env,
            TOKEN_RECEIPT_PRICING_OPENAI_SOURCE: openAiFixturePath,
            TOKEN_RECEIPT_PRICING_CLAUDE_SOURCE: anthropicFixturePath,
            TOKEN_RECEIPT_PRICING_OUTPUT_PATH: outputPath,
          },
          encoding: "utf8",
        },
      );

      expect(goodResult.status).toBe(0);
      const output = readFileSync(outputPath, "utf8");
      expect(output).toContain('"gpt-5-codex"');
      expect(output).toContain('"sourceModel": "Claude Opus 4.8"');

      writeFileSync(invalidOpenAiPath, "<html>missing codex rows</html>");
      writeFileSync(outputPath, "keep-me");

      const badResult = spawnSync(
        process.execPath,
        ["./scripts/refresh-pricing.ts"],
        {
          cwd: coreRoot,
          env: {
            ...process.env,
            TOKEN_RECEIPT_PRICING_OPENAI_SOURCE: invalidOpenAiPath,
            TOKEN_RECEIPT_PRICING_CLAUDE_SOURCE: anthropicFixturePath,
            TOKEN_RECEIPT_PRICING_OUTPUT_PATH: outputPath,
          },
          encoding: "utf8",
        },
      );

      expect(badResult.status).not.toBe(0);
      expect(readFileSync(outputPath, "utf8")).toBe("keep-me");
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });
});

const writeCodexFixture = (home: string) => {
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
};

const writeClaudeFixture = (home: string) => {
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
};

const restoreEnv = (key: string, value: string | undefined) => {
  if (value === undefined) {
    delete process.env[key];
    return;
  }

  process.env[key] = value;
};
