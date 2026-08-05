import { INestApplication } from '@nestjs/common';
import request from 'supertest';

type RegisterTestTenantInput = {
  organisationName: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};

type RegisterTestTenantResponse = {
  user: {
    id: string;
    email: string;
    role: string;
    organisationId: string;
  };
  organisation: {
    id: string;
    name: string;
  };
  accessToken: string;
  refreshToken: string;
};

export async function registerAndVerifyTestTenant(
  app: INestApplication,
  input: RegisterTestTenantInput,
): Promise<RegisterTestTenantResponse> {
  const registerResponse = await request(app.getHttpServer())
    .post('/api/v1/auth/register')
    .send(input)
    .expect(201);

  const verificationToken = registerResponse.body.verificationToken as string;

  if (!verificationToken) {
    throw new Error('Expected verificationToken in test register response');
  }

  const verifyResponse = await request(app.getHttpServer())
    .post('/api/v1/auth/verify-email')
    .send({ token: verificationToken })
    .expect(200);

  return verifyResponse.body as RegisterTestTenantResponse;
}
