import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { defaultLocation, type DetectedLocation } from "@/lib/locale/detect";
import { REGIONS, regionalFee } from "@/lib/locale/regions";
import { usePricingStore } from "@/lib/store/pricing";

interface LocaleState {
  /** Where the app was last detected as being opened. Drives regional pricing. */
  detected: DetectedLocation | null;
  /** Recent app-open locations (newest first). Sent to analytics once the backend exists. */
  openLog: DetectedLocation[];
  status: "idle" | "detecting" | "ready";
  recordOpen: (location: DetectedLocation) => void;
  setStatus: (status: LocaleState["status"]) => void;
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      detected: null,
      openLog: [],
      status: "idle",
      recordOpen: (location) =>
        set((state) => ({
          detected: location,
          status: "ready",
          openLog: [location, ...state.openLog].slice(0, 20),
        })),
      setStatus: (status) => set({ status }),
    }),
    {
      name: "gc-locale",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: ({ detected, openLog }) => ({ detected, openLog }),
    },
  ),
);

export function useRegion() {
  const location = useLocaleStore((state) => state.detected) ?? defaultLocation();
  const multiplier = usePricingStore((state) => state.multipliers[location.regionId]);
  const base = REGIONS[location.regionId];
  return { location, region: multiplier === undefined ? base : { ...base, multiplier } };
}

/** Consultation fee for the viewer's detected region, at the live price. */
export function useRegionalFee(baseFeeGBP: number) {
  const { region } = useRegion();
  return regionalFee(baseFeeGBP, region.id, region.multiplier);
}
