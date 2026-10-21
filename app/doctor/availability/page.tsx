import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AvailabilityEditor } from "@/component/doctor/availability-editor";
import { getDemoDoctor } from "@/lib/services/doctors";

export const metadata: Metadata = { title: "Availability" };

// The layout checks the session on the server, so this page is rendered per request.
export const instant = false;

export default async function DoctorAvailabilityPage() {
  const doctor = await getDemoDoctor();
  if (!doctor) notFound();
  return <AvailabilityEditor doctor={doctor} />;
}
