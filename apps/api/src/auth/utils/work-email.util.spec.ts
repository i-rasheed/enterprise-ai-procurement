import { BadRequestException } from '@nestjs/common';

import { assertWorkEmail, getEmailDomain, isPersonalEmailDomain } from './work-email.util';

describe('work-email.util', () => {
  it('extracts email domain', () => {
    expect(getEmailDomain('Admin@Acme.COM')).toBe('acme.com');
  });

  it('detects personal email domains', () => {
    expect(isPersonalEmailDomain('gmail.com')).toBe(true);
    expect(isPersonalEmailDomain('acme.com')).toBe(false);
  });

  it('rejects personal email for organisation registration', () => {
    expect(() => assertWorkEmail('user@gmail.com')).toThrow(BadRequestException);
    expect(() => assertWorkEmail('admin@acme.com')).not.toThrow();
  });

  it('allows personal email when explicitly enabled', () => {
    expect(() =>
      assertWorkEmail('user@gmail.com', { allowPersonalEmail: true }),
    ).not.toThrow();
  });
});
