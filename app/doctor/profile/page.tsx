import type { Metadata } from "next";
import { DoctorProfileView } from "@/component/doctor/doctor-profile";
import { PageHeader } from "@/component/shared/page-header";

export const metadata: Metadata = { title: "Profile & settings" };

// Rendered after the client-side session check in AppShell, so it can't be validated on the server.
export const instant = false;

export default function DoctorProfilePage() {
  return (
    <>
      <PageHeader title="Profile & settings" description="Your public profile, consultation fee and account." />
      <DoctorProfileView />
    </>
  );
}
