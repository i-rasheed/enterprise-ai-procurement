import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

import { AI_CONFIG_KEY } from '../config/ai.config';
import {
  LLMChatOptions,
  LLMGenerateOptions,
  LLMProvider,
  LLMResponse,
} from './llm-provider.interface';

@Injectable()
export class OpenAIProvider implements LLMProvider {
  readonly name = 'openai';
  private client: OpenAI | null = null;

  constructor(private readonly configService: ConfigService) {}

  private getClient(): OpenAI {
    if (this.client) {
      return this.client;
    }

    const apiKey = this.configService.get<string>(
      `${AI_CONFIG_KEY}.openaiApiKey`,
    );
    if (!apiKey) {
      throw new ServiceUnavailableException(
        'OpenAI API key is not configured. Set OPENAI_API_KEY.',
      );
    }

    const timeoutMs = this.configService.get<number>(
      `${AI_CONFIG_KEY}.timeoutMs`,
      60_000,
    );

    this.client = new OpenAI({
      apiKey,
      timeout: timeoutMs,
      maxRetries: 1,
    });

    return this.client;
  }

  private getModel(): string {
    return this.configService.get<string>(
      `${AI_CONFIG_KEY}.model`,
      'gpt-4o-mini',
    );
  }

  private getEmbeddingModel(): string {
    return this.configService.get<string>(
      `${AI_CONFIG_KEY}.embeddingModel`,
      'text-embedding-3-small',
    );
  }

  private getTemperature(override?: number): number {
    if (override !== undefined) {
      return override;
    }
    return this.configService.get<number>(`${AI_CONFIG_KEY}.temperature`, 0.3);
  }

  private getMaxTokens(override?: number): number {
    if (override !== undefined) {
      return override;
    }
    return this.configService.get<number>(`${AI_CONFIG_KEY}.maxTokens`, 4096);
  }

  private mapResponse(
    content: string | null | undefined,
    usage: OpenAI.Completions.CompletionUsage | undefined,
    model: string,
  ): LLMResponse {
    return {
      content: content ?? '',
      promptTokens: usage?.prompt_tokens ?? 0,
      completionTokens: usage?.completion_tokens ?? 0,
      totalTokens: usage?.total_tokens ?? 0,
      model,
    };
  }

  private handleError(error: unknown): never {
    if (error instanceof OpenAI.APIError) {
      if (error.status === 429) {
        throw new BadRequestException(
          'Token or rate limit exceeded for AI provider.',
        );
      }
      if (error.status === 400) {
        throw new BadRequestException(
          error.message || 'Invalid prompt for AI provider.',
        );
      }
      throw new ServiceUnavailableException(
        `AI provider unavailable: ${error.message}`,
      );
    }

    if (error instanceof Error && error.message.includes('timeout')) {
      throw new ServiceUnavailableException('AI provider request timed out.');
    }

    throw error;
  }

  async generate(options: LLMGenerateOptions): Promise<LLMResponse> {
    try {
      const model = this.getModel();
      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];

      if (options.systemPrompt) {
        messages.push({ role: 'system', content: options.systemPrompt });
      }
      messages.push({ role: 'user', content: options.userPrompt });

      const response = await this.getClient().chat.completions.create({
        model,
        messages,
        temperature: this.getTemperature(options.temperature),
        max_tokens: this.getMaxTokens(options.maxTokens),
        response_format: options.jsonMode ? { type: 'json_object' } : undefined,
      });

      return this.mapResponse(
        response.choices[0]?.message?.content,
        response.usage,
        response.model,
      );
    } catch (error) {
      this.handleError(error);
    }
  }

  async chat(options: LLMChatOptions): Promise<LLMResponse> {
    try {
      const model = this.getModel();
      const response = await this.getClient().chat.completions.create({
        model,
        messages: options.messages,
        temperature: this.getTemperature(options.temperature),
        max_tokens: this.getMaxTokens(options.maxTokens),
        response_format: options.jsonMode ? { type: 'json_object' } : undefined,
      });

      return this.mapResponse(
        response.choices[0]?.message?.content,
        response.usage,
        response.model,
      );
    } catch (error) {
      this.handleError(error);
    }
  }

  async embed(texts: string[]): Promise<number[][]> {
    if (texts.length === 0) {
      return [];
    }

    try {
      const model = this.getEmbeddingModel();
      const response = await this.getClient().embeddings.create({
        model,
        input: texts,
      });

      return response.data
        .sort((a, b) => a.index - b.index)
        .map((item) => item.embedding);
    } catch (error) {
      this.handleError(error);
    }
  }

  async summarize(text: string, instructions?: string): Promise<LLMResponse> {
    const systemPrompt =
      instructions ??
      'You are a procurement analyst. Summarize the provided content concisely and accurately.';
    return this.generate({
      systemPrompt,
      userPrompt: text,
      temperature: 0.2,
    });
  }

  async extract(text: string, extractionSchema: string): Promise<LLMResponse> {
    return this.generate({
      systemPrompt:
        'Extract structured information from the provided procurement content. Return valid JSON only.',
      userPrompt: `Schema:\n${extractionSchema}\n\nContent:\n${text}`,
      jsonMode: true,
      temperature: 0.1,
    });
  }
}
