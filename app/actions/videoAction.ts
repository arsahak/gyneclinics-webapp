"use server";

import { getAccessToken } from "@/auth";
import { api, errorText } from "@/lib/api";

export interface CallTicket {
  token: string;
  roomName: string;
  maxMinutes: number;
}

async function ticketFrom(path: string): Promise<{ ticket?: CallTicket; error?: string }> {
  if (!(await getAccessToken())) return { error: "Please sign in again." };
  const result = await api<CallTicket>(path, { method: "POST" });
  if (!result.ok || !result.data) return { error: errorText(result) };
  return { ticket: { token: result.data.token, roomName: result.data.roomName, maxMinutes: result.data.maxMinutes } };
}

/** A Twilio Video token for your own private room, to check camera and microphone. */
export async function joinTestCallAction() {
  return ticketFrom("/video/test-call");
}

/** A Twilio Video token for one consultation's call (its patient or doctor only). */
export async function joinConsultationCallAction(reference: string) {
  return ticketFrom(`/video/consultations/${encodeURIComponent(reference)}`);
}
