export type ApiResponseMeta = {
  correlationId?: string;
  timestamp: string;
  requestId?: string;
};

export type ApiSuccessResponse<T> = {
  success: true;
  data: T;
  meta: ApiResponseMeta;
};

export type ApiErrorResponse = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta: ApiResponseMeta;
};

export type Role =
  | "ADMIN"
  | "FINANCE"
  | "PROCUREMENT_MANAGER"
  | "DEPARTMENT_HEAD"
  | "USER";

export type SafeUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  isVerified: boolean;
  organisationId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type OrganisationSummary = {
  id: string;
  name: string;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type LoginResponse = AuthTokens & {
  user: SafeUser;
  organisation?: OrganisationSummary | null;
};

export type UserProfile = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  isVerified: boolean;
  organisationId: string;
  organisationName?: string;
  createdAt: string;
  updatedAt: string;
};

export type MessageResponse = {
  message: string;
};

export type AppNotification = {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
};

export type ExecutiveDashboard = {
  totalProcurementRequests: number;
  openProcurementRequests: number;
  pendingApprovals: number;
  outstandingPurchaseOrders: number;
  activeContracts: number;
  invoicesAwaitingApproval: number;
  totalSpend: number;
};

export type NotificationPreference = {
  id: string;
  userId: string;
  emailEnabled: boolean;
  inAppEnabled: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PendingApprovalRequest = {
  id: string;
  title: string;
  department: string;
  estimatedBudget: number;
  currency: string;
  priority: string;
  status: string;
  requester: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
};

export type PendingApproval = {
  id: string;
  workflowId: string;
  role: string;
  level: number;
  status: string;
  comments?: string | null;
  createdAt: string;
  procurementRequest: PendingApprovalRequest | null;
};

export type PendingApprovalsResponse = {
  pendingApprovals: PendingApproval[];
};

export type PurchaseOrderStatus =
  | "DRAFT"
  | "ISSUED"
  | "ACKNOWLEDGED"
  | "PARTIALLY_DELIVERED"
  | "COMPLETED"
  | "CANCELLED";

export type PurchaseOrder = {
  id: string;
  poNumber: string;
  vendor: { id: string; name: string; email: string };
  expectedDeliveryDate: string;
  totalAmount: number;
  currency: string;
  paymentTerms?: string | null;
  deliveryAddress?: string | null;
  notes?: string | null;
  status: PurchaseOrderStatus;
  items: Array<{
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  issueDate?: string | null;
  createdAt: string;
};

export type PaginatedPurchaseOrders = {
  purchaseOrders: PurchaseOrder[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type InvoiceStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "MATCHED"
  | "APPROVED"
  | "REJECTED"
  | "PAID";

export type Invoice = {
  id: string;
  invoiceNumber: string;
  vendor: { id: string; name: string; email: string };
  invoiceDate: string;
  dueDate: string;
  totalAmount: number;
  currency: string;
  status: InvoiceStatus;
  notes?: string | null;
  items: Array<{
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  createdAt: string;
};

export type PaginatedInvoices = {
  invoices: Invoice[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type ContractStatus =
  | "DRAFT"
  | "UNDER_REVIEW"
  | "ACTIVE"
  | "EXPIRED"
  | "TERMINATED"
  | "RENEWED";

export type Contract = {
  id: string;
  contractNumber: string;
  vendor: { id: string; name: string; email: string };
  title: string;
  description: string;
  contractType: string;
  startDate: string;
  endDate: string;
  value: number;
  currency: string;
  status: ContractStatus;
  signedByOrganisation?: string | null;
  signedByVendor?: string | null;
  documents: Array<{
    id: string;
    fileName: string;
    fileUrl: string;
  }>;
  createdAt: string;
};

export type PaginatedContracts = {
  contracts: Contract[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type Vendor = {
  id: string;
  name: string;
  email: string;
  status: string;
};

export type PaginatedVendors = {
  vendors: Vendor[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type RFQ = {
  id: string;
  rfqNumber: string;
  title: string;
  description: string;
  status: string;
  closingDate: string;
  vendors?: Array<{ vendor: { id: string; name: string } }>;
};

export type PaginatedRfqs = {
  rfqs: RFQ[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type ChatRole = "user" | "assistant";

export type ChatRequest = {
  question: string;
  context?: string;
  conversationHistory?: Array<{
    role: ChatRole;
    content: string;
  }>;
};

export type ChatResponse = {
  question: string;
  answer: string;
  relevantRecords: Array<{
    entityType: string;
    entityId: string;
    score: number;
    snippet: string;
  }>;
  provider: string;
};

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
};
