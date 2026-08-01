import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Screen } from "@/components/ui/screen";
import { useLogout, useProfile } from "@/features/auth/hooks/use-auth";
import { ProfileSummary } from "@/features/profile/components/profile-summary";
import { useAuthStore } from "@/stores/auth-store";
import { spacing, typography } from "@/theme";
import { useAppTheme } from "@/providers/theme-provider";
import { isOnline } from "@/lib/offline/network";
import { useOfflineStore } from "@/stores/offline-store";

export default function ProfileScreen() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const user = useAuthStore((state) => state.user);
  const organisation = useAuthStore((state) => state.organisation);
  const network = useOfflineStore((state) => state.network);
  const lastSyncedAt = useOfflineStore((state) => state.lastSyncedAt);
  const profileQuery = useProfile();
  const logout = useLogout();

  const profile = profileQuery.data ?? user;

  const handleLogout = async () => {
    await logout.mutateAsync();
    router.replace("/(auth)/login");
  };

  return (
    <Screen
      title="Profile"
      description="Account details and session controls"
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
            <Text style={[styles.cardTitle, { color: theme.text }]}>Offline support</Text>
            <Text style={[styles.cardBody, { color: theme.textSecondary }]}>
              Status: {isOnline(network) ? "Online" : "Offline"}
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
});
