import { Injectable } from '@nestjs/common';

import { AiDataContextService } from '../ai-data-context.service';
import { AiService } from '../ai.service';
import { AI_FEATURES } from '../constants/ai.constants';
import {
  buildContractSummaryUserPrompt,
  CONTRACT_SUMMARY_SYSTEM_PROMPT,
} from '../prompts/ai-prompts';

@Injectable()
export class ContractSummaryService {
  constructor(
    private readonly aiService: AiService,
    private readonly dataContext: AiDataContextService,
  ) {}

  async summarize(contractId: string, organisationId: string, userId: string) {
    const context = await this.dataContext.getContractContext(
      contractId,
      organisationId,
    );
    const result = await this.aiService.generate(
      { organisationId, userId, feature: AI_FEATURES.CONTRACT_SUMMARY },
      CONTRACT_SUMMARY_SYSTEM_PROMPT,
      buildContractSummaryUserPrompt(context),
    );

    return { contractId, ...result };
  }
}
