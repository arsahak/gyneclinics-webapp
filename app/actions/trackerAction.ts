"use server";

import { getAccessToken } from "@/auth";
import { api, errorText } from "@/lib/api";
import {
  type BackendBabyGrowth,
  type BackendPeriod,
  type BackendWeight,
  type ReminderSettings,
  toBabyGrowth,
  toPeriod,
  toWeight,
} from "@/lib/tracker";
import type { BabyGrowthEntry, PeriodEntry, WeightEntry } from "@/lib/types";

// Saving the patient's health logs and reminders on the backend (/tracker,
// /patients/me/reminders). Each returns the saved entry, or an error to show.

type Result<T> = { data: T; error?: undefined } | { data?: undefined; error: string };

const SIGNED_OUT = "Your session has ended. Please sign in again.";

async function call<T>(path: string, method: "POST" | "PUT" | "PATCH" | "DELETE", body?: unknown): Promise<Result<T | null>> {
  if (!(await getAccessToken())) return { error: SIGNED_OUT };
  const result = await api<T>(path, { method, body });
  return result.ok ? { data: result.data } : { error: errorText(result) };
}

export async function addPeriodAction(entry: Omit<PeriodEntry, "id">): Promise<Result<PeriodEntry>> {
  const r = await call<BackendPeriod>("/tracker/periods", "POST", entry);
  return r.data ? { data: toPeriod(r.data) } : { error: r.error ?? "Couldn't save the period." };
}

export async function updatePeriodAction(id: string, entry: Omit<PeriodEntry, "id">): Promise<Result<PeriodEntry>> {
  const r = await call<BackendPeriod>(`/tracker/periods/${encodeURIComponent(id)}`, "PATCH", entry);
  return r.data ? { data: toPeriod(r.data) } : { error: r.error ?? "Couldn't update the period." };
}

export async function deletePeriodAction(id: string): Promise<{ error?: string }> {
  return { error: (await call(`/tracker/periods/${encodeURIComponent(id)}`, "DELETE")).error };
}

export async function addWeightAction(entry: Omit<WeightEntry, "id">): Promise<Result<WeightEntry>> {
  const r = await call<BackendWeight>("/tracker/weights", "POST", entry);
  return r.data ? { data: toWeight(r.data) } : { error: r.error ?? "Couldn't save the weight." };
}

export async function deleteWeightAction(id: string): Promise<{ error?: string }> {
  return { error: (await call(`/tracker/weights/${encodeURIComponent(id)}`, "DELETE")).error };
}

export async function addBabyGrowthAction(entry: Omit<BabyGrowthEntry, "id">): Promise<Result<BabyGrowthEntry>> {
  const r = await call<BackendBabyGrowth>("/tracker/baby", "POST", entry);
  return r.data ? { data: toBabyGrowth(r.data) } : { error: r.error ?? "Couldn't save the scan." };
}

export async function deleteBabyGrowthAction(id: string): Promise<{ error?: string }> {
  return { error: (await call(`/tracker/baby/${encodeURIComponent(id)}`, "DELETE")).error };
}

/** Deletes every period, weight and scan entry. */
export async function clearTrackerAction(): Promise<{ error?: string }> {
  return { error: (await call("/tracker", "DELETE")).error };
}

export async function saveRemindersAction(changes: Partial<ReminderSettings>): Promise<Result<ReminderSettings>> {
  const r = await call<ReminderSettings>("/patients/me/reminders", "PATCH", changes);
  return r.data ? { data: r.data } : { error: r.error ?? "Couldn't save your reminders." };
}

/** Saves or un-saves a Learn article. Returns the saved slugs. */
export async function setBookmarkAction(slug: string, saved: boolean): Promise<Result<string[]>> {
  const r = await call<string[]>(`/patients/me/bookmarks/${encodeURIComponent(slug)}`, saved ? "PUT" : "DELETE");
  return r.data ? { data: r.data } : { error: r.error ?? "Couldn't update your saved articles." };
}
