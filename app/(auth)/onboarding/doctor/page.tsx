import type { Metadata } from "next";
import { Suspense } from "react";
import { DoctorOnboarding } from "@/component/auth/doctor-onboarding";
import { Skeleton } from "@/component/ui/skeleton";
import { requireOnboarding } from "@/lib/session";

export const metadata: Metadata = { title: "Set up your doctor profile" };

// Reads the session, so it can't be part of the static shell.
export const instant = false;

export default function DoctorOnboardingPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96" />}>
      <Onboarding />
    </Suspense>
  );
}

async function Onboarding() {
  const account = await requireOnboarding("doctor");
  return <DoctorOnboarding fullName={account.fullName} />;
}
