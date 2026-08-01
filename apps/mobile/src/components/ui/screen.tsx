import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAppTheme } from "@/providers/theme-provider";
import { spacing, typography } from "@/theme";

type ScreenProps = {
  title?: string;
  description?: string;
  children: React.ReactNode;
  scroll?: boolean;
  loading?: boolean;
  action?: React.ReactNode;
};

export function Screen({
  title,
  description,
  children,
  scroll = true,
  loading = false,
  action,
}: ScreenProps) {
  const { theme } = useAppTheme();
  const content = (
    <View style={styles.content}>
      {(title || description || action) && (
        <View style={styles.header}>
          <View style={styles.headerText}>
            {title ? (
              <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
            ) : null}
            {description ? (
              <Text style={[styles.description, { color: theme.textSecondary }]}>
                {description}
              </Text>
            ) : null}
          </View>
          {action}
        </View>
      )}
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={theme.primary} size="large" />
        </View>
      ) : (
        children
      )}
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.background }]}
      edges={["top", "left", "right"]}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.xl,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  headerText: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    ...typography.title,
  },
  description: {
    ...typography.body,
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xxl,
  },
});
