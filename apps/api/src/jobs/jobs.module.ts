import { BullModule } from '@nestjs/bullmq';
import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { EmailModule } from '../email/email.module';
import { DatabaseModule } from '../database/database.module';
import { QUEUE_NAMES } from './job.constants';
import {
  AiProcessor,
  EmailProcessor,
  NotificationProcessor,
  ReportProcessor,
  ScheduledProcessor,
} from './job.processors';
import { JobService } from './job.service';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    EmailModule,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const url = configService.get<string>('REDIS_URL');
        return {
          connection: url
            ? { url }
            : {
                host: '127.0.0.1',
                port: 6379,
                lazyConnect: true,
                maxRetriesPerRequest: null,
                enableOfflineQueue: false,
              },
        };
      },
      inject: [ConfigService],
    }),
    BullModule.registerQueue(
      { name: QUEUE_NAMES.EMAIL },
      { name: QUEUE_NAMES.NOTIFICATIONS },
      { name: QUEUE_NAMES.REPORTS },
      { name: QUEUE_NAMES.AI },
      { name: QUEUE_NAMES.SCHEDULED },
    ),
  ],
  providers: [
    JobService,
    EmailProcessor,
    NotificationProcessor,
    ReportProcessor,
    AiProcessor,
    ScheduledProcessor,
  ],
  exports: [JobService, BullModule],
})
export class JobsModule implements OnModuleInit {
  constructor(private readonly jobService: JobService) {}

  async onModuleInit(): Promise<void> {
    if (process.env.NODE_ENV !== 'test') {
      await this.jobService.scheduleRecurringJobs().catch(() => undefined);
    }
  }
}
