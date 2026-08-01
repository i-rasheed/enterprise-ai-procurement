import { Injectable } from '@nestjs/common';

import { AiDataContextService } from '../ai-data-context.service';
import { AiService } from '../ai.service';
import { AI_FEATURES } from '../constants/ai.constants';
import {
  buildInvoiceAnomalyUserPrompt,
  INVOICE_ANOMALY_SYSTEM_PROMPT,
} from '../prompts/ai-prompts';

@Injectable()
export class InvoiceAnomalyService {
  constructor(
    private readonly aiService: AiService,
    private readonly dataContext: AiDataContextService,
  ) {}

  async analyze(invoiceId: string, organisationId: string, userId: string) {
    const context = await this.dataContext.getInvoiceContext(
      invoiceId,
      organisationId,
    );
    const result = await this.aiService.generate(
      { organisationId, userId, feature: AI_FEATURES.INVOICE_ANOMALY },
      INVOICE_ANOMALY_SYSTEM_PROMPT,
      buildInvoiceAnomalyUserPrompt(context),
    );

    return { invoiceId, ...result };
  }
}
