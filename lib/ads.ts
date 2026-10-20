import { adCreatives } from "@/lib/mock/engagement";

// Ad placement rules (BRD F1, F3). Admin will control these from the panel later.
export type AdSlot = "home" | "learn-feed" | "article-end" | "doctors-feed" | "doctor-dashboard";

export const AD_PLACEMENTS: Record<AdSlot, { enabled: boolean; creativeIndex: number }> = {
  home: { enabled: true, creativeIndex: 0 },
  "learn-feed": { enabled: true, creativeIndex: 1 },
  "article-end": { enabled: true, creativeIndex: 3 },
  "doctors-feed": { enabled: true, creativeIndex: 2 },
  "doctor-dashboard": { enabled: false, creativeIndex: 0 },
};

/** Show at most one ad per this many feed items so ads never crowd out content. */
export const FEED_AD_FREQUENCY = 6;

export function adFor(slot: AdSlot) {
  const placement = AD_PLACEMENTS[slot];
  return placement.enabled ? adCreatives[placement.creativeIndex % adCreatives.length] : null;
}
