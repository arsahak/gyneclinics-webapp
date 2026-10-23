"use client";

import { useEffect } from "react";
import { getPricingAction } from "@/app/actions/pricingAction";
import { detectLocation } from "@/lib/locale/detect";
import { trackAppOpen } from "@/lib/services/analytics";
import { useAppStatus } from "@/lib/store/app-status";
import { useLocaleStore } from "@/lib/store/locale";
import { usePricingStore } from "@/lib/store/pricing";

const SESSION_FLAG = "gc-open-tracked";
// Older versions kept the tracker, bookings, saved articles and schedules in
// this browser (with sample data). They live on the backend now.
const OLD_KEYS = ["gc-tracker", "gc-consultations", "gc-library", "gc-availability"];

/** Loads saved settings (region, prices) and records where the app was opened from (once per browser session). */
export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    let cancelled = false;
    try {
      for (const key of OLD_KEYS) localStorage.removeItem(key);
    } catch {
      // storage unavailable — nothing to clean up
    }

    Promise.all([
      useLocaleStore.persist.rehydrate(),
      usePricingStore.persist.rehydrate(),
    ]).then(() => {
      if (cancelled) return;
      // Live prices per region (Fees & Commission); the saved ones are used meanwhile.
      getPricingAction()
        .then((multipliers) => {
          if (multipliers && !cancelled) usePricingStore.getState().setMultipliers(multipliers);
        })
        .catch(() => undefined);
      useAppStatus.setState({ hydrated: true });

      let alreadyTracked = false;
      try {
        alreadyTracked = sessionStorage.getItem(SESSION_FLAG) === "1";
      } catch {
        // sessionStorage unavailable — detect anyway
      }
      if (alreadyTracked && useLocaleStore.getState().detected) {
        useLocaleStore.getState().setStatus("ready");
        return;
      }

      useLocaleStore.getState().setStatus("detecting");
      detectLocation().then((location) => {
        if (cancelled) return;
        useLocaleStore.getState().recordOpen(location);
        trackAppOpen(location);
        try {
          sessionStorage.setItem(SESSION_FLAG, "1");
        } catch {
          // ignore
        }
      });
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return children;
}
