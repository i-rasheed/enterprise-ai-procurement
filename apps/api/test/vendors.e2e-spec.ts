import { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { createTestApp } from './helpers/create-test-app';

describe('Vendors (e2e)', () => {
  let app: INestApplication;
  const uniqueSuffix = Date.now();
  const organisationName = `Vendor Org ${uniqueSuffix}`;
  const adminEmail = `admin-${uniqueSuffix}@example.com`;
  const password = 'Password123!';
  let accessToken: string;
  let vendorId: string;
  const registrationNumber = `RC-${uniqueSuffix}`;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('registers admin tenant', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        organisationName,
        email: adminEmail,
        password,
        firstName: 'Admin',
        lastName: 'User',
      })
      .expect(201);

    accessToken = response.body.accessToken as string;
  });

  it('POST /vendors creates a vendor', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/vendors')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Globex Supplies Ltd',
        email: `contact-${uniqueSuffix}@globex.com`,
        phone: '+1-555-0100',
        registrationNumber,
        category: 'Office Supplies',
      })
      .expect(201);

    expect(response.body.name).toBe('Globex Supplies Ltd');
    expect(response.body.registrationNumber).toBe(registrationNumber);

    vendorId = response.body.id as string;
  });

  it('rejects duplicate registration number', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/vendors')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Duplicate Vendor',
        email: `dup-${uniqueSuffix}@globex.com`,
        registrationNumber,
      })
      .expect(409);
  });

  it('GET /vendors lists vendors with pagination', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/vendors?page=1&limit=10')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body.vendors.length).toBeGreaterThanOrEqual(1);
    expect(response.body.page).toBe(1);
    expect(response.body.limit).toBe(10);
    expect(response.body.total).toBeGreaterThanOrEqual(1);
  });

  it('GET /vendors/search finds vendors by term', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/vendors/search?q=Globex')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body.vendors.length).toBeGreaterThanOrEqual(1);
    expect(response.body.vendors[0].name).toContain('Globex');
  });

  it('GET /vendors/:id returns vendor details', async () => {
    const response = await request(app.getHttpServer())
      .get(`/api/v1/vendors/${vendorId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body.id).toBe(vendorId);
  });

  it('PATCH /vendors/:id updates vendor', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/api/v1/vendors/${vendorId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ complianceStatus: 'VERIFIED', rating: 4.8 })
      .expect(200);

    expect(response.body.complianceStatus).toBe('VERIFIED');
    expect(response.body.rating).toBe(4.8);
  });

  it('DELETE /vendors/:id deletes vendor', async () => {
    const response = await request(app.getHttpServer())
      .delete(`/api/v1/vendors/${vendorId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body.message).toBe('Vendor deleted successfully');

    await request(app.getHttpServer())
      .get(`/api/v1/vendors/${vendorId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(404);
  });

  it('returns 401 without authentication', async () => {
    await request(app.getHttpServer()).get('/api/v1/vendors').expect(401);
  });
});
