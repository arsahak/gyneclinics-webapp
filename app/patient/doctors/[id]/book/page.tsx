import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { BookingFlow } from "@/component/booking/booking-flow";
import { PageHeader } from "@/component/shared/page-header";
import { messagingFor } from "@/lib/consultation";
import { getDoctor } from "@/lib/services/doctors";

export const metadata: Metadata = { title: "Book a consultation" };

// The layout checks the session on the server, so this page is rendered per request.
export const instant = false;

export default async function BookPage({ params }: PageProps<"/patient/doctors/[id]/book">) {
  const { id } = await params;
  const doctor = await getDoctor(id);
  if (!doctor) notFound();
  // This doctor only takes free messages.
  if (!messagingFor(doctor).consultation) redirect(`/patient/messages/${doctor.id}`);
  return (
    <>
      <PageHeader backHref={`/patient/doctors/${doctor.id}`} eyebrow="Book a consultation" title={doctor.name} description={doctor.title} />
      <BookingFlow doctor={doctor} />
    </>
  );
}
