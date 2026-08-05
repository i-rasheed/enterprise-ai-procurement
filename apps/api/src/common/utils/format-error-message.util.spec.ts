import {
  formatErrorMessage,
  shouldFormatForClient,
} from './format-error-message.util';

describe('formatErrorMessage', () => {
  it('hides schema column names from prisma output', () => {
    expect(
      formatErrorMessage(
        'Invalid `this.prisma.user.findFirst()` invocation in /Users/mac/app.ts:11:29\n\nThe column `User.isPlatformAdmin` does not exist in the current database.',
      ),
    ).toBe(
      'The server database is not fully set up. Please try again later or contact support.',
    );
  });

  it('keeps short auth messages unchanged', () => {
    expect(formatErrorMessage('Invalid credentials')).toBe(
      'Invalid credentials',
    );
  });

  it('does not return code paths when no plain line exists', () => {
    expect(
      formatErrorMessage(
        'Invalid `this.prisma.user.findFirst()` invocation in /Users/mac/app.ts:11:29',
      ),
    ).toBe('Internal server error');
  });
});

describe('shouldFormatForClient', () => {
  it('flags internal error text', () => {
    expect(
      shouldFormatForClient(
        'Invalid `prisma.user.findFirst()` invocation in /Users/mac/app.ts:11',
        500,
      ),
    ).toBe(true);
  });

  it('leaves plain client errors alone', () => {
    expect(shouldFormatForClient('Invalid credentials', 401)).toBe(false);
  });
});
