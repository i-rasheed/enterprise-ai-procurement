import { z } from "zod";

import type { Role } from "@/lib/api/types";

import { ASSIGNABLE_ROLES } from "../config/permissions";

const roleEnum = z.enum([
  "ADMIN",
  "FINANCE",
  "PROCUREMENT_MANAGER",
  "DEPARTMENT_HEAD",
  "USER",
] satisfies [Role, ...Role[]]);

export const organizationProfileSchema = z.object({
  name: z.string().min(2, "Organisation name must be at least 2 characters"),
});

export const inviteMemberSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  role: roleEnum.refine((role) => ASSIGNABLE_ROLES.includes(role), {
    message: "Select a valid role",
  }),
});

export const updateMemberRoleSchema = z.object({
  role: roleEnum,
});

export const acceptInvitationSchema = z.object({
  token: z.string().min(1, "Invitation token is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain an uppercase letter")
    .regex(/[a-z]/, "Password must contain a lowercase letter")
    .regex(/[0-9]/, "Password must contain a number")
    .regex(/[^A-Za-z0-9]/, "Password must contain a special character"),
});

export const deleteOrganizationSchema = z.object({
  confirmName: z.string().min(1, "Type the organisation name to confirm"),
});

export type OrganizationProfileFormValues = z.infer<
  typeof organizationProfileSchema
>;
export type InviteMemberFormValues = z.infer<typeof inviteMemberSchema>;
export type UpdateMemberRoleFormValues = z.infer<typeof updateMemberRoleSchema>;
export type AcceptInvitationFormValues = z.infer<typeof acceptInvitationSchema>;
export type DeleteOrganizationFormValues = z.infer<
  typeof deleteOrganizationSchema
>;
