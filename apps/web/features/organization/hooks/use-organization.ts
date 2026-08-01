"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { organizationRepository } from "@/features/organization/api/organization.repository";
import type {
  AcceptInvitationFormValues,
  DeleteOrganizationFormValues,
  InviteMemberFormValues,
  OrganizationProfileFormValues,
  UpdateMemberRoleFormValues,
} from "@/features/organization/schemas/organization.schema";
import { getErrorMessage } from "@/lib/api";
import type { Role } from "@/lib/api/types";
import { useAuthStore } from "@/stores/auth-store";

export const organizationQueryKeys = {
  current: ["organization", "current"] as const,
  invitations: (organisationId: string) =>
    ["organization", "invitations", organisationId] as const,
};

export function useOrganization() {
  return useQuery({
    queryKey: organizationQueryKeys.current,
    queryFn: () => organizationRepository.getCurrent(),
    staleTime: 60 * 1000,
  });
}

export function useUpdateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: OrganizationProfileFormValues) =>
      organizationRepository.updateCurrent(values),
    onSuccess: (data) => {
      queryClient.setQueryData(organizationQueryKeys.current, data);
      useAuthStore.setState({
        organisation: { id: data.id, name: data.name },
      });
      toast.success("Organisation profile updated");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useDeleteOrganization() {
  const router = useRouter();
  const clearSession = useAuthStore((state) => state.clearSession);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => organizationRepository.deleteCurrent(),
    onSuccess: () => {
      clearSession();
      queryClient.clear();
      toast.success("Organisation deleted");
      router.push("/register");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useUpdateMemberRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      values,
    }: {
      userId: string;
      values: UpdateMemberRoleFormValues;
    }) => organizationRepository.updateMemberRole(userId, values.role),
    onSuccess: (data) => {
      queryClient.setQueryData(organizationQueryKeys.current, data);
      toast.success("Member role updated");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useInvitations(organisationId?: string) {
  return useQuery({
    queryKey: organizationQueryKeys.invitations(organisationId ?? ""),
    queryFn: () => organizationRepository.listInvitations(organisationId!),
    enabled: Boolean(organisationId),
    staleTime: 30 * 1000,
  });
}

export function useInviteMember(organisationId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: InviteMemberFormValues) =>
      organizationRepository.inviteMember(organisationId!, values),
    onSuccess: (data) => {
      if (organisationId) {
        queryClient.invalidateQueries({
          queryKey: organizationQueryKeys.invitations(organisationId),
        });
      }
      toast.success("Invitation sent", {
        description: `Share this token with ${data.invitation.email}: ${data.token}`,
        duration: 10000,
      });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useCancelInvitation(organisationId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invitationId: string) =>
      organizationRepository.cancelInvitation(invitationId),
    onSuccess: () => {
      if (organisationId) {
        queryClient.invalidateQueries({
          queryKey: organizationQueryKeys.invitations(organisationId),
        });
      }
      toast.success("Invitation cancelled");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useAcceptInvitation() {
  const router = useRouter();

  return useMutation({
    mutationFn: (values: AcceptInvitationFormValues) =>
      organizationRepository.acceptInvitation(values),
    onSuccess: (data) => {
      toast.success(data.message);
      router.push("/login");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useDeleteOrganizationWithConfirm() {
  const deleteOrganization = useDeleteOrganization();

  return {
    ...deleteOrganization,
    mutateWithConfirm: (
      organisationName: string,
      values: DeleteOrganizationFormValues,
    ) => {
      if (values.confirmName !== organisationName) {
        toast.error("Confirmation name does not match");
        return;
      }
      deleteOrganization.mutate();
    },
  };
}

export function useAssignableRoles(): Role[] {
  return [
    "ADMIN",
    "FINANCE",
    "PROCUREMENT_MANAGER",
    "DEPARTMENT_HEAD",
    "USER",
  ];
}
