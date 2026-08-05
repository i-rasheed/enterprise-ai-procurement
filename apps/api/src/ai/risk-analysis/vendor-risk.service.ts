import { Injectable } from '@nestjs/common';

import { AiDataContextService } from '../ai-data-context.service';
import { AiService } from '../ai.service';
import { AI_FEATURES } from '../constants/ai.constants';
import {
  buildVendorRiskUserPrompt,
  VENDOR_RISK_SYSTEM_PROMPT,
} from '../prompts/ai-prompts';

@Injectable()
export class VendorRiskService {
  constructor(
    private readonly aiService: AiService,
    private readonly dataContext: AiDataContextService,
  ) {}

  async analyzeRisk(vendorId: string, organisationId: string, userId: string) {
    const context = await this.dataContext.getVendorContext(
      vendorId,
      organisationId,
    );
    const result = await this.aiService.generate(
      { organisationId, userId, feature: AI_FEATURES.VENDOR_RISK },
      VENDOR_RISK_SYSTEM_PROMPT,
      buildVendorRiskUserPrompt(context),
    );

    return { vendorId, ...result };
  }
}
