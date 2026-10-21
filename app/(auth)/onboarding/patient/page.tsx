import type { Metadata } from "next";
import { Suspense } from "react";
import { PatientOnboarding } from "@/component/auth/patient-onboarding";
import { Hydrated } from "@/component/shared/hydrated";
import { Skeleton } from "@/component/ui/skeleton";
import { requireOnboarding } from "@/lib/session";

export const metadata: Metadata = { title: "Set up your profile" };

// Reads the session, so it can't be part of the static shell.
export const instant = false;

export default function PatientOnboardingPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96" />}>
      <Onboarding />
    </Suspense>
  );
}

async function Onboarding() {
  const account = await requireOnboarding("patient");
  return (
    // The form also starts the cycle log, which lives in this browser.
    <Hydrated fallback={<Skeleton className="h-96" />}>
      <PatientOnboarding fullName={account.fullName} />
    </Hydrated>
  );
}
