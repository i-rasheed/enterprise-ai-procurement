import { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { createTestApp } from './helpers/create-test-app';

describe('Invoices (e2e)', () => {
  let app: INestApplication;
  const uniqueSuffix = Date.now();
  const organisationName = `Invoice Org ${uniqueSuffix}`;
  const adminEmail = `admin-inv-${uniqueSuffix}@example.com`;
  const pmEmail = `pm-inv-${uniqueSuffix}@example.com`;
  const financeEmail = `finance-inv-${uniqueSuffix}@example.com`;
  const warehouseEmail = `warehouse-inv-${uniqueSuffix}@example.com`;
  const vendorEmail = `vendor-inv-${uniqueSuffix}@example.com`;
  const password = 'Password123!';
  let adminToken: string;
  let pmToken: string;
  let financeToken: string;
  let warehouseToken: string;
  let vendorToken: string;
  let organisationId: string;
  let vendorId: string;
  let purchaseOrderId: string;
  let poItemId: string;
  let goodsReceiptId: string;
  let goodsReceiptItemId: string;
  let invoiceId: string;
  let priceMismatchInvoiceId: string;
  let quantityMismatchInvoiceId: string;

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

  it('invites team members and vendor representative', async () => {
    for (const [email, role] of [
      [pmEmail, 'PROCUREMENT_MANAGER'],
      [financeEmail, 'FINANCE'],
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
          firstName: role === 'PROCUREMENT_MANAGER' ? 'Procurement' : 'Team',
          lastName: role === 'FINANCE' ? 'Finance' : 'Member',
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

    financeToken = (
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: financeEmail, password })
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

  it('prepares completed goods receipt', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/api/v1/procurement-requests')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Invoice test procurement request',
        description: 'Procurement request for invoice testing.',
        justification: 'Required for invoice lifecycle validation.',
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
        title: 'Invoice RFQ',
        description: 'RFQ for invoice testing.',
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
        registrationNumber: `RC-INV-${uniqueSuffix}`,
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

    const bidId = bidResponse.body.id as string;

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
      })
      .expect(201);

    const awardResponse = await request(app.getHttpServer())
      .post('/api/v1/awards')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        bidId,
        awardReason: 'Best overall score.',
      })
      .expect(201);

    const poResponse = await request(app.getHttpServer())
      .post('/api/v1/purchase-orders')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        awardId: awardResponse.body.id,
        expectedDeliveryDate: '2026-11-30T00:00:00.000Z',
      })
      .expect(201);

    purchaseOrderId = poResponse.body.id as string;
    poItemId = poResponse.body.items[0].id as string;

    await request(app.getHttpServer())
      .post(`/api/v1/purchase-orders/${purchaseOrderId}/issue`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({})
      .expect(200);

    await request(app.getHttpServer())
      .post(`/api/v1/purchase-orders/${purchaseOrderId}/acknowledge`)
      .set('Authorization', `Bearer ${vendorToken}`)
      .send({})
      .expect(200);

    const grnResponse = await request(app.getHttpServer())
      .post('/api/v1/goods-receipts')
      .set('Authorization', `Bearer ${warehouseToken}`)
      .send({
        purchaseOrderId,
        receiptDate: '2026-09-15T10:00:00.000Z',
        warehouse: 'Central Warehouse',
      })
      .expect(201);

    goodsReceiptId = grnResponse.body.id as string;
    goodsReceiptItemId = grnResponse.body.items[0].id as string;

    await request(app.getHttpServer())
      .post(`/api/v1/goods-receipts/${goodsReceiptId}/receive`)
      .set('Authorization', `Bearer ${warehouseToken}`)
      .send({
        items: [{ goodsReceiptItemId, quantityReceived: 10 }],
      })
      .expect(200);

    await request(app.getHttpServer())
      .post(`/api/v1/goods-receipts/${goodsReceiptId}/complete`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({})
      .expect(200);
  });

  it('POST /invoices creates draft invoice', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/invoices')
      .set('Authorization', `Bearer ${vendorToken}`)
      .send({
        vendorId,
        purchaseOrderId,
        goodsReceiptId,
        invoiceDate: '2026-10-01T00:00:00.000Z',
        dueDate: '2026-10-31T00:00:00.000Z',
        subtotal: 2400.0,
        taxAmount: 240.0,
        notes: 'Invoice for delivered office chairs.',
        items: [
          {
            purchaseOrderItemId: poItemId,
            description: 'Ergonomic office chair model X200',
            quantity: 10,
            unitPrice: 240.0,
          },
        ],
      })
      .expect(201);

    expect(response.body.status).toBe('DRAFT');
    expect(response.body.totalAmount).toBe(2640);
    expect(response.body.invoiceNumber).toMatch(/^INV-\d{4}-\d{6}$/);

    invoiceId = response.body.id as string;
  });

  it('POST /invoices/:id/submit submits invoice', async () => {
    const response = await request(app.getHttpServer())
      .post(`/api/v1/invoices/${invoiceId}/submit`)
      .set('Authorization', `Bearer ${vendorToken}`)
      .send({ notes: 'Submitted for three-way matching.' })
      .expect(200);

    expect(response.body.status).toBe('SUBMITTED');
  });

  it('POST /invoices/:id/match runs successful three-way matching', async () => {
    const response = await request(app.getHttpServer())
      .post(`/api/v1/invoices/${invoiceId}/match`)
      .set('Authorization', `Bearer ${financeToken}`)
      .send({})
      .expect(200);

    expect(response.body.matchingResult.matchStatus).toBe('MATCHED');
    expect(response.body.invoice.status).toBe('MATCHED');
    expect(response.body.matchingResult.discrepancies).toBeNull();
  });

  it('GET /matching-results/:invoiceId returns matching result', async () => {
    const response = await request(app.getHttpServer())
      .get(`/api/v1/matching-results/${invoiceId}`)
      .set('Authorization', `Bearer ${pmToken}`)
      .expect(200);

    expect(response.body.matchStatus).toBe('MATCHED');
    expect(response.body.invoiceId).toBe(invoiceId);
  });

  it('detects price mismatch', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/api/v1/invoices')
      .set('Authorization', `Bearer ${vendorToken}`)
      .send({
        vendorId,
        purchaseOrderId,
        goodsReceiptId,
        invoiceDate: '2026-10-02T00:00:00.000Z',
        dueDate: '2026-10-31T00:00:00.000Z',
        subtotal: 2500.0,
        taxAmount: 250.0,
        items: [
          {
            purchaseOrderItemId: poItemId,
            description: 'Ergonomic office chair model X200',
            quantity: 10,
            unitPrice: 250.0,
          },
        ],
      })
      .expect(201);

    priceMismatchInvoiceId = createResponse.body.id as string;

    await request(app.getHttpServer())
      .post(`/api/v1/invoices/${priceMismatchInvoiceId}/submit`)
      .set('Authorization', `Bearer ${vendorToken}`)
      .send({})
      .expect(200);

    const matchResponse = await request(app.getHttpServer())
      .post(`/api/v1/invoices/${priceMismatchInvoiceId}/match`)
      .set('Authorization', `Bearer ${financeToken}`)
      .send({})
      .expect(200);

    expect(matchResponse.body.matchingResult.matchStatus).toBe(
      'PRICE_MISMATCH',
    );
    expect(
      matchResponse.body.matchingResult.discrepancies.length,
    ).toBeGreaterThan(0);
  });

  it('detects quantity mismatch', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/api/v1/invoices')
      .set('Authorization', `Bearer ${vendorToken}`)
      .send({
        vendorId,
        purchaseOrderId,
        goodsReceiptId,
        invoiceDate: '2026-10-03T00:00:00.000Z',
        dueDate: '2026-10-31T00:00:00.000Z',
        subtotal: 1920.0,
        taxAmount: 192.0,
        items: [
          {
            purchaseOrderItemId: poItemId,
            description: 'Ergonomic office chair model X200',
            quantity: 8,
            unitPrice: 240.0,
          },
        ],
      })
      .expect(201);

    quantityMismatchInvoiceId = createResponse.body.id as string;

    await request(app.getHttpServer())
      .post(`/api/v1/invoices/${quantityMismatchInvoiceId}/submit`)
      .set('Authorization', `Bearer ${vendorToken}`)
      .send({})
      .expect(200);

    const matchResponse = await request(app.getHttpServer())
      .post(`/api/v1/invoices/${quantityMismatchInvoiceId}/match`)
      .set('Authorization', `Bearer ${financeToken}`)
      .send({})
      .expect(200);

    expect(matchResponse.body.matchingResult.matchStatus).toBe(
      'QUANTITY_MISMATCH',
    );
  });

  it('POST /invoices/:id/approve approves matched invoice', async () => {
    const response = await request(app.getHttpServer())
      .post(`/api/v1/invoices/${invoiceId}/approve`)
      .set('Authorization', `Bearer ${financeToken}`)
      .send({ notes: 'Three-way match verified. Approved for payment.' })
      .expect(200);

    expect(response.body.status).toBe('APPROVED');
  });

  it('POST /invoices/:id/pay marks invoice as paid', async () => {
    const response = await request(app.getHttpServer())
      .post(`/api/v1/invoices/${invoiceId}/pay`)
      .set('Authorization', `Bearer ${financeToken}`)
      .send({
        paidDate: '2026-11-01T12:00:00.000Z',
        paymentReference: 'PAY-2026-000001',
      })
      .expect(200);

    expect(response.body.status).toBe('PAID');
  });

  it('rejects editing paid invoice', async () => {
    await request(app.getHttpServer())
      .patch(`/api/v1/invoices/${invoiceId}`)
      .set('Authorization', `Bearer ${vendorToken}`)
      .send({ notes: 'Should fail' })
      .expect(400);
  });

  it('GET /invoices searches invoices', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/invoices')
      .query({ search: 'INV-' })
      .set('Authorization', `Bearer ${pmToken}`)
      .expect(200);

    expect(response.body.total).toBeGreaterThanOrEqual(1);
  });
});
