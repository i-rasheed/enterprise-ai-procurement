import { BadRequestException } from '@nestjs/common';

import { BLOCKED_PERSONAL_EMAIL_DOMAINS } from '../constants/blocked-email-domains.constants';

export function getEmailDomain(email: string): string {
  const normalized = email.trim().toLowerCase();
  const atIndex = normalized.lastIndexOf('@');

  if (atIndex <= 0 || atIndex === normalized.length - 1) {
    throw new BadRequestException('Enter a valid work email address');
  }

  return normalized.slice(atIndex + 1);
}

export function isPersonalEmailDomain(domain: string): boolean {
  return BLOCKED_PERSONAL_EMAIL_DOMAINS.has(domain.trim().toLowerCase());
}

export function assertWorkEmail(
  email: string,
  options: { allowPersonalEmail?: boolean } = {},
): void {
  if (options.allowPersonalEmail) {
    return;
  }

  const domain = getEmailDomain(email);

  if (isPersonalEmailDomain(domain)) {
    throw new BadRequestException(
      'Use your company work email to register an organisation. Personal email providers such as Gmail are not allowed.',
    );
  }
}
