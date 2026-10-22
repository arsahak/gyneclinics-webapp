import { useMemo } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { REGION_LIST, regionalFee, type Region, type RegionId } from "@/lib/locale/regions";

// The price in each region, as set by the team in Fees & Commission (GET
// /settings/pricing). Loaded when the app opens and kept for next time; until
// then the defaults in lib/locale/regions.ts are used.

interface PricingState {
  multipliers: Partial<Record<RegionId, number>>;
  setMultipliers: (multipliers: Partial<Record<RegionId, number>>) => void;
}

export const usePricingStore = create<PricingState>()(
  persist(
    (set) => ({
      multipliers: {},
      setMultipliers: (multipliers) => set({ multipliers }),
    }),
    { name: "gc-pricing", storage: createJSONStorage(() => localStorage), skipHydration: true, partialize: ({ multipliers }) => ({ multipliers }) },
  ),
);

/** Live regions and a fee function that uses them. */
export function usePricing() {
  const multipliers = usePricingStore((s) => s.multipliers);
  return useMemo(() => {
    const regions: Region[] = REGION_LIST.map((r) => ({ ...r, multiplier: multipliers[r.id] ?? r.multiplier }));
    return {
      regions,
      fee: (baseFeeGBP: number, regionId: RegionId) => regionalFee(baseFeeGBP, regionId, multipliers[regionId]),
    };
  }, [multipliers]);
}
