import { create } from "zustand";
import {
  addBabyGrowthAction,
  addPeriodAction,
  addWeightAction,
  clearTrackerAction,
  deleteBabyGrowthAction,
  deletePeriodAction,
  deleteWeightAction,
  saveRemindersAction,
  updatePeriodAction,
} from "@/app/actions/trackerAction";
import { EMPTY_TRACKER, type ReminderSettings, type TrackerData } from "@/lib/tracker";
import type { BabyGrowthEntry, PeriodEntry, WeightEntry } from "@/lib/types";

export type { ReminderSettings } from "@/lib/tracker";

// The patient's periods, weights, scans and reminders. Loaded from the backend
// with the patient area (see PortalData) and saved there on every change.
// Changes show at once; if the backend refuses one, it's undone and the
// action resolves to the error message (null when saved).

type Saved = Promise<string | null>;

interface TrackerState extends TrackerData {
  load: (data: TrackerData) => void;
  addPeriod: (entry: Omit<PeriodEntry, "id">) => Saved;
  updatePeriod: (id: string, entry: Omit<PeriodEntry, "id">) => Saved;
  deletePeriod: (id: string) => Saved;
  addWeight: (entry: Omit<WeightEntry, "id">) => Saved;
  deleteWeight: (id: string) => Saved;
  addBabyGrowth: (entry: Omit<BabyGrowthEntry, "id">) => Saved;
  deleteBabyGrowth: (id: string) => Saved;
  setReminders: (reminders: Partial<ReminderSettings>) => Saved;
  /** Deletes every period, weight and scan entry. */
  clear: () => Saved;
}

const tempId = () => `new_${Math.random().toString(36).slice(2, 10)}`;

type ListKey = "periods" | "weights" | "babyGrowth";
type Entry<K extends ListKey> = TrackerData[K][number];

export const useTracker = create<TrackerState>()((set, get) => {
  /** Adds an entry now, then swaps in the saved one (or takes it out again). */
  async function add<K extends ListKey>(key: K, entry: Omit<Entry<K>, "id">, save: () => Promise<{ data?: Entry<K>; error?: string }>) {
    const id = tempId();
    set({ [key]: [...get()[key], { ...entry, id }] } as Partial<TrackerState>);
    const result = await save();
    const list = get()[key] as Entry<K>[];
    if (!result.data) {
      set({ [key]: list.filter((e) => e.id !== id) } as Partial<TrackerState>);
      return result.error ?? "Couldn't save. Please try again.";
    }
    set({ [key]: list.map((e) => (e.id === id ? result.data! : e)) } as Partial<TrackerState>);
    return null;
  }

  /** Removes an entry now; puts it back if the backend refuses. */
  async function remove<K extends ListKey>(key: K, id: string, save: () => Promise<{ error?: string }>) {
    const removed = (get()[key] as Entry<K>[]).find((e) => e.id === id);
    if (!removed) return null;
    set({ [key]: (get()[key] as Entry<K>[]).filter((e) => e.id !== id) } as Partial<TrackerState>);
    const result = await save();
    if (result.error) {
      set({ [key]: [...(get()[key] as Entry<K>[]), removed] } as Partial<TrackerState>);
      return result.error;
    }
    return null;
  }

  return {
    ...EMPTY_TRACKER,
    load: (data) => set(data),

    addPeriod: (entry) => add("periods", entry, () => addPeriodAction(entry)),
    updatePeriod: async (id, entry) => {
      const before = get().periods.find((p) => p.id === id);
      if (!before) return null;
      set({ periods: get().periods.map((p) => (p.id === id ? { ...entry, id } : p)) });
      const result = await updatePeriodAction(id, entry);
      set({ periods: get().periods.map((p) => (p.id === id ? (result.data ?? before) : p)) });
      return result.error ?? null;
    },
    deletePeriod: (id) => remove("periods", id, () => deletePeriodAction(id)),

    addWeight: (entry) => add("weights", entry, () => addWeightAction(entry)),
    deleteWeight: (id) => remove("weights", id, () => deleteWeightAction(id)),

    addBabyGrowth: (entry) => add("babyGrowth", entry, () => addBabyGrowthAction(entry)),
    deleteBabyGrowth: (id) => remove("babyGrowth", id, () => deleteBabyGrowthAction(id)),

    setReminders: async (changes) => {
      const before = get().reminders;
      set({ reminders: { ...before, ...changes } });
      const result = await saveRemindersAction(changes);
      set({ reminders: result.data ?? before });
      return result.error ?? null;
    },

    clear: async () => {
      const result = await clearTrackerAction();
      if (result.error) return result.error;
      set({ periods: [], weights: [], babyGrowth: [] });
      return null;
    },
  };
});
