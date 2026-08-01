export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
  relevantRecords?: SemanticSearchResult[];
  isStreaming?: boolean;
};

export type StoredConversation = {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
};

export type ChatRequest = {
  question: string;
  context?: string;
  conversationHistory?: Array<{
    role: ChatRole;
    content: string;
  }>;
};

export type ChatResponse = {
  question: string;
  answer: string;
  relevantRecords: SemanticSearchResult[];
  provider: string;
};

export type EmbeddingEntityType =
  | "CONTRACT"
  | "RFQ"
  | "PURCHASE_ORDER"
  | "INVOICE"
  | "PROCUREMENT_REQUEST"
  | "BID";

export type SemanticSearchRequest = {
  query: string;
  entityTypes?: EmbeddingEntityType[];
  limit?: number;
};

export type SemanticSearchResult = {
  entityType: EmbeddingEntityType;
  entityId: string;
  score: number;
  snippet: string;
};

export type SemanticSearchResponse = {
  results: SemanticSearchResult[];
};

export type ContractSummary = {
  contractId: string;
  executiveSummary: string;
  importantDates: Array<{
    label: string;
    date: string;
    description?: string;
  }>;
  obligations: string[];
  risks: Array<{
    risk: string;
    severity: string;
    mitigation?: string;
  }>;
  renewalInformation: Record<string, unknown>;
};

export type SpendAnalysisRequest = {
  department?: string;
};

export type SpendAnalysis = {
  topCategories: Array<{
    category: string;
    totalSpend: number;
    percentage: number;
  }>;
  overspending: Array<{
    area: string;
    amount: number;
    recommendation: string;
  }>;
  vendorConcentration: Array<{
    vendor: string;
    spendShare: number;
    risk: string;
  }>;
  costReductionOpportunities: Array<{
    opportunity: string;
    estimatedSaving: number;
    effort: string;
  }>;
};

export type AssistantTab =
  | "chat"
  | "search"
  | "contract-summary"
  | "vendor-risk"
  | "spend-analysis"
  | "recommendations";
