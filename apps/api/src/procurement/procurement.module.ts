import { Module, forwardRef } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../database/database.module';
import { ApprovalWorkflowsModule } from '../approval-workflows/approval-workflows.module';
import { ProcurementController } from './procurement.controller';
import { ProcurementRepository } from './procurement.repository';
import { ProcurementService } from './procurement.service';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    forwardRef(() => ApprovalWorkflowsModule),
  ],
  controllers: [ProcurementController],
  providers: [ProcurementService, ProcurementRepository],
  exports: [ProcurementService, ProcurementRepository],
})
export class ProcurementModule {}
