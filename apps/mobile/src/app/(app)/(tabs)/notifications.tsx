import { StyleSheet, View } from "react-native";

import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Screen } from "@/components/ui/screen";
import { NotificationItem } from "@/features/notifications/components/notification-item";
import {
  useMarkNotificationRead,
  useNotifications,
} from "@/features/dashboard/hooks/use-dashboard";
import { spacing } from "@/theme";

export default function NotificationsScreen() {
  const notificationsQuery = useNotifications();
  const markRead = useMarkNotificationRead();

  return (
    <Screen
      title="Notifications"
      description="Approvals, updates, and procurement alerts"
      loading={notificationsQuery.isLoading}>
      {notificationsQuery.isError ? (
        <ErrorState
          message={notificationsQuery.error.message}
          onRetry={() => notificationsQuery.refetch()}
        />
      ) : notificationsQuery.data?.length ? (
        <View style={styles.list}>
          {notificationsQuery.data.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onPress={() => {
                if (!notification.read) {
                  markRead.mutate(notification.id);
                }
              }}
            />
          ))}
        </View>
      ) : (
        <EmptyState
          title="All caught up"
          description="New procurement notifications will appear here."
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.sm,
  },
});
