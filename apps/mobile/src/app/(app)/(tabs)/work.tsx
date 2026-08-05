import { StyleSheet, View , Text, Pressable } from "react-native";
import { useRouter } from "expo-router";

import { Card } from "@/components/ui/card";
import { Screen } from "@/components/ui/screen";
import { useAppTheme } from "@/providers/theme-provider";
import { spacing, typography } from "@/theme";

const modules = [
  {
    title: "Purchase Orders",
    description: "Track issued and acknowledged orders",
    href: "/purchase-orders",
  },
  {
    title: "Invoices",
    description: "Review submitted and approved invoices",
    href: "/invoices",
  },
  {
    title: "Contracts",
    description: "Monitor active and expiring agreements",
    href: "/contracts",
  },
  {
    title: "Vendor Portal",
    description: "RFQs, bids, and vendor-side workflows",
    href: "/vendor",
  },
] as const;

export default function WorkScreen() {
  const { theme } = useAppTheme();
  const router = useRouter();

  return (
    <Screen title="Work" description="Procurement operations and vendor workflows">
      <View style={styles.list}>
        {modules.map((module) => (
          <Pressable
            key={module.href}
            onPress={() => router.push(module.href)}
            style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}>
            <Card>
              <Text style={[styles.title, { color: theme.text }]}>{module.title}</Text>
              <Text style={[styles.description, { color: theme.textSecondary }]}>
                {module.description}
              </Text>
            </Card>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.sm,
  },
  title: {
    ...typography.heading,
  },
  description: {
    ...typography.body,
  },
});
