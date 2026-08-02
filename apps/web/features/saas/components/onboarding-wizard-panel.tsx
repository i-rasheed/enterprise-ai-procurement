"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { saasRepository } from "@/features/saas/api/saas.repository";

export function OnboardingWizardPanel() {
  const queryClient = useQueryClient();

  const statusQuery = useQuery({
    queryKey: ["onboarding", "status"],
    queryFn: () => saasRepository.getOnboardingStatus(),
  });

  const advanceMutation = useMutation({
    mutationFn: () => saasRepository.advanceOnboarding(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["onboarding", "status"] });
    },
  });

  const skipMutation = useMutation({
    mutationFn: () => saasRepository.skipOnboarding(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["onboarding", "status"] });
    },
  });

  const status = statusQuery.data;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Onboarding"
        description="Complete setup steps to get your organisation production-ready."
      />

      <Card>
        <CardHeader>
          <CardTitle>
            Step {(status?.currentStep ?? 0) + 1} of {status?.totalSteps ?? 5}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="space-y-2 text-sm">
            {status?.steps?.map((step: { id: string; completed: boolean; current: boolean }) => (
              <li key={step.id} className={step.current ? "font-medium" : "text-muted-foreground"}>
                {step.completed ? "✓" : step.current ? "→" : "○"} {step.id.replaceAll("_", " ")}
              </li>
            ))}
          </ul>
          {!status?.completed ? (
            <div className="flex gap-3">
              <Button onClick={() => advanceMutation.mutate()} disabled={advanceMutation.isPending}>
                Complete step
              </Button>
              <Button variant="outline" onClick={() => skipMutation.mutate()} disabled={skipMutation.isPending}>
                Skip wizard
              </Button>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">Onboarding complete.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
