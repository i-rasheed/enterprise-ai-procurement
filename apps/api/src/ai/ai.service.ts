import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { UsageMetric } from '@prisma/client';

import { UsageService } from '../billing/usage.service';
import { AiRepository } from './ai.repository';
import { AiFeature, LLM_PROVIDER } from './constants/ai.constants';
import type {
  LLMProvider,
  LLMResponse,
} from './providers/llm-provider.interface';

export type AiExecutionContext = {
  organisationId: string;
  userId: string;
  feature: AiFeature;
};

@Injectable()
export class AiService {
  constructor(
    @Inject(LLM_PROVIDER) private readonly llmProvider: LLMProvider,
    private readonly aiRepository: AiRepository,
    private readonly usageService: UsageService,
  ) {}

  async generate(
    ctx: AiExecutionContext,
    systemPrompt: string,
    userPrompt: string,
    jsonMode = true,
  ): Promise<Record<string, unknown>> {
    if (!userPrompt?.trim()) {
      throw new BadRequestException('Prompt content cannot be empty.');
    }

    const start = Date.now();
    const response = await this.llmProvider.generate({
      systemPrompt,
      userPrompt,
      jsonMode,
    });
    const executionTimeMs = Date.now() - start;

    await this.logExecution(
      ctx,
      `${systemPrompt}\n\n${userPrompt}`,
      response,
      executionTimeMs,
    );

    return this.parseJsonResponse(response.content);
  }

  async chat(
    ctx: AiExecutionContext,
    messages: { role: 'system' | 'user' | 'assistant'; content: string }[],
    jsonMode = false,
  ): Promise<string | Record<string, unknown>> {
    const start = Date.now();
    const response = await this.llmProvider.chat({ messages, jsonMode });
    const executionTimeMs = Date.now() - start;

    const promptText = messages
      .map((m) => `[${m.role}]: ${m.content}`)
      .join('\n');
    await this.logExecution(ctx, promptText, response, executionTimeMs);

    if (jsonMode) {
      return this.parseJsonResponse(response.content);
    }
    return response.content;
  }

  getProviderName(): string {
    return this.llmProvider.name;
  }

  private async logExecution(
    ctx: AiExecutionContext,
    prompt: string,
    response: LLMResponse,
    executionTimeMs: number,
  ): Promise<void> {
    await this.aiRepository.createPromptLog({
      organisationId: ctx.organisationId,
      userId: ctx.userId,
      feature: ctx.feature,
      prompt,
      response: response.content,
      model: response.model,
      promptTokens: response.promptTokens,
      completionTokens: response.completionTokens,
      totalTokens: response.totalTokens,
      executionTimeMs,
    });

    await this.usageService.incrementUsage(
      ctx.organisationId,
      UsageMetric.AI_REQUESTS,
    );
  }

  private parseJsonResponse(content: string): Record<string, unknown> {
    try {
      const parsed: unknown = JSON.parse(content);
      if (
        typeof parsed === 'object' &&
        parsed !== null &&
        !Array.isArray(parsed)
      ) {
        return parsed as Record<string, unknown>;
      }
      return { result: parsed };
    } catch {
      throw new BadRequestException(
        'AI provider returned an invalid JSON response. Please retry.',
      );
    }
  }
}
