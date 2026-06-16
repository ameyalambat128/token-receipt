import { pricingCatalog } from "./pricing-catalog.generated.js";
import type {
  AnalysisPricing,
  ClaudeFamily,
  ClaudeFamilyPricing,
  CodexModelPricing,
  PricingCatalog,
  PricingProvider,
} from "./pricing-types.js";

const providerOrder: PricingProvider[] = ["codex", "claude", "kiro"];
const codexModels = pricingCatalog.codex.models as Record<
  string,
  CodexModelPricing
>;

export const getPricingCatalog = () => pricingCatalog satisfies PricingCatalog;

export const getPricingMetadata = (providerNames: readonly PricingProvider[]) =>
  ({
    providerNames: providerOrder.filter((provider) =>
      providerNames.includes(provider),
    ),
    fetchedAt: pricingCatalog.fetchedAt,
    sources: Object.fromEntries(
      providerOrder
        .filter((provider) => providerNames.includes(provider))
        .map((provider) => [provider, pricingCatalog.sources[provider]]),
    ),
  }) satisfies AnalysisPricing;

export const getKiroCreditRateUsd = () => pricingCatalog.kiro.creditOverageUsd;

export const resolveCodexModelPricing = (model: string) => {
  const modelKey =
    Object.keys(codexModels).find(
      (candidate) => candidate.toLowerCase() === model.toLowerCase(),
    ) ?? pricingCatalog.codex.defaultModel;
  const rates = codexModels[modelKey];

  if (!rates) {
    throw new Error(`Missing pricing entry for Codex model ${modelKey}.`);
  }

  return {
    modelKey,
    rates: rates satisfies CodexModelPricing,
  };
};

export const resolveClaudeFamilyPricing = (model: string) => {
  const family =
    matchClaudeFamily(model) ?? pricingCatalog.claude.defaultFamily;

  return {
    family,
    rates: pricingCatalog.claude.families[family] satisfies ClaudeFamilyPricing,
  };
};

const matchClaudeFamily = (model: string): ClaudeFamily | null => {
  if (/opus/i.test(model)) return "opus";
  if (/haiku/i.test(model)) return "haiku";
  if (/sonnet/i.test(model)) return "sonnet";
  return null;
};
