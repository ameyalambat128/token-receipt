export type PricingProvider = "claude" | "codex" | "kiro";

export type PricingSource = {
  kind: "static" | "web";
  fetchedAt: string;
  reference: string;
};

export type CodexModelPricing = {
  input: number;
  cachedInput: number;
  output: number;
};

export type ClaudeFamily = "haiku" | "opus" | "sonnet";

export type ClaudeFamilyPricing = {
  label: string;
  sourceModel: string;
  input: number;
  cacheRead: number;
  cacheWrite5m: number;
  cacheWrite1h: number;
  output: number;
};

export type PricingCatalog = {
  fetchedAt: string;
  sources: Record<PricingProvider, PricingSource>;
  codex: {
    defaultModel: string;
    models: Record<string, CodexModelPricing>;
  };
  claude: {
    defaultFamily: ClaudeFamily;
    families: Record<ClaudeFamily, ClaudeFamilyPricing>;
  };
  kiro: {
    creditOverageUsd: number;
  };
};

export type AnalysisPricing = {
  providerNames: PricingProvider[];
  fetchedAt: string;
  sources: Partial<Record<PricingProvider, PricingSource>>;
};
