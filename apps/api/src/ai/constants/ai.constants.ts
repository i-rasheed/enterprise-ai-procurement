export const LLM_PROVIDER = Symbol('LLM_PROVIDER');

export const AI_FEATURES = {
  CONTRACT_SUMMARY: 'contract-summary',
  CLAUSE_EXTRACTION: 'clause-extraction',
  VENDOR_RISK: 'vendor-risk',
  PROCUREMENT_RECOMMENDATIONS: 'procurement-recommendations',
  SPEND_ANALYSIS: 'spend-analysis',
  INVOICE_ANOMALY: 'invoice-anomaly',
  CHAT: 'chat',
  SEMANTIC_SEARCH: 'semantic-search',
  EMBEDDING: 'embedding',
} as const;

export type AiFeature = (typeof AI_FEATURES)[keyof typeof AI_FEATURES];

export const DEFAULT_AI_TIMEOUT_MS = 60_000;
