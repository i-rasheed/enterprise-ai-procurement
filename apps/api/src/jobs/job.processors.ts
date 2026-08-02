import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';

import { MailerService } from '../email/email.service';
import {
  AiJobData,
  EmailJobData,
  NotificationJobData,
  QUEUE_NAMES,
  ReportJobData,
  ScheduledJobData,
} from './job.constants';

@Processor(QUEUE_NAMES.EMAIL)
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(private readonly mailerService: MailerService) {
    super();
  }

  async process(job: Job<EmailJobData>): Promise<void> {
    this.logger.log(`Processing email job ${job.id} to ${job.data.to}`);

    if (job.data.templateKey) {
      await this.mailerService.sendTemplate(
        job.data.to,
        job.data.templateKey,
        job.data.variables ?? {},
      );
      return;
    }

    await this.mailerService.sendRaw(
      job.data.to,
      job.data.subject,
      job.data.html ?? job.data.subject,
      job.data.text,
    );
  }
}

@Processor(QUEUE_NAMES.NOTIFICATIONS)
export class NotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationProcessor.name);

  process(job: Job<NotificationJobData>): Promise<void> {
    this.logger.log(`Processing notification job ${job.id}`);
    return Promise.resolve();
  }
}

@Processor(QUEUE_NAMES.REPORTS)
export class ReportProcessor extends WorkerHost {
  private readonly logger = new Logger(ReportProcessor.name);

  process(job: Job<ReportJobData>): Promise<void> {
    this.logger.log(
      `Processing report job ${job.id}: ${JSON.stringify(job.data)}`,
    );
    return Promise.resolve();
  }
}

@Processor(QUEUE_NAMES.AI)
export class AiProcessor extends WorkerHost {
  private readonly logger = new Logger(AiProcessor.name);

  process(job: Job<AiJobData>): Promise<void> {
    this.logger.log(`Processing AI job ${job.id}: ${job.data.feature}`);
    return Promise.resolve();
  }
}

@Processor(QUEUE_NAMES.SCHEDULED)
export class ScheduledProcessor extends WorkerHost {
  private readonly logger = new Logger(ScheduledProcessor.name);

  process(job: Job<ScheduledJobData>): Promise<void> {
    this.logger.log(`Running scheduled task: ${job.data.task}`);
    return Promise.resolve();
  }
}
