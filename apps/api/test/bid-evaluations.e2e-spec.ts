import { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { createTestApp } from './helpers/create-test-app';
import { registerAndVerifyTestTenant } from './helpers/register-test-tenant';

describe('Bid Evaluations (e2e)', () => {
  let app: INestApplication;
  const uniqueSuffix = Date.now();
  const organisationName = `Evaluation Org ${uniqueSuffix}`;
  const adminEmail = `admin-${uniqueSuffix}@example.com`;
  const pmEmail = `pm-${uniqueSuffix}@example.com`;
  const vendorEmail = `vendor-${uniqueSuffix}@example.com`;
  const password = 'Password123!';
  let adminToken: string;
  let pmToken: string;
  let vendorToken: string;
  let organisationId: string;
  let procurementRequestId: string;
  let bidId: string;
  let evaluationId: string;

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

  it('prepares submitted bid', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/api/v1/procurement-requests')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Evaluation test procurement request',
        description: 'Procurement request for evaluation testing.',
        justification: 'Required for evaluation lifecycle validation.',
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
        title: 'Evaluation RFQ',
        description: 'RFQ for bid evaluation testing.',
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
        registrationNumber: `RC-EVAL-${uniqueSuffix}`,
      })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/api/v1/rfqs/${rfqId}/vendors`)
      .set('Authorization', `Bearer ${pmToken}`)
      .send({ vendorId: vendorResponse.body.id })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/api/v1/rfqs/${rfqId}/publish`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({})
      .expect(200);

    const bidResponse = await request(app.getHttpServer())
      .post('/api/v1/bids')
      .set('Authorization', `Bearer ${vendorToken}`)
      .send({
        rfqId,
        vendorId: vendorResponse.body.id,
      })
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
  });

  it('POST /bid-evaluations creates evaluation', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/bid-evaluations')
      .set('Authorization', `Bearer ${pmToken}`)
      .send({
        bidId,
        technicalScore: 85,
        commercialScore: 90,
        complianceScore: 88,
        deliveryScore: 80,
        comments: 'Strong technical proposal with competitive pricing.',
      })
      .expect(201);

    expect(response.body.totalScore).toBe(343);

    evaluationId = response.body.id as string;
  });

  it('GET /bid-evaluations/:bidId returns evaluation summary', async () => {
    const response = await request(app.getHttpServer())
      .get(`/api/v1/bid-evaluations/${bidId}`)
      .set('Authorization', `Bearer ${pmToken}`)
      .expect(200);

    expect(response.body.evaluations).toHaveLength(1);
    expect(response.body.averageTotalScore).toBe(343);
  });

  it('PATCH /bid-evaluations/:id updates evaluation', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/api/v1/bid-evaluations/${evaluationId}`)
      .set('Authorization', `Bearer ${pmToken}`)
      .send({ commercialScore: 95 })
      .expect(200);

    expect(response.body.totalScore).toBe(348);
  });

  it('GET /procurement-requests/:id/rankings ranks bids', async () => {
    const response = await request(app.getHttpServer())
      .get(`/api/v1/procurement-requests/${procurementRequestId}/rankings`)
      .set('Authorization', `Bearer ${pmToken}`)
      .expect(200);

    expect(response.body.rankings).toHaveLength(1);
    expect(response.body.rankings[0].rank).toBe(1);
    expect(response.body.rankings[0].totalScore).toBe(348);
  });

  it('POST /awards awards winning bid as admin', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/awards')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        bidId,
        awardReason:
          'Best overall score with competitive pricing and verified compliance.',
      })
      .expect(201);

    expect(response.body.bidId).toBe(bidId);
    expect(response.body.procurementRequestId).toBe(procurementRequestId);
  });

  it('rejects duplicate award', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/awards')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        bidId,
        awardReason: 'Duplicate award attempt.',
      })
      .expect(400);
  });

  it('GET /awards lists award history', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/awards')
      .set('Authorization', `Bearer ${pmToken}`)
      .expect(200);

    expect(response.body.awards.length).toBeGreaterThanOrEqual(1);
  });

  it('rejects editing evaluation after award', async () => {
    await request(app.getHttpServer())
      .patch(`/api/v1/bid-evaluations/${evaluationId}`)
      .set('Authorization', `Bearer ${pmToken}`)
      .send({ technicalScore: 70 })
      .expect(400);
  });
});
