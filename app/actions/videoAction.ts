"use server";

import { getAccessToken } from "@/auth";
import { api, errorText } from "@/lib/api";

export interface TestCallTicket {
  token: string;
  roomName: string;
  maxMinutes: number;
}

/** A Twilio Video token for the shared 30-minute test room (doctor or patient). */
export async function joinTestCallAction(): Promise<{ ticket?: TestCallTicket; error?: string }> {
  if (!(await getAccessToken())) return { error: "Please sign in again." };
  const result = await api<TestCallTicket>("/video/test-call", { method: "POST" });
  if (!result.ok || !result.data) return { error: errorText(result) };
  return { ticket: { token: result.data.token, roomName: result.data.roomName, maxMinutes: result.data.maxMinutes } };
}
