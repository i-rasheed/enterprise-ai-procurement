import { BadRequestException } from '@nestjs/common';

import { assertPasswordPolicy } from './sanitize-input.pipe';
import { SanitizeInputPipe } from './sanitize-input.pipe';

describe('SanitizeInputPipe', () => {
  const pipe = new SanitizeInputPipe();

  it('strips HTML tags from strings', () => {
    expect(pipe.transform('<script>alert(1)</script>hello')).toBe(
      'alert(1)hello',
    );
    expect(pipe.transform('<b>Test</b>')).toBe('Test');
  });

  it('sanitizes nested objects', () => {
    const result = pipe.transform({
      name: '<b>Test</b>',
      nested: { value: '<img onerror=1>' },
    }) as Record<string, unknown>;
    expect(result.name).toBe('Test');
  });
});

describe('assertPasswordPolicy', () => {
  it('accepts strong passwords', () => {
    expect(() => assertPasswordPolicy('Password123!')).not.toThrow();
  });

  it('rejects weak passwords', () => {
    expect(() => assertPasswordPolicy('short')).toThrow(BadRequestException);
    expect(() => assertPasswordPolicy('passwordonly')).toThrow(
      BadRequestException,
    );
  });
});
