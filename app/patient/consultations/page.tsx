import type { Metadata } from "next";
import { ConsultationList } from "@/component/booking/consultation-list";
import { PageHeader } from "@/component/shared/page-header";
import { ButtonLink } from "@/component/ui/button";
import { getDoctors } from "@/lib/services/doctors";

export const metadata: Metadata = { title: "My consultations" };

// The layout checks the session on the server, so this page is rendered per request.
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
