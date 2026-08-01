import { Injectable } from '@nestjs/common';

import { AiDataContextService } from '../ai-data-context.service';
import { AiService } from '../ai.service';
import { AI_FEATURES } from '../constants/ai.constants';
import {
  buildProcurementRecommendationsUserPrompt,
  PROCUREMENT_RECOMMENDATIONS_SYSTEM_PROMPT,
} from '../prompts/ai-prompts';

@Injectable()
export class ProcurementRecommendationsService {
  constructor(
    private readonly aiService: AiService,
    private readonly dataContext: AiDataContextService,
  ) {}

  async getRecommendations(
    procurementId: string,
    organisationId: string,
    userId: string,
  ) {
    const context = await this.dataContext.getProcurementContext(
      procurementId,
      organisationId,
    );
    const result = await this.aiService.generate(
      {
        organisationId,
        userId,
        feature: AI_FEATURES.PROCUREMENT_RECOMMENDATIONS,
      },
      PROCUREMENT_RECOMMENDATIONS_SYSTEM_PROMPT,
      buildProcurementRecommendationsUserPrompt(context),
    );

    return { procurementRequestId: procurementId, ...result };
  }
}
