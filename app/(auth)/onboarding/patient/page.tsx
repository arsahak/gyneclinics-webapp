import type { Metadata } from "next";
import { PatientOnboarding } from "@/component/auth/patient-onboarding";
import { Hydrated } from "@/component/shared/hydrated";
import { Skeleton } from "@/component/ui/skeleton";

export const metadata: Metadata = { title: "Set up your profile" };

export default function PatientOnboardingPage() {
  return (
    <Hydrated fallback={<Skeleton className="h-96" />}>
      <PatientOnboarding />
    </Hydrated>
  );
}
