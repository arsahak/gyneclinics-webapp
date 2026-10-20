import type { Metadata } from "next";
import { ConsultationList } from "@/component/booking/consultation-list";
import { PageHeader } from "@/component/shared/page-header";
import { ButtonLink } from "@/component/ui/button";
import { getDoctors } from "@/lib/services/doctors";

export const metadata: Metadata = { title: "My consultations" };

// Rendered after the client-side session check in AppShell, so it can't be validated on the server.
export const instant = false;

export default async function ConsultationsPage() {
  const doctors = await getDoctors();
  return (
    <>
      <PageHeader
        eyebrow="Get help"
        title="My consultations"
        description="Your bookings, chat windows and receipts."
        action={<ButtonLink href="/patient/doctors">Book a consultation</ButtonLink>}
      />
      <ConsultationList doctors={doctors} />
    </>
  );
}
