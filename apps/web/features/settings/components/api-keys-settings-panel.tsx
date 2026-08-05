"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Copy, KeyRound, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  apiKeySchema,
  type ApiKeyFormValues,
} from "@/features/settings/schemas/settings.schema";
import {
  useApiKeys,
  useCreateApiKey,
  useRevokeApiKey,
} from "@/features/settings/hooks/use-settings";
import { canManageApiKeys } from "@/features/settings/config/permissions";
import { useAuthStore } from "@/stores/auth-store";

export function ApiKeysSettingsPanel() {
  const userRole = useAuthStore((state) => state.user?.role);
  const organisationId = useAuthStore((state) => state.organisation?.id);
  const apiKeysQuery = useApiKeys(organisationId);
  const createApiKey = useCreateApiKey(organisationId);
  const revokeApiKey = useRevokeApiKey(organisationId);
  const [createdSecret, setCreatedSecret] = useState<string | null>(null);

  const form = useForm<ApiKeyFormValues>({
    resolver: zodResolver(apiKeySchema),
    defaultValues: { name: "" },
  });

  if (!canManageApiKeys(userRole)) {
    return (
      <EmptyState
        title="Access restricted"
        description="API keys can only be managed by administrators."
      />
    );
  }

  const handleCreate = async (values: ApiKeyFormValues) => {
    const result = await createApiKey.mutateAsync(values.name);
    setCreatedSecret(result.secret);
    form.reset();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">API keys</h2>
        <p className="text-muted-foreground text-sm">
          Create integration keys for external systems. Keys are stored locally
          for this workspace until server-side key management is enabled.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="size-5" />
            Create API key
          </CardTitle>
          <CardDescription>
            Generate a new key for automation or third-party integrations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="flex flex-col gap-4 sm:flex-row sm:items-end"
            onSubmit={form.handleSubmit((values) => void handleCreate(values))}
          >
            <div className="flex-1 space-y-2">
              <Label htmlFor="apiKeyName">Key name</Label>
              <Input
                id="apiKeyName"
                placeholder="e.g. ERP integration"
                {...form.register("name")}
              />
            </div>
            <Button type="submit" disabled={createApiKey.isPending}>
              {createApiKey.isPending ? "Creating..." : "Create key"}
            </Button>
          </form>

          {createdSecret ? (
            <div className="bg-muted/40 mt-4 rounded-lg border p-4">
              <p className="mb-2 text-sm font-medium">
                Copy your key now. It will not be shown again.
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 truncate rounded bg-background px-3 py-2 text-xs">
                  {createdSecret}
                </code>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    void navigator.clipboard.writeText(createdSecret);
                  }}
                >
                  <Copy className="size-4" />
                </Button>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active keys</CardTitle>
          <CardDescription>
            Revoke keys that are no longer needed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {apiKeysQuery.isLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : apiKeysQuery.data && apiKeysQuery.data.length > 0 ? (
            apiKeysQuery.data.map((key) => (
              <div
                key={key.id}
                className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium">{key.name}</p>
                  <p className="text-muted-foreground text-sm">
                    {key.prefix}•••••••• · Created{" "}
                    {new Date(key.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={revokeApiKey.isPending}
                  onClick={() => revokeApiKey.mutate(key.id)}
                >
                  <Trash2 className="size-4" />
                  Revoke
                </Button>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-sm">
              No API keys created yet.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
