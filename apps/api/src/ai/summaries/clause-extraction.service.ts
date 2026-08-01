import { Injectable } from '@nestjs/common';

import { AiDataContextService } from '../ai-data-context.service';
import { AiService } from '../ai.service';
import { AI_FEATURES } from '../constants/ai.constants';
import {
  buildClauseExtractionUserPrompt,
  CLAUSE_EXTRACTION_SYSTEM_PROMPT,
} from '../prompts/ai-prompts';

@Injectable()
export class ClauseExtractionService {
  constructor(
    private readonly aiService: AiService,
    private readonly dataContext: AiDataContextService,
  ) {}

  async extractClauses(
    contractId: string,
    organisationId: string,
    userId: string,
  ) {
    const context = await this.dataContext.getContractContext(
      contractId,
      organisationId,
    );
    const result = await this.aiService.generate(
      { organisationId, userId, feature: AI_FEATURES.CLAUSE_EXTRACTION },
      CLAUSE_EXTRACTION_SYSTEM_PROMPT,
      buildClauseExtractionUserPrompt(context),
    );

    return { contractId, clauses: result };
  }
}
