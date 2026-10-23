import type { Metadata } from "next";
import { PatientProfileView } from "@/component/home/patient-profile";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Profile & settings",
  description: "Your personal details, health profile, privacy and account settings.",
  path: "/patient/profile",
});

// The layout checks the session on the server, so this page is rendered per request.
export const instant = false;

export default function PatientProfilePage() {
  // The view renders its own header, with the Edit button on the right.
  return <PatientProfileView />;
}
