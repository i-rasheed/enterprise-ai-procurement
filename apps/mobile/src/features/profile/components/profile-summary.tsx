import { StyleSheet, Text, View } from "react-native";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useAppTheme } from "@/providers/theme-provider";
import { spacing, typography } from "@/theme";

type ProfileSummaryProps = {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  organisationName?: string | null;
};

export function ProfileSummary({
  firstName,
  lastName,
  email,
  role,
  organisationName,
}: ProfileSummaryProps) {
  const { theme } = useAppTheme();

  return (
    <Card>
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: theme.primaryMuted }]}>
          <Text style={[styles.initials, { color: theme.primary }]}>
            {firstName.charAt(0)}
            {lastName.charAt(0)}
          </Text>
        </View>
        <View style={styles.meta}>
          <Text style={[styles.name, { color: theme.text }]}>
            {firstName} {lastName}
          </Text>
          <Text style={[styles.email, { color: theme.textSecondary }]}>{email}</Text>
        </View>
      </View>
      <View style={styles.badges}>
        <Badge label={role.replaceAll("_", " ")} tone="primary" />
        {organisationName ? <Badge label={organisationName} /> : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  initials: {
    fontSize: 20,
    fontWeight: "700",
  },
  meta: {
    flex: 1,
    gap: spacing.xs,
  },
  name: {
    ...typography.heading,
  },
  email: {
    ...typography.body,
  },
  badges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
});
