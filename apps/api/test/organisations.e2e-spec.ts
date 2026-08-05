import { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { createTestApp } from './helpers/create-test-app';
import { registerAndVerifyTestTenant } from './helpers/register-test-tenant';

describe('Organisations tenant (e2e)', () => {
  let app: INestApplication;
  const uniqueSuffix = Date.now();
  const organisationName = `Test Org ${uniqueSuffix}`;
  const email = `admin-${uniqueSuffix}@example.com`;
  const password = 'Password123!';
  let accessToken: string;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('registers a tenant and admin user', async () => {
    const response = await registerAndVerifyTestTenant(app, {
      organisationName,
      email,
      password,
      firstName: 'Test',
      lastName: 'Admin',
    });

    expect(response.user.email).toBe(email);
    expect(response.user.role).toBe('ADMIN');
    expect(response.organisation.name).toBe(organisationName);
    accessToken = response.accessToken as string;
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
    expect(response.body.users).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ email, role: 'ADMIN' }),
      ]),
    );
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
