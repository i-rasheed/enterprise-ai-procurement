import { Screen } from "@/components/ui/screen";
import { AssistantChatPanel } from "@/features/assistant/components/assistant-chat-panel";

export default function AiScreen() {
  return (
    <Screen
      title="AI Assistant"
      description="Ask questions about procurement data and workflows"
      scroll={false}>
      <AssistantChatPanel />
    </Screen>
  );
}
