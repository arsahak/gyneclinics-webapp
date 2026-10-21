import type { Metadata } from "next";
import { DoctorDashboard } from "@/component/doctor/dashboard";
import { getDemoDoctor, getDemoDoctorReviews } from "@/lib/services/doctors";
import { getPatientThreads } from "@/lib/services/messaging";

export const metadata: Metadata = { title: "Dashboard" };

// The layout checks the session on the server, so this page is rendered per request.
export const instant = false;


export default async function DoctorHome() {
  const [threads, reviews, doctor] = await Promise.all([getPatientThreads(), getDemoDoctorReviews(), getDemoDoctor()]);
  return <DoctorDashboard doctorId={doctor!.id} threads={threads} reviews={reviews} />;
}
