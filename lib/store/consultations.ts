import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Consultation } from "@/lib/types";

// Matches the seeded chat history in lib/mock/engagement.ts.
const seed: Consultation[] = [
  {
    id: "GC-4K7Q2M",
    doctorId: "amelia-hart",
    mode: "instant",
    concern: "My last two cycles were 38 and 41 days.",
    startsAt: "2026-10-18T09:10:00Z",
    bookedAt: "2026-10-18T09:10:00Z",
    payment: { amount: 15, currency: "USD", regionId: "south_asia", method: "local", reference: "PAY-81QX", details: "bKash •••• 4471", paidAt: "2026-10-18T09:09:00Z" },
  },
  {
    id: "GC-9TZ3LA",
    doctorId: "nadia-rahman",
    mode: "scheduled",
    concern: "Questions about my fertile window estimate.",
    startsAt: "2026-10-16T14:00:00Z",
    bookedAt: "2026-10-15T08:30:00Z",
    payment: { amount: 13, currency: "USD", regionId: "south_asia", method: "card", reference: "PAY-55KD", details: "Visa •••• 4242", paidAt: "2026-10-15T08:29:00Z" },
  },
];

/** "GC-" and 6 letters or digits, e.g. GC-4K7Q2M. */
function newReference() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return `GC-${Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("")}`;
}

interface ConsultationState {
  consultations: Consultation[];
  /** Adds a booking. `saved` keeps the backend's reference when it made one (paid bookings). */
  book: (consultation: Omit<Consultation, "id" | "bookedAt">, saved?: { id: string; bookedAt: string }) => Consultation;
  complete: (id: string) => void;
}

export const useConsultations = create<ConsultationState>()(
  persist(
    (set) => ({
      consultations: seed,
      book: (input, saved) => {
        const consultation: Consultation = {
          ...input,
          id: saved?.id ?? newReference(),
          bookedAt: saved?.bookedAt ?? new Date().toISOString(),
        };
        set((s) => ({ consultations: [consultation, ...s.consultations] }));
        return consultation;
      },
      complete: (id) =>
        set((s) => ({
          consultations: s.consultations.map((c) =>
            c.id === id ? { ...c, completedAt: new Date().toISOString() } : c,
          ),
        })),
    }),
    {
      name: "gc-consultations",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    },
  ),
);
