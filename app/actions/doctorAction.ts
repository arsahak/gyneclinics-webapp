"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { getAccessToken } from "@/auth";
import { api, errorText } from "@/lib/api";
import type { DoctorSchedule } from "@/lib/availability";
import type { DoctorMessaging, DoctorVerificationStatus } from "@/lib/types";

// The signed-in doctor's own profile: GET and PATCH /doctors/me.

export interface MyDoctorProfile {
  id: string;
  fullName: string;
  /** Sign-in number; can't be changed from the profile. */
  phone: string;
  /** Profile photo URL, or "". Changed with uploadAvatarAction. */
  avatar: string;
  email: string;
  title: string;
  specialization: string;
  qualifications: string[];
  experienceYears: number;
  focusAreas: string[];
  registrationNumber: string;
  registrationBody: string;
  clinic: string;
  city: string;
  country: string;
  languages: string[];
  about: string;
  feeGBP: number;
  /** Free messages and/or paid consultations. Saved straight away, not reviewed. */
  messaging: DoctorMessaging;
  verificationStatus: DoctorVerificationStatus;
  rating: number;
  reviewCount: number;
  /** Edits go live without review (registration details are always reviewed). Set by an admin. */
  autoApproveUpdates: boolean;
  /** Changes waiting for an admin. Patients see the profile above until then. */
  pendingUpdate: PendingUpdate | null;
  /** Why the last update was turned down. */
  updateRejection: { reason?: string; at: string } | null;
}

export interface PendingUpdate {
  fields: MyDoctorChanges;
  /** New photo URL, or "" to remove the photo. Absent = photo unchanged. */
  avatar?: string;
  submittedAt: string;
}

type ReadOnlyField =
  | "id"
  | "phone"
  | "avatar"
  | "verificationStatus"
  | "rating"
  | "reviewCount"
  | "autoApproveUpdates"
  | "pendingUpdate"
  | "updateRejection";

/** Fields the doctor can edit. Send only the ones that change. */
export type MyDoctorChanges = Partial<Omit<MyDoctorProfile, ReadOnlyField>>;

interface BackendMyDoctor {
  _id: string;
  user?: { fullName?: string; phone?: string; email?: string; avatar?: string };
  title?: string;
  specialization?: string;
  qualifications?: string[];
  experienceYears?: number;
  focusAreas?: string[];
  registrationNumber?: string;
  registrationBody?: string;
  clinic?: string;
  city?: string;
  country?: string;
  languages?: string[];
  about?: string;
  feeGBP?: number;
  messaging?: Partial<DoctorMessaging>;
  verificationStatus: DoctorVerificationStatus;
  rating?: number;
  reviewCount?: number;
  autoApproveUpdates?: boolean;
  pendingUpdate?: PendingUpdate | null;
  updateRejection?: { reason?: string; at: string } | null;
  inReview?: boolean;
  reverification?: boolean;
}

function toProfile(d: BackendMyDoctor): MyDoctorProfile {
  return {
    id: d._id,
    fullName: d.user?.fullName ?? "",
    phone: d.user?.phone ?? "",
    avatar: d.user?.avatar ?? "",
    email: d.user?.email ?? "",
    title: d.title ?? "",
    specialization: d.specialization ?? "",
    qualifications: d.qualifications ?? [],
    experienceYears: d.experienceYears ?? 0,
    focusAreas: d.focusAreas ?? [],
    registrationNumber: d.registrationNumber ?? "",
    registrationBody: d.registrationBody ?? "",
    clinic: d.clinic ?? "",
    city: d.city ?? "",
    country: d.country ?? "",
    languages: d.languages ?? [],
    about: d.about ?? "",
    feeGBP: d.feeGBP ?? 0,
    messaging: { free: Boolean(d.messaging?.free), consultation: d.messaging?.consultation ?? true },
    verificationStatus: d.verificationStatus,
    rating: d.rating ?? 0,
    reviewCount: d.reviewCount ?? 0,
    autoApproveUpdates: Boolean(d.autoApproveUpdates),
    pendingUpdate: d.pendingUpdate ?? null,
    updateRejection: d.updateRejection ?? null,
  };
}

async function ensureSignedIn() {
  if (!(await getAccessToken())) redirect("/login");
}

/** The signed-in doctor's full profile. */
export async function getMyDoctorProfile(): Promise<{ profile?: MyDoctorProfile; error?: string }> {
  await ensureSignedIn();
  const result = await api<BackendMyDoctor>("/doctors/me");
  if (!result.ok || !result.data) return { error: errorText(result) };
  return { profile: toProfile(result.data) };
}

/**
 * Saves the changed fields. For an approved doctor, changes patients see wait
 * for an admin (`inReview`). A rejected doctor who changes their registration
 * details is sent back to review (`reverification`).
 */
export async function updateMyDoctorProfile(
  changes: MyDoctorChanges,
): Promise<{ error?: string; message?: string; profile?: MyDoctorProfile; inReview?: boolean; reverification?: boolean }> {
  await ensureSignedIn();
  const body = {
    ...changes,
    ...(changes.country !== undefined && { country: changes.country.trim().toUpperCase() || undefined }),
  };
  const result = await api<BackendMyDoctor>("/doctors/me", { method: "PATCH", body });
  if (!result.ok || !result.data) return { error: errorText(result) };
  // Reload the signed-in layout so the name and verification status update everywhere.
  refresh();
  return {
    message: result.message,
    profile: toProfile(result.data),
    inReview: Boolean(result.data.inReview),
    reverification: Boolean(result.data.reverification),
  };
}

/** Whether the doctor is taking new chats now (shown to patients as "Online"). */
export async function setOnlineAction(isOnline: boolean): Promise<{ error?: string }> {
  await ensureSignedIn();
  const result = await api("/doctors/me", { method: "PATCH", body: { isOnline } });
  return result.ok ? {} : { error: errorText(result) };
}

/** Saves the weekly hours, slot length, booking window, notice and days off. Live straight away. */
export async function saveScheduleAction(schedule: DoctorSchedule): Promise<{ error?: string }> {
  await ensureSignedIn();
  const result = await api("/doctors/me", { method: "PATCH", body: { schedule } });
  if (!result.ok) return { error: errorText(result) };
  refresh();
  return {};
}
