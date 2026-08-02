import { Module } from '@nestjs/common';

import { DatabaseModule } from '../database/database.module';
import { EmailTemplateService, MailerService } from './email.service';

@Module({
  imports: [DatabaseModule],
  providers: [EmailTemplateService, MailerService],
  exports: [EmailTemplateService, MailerService],
})
export class EmailModule {}
