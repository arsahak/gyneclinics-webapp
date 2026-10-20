import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

type Tone = "neutral" | "primary" | "secondary" | "accent" | "gold" | "success" | "warning" | "danger";

const tones: Record<Tone, string> = {
  neutral: "bg-surface-2 text-muted-foreground",
  primary: "bg-primary-soft text-primary",
  secondary: "bg-secondary-soft text-secondary",
  accent: "bg-accent-soft text-accent",
  gold: "bg-gold-soft text-gold",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
};

export function Badge({ tone = "neutral", className, ...props }: ComponentProps<"span"> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap [&_svg]:size-3",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
