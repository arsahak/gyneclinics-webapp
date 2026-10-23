import "server-only";
import { cache } from "react";
import { api } from "@/lib/api";
import { hueFor } from "@/lib/chat";
import type { DoctorSchedule } from "@/lib/availability";
import type { Availability, Doctor, DoctorMessaging, Review } from "@/lib/types";

// Doctors patients can browse and book: approved, active doctors from the
// backend (GET /doctors/directory). Server only — runs with the signed-in
// user's token.

interface BackendDoctor {
  _id: string;
  user?: { fullName?: string; avatar?: string };
  title?: string;
  specialization?: string;
  focusAreas?: string[];
  qualifications?: string[];
  experienceYears?: number;
  registrationNumber?: string;
  clinic?: string;
  city?: string;
  country?: string;
  languages?: string[];
  about?: string;
  feeGBP?: number;
  schedule?: DoctorSchedule;
  messaging?: DoctorMessaging;
  isOnline?: boolean;
  rating?: number;
  reviewCount?: number;
  consultationCount?: number;
  recommended?: boolean;
}


/** Online now, working today, working later this week, or away. */
function availabilityFor(doctor: BackendDoctor): Availability {
  if (doctor.isOnline) return "online";
  const weekly = doctor.schedule?.weekly ?? [];
  const today = (new Date().getDay() + 6) % 7; // Monday = 0
  if (weekly[today]?.length) return "today";
  if (weekly.some((day, index) => index > today && day.length)) return "this_week";
  return "away";
}

function toDoctor(d: BackendDoctor): Doctor {
  return {
    id: d._id,
    name: d.user?.fullName || "Doctor",
    title: d.title ?? "",
    specialization: d.specialization ?? "",
    focusAreas: d.focusAreas ?? [],
    qualifications: d.qualifications ?? [],
    experienceYears: d.experienceYears ?? 0,
    rating: d.rating ?? 0,
    reviewCount: d.reviewCount ?? 0,
    consultations: d.consultationCount ?? 0,
    languages: d.languages ?? [],
    availability: availabilityFor(d),
    // Matches the 12-hour reply guarantee in lib/consultation.ts.
    responseTime: "within 12 hours",
    feeGBP: d.feeGBP ?? 0,
    about: d.about ?? "",
    registrationNumber: d.registrationNumber ?? "",
    clinic: d.clinic ?? "",
    city: d.city ?? "",
    country: d.country ?? "",
    hue: hueFor(d._id),
    avatar: d.user?.avatar || undefined,
    recommended: d.recommended,
    schedule: d.schedule,
    messaging: { free: Boolean(d.messaging?.free), consultation: d.messaging?.consultation ?? true },
  };
}

/** Approved, active doctors. Recommended first, then best rated. */
export async function getDoctors(): Promise<Doctor[]> {
  const result = await api<BackendDoctor[]>("/doctors/directory");
  if (!result.ok || !result.data) {
    console.error("Could not load doctors:", result.message);
    return [];
  }
  return result.data.map(toDoctor);
}

/** One approved, active doctor, or undefined if not found (or not approved / blocked). */
async function fetchDoctor(id: string): Promise<Doctor | undefined> {
  if (!/^[a-f\d]{24}$/i.test(id)) return undefined;
  const result = await api<BackendDoctor>(`/doctors/directory/${id}`);
  return result.ok && result.data ? toDoctor(result.data) : undefined;
}
export const getDoctor = cache(fetchDoctor);

/** The signed-in patient's own review of a doctor (shown even while it waits for a check). */
export interface MyReview {
  id: string;
  rating: number;
  text: string;
  status: "published" | "held" | "hidden";
  date: string;
}

interface BackendReview {
  _id: string;
  rating: number;
  text: string;
  createdAt: string;
  author?: string;
  status?: MyReview["status"];
}

/** A doctor's published reviews (GET /reviews/doctor/:id), plus your own. Authors are anonymous. */
export async function getDoctorReviews(doctorId: string): Promise<{ reviews: Review[]; mine: MyReview | null }> {
  if (!/^[a-f\d]{24}$/i.test(doctorId)) return { reviews: [], mine: null };
  const result = await api<{ reviews: BackendReview[]; mine: BackendReview | null }>(`/reviews/doctor/${doctorId}?limit=50`);
  if (!result.ok || !result.data) return { reviews: [], mine: null };
  const mine = result.data.mine;
  return {
    reviews: result.data.reviews.map((r) => ({
      id: r._id,
      doctorId,
      author: r.author ?? "Verified patient",
      rating: r.rating,
      text: r.text,
      date: r.createdAt,
    })),
    mine: mine ? { id: mine._id, rating: mine.rating, text: mine.text, status: mine.status ?? "published", date: mine.createdAt } : null,
  };
}

/** Start times this doctor is already booked for (so those slots show as taken). */
export async function getBookedSlots(doctorId: string): Promise<string[]> {
  if (!/^[a-f\d]{24}$/i.test(doctorId)) return [];
  const result = await api<string[]>(`/doctors/directory/${doctorId}/booked`);
  return result.ok && result.data ? result.data : [];
}

// ── The signed-in doctor ────────────────────────────────────────────────────

/** Your own profile as patients see it (GET /doctors/me), with your saved schedule and online status. */
export async function getMyDoctor(): Promise<(Doctor & { isOnline: boolean }) | undefined> {
  const result = await api<BackendDoctor>("/doctors/me");
  if (!result.ok || !result.data) return undefined;
  return { ...toDoctor(result.data), isOnline: Boolean(result.data.isOnline) };
}
