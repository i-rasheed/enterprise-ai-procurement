import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
} from "@/lib/api";
import type { MessageResponse, Role } from "@/lib/api/types";

import type {
  CreateInvitationResponse,
  InvitationListResponse,
  Organization,
} from "../types";

export type UpdateOrganizationInput = {
  name: string;
};

export type InviteMemberInput = {
  email: string;
  role: Role;
};

export type AcceptInvitationInput = {
  token: string;
  firstName: string;
  lastName: string;
  password: string;
};

export const organizationRepository = {
  getCurrent() {
    return apiGet<Organization>("/organisations/me");
  },

  updateCurrent(input: UpdateOrganizationInput) {
    return apiPatch<Organization>("/organisations/me", input);
  },

  deleteCurrent() {
    return apiDelete<MessageResponse>("/organisations/me");
  },

  updateMemberRole(userId: string, role: Role) {
    return apiPatch<Organization>(`/organisations/me/members/${userId}/role`, {
      role,
    });
  },

  listInvitations(organisationId: string) {
    return apiGet<InvitationListResponse>(
      `/organisations/${organisationId}/invitations`,
    );
  },

  inviteMember(organisationId: string, input: InviteMemberInput) {
    return apiPost<CreateInvitationResponse>(
      `/organisations/${organisationId}/invitations`,
      input,
    );
  },

  cancelInvitation(invitationId: string) {
    return apiDelete<MessageResponse>(`/invitations/${invitationId}`);
  },

  acceptInvitation(input: AcceptInvitationInput) {
    return apiPost<{ message: string }>("/invitations/accept", input);
  },
};
