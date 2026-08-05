import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';

import {
  AiJobData,
  EmailJobData,
  NotificationJobData,
  QUEUE_NAMES,
  ReportJobData,
} from './job.constants';

@Injectable()
export class JobService {
  private readonly logger = new Logger(JobService.name);

  constructor(
    @InjectQueue(QUEUE_NAMES.EMAIL) private readonly emailQueue: Queue,
    @InjectQueue(QUEUE_NAMES.NOTIFICATIONS)
    private readonly notificationQueue: Queue,
    @InjectQueue(QUEUE_NAMES.REPORTS) private readonly reportQueue: Queue,
    @InjectQueue(QUEUE_NAMES.AI) private readonly aiQueue: Queue,
    @InjectQueue(QUEUE_NAMES.SCHEDULED) private readonly scheduledQueue: Queue,
  ) {}

  enqueueEmail(data: EmailJobData) {
    return this.emailQueue.add('send-email', data, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
    });
  }

  enqueueNotification(data: NotificationJobData) {
    return this.notificationQueue.add('create-notification', data);
  }

  enqueueReport(data: ReportJobData) {
    return this.reportQueue.add('generate-report', data);
  }

  enqueueAiProcessing(data: AiJobData) {
    return this.aiQueue.add('process-ai', data, {
      attempts: 2,
    });
  }

  async scheduleRecurringJobs(): Promise<void> {
    await this.scheduledQueue.add(
      'contract-reminders',
      { task: 'contract-reminders' },
      { repeat: { pattern: '0 8 * * *' } } as object,
    );
    await this.scheduledQueue.add(
      'invoice-reminders',
      { task: 'invoice-reminders' },
      { repeat: { pattern: '0 9 * * *' } } as object,
    );
    await this.scheduledQueue.add(
      'cleanup-expired-tokens',
      { task: 'cleanup-expired-tokens' },
      { repeat: { pattern: '0 2 * * *' } } as object,
    );
    await this.scheduledQueue.add(
      'cleanup-pending-registrations',
      { task: 'cleanup-pending-registrations' },
      { repeat: { pattern: '15 2 * * *' } } as object,
    );
    this.logger.log('Recurring jobs scheduled');
  }
}
