import { Role } from '@prisma/client';

export const registerRequestExample = {
  organisationName: 'Acme Corp',
  email: 'admin@acme.com',
  password: 'Password123!',
  firstName: 'Jane',
  lastName: 'Doe',
};

export const registerProcurementRequestExample = {
  organisationName: 'Globex Procurement',
  email: 'manager@globex.com',
  password: 'SecurePass456!',
  firstName: 'John',
  lastName: 'Smith',
};

export const loginRequestExample = {
  email: 'admin@acme.com',
  password: 'Password123!',
};

export const createOrganisationRequestExample = {
  name: 'Acme Corp',
};

export const updateOrganisationRequestExample = {
  name: 'Acme Corporation',
};

export const organisationListResponseExample = {
  organisations: [
    {
      id: 'clx789ghi012jkl',
      name: 'Acme Corp',
      createdAt: '2026-07-31T10:00:00.000Z',
      updatedAt: '2026-07-31T10:00:00.000Z',
    },
  ],
};

export const safeUserResponseExample = {
  id: 'clx123abc456def',
  email: 'admin@acme.com',
  firstName: 'Jane',
  lastName: 'Doe',
  role: Role.ADMIN,
  isVerified: false,
  organisationId: 'clx789ghi012jkl',
  createdAt: '2026-07-31T10:00:00.000Z',
  updatedAt: '2026-07-31T10:00:00.000Z',
};

export const loginResponseExample = {
  user: safeUserResponseExample,
  organisation: {
    id: 'clx789ghi012jkl',
    name: 'Acme Corp',
  },
  accessToken:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbHgxMjNhYmM0NTZkZWYiLCJlbWFpbCI6ImFkbWluQGFjbWUuY29tIiwicm9sZSI6IkFETUlOIiwib3JnYW5pc2F0aW9uSWQiOiJjbHg3ODlnaGkwMTJqa2wifQ.example',
  refreshToken:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbHgxMjNhYmM0NTZkZWYiLCJlbWFpbCI6ImFkbWluQGFjbWUuY29tIiwicm9sZSI6IkFETUlOIiwib3JnYW5pc2F0aW9uSWQiOiJjbHg3ODnnaGkwMTJqa2wifQ.example',
};

export const registerResponseExample = {
  user: safeUserResponseExample,
  organisation: {
    id: 'clx789ghi012jkl',
    name: 'Acme Corp',
  },
  accessToken:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbHgxMjNhYmM0NTZkZWYiLCJlbWFpbCI6ImFkbWluQGFjbWUuY29tIiwicm9sZSI6IkFETUlOIiwib3JnYW5pc2F0aW9uSWQiOiJjbHg3ODlnaGkwMTJqa2wifQ.example',
  refreshToken:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbHgxMjNhYmM0NTZkZWYiLCJlbWFpbCI6ImFkbWluQGFjbWUuY29tIiwicm9sZSI6IkFETUlOIiwib3JnYW5pc2F0aW9uSWQiOiJjbHg3ODnnaGkwMTJqa2wifQ.example',
};

export const refreshTokenRequestExample = {
  refreshToken:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbHgxMjNhYmM0NTZkZWYiLCJqdGkiOiIxMjM0NTY3ODkwIn0.example',
};

export const logoutResponseExample = {
  message: 'Logged out successfully',
};

export const organisationResponseExample = {
  id: 'clx789ghi012jkl',
  name: 'Acme Corp',
  createdAt: '2026-07-31T10:00:00.000Z',
  updatedAt: '2026-07-31T10:00:00.000Z',
  users: [safeUserResponseExample],
};

export const jwtPayloadExample = {
  sub: 'clx123abc456def',
  email: 'admin@acme.com',
  role: Role.ADMIN,
  organisationId: 'clx789ghi012jkl',
  iat: 1785490670,
  exp: 1785490670,
};

export const messageResponseExample = {
  message: 'Welcome Admin',
};

export const deleteOrganisationResponseExample = {
  message: 'Organisation deleted successfully',
};

export const healthResponseExample = {
  status: 'ok',
  service: 'enterprise-ai-procurement-api',
  version: '1.0.0',
};
