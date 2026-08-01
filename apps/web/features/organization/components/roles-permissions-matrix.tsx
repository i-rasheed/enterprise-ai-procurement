"use client";

import { Check, X } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ASSIGNABLE_ROLES,
  PERMISSION_LABELS,
  ROLE_LABELS,
  ROLE_PERMISSIONS,
} from "@/features/organization/config/permissions";
import type { PermissionKey } from "@/features/organization/types";

const PERMISSIONS: PermissionKey[] = [
  "view_dashboard",
  "manage_organization",
  "manage_members",
  "manage_invitations",
  "manage_procurement",
  "manage_vendors",
  "manage_finance",
  "view_analytics",
  "approve_requests",
];

export function RolesPermissionsMatrix() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Roles & permissions</CardTitle>
        <CardDescription>
          Reference matrix for role-based access within your organisation.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Permission</TableHead>
              {ASSIGNABLE_ROLES.map((role) => (
                <TableHead key={role} className="text-center">
                  {ROLE_LABELS[role]}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {PERMISSIONS.map((permission) => (
              <TableRow key={permission}>
                <TableCell className="font-medium">
                  {PERMISSION_LABELS[permission]}
                </TableCell>
                {ASSIGNABLE_ROLES.map((role) => {
                  const allowed = ROLE_PERMISSIONS[role].includes(permission);
                  return (
                    <TableCell key={role} className="text-center">
                      {allowed ? (
                        <Check className="mx-auto size-4 text-emerald-600" />
                      ) : (
                        <X className="text-muted-foreground mx-auto size-4" />
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
