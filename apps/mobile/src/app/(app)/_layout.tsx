import { Redirect, Stack } from "expo-router";

import { OfflineBanner } from "@/components/ui/offline-banner";
import { useAuthStore } from "@/stores/auth-store";

export default function AppLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrated = useAuthStore((state) => state.isHydrated);

  if (isHydrated && !isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <>
      <OfflineBanner />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}
