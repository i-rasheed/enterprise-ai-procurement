import { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { createTestApp } from './helpers/create-test-app';
import { registerAndVerifyTestTenant } from './helpers/register-test-tenant';

describe('RFQs (e2e)', () => {
  let app: INestApplication;
  const uniqueSuffix = Date.now();
  const organisationName = `RFQ Org ${uniqueSuffix}`;
  const adminEmail = `admin-${uniqueSuffix}@example.com`;
  const pmEmail = `pm-${uniqueSuffix}@example.com`;
  const password = 'Password123!';
  let adminToken: string;
  let pmToken: string;
  let organisationId: string;
  let procurementRequestId: string;
  let vendorId: string;
  let rfqId: string;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('registers admin tenant', async () => {
    const response = await registerAndVerifyTestTenant(app, {
      organisationName,
      email: adminEmail,
      password,
      firstName: 'Admin',
      lastName: 'User',
    });

    adminToken = response.accessToken as string;
    organisationId = response.organisation.id as string;
  });

  it('invites procurement manager', async () => {
    const response = await request(app.getHttpServer())
      .post(`/api/v1/organisations/${organisationId}/invitations`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        email: pmEmail,
        role: 'PROCUREMENT_MANAGER',
      })
      .expect(201);

    const invitationToken = response.body.token as string;

    await request(app.getHttpServer())
      .post('/api/v1/invitations/accept')
      .send({
        token: invitationToken,
        firstName: 'Procurement',
        lastName: 'Manager',
        password,
      })
      .expect(201);

    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: pmEmail, password })
      .expect(200);

    pmToken = loginResponse.body.accessToken as string;
  });

  it('creates approved procurement request', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/api/v1/procurement-requests')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'RFQ source procurement request',
        description: 'Procurement request for RFQ testing.',
        justification: 'Required for RFQ lifecycle validation.',
        department: 'Operations',
        estimatedBudget: 1500.0,
        requiredDeliveryDate: '2026-10-31T00:00:00.000Z',
      })
      .expect(201);

    procurementRequestId = createResponse.body.id as string;

    await request(app.getHttpServer())
      .post(`/api/v1/procurement-requests/${procurementRequestId}/items`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        description: 'RFQ test equipment',
        quantity: 3,
        unitPrice: 500.0,
      })
      .expect(201);

    await request(app.getHttpServer())
      .patch(`/api/v1/procurement-requests/${procurementRequestId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ estimatedBudget: 1500.0 })
      .expect(200);

    const submitResponse = await request(app.getHttpServer())
      .post(`/api/v1/procurement-requests/${procurementRequestId}/submit`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({})
      .expect(200);

    const workflowId = submitResponse.body.approvalWorkflow.id as string;

    for (let level = 1; level <= 4; level += 1) {
      await request(app.getHttpServer())
        .post(`/api/v1/approval-workflows/${workflowId}/approve`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ comments: `Approved level ${level}` })
        .expect(200);
    }
  });

  it('creates vendor', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/vendors')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Globex Supplies Ltd',
        email: `contact-${uniqueSuffix}@globex.com`,
        registrationNumber: `RC-RFQ-${uniqueSuffix}`,
      })
      .expect(201);

    vendorId = response.body.id as string;
  });

  it('POST /rfqs creates draft RFQ', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/rfqs')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        procurementRequestId,
        title: 'Office Furniture RFQ Q3',
        description: 'Request for quotation for ergonomic office chairs.',
        closingDate: '2026-12-31T23:59:59.000Z',
      })
      .expect(201);

    expect(response.body.status).toBe('DRAFT');
    expect(response.body.rfqNumber).toMatch(/^RFQ-\d{4}-\d{6}$/);

    rfqId = response.body.id as string;
  });

  it('rejects publish without invited vendors', async () => {
    await request(app.getHttpServer())
      .post(`/api/v1/rfqs/${rfqId}/publish`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ publicationNote: 'Ready' })
      .expect(400);
  });

  it('rejects admin inviting vendor', async () => {
    await request(app.getHttpServer())
      .post(`/api/v1/rfqs/${rfqId}/vendors`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ vendorId })
      .expect(403);
  });

  it('POST /rfqs/:id/vendors invites vendor as procurement manager', async () => {
    const response = await request(app.getHttpServer())
      .post(`/api/v1/rfqs/${rfqId}/vendors`)
      .set('Authorization', `Bearer ${pmToken}`)
      .send({ vendorId })
      .expect(201);

    expect(response.body.vendors).toHaveLength(1);
    expect(response.body.vendors[0].vendor.id).toBe(vendorId);
  });

  it('rejects duplicate vendor invitation', async () => {
    await request(app.getHttpServer())
      .post(`/api/v1/rfqs/${rfqId}/vendors`)
      .set('Authorization', `Bearer ${pmToken}`)
      .send({ vendorId })
      .expect(409);
  });

  it('POST /rfqs/:id/publish publishes RFQ', async () => {
    const response = await request(app.getHttpServer())
      .post(`/api/v1/rfqs/${rfqId}/publish`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ publicationNote: 'RFQ ready for vendor responses.' })
      .expect(200);

    expect(response.body.status).toBe('PUBLISHED');
    expect(response.body.publicationNote).toBe(
      'RFQ ready for vendor responses.',
    );
  });

  it('PATCH /rfqs/:id allows closing date update on published RFQ', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/api/v1/rfqs/${rfqId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ closingDate: '2027-01-31T23:59:59.000Z' })
      .expect(200);

    expect(response.body.closingDate).toBe('2027-01-31T23:59:59.000Z');
  });

  it('rejects title update on published RFQ', async () => {
    await request(app.getHttpServer())
      .patch(`/api/v1/rfqs/${rfqId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Updated title' })
      .expect(400);
  });

  it('GET /rfqs lists RFQs with pagination', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/rfqs?status=PUBLISHED&page=1&limit=10')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body.rfqs.length).toBeGreaterThanOrEqual(1);
    expect(response.body.total).toBeGreaterThanOrEqual(1);
  });

  it('GET /rfqs/:id/vendors lists invited vendors', async () => {
    const response = await request(app.getHttpServer())
      .get(`/api/v1/rfqs/${rfqId}/vendors`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body.vendors).toHaveLength(1);
  });

  it('POST /rfqs/:id/close closes published RFQ', async () => {
    const response = await request(app.getHttpServer())
      .post(`/api/v1/rfqs/${rfqId}/close`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body.status).toBe('CLOSED');
  });

  it('rejects editing closed RFQ', async () => {
    await request(app.getHttpServer())
      .patch(`/api/v1/rfqs/${rfqId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ closingDate: '2027-02-28T23:59:59.000Z' })
      .expect(400);
  });

  it('creates and cancels draft RFQ', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/api/v1/rfqs')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        procurementRequestId,
        title: 'Draft RFQ to cancel',
        description: 'Temporary RFQ for cancel test.',
        closingDate: '2026-12-31T23:59:59.000Z',
      })
      .expect(201);

    const draftRfqId = createResponse.body.id as string;

    const cancelResponse = await request(app.getHttpServer())
      .post(`/api/v1/rfqs/${draftRfqId}/cancel`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(cancelResponse.body.status).toBe('CANCELLED');
  });
});
