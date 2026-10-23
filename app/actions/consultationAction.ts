"use server";

import { getAccessToken } from "@/auth";
import { api, errorText } from "@/lib/api";
import type { RegionId } from "@/lib/locale/regions";
import type { Consultation, ConsultationMode, PaymentMethodId } from "@/lib/types";

export type ConfirmationSms = { status: "sent" | "failed" | "skipped"; to: string };

export interface BookingRequest {
  doctorId: string;
  mode: ConsultationMode;
  concern: string;
  startsAt: string;
  regionId: RegionId;
  timezone: string;
}

/** The booking as the backend saved it. */
interface SavedConsultation {
  reference: string;
  startsAt: string;
  createdAt: string;
  payment: { amount: number; currency: string; regionId: string; method: PaymentMethodId | "free"; reference: string; details?: string; paidAt?: string };
}

export interface BookedResult {
  reference: string;
  startsAt: string;
  bookedAt: string;
  payment: Consultation["payment"];
  sms: ConfirmationSms | null;
}

const toBooked = (c: SavedConsultation, sms: ConfirmationSms | null): BookedResult => ({
  reference: c.reference,
  startsAt: c.startsAt,
  bookedAt: c.createdAt,
  payment: c.payment,
  sms,
});

/** A free consultation (fee 0): saved straight away; the backend texts the patient. */
export async function confirmBookingAction(
  consultation: Pick<Consultation, "id" | "doctorId" | "mode" | "concern" | "startsAt" | "payment">,
  timezone: string,
): Promise<{ sms?: ConfirmationSms; error?: string }> {
  if (!(await getAccessToken())) return { error: "Please sign in again." };
  const result = await api<{ sms: ConfirmationSms }>("/consultations", {
    method: "POST",
    body: {
      reference: consultation.id,
      doctorId: consultation.doctorId,
      mode: consultation.mode,
      concern: consultation.concern,
      startsAt: consultation.startsAt,
      timezone,
      regionId: consultation.payment.regionId,
    },
  });
  if (!result.ok || !result.data) return { error: errorText(result) };
  return { sms: result.data.sms };
}

export interface CheckoutStart {
  paymentIntentId: string;
  clientSecret: string;
  publishableKey: string;
  mode: "test" | "live";
  reference: string;
  amount: number;
  currency: string;
}

/** A paid consultation, step 1: the backend prices it and opens a Stripe payment. */
export async function startCheckoutAction(input: BookingRequest): Promise<{ data?: CheckoutStart; error?: string }> {
  if (!(await getAccessToken())) return { error: "Please sign in again." };
  const result = await api<CheckoutStart>("/consultations/checkout", { method: "POST", body: input });
  if (!result.ok || !result.data) return { error: errorText(result) };
  return { data: result.data };
}

/**
 * Step 2, after Stripe took the payment: the backend checks it with Stripe and
 * saves the booking. `processing` means Stripe hasn't settled it yet.
 */
export async function confirmCheckoutAction(paymentIntentId: string): Promise<{ booked?: BookedResult; processing?: boolean; error?: string }> {
  const result = await api<{ consultation: SavedConsultation; sms: ConfirmationSms | null; status?: string }>(
    `/consultations/checkout/${encodeURIComponent(paymentIntentId)}/confirm`,
    { method: "POST" },
  );
  if (result.status === 202) return { processing: true };
  if (!result.ok || !result.data?.consultation) return { error: errorText(result) };
  return { booked: toBooked(result.data.consultation, result.data.sms) };
}

/** Times a doctor is booked for right now, to re-check a slot just before paying. */
export async function bookedSlotsAction(doctorId: string): Promise<string[]> {
  if (!/^[a-f\d]{24}$/i.test(doctorId)) return [];
  const result = await api<string[]>(`/doctors/directory/${doctorId}/booked`);
  return result.ok && result.data ? result.data : [];
}
