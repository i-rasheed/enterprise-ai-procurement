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

export const inviteUserRequestExample = {
  email: 'buyer@acme.com',
  role: Role.USER,
};

export const invitationResponseExample = {
  id: 'clxinvitation123',
  email: 'buyer@acme.com',
  organisationId: 'clx789ghi012jkl',
  role: Role.USER,
  status: 'PENDING',
  expiresAt: '2026-08-07T10:00:00.000Z',
  acceptedAt: null,
  createdAt: '2026-07-31T10:00:00.000Z',
  updatedAt: '2026-07-31T10:00:00.000Z',
};

export const createInvitationResponseExample = {
  invitation: invitationResponseExample,
  token: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
};

export const invitationListResponseExample = {
  invitations: [invitationResponseExample],
};

export const acceptInvitationRequestExample = {
  token: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  firstName: 'Alex',
  lastName: 'Buyer',
  password: 'Password123!',
};

export const acceptInvitationResponseExample = {
  invitation: {
    ...invitationResponseExample,
    status: 'ACCEPTED',
    acceptedAt: '2026-07-31T12:00:00.000Z',
  },
  userId: 'clxmember123abc',
  message: 'Invitation accepted successfully',
};

export const cancelInvitationResponseExample = {
  message: 'Invitation cancelled successfully',
};

export const createVendorRequestExample = {
  name: 'Globex Supplies Ltd',
  email: 'contact@globex.com',
  phone: '+1-555-0100',
  address: '123 Industrial Way, Lagos',
  website: 'https://globex.com',
  registrationNumber: 'RC-123456',
  taxIdentificationNumber: 'TIN-987654',
  category: 'Office Supplies',
  status: 'ACTIVE',
  rating: 4.5,
  complianceStatus: 'PENDING',
  notes: 'Preferred supplier for stationery.',
};

export const updateVendorRequestExample = {
  status: 'ACTIVE',
  complianceStatus: 'VERIFIED',
  rating: 4.8,
};

export const vendorResponseExample = {
  id: 'clxvendor123',
  organisationId: 'clx789ghi012jkl',
  name: 'Globex Supplies Ltd',
  email: 'contact@globex.com',
  phone: '+1-555-0100',
  address: '123 Industrial Way, Lagos',
  website: 'https://globex.com',
  registrationNumber: 'RC-123456',
  taxIdentificationNumber: 'TIN-987654',
  category: 'Office Supplies',
  status: 'ACTIVE',
  rating: 4.5,
  complianceStatus: 'PENDING',
  notes: 'Preferred supplier for stationery.',
  createdAt: '2026-08-01T10:00:00.000Z',
  updatedAt: '2026-08-01T10:00:00.000Z',
};

export const paginatedVendorResponseExample = {
  vendors: [vendorResponseExample],
  page: 1,
  limit: 20,
  total: 1,
  totalPages: 1,
};

export const deleteVendorResponseExample = {
  message: 'Vendor deleted successfully',
};

export const createProcurementRequestExample = {
  title: 'Office furniture refresh Q3',
  description: 'Replace aging chairs and desks across the Lagos office.',
  justification:
    'Current furniture is beyond repair and affecting staff productivity.',
  department: 'Operations',
  estimatedBudget: 2500.0,
  currency: 'USD',
  priority: 'MEDIUM',
  requiredDeliveryDate: '2026-10-31T00:00:00.000Z',
};

export const updateProcurementRequestExample = {
  priority: 'HIGH',
  estimatedBudget: 2500.0,
};

export const createProcurementItemRequestExample = {
  description: 'Ergonomic office chairs',
  quantity: 10,
  unitPrice: 250.0,
};

export const submitProcurementRequestExample = {
  submissionNote: 'Ready for procurement review.',
};

export const procurementRequesterExample = {
  id: 'clx123abc456def',
  email: 'admin@acme.com',
  firstName: 'Jane',
  lastName: 'Doe',
};

export const procurementItemResponseExample = {
  id: 'clxitem123',
  description: 'Ergonomic office chairs',
  quantity: 10,
  unitPrice: 250.0,
  totalPrice: 2500.0,
  createdAt: '2026-08-01T10:00:00.000Z',
  updatedAt: '2026-08-01T10:00:00.000Z',
};

export const procurementRequestResponseExample = {
  id: 'clxprocurement123',
  organisationId: 'clx789ghi012jkl',
  requester: procurementRequesterExample,
  title: 'Office furniture refresh Q3',
  description: 'Replace aging chairs and desks across the Lagos office.',
  justification:
    'Current furniture is beyond repair and affecting staff productivity.',
  department: 'Operations',
  estimatedBudget: 2500.0,
  currency: 'USD',
  priority: 'MEDIUM',
  status: 'DRAFT',
  requiredDeliveryDate: '2026-10-31T00:00:00.000Z',
  items: [procurementItemResponseExample],
  totalCost: 2500.0,
  createdAt: '2026-08-01T10:00:00.000Z',
  updatedAt: '2026-08-01T10:00:00.000Z',
};

export const paginatedProcurementResponseExample = {
  requests: [procurementRequestResponseExample],
  page: 1,
  limit: 20,
  total: 1,
  totalPages: 1,
};

export const deleteProcurementResponseExample = {
  message: 'Procurement request deleted successfully',
};

export const deleteProcurementItemResponseExample = {
  message: 'Line item removed successfully',
};
