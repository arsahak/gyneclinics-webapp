"use client";

import { startOfDay } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { useAccount } from "@/component/shared/account-provider";
import { type ConsultationTimeline, timeline } from "@/lib/consultation";
import { useConsultations } from "@/lib/store/consultations";
import { cycleStats, predict } from "@/lib/cycle";
import { useTracker } from "@/lib/store/tracker";
import type { Consultation } from "@/lib/types";

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
  const { patient } = useAccount();
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

export type DoctorConsultation = ConsultationTimeline & { consultation: Consultation };

/**
 * The patient's most relevant consultation with each doctor: one that is still
 * open or upcoming, otherwise the latest.
 */
function currentByDoctor(consultations: Consultation[], now: Date) {
  const byDoctor = new Map<string, DoctorConsultation>();
  const latestFirst = [...consultations].sort((a, b) => b.startsAt.localeCompare(a.startsAt));
  for (const c of latestFirst) {
    const entry = { consultation: c, ...timeline(c, now) };
    const kept = byDoctor.get(c.doctorId);
    const open = (e: DoctorConsultation) => e.state !== "closed" && e.state !== "refunded";
    if (!kept || (!open(kept) && open(entry))) byDoctor.set(c.doctorId, entry);
  }
  return byDoctor;
}

/** The patient's most relevant consultation with a doctor and where it is in its lifecycle. */
export function useDoctorConsultation(doctorId: string) {
  const now = useNow();
  const consultations = useConsultations((s) => s.consultations);
  return useMemo(
    () => ({ now, current: currentByDoctor(consultations, now).get(doctorId) ?? null }),
    [consultations, doctorId, now],
  );
}

/** The patient's most relevant consultation with every doctor they've booked, by doctor id. */
export function useMyDoctorConsultations() {
  const now = useNow();
  const consultations = useConsultations((s) => s.consultations);
  return useMemo(() => currentByDoctor(consultations, now), [consultations, now]);
}
