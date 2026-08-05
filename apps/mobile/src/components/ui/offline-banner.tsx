import { StyleSheet, Text, View } from "react-native";

import { useAppTheme } from "@/providers/theme-provider";
import { isOnline } from "@/lib/offline/network";
import { useOfflineStore } from "@/stores/offline-store";
import { spacing, typography } from "@/theme";

export function OfflineBanner() {
  const { theme } = useAppTheme();
  const network = useOfflineStore((state) => state.network);
  const lastSyncedAt = useOfflineStore((state) => state.lastSyncedAt);
  const pendingSyncCount = useOfflineStore((state) => state.pendingSyncCount);
  const online = isOnline(network);

  if (online && pendingSyncCount === 0) {
    return null;
  }

  return (
    <View style={[styles.banner, { backgroundColor: online ? theme.primary : theme.warning }]}>
      <Text style={[styles.text, { color: theme.primaryForeground }]}>
        {online
          ? `Syncing ${pendingSyncCount} queued action${pendingSyncCount === 1 ? "" : "s"}...`
          : `Offline mode${lastSyncedAt ? ` · cached ${new Date(lastSyncedAt).toLocaleString()}` : ""}${pendingSyncCount ? ` · ${pendingSyncCount} queued` : ""}`}
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
