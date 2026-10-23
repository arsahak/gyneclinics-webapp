import { create } from "zustand";
import type { Consultation } from "@/lib/types";

// Your consultations: loaded from the backend with the patient or doctor area
// (see PortalData). A new booking is added here as soon as the backend saved
// it, and the next load brings the backend's copy.

/** "GC-" and 6 letters or digits, e.g. GC-4K7Q2M. The backend checks it's unused. */
export function newReference() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return `GC-${Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("")}`;
}

interface ConsultationState {
  consultations: Consultation[];
  load: (consultations: Consultation[]) => void;
  /** Adds a booking. `saved` is the backend's reference and time when it already made one (paid bookings). */
  book: (consultation: Omit<Consultation, "id" | "bookedAt">, saved?: { id: string; bookedAt: string }) => Consultation;
  /** Takes a booking out again (the backend didn't save it). */
  remove: (id: string) => void;
}

export const useConsultations = create<ConsultationState>()((set) => ({
  consultations: [],
  load: (consultations) => set({ consultations }),
  book: (input, saved) => {
    const consultation: Consultation = {
      ...input,
      id: saved?.id ?? newReference(),
      bookedAt: saved?.bookedAt ?? new Date().toISOString(),
    };
    set((s) => ({ consultations: [consultation, ...s.consultations.filter((c) => c.id !== consultation.id)] }));
    return consultation;
  },
  remove: (id) => set((s) => ({ consultations: s.consultations.filter((c) => c.id !== id) })),
}));
