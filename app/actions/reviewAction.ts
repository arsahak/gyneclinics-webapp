"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { API_URL, getAccessToken } from "@/auth";

/**
 * Sends a review of a doctor (POST /reviews). The backend allows it only after
 * a consultation with that doctor, once. Reloads the page so it shows.
 */
export async function submitReviewAction(input: { doctorId: string; rating: number; text: string }): Promise<{ error?: string; message?: string }> {
  const token = await getAccessToken();
  if (!token) redirect("/login");

  try {
    const response = await fetch(`${API_URL}/api/v1/reviews`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ doctorId: input.doctorId, rating: input.rating, text: input.text.trim() }),
      cache: "no-store",
    });
    const json = await response.json().catch(() => null);
    if (!response.ok) return { error: json?.errors?.[0] ?? json?.message ?? "Couldn't send your review. Please try again." };
    refresh();
    return { message: json?.message };
  } catch {
    return { error: "Can't reach the server. Please check your connection and try again." };
  }
}
