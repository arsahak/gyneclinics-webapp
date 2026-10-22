"use server";

import { redirect } from "next/navigation";
import { API_URL, getAccessToken } from "@/auth";

/** Reports a doctor to the GyneClinics team (POST /reports). */
export async function reportDoctorAction(input: { doctorId: string; reason: string; details: string }): Promise<{ error?: string; message?: string }> {
  const token = await getAccessToken();
  if (!token) redirect("/login");

  try {
    const response = await fetch(`${API_URL}/api/v1/reports`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ doctorId: input.doctorId, reason: input.reason, details: input.details.trim() }),
      cache: "no-store",
    });
    const json = await response.json().catch(() => null);
    if (!response.ok) return { error: json?.errors?.[0] ?? json?.message ?? "Couldn't send your report. Please try again." };
    return { message: json?.message };
  } catch {
    return { error: "Can't reach the server. Please check your connection and try again." };
  }
}
