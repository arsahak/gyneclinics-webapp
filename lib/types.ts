// Shared domain types. These mirror the shapes the backend API will return later,
// so swapping the mock services for real fetches should not touch the UI.

export type Role = "patient" | "doctor";

export type PregnancyStatus = "not_pregnant" | "trying" | "pregnant" | "postpartum";

export interface PatientProfile {
  fullName: string;
  dateOfBirth: string; // yyyy-MM-dd
  heightCm: number;
  weightKg: number;
  typicalCycleLength: number;
  typicalPeriodLength: number;
  lastPeriodStart: string; // yyyy-MM-dd
  pregnancyStatus: PregnancyStatus;
  dueDate?: string;
}

export type DoctorVerificationStatus = "pending" | "approved" | "rejected";

/** Consultation preferences collected while a doctor creates their profile. */
export interface ConsultationAvailabilityDraft {
  /** Monday = 0 through Sunday = 6. */
  weekdays: number[];
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  slotMinutes: number;
  instantChat: boolean;
}

export interface DoctorProfileDraft {
  fullName: string;
  title: string;
  specialization: string;
  qualifications: string[];
  experienceYears: number;
  registrationNumber: string;
  registrationBody: string;
  clinic: string;
  city: string;
  languages: string[];
  feeGBP: number;
  consultationAvailability: ConsultationAvailabilityDraft;
  about: string;
  documents: string[];
}

export type Availability = "online" | "today" | "this_week" | "away";

export interface Doctor {
  id: string;
  name: string;
  title: string;
  specialization: string;
  focusAreas: string[];
  qualifications: string[];
  experienceYears: number;
  rating: number;
  reviewCount: number;
  consultations: number;
  languages: string[];
  availability: Availability;
  responseTime: string;
  feeGBP: number;
  about: string;
  registrationNumber: string;
  clinic: string;
  city: string;
  country: string;
  hue: number;
  recommended?: boolean;
}

export interface Review {
  id: string;
  doctorId: string;
  author: string;
  rating: number;
  text: string;
  date: string;
}

export type ArticleCategory =
  | "Periods"
  | "Fertility"
  | "Pregnancy"
  | "Menopause"
  | "Pelvic Health"
  | "Wellness"
  | "Stories";

export interface Article {
  slug: string;
  title: string;
  excerpt: string;
  category: ArticleCategory;
  format: "blog" | "guide" | "story";
  readMinutes: number;
  author: string;
  authorRole: string;
  publishedAt: string;
  cover: { from: string; to: string; icon: string };
  sponsor?: string;
  sections: { heading?: string; body: string }[];
}

export type StoryStatus = "pending" | "approved" | "rejected";

export interface SubmittedStory {
  id: string;
  title: string;
  body: string;
  category: ArticleCategory;
  authorName: string;
  anonymous: boolean;
  /** Optional image stored locally until the production media service is connected. */
  imageDataUrl?: string;
  submittedAt: string;
  status: StoryStatus;
  reviewedAt?: string;
}

export type Flow = "light" | "medium" | "heavy";

export interface PeriodEntry {
  id: string;
  start: string; // yyyy-MM-dd
  end?: string; // yyyy-MM-dd
  flow?: Flow;
  symptoms?: string[];
  note?: string;
}

export interface WeightEntry {
  id: string;
  date: string;
  kg: number;
}

export interface BabyGrowthEntry {
  id: string;
  date: string;
  week: number; // gestational week from scan report
  weightG: number;
  lengthCm: number;
}

export interface Message {
  id: string;
  from: Role;
  text: string;
  at: string; // ISO timestamp
}

export interface PatientThread {
  id: string;
  patientName: string;
  age: number;
  topic: string;
  hue: number;
  status: "active" | "waiting" | "closed";
}

export interface AdCreative {
  id: string;
  advertiser: string;
  headline: string;
  body: string;
  cta: string;
  priceGBP?: number;
  tone: "primary" | "secondary" | "accent" | "gold";
}

export type ConsultationMode = "instant" | "scheduled";

export type PaymentMethodId = "card" | "wallet" | "local";

export interface Consultation {
  id: string;
  doctorId: string;
  mode: ConsultationMode;
  concern: string;
  /** When the chat opens (now for instant, slot start for scheduled). ISO timestamp. */
  startsAt: string;
  bookedAt: string;
  /** Doctor marked it complete before the session window ended. */
  completedAt?: string;
  refundedAt?: string;
  payment: {
    amount: number;
    currency: string;
    regionId: string;
    method: PaymentMethodId | "free";
    reference: string;
    /** Human-readable instrument, e.g. "Visa •••• 4242" or "bKash •••• 3456". */
    details?: string;
    paidAt?: string;
  };
}
