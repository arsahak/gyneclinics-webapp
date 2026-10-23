import type { Metadata } from "next";
import { Suspense } from "react";
import { DoctorOnboarding } from "@/component/auth/doctor-onboarding";
import { Skeleton } from "@/component/ui/skeleton";
import { requireOnboarding } from "@/lib/session";
import { PRIVATE_ROBOTS, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  ...pageMetadata({ title: "Set up your doctor profile", description: "Add your qualifications, registration and fee to start consulting patients on GyneX.", path: "/onboarding/doctor" }),
  robots: PRIVATE_ROBOTS,
};

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
