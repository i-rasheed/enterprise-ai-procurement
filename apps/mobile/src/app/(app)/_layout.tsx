import { Redirect, Stack } from "expo-router";

import { OfflineBanner } from "@/components/ui/offline-banner";
import { useAppTheme } from "@/providers/theme-provider";
import { useAuthStore } from "@/stores/auth-store";

export default function AppLayout() {
  const { theme } = useAppTheme();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrated = useAuthStore((state) => state.isHydrated);

  if (isHydrated && !isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <>
      <OfflineBanner />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: theme.surface },
          headerTintColor: theme.text,
          headerTitleStyle: { color: theme.text },
          contentStyle: { backgroundColor: theme.background },
        }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="notifications" options={{ title: "Notifications" }} />
        <Stack.Screen name="purchase-orders/index" options={{ title: "Purchase Orders" }} />
        <Stack.Screen name="purchase-orders/[id]" options={{ title: "Purchase Order" }} />
        <Stack.Screen name="invoices/index" options={{ title: "Invoices" }} />
        <Stack.Screen name="invoices/[id]" options={{ title: "Invoice" }} />
        <Stack.Screen name="contracts/index" options={{ title: "Contracts" }} />
        <Stack.Screen name="contracts/[id]" options={{ title: "Contract" }} />
        <Stack.Screen name="vendor/index" options={{ title: "Vendor Portal" }} />
        <Stack.Screen name="approvals/[workflowId]" options={{ title: "Approval Detail" }} />
      </Stack>
    </>
  );
}
