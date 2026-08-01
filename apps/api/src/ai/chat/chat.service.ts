import { Injectable } from '@nestjs/common';

import { AiDataContextService } from '../ai-data-context.service';
import { AiService } from '../ai.service';
import { AI_FEATURES } from '../constants/ai.constants';
import {
  buildChatUserPrompt,
  PROCUREMENT_ASSISTANT_SYSTEM_PROMPT,
} from '../prompts/ai-prompts';
import { VectorSearchService } from '../vector-search/vector-search.service';

export type ChatMessageInput = {
  role: 'user' | 'assistant';
  content: string;
};

@Injectable()
export class ChatService {
  constructor(
    private readonly aiService: AiService,
    private readonly dataContext: AiDataContextService,
    private readonly vectorSearch: VectorSearchService,
  ) {}

  async chat(
    organisationId: string,
    userId: string,
    question: string,
    contextHint?: string,
    history: ChatMessageInput[] = [],
  ) {
    const [orgContext, semanticResults] = await Promise.all([
      this.dataContext.getOrganisationContext(organisationId),
      this.vectorSearch.search(organisationId, question, undefined, 5),
    ]);

    const enrichedContext = [
      contextHint ? `User context: ${contextHint}` : '',
      `Organisation data:\n${orgContext}`,
      semanticResults.length
        ? `Relevant records:\n${JSON.stringify(semanticResults, null, 2)}`
        : '',
    ]
      .filter(Boolean)
      .join('\n\n');

    const messages: {
      role: 'system' | 'user' | 'assistant';
      content: string;
    }[] = [
      { role: 'system', content: PROCUREMENT_ASSISTANT_SYSTEM_PROMPT },
      ...history.map((msg) => ({ role: msg.role, content: msg.content })),
      {
        role: 'user',
        content: buildChatUserPrompt(question, enrichedContext),
      },
    ];

    const answer = await this.aiService.chat(
      { organisationId, userId, feature: AI_FEATURES.CHAT },
      messages,
      false,
    );

    return {
      question,
      answer: typeof answer === 'string' ? answer : JSON.stringify(answer),
      relevantRecords: semanticResults,
      provider: this.aiService.getProviderName(),
    };
  }
}
