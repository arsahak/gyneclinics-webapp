import "server-only";
import { api } from "@/lib/api";
import { hueFor } from "@/lib/chat";
import type { Consultation, PaymentMethodId } from "@/lib/types";

// The signed-in user's own consultations (GET /consultations/mine): a
// patient's bookings, or a doctor's. Server only.

interface BackendConsultation {
  reference: string;
  mode: Consultation["mode"];
  concern: string;
  startsAt: string;
  bookedAt: string;
  completedAt?: string;
  refundedAt?: string;
  payment: {
    amount: number;
    currency: string;
    regionId: string;
    method: PaymentMethodId | "free";
    reference: string;
    details?: string;
    paidAt?: string;
  };
  doctor: { _id: string; title?: string; specialization?: string; fullName?: string; avatar?: string } | null;
  patient?: { _id: string; fullName?: string; avatar?: string };
}

function toConsultation(c: BackendConsultation): Consultation {
  const doctorId = c.doctor?._id ?? "";
  return {
    id: c.reference,
    doctorId,
    doctor: { name: c.doctor?.fullName || "Your doctor", title: c.doctor?.title || c.doctor?.specialization, hue: hueFor(doctorId || c.reference), avatar: c.doctor?.avatar || undefined },
    patient: c.patient ? { id: c.patient._id, name: c.patient.fullName || "Patient", avatar: c.patient.avatar || undefined } : undefined,
    mode: c.mode,
    concern: c.concern,
    startsAt: c.startsAt,
    bookedAt: c.bookedAt,
    completedAt: c.completedAt,
    refundedAt: c.refundedAt,
    payment: c.payment,
  };
}

/** Newest start first. An empty list if the backend can't be reached. */
export async function getMyConsultations(): Promise<Consultation[]> {
  const result = await api<BackendConsultation[]>("/consultations/mine");
  if (!result.ok || !result.data) {
    console.error("Could not load consultations:", result.message);
    return [];
  }
  return result.data.map(toConsultation);
}
