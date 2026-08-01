import { StyleSheet, Text, View } from "react-native";

import { useAppTheme } from "@/providers/theme-provider";
import { isOnline } from "@/lib/offline/network";
import { useOfflineStore } from "@/stores/offline-store";
import { spacing, typography } from "@/theme";

export function OfflineBanner() {
  const { theme } = useAppTheme();
  const network = useOfflineStore((state) => state.network);
  const lastSyncedAt = useOfflineStore((state) => state.lastSyncedAt);

  if (isOnline(network)) {
    return null;
  }

  return (
    <View style={[styles.banner, { backgroundColor: theme.warning }]}>
      <Text style={[styles.text, { color: theme.primaryForeground }]}>
        You are offline. Showing cached data
        {lastSyncedAt ? ` from ${new Date(lastSyncedAt).toLocaleString()}` : ""}.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  text: {
    ...typography.caption,
    textAlign: "center",
  },
});
