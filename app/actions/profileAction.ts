"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { API_URL, getAccessToken } from "@/auth";
import { type BackendSession, doctorProfileBody, pathForStep } from "@/lib/account";
import { api, errorText } from "@/lib/api";
import type { DoctorProfileDraft, PatientProfile } from "@/lib/types";
import type { ActionError } from "./authAction";

// Saving patient and doctor profiles. After onboarding the user moves to the
// next step; after an edit the page refreshes with the saved data.

async function ensureSignedIn() {
  if (!(await getAccessToken())) redirect("/login");
}

const patientBody = (profile: PatientProfile) => ({
  ...profile,
  lastPeriodStart: profile.lastPeriodStart || undefined,
  dueDate: profile.pregnancyStatus === "pregnant" ? profile.dueDate : undefined,
});

export async function completePatientOnboarding(profile: PatientProfile): Promise<ActionError> {
  await ensureSignedIn();
  const result = await api<BackendSession>("/patients/me", { method: "PUT", body: patientBody(profile) });
  if (!result.ok || !result.data) return { error: errorText(result) };
  redirect(pathForStep("patient", result.data.nextStep));
}

export async function updatePatientProfile(profile: PatientProfile): Promise<ActionError | undefined> {
  await ensureSignedIn();
  const result = await api<BackendSession>("/patients/me", { method: "PUT", body: patientBody(profile) });
  if (!result.ok) return { error: errorText(result) };
  refresh();
}

export async function completeDoctorOnboarding(draft: DoctorProfileDraft, timezone: string): Promise<ActionError> {
  await ensureSignedIn();
  const body = doctorProfileBody(draft, { includeSchedule: true, timezone });
  const result = await api<BackendSession>("/doctors/me", { method: "PUT", body });
  if (!result.ok || !result.data) return { error: errorText(result) };
  redirect(pathForStep("doctor", result.data.nextStep));
}

// ── Profile photo ───────────────────────────────────────────────────────────

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

/** Uploads a new profile photo (form field "avatar"), replacing the old one. */
/** `inReview`: an approved doctor's photo waits for an admin before patients see it. */
export async function uploadAvatarAction(formData: FormData): Promise<ActionError | { avatar: string; inReview: boolean }> {
  const token = await getAccessToken();
  if (!token) redirect("/login");

  // Server Action uploads can arrive as a Blob rather than a File, so accept both.
  const file = formData.get("avatar");
  if (!(file instanceof Blob) || file.size === 0) return { error: "Choose a photo to upload." };
  if (!PHOTO_TYPES.includes(file.type)) return { error: "Use a JPG, PNG or WEBP image." };
  if (file.size > MAX_PHOTO_BYTES) return { error: "The photo must be 5 MB or smaller." };

  const body = new FormData();
  const name = file instanceof File && file.name ? file.name : "avatar";
  body.append("avatar", file, name);
  try {
    const response = await fetch(`${API_URL}/api/v1/users/me/avatar`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
      body,
      cache: "no-store",
    });
    const json = await response.json().catch(() => null);
    if (!response.ok) return { error: json?.message ?? "Could not upload the photo. Please try again." };
    refresh();
    return { avatar: json?.data?.avatar ?? "", inReview: Boolean(json?.data?.inReview) };
  } catch {
    return { error: "Can't reach the server. Please check your connection and try again." };
  }
}

export async function removeAvatarAction(): Promise<ActionError | undefined> {
  await ensureSignedIn();
  const result = await api("/users/me/avatar", { method: "DELETE" });
  if (!result.ok) return { error: errorText(result) };
  refresh();
}
