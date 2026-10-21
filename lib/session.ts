import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { getAccessToken, getPendingSignup } from "@/auth";
import { type Account, type BackendSession, HOME, pathForStep, toAccount } from "@/lib/account";
import { api } from "@/lib/api";
import type { AppRole } from "@/lib/types";

// Server-side session checks. Each page calls one of the require* helpers
// inside a <Suspense> boundary (a cookie read can't be part of the static
// shell with Cache Components). They redirect, so a page never renders for
// the wrong user.

/**
 * The signed-in account, fresh from the backend. Cached per request, so
 * several components can call it with a single backend round trip.
 */
export const getAccount = cache(async (): Promise<Account | null> => {
  const token = await getAccessToken();
  if (!token) return null;

  const result = await api<BackendSession>("/auth/me", { token });
  if (result.status === 401 || result.status === 403) return null;
  if (!result.ok || !result.data) throw new Error(result.message);

  const role = result.data.user.role;
  if (role !== "patient" && role !== "doctor") return null;
  return toAccount(result.data);
});

/** For /patient/* and /doctor/*: signed in, right role, onboarding and consent done. */
export async function requireAppAccess(role: AppRole): Promise<Account> {
  const account = await getAccount();
  if (!account) redirect("/login");
  if (account.role !== role) redirect(HOME[account.role]);

  const { nextStep } = account;
  if (nextStep === "onboarding" || nextStep === "consent") redirect(pathForStep(role, nextStep));

  if (role === "doctor") {
    // The proxy passes the path along; layouts don't get it otherwise.
    const onPendingPage = (await headers()).get("x-pathname") === "/doctor/pending";
    const verified = nextStep === "home";
    if (!verified && !onPendingPage) redirect("/doctor/pending");
    if (verified && onPendingPage) redirect("/doctor");
  }
  return account;
}

/** For /onboarding/{role}: signed in with that role and not onboarded yet. */
export async function requireOnboarding(role: AppRole): Promise<Account> {
  const account = await getAccount();
  if (!account) redirect("/login");
  if (account.role !== role || account.nextStep !== "onboarding") {
    redirect(pathForStep(account.role, account.nextStep));
  }
  return account;
}

/** For /consent: signed in, onboarded, consent not given yet. */
export async function requireConsentStep(): Promise<Account> {
  const account = await getAccount();
  if (!account) redirect("/login");
  if (account.nextStep !== "consent") redirect(pathForStep(account.role, account.nextStep));
  return account;
}

/** For /register: a verified phone that has no account yet. */
export async function requirePendingSignup() {
  const pending = await getPendingSignup();
  if (pending) return pending;
  const account = await getAccount();
  redirect(account ? pathForStep(account.role, account.nextStep) : "/login");
}
