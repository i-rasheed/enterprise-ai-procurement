import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  className?: string;
  children?: ReactNode;
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  children,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[280px] flex-col items-center justify-center rounded-xl border border-dashed bg-muted/20 px-6 py-12 text-center",
        className,
      )}
    >
      {Icon ? (
        <div className="bg-muted mb-4 flex size-12 items-center justify-center rounded-full">
          <Icon className="text-muted-foreground size-6" aria-hidden="true" />
        </div>
      ) : null}
      <h3 className="text-lg font-semibold">{title}</h3>
      {description ? (
        <p className="text-muted-foreground mt-2 max-w-md text-sm">
          {description}
        </p>
      ) : null}
      {children}
      {action ? (
        <div className="mt-6">
          {action.href ? (
            <Button asChild>
              <a href={action.href}>{action.label}</a>
            </Button>
          ) : (
            <Button onClick={action.onClick}>{action.label}</Button>
          )}
        </div>
      ) : null}
    </div>
  );
}
