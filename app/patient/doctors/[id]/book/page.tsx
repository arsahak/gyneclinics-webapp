import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BookingFlow } from "@/component/booking/booking-flow";
import { PageHeader } from "@/component/shared/page-header";
import { getDoctor, listDoctorIds } from "@/lib/services/doctors";

export function generateStaticParams() {
  return listDoctorIds().map((id) => ({ id }));
}

export const metadata: Metadata = { title: "Book a consultation" };

// Rendered after the client-side session check in AppShell, so it can't be validated on the server.
export const instant = false;

export default async function BookPage({ params }: PageProps<"/patient/doctors/[id]/book">) {
  const { id } = await params;
  const doctor = await getDoctor(id);
  if (!doctor) notFound();
  return (
    <>
      <PageHeader backHref={`/patient/doctors/${doctor.id}`} eyebrow="Book a consultation" title={doctor.name} description={doctor.title} />
      <BookingFlow doctor={doctor} />
    </>
  );
}
