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

export type RegisterResponse = AuthTokens & {
  user: SafeUser;
  organisation: OrganisationSummary;
};

export type JwtPayload = {
  sub: string;
  email: string;
  role: Role;
  organisationId?: string | null;
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

export type VerifyEmailResponse = MessageResponse & {
  isVerified: boolean;
};

export type RevokeSessionsResponse = MessageResponse & {
  revokedCount: number;
};

export type PaginatedMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type PaginatedResponse<T> = {
  items: T[];
  meta: PaginatedMeta;
};
