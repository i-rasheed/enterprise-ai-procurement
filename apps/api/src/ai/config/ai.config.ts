import { registerAs } from '@nestjs/config';

export const AI_CONFIG_KEY = 'ai';

export default registerAs(AI_CONFIG_KEY, () => ({
  provider: process.env.AI_PROVIDER ?? 'openai',
  openaiApiKey: process.env.OPENAI_API_KEY ?? '',
  model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
  embeddingModel:
    process.env.OPENAI_EMBEDDING_MODEL ?? 'text-embedding-3-small',
  temperature: parseFloat(process.env.TEMPERATURE ?? '0.3'),
  maxTokens: parseInt(process.env.MAX_TOKENS ?? '4096', 10),
  timeoutMs: parseInt(process.env.AI_TIMEOUT_MS ?? '60000', 10),
}));
