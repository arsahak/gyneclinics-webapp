"use client";

import { ArrowUpRight } from "lucide-react";
import { useEffect, useRef } from "react";
import { trackAdAction } from "@/app/actions/adAction";
import type { AdSlot } from "@/lib/ads";
import { cn } from "@/lib/utils";
import { useAd } from "./ads-provider";
import { ConsultationFee } from "./region";

const tones = {
  primary: "from-primary-soft to-surface border-primary/20",
  secondary: "from-secondary-soft to-surface border-secondary/20",
  accent: "from-accent-soft to-surface border-accent/20",
  gold: "from-gold-soft to-surface border-gold/25",
};

// Banner ad slot (BRD F1). Always labelled so it is never mistaken for medical
// content. Which ad shows is set in the admin dashboard.
export function AdBanner({ slot, className }: { slot: AdSlot; className?: string }) {
  const ad = useAd(slot);
  const counted = useRef<string | null>(null);

  // Count one view per banner shown.
  useEffect(() => {
    if (!ad || counted.current === ad._id) return;
    counted.current = ad._id;
    void trackAdAction(ad._id, "impression");
  }, [ad]);

  if (!ad) return null;
  return (
    <a
      href={ad.linkUrl}
      target="_blank"
      rel="sponsored noopener noreferrer"
      onClick={() => void trackAdAction(ad._id, "click")}
      aria-label={`Advertisement: ${ad.headline}, by ${ad.advertiser}`}
      className={cn(
        "group relative flex items-center gap-4 overflow-hidden rounded-3xl border bg-gradient-to-r p-4 transition-shadow hover:shadow-[var(--shadow-lift)] sm:p-5",
        tones[ad.tone] ?? tones.primary,
        className,
      )}
    >
      {ad.imageUrl && (
        // Any https image link can be used, so not next/image (which needs known hosts).
        // eslint-disable-next-line @next/next/no-img-element
        <img src={ad.imageUrl} alt="" className="size-14 shrink-0 rounded-2xl object-cover" loading="lazy" />
      )}
      <div className="min-w-0 flex-1">
        <p className="mb-1 flex items-center gap-2 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
          <span className="rounded border border-border px-1.5 py-px">Ad</span>
          {ad.advertiser}
        </p>
        <p className="font-semibold text-foreground">{ad.headline}</p>
        <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">{ad.body}</p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-2">
        {ad.priceGBP ? <ConsultationFee baseFeeGBP={ad.priceGBP} className="text-sm font-semibold" /> : null}
        <span className="inline-flex items-center gap-1 rounded-full bg-foreground px-3 py-1.5 text-xs font-medium text-background transition-transform group-hover:-translate-y-px">
          {ad.cta} <ArrowUpRight className="size-3.5" />
        </span>
      </div>
    </a>
  );
}
