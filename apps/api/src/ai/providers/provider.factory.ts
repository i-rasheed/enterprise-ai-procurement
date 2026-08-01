import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AI_CONFIG_KEY } from '../config/ai.config';
import { LLMProvider } from './llm-provider.interface';
import { OpenAIProvider } from './openai.provider';

@Injectable()
export class LlmProviderFactory {
  constructor(
    private readonly configService: ConfigService,
    private readonly openAiProvider: OpenAIProvider,
  ) {}

  create(): LLMProvider {
    const provider = this.configService.get<string>(
      `${AI_CONFIG_KEY}.provider`,
      'openai',
    );

    switch (provider.toLowerCase()) {
      case 'openai':
        return this.openAiProvider;
      default:
        throw new ServiceUnavailableException(
          `Unsupported AI provider "${provider}". Configure AI_PROVIDER to a supported value.`,
        );
    }
  }
}
