import { Redirect } from "expo-router";

import { LoginForm } from "@/features/auth/components/login-form";
import { Screen } from "@/components/ui/screen";
import { useAuthStore } from "@/stores/auth-store";

export default function LoginScreen() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    return <Redirect href="/(app)/(tabs)" />;
  }

  return (
    <Screen scroll={false}>
      <LoginForm />
    </Screen>
  );
}
