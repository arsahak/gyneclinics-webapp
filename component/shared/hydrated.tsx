"use client";

import type { ReactNode } from "react";
import { useHydrated } from "@/lib/store/app-status";

/** Renders children only after client state (localStorage, today's date) is available. */
export function Hydrated({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  return useHydrated() ? children : fallback;
}
