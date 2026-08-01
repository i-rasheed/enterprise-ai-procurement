import { Global, Module } from '@nestjs/common';

import { DatabaseModule } from '../database/database.module';
import { AuditRepository } from './audit.repository';
import { AuditService } from './audit.service';

@Global()
@Module({
  imports: [DatabaseModule],
  providers: [AuditRepository, AuditService],
  exports: [AuditService, AuditRepository],
})
export class AuditModule {}
