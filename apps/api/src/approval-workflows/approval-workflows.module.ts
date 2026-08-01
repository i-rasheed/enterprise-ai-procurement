import { Module, forwardRef } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../database/database.module';
import { ProcurementModule } from '../procurement/procurement.module';
import { UsersModule } from '../users/users.module';
import { ApprovalWorkflowController } from './approval-workflow.controller';
import { ApprovalWorkflowService } from './approval-workflow.service';
import { ApprovalRepository } from './approval.repository';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    UsersModule,
    forwardRef(() => ProcurementModule),
  ],
  controllers: [ApprovalWorkflowController],
  providers: [ApprovalWorkflowService, ApprovalRepository],
  exports: [ApprovalWorkflowService, ApprovalRepository],
})
export class ApprovalWorkflowsModule {}
