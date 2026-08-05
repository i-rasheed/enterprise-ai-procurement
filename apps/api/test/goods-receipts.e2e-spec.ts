import { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { createTestApp } from './helpers/create-test-app';
import { registerAndVerifyTestTenant } from './helpers/register-test-tenant';

describe('Goods Receipts (e2e)', () => {
  let app: INestApplication;
  const uniqueSuffix = Date.now();
  const organisationName = `GRN Org ${uniqueSuffix}`;
  const adminEmail = `admin-grn-${uniqueSuffix}@example.com`;
  const pmEmail = `pm-grn-${uniqueSuffix}@example.com`;
  const warehouseEmail = `warehouse-grn-${uniqueSuffix}@example.com`;
  const vendorEmail = `vendor-grn-${uniqueSuffix}@example.com`;
  const password = 'Password123!';
  let adminToken: string;
  let pmToken: string;
  let warehouseToken: string;
  let vendorToken: string;
  let organisationId: string;
  let procurementRequestId: string;
  let bidId: string;
  let awardId: string;
  let vendorId: string;
  let purchaseOrderId: string;
  let goodsReceiptId: string;
  let goodsReceiptItemId: string;

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

  it('invites procurement manager, warehouse staff, and vendor', async () => {
    for (const [email, role] of [
      [pmEmail, 'PROCUREMENT_MANAGER'],
      [warehouseEmail, 'USER'],
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
          firstName:
            role === 'PROCUREMENT_MANAGER'
              ? 'Procurement'
              : email === warehouseEmail
                ? 'Warehouse'
                : 'Vendor',
          lastName:
            role === 'PROCUREMENT_MANAGER'
              ? 'Manager'
              : email === warehouseEmail
                ? 'Staff'
                : 'Rep',
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

    warehouseToken = (
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: warehouseEmail, password })
        .expect(200)
    ).body.accessToken as string;

    vendorToken = (
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: vendorEmail, password })
        .expect(200)
    ).body.accessToken as string;
  });

  it('prepares acknowledged purchase order', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/api/v1/procurement-requests')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'GRN test procurement request',
        description: 'Procurement request for goods receipt testing.',
        justification: 'Required for goods receipt lifecycle validation.',
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
        title: 'GRN RFQ',
        description: 'RFQ for goods receipt testing.',
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
        registrationNumber: `RC-GRN-${uniqueSuffix}`,
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

    const poResponse = await request(app.getHttpServer())
      .post('/api/v1/purchase-orders')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        awardId,
        expectedDeliveryDate: '2026-11-30T00:00:00.000Z',
        deliveryAddress: '123 Procurement Way, Suite 400, Lagos',
      })
      .expect(201);

    purchaseOrderId = poResponse.body.id as string;

    await request(app.getHttpServer())
      .post(`/api/v1/purchase-orders/${purchaseOrderId}/issue`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ issueDate: '2026-08-01T12:00:00.000Z' })
      .expect(200);

    await request(app.getHttpServer())
      .post(`/api/v1/purchase-orders/${purchaseOrderId}/acknowledge`)
      .set('Authorization', `Bearer ${vendorToken}`)
      .send({ notes: 'PO acknowledged.' })
      .expect(200);
  });

  it('POST /goods-receipts creates draft goods receipt', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/goods-receipts')
      .set('Authorization', `Bearer ${warehouseToken}`)
      .send({
        purchaseOrderId,
        receiptDate: '2026-09-15T10:00:00.000Z',
        warehouse: 'Central Warehouse - Block A',
        notes: 'Initial delivery for office furniture order.',
      })
      .expect(201);

    expect(response.body.status).toBe('DRAFT');
    expect(response.body.purchaseOrderId).toBe(purchaseOrderId);
    expect(response.body.items).toHaveLength(1);
    expect(response.body.items[0].quantityOrdered).toBe(10);
    expect(response.body.receiptNumber).toMatch(/^GRN-\d{4}-\d{6}$/);

    goodsReceiptId = response.body.id as string;
    goodsReceiptItemId = response.body.items[0].id as string;
  });

  it('POST /goods-receipts/:id/receive records partial delivery', async () => {
    const response = await request(app.getHttpServer())
      .post(`/api/v1/goods-receipts/${goodsReceiptId}/receive`)
      .set('Authorization', `Bearer ${warehouseToken}`)
      .send({
        items: [
          {
            goodsReceiptItemId,
            quantityReceived: 5,
          },
        ],
      })
      .expect(200);

    expect(response.body.status).toBe('PARTIALLY_RECEIVED');
    expect(response.body.items[0].quantityReceived).toBe(5);

    const poResponse = await request(app.getHttpServer())
      .get(`/api/v1/purchase-orders/${purchaseOrderId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(poResponse.body.status).toBe('PARTIALLY_DELIVERED');
  });

  it('POST /goods-receipts/:id/reject records rejected items with remarks', async () => {
    const response = await request(app.getHttpServer())
      .post(`/api/v1/goods-receipts/${goodsReceiptId}/reject`)
      .set('Authorization', `Bearer ${warehouseToken}`)
      .send({
        items: [
          {
            goodsReceiptItemId,
            quantityRejected: 1,
            remarks: 'Items damaged during transit. Packaging was compromised.',
          },
        ],
      })
      .expect(200);

    expect(response.body.items[0].quantityRejected).toBe(1);
    expect(response.body.items[0].remarks).toContain('damaged');
  });

  it('POST /goods-receipts/:id/complete finalizes receipt as admin', async () => {
    await request(app.getHttpServer())
      .post(`/api/v1/goods-receipts/${goodsReceiptId}/receive`)
      .set('Authorization', `Bearer ${warehouseToken}`)
      .send({
        items: [
          {
            goodsReceiptItemId,
            quantityReceived: 9,
          },
        ],
      })
      .expect(200);

    const response = await request(app.getHttpServer())
      .post(`/api/v1/goods-receipts/${goodsReceiptId}/complete`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({})
      .expect(200);

    expect(response.body.status).toBe('COMPLETED');
    expect(response.body.items[0].quantityReceived).toBe(9);
  });

  it('GET /purchase-orders/:id/goods-receipts lists receipts for PO', async () => {
    const response = await request(app.getHttpServer())
      .get(`/api/v1/purchase-orders/${purchaseOrderId}/goods-receipts`)
      .set('Authorization', `Bearer ${pmToken}`)
      .expect(200);

    expect(response.body.goodsReceipts.length).toBeGreaterThanOrEqual(1);
    expect(response.body.goodsReceipts[0].purchaseOrderId).toBe(
      purchaseOrderId,
    );
  });

  it('GET /goods-receipts searches goods receipts', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/goods-receipts')
      .query({ search: 'GRN-' })
      .set('Authorization', `Bearer ${pmToken}`)
      .expect(200);

    expect(response.body.total).toBeGreaterThanOrEqual(1);
    expect(response.body.goodsReceipts[0].id).toBe(goodsReceiptId);
  });

  it('rejects goods receipt for cancelled purchase order', async () => {
    const secondPoResponse = await request(app.getHttpServer())
      .post('/api/v1/purchase-orders')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        awardId,
        expectedDeliveryDate: '2026-12-31T00:00:00.000Z',
      })
      .expect(409);

    expect(secondPoResponse.body.message).toContain('active purchase order');

    await request(app.getHttpServer())
      .post(`/api/v1/purchase-orders/${purchaseOrderId}/cancel`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({})
      .expect(200);

    await request(app.getHttpServer())
      .post('/api/v1/goods-receipts')
      .set('Authorization', `Bearer ${warehouseToken}`)
      .send({
        purchaseOrderId,
        receiptDate: '2026-09-20T10:00:00.000Z',
      })
      .expect(400);
  });
});
