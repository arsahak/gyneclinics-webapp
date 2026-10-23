import type { Metadata } from "next";
import { DoctorDashboard } from "@/component/doctor/dashboard";
import { PageHeader } from "@/component/shared/page-header";
import { getMyChats } from "@/lib/services/chats";
import { getDoctorReviews, getMyDoctor } from "@/lib/services/doctors";
import { getMyEarnings } from "@/lib/services/payouts";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Dashboard",
  description: "Today's consultations, patients waiting for your reply and your earnings at a glance.",
  path: "/doctor",
});

// The layout checks the session on the server, so this page is rendered per request.
export const instant = false;

export default async function DoctorHome() {
  const [chats, doctor, earnings] = await Promise.all([getMyChats("doctor"), getMyDoctor(), getMyEarnings()]);
  if (!doctor) {
    return (
      <>
        <PageHeader title="Dashboard" />
        <p role="alert" className="rounded-2xl border border-border bg-surface p-6 text-sm text-muted-foreground">
          We couldn&apos;t load your dashboard. Please try again in a moment.
        </p>
      </>
    );
  }
  const { reviews } = await getDoctorReviews(doctor.id);
  return (
    <DoctorDashboard
      doctorId={doctor.id}
      online={doctor.isOnline}
      rating={doctor.reviewCount ? doctor.rating : null}
      chats={chats}
      latestReview={reviews[0] ?? null}
      availableGBP={earnings?.balance.availableGBP ?? null}
    />
  );
}
