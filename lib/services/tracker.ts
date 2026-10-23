import "server-only";
import { api } from "@/lib/api";
import {
  type BackendBabyGrowth,
  type BackendPeriod,
  type BackendWeight,
  DEFAULT_REMINDERS,
  type ReminderSettings,
  toBabyGrowth,
  toPeriod,
  type TrackerData,
  toWeight,
} from "@/lib/tracker";

/** The signed-in patient's periods, weights, scans and reminders, or null if they couldn't be loaded. */
export async function getMyTracker(): Promise<TrackerData | null> {
  const result = await api<{ periods: BackendPeriod[]; weights: BackendWeight[]; babyGrowth: BackendBabyGrowth[]; reminders?: ReminderSettings }>("/tracker");
  if (!result.ok || !result.data) {
    console.error("Could not load the tracker:", result.message);
    return null;
  }
  const d = result.data;
  return {
    periods: d.periods.map(toPeriod),
    weights: d.weights.map(toWeight),
    babyGrowth: d.babyGrowth.map(toBabyGrowth),
    reminders: { ...DEFAULT_REMINDERS, ...d.reminders },
  };
}
