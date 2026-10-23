"use client";

import { type ReactNode, useEffect, useState } from "react";
import { useConsultations } from "@/lib/store/consultations";
import { useLibrary } from "@/lib/store/library";
import { useTracker } from "@/lib/store/tracker";
import type { TrackerData } from "@/lib/tracker";
import type { Consultation } from "@/lib/types";

interface PortalDataProps {
  consultations: Consultation[];
  tracker?: TrackerData;
  bookmarks?: string[];
}

function fill({ consultations, tracker, bookmarks }: PortalDataProps) {
  useConsultations.getState().load(consultations);
  if (tracker) useTracker.getState().load(tracker);
  if (bookmarks) useLibrary.getState().load(bookmarks);
}

/**
 * Puts the data the layout loaded from the backend into the client stores.
 * The first time it happens before the pages render, so they never show an
 * empty state first; after a refresh, the new data replaces the old.
 */
export function PortalData({ consultations, tracker, bookmarks, children }: PortalDataProps & { children: ReactNode }) {
  // Runs once, during the first render. The stores are shared on the server,
  // so they're only filled in the browser.
  useState(() => {
    if (typeof window !== "undefined") fill({ consultations, tracker, bookmarks });
  });
  useEffect(() => fill({ consultations, tracker, bookmarks }), [consultations, tracker, bookmarks]);
  return children;
}
