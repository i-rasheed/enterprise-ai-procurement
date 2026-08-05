import { Injectable } from '@nestjs/common';

import { AiDataContextService } from '../ai-data-context.service';
import { AiService } from '../ai.service';
import { AI_FEATURES } from '../constants/ai.constants';
import {
  buildSpendAnalysisUserPrompt,
  SPEND_ANALYSIS_SYSTEM_PROMPT,
} from '../prompts/ai-prompts';

@Injectable()
export class SpendAnalysisService {
  constructor(
    private readonly aiService: AiService,
    private readonly dataContext: AiDataContextService,
  ) {}

  async analyze(organisationId: string, userId: string, department?: string) {
    let context = await this.dataContext.getSpendContext(organisationId);

    if (department) {
      context = `${context}\n\nFocus analysis on department: ${department}`;
    }

    const result = await this.aiService.generate(
      { organisationId, userId, feature: AI_FEATURES.SPEND_ANALYSIS },
      SPEND_ANALYSIS_SYSTEM_PROMPT,
      buildSpendAnalysisUserPrompt(context),
    );

    return result;
  }
}
