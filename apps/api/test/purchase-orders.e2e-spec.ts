import { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { createTestApp } from './helpers/create-test-app';

describe('Purchase Orders (e2e)', () => {
  let app: INestApplication;
  const uniqueSuffix = Date.now();
  const organisationName = `PO Org ${uniqueSuffix}`;
  const adminEmail = `admin-po-${uniqueSuffix}@example.com`;
  const pmEmail = `pm-po-${uniqueSuffix}@example.com`;
  const vendorEmail = `vendor-po-${uniqueSuffix}@example.com`;
  const password = 'Password123!';
  let adminToken: string;
  let pmToken: string;
  let vendorToken: string;
  let organisationId: string;
  let procurementRequestId: string;
  let bidId: string;
  let awardId: string;
  let vendorId: string;
  let purchaseOrderId: string;

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

    pmToken = (
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: pmEmail, password })
        .expect(200)
    ).body.accessToken as string;

    vendorToken = (
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: vendorEmail, password })
        .expect(200)
    ).body.accessToken as string;
  });

  it('prepares awarded bid', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/api/v1/procurement-requests')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'PO test procurement request',
        description: 'Procurement request for purchase order testing.',
        justification: 'Required for purchase order lifecycle validation.',
        department: 'Operations',
        estimatedBudget: 2400.0,
        requiredDeliveryDate: '2026-10-31T00:00:00.000Z',
      })
      .expect(201);

    procurementRequestId = createResponse.body.id as string;

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
        title: 'PO RFQ',
        description: 'RFQ for purchase order testing.',
        closingDate: '2027-12-31T23:59:59.000Z',
      })
      .expect(201);

    const rfqId = rfqResponse.body.id as string;

    const vendorResponse = await request(app.getHttpServer())
      .post('/api/v1/vendors')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Globex Supplies Ltd',
        email: vendorEmail,
        registrationNumber: `RC-PO-${uniqueSuffix}`,
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
      .send({})
      .expect(200);

    const bidResponse = await request(app.getHttpServer())
      .post('/api/v1/bids')
      .set('Authorization', `Bearer ${vendorToken}`)
      .send({ rfqId, vendorId })
      .expect(201);

    bidId = bidResponse.body.id as string;

    await request(app.getHttpServer())
      .post(`/api/v1/bids/${bidId}/items`)
      .set('Authorization', `Bearer ${vendorToken}`)
      .send({
        description: 'Ergonomic office chair model X200',
        quantity: 10,
        unitPrice: 240.0,
      })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/api/v1/bids/${bidId}/submit`)
      .set('Authorization', `Bearer ${vendorToken}`)
      .send({})
      .expect(200);

    await request(app.getHttpServer())
      .post('/api/v1/bid-evaluations')
      .set('Authorization', `Bearer ${pmToken}`)
      .send({
        bidId,
        technicalScore: 85,
        commercialScore: 90,
        complianceScore: 88,
        deliveryScore: 80,
        comments: 'Strong technical proposal.',
      })
      .expect(201);

    const awardResponse = await request(app.getHttpServer())
      .post('/api/v1/awards')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        bidId,
        awardReason: 'Best overall score with competitive pricing.',
      })
      .expect(201);

    awardId = awardResponse.body.id as string;
  });

  it('POST /purchase-orders creates draft purchase order', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/purchase-orders')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        awardId,
        expectedDeliveryDate: '2026-11-30T00:00:00.000Z',
        deliveryAddress: '123 Procurement Way, Suite 400, Lagos',
        notes: 'Deliver to loading dock B.',
      })
      .expect(201);

    expect(response.body.status).toBe('DRAFT');
    expect(response.body.awardId).toBe(awardId);
    expect(response.body.totalAmount).toBe(2400);
    expect(response.body.items).toHaveLength(1);
    expect(response.body.poNumber).toMatch(/^PO-\d{4}-\d{6}$/);

    purchaseOrderId = response.body.id as string;
  });

  it('rejects duplicate active purchase order for same award', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/purchase-orders')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        awardId,
        expectedDeliveryDate: '2026-11-30T00:00:00.000Z',
      })
      .expect(409);
  });

  it('PATCH /purchase-orders/:id updates draft purchase order', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/api/v1/purchase-orders/${purchaseOrderId}`)
      .set('Authorization', `Bearer ${pmToken}`)
      .send({
        paymentTerms: 'Net 45',
        notes: 'Updated delivery instructions.',
      })
      .expect(200);

    expect(response.body.paymentTerms).toBe('Net 45');
    expect(response.body.notes).toBe('Updated delivery instructions.');
  });

  it('POST /purchase-orders/:id/issue issues purchase order', async () => {
    const response = await request(app.getHttpServer())
      .post(`/api/v1/purchase-orders/${purchaseOrderId}/issue`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        issueDate: '2026-08-01T12:00:00.000Z',
        notes: 'Please confirm receipt within 48 hours.',
      })
      .expect(200);

    expect(response.body.status).toBe('ISSUED');
    expect(response.body.issueDate).toBe('2026-08-01T12:00:00.000Z');
  });

  it('rejects editing issued purchase order', async () => {
    await request(app.getHttpServer())
      .patch(`/api/v1/purchase-orders/${purchaseOrderId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ notes: 'Should fail' })
      .expect(400);
  });

  it('POST /purchase-orders/:id/acknowledge allows vendor acknowledgement', async () => {
    const response = await request(app.getHttpServer())
      .post(`/api/v1/purchase-orders/${purchaseOrderId}/acknowledge`)
      .set('Authorization', `Bearer ${vendorToken}`)
      .send({
        notes: 'Purchase order acknowledged. Delivery scheduled for November.',
      })
      .expect(200);

    expect(response.body.status).toBe('ACKNOWLEDGED');
  });

  it('GET /purchase-orders searches purchase orders', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/purchase-orders')
      .query({ search: 'PO-' })
      .set('Authorization', `Bearer ${pmToken}`)
      .expect(200);

    expect(response.body.total).toBeGreaterThanOrEqual(1);
    expect(response.body.purchaseOrders[0].id).toBe(purchaseOrderId);
  });

  it('GET /vendors/:vendorId/purchase-orders lists vendor purchase orders', async () => {
    const response = await request(app.getHttpServer())
      .get(`/api/v1/vendors/${vendorId}/purchase-orders`)
      .set('Authorization', `Bearer ${vendorToken}`)
      .expect(200);

    expect(response.body.purchaseOrders.length).toBeGreaterThanOrEqual(1);
    expect(response.body.purchaseOrders[0].vendor.id).toBe(vendorId);
  });

  it('POST /purchase-orders/:id/cancel cancels purchase order', async () => {
    const response = await request(app.getHttpServer())
      .post(`/api/v1/purchase-orders/${purchaseOrderId}/cancel`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({})
      .expect(200);

    expect(response.body.purchaseOrder.status).toBe('CANCELLED');
  });

  it('rejects editing cancelled purchase order', async () => {
    await request(app.getHttpServer())
      .patch(`/api/v1/purchase-orders/${purchaseOrderId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ notes: 'Should fail' })
      .expect(400);
  });
});
