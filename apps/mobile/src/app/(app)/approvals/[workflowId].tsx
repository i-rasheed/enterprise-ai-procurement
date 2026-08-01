import { StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Screen } from "@/components/ui/screen";
import { StatusBadge, formatCurrency, statusTone } from "@/components/ui/section-header";
import {
  useApproveWorkflow,
  usePendingApprovals,
  useRejectWorkflow,
} from "@/features/approvals/hooks/use-approvals";
import { useAppTheme } from "@/providers/theme-provider";
import { spacing, typography } from "@/theme";

export default function ApprovalDetailScreen() {
  const { workflowId } = useLocalSearchParams<{ workflowId: string }>();
  const { theme } = useAppTheme();
  const approvalsQuery = usePendingApprovals();
  const approve = useApproveWorkflow();
  const reject = useRejectWorkflow();

  const approval = approvalsQuery.data?.find((item) => item.workflowId === workflowId);
  const request = approval?.procurementRequest;

  return (
    <Screen loading={approvalsQuery.isLoading}>
      {!request ? (
        <EmptyState
          title="Approval not found"
          description="This approval may have already been processed."
        />
      ) : (
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]}>{request.title}</Text>
            <StatusBadge label={approval.status} tone={statusTone(approval.status)} />
          </View>

          <Card>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Department</Text>
            <Text style={[styles.value, { color: theme.text }]}>{request.department}</Text>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Requester</Text>
            <Text style={[styles.value, { color: theme.text }]}>
              {request.requester.firstName} {request.requester.lastName}
            </Text>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Budget</Text>
            <Text style={[styles.value, { color: theme.text }]}>
              {formatCurrency(request.estimatedBudget, request.currency)}
            </Text>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Priority</Text>
            <Text style={[styles.value, { color: theme.text }]}>{request.priority}</Text>
          </Card>

          <View style={styles.actions}>
            <Button
              label="Approve"
              fullWidth
              loading={approve.isPending}
              onPress={() =>
                approve.mutate({
                  workflowId: approval.workflowId,
                  comments: "Approved via mobile detail view",
                })
              }
            />
            <Button
              label="Reject"
              variant="danger"
              fullWidth
              loading={reject.isPending}
              onPress={() =>
                reject.mutate({
                  workflowId: approval.workflowId,
                  comments: "Rejected via mobile detail view",
                  reason: "Needs revision",
                })
              }
            />
          </View>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.md,
    paddingHorizontal: spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  title: {
    ...typography.heading,
    flex: 1,
  },
  label: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
  value: {
    ...typography.bodyMedium,
  },
  actions: {
    gap: spacing.sm,
  },
});
