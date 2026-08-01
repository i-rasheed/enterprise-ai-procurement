export interface LLMGenerateOptions {
  systemPrompt?: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
}

export interface LLMChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMChatOptions {
  messages: LLMChatMessage[];
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
}

export interface LLMResponse {
  content: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  model: string;
}

export interface LLMProvider {
  readonly name: string;
  generate(options: LLMGenerateOptions): Promise<LLMResponse>;
  chat(options: LLMChatOptions): Promise<LLMResponse>;
  embed(texts: string[]): Promise<number[][]>;
  summarize(text: string, instructions?: string): Promise<LLMResponse>;
  extract(text: string, extractionSchema: string): Promise<LLMResponse>;
}
