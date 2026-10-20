import { addDays, format, subDays, subMonths } from "date-fns";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { BabyGrowthEntry, PeriodEntry, WeightEntry } from "@/lib/types";
import { uid } from "@/lib/utils";

export interface ReminderSettings {
  periodReminder: boolean;
  daysBefore: number;
  fertileReminder: boolean;
  dailyLogReminder: boolean;
}

interface TrackerState {
  periods: PeriodEntry[];
  weights: WeightEntry[];
  babyGrowth: BabyGrowthEntry[];
  reminders: ReminderSettings;
  seeded: boolean;
  addPeriod: (entry: Omit<PeriodEntry, "id">) => void;
  updatePeriod: (id: string, entry: Omit<PeriodEntry, "id">) => void;
  deletePeriod: (id: string) => void;
  addWeight: (entry: Omit<WeightEntry, "id">) => void;
  deleteWeight: (id: string) => void;
  addBabyGrowth: (entry: Omit<BabyGrowthEntry, "id">) => void;
  deleteBabyGrowth: (id: string) => void;
  setReminders: (reminders: Partial<ReminderSettings>) => void;
  seedDemo: () => void;
  reset: () => void;
}

const day = (date: Date) => format(date, "yyyy-MM-dd");

// Sample history relative to today so the demo always looks current.
function buildDemoData(today: Date) {
  const cycleLengths = [29, 27, 30, 28, 31, 28];
  const periodLengths = [5, 5, 6, 4, 5, 5];
  let start = subDays(today, 12);
  const periods: PeriodEntry[] = [];
  for (let i = 0; i < cycleLengths.length + 1; i++) {
    const length = periodLengths[i % periodLengths.length];
    periods.push({
      id: uid("p"),
      start: day(start),
      end: day(addDays(start, length - 1)),
      flow: i % 3 === 0 ? "heavy" : "medium",
      symptoms: i % 2 === 0 ? ["Cramps", "Fatigue"] : ["Bloating"],
    });
    if (i < cycleLengths.length) start = subDays(start, cycleLengths[i]);
  }

  const weights: WeightEntry[] = [63.4, 63.1, 62.8, 62.9, 62.3, 61.9, 61.5].map((kg, i, all) => ({
    id: uid("w"),
    date: day(subMonths(today, all.length - 1 - i)),
    kg,
  }));

  const scans: Array<[number, number, number]> = [
    [12, 58, 6.1],
    [16, 146, 11.6],
    [20, 331, 16.4],
    [24, 670, 30],
    [28, 1150, 37.6],
  ];
  const babyGrowth: BabyGrowthEntry[] = scans.map(([week, weightG, lengthCm], i) => ({
    id: uid("b"),
    date: day(subDays(today, (scans.length - 1 - i) * 28)),
    week,
    weightG,
    lengthCm,
  }));

  return { periods, weights, babyGrowth };
}

const initial = {
  periods: [] as PeriodEntry[],
  weights: [] as WeightEntry[],
  babyGrowth: [] as BabyGrowthEntry[],
  reminders: { periodReminder: true, daysBefore: 2, fertileReminder: false, dailyLogReminder: false },
  seeded: false,
};

export const useTracker = create<TrackerState>()(
  persist(
    (set) => ({
      ...initial,
      addPeriod: (entry) => set((s) => ({ periods: [...s.periods, { ...entry, id: uid("p") }] })),
      updatePeriod: (id, entry) =>
        set((s) => ({ periods: s.periods.map((p) => (p.id === id ? { ...entry, id } : p)) })),
      deletePeriod: (id) => set((s) => ({ periods: s.periods.filter((p) => p.id !== id) })),
      addWeight: (entry) => set((s) => ({ weights: [...s.weights, { ...entry, id: uid("w") }] })),
      deleteWeight: (id) => set((s) => ({ weights: s.weights.filter((w) => w.id !== id) })),
      addBabyGrowth: (entry) =>
        set((s) => ({ babyGrowth: [...s.babyGrowth, { ...entry, id: uid("b") }] })),
      deleteBabyGrowth: (id) => set((s) => ({ babyGrowth: s.babyGrowth.filter((b) => b.id !== id) })),
      setReminders: (reminders) => set((s) => ({ reminders: { ...s.reminders, ...reminders } })),
      seedDemo: () => set({ ...buildDemoData(new Date()), seeded: true }),
      reset: () => set({ ...initial, seeded: true }),
    }),
    {
      name: "gc-tracker",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    },
  ),
);
