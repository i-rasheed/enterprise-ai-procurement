import Link from "next/link";

import { cn } from "@/lib/utils";

type BrandLogoProps = {
  href?: string;
  showWordmark?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeMap = {
  sm: { icon: 28, text: "text-sm", gap: "gap-2" },
  md: { icon: 32, text: "text-base", gap: "gap-2.5" },
  lg: { icon: 40, text: "text-lg", gap: "gap-3" },
} as const;

export function BrandLogo({
  href = "/",
  showWordmark = true,
  size = "md",
  className,
}: BrandLogoProps) {
  const dimensions = sizeMap[size];

  const content = (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/icons/icon.svg"
        alt=""
        width={dimensions.icon}
        height={dimensions.icon}
        className="rounded-lg"
        aria-hidden
      />
      {showWordmark ? (
        <span className={cn("font-semibold tracking-tight", dimensions.text)}>
          SpendWise
        </span>
      ) : null}
    </>
  );

  const classes = cn("inline-flex items-center", dimensions.gap, className);

  if (href) {
    return (
      <Link href={href} className={classes} aria-label="SpendWise home">
        {content}
      </Link>
    );
  }

  return <div className={classes}>{content}</div>;
}
