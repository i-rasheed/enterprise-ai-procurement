import { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { createTestApp } from './helpers/create-test-app';

describe('Bids (e2e)', () => {
  let app: INestApplication;
  const uniqueSuffix = Date.now();
  const organisationName = `Bid Org ${uniqueSuffix}`;
  const adminEmail = `admin-${uniqueSuffix}@example.com`;
  const pmEmail = `pm-${uniqueSuffix}@example.com`;
  const vendorEmail = `vendor-${uniqueSuffix}@example.com`;
  const password = 'Password123!';
  let adminToken: string;
  let pmToken: string;
  let vendorToken: string;
  let organisationId: string;
  let rfqId: string;
  let vendorId: string;
  let bidId: string;

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

    adminToken = response.body.accessToken as string;
    organisationId = response.body.organisation.id as string;
  });

  it('invites procurement manager and vendor representative', async () => {
    for (const [email, role] of [
      [pmEmail, 'PROCUREMENT_MANAGER'],
      [vendorEmail, 'USER'],
    ] as const) {
      const inviteResponse = await request(app.getHttpServer())
        .post(`/api/v1/organisations/${organisationId}/invitations`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ email, role })
        .expect(201);

      await request(app.getHttpServer())
        .post('/api/v1/invitations/accept')
        .send({
          token: inviteResponse.body.token,
          firstName: role === 'PROCUREMENT_MANAGER' ? 'Procurement' : 'Vendor',
          lastName: role === 'PROCUREMENT_MANAGER' ? 'Manager' : 'Rep',
          password,
        })
        .expect(201);
    }

    const pmLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: pmEmail, password })
      .expect(200);

    pmToken = pmLogin.body.accessToken as string;

    const vendorLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: vendorEmail, password })
      .expect(200);

    vendorToken = vendorLogin.body.accessToken as string;
  });

  it('prepares approved procurement request and published RFQ', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/api/v1/procurement-requests')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Bid test procurement request',
        description: 'Procurement request for bid testing.',
        justification: 'Required for bid lifecycle validation.',
        department: 'Operations',
        estimatedBudget: 2400.0,
        requiredDeliveryDate: '2026-10-31T00:00:00.000Z',
      })
      .expect(201);

    const procurementRequestId = createResponse.body.id as string;

    await request(app.getHttpServer())
      .post(`/api/v1/procurement-requests/${procurementRequestId}/items`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        description: 'Office chairs',
        quantity: 10,
        unitPrice: 240.0,
      })
      .expect(201);

    await request(app.getHttpServer())
      .patch(`/api/v1/procurement-requests/${procurementRequestId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ estimatedBudget: 2400.0 })
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

    const rfqResponse = await request(app.getHttpServer())
      .post('/api/v1/rfqs')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        procurementRequestId,
        title: 'Office Furniture RFQ for bids',
        description: 'Request for quotation for office chairs.',
        closingDate: '2027-12-31T23:59:59.000Z',
      })
      .expect(201);

    rfqId = rfqResponse.body.id as string;

    const vendorResponse = await request(app.getHttpServer())
      .post('/api/v1/vendors')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Globex Supplies Ltd',
        email: vendorEmail,
        registrationNumber: `RC-BID-${uniqueSuffix}`,
      })
      .expect(201);

    vendorId = vendorResponse.body.id as string;

    await request(app.getHttpServer())
      .post(`/api/v1/rfqs/${rfqId}/vendors`)
      .set('Authorization', `Bearer ${pmToken}`)
      .send({ vendorId })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/api/v1/rfqs/${rfqId}/publish`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ publicationNote: 'Published for vendor bids.' })
      .expect(200);
  });

  it('POST /bids creates draft bid for invited vendor', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/bids')
      .set('Authorization', `Bearer ${vendorToken}`)
      .send({
        rfqId,
        vendorId,
        currency: 'USD',
        deliveryPeriod: '30 days from purchase order',
        paymentTerms: 'Net 30',
        warrantyPeriod: '12 months',
      })
      .expect(201);

    expect(response.body.status).toBe('DRAFT');
    expect(response.body.bidNumber).toMatch(/^BID-\d{4}-\d{6}$/);

    bidId = response.body.id as string;
  });

  it('rejects duplicate active bid', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/bids')
      .set('Authorization', `Bearer ${vendorToken}`)
      .send({ rfqId, vendorId })
      .expect(409);
  });

  it('POST /bids/:id/items adds line item and recalculates total', async () => {
    const response = await request(app.getHttpServer())
      .post(`/api/v1/bids/${bidId}/items`)
      .set('Authorization', `Bearer ${vendorToken}`)
      .send({
        description: 'Ergonomic office chair model X200',
        quantity: 10,
        unitPrice: 240.0,
      })
      .expect(201);

    expect(response.body.totalAmount).toBe(2400);
    expect(response.body.items).toHaveLength(1);
  });

  it('POST /bids/:id/attachments stores attachment metadata', async () => {
    const response = await request(app.getHttpServer())
      .post(`/api/v1/bids/${bidId}/attachments`)
      .set('Authorization', `Bearer ${vendorToken}`)
      .send({
        fileName: 'quotation.pdf',
        fileUrl: 'https://storage.example.com/bids/quotation.pdf',
        fileType: 'application/pdf',
      })
      .expect(201);

    expect(response.body.attachments).toHaveLength(1);
  });

  it('POST /bids/:id/submit submits bid', async () => {
    const response = await request(app.getHttpServer())
      .post(`/api/v1/bids/${bidId}/submit`)
      .set('Authorization', `Bearer ${vendorToken}`)
      .send({ submissionNote: 'Final quotation submitted for review.' })
      .expect(200);

    expect(response.body.status).toBe('SUBMITTED');
    expect(response.body.totalAmount).toBe(2400);
  });

  it('rejects modifying submitted bid', async () => {
    await request(app.getHttpServer())
      .patch(`/api/v1/bids/${bidId}`)
      .set('Authorization', `Bearer ${vendorToken}`)
      .send({ paymentTerms: 'Net 60' })
      .expect(400);
  });

  it('GET /rfqs/:rfqId/bids lists bids for procurement team', async () => {
    const response = await request(app.getHttpServer())
      .get(`/api/v1/rfqs/${rfqId}/bids`)
      .set('Authorization', `Bearer ${pmToken}`)
      .expect(200);

    expect(response.body.bids.length).toBeGreaterThanOrEqual(1);
    expect(response.body.bids[0].status).toBe('SUBMITTED');
  });

  it('GET /vendors/:vendorId/bids lists vendor bids', async () => {
    const response = await request(app.getHttpServer())
      .get(`/api/v1/vendors/${vendorId}/bids`)
      .set('Authorization', `Bearer ${vendorToken}`)
      .expect(200);

    expect(response.body.bids.length).toBeGreaterThanOrEqual(1);
  });

  it('POST /bids/:id/withdraw withdraws submitted bid', async () => {
    const response = await request(app.getHttpServer())
      .post(`/api/v1/bids/${bidId}/withdraw`)
      .set('Authorization', `Bearer ${vendorToken}`)
      .expect(200);

    expect(response.body.status).toBe('WITHDRAWN');
  });
});
