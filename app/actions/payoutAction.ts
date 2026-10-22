"use server";

import { headers } from "next/headers";
import { refresh } from "next/cache";
import { api } from "@/lib/api";

/**
 * A link to Stripe: its sign-up form (bank account or debit card, identity)
 * until that's done, then the doctor's Stripe dashboard. Stripe sends them back
 * to Earnings.
 */
export async function stripeLinkAction(): Promise<{ url?: string; kind?: "onboarding" | "dashboard"; error?: string }> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3001";
  const proto = h.get("x-forwarded-proto") ?? (/^(localhost|127\.)/.test(host) ? "http" : "https");
  const result = await api<{ url: string; kind: "onboarding" | "dashboard" }>("/payouts/me/stripe", {
    method: "POST",
    body: { returnUrl: `${proto}://${host}/doctor/earnings` },
  });
  if (!result.ok || !result.data) return { error: result.errors[0] ?? result.message };
  return result.data;
}

/** Asks for cleared earnings (POST /payouts/me/withdraw). */
export async function requestWithdrawalAction(amountGBP: number): Promise<{ error?: string; message?: string }> {
  const result = await api("/payouts/me/withdraw", { method: "POST", body: { amountGBP } });
  if (!result.ok) return { error: result.errors[0] ?? result.message };
  refresh();
  return { message: result.message };
}
