import { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { createTestApp } from './helpers/create-test-app';

describe('Procurement Requests (e2e)', () => {
  let app: INestApplication;
  const uniqueSuffix = Date.now();
  const organisationName = `Procurement Org ${uniqueSuffix}`;
  const adminEmail = `admin-${uniqueSuffix}@example.com`;
  const password = 'Password123!';
  let accessToken: string;
  let requestId: string;
  let itemId: string;

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

  it('POST /procurement-requests creates a draft', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/procurement-requests')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'Office furniture refresh Q3',
        description: 'Replace aging chairs and desks across the Lagos office.',
        justification:
          'Current furniture is beyond repair and affecting staff productivity.',
        department: 'Operations',
        estimatedBudget: 2500.0,
        currency: 'USD',
        priority: 'MEDIUM',
        requiredDeliveryDate: '2026-10-31T00:00:00.000Z',
      })
      .expect(201);

    expect(response.body.status).toBe('DRAFT');
    expect(response.body.title).toBe('Office furniture refresh Q3');
    expect(response.body.items).toEqual([]);

    requestId = response.body.id as string;
  });

  it('POST /procurement-requests/:id/items adds a line item', async () => {
    const response = await request(app.getHttpServer())
      .post(`/api/v1/procurement-requests/${requestId}/items`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        description: 'Ergonomic office chairs',
        quantity: 10,
        unitPrice: 250.0,
      })
      .expect(201);

    expect(response.body.items).toHaveLength(1);
    expect(response.body.items[0].totalPrice).toBe(2500);
    expect(response.body.totalCost).toBe(2500);

    itemId = response.body.items[0].id as string;
  });

  it('rejects submit when budget does not match line items', async () => {
    await request(app.getHttpServer())
      .post(`/api/v1/procurement-requests/${requestId}/submit`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ submissionNote: 'Ready for review.' })
      .expect(400);

    await request(app.getHttpServer())
      .patch(`/api/v1/procurement-requests/${requestId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ estimatedBudget: 2500.0 })
      .expect(200);
  });

  it('POST /procurement-requests/:id/submit submits the request', async () => {
    const response = await request(app.getHttpServer())
      .post(`/api/v1/procurement-requests/${requestId}/submit`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ submissionNote: 'Ready for procurement review.' })
      .expect(200);

    expect(response.body.status).toBe('SUBMITTED');
    expect(response.body.submissionNote).toBe('Ready for procurement review.');
  });

  it('rejects editing submitted request', async () => {
    await request(app.getHttpServer())
      .patch(`/api/v1/procurement-requests/${requestId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ title: 'Updated title' })
      .expect(400);
  });

  it('GET /procurement-requests lists requests with filters', async () => {
    const response = await request(app.getHttpServer())
      .get(
        '/api/v1/procurement-requests?status=SUBMITTED&priority=MEDIUM&department=Operations&page=1&limit=10',
      )
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body.requests.length).toBeGreaterThanOrEqual(1);
    expect(response.body.page).toBe(1);
    expect(response.body.total).toBeGreaterThanOrEqual(1);
  });

  it('GET /procurement-requests/:id returns request details', async () => {
    const response = await request(app.getHttpServer())
      .get(`/api/v1/procurement-requests/${requestId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body.id).toBe(requestId);
    expect(response.body.status).toBe('SUBMITTED');
  });

  it('GET /procurement-requests supports search', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/procurement-requests?search=office%20furniture')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body.requests.length).toBeGreaterThanOrEqual(1);
  });

  it('creates second draft for delete workflow', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/api/v1/procurement-requests')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'Draft to delete',
        description: 'Temporary draft for delete test.',
        justification: 'Testing delete workflow.',
        department: 'IT',
        estimatedBudget: 100.0,
        requiredDeliveryDate: '2026-11-30T00:00:00.000Z',
      })
      .expect(201);

    const draftId = createResponse.body.id as string;

    const itemResponse = await request(app.getHttpServer())
      .post(`/api/v1/procurement-requests/${draftId}/items`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        description: 'Test item',
        quantity: 1,
        unitPrice: 100.0,
      })
      .expect(201);

    const removableItemId = itemResponse.body.items[0].id as string;

    await request(app.getHttpServer())
      .delete(`/api/v1/procurement-requests/items/${removableItemId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    await request(app.getHttpServer())
      .delete(`/api/v1/procurement-requests/${draftId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
  });

  it('rejects submit with zero line items', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/api/v1/procurement-requests')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'Empty draft',
        description: 'No items yet.',
        justification: 'Testing empty submit.',
        department: 'Finance',
        estimatedBudget: 500.0,
        requiredDeliveryDate: '2026-12-31T00:00:00.000Z',
      })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/api/v1/procurement-requests/${createResponse.body.id}/submit`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({})
      .expect(400);
  });

  it('rejects removing item from submitted request', async () => {
    await request(app.getHttpServer())
      .delete(`/api/v1/procurement-requests/items/${itemId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(400);
  });
});
