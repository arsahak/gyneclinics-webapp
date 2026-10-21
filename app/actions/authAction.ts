"use server";

import { redirect } from "next/navigation";
import { getAccessToken, getPendingSignup, signIn, signOut } from "@/auth";
import { type BackendSession, pathForStep } from "@/lib/account";
import { api, errorText } from "@/lib/api";
import type { AppRole } from "@/lib/types";

// Sign-in, registration and sign-out. Each action talks to the backend, then
// hands the result to Auth.js (signIn/signOut in auth.ts), which owns the
// session cookie.

export type ActionError = { error: string };

const E164 = /^\+[1-9]\d{7,14}$/;
const APP_ROLES: AppRole[] = ["patient", "doctor"];

/** Starts an Auth.js session from a credentials provider. */
async function startSession(provider: "backend-token" | "signup", credentials: Record<string, string>) {
  const url: string = await signIn(provider, { ...credentials, redirect: false });
  if (url.includes("error=")) throw new Error("Could not start your session. Please try again.");
}

/** Sends the SMS code. Returns the number in international format. */
export async function sendOtpAction(phone: string): Promise<ActionError | { phone: string }> {
  const normalized = String(phone).replace(/[\s().-]/g, "");
  if (!E164.test(normalized)) return { error: "Please enter a valid mobile number." };

  const result = await api("/auth/otp/send", { method: "POST", body: { phone: normalized }, token: null });
  return result.ok ? { phone: normalized } : { error: errorText(result) };
}

type VerifyResult =
  | { isNewUser: true; phone: string; signupToken: string }
  | ({ isNewUser: false; token: string } & BackendSession);

/** Checks the code. Known number → signed in; new number → choose a role. Redirects on success. */
export async function verifyOtpAction(phone: string, code: string): Promise<ActionError> {
  const result = await api<VerifyResult>("/auth/otp/verify", { method: "POST", body: { phone, code }, token: null });
  if (!result.ok || !result.data) return { error: errorText(result) };

  const data = result.data;
  if (data.isNewUser) {
    await startSession("signup", { phone: data.phone, signupToken: data.signupToken });
    redirect("/register");
  }

  const role = data.user.role as AppRole;
  if (!APP_ROLES.includes(role)) {
    return { error: "This number belongs to an account that can't use the patient and doctor app." };
  }
  await startSession("backend-token", { accessToken: data.token });
  redirect(pathForStep(role, data.nextStep));
}

/** Creates the account for the verified phone in the pending session. The name is asked in onboarding. */
export async function registerAction(role: AppRole): Promise<ActionError> {
  const pending = await getPendingSignup();
  if (!pending) redirect("/login");

  if (!APP_ROLES.includes(role)) return { error: "Please choose patient or doctor." };

  const result = await api<{ token: string } & BackendSession>("/auth/register", {
    method: "POST",
    body: { signupToken: pending.signupToken, role },
    token: null,
  });
  if (result.status === 401) {
    await signOut({ redirect: false });
    return { error: "Your verification has expired. Please sign in again." };
  }
  if (!result.ok || !result.data) return { error: errorText(result) };

  await startSession("backend-token", { accessToken: result.data.token });
  redirect(pathForStep(role, result.data.nextStep));
}

/** Records consent, then continues to the next step. */
export async function acceptConsentAction(): Promise<ActionError> {
  if (!(await getAccessToken())) redirect("/login");

  const result = await api<BackendSession>("/auth/consent", { method: "POST" });
  if (!result.ok || !result.data) return { error: errorText(result) };
  redirect(pathForStep(result.data.user.role as AppRole, result.data.nextStep));
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}

/** Deletes the account on the backend, then ends the session. */
export async function deleteAccountAction(): Promise<ActionError | undefined> {
  if (!(await getAccessToken())) redirect("/login");

  const result = await api("/users/me", { method: "DELETE" });
  if (!result.ok) return { error: errorText(result) };
  await signOut({ redirectTo: "/" });
}
