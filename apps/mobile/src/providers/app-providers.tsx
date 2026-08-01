import { type ReactNode } from "react";

import { NotificationProvider } from "./notification-provider";
import { OfflineProvider } from "./offline-provider";
import { OfflineSyncProvider } from "./offline-sync-provider";
import { QueryProvider } from "./query-provider";
import { ThemeProvider } from "./theme-provider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <OfflineProvider>
          <OfflineSyncProvider>
            <NotificationProvider>{children}</NotificationProvider>
          </OfflineSyncProvider>
        </OfflineProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
