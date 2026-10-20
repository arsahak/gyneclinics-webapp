import type { Metadata } from "next";
import { DoctorDashboard } from "@/component/doctor/dashboard";
import { DEMO_DOCTOR_ID } from "@/lib/mock/doctors";
import { getDoctor, getDoctorReviews } from "@/lib/services/doctors";
import { getPatientThreads } from "@/lib/services/messaging";

export const metadata: Metadata = { title: "Dashboard" };

// Rendered after the client-side session check in AppShell, so it can't be validated on the server.
export const instant = false;


export default async function DoctorHome() {
  const [threads, reviews, doctor] = await Promise.all([getPatientThreads(), getDoctorReviews(DEMO_DOCTOR_ID), getDoctor(DEMO_DOCTOR_ID)]);
  return <DoctorDashboard doctorId={doctor!.id} threads={threads} reviews={reviews} />;
}
