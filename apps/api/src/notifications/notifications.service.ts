import { Injectable } from '@nestjs/common';

import { JobService } from '../jobs/job.service';
import { NotificationRepository } from './notification.repository';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly repository: NotificationRepository,
    private readonly jobService: JobService,
  ) {}

  async notify(
    userId: string,
    organisationId: string,
    type: string,
    title: string,
    message: string,
    metadata?: Record<string, unknown>,
  ) {
    const prefs = await this.repository.getPreferences(userId);
    const inAppEnabled = prefs?.inAppEnabled ?? true;

    if (inAppEnabled) {
      await this.repository.create({
        userId,
        organisationId,
        type,
        title,
        message,
        metadata,
      });
    }

    await this.jobService.enqueueNotification({
      userId,
      organisationId,
      type,
      title,
      message,
      metadata,
    });
  }

  getNotifications(userId: string, unreadOnly = false) {
    return this.repository.findByUser(userId, unreadOnly);
  }

  markRead(id: string, userId: string) {
    return this.repository.markRead(id, userId);
  }

  getPreferences(userId: string) {
    return this.repository.getPreferences(userId);
  }

  updatePreferences(
    userId: string,
    emailEnabled: boolean,
    inAppEnabled: boolean,
  ) {
    return this.repository.upsertPreferences(
      userId,
      emailEnabled,
      inAppEnabled,
    );
  }
}
