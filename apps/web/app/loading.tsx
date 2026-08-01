import { DashboardSkeleton } from "@/components/shared/page-header";

export default function RootLoading() {
  return (
    <div className="bg-muted/30 flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        <DashboardSkeleton />
      </div>
    </div>
  );
}
