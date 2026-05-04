const PRICING = {
  'claude-sonnet-4-5-20250929': { input: 3, output: 15, cacheWrite: 3.75, cacheRead: 0.30 },
  'claude-haiku-4-5-20251001': { input: 0.80, output: 4, cacheWrite: 1, cacheRead: 0.08 },
} as const;

type ModelId = keyof typeof PRICING;

const TOKENS_PER_UNIT = 1_000_000;

export interface UsageLogRow {
  model: string;
  input_tokens: number;
  output_tokens: number;
  cache_creation_input_tokens: number;
  cache_read_input_tokens: number;
}

const isKnownModel = (model: string): model is ModelId =>
  model in PRICING;

export interface CostResult {
  cost: number;
  unknownModels: string[];
}

export const calculateCost = (
  model: string,
  input: number,
  output: number,
  cacheCreation: number,
  cacheRead: number,
): number => {
  if (!isKnownModel(model)) {
    console.warn(`[tokenPricing] 알 수 없는 모델: ${model} — 비용 0으로 처리`);
    return 0;
  }

  const price = PRICING[model];
  return (
    (input / TOKENS_PER_UNIT) * price.input +
    (output / TOKENS_PER_UNIT) * price.output +
    (cacheCreation / TOKENS_PER_UNIT) * price.cacheWrite +
    (cacheRead / TOKENS_PER_UNIT) * price.cacheRead
  );
};

export const calculateTotalCostWithWarnings = (logs: UsageLogRow[]): CostResult => {
  const unknownModels = new Set<string>();
  const cost = logs.reduce((sum, log) => {
    if (!isKnownModel(log.model)) unknownModels.add(log.model);
    return (
      sum +
      calculateCost(
        log.model,
        log.input_tokens,
        log.output_tokens,
        log.cache_creation_input_tokens,
        log.cache_read_input_tokens,
      )
    );
  }, 0);

  return { cost, unknownModels: Array.from(unknownModels) };
};

export interface UsageSummaryResult {
  total_requests: number;
  total_input_tokens: number;
  total_output_tokens: number;
  total_cache_creation_tokens: number;
  total_cache_read_tokens: number;
}

export const computeSummary = (logs: UsageLogRow[]): UsageSummaryResult => ({
  total_requests: logs.length,
  total_input_tokens: logs.reduce((sum, r) => sum + r.input_tokens, 0),
  total_output_tokens: logs.reduce((sum, r) => sum + r.output_tokens, 0),
  total_cache_creation_tokens: logs.reduce((sum, r) => sum + r.cache_creation_input_tokens, 0),
  total_cache_read_tokens: logs.reduce((sum, r) => sum + r.cache_read_input_tokens, 0),
});
