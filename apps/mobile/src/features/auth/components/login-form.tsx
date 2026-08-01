import { useRouter } from "expo-router";
import { useEffect } from "react";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  getLoginErrorMessage,
  useLogin,
} from "@/features/auth/hooks/use-auth";
import { loginSchema, type LoginFormValues } from "@/features/auth/schemas/login.schema";
import { useAppTheme } from "@/providers/theme-provider";
import { env } from "@/lib/env";
import { spacing, typography } from "@/theme";

export function LoginForm() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const login = useLogin();
  const [values, setValues] = useState<LoginFormValues>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof LoginFormValues, string>>>(
    {},
  );

  const handleSubmit = () => {
    const parsed = loginSchema.safeParse(values);

    if (!parsed.success) {
      const fieldErrors: Partial<Record<keyof LoginFormValues, string>> = {};
      parsed.error.issues.forEach((issue) => {
        const key = issue.path[0] as keyof LoginFormValues;
        fieldErrors[key] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    login.mutate(parsed.data);
  };

  useEffect(() => {
    if (login.isSuccess) {
      router.replace("/(app)/(tabs)");
    }
  }, [login.isSuccess, router]);

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Text style={[styles.appName, { color: theme.text }]}>{env.appName}</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Enterprise procurement on the go
        </Text>
      </View>

      <Card>
        <Input
          label="Email"
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          placeholder="you@company.com"
          value={values.email}
          error={errors.email}
          onChangeText={(email) => setValues((current) => ({ ...current, email }))}
        />
        <Input
          label="Password"
          secureTextEntry
          autoComplete="password"
          placeholder="••••••••"
          value={values.password}
          error={errors.password}
          onChangeText={(password) =>
            setValues((current) => ({ ...current, password }))
          }
        />
        {login.isError ? (
          <Text style={[styles.error, { color: theme.danger }]}>
            {getLoginErrorMessage(login.error)}
          </Text>
        ) : null}
        <Button
          label={login.isPending ? "Signing in..." : "Sign in"}
          loading={login.isPending}
          fullWidth
          onPress={handleSubmit}
        />
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    gap: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  hero: {
    gap: spacing.xs,
  },
  appName: {
    ...typography.title,
  },
  subtitle: {
    ...typography.body,
  },
  error: {
    ...typography.caption,
  },
});
