"use client";

import { startOfDay } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { timeline } from "@/lib/consultation";
import { useConsultations } from "@/lib/store/consultations";
import { cycleStats, predict } from "@/lib/cycle";
import { useSession } from "@/lib/store/session";
import { useTracker } from "@/lib/store/tracker";

/**
 * Today's date, fixed for the lifetime of the component.
 * Only call from components rendered after hydration (see <Hydrated>), never during prerender.
 */
export function useToday() {
  const [today] = useState(() => startOfDay(new Date()));
  return today;
}

/** Cycle stats and predictions from the patient's own logged periods. */
export function useCycle() {
  const today = useToday();
  const periods = useTracker((s) => s.periods);
  const patient = useSession((s) => s.patient);
  return useMemo(() => {
    const stats = cycleStats(periods, patient?.typicalCycleLength, patient?.typicalPeriodLength);
    return { today, periods, stats, prediction: predict(periods, today, stats) };
  }, [today, periods, patient?.typicalCycleLength, patient?.typicalPeriodLength]);
}

/** Current time, refreshed every minute. Client-only, like useToday. */
export function useNow(intervalMs = 60_000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);
  return now;
}

/** The patient's most relevant consultation with a doctor and where it is in its lifecycle. */
export function useDoctorConsultation(doctorId: string) {
  const now = useNow();
  const consultations = useConsultations((s) => s.consultations);
  return useMemo(() => {
    const mine = consultations
      .filter((c) => c.doctorId === doctorId)
      .sort((a, b) => b.startsAt.localeCompare(a.startsAt));
    // Prefer one that is still open or upcoming over older closed ones.
    const withTimeline = mine.map((c) => ({ consultation: c, ...timeline(c, now) }));
    const current = withTimeline.find((c) => c.state !== "closed" && c.state !== "refunded") ?? withTimeline[0] ?? null;
    return { now, current };
  }, [consultations, doctorId, now]);
}
