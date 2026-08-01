import { Module } from '@nestjs/common';

import { DatabaseModule } from '../database/database.module';
import { JobsModule } from '../jobs/jobs.module';
import { NotificationRepository } from './notification.repository';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

@Module({
  imports: [DatabaseModule, JobsModule],
  controllers: [NotificationsController],
  providers: [NotificationRepository, NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
