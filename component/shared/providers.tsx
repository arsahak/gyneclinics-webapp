"use client";

import { useEffect } from "react";
import { detectLocation } from "@/lib/locale/detect";
import { trackAppOpen } from "@/lib/services/analytics";
import { useAppStatus } from "@/lib/store/app-status";
import { useAvailability } from "@/lib/store/availability";
import { useChat } from "@/lib/store/chat";
import { useConsultations } from "@/lib/store/consultations";
import { useLibrary } from "@/lib/store/library";
import { useLocaleStore } from "@/lib/store/locale";
import { useTracker } from "@/lib/store/tracker";

const SESSION_FLAG = "gc-open-tracked";

/** Loads persisted state and records where the app was opened from (once per browser session). */
export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    let cancelled = false;

    Promise.all([
      useTracker.persist.rehydrate(),
      useLibrary.persist.rehydrate(),
      useChat.persist.rehydrate(),
      useConsultations.persist.rehydrate(),
      useAvailability.persist.rehydrate(),
      useLocaleStore.persist.rehydrate(),
    ]).then(() => {
      if (cancelled) return;
      if (!useTracker.getState().seeded) useTracker.getState().seedDemo();
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
