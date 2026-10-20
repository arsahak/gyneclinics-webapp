import type { Metadata } from "next";
import { PatientProfileView } from "@/component/home/patient-profile";
import { PageHeader } from "@/component/shared/page-header";

export const metadata: Metadata = { title: "Profile & settings" };

// Rendered after the client-side session check in AppShell, so it can't be validated on the server.
export const instant = false;

export default function PatientProfilePage() {
  return (
    <>
      <PageHeader title="Profile & settings" description="Manage your details, reminders, location and privacy." />
      <PatientProfileView />
    </>
  );
}
