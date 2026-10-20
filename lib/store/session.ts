import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type {
  DoctorProfileDraft,
  DoctorVerificationStatus,
  PatientProfile,
  Role,
} from "@/lib/types";

interface SessionState {
  phone: string | null;
  verified: boolean;
  role: Role | null;
  consentAt: string | null;
  patient: PatientProfile | null;
  doctor: DoctorProfileDraft | null;
  doctorStatus: DoctorVerificationStatus | null;
  doctorOnline: boolean;
  setPhone: (phone: string) => void;
  verify: () => void;
  chooseRole: (role: Role) => void;
  savePatient: (profile: PatientProfile) => void;
  saveDoctor: (profile: DoctorProfileDraft) => void;
  acceptConsent: () => void;
  setDoctorStatus: (status: DoctorVerificationStatus) => void;
  setDoctorOnline: (online: boolean) => void;
  startDemo: (role: Role) => void;
  signOut: () => void;
}

const signedOut = {
  phone: null,
  verified: false,
  role: null,
  consentAt: null,
  patient: null,
  doctor: null,
  doctorStatus: null,
  doctorOnline: true,
};

export const demoPatient: PatientProfile = {
  fullName: "Ayesha Khan",
  dateOfBirth: "1997-04-12",
  heightCm: 163,
  weightKg: 61.5,
  typicalCycleLength: 28,
  typicalPeriodLength: 5,
  lastPeriodStart: "",
  pregnancyStatus: "not_pregnant",
};

export const demoDoctor: DoctorProfileDraft = {
  fullName: "Dr. Amelia Hart",
  title: "Consultant Gynaecologist",
  specialization: "General Gynaecology",
  qualifications: ["MBBS", "MRCOG", "MD (Obstetrics & Gynaecology)"],
  experienceYears: 18,
  registrationNumber: "GMC 7104412",
  registrationBody: "General Medical Council (UK)",
  clinic: "GyneClinics Harley Street",
  city: "London",
  languages: ["English", "French"],
  feeGBP: 45,
  consultationAvailability: {
    weekdays: [0, 1, 2, 3, 4],
    startTime: "09:00",
    endTime: "17:00",
    slotMinutes: 30,
    instantChat: true,
  },
  about:
    "Consultant gynaecologist with a special interest in menstrual disorders and PCOS.",
  documents: ["medical-registration.pdf", "mrcog-certificate.pdf"],
};

export const useSession = create<SessionState>()(
  persist(
    (set) => ({
      ...signedOut,
      setPhone: (phone) => set({ phone, verified: false }),
      verify: () => set({ verified: true }),
      chooseRole: (role) => set({ role }),
      savePatient: (patient) => set({ patient }),
      saveDoctor: (doctor) => set({ doctor, doctorStatus: "pending" }),
      acceptConsent: () => set({ consentAt: new Date().toISOString() }),
      setDoctorStatus: (doctorStatus) => set({ doctorStatus }),
      setDoctorOnline: (doctorOnline) => set({ doctorOnline }),
      startDemo: (role) =>
        set({
          phone: role === "patient" ? "+44 7700 900123" : "+44 7700 900456",
          verified: true,
          role,
          consentAt: new Date().toISOString(),
          patient: role === "patient" ? demoPatient : null,
          doctor: role === "doctor" ? demoDoctor : null,
          doctorStatus: role === "doctor" ? "approved" : null,
        }),
      signOut: () => set(signedOut),
    }),
    {
      name: "gc-session",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    },
  ),
);

/** Where a signed-in user should land next, based on how far through onboarding they are. */
export function nextStepFor(state: Pick<SessionState, "verified" | "role" | "patient" | "doctor" | "consentAt" | "doctorStatus">) {
  if (!state.verified) return "/login";
  if (!state.role) return "/register";
  if (state.role === "patient" && !state.patient) return "/onboarding/patient";
  if (state.role === "doctor" && !state.doctor) return "/onboarding/doctor";
  if (!state.consentAt) return "/consent";
  if (state.role === "doctor") return state.doctorStatus === "approved" ? "/doctor" : "/doctor/pending";
  return "/patient";
}
