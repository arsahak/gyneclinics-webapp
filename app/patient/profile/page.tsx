import type { Metadata } from "next";
import { PatientProfileView } from "@/component/home/patient-profile";
import { PageHeader } from "@/component/shared/page-header";

export const metadata: Metadata = { title: "Profile & settings" };

// The layout checks the session on the server, so this page is rendered per request.
export const instant = false;

export default function PatientProfilePage() {
  return (
    <>
      <PageHeader title="Profile & settings" description="Manage your details, reminders, location and privacy." />
      <PatientProfileView />
    </>
  );
}
