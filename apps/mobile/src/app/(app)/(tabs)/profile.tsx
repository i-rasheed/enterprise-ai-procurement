import { StyleSheet, Switch, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Screen } from "@/components/ui/screen";
import {
  useNotificationPreferences,
  useUpdateNotificationPreferences,
} from "@/features/approvals/hooks/use-approvals";
import { useLogout, useProfile } from "@/features/auth/hooks/use-auth";
import { ProfileSummary } from "@/features/profile/components/profile-summary";
import { useAuthStore } from "@/stores/auth-store";
import { useOfflineStore } from "@/stores/offline-store";
import { spacing, typography } from "@/theme";
import { useAppTheme } from "@/providers/theme-provider";
import { isOnline } from "@/lib/offline/network";

export default function ProfileScreen() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const user = useAuthStore((state) => state.user);
  const organisation = useAuthStore((state) => state.organisation);
  const network = useOfflineStore((state) => state.network);
  const lastSyncedAt = useOfflineStore((state) => state.lastSyncedAt);
  const pendingSyncCount = useOfflineStore((state) => state.pendingSyncCount);
  const pushToken = useOfflineStore((state) => state.pushToken);
  const profileQuery = useProfile();
  const logout = useLogout();
  const preferencesQuery = useNotificationPreferences();
  const updatePreferences = useUpdateNotificationPreferences();

  const profile = profileQuery.data ?? user;
  const preferences = preferencesQuery.data;

  const handleLogout = async () => {
    await logout.mutateAsync();
    router.replace("/(auth)/login");
  };

  return (
    <Screen
      title="Profile"
      description="Account, notifications, and offline sync"
      loading={profileQuery.isLoading && !profile}>
      {profile ? (
        <View style={styles.content}>
          <ProfileSummary
            firstName={profile.firstName}
            lastName={profile.lastName}
            email={profile.email}
            role={profile.role}
            organisationName={organisation?.name ?? profileQuery.data?.organisationName}
          />

          <Card muted>
            <Text style={[styles.cardTitle, { color: theme.text }]}>Push notifications</Text>
            <Text style={[styles.cardBody, { color: theme.textSecondary }]}>
              Device token: {pushToken ? "Registered" : "Not registered"}
            </Text>
            <View style={styles.switchRow}>
              <Text style={[styles.cardBody, { color: theme.text }]}>In-app alerts</Text>
              <Switch
                value={preferences?.inAppEnabled ?? true}
                onValueChange={(inAppEnabled) =>
                  updatePreferences.mutate({
                    emailEnabled: preferences?.emailEnabled ?? true,
                    inAppEnabled,
                  })
                }
              />
            </View>
            <View style={styles.switchRow}>
              <Text style={[styles.cardBody, { color: theme.text }]}>Email alerts</Text>
              <Switch
                value={preferences?.emailEnabled ?? true}
                onValueChange={(emailEnabled) =>
                  updatePreferences.mutate({
                    emailEnabled,
                    inAppEnabled: preferences?.inAppEnabled ?? true,
                  })
                }
              />
            </View>
            <Button
              label="View notification inbox"
              variant="secondary"
              fullWidth
              onPress={() => router.push("/notifications")}
            />
          </Card>

          <Card muted>
            <Text style={[styles.cardTitle, { color: theme.text }]}>Offline sync</Text>
            <Text style={[styles.cardBody, { color: theme.textSecondary }]}>
              Network: {isOnline(network) ? "Online" : "Offline"}
            </Text>
            <Text style={[styles.cardBody, { color: theme.textSecondary }]}>
              Pending actions: {pendingSyncCount}
            </Text>
            <Text style={[styles.cardBody, { color: theme.textSecondary }]}>
              Last synced: {lastSyncedAt ? new Date(lastSyncedAt).toLocaleString() : "Not yet"}
            </Text>
          </Card>

          <Button
            label={logout.isPending ? "Signing out..." : "Sign out"}
            variant="danger"
            loading={logout.isPending}
            fullWidth
            onPress={handleLogout}
          />
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.md,
  },
  cardTitle: {
    ...typography.label,
  },
  cardBody: {
    ...typography.body,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
