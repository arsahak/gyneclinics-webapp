import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

/**
 * Loading placeholder with a soft light sweep. `round` makes it a pill or circle;
 * `inverse` is for dark surfaces such as the sidebar. A `rounded-*` class in
 * `className` replaces the default corners.
 */
export function Skeleton({
  className,
  style,
  round = false,
  inverse = false,
}: {
  className?: string;
  style?: CSSProperties;
  round?: boolean;
  inverse?: boolean;
}) {
  const ownRadius = /(^|\s)rounded/.test(className ?? "");
  return (
    <div
      aria-hidden
      style={style}
      className={cn(
        "relative isolate overflow-hidden",
        !ownRadius && (round ? "rounded-full" : "rounded-2xl"),
        inverse ? "bg-white/10" : "bg-surface-2",
        "after:absolute after:inset-0 after:-translate-x-full after:animate-[shimmer_1.8s_ease-in-out_infinite] after:bg-gradient-to-r after:from-transparent after:to-transparent",
        inverse ? "after:via-white/10" : "after:via-white/70 dark:after:via-white/[0.06]",
        className,
      )}
    />
  );
}
