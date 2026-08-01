import type { Role, SafeUser } from "@/lib/api/types";

export type Organization = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  users: SafeUser[];
};

export type OrganizationMember = SafeUser;

export type InvitationStatus = "PENDING" | "ACCEPTED" | "EXPIRED" | "CANCELLED";

export type OrganizationInvitation = {
  id: string;
  email: string;
  organisationId: string;
  role: Role;
  status: InvitationStatus;
  expiresAt: string;
  acceptedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateInvitationResponse = {
  invitation: OrganizationInvitation;
  token: string;
};

export type InvitationListResponse = {
  invitations: OrganizationInvitation[];
};

export type PermissionKey =
  | "view_dashboard"
  | "manage_organization"
  | "manage_members"
  | "manage_invitations"
  | "manage_procurement"
  | "manage_vendors"
  | "manage_finance"
  | "view_analytics"
  | "approve_requests";

export type RolePermissionMap = Record<Role, PermissionKey[]>;
