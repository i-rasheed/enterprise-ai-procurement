import type { LucideIcon } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type KpiStatCardProps = {
  title: string;
  value: string;
  description?: string;
  icon: LucideIcon;
  trend?: string;
  className?: string;
};

export function KpiStatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
}: KpiStatCardProps) {
  return (
    <Card className={cn("h-full", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="text-muted-foreground size-4 shrink-0" aria-hidden />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tight">{value}</div>
        {description ? (
          <CardDescription className="mt-1">{description}</CardDescription>
        ) : null}
        {trend ? (
          <p className="text-muted-foreground mt-2 text-xs">{trend}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function KpiStatCardSkeleton() {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <Skeleton className="h-4 w-24" />
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-3 w-32" />
      </CardContent>
    </Card>
  );
}
