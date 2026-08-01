import { useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useAssistantChat,
  useAssistantStore,
  useSuggestedPrompts,
} from "@/features/assistant/hooks/use-assistant";
import { useAppTheme } from "@/providers/theme-provider";
import { spacing, typography } from "@/theme";

export function AssistantChatPanel() {
  const { theme } = useAppTheme();
  const messages = useAssistantStore((state) => state.messages);
  const clearMessages = useAssistantStore((state) => state.clearMessages);
  const chat = useAssistantChat();
  const promptsQuery = useSuggestedPrompts();
  const [question, setQuestion] = useState("");

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messages}
        ListEmptyComponent={
          <View style={styles.prompts}>
            {(promptsQuery.data ?? []).map((prompt) => (
              <Pressable
                key={prompt}
                style={[
                  styles.prompt,
                  { borderColor: theme.border, backgroundColor: theme.surface },
                ]}
                onPress={() => chat.mutate(prompt)}>
                <Text style={[styles.promptText, { color: theme.textSecondary }]}>
                  {prompt}
                </Text>
              </Pressable>
            ))}
          </View>
        }
        renderItem={({ item }) => (
          <View
            style={[
              styles.bubble,
              item.role === "user"
                ? { alignSelf: "flex-end", backgroundColor: theme.primary }
                : { alignSelf: "flex-start", backgroundColor: theme.surfaceMuted },
            ]}>
            <Text
              style={{
                color: item.role === "user" ? theme.primaryForeground : theme.text,
                ...typography.body,
              }}>
              {item.content}
            </Text>
          </View>
        )}
      />

      <View style={styles.composer}>
        <Input
          placeholder="Ask about approvals, POs, invoices..."
          value={question}
          onChangeText={setQuestion}
          multiline
        />
        <View style={styles.actions}>
          <Button label="Clear" variant="ghost" onPress={clearMessages} />
          <Button
            label={chat.isPending ? "Thinking..." : "Send"}
            loading={chat.isPending}
            onPress={() => {
              if (!question.trim()) {
                return;
              }
              chat.mutate(question.trim());
              setQuestion("");
            }}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: spacing.md,
  },
  messages: {
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  bubble: {
    maxWidth: "85%",
    borderRadius: 16,
    padding: spacing.md,
  },
  prompts: {
    gap: spacing.sm,
  },
  prompt: {
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.md,
  },
  promptText: {
    ...typography.body,
  },
  composer: {
    gap: spacing.sm,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing.sm,
  },
});
