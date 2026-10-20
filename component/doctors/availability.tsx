import type { Availability } from "@/lib/types";
import { cn } from "@/lib/utils";

export const AVAILABILITY: Record<Availability, { label: string; dot: string; text: string }> = {
  online: { label: "Online now", dot: "bg-success", text: "text-success" },
  today: { label: "Available today", dot: "bg-primary", text: "text-primary" },
  this_week: { label: "This week", dot: "bg-gold", text: "text-gold" },
  away: { label: "Away", dot: "bg-muted-foreground", text: "text-muted-foreground" },
};

export function AvailabilityLabel({ value, className }: { value: Availability; className?: string }) {
  const a = AVAILABILITY[value];
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium", a.text, className)}>
      <span className={cn("size-2 rounded-full", a.dot)} />
      {a.label}
    </span>
  );
}
