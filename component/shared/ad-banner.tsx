"use client";

import { ArrowUpRight } from "lucide-react";
import { adFor, type AdSlot } from "@/lib/ads";
import { cn } from "@/lib/utils";
import { ConsultationFee } from "./region";

const tones = {
  primary: "from-primary-soft to-surface border-primary/20",
  secondary: "from-secondary-soft to-surface border-secondary/20",
  accent: "from-accent-soft to-surface border-accent/20",
  gold: "from-gold-soft to-surface border-gold/25",
};

// Banner ad slot (BRD F1). Always labelled so it is never mistaken for medical content.
export function AdBanner({ slot, className }: { slot: AdSlot; className?: string }) {
  const ad = adFor(slot);
  if (!ad) return null;
  return (
    <aside
      aria-label="Advertisement"
      className={cn(
        "relative flex items-center gap-4 overflow-hidden rounded-3xl border bg-gradient-to-r p-4 sm:p-5",
        tones[ad.tone],
        className,
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="mb-1 flex items-center gap-2 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
          <span className="rounded border border-border px-1.5 py-px">Ad</span>
          {ad.advertiser}
        </p>
        <p className="font-semibold text-foreground">{ad.headline}</p>
        <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">{ad.body}</p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-2">
        {ad.priceGBP && <ConsultationFee baseFeeGBP={ad.priceGBP} className="text-sm font-semibold" />}
        <span className="inline-flex items-center gap-1 rounded-full bg-foreground px-3 py-1.5 text-xs font-medium text-background">
          {ad.cta} <ArrowUpRight className="size-3.5" />
        </span>
      </div>
    </aside>
  );
}
