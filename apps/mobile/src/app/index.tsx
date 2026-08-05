import { Redirect } from "expo-router";

import { useAuthStore } from "@/stores/auth-store";

export default function Index() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrated = useAuthStore((state) => state.isHydrated);

  if (!isHydrated) {
    return null;
  }

  return <Redirect href={isAuthenticated ? "/(app)/(tabs)" : "/(auth)/login"} />;
}
