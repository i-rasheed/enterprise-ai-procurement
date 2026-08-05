import { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { createTestApp } from './helpers/create-test-app';

describe('Organisation management CRUD (e2e)', () => {
  let app: INestApplication;
  const uniqueSuffix = Date.now();
  const organisationName = `CRUD Org ${uniqueSuffix}`;
  let organisationId: string;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /organisations creates an organisation', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/organisations')
      .send({ name: organisationName })
      .expect(201);

    expect(response.body.id).toBeDefined();
    expect(response.body.name).toBe(organisationName);
    expect(response.body.createdAt).toBeDefined();
    expect(response.body.updatedAt).toBeDefined();

    organisationId = response.body.id as string;
  });

  it('GET /organisations returns all organisations', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/organisations')
      .expect(200);

    expect(response.body.organisations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: organisationId,
          name: organisationName,
        }),
      ]),
    );
  });

  it('GET /organisations/:id returns a single organisation', async () => {
    const response = await request(app.getHttpServer())
      .get(`/api/v1/organisations/${organisationId}`)
      .expect(200);

    expect(response.body.id).toBe(organisationId);
    expect(response.body.name).toBe(organisationName);
    expect(response.body.users).toEqual([]);
  });

  it('GET /organisations/:id returns 404 for unknown id', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/organisations/nonexistent-id')
      .expect(404);
  });

  it('PATCH /organisations/:id updates an organisation', async () => {
    const updatedName = `${organisationName} Updated`;

    const response = await request(app.getHttpServer())
      .patch(`/api/v1/organisations/${organisationId}`)
      .send({ name: updatedName })
      .expect(200);

    expect(response.body.id).toBe(organisationId);
    expect(response.body.name).toBe(updatedName);
  });

  it('DELETE /organisations/:id deletes an organisation', async () => {
    const response = await request(app.getHttpServer())
      .delete(`/api/v1/organisations/${organisationId}`)
      .expect(200);

    expect(response.body.message).toBe('Organisation deleted successfully');

    await request(app.getHttpServer())
      .get(`/api/v1/organisations/${organisationId}`)
      .expect(404);
  });

  it('rejects invalid create payload', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/organisations')
      .send({ name: '' })
      .expect(400);
  });
});
