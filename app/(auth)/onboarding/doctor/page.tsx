import type { Metadata } from "next";
import { DoctorOnboarding } from "@/component/auth/doctor-onboarding";

export const metadata: Metadata = { title: "Set up your doctor profile" };

export default function DoctorOnboardingPage() {
  return <DoctorOnboarding />;
}
