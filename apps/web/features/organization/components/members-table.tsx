"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  ROLE_LABELS,
} from "@/features/organization/config/permissions";
import { useUpdateMemberRole } from "@/features/organization/hooks/use-organization";
import type { OrganizationMember } from "@/features/organization/types";
import { formatRole } from "@/lib/utils";
import type { Role } from "@/lib/api/types";
import { useAuthStore } from "@/stores/auth-store";

type MembersTableProps = {
  members: OrganizationMember[];
  canManage: boolean;
};

export function MembersTable({ members, canManage }: MembersTableProps) {
  const currentUserId = useAuthStore((state) => state.user?.id);
  const updateMemberRole = useUpdateMemberRole();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Members</CardTitle>
        <CardDescription>
          {members.length} member{members.length === 1 ? "" : "s"} in this
          organisation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              {canManage ? <TableHead className="text-right">Actions</TableHead> : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.id}>
                <TableCell className="font-medium">
                  {member.firstName} {member.lastName}
                </TableCell>
                <TableCell>{member.email}</TableCell>
                <TableCell>
                  {canManage && member.id !== currentUserId ? (
                    <select
                      className="border-input bg-background h-8 rounded-md border px-2 text-sm"
                      value={member.role}
                      disabled={updateMemberRole.isPending}
                      onChange={(event) =>
                        updateMemberRole.mutate({
                          userId: member.id,
                          values: { role: event.target.value as Role },
                        })
                      }
                    >
                      {ASSIGNABLE_ROLES.map((role) => (
                        <option key={role} value={role}>
                          {ROLE_LABELS[role]}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <Badge variant="outline">{formatRole(member.role)}</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={member.isVerified ? "secondary" : "destructive"}>
                    {member.isVerified ? "Verified" : "Unverified"}
                  </Badge>
                </TableCell>
                {canManage ? (
                  <TableCell className="text-right">
                    {member.id === currentUserId ? (
                      <span className="text-muted-foreground text-xs">You</span>
                    ) : (
                      <Button variant="ghost" size="sm" disabled>
                        Active
                      </Button>
                    )}
                  </TableCell>
                ) : null}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
