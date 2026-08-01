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

export const approveRequestExample = {
  comments: 'Budget aligns with department plan.',
};

export const rejectRequestExample = {
  comments: 'Budget exceeds department allocation for this quarter.',
};

export const approvalStepApproverExample = {
  id: 'clx123abc456def',
  email: 'admin@acme.com',
  firstName: 'Jane',
  lastName: 'Doe',
  role: Role.ADMIN,
};

export const approvalStepResponseExample = {
  id: 'clxstep123',
  workflowId: 'clxworkflow123',
  approver: approvalStepApproverExample,
  role: 'DEPARTMENT_HEAD',
  level: 1,
  status: 'PENDING',
  comments: null,
  actedAt: null,
  createdAt: '2026-08-01T10:00:00.000Z',
  updatedAt: '2026-08-01T10:00:00.000Z',
};

export const approvalWorkflowResponseExample = {
  id: 'clxworkflow123',
  procurementRequestId: 'clxprocurement123',
  currentLevel: 1,
  status: 'IN_PROGRESS',
  steps: [approvalStepResponseExample],
  createdAt: '2026-08-01T10:00:00.000Z',
  updatedAt: '2026-08-01T10:00:00.000Z',
};

export const pendingApprovalsResponseExample = {
  pendingApprovals: [approvalStepResponseExample],
};

export const approvalHistoryResponseExample = {
  procurementRequestId: 'clxprocurement123',
  workflow: approvalWorkflowResponseExample,
};

export const createRfqRequestExample = {
  procurementRequestId: 'clxprocurement123',
  title: 'Office Furniture RFQ Q3',
  description: 'Request for quotation for ergonomic office chairs and desks.',
  closingDate: '2026-09-30T23:59:59.000Z',
};

export const updateRfqRequestExample = {
  closingDate: '2026-10-15T23:59:59.000Z',
};

export const inviteVendorRequestExample = {
  vendorId: 'clxvendor123',
};

export const publishRfqRequestExample = {
  publicationNote: 'RFQ ready for vendor responses.',
};

export const rfqCreatorExample = {
  id: 'clx123abc456def',
  email: 'manager@globex.com',
  firstName: 'John',
  lastName: 'Smith',
  role: Role.PROCUREMENT_MANAGER,
};

export const rfqVendorEntryExample = {
  id: 'clxrfqvendor123',
  rfqId: 'clxrfq123',
  vendor: {
    id: 'clxvendor123',
    name: 'Globex Supplies Ltd',
    email: 'contact@globex.com',
  },
  invitedAt: '2026-08-01T10:00:00.000Z',
  respondedAt: null,
  status: 'INVITED',
};

export const rfqResponseExample = {
  id: 'clxrfq123',
  procurementRequestId: 'clxprocurement123',
  rfqNumber: 'RFQ-2026-000001',
  title: 'Office Furniture RFQ Q3',
  description: 'Request for quotation for ergonomic office chairs and desks.',
  closingDate: '2026-09-30T23:59:59.000Z',
  status: 'DRAFT',
  createdBy: rfqCreatorExample,
  vendors: [rfqVendorEntryExample],
  createdAt: '2026-08-01T10:00:00.000Z',
  updatedAt: '2026-08-01T10:00:00.000Z',
};

export const paginatedRfqResponseExample = {
  rfqs: [rfqResponseExample],
  page: 1,
  limit: 20,
  total: 1,
  totalPages: 1,
};

export const rfqVendorListResponseExample = {
  vendors: [rfqVendorEntryExample],
};

export const deleteRfqResponseExample = {
  message: 'RFQ deleted successfully',
};

export const createBidRequestExample = {
  rfqId: 'clxrfq123',
  vendorId: 'clxvendor123',
  currency: 'USD',
  deliveryPeriod: '30 days from purchase order',
  paymentTerms: 'Net 30',
  warrantyPeriod: '12 months',
  notes: 'Includes delivery and installation.',
};

export const updateBidRequestExample = {
  paymentTerms: 'Net 45',
  deliveryPeriod: '45 days from purchase order',
};

export const submitBidRequestExample = {
  submissionNote: 'Final quotation submitted for review.',
};

export const createBidItemRequestExample = {
  description: 'Ergonomic office chair model X200',
  quantity: 10,
  unitPrice: 240.0,
};

export const uploadBidAttachmentRequestExample = {
  fileName: 'quotation.pdf',
  fileUrl: 'https://storage.example.com/bids/quotation.pdf',
  fileType: 'application/pdf',
};

export const bidSubmitterExample = {
  id: 'clxvendoruser123',
  email: 'vendor@globex.com',
  firstName: 'Alex',
  lastName: 'Supplier',
  role: Role.USER,
};

export const bidItemResponseExample = {
  id: 'clxbiditem123',
  description: 'Ergonomic office chair model X200',
  quantity: 10,
  unitPrice: 240.0,
  totalPrice: 2400.0,
  createdAt: '2026-08-01T10:00:00.000Z',
  updatedAt: '2026-08-01T10:00:00.000Z',
};

export const bidAttachmentResponseExample = {
  id: 'clxattachment123',
  fileName: 'quotation.pdf',
  fileUrl: 'https://storage.example.com/bids/quotation.pdf',
  fileType: 'application/pdf',
  uploadedAt: '2026-08-01T10:00:00.000Z',
};

export const bidResponseExample = {
  id: 'clxbid123',
  rfqId: 'clxrfq123',
  rfq: {
    id: 'clxrfq123',
    rfqNumber: 'RFQ-2026-000001',
    title: 'Office Furniture RFQ Q3',
  },
  vendor: {
    id: 'clxvendor123',
    name: 'Globex Supplies Ltd',
    email: 'vendor@globex.com',
  },
  submittedBy: bidSubmitterExample,
  bidNumber: 'BID-2026-000001',
  totalAmount: 2400.0,
  currency: 'USD',
  deliveryPeriod: '30 days from purchase order',
  paymentTerms: 'Net 30',
  warrantyPeriod: '12 months',
  notes: 'Includes delivery and installation.',
  status: 'DRAFT',
  submittedAt: null,
  items: [bidItemResponseExample],
  attachments: [bidAttachmentResponseExample],
  createdAt: '2026-08-01T10:00:00.000Z',
  updatedAt: '2026-08-01T10:00:00.000Z',
};

export const paginatedBidResponseExample = {
  bids: [bidResponseExample],
  page: 1,
  limit: 20,
  total: 1,
  totalPages: 1,
};

export const deleteBidResponseExample = {
  message: 'Bid deleted successfully',
};

export const deleteBidItemResponseExample = {
  message: 'Bid item removed successfully',
};

export const createEvaluationRequestExample = {
  bidId: 'clxbid123',
  technicalScore: 85,
  commercialScore: 90,
  complianceScore: 88,
  deliveryScore: 80,
  comments: 'Strong technical proposal with competitive pricing.',
};

export const updateEvaluationRequestExample = {
  technicalScore: 87,
  commercialScore: 92,
  comments: 'Updated score after clarification call.',
};

export const bidEvaluationResponseExample = {
  id: 'clxeval123',
  bidId: 'clxbid123',
  evaluator: {
    id: 'clx123abc456def',
    email: 'manager@globex.com',
    firstName: 'John',
    lastName: 'Smith',
    role: Role.PROCUREMENT_MANAGER,
  },
  technicalScore: 85,
  commercialScore: 90,
  complianceScore: 88,
  deliveryScore: 80,
  totalScore: 343,
  comments: 'Strong technical proposal with competitive pricing.',
  createdAt: '2026-08-01T10:00:00.000Z',
  updatedAt: '2026-08-01T10:00:00.000Z',
};

export const bidEvaluationListResponseExample = {
  bidId: 'clxbid123',
  evaluations: [bidEvaluationResponseExample],
  averageTotalScore: 343,
};

export const procurementRankingsResponseExample = {
  procurementRequestId: 'clxprocurement123',
  rankings: [
    {
      rank: 1,
      bidId: 'clxbid123',
      bidNumber: 'BID-2026-000001',
      vendorName: 'Globex Supplies Ltd',
      totalScore: 343,
      totalAmount: 2400.0,
      evaluationCount: 1,
    },
  ],
};

export const awardBidRequestExample = {
  bidId: 'clxbid123',
  awardReason:
    'Best overall score with competitive pricing and verified compliance.',
};

export const awardResponseExample = {
  id: 'clxaward123',
  bidId: 'clxbid123',
  procurementRequestId: 'clxprocurement123',
  awardedBy: {
    id: 'clx123abc456def',
    email: 'admin@acme.com',
    firstName: 'Jane',
    lastName: 'Doe',
    role: Role.ADMIN,
  },
  awardReason:
    'Best overall score with competitive pricing and verified compliance.',
  awardedAt: '2026-08-01T12:00:00.000Z',
  createdAt: '2026-08-01T12:00:00.000Z',
  updatedAt: '2026-08-01T12:00:00.000Z',
};

export const createPurchaseOrderRequestExample = {
  awardId: 'clxaward123',
  expectedDeliveryDate: '2026-11-30T00:00:00.000Z',
  deliveryAddress: '123 Procurement Way, Suite 400, Lagos',
  notes: 'Deliver to loading dock B between 9am and 5pm.',
};

export const updatePurchaseOrderRequestExample = {
  expectedDeliveryDate: '2026-12-15T00:00:00.000Z',
  paymentTerms: 'Net 45',
  deliveryAddress: '456 Warehouse Road, Block C, Lagos',
  notes: 'Updated delivery instructions for the vendor.',
};

export const issuePurchaseOrderRequestExample = {
  issueDate: '2026-08-01T12:00:00.000Z',
  notes: 'Please confirm receipt within 48 hours.',
};

export const acknowledgePurchaseOrderRequestExample = {
  notes: 'Purchase order acknowledged. Delivery scheduled for November.',
};

export const purchaseOrderItemResponseExample = {
  id: 'clxpoitem123',
  description: 'Ergonomic office chair model X200',
  quantity: 10,
  unitPrice: 240.0,
  totalPrice: 2400.0,
  createdAt: '2026-08-01T10:00:00.000Z',
  updatedAt: '2026-08-01T10:00:00.000Z',
};

export const purchaseOrderResponseExample = {
  id: 'clxpo123',
  poNumber: 'PO-2026-000001',
  organisationId: 'clxorg123',
  vendor: {
    id: 'clxvendor123',
    name: 'Globex Supplies Ltd',
    email: 'vendor@globex.com',
  },
  awardId: 'clxaward123',
  procurementRequestId: 'clxprocurement123',
  issuedBy: {
    id: 'clx123abc456def',
    email: 'admin@acme.com',
    firstName: 'Jane',
    lastName: 'Doe',
    role: Role.ADMIN,
  },
  issueDate: null,
  expectedDeliveryDate: '2026-11-30T00:00:00.000Z',
  totalAmount: 2400.0,
  currency: 'USD',
  paymentTerms: 'Net 30',
  deliveryAddress: '123 Procurement Way, Suite 400, Lagos',
  notes: 'Deliver to loading dock B between 9am and 5pm.',
  status: 'DRAFT',
  items: [purchaseOrderItemResponseExample],
  createdAt: '2026-08-01T10:00:00.000Z',
  updatedAt: '2026-08-01T10:00:00.000Z',
};

export const paginatedPurchaseOrderResponseExample = {
  purchaseOrders: [purchaseOrderResponseExample],
  page: 1,
  limit: 20,
  total: 1,
  totalPages: 1,
};

export const deletePurchaseOrderResponseExample = {
  message: 'Purchase order deleted successfully',
};

export const cancelPurchaseOrderResponseExample = {
  purchaseOrder: {
    ...purchaseOrderResponseExample,
    status: 'CANCELLED',
  },
};

export const createGoodsReceiptRequestExample = {
  purchaseOrderId: 'clxpo123',
  receiptDate: '2026-09-15T10:00:00.000Z',
  warehouse: 'Central Warehouse - Block A',
  notes: 'Initial delivery for office furniture order.',
};

export const updateGoodsReceiptRequestExample = {
  receiptDate: '2026-09-16T10:00:00.000Z',
  warehouse: 'Central Warehouse - Block B',
  notes: 'Updated receipt notes.',
};

export const goodsReceiptItemResponseExample = {
  id: 'clxgrnitem123',
  purchaseOrderItemId: 'clxpoitem123',
  quantityOrdered: 10,
  quantityReceived: 5,
  quantityRejected: 0,
  remarks: null,
  createdAt: '2026-08-01T10:00:00.000Z',
  updatedAt: '2026-08-01T10:00:00.000Z',
};

export const goodsReceiptResponseExample = {
  id: 'clxgrn123',
  receiptNumber: 'GRN-2026-000001',
  purchaseOrderId: 'clxpo123',
  organisationId: 'clxorg123',
  receivedBy: {
    id: 'clx123abc456def',
    email: 'warehouse@acme.com',
    firstName: 'Sam',
    lastName: 'Receiver',
    role: Role.USER,
  },
  receiptDate: '2026-09-15T10:00:00.000Z',
  warehouse: 'Central Warehouse - Block A',
  notes: 'Initial delivery for office furniture order.',
  status: 'DRAFT',
  items: [goodsReceiptItemResponseExample],
  createdAt: '2026-08-01T10:00:00.000Z',
  updatedAt: '2026-08-01T10:00:00.000Z',
};

export const paginatedGoodsReceiptResponseExample = {
  goodsReceipts: [goodsReceiptResponseExample],
  page: 1,
  limit: 20,
  total: 1,
  totalPages: 1,
};

export const receiveGoodsRequestExample = {
  items: [
    {
      goodsReceiptItemId: 'clxgrnitem123',
      quantityReceived: 5,
    },
  ],
};

export const rejectGoodsRequestExample = {
  items: [
    {
      goodsReceiptItemId: 'clxgrnitem123',
      quantityRejected: 2,
      remarks: 'Items damaged during transit. Packaging was compromised.',
    },
  ],
};

export const deleteGoodsReceiptResponseExample = {
  message: 'Goods receipt deleted successfully',
};

export const completeGoodsReceiptResponseExample = {
  ...goodsReceiptResponseExample,
  status: 'COMPLETED',
  items: [
    {
      ...goodsReceiptItemResponseExample,
      quantityReceived: 10,
    },
  ],
};
