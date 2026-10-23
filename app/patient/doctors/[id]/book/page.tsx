import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { BookingFlow } from "@/component/booking/booking-flow";
import { PageHeader } from "@/component/shared/page-header";
import { messagingFor } from "@/lib/consultation";
import { getBookedSlots, getDoctor } from "@/lib/services/doctors";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/patient/doctors/[id]/book">): Promise<Metadata> {
  const doctor = await getDoctor((await params).id);
  if (!doctor) return { title: "Book a consultation" };
  return pageMetadata({
    title: `Book ${doctor.name}`,
    description: `Book a private chat consultation with ${doctor.name}, ${doctor.title}. Choose a time and pay securely.`,
    path: `/patient/doctors/${doctor.id}/book`,
  });
}

// The layout checks the session on the server, so this page is rendered per request.
export const instant = false;

export default async function BookPage({ params }: PageProps<"/patient/doctors/[id]/book">) {
  const { id } = await params;
  const [doctor, bookedStarts] = await Promise.all([getDoctor(id), getBookedSlots(id)]);
  if (!doctor) notFound();
  // This doctor only takes free messages.
  if (!messagingFor(doctor).consultation) redirect(`/patient/messages/${doctor.id}`);
  return (
    <>
      <PageHeader backHref={`/patient/doctors/${doctor.id}`} eyebrow="Book a consultation" title={doctor.name} description={doctor.title} />
      <BookingFlow doctor={doctor} bookedStarts={bookedStarts} />
    </>
  );
}
