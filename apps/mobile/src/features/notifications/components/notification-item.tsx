import { Pressable, StyleSheet, Text, View } from "react-native";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { AppNotification } from "@/lib/api/types";
import { useAppTheme } from "@/providers/theme-provider";
import { spacing, typography } from "@/theme";

type NotificationItemProps = {
  notification: AppNotification;
  onPress?: () => void;
};

export function NotificationItem({ notification, onPress }: NotificationItemProps) {
  const { theme } = useAppTheme();

  return (
    <Pressable onPress={onPress}>
      <Card muted={!notification.read}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>{notification.title}</Text>
          {!notification.read ? <Badge label="New" tone="primary" /> : null}
        </View>
        <Text style={[styles.message, { color: theme.textSecondary }]}>
          {notification.message}
        </Text>
        <Text style={[styles.timestamp, { color: theme.textMuted }]}>
          {new Date(notification.createdAt).toLocaleString()}
        </Text>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  title: {
    ...typography.label,
    flex: 1,
  },
  message: {
    ...typography.body,
  },
  timestamp: {
    ...typography.caption,
  },
});
