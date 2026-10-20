import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AvailabilityEditor } from "@/component/doctor/availability-editor";
import { DEMO_DOCTOR_ID } from "@/lib/mock/doctors";
import { getDoctor } from "@/lib/services/doctors";

export const metadata: Metadata = { title: "Availability" };

// Rendered after the client-side session check in AppShell, so it can't be validated on the server.
export const instant = false;

export default async function DoctorAvailabilityPage() {
  const doctor = await getDoctor(DEMO_DOCTOR_ID);
  if (!doctor) notFound();
  return <AvailabilityEditor doctor={doctor} />;
}
