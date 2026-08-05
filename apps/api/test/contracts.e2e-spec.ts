import { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { createTestApp } from './helpers/create-test-app';
import { registerAndVerifyTestTenant } from './helpers/register-test-tenant';

describe('Contracts (e2e)', () => {
  let app: INestApplication;
  const uniqueSuffix = Date.now();
  const organisationName = `Contract Org ${uniqueSuffix}`;
  const adminEmail = `admin-ctr-${uniqueSuffix}@example.com`;
  const pmEmail = `pm-ctr-${uniqueSuffix}@example.com`;
  const vendorEmail = `vendor-ctr-${uniqueSuffix}@example.com`;
  const password = 'Password123!';
  let adminToken: string;
  let pmToken: string;
  let vendorToken: string;
  let organisationId: string;
  let vendorId: string;
  let awardId: string;
  let contractId: string;

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

  it('invites procurement manager and vendor', async () => {
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
        title: 'Contract test procurement request',
        description: 'Procurement request for contract testing.',
        justification: 'Required for contract lifecycle validation.',
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
        title: 'Contract RFQ',
        description: 'RFQ for contract testing.',
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
        registrationNumber: `RC-CTR-${uniqueSuffix}`,
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

    awardId = awardResponse.body.id as string;
  });

  it('POST /contracts creates draft contract from award', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/contracts')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        awardId,
        title: 'Office Furniture Supply Agreement',
        description: 'Agreement for supply of ergonomic office furniture.',
        contractType: 'GOODS',
        startDate: '2026-01-01T00:00:00.000Z',
        endDate: '2026-12-31T23:59:59.000Z',
        value: 2400.0,
        renewalType: 'ANNUAL',
        signedByOrganisation: 'Jane Doe, Procurement Director',
        signedByVendor: 'Alex Supplier, Vendor Representative',
      })
      .expect(201);

    expect(response.body.status).toBe('DRAFT');
    expect(response.body.awardId).toBe(awardId);
    expect(response.body.contractNumber).toMatch(/^CTR-\d{4}-\d{6}$/);

    contractId = response.body.id as string;
  });

  it('PATCH /contracts/:id updates draft contract', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/api/v1/contracts/${contractId}`)
      .set('Authorization', `Bearer ${pmToken}`)
      .send({
        value: 2600.0,
        changeSummary: 'Updated contract value.',
      })
      .expect(200);

    expect(response.body.value).toBe(2600);
  });

  it('POST /contracts/:id/activate activates contract', async () => {
    const response = await request(app.getHttpServer())
      .post(`/api/v1/contracts/${contractId}/activate`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({})
      .expect(200);

    expect(response.body.status).toBe('ACTIVE');
  });

  it('POST /contracts/:id/documents uploads document metadata', async () => {
    const response = await request(app.getHttpServer())
      .post(`/api/v1/contracts/${contractId}/documents`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        fileName: 'master-services-agreement.pdf',
        fileUrl:
          'https://storage.example.com/contracts/master-services-agreement.pdf',
        mimeType: 'application/pdf',
      })
      .expect(201);

    expect(response.body.document.fileName).toBe(
      'master-services-agreement.pdf',
    );
    expect(response.body.contract.documents).toHaveLength(1);
  });

  it('POST /contracts/:id/renew renews active contract', async () => {
    const response = await request(app.getHttpServer())
      .post(`/api/v1/contracts/${contractId}/renew`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        startDate: '2027-01-01T00:00:00.000Z',
        endDate: '2027-12-31T23:59:59.000Z',
        value: 2800.0,
        changeSummary: 'Contract renewed for a second annual term.',
      })
      .expect(200);

    expect(response.body.status).toBe('ACTIVE');
    expect(response.body.value).toBe(2800);
  });

  it('GET /contracts/:id/history returns version history', async () => {
    const response = await request(app.getHttpServer())
      .get(`/api/v1/contracts/${contractId}/history`)
      .set('Authorization', `Bearer ${pmToken}`)
      .expect(200);

    expect(response.body.versions.length).toBeGreaterThanOrEqual(2);
  });

  it('vendor can view assigned contract', async () => {
    const response = await request(app.getHttpServer())
      .get(`/api/v1/contracts/${contractId}`)
      .set('Authorization', `Bearer ${vendorToken}`)
      .expect(200);

    expect(response.body.vendor.email).toBe(vendorEmail);
  });

  it('POST /contracts/:id/terminate terminates contract', async () => {
    const response = await request(app.getHttpServer())
      .post(`/api/v1/contracts/${contractId}/terminate`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        reason: 'Contract terminated due to vendor non-compliance.',
      })
      .expect(200);

    expect(response.body.status).toBe('TERMINATED');
  });

  it('rejects editing terminated contract', async () => {
    await request(app.getHttpServer())
      .patch(`/api/v1/contracts/${contractId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Should fail' })
      .expect(400);
  });

  it('GET /contracts searches contracts', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/contracts')
      .query({ search: 'CTR-' })
      .set('Authorization', `Bearer ${pmToken}`)
      .expect(200);

    expect(response.body.total).toBeGreaterThanOrEqual(1);
  });
});
