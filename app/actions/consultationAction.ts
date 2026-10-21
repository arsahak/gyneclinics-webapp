"use server";

import { getAccessToken } from "@/auth";
import { api, errorText } from "@/lib/api";
import type { Consultation } from "@/lib/types";

export type ConfirmationSms = { status: "sent" | "failed" | "skipped"; to: string };

/**
 * The patient's payment went through: save the booking on the backend, which
 * texts the patient a confirmation. Returns how the text went.
 */
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
      payment: consultation.payment,
    },
  });
  if (!result.ok || !result.data) return { error: errorText(result) };
  return { sms: result.data.sms };
}
