import { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { createTestApp } from './helpers/create-test-app';

describe('Organisations (e2e)', () => {
  let app: INestApplication;
  const uniqueSuffix = Date.now();
  const organisationName = `Test Org ${uniqueSuffix}`;
  const email = `admin-${uniqueSuffix}@example.com`;
  const password = 'Password123!';
  let organisationSlug: string;
  let accessToken: string;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('registers a tenant and admin user', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        organisationName,
        email,
        password,
        firstName: 'Test',
        lastName: 'Admin',
      })
      .expect(201);

    expect(response.body.user.email).toBe(email);
    expect(response.body.user.role).toBe('ADMIN');
    expect(response.body.user.organisationId).toBeDefined();
    expect(response.body.user.passwordHash).toBeUndefined();
    expect(response.body.organisationSlug).toBeDefined();
    expect(response.body.accessToken).toBeDefined();

    organisationSlug = response.body.organisationSlug as string;
    accessToken = response.body.accessToken as string;
  });

  it('logs in with tenant slug and returns JWT', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        organisationSlug,
        email,
        password,
      })
      .expect(200);

    expect(response.body.accessToken).toBeDefined();
    expect(response.body.user.email).toBe(email);
    expect(response.body.user.passwordHash).toBeUndefined();

    accessToken = response.body.accessToken as string;
  });

  it('returns 401 for protected route without token', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/organisations/me')
      .expect(401);
  });

  it('returns current tenant organisation', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/organisations/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body.name).toBe(organisationName);
    expect(response.body.slug).toBe(organisationSlug);
    expect(response.body.users).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          email,
          role: 'ADMIN',
        }),
      ]),
    );
    expect(response.body.users[0].passwordHash).toBeUndefined();
  });

  it('updates current tenant organisation', async () => {
    const updatedName = `${organisationName} Updated`;

    const response = await request(app.getHttpServer())
      .patch('/api/v1/organisations/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: updatedName })
      .expect(200);

    expect(response.body.name).toBe(updatedName);
  });

  it('deletes current tenant organisation', async () => {
    const response = await request(app.getHttpServer())
      .delete('/api/v1/organisations/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body.message).toBe('Organisation deleted successfully');

    await request(app.getHttpServer())
      .get('/api/v1/organisations/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(404);
  });
});
