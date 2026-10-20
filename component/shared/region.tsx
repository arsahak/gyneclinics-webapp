"use client";

import { Globe2, MapPin } from "lucide-react";
import { flagEmoji } from "@/lib/locale/regions";
import { useHydrated } from "@/lib/store/app-status";
import { useRegion, useRegionalFee } from "@/lib/store/locale";
import { cn } from "@/lib/utils";

/** Small header chip showing the region the app detected on open. */
export function RegionChip({ className, tone = "default" }: { className?: string; tone?: "default" | "inverse" }) {
  const hydrated = useHydrated();
  const { location, region } = useRegion();
  if (!hydrated) return <span className={cn("h-8 w-28 animate-pulse rounded-full bg-surface-2", className)} />;
  return (
    <span
      title={`Pricing region: ${region.name}`}
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-medium",
        tone === "inverse" ? "border-white/15 bg-white/10 text-white/80" : "border-border bg-surface text-muted-foreground",
        className,
      )}
    >
      {location.countryCode ? (
        <span aria-hidden>{flagEmoji(location.countryCode)}</span>
      ) : (
        <Globe2 className="size-3.5" />
      )}
      {region.name}
    </span>
  );
}

/** Compact regional-pricing label for pages that show consultation fees. */
export function FeeRegionChip({ className }: { className?: string }) {
  const hydrated = useHydrated();
  const { region } = useRegion();
  if (!hydrated) return <span className={cn("h-8 w-28 animate-pulse rounded-full bg-surface-2", className)} />;
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-muted-foreground shadow-[var(--shadow-soft)]", className)}>
      <MapPin className="size-3.5 shrink-0 text-primary" />
      Fees for <span className="font-semibold text-foreground">{region.name}</span>
    </span>
  );
}

/** A doctor's consultation fee in the viewer's regional price. */
export function ConsultationFee({
  baseFeeGBP,
  className,
  showRegion = false,
}: {
  baseFeeGBP: number;
  className?: string;
  showRegion?: boolean;
}) {
  const hydrated = useHydrated();
  const fee = useRegionalFee(baseFeeGBP);
  const { region } = useRegion();
  if (!hydrated) return <span className={cn("inline-block h-5 w-14 animate-pulse rounded-md bg-surface-2", className)} />;
  return (
    <span className={className}>
      {fee.label}
      {showRegion && (
        <span className="ml-1.5 inline-flex items-center gap-1 text-xs font-normal text-muted-foreground">
          <MapPin className="size-3" />
          {region.name} pricing
        </span>
      )}
    </span>
  );
}

/** "Europe & UK pricing" note shown under a fee. */
export function RegionPricingNote({ className }: { className?: string }) {
  const hydrated = useHydrated();
  const { region } = useRegion();
  if (!hydrated) return null;
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs text-muted-foreground", className)}>
      <MapPin className="size-3" />
      {region.name} pricing
    </span>
  );
}
