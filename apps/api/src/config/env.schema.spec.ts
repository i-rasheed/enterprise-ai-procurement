import { validateEnv } from './env.schema';

describe('envSchema', () => {
  it('validates required environment variables', () => {
    const env = validateEnv({
      NODE_ENV: 'test',
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/test',
      JWT_ACCESS_SECRET: 'test-access-secret-min-32-chars',
      JWT_REFRESH_SECRET: 'test-refresh-secret-min-32-chars',
    });

    expect(env.NODE_ENV).toBe('test');
    expect(env.PORT).toBe(3001);
    expect(env.ENABLE_RESPONSE_WRAPPER).toBe(true);
  });

  it('throws on missing DATABASE_URL', () => {
    expect(() =>
      validateEnv({
        JWT_ACCESS_SECRET: 'test-access-secret-min-32-chars',
        JWT_REFRESH_SECRET: 'test-refresh-secret-min-32-chars',
      }),
    ).toThrow(/Environment validation failed/);
  });
});
