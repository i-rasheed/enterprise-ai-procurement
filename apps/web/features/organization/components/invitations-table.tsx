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
import { useCancelInvitation } from "@/features/organization/hooks/use-organization";
import type { OrganizationInvitation } from "@/features/organization/types";
import { formatRole } from "@/lib/utils";

type InvitationsTableProps = {
  invitations: OrganizationInvitation[];
  organisationId: string;
};

export function InvitationsTable({
  invitations,
  organisationId,
}: InvitationsTableProps) {
  const cancelInvitation = useCancelInvitation(organisationId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending invitations</CardTitle>
        <CardDescription>
          Manage outstanding invitations for your organisation.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {invitations.length === 0 ? (
          <p className="text-muted-foreground py-8 text-center text-sm">
            No pending invitations.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invitations.map((invitation) => (
                <TableRow key={invitation.id}>
                  <TableCell>{invitation.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {formatRole(invitation.role)}
                    </Badge>
                  </TableCell>
                  <TableCell>{invitation.status}</TableCell>
                  <TableCell>
                    {new Date(invitation.expiresAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={cancelInvitation.isPending}
                      onClick={() => cancelInvitation.mutate(invitation.id)}
                    >
                      Cancel
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
