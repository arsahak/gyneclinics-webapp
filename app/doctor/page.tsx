import type { Metadata } from "next";
import { DoctorDashboard } from "@/component/doctor/dashboard";
import { getDemoDoctor, getDemoDoctorReviews } from "@/lib/services/doctors";
import { getMyChats } from "@/lib/services/chats";
import { getMyEarnings } from "@/lib/services/payouts";

export const metadata: Metadata = { title: "Dashboard" };

// The layout checks the session on the server, so this page is rendered per request.
export const instant = false;


export default async function DoctorHome() {
  const [chats, reviews, doctor, earnings] = await Promise.all([getMyChats("doctor"), getDemoDoctorReviews(), getDemoDoctor(), getMyEarnings()]);
  return <DoctorDashboard doctorId={doctor!.id} chats={chats} reviews={reviews} availableGBP={earnings?.balance.availableGBP ?? null} />;
}
