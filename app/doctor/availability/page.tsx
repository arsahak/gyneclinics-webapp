import type { Metadata } from "next";
import { AvailabilityEditor } from "@/component/doctor/availability-editor";
import { PageHeader } from "@/component/shared/page-header";
import { getMyDoctor } from "@/lib/services/doctors";

export const metadata: Metadata = { title: "Availability" };

// The layout checks the session on the server, so this page is rendered per request.
export const instant = false;

export default async function DoctorAvailabilityPage() {
  const doctor = await getMyDoctor();
  if (doctor) return <AvailabilityEditor doctor={doctor} />;
  return (
    <>
      <PageHeader title="Availability" description="Set when patients can book a consultation with you." />
      <p role="alert" className="rounded-2xl border border-border bg-surface p-6 text-sm text-muted-foreground">
        We couldn&apos;t load your schedule. Please try again in a moment.
      </p>
    </>
  );
}
