import { useMemo } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { defaultScheduleFor, type DoctorSchedule } from "@/lib/availability";
import type { Availability } from "@/lib/types";

interface AvailabilityState {
  /** Schedules doctors have saved. Doctors without one use their default schedule. */
  schedules: Record<string, DoctorSchedule>;
  saveSchedule: (doctorId: string, schedule: DoctorSchedule) => void;
}

export const useAvailability = create<AvailabilityState>()(
  persist(
    (set) => ({
      schedules: {},
      saveSchedule: (doctorId, schedule) => set((s) => ({ schedules: { ...s.schedules, [doctorId]: schedule } })),
    }),
    {
      name: "gc-availability",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    },
  ),
);

/**
 * The doctor's schedule: from the backend when given, else one saved in this
 * browser, else a default. Stable between renders so it's safe in effect deps.
 */
export function useDoctorSchedule(doctorId: string, availability: Availability, serverSchedule?: DoctorSchedule) {
  const saved = useAvailability((s) => s.schedules[doctorId]);
  return useMemo(
    () => serverSchedule ?? saved ?? defaultScheduleFor(doctorId, availability),
    [serverSchedule, saved, doctorId, availability],
  );
}
