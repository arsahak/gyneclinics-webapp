import { Award, BadgeCheck, Building2, Clock, Languages, ShieldCheck, Users } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BookingCta } from "@/component/booking/booking-cta";
import { AvailabilityLabel } from "@/component/doctors/availability";
import { ConsultationHours } from "@/component/doctors/consultation-hours";
import { Rating } from "@/component/doctors/rating";
import { ReportDoctor } from "@/component/doctors/report-doctor";
import { ReviewSection } from "@/component/doctors/review-section";
import { Disclaimer } from "@/component/shared/disclaimer";
import { PageHeader } from "@/component/shared/page-header";
import { Avatar } from "@/component/ui/avatar";
import { Badge } from "@/component/ui/badge";
import { Card } from "@/component/ui/card";
import { getDoctor, getDoctorReviews } from "@/lib/services/doctors";
import { pageMetadata } from "@/lib/seo";

/** "Dr. Jane Smith — Reproductive Medicine", with her title, city, experience and bio. */
export async function generateMetadata({ params }: PageProps<"/patient/doctors/[id]">): Promise<Metadata> {
  const doctor = await getDoctor((await params).id);
  if (!doctor) return { title: "Specialist not found" };
  const where = doctor.city ? ` in ${doctor.city}` : "";
  return pageMetadata({
    title: `${doctor.name} — ${doctor.specialization}`,
    description: `${doctor.title}${where} with ${doctor.experienceYears} years' experience. ${doctor.about}`,
    path: `/patient/doctors/${doctor.id}`,
    type: "profile",
  });
}

// The layout checks the session on the server, so this page is rendered per request.
export const instant = false;

export default async function DoctorProfilePage({ params }: PageProps<"/patient/doctors/[id]">) {
  const { id } = await params;
  const [doctor, { reviews, mine }] = await Promise.all([getDoctor(id), getDoctorReviews(id)]);
  if (!doctor) notFound();

  const facts = [
    { icon: Award, label: "Experience", value: `${doctor.experienceYears} years` },
    { icon: Users, label: "Consultations", value: doctor.consultations.toLocaleString("en-GB") },
    { icon: Clock, label: "Usually replies", value: doctor.responseTime },
  ];

  return (
    <>
      <PageHeader backHref="/patient/doctors" title={doctor.name} description={doctor.title} />

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0 space-y-6">
          <Card className="p-5 sm:p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <Avatar name={doctor.name} src={doctor.avatar} hue={doctor.hue} size="xl" />
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="primary">
                    <BadgeCheck /> Verified specialist
                  </Badge>
                  <AvailabilityLabel value={doctor.availability} />
                </div>
                <p className="mt-2 font-medium text-foreground">{doctor.specialization}</p>
                <Rating value={doctor.rating} count={doctor.reviewCount} className="mt-1" />
              </div>
            </div>
            <dl className="mt-6 grid grid-cols-3 gap-3">
              {facts.map(({ icon: Icon, label, value }) => (
                <div key={label} className="rounded-2xl bg-surface-2 p-3">
                  <Icon className="size-4 text-primary" />
                  <dt className="mt-2 text-xs text-muted-foreground">{label}</dt>
                  <dd className="text-sm font-semibold text-foreground">{value}</dd>
                </div>
              ))}
            </dl>
          </Card>

          <Card className="space-y-6 p-5 sm:p-6">
            <section>
              <h2 className="font-serif text-xl font-semibold text-foreground">About</h2>
              <p className="mt-2 leading-relaxed text-muted-foreground">{doctor.about}</p>
            </section>
            <section>
              <h3 className="text-sm font-semibold text-foreground">Areas of focus</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {doctor.focusAreas.map((area) => (
                  <Badge key={area} tone="secondary" className="py-1 text-sm">{area}</Badge>
                ))}
              </div>
            </section>
            <section className="grid gap-4 sm:grid-cols-2">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Qualifications</h3>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  {doctor.qualifications.map((q) => (
                    <li key={q} className="flex items-center gap-2"><Award className="size-4 text-gold" /> {q}</li>
                  ))}
                </ul>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <h3 className="text-sm font-semibold text-foreground">Practice</h3>
                <p className="flex items-center gap-2"><Building2 className="size-4 text-primary" /> {doctor.clinic}, {doctor.city}</p>
                <p className="flex items-center gap-2"><Languages className="size-4 text-primary" /> {doctor.languages.join(", ")}</p>
                <p className="flex items-center gap-2"><ShieldCheck className="size-4 text-primary" /> {doctor.registrationNumber}</p>
              </div>
            </section>
            <ConsultationHours doctor={doctor} />
          </Card>

          <ReviewSection doctorId={doctor.id} doctorName={doctor.name} reviews={reviews} mine={mine} />
        </div>

        <div className="space-y-4 lg:sticky lg:top-10 lg:self-start">
          <BookingCta doctor={doctor} />
          <Disclaimer>Chat guidance is informational and does not replace an in-person examination or diagnosis.</Disclaimer>
          <ReportDoctor doctorId={doctor.id} doctorName={doctor.name} />
        </div>
      </div>
    </>
  );
}
