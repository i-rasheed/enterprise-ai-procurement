import { Tabs } from "expo-router";

import { TabIcon } from "@/components/ui/tab-icon";
import { useUnreadNotificationCount } from "@/features/dashboard/hooks/use-dashboard";
import { useAppTheme } from "@/providers/theme-provider";

export default function TabsLayout() {
  const { theme } = useAppTheme();
  const unreadQuery = useUnreadNotificationCount();
  const unreadCount = unreadQuery.data ?? 0;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarStyle: {
          backgroundColor: theme.tabBar,
          borderTopColor: theme.tabBarBorder,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color }) => <TabIcon label="⌂" color={color} />,
        }}
      />
      <Tabs.Screen
        name="approvals"
        options={{
          title: "Approvals",
          tabBarIcon: ({ color }) => <TabIcon label="✓" color={color} />,
        }}
      />
      <Tabs.Screen
        name="work"
        options={{
          title: "Work",
          tabBarIcon: ({ color }) => <TabIcon label="📋" color={color} />,
        }}
      />
      <Tabs.Screen
        name="ai"
        options={{
          title: "AI",
          tabBarIcon: ({ color }) => <TabIcon label="✨" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
          tabBarIcon: ({ color }) => <TabIcon label="👤" color={color} />,
        }}
      />
    </Tabs>
  );
}
