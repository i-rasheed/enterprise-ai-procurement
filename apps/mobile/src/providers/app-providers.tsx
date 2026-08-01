import { type ReactNode } from "react";

import { NotificationProvider } from "./notification-provider";
import { OfflineProvider } from "./offline-provider";
import { QueryProvider } from "./query-provider";
import { ThemeProvider } from "./theme-provider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <OfflineProvider>
          <NotificationProvider>{children}</NotificationProvider>
        </OfflineProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
