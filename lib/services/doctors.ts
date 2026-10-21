import "server-only";
import { api } from "@/lib/api";
import type { DoctorSchedule } from "@/lib/availability";
import { DEMO_DOCTOR_ID, doctors as demoDoctors, reviews as demoReviews } from "@/lib/mock/doctors";
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

/** A stable avatar colour per doctor. */
function hueFor(id: string) {
  let hash = 0;
  for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return hash % 360;
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
export async function getDoctor(id: string): Promise<Doctor | undefined> {
  if (!/^[a-f\d]{24}$/i.test(id)) return undefined;
  const result = await api<BackendDoctor>(`/doctors/directory/${id}`);
  return result.ok && result.data ? toDoctor(result.data) : undefined;
}

/** Reviews aren't stored on the backend yet. */
export async function getDoctorReviews(doctorId: string): Promise<Review[]> {
  void doctorId;
  return [];
}

// ── Doctor app (still demo data until the doctor side uses the backend) ─────

export async function getDemoDoctor(): Promise<Doctor | undefined> {
  return demoDoctors.find((doctor) => doctor.id === DEMO_DOCTOR_ID);
}

export async function getDemoDoctorReviews(): Promise<Review[]> {
  return demoReviews.filter((review) => review.doctorId === DEMO_DOCTOR_ID);
}
