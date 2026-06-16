import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  buildPricingCatalogFromHtml,
  CLAUDE_PRICING_URL,
  OPENAI_PRICING_URL,
  renderPricingCatalogModule,
} from "../src/pricing-refresh.js";

const defaultOutputPath = resolve(
  import.meta.dir,
  "..",
  "src",
  "pricing-catalog.generated.ts",
);

const main = async () => {
  const fetchedAt = new Date().toISOString();
  const [openAiHtml, anthropicHtml] = await Promise.all([
    loadSource(
      process.env.TOKEN_RECEIPT_PRICING_OPENAI_SOURCE ?? OPENAI_PRICING_URL,
    ),
    loadSource(
      process.env.TOKEN_RECEIPT_PRICING_CLAUDE_SOURCE ?? CLAUDE_PRICING_URL,
    ),
  ]);
  const outputPath = resolve(
    process.env.TOKEN_RECEIPT_PRICING_OUTPUT_PATH ?? defaultOutputPath,
  );
  const catalog = buildPricingCatalogFromHtml({
    openAiHtml,
    anthropicHtml,
    fetchedAt,
  });
  const moduleSource = renderPricingCatalogModule(catalog);

  writeFileSync(outputPath, moduleSource);
  process.stdout.write(`${outputPath}\n`);
};

const loadSource = async (source: string) => {
  if (/^https?:\/\//i.test(source)) {
    const response = await fetch(source, {
      headers: {
        "user-agent": "Mozilla/5.0",
      },
    });
    if (!response.ok) {
      throw new Error(
        `Failed to fetch pricing source ${source}: ${response.status}`,
      );
    }
    return await response.text();
  }

  return readFileSync(resolve(source), "utf8");
};

await main();
