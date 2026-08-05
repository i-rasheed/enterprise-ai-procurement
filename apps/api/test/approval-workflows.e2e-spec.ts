import { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { createTestApp } from './helpers/create-test-app';
import { registerAndVerifyTestTenant } from './helpers/register-test-tenant';

describe('Approval Workflows (e2e)', () => {
  let app: INestApplication;
  const uniqueSuffix = Date.now();
  const organisationName = `Approval Org ${uniqueSuffix}`;
  const adminEmail = `admin-${uniqueSuffix}@example.com`;
  const password = 'Password123!';
  let accessToken: string;
  let requestId: string;
  let workflowId: string;

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

    accessToken = response.accessToken as string;
  });

  it('creates and submits a procurement request with auto-started workflow', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/api/v1/procurement-requests')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'Approval workflow test request',
        description: 'Testing multi-level approval workflow.',
        justification: 'Required for sprint validation.',
        department: 'Operations',
        estimatedBudget: 1000.0,
        requiredDeliveryDate: '2026-10-31T00:00:00.000Z',
      })
      .expect(201);

    requestId = createResponse.body.id as string;

    await request(app.getHttpServer())
      .post(`/api/v1/procurement-requests/${requestId}/items`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        description: 'Test equipment',
        quantity: 2,
        unitPrice: 500.0,
      })
      .expect(201);

    const submitResponse = await request(app.getHttpServer())
      .post(`/api/v1/procurement-requests/${requestId}/submit`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ submissionNote: 'Submit for approval.' })
      .expect(200);

    expect(submitResponse.body.status).toBe('SUBMITTED');
    expect(submitResponse.body.approvalWorkflow).toBeDefined();
    expect(submitResponse.body.approvalWorkflow.status).toBe('IN_PROGRESS');
    expect(submitResponse.body.approvalWorkflow.steps).toHaveLength(4);

    workflowId = submitResponse.body.approvalWorkflow.id as string;
  });

  it('rejects duplicate workflow start', async () => {
    await request(app.getHttpServer())
      .post(`/api/v1/approval-workflows/${requestId}/start`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(409);
  });

  it('GET /approval-workflows/pending lists actionable approvals', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/approval-workflows/pending')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body.pendingApprovals.length).toBeGreaterThanOrEqual(1);
    expect(response.body.pendingApprovals[0].level).toBe(1);
    expect(response.body.pendingApprovals[0].status).toBe('PENDING');
  });

  it('GET /approval-workflows/:workflowId returns workflow details', async () => {
    const response = await request(app.getHttpServer())
      .get(`/api/v1/approval-workflows/${workflowId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body.id).toBe(workflowId);
    expect(response.body.steps).toHaveLength(4);
  });

  it('GET /approval-workflows/history/:requestId returns history', async () => {
    const response = await request(app.getHttpServer())
      .get(`/api/v1/approval-workflows/history/${requestId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body.procurementRequestId).toBe(requestId);
    expect(response.body.workflow.id).toBe(workflowId);
  });

  it('approves all workflow levels sequentially', async () => {
    for (let level = 1; level <= 4; level += 1) {
      const workflowResponse = await request(app.getHttpServer())
        .get(`/api/v1/approval-workflows/${workflowId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(workflowResponse.body.currentLevel).toBe(level);

      const approveResponse = await request(app.getHttpServer())
        .post(`/api/v1/approval-workflows/${workflowId}/approve`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ comments: `Approved at level ${level}` })
        .expect(200);

      if (level < 4) {
        expect(approveResponse.body.status).toBe('IN_PROGRESS');
        expect(approveResponse.body.currentLevel).toBe(level + 1);
      } else {
        expect(approveResponse.body.status).toBe('APPROVED');
      }
    }

    const procurementResponse = await request(app.getHttpServer())
      .get(`/api/v1/procurement-requests/${requestId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(procurementResponse.body.status).toBe('APPROVED');
  });

  it('rejection terminates workflow immediately', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/api/v1/procurement-requests')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'Reject workflow test',
        description: 'Testing rejection path.',
        justification: 'Required for sprint validation.',
        department: 'Finance',
        estimatedBudget: 200.0,
        requiredDeliveryDate: '2026-11-30T00:00:00.000Z',
      })
      .expect(201);

    const rejectRequestId = createResponse.body.id as string;

    await request(app.getHttpServer())
      .post(`/api/v1/procurement-requests/${rejectRequestId}/items`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        description: 'Reject test item',
        quantity: 1,
        unitPrice: 200.0,
      })
      .expect(201);

    const submitResponse = await request(app.getHttpServer())
      .post(`/api/v1/procurement-requests/${rejectRequestId}/submit`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({})
      .expect(200);

    const rejectWorkflowId = submitResponse.body.approvalWorkflow.id as string;

    const rejectResponse = await request(app.getHttpServer())
      .post(`/api/v1/approval-workflows/${rejectWorkflowId}/reject`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        comments: 'Budget exceeds department allocation for this quarter.',
      })
      .expect(200);

    expect(rejectResponse.body.status).toBe('REJECTED');

    const procurementResponse = await request(app.getHttpServer())
      .get(`/api/v1/procurement-requests/${rejectRequestId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(procurementResponse.body.status).toBe('REJECTED');
  });
});
