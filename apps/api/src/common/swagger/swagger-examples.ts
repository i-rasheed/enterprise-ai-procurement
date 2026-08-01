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

export const createInvoiceItemRequestExample = {
  purchaseOrderItemId: 'clxpoitem123',
  description: 'Ergonomic office chair model X200',
  quantity: 10,
  unitPrice: 240.0,
};

export const createInvoiceRequestExample = {
  vendorId: 'clxvendor123',
  purchaseOrderId: 'clxpo123',
  goodsReceiptId: 'clxgrn123',
  invoiceDate: '2026-10-01T00:00:00.000Z',
  dueDate: '2026-10-31T00:00:00.000Z',
  subtotal: 2400.0,
  taxAmount: 240.0,
  currency: 'USD',
  paymentTerms: 'Net 30',
  notes: 'Invoice for delivered office chairs.',
  items: [createInvoiceItemRequestExample],
};

export const updateInvoiceRequestExample = {
  dueDate: '2026-11-05T00:00:00.000Z',
  notes: 'Updated invoice notes.',
};

export const submitInvoiceRequestExample = {
  notes: 'Submitted for three-way matching.',
};

export const approveInvoiceRequestExample = {
  notes: 'Three-way match verified. Approved for payment.',
};

export const rejectInvoiceRequestExample = {
  reason: 'Invoice total does not match purchase order amount.',
};

export const markPaidRequestExample = {
  paidDate: '2026-11-01T12:00:00.000Z',
  paymentReference: 'PAY-2026-000001',
};

export const invoiceItemResponseExample = {
  id: 'clxinvitem123',
  purchaseOrderItemId: 'clxpoitem123',
  description: 'Ergonomic office chair model X200',
  quantity: 10,
  unitPrice: 240.0,
  totalPrice: 2400.0,
  createdAt: '2026-08-01T10:00:00.000Z',
  updatedAt: '2026-08-01T10:00:00.000Z',
};

export const matchingResultResponseExample = {
  id: 'clxmatch123',
  invoiceId: 'clxinv123',
  purchaseOrderId: 'clxpo123',
  goodsReceiptId: 'clxgrn123',
  matchStatus: 'MATCHED',
  matchedBy: {
    id: 'clx123abc456def',
    email: 'finance@acme.com',
    firstName: 'Finance',
    lastName: 'Manager',
    role: Role.FINANCE,
  },
  matchedAt: '2026-08-01T12:00:00.000Z',
  discrepancies: null,
  createdAt: '2026-08-01T12:00:00.000Z',
  updatedAt: '2026-08-01T12:00:00.000Z',
};

export const invoiceResponseExample = {
  id: 'clxinv123',
  invoiceNumber: 'INV-2026-000001',
  vendor: {
    id: 'clxvendor123',
    name: 'Globex Supplies Ltd',
    email: 'vendor@globex.com',
  },
  purchaseOrderId: 'clxpo123',
  goodsReceiptId: 'clxgrn123',
  organisationId: 'clxorg123',
  invoiceDate: '2026-10-01T00:00:00.000Z',
  dueDate: '2026-10-31T00:00:00.000Z',
  subtotal: 2400.0,
  taxAmount: 240.0,
  totalAmount: 2640.0,
  currency: 'USD',
  paymentTerms: 'Net 30',
  status: 'DRAFT',
  notes: 'Invoice for delivered office chairs.',
  items: [invoiceItemResponseExample],
  matchingResult: null,
  createdAt: '2026-08-01T10:00:00.000Z',
  updatedAt: '2026-08-01T10:00:00.000Z',
};

export const paginatedInvoiceResponseExample = {
  invoices: [invoiceResponseExample],
  page: 1,
  limit: 20,
  total: 1,
  totalPages: 1,
};

export const matchInvoiceResponseExample = {
  invoice: { ...invoiceResponseExample, status: 'MATCHED' },
  matchingResult: matchingResultResponseExample,
};

export const deleteInvoiceResponseExample = {
  message: 'Invoice deleted successfully',
};

export const priceMismatchMatchingResultExample = {
  ...matchingResultResponseExample,
  matchStatus: 'PRICE_MISMATCH',
  discrepancies: [
    {
      field: 'unitPrice',
      purchaseOrderItemId: 'clxpoitem123',
      expected: 240.0,
      actual: 250.0,
      message: 'Unit price does not match purchase order',
    },
  ],
};

export const quantityMismatchMatchingResultExample = {
  ...matchingResultResponseExample,
  matchStatus: 'QUANTITY_MISMATCH',
  discrepancies: [
    {
      field: 'quantity',
      purchaseOrderItemId: 'clxpoitem123',
      expected: 10,
      actual: 8,
      message: 'Invoice quantity does not match goods receipt',
    },
  ],
};

export const createContractRequestExample = {
  awardId: 'clxaward123',
  title: 'Office Furniture Supply Agreement',
  description: 'Agreement for supply of ergonomic office furniture.',
  contractType: 'GOODS',
  startDate: '2026-01-01T00:00:00.000Z',
  endDate: '2026-12-31T23:59:59.000Z',
  value: 24000.0,
  currency: 'USD',
  renewalType: 'ANNUAL',
  autoRenew: false,
  signedByOrganisation: 'Jane Doe, Procurement Director',
  signedByVendor: 'Alex Supplier, Vendor Representative',
};

export const updateContractRequestExample = {
  title: 'Updated Office Furniture Supply Agreement',
  value: 26000.0,
  changeSummary: 'Updated contract value and renewal terms.',
};

export const renewContractRequestExample = {
  startDate: '2027-01-01T00:00:00.000Z',
  endDate: '2027-12-31T23:59:59.000Z',
  value: 26000.0,
  renewalDate: '2026-12-01T00:00:00.000Z',
  changeSummary: 'Contract renewed for a second annual term.',
};

export const terminateContractRequestExample = {
  reason: 'Contract terminated due to vendor non-compliance.',
};

export const uploadContractDocumentRequestExample = {
  fileName: 'master-services-agreement.pdf',
  fileUrl:
    'https://storage.example.com/contracts/master-services-agreement.pdf',
  mimeType: 'application/pdf',
};

export const contractVersionResponseExample = {
  id: 'clxversion123',
  version: 1,
  changeSummary: 'Initial contract created.',
  createdBy: {
    id: 'clx123abc456def',
    email: 'admin@acme.com',
    firstName: 'Jane',
    lastName: 'Doe',
    role: Role.ADMIN,
  },
  createdAt: '2026-08-01T10:00:00.000Z',
};

export const contractResponseExample = {
  id: 'clxcontract123',
  contractNumber: 'CTR-2026-000001',
  organisationId: 'clxorg123',
  vendor: {
    id: 'clxvendor123',
    name: 'Globex Supplies Ltd',
    email: 'vendor@globex.com',
  },
  procurementRequestId: 'clxprocurement123',
  purchaseOrderId: null,
  awardId: 'clxaward123',
  title: 'Office Furniture Supply Agreement',
  description: 'Agreement for supply of ergonomic office furniture.',
  contractType: 'GOODS',
  startDate: '2026-01-01T00:00:00.000Z',
  endDate: '2026-12-31T23:59:59.000Z',
  value: 24000.0,
  currency: 'USD',
  renewalType: 'ANNUAL',
  renewalDate: null,
  autoRenew: false,
  status: 'DRAFT',
  signedByOrganisation: 'Jane Doe, Procurement Director',
  signedByVendor: 'Alex Supplier, Vendor Representative',
  createdBy: {
    id: 'clx123abc456def',
    email: 'admin@acme.com',
    firstName: 'Jane',
    lastName: 'Doe',
    role: Role.ADMIN,
  },
  documents: [],
  createdAt: '2026-08-01T10:00:00.000Z',
  updatedAt: '2026-08-01T10:00:00.000Z',
};

export const paginatedContractResponseExample = {
  contracts: [contractResponseExample],
  page: 1,
  limit: 20,
  total: 1,
  totalPages: 1,
};

export const contractHistoryResponseExample = {
  contractId: 'clxcontract123',
  versions: [contractVersionResponseExample],
};

export const deleteContractResponseExample = {
  message: 'Contract deleted successfully',
};

export const contractSummaryResponseExample = {
  contractId: 'clxcontract123',
  executiveSummary:
    'Three-year IT services agreement with Globex Supplies covering cloud infrastructure support and SLA-backed uptime guarantees.',
  importantDates: [
    {
      label: 'Contract Start',
      date: '2026-01-01',
      description: 'Service commencement date',
    },
    {
      label: 'Contract End',
      date: '2026-12-31',
      description: 'Initial term expiry',
    },
  ],
  obligations: [
    'Monthly SLA reporting within 5 business days',
    'Quarterly business review with procurement team',
    'Incident response within 4 hours for critical issues',
  ],
  risks: [
    {
      risk: 'Auto-renewal without spend cap',
      severity: 'MEDIUM',
      mitigation: 'Negotiate renewal notice period and price cap',
    },
  ],
  renewalInformation: {
    autoRenewal: false,
    renewalDate: '2026-12-01',
    noticePeriod: '90 days',
    terms: 'Annual renewal at CPI adjustment',
  },
};

export const clauseExtractionResponseExample = {
  contractId: 'clxcontract123',
  clauses: {
    paymentTerms: {
      found: true,
      summary: 'Net 30 payment terms',
      details: 'Invoices payable within 30 days of receipt',
    },
    termination: {
      found: true,
      summary: 'Termination for convenience with 60-day notice',
      details: 'Either party may terminate with written 60-day notice',
    },
    confidentiality: {
      found: true,
      summary: 'Mutual NDA for 3 years post-termination',
      details: 'Both parties bound to protect confidential information',
    },
    liability: {
      found: true,
      summary: 'Liability capped at contract value',
      details: 'Maximum aggregate liability limited to total contract value',
    },
    warranty: {
      found: true,
      summary: '12-month workmanship warranty',
      details: 'Vendor warrants services meet agreed specifications',
    },
    penalties: {
      found: true,
      summary: 'SLA breach penalties apply',
      details: '5% service credit for uptime below 99.5%',
    },
    forceMajeure: {
      found: true,
      summary: 'Standard force majeure clause included',
      details: 'Excused performance for events beyond reasonable control',
    },
    renewal: {
      found: true,
      summary: 'Annual renewal with 90-day notice',
      details: 'Contract renews annually unless terminated with notice',
    },
  },
};

export const vendorRiskResponseExample = {
  vendorId: 'clxvendor123',
  riskScore: 42,
  financialRisk: {
    score: 35,
    factors: ['Stable payment history', 'No outstanding disputes'],
  },
  deliveryRisk: {
    score: 55,
    factors: [
      'Two partial deliveries in last quarter',
      'Average lead time increasing',
    ],
  },
  complianceRisk: {
    score: 20,
    factors: ['Verified compliance status', 'Valid tax registration'],
  },
  operationalRisk: {
    score: 40,
    factors: [
      'Single-source dependency for IT hardware',
      'Limited backup suppliers',
    ],
  },
  overallRecommendation:
    'Continue engagement with enhanced delivery KPI monitoring and diversify for critical items.',
};

export const procurementRecommendationsResponseExample = {
  procurementRequestId: 'clxprocurement123',
  preferredVendors: [
    {
      vendorName: 'Globex Supplies Ltd',
      reason: 'Highest evaluated bid score and verified compliance',
      estimatedSavings: 15000,
    },
  ],
  savingsOpportunities: [
    'Consolidate laptop orders across departments for volume discount',
    'Negotiate framework pricing for recurring purchases',
  ],
  alternativeSuppliers: [
    {
      name: 'Initech Corp',
      category: 'IT Hardware',
      rationale: 'Competitive pricing on equivalent specifications',
    },
  ],
  procurementStrategy:
    'Run competitive RFQ with three qualified vendors, evaluate TCO including delivery performance, and negotiate framework pricing for 12 months.',
};

export const spendAnalysisRequestExample = {
  department: 'IT',
};

export const spendAnalysisResponseExample = {
  topCategories: [
    { category: 'IT Hardware', totalSpend: 250000, percentage: 35 },
    { category: 'Professional Services', totalSpend: 180000, percentage: 25 },
  ],
  overspending: [
    {
      area: 'Software licenses',
      amount: 45000,
      recommendation: 'Renegotiate enterprise agreement and audit unused seats',
    },
  ],
  vendorConcentration: [
    {
      vendor: 'Globex Supplies Ltd',
      spendShare: 42,
      risk: 'High concentration — consider secondary supplier',
    },
  ],
  costReductionOpportunities: [
    {
      opportunity: 'Vendor consolidation across IT and Facilities',
      estimatedSaving: 80000,
      effort: 'MEDIUM',
    },
  ],
};

export const invoiceAnomalyResponseExample = {
  invoiceId: 'clxinvoice123',
  duplicateInvoices: {
    detected: false,
    details: 'No duplicate invoice numbers found',
  },
  priceAnomalies: [
    {
      item: 'Ergonomic Office Chair',
      expected: 240.0,
      actual: 250.0,
      variance: '4.2%',
    },
  ],
  quantityAnomalies: [],
  missingApprovals: [],
  riskScore: 25,
  summary:
    'Minor price variance detected on one line item. No duplicate or approval issues found.',
};

export const chatRequestExample = {
  question: 'Which vendors have the highest delivery risk this quarter?',
  context: 'Focus on IT hardware procurement.',
  conversationHistory: [
    {
      role: 'user',
      content: 'Show me recent purchase orders for Globex Supplies.',
    },
    {
      role: 'assistant',
      content:
        'Globex Supplies has 3 active purchase orders totalling $72,000.',
    },
  ],
};

export const chatResponseExample = {
  question: 'Which vendors have the highest delivery risk this quarter?',
  answer:
    'Based on recent purchase orders and goods receipts, Globex Supplies shows elevated delivery risk due to two partial deliveries in Q3. Consider diversifying suppliers for critical IT hardware items.',
  relevantRecords: [
    {
      entityType: 'PURCHASE_ORDER',
      entityId: 'clxpo123',
      score: 0.87,
      snippet: 'PO-2026-000003 Globex Supplies partial delivery...',
    },
  ],
  provider: 'openai',
};

export const semanticSearchRequestExample = {
  query: 'payment terms renewal clause',
  entityTypes: ['CONTRACT', 'INVOICE'],
  limit: 10,
};

export const semanticSearchResponseExample = {
  results: [
    {
      entityType: 'CONTRACT',
      entityId: 'clxcontract123',
      score: 0.91,
      snippet:
        'CTR-2026-000001 Office Furniture Supply Agreement renewal terms...',
    },
  ],
};

export const executiveDashboardResponseExample = {
  totalProcurementRequests: 48,
  openProcurementRequests: 12,
  completedProcurementRequests: 30,
  activeVendors: 25,
  approvedVendors: 18,
  totalPurchaseOrders: 35,
  outstandingPurchaseOrders: 8,
  totalContracts: 10,
  activeContracts: 6,
  pendingApprovals: 5,
  invoicesAwaitingApproval: 4,
  invoicesPaid: 22,
  goodsReceiptsPending: 3,
  totalSpend: 1250000,
  savingsGenerated: 85000,
  averageProcurementCycleTimeDays: 14.5,
  averageApprovalTimeDays: 3.2,
  topCategories: [{ name: 'IT Hardware', value: 250000 }],
  topVendors: [{ name: 'Globex Supplies Ltd', value: 420000 }],
  topDepartments: [{ name: 'IT', value: 380000 }],
  spendByCategory: {
    type: 'pie',
    title: 'Spend by Category',
    labels: ['IT Hardware', 'Services'],
    datasets: [{ label: 'Spend by Category', data: [250000, 180000] }],
  },
  spendByVendor: {
    type: 'bar',
    title: 'Spend by Vendor',
    labels: ['Globex Supplies Ltd'],
    datasets: [{ label: 'Spend by Vendor', data: [420000] }],
  },
  spendByDepartment: {
    type: 'bar',
    title: 'Spend by Department',
    labels: ['IT'],
    datasets: [{ label: 'Spend by Department', data: [380000] }],
  },
  budgetUtilization: 72.5,
  monthlyProcurementTrend: {
    type: 'time-series',
    title: 'Monthly Procurement Requests',
    labels: ['2026-01', '2026-02'],
    datasets: [{ label: 'Monthly Procurement Requests', data: [8, 12] }],
  },
  monthlySpendTrend: {
    type: 'time-series',
    title: 'Monthly Spend Trend',
    labels: ['2026-01', '2026-02'],
    datasets: [{ label: 'Monthly Spend Trend', data: [95000, 120000] }],
  },
  monthlySavingsTrend: {
    type: 'time-series',
    title: 'Monthly Savings Trend',
    labels: ['2026-01', '2026-02'],
    datasets: [{ label: 'Monthly Savings Trend', data: [12000, 18000] }],
  },
};

export const analyticsSummaryResponseExample = {
  summary: {
    totalSpend: 1250000,
    invoiceCount: 45,
    averageInvoiceValue: 27777.78,
    savingsGenerated: 85000,
    budgetUtilization: 72.5,
  },
  charts: [
    {
      type: 'pie',
      title: 'Spend by Category',
      labels: ['IT Hardware'],
      datasets: [{ label: 'Spend by Category', data: [250000] }],
    },
  ],
  kpis: {
    savingsPercentage: 6.8,
    budgetConsumption: 72.5,
  },
  pagination: { page: 1, limit: 20, total: 45, totalPages: 3 },
};

export const reportListResponseExample = [
  { id: 'procurement', title: 'Procurement Report' },
  { id: 'vendor', title: 'Vendor Report' },
  { id: 'spend', title: 'Spend Report' },
  { id: 'executive-summary', title: 'Executive Summary' },
];

export const procurementReportResponseExample = {
  id: 'procurement',
  title: 'Procurement Report',
  generatedAt: '2026-08-01T14:00:00.000Z',
  data: {
    total: 48,
    draft: 6,
    submitted: 12,
    approved: 30,
    rejected: 0,
    totalBudget: 1720000,
  },
  charts: [],
  kpis: {
    averageProcurementDurationDays: 14.5,
    departmentPerformance: [
      {
        department: 'IT',
        total: 15,
        approved: 12,
        rejected: 0,
        approvalRate: 80,
      },
    ],
  },
};

export const executiveInsightsResponseExample = {
  topRisks: [
    {
      risk: 'Vendor concentration',
      severity: 'HIGH',
      impact: '42% spend with single vendor',
    },
  ],
  spendAnomalies: [
    {
      area: 'Software licenses',
      description: '15% above budget',
      amount: 45000,
    },
  ],
  savingsOpportunities: ['Consolidate IT hardware orders for volume discount'],
  vendorConcerns: [
    {
      vendor: 'Globex Supplies Ltd',
      concern: 'Partial deliveries',
      recommendation: 'Review SLA terms',
    },
  ],
  contractRisks: [
    {
      contract: 'CTR-2026-000001',
      risk: 'Expiring in 90 days',
      action: 'Initiate renewal review',
    },
  ],
  approvalBottlenecks: [
    {
      level: 2,
      count: 3,
      recommendation: 'Escalate pending finance approvals',
    },
  ],
  executiveSummary:
    'Procurement spend is tracking 7% under budget with strong savings in IT hardware. Vendor concentration and pending approvals at level 2 require executive attention this quarter.',
  provider: 'openai',
};
