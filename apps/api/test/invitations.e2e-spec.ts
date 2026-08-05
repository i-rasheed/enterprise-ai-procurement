import { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { createTestApp } from './helpers/create-test-app';
import { registerAndVerifyTestTenant } from './helpers/register-test-tenant';

describe('Organisation invitations (e2e)', () => {
  let app: INestApplication;
  const uniqueSuffix = Date.now();
  const organisationName = `Invite Org ${uniqueSuffix}`;
  const adminEmail = `admin-${uniqueSuffix}@example.com`;
  const inviteeEmail = `invitee-${uniqueSuffix}@example.com`;
  const password = 'Password123!';
  let organisationId: string;
  let adminToken: string;
  let invitationToken: string;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('registers admin and organisation', async () => {
    const response = await registerAndVerifyTestTenant(app, {
      organisationName,
      email: adminEmail,
      password,
      firstName: 'Admin',
      lastName: 'User',
    });

    organisationId = response.organisation.id as string;
    adminToken = response.accessToken as string;
  });

  it('POST /organisations/:organisationId/invitations creates invitation', async () => {
    const response = await request(app.getHttpServer())
      .post(`/api/v1/organisations/${organisationId}/invitations`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        email: inviteeEmail,
        role: 'USER',
      })
      .expect(201);

    expect(response.body.token).toBeDefined();
    expect(response.body.invitation.email).toBe(inviteeEmail);
    expect(response.body.invitation.status).toBe('PENDING');

    invitationToken = response.body.token as string;
  });

  it('rejects duplicate pending invitation', async () => {
    await request(app.getHttpServer())
      .post(`/api/v1/organisations/${organisationId}/invitations`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        email: inviteeEmail,
        role: 'USER',
      })
      .expect(409);
  });

  it('GET /organisations/:organisationId/invitations lists pending invitations', async () => {
    const response = await request(app.getHttpServer())
      .get(`/api/v1/organisations/${organisationId}/invitations`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body.invitations).toHaveLength(1);
    expect(response.body.invitations[0].email).toBe(inviteeEmail);
    expect(response.body.invitations[0].token).toBeUndefined();
  });

  it('rejects accepting invitation when email already has an account', async () => {
    const duplicateInvite = await request(app.getHttpServer())
      .post(`/api/v1/organisations/${organisationId}/invitations`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        email: adminEmail,
        role: 'USER',
      })
      .expect(409);

    expect(duplicateInvite.body.message).toContain('already belongs');
  });

  it('POST /invitations/accept creates user from invitation', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/invitations/accept')
      .send({
        token: invitationToken,
        firstName: 'Invited',
        lastName: 'User',
        password,
      })
      .expect(201);

    expect(response.body.userId).toBeDefined();
    expect(response.body.invitation.status).toBe('ACCEPTED');
    expect(response.body.message).toBe('Invitation accepted successfully');
  });

  it('rejects reusing accepted invitation', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/invitations/accept')
      .send({
        token: invitationToken,
        firstName: 'Invited',
        lastName: 'User',
        password,
      })
      .expect(400);
  });

  it('invited user can login', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: inviteeEmail,
        password,
      })
      .expect(200);

    expect(response.body.user.email).toBe(inviteeEmail);
    expect(response.body.user.role).toBe('USER');
  });

  it('DELETE /invitations/:id cancels a pending invitation', async () => {
    const secondInvitee = `second-${uniqueSuffix}@example.com`;

    const created = await request(app.getHttpServer())
      .post(`/api/v1/organisations/${organisationId}/invitations`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        email: secondInvitee,
        role: 'USER',
      })
      .expect(201);

    const pendingId = created.body.invitation.id as string;

    const response = await request(app.getHttpServer())
      .delete(`/api/v1/invitations/${pendingId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body.message).toBe('Invitation cancelled successfully');

    await request(app.getHttpServer())
      .post('/api/v1/invitations/accept')
      .send({
        token: created.body.token as string,
        firstName: 'Second',
        lastName: 'User',
        password,
      })
      .expect(400);
  });

  it('rejects non-admin invitation management', async () => {
    await request(app.getHttpServer())
      .get(`/api/v1/organisations/${organisationId}/invitations`)
      .expect(401);
  });
});
