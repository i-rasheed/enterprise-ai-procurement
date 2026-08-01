import { cn } from "@/lib/utils";

type ProgressProps = {
  value?: number;
  className?: string;
};

export function Progress({ value = 0, className }: ProgressProps) {
  const clamped = Math.min(Math.max(value, 0), 100);

  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn(
        "bg-primary/20 relative h-2 w-full overflow-hidden rounded-full",
        className,
      )}
    >
      <div
        className="bg-primary h-full rounded-full transition-all"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
