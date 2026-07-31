import { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { createTestApp } from './helpers/create-test-app';

describe('Auth session (e2e)', () => {
  let app: INestApplication;
  const uniqueSuffix = Date.now();
  const organisationName = `Auth Org ${uniqueSuffix}`;
  const email = `auth-${uniqueSuffix}@example.com`;
  const password = 'Password123!';
  let organisationSlug: string;
  let refreshToken: string;
  let accessToken: string;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('registers tenant and returns organisationSlug', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        organisationName,
        email,
        password,
        firstName: 'Auth',
        lastName: 'User',
      })
      .expect(201);

    expect(response.body.organisationSlug).toBeDefined();
    expect(response.body.organisation.slug).toBe(
      response.body.organisationSlug,
    );
    expect(response.body.accessToken).toBeDefined();
    expect(response.body.refreshToken).toBeDefined();

    organisationSlug = response.body.organisationSlug as string;
    refreshToken = response.body.refreshToken as string;
    accessToken = response.body.accessToken as string;
  });

  it('logs in with organisationSlug from registration', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        organisationSlug,
        email,
        password,
      })
      .expect(200);

    expect(response.body.organisationSlug).toBe(organisationSlug);
    refreshToken = response.body.refreshToken as string;
    accessToken = response.body.accessToken as string;
  });

  it('refreshes tokens with rotation', async () => {
    const oldRefreshToken = refreshToken;

    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: oldRefreshToken })
      .expect(200);

    expect(response.body.accessToken).toBeDefined();
    expect(response.body.refreshToken).toBeDefined();
    expect(response.body.refreshToken).not.toBe(oldRefreshToken);
    expect(response.body.organisationSlug).toBe(organisationSlug);

    refreshToken = response.body.refreshToken as string;
    accessToken = response.body.accessToken as string;

    await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: oldRefreshToken })
      .expect(401);
  });

  it('accesses protected route with refreshed access token', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
  });

  it('logs out and rejects refresh token reuse', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/auth/logout')
      .send({ refreshToken })
      .expect(200);

    await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .send({ refreshToken })
      .expect(401);
  });
});
