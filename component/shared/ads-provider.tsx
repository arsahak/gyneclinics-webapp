"use client";

import { createContext, useContext } from "react";
import type { AdSlot, ServedAds } from "@/lib/ads";

// The ads for this signed-in area, loaded once by the layout on the server.

const AdsContext = createContext<ServedAds>({});

export function AdsProvider({ ads, children }: { ads: ServedAds; children: React.ReactNode }) {
  return <AdsContext.Provider value={ads}>{children}</AdsContext.Provider>;
}

/** The live ad for a slot, or null. */
export const useAd = (slot: AdSlot) => useContext(AdsContext)[slot] ?? null;
