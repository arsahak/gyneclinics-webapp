import type { Metadata } from "next";
import { PatientProfileView } from "@/component/home/patient-profile";

export const metadata: Metadata = { title: "Profile & settings" };

// The layout checks the session on the server, so this page is rendered per request.
export const instant = false;

export default function PatientProfilePage() {
  // The view renders its own header, with the Edit button on the right.
  return <PatientProfileView />;
}
