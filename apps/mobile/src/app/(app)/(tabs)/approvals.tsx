import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { ListRow } from "@/components/ui/list-row";
import { Screen } from "@/components/ui/screen";
import { StatusBadge, formatCurrency, statusTone } from "@/components/ui/section-header";
import {
  useApproveWorkflow,
  usePendingApprovals,
  useRejectWorkflow,
} from "@/features/approvals/hooks/use-approvals";

export default function ApprovalsScreen() {
  const router = useRouter();
  const approvalsQuery = usePendingApprovals();
  const approve = useApproveWorkflow();
  const reject = useRejectWorkflow();

  return (
    <Screen
      title="Approvals"
      description="Review and action pending procurement approvals"
      loading={approvalsQuery.isLoading}>
      {approvalsQuery.isError ? (
        <ErrorState
          message={approvalsQuery.error.message}
          onRetry={() => approvalsQuery.refetch()}
        />
      ) : approvalsQuery.data?.length ? (
        <View style={styles.list}>
          {approvalsQuery.data.map((approval) => {
            const request = approval.procurementRequest;
            if (!request) {
              return null;
            }

            return (
              <View key={approval.id} style={styles.item}>
                <ListRow
                  title={request.title}
                  subtitle={`${request.department} · ${request.requester.firstName} ${request.requester.lastName}`}
                  meta={formatCurrency(request.estimatedBudget, request.currency)}
                  trailing={<StatusBadge label={approval.status} tone={statusTone(approval.status)} />}
                  onPress={() =>
                    router.push({
                      pathname: "/approvals/[workflowId]",
                      params: { workflowId: approval.workflowId },
                    })
                  }
                />
                <View style={styles.actions}>
                  <Button
                    label="Approve"
                    size="sm"
                    loading={approve.isPending}
                    onPress={() =>
                      approve.mutate({
                        workflowId: approval.workflowId,
                        comments: "Approved via mobile",
                      })
                    }
                  />
                  <Button
                    label="Reject"
                    size="sm"
                    variant="danger"
                    loading={reject.isPending}
                    onPress={() =>
                      reject.mutate({
                        workflowId: approval.workflowId,
                        comments: "Rejected via mobile",
                        reason: "Insufficient detail",
                      })
                    }
                  />
                </View>
              </View>
            );
          })}
        </View>
      ) : (
        <EmptyState
          title="No pending approvals"
          description="You're all caught up on approval tasks."
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 12,
  },
  item: {
    gap: 8,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },
});
