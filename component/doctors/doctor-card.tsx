import { format } from "date-fns";
import { BadgeCheck, Briefcase, CalendarCheck, MessageCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ConsultationFee } from "@/component/shared/region";
import { Badge } from "@/component/ui/badge";
import { type ConsultationTimeline, messagingFor } from "@/lib/consultation";
import type { Doctor } from "@/lib/types";
import { initials } from "@/lib/utils";
import { AvailabilityLabel } from "./availability";
import { Rating } from "./rating";


/** Where the patient's consultation with this doctor is, in a few words. */
function consultationLabel(c: ConsultationTimeline) {
  switch (c.state) {
    case "active":
      return { text: "Consultation in progress", className: "bg-success text-white" };
    case "upcoming":
      return { text: `Booked · ${format(c.startsAt, "EEE d MMM, HH:mm")}`, className: "bg-primary text-primary-foreground" };
    case "follow_up":
      return { text: `Free follow-up until ${format(c.followUpEndsAt, "d MMM")}`, className: "bg-gold text-white" };
    default:
      return { text: `Consulted · ${format(c.startsAt, "d MMM yyyy")}`, className: "bg-surface text-foreground" };
  }
}

export function DoctorCard({
  doctor,
  compact = false,
  consultation,
}: {
  doctor: Doctor;
  compact?: boolean;
  /** The patient's consultation with this doctor, if they've booked one. */
  consultation?: ConsultationTimeline | null;
}) {
  const consulted = consultation ? consultationLabel(consultation) : null;
  const coverEnd = (doctor.hue + 38) % 360;
  const messaging = messagingFor(doctor);

  return (
    <Link
      href={`/patient/doctors/${doctor.id}`}
      className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-surface transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]"
    >
      <div
        className="relative z-10 h-28"
        style={{ background: `linear-gradient(135deg, hsl(${doctor.hue} 45% 34%), hsl(${coverEnd} 48% 48%))` }}
      >
        <div aria-hidden className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-10 -right-8 size-32 rounded-full bg-white/10 blur-xl" />
          <div className="absolute -bottom-12 -left-8 size-28 rounded-full bg-white/10 blur-xl" />
        </div>
        {consulted && (
          <span
            className={`absolute top-3 left-3 inline-flex max-w-[calc(100%-1.5rem)] items-center gap-1.5 truncate rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm ${consulted.className}`}
          >
            <CalendarCheck className="size-3.5 shrink-0" /> {consulted.text}
          </span>
        )}
        {/* The doctor's own photo, or their initials. */}
        <span className="absolute bottom-0 left-1/2 size-[5.5rem] -translate-x-1/2 translate-y-1/2 overflow-hidden rounded-full bg-surface ring-4 ring-surface shadow-[0_10px_26px_rgb(0_0_0/0.2)]">
          {doctor.avatar ? (
            <Image src={doctor.avatar} alt="" width={88} height={88} className="size-full object-cover" />
          ) : (
            <span
              aria-hidden
              className="inline-flex size-full items-center justify-center text-2xl font-semibold text-white"
              style={{ background: `linear-gradient(135deg, hsl(${doctor.hue} 55% 45%), hsl(${coverEnd} 50% 38%))` }}
            >
              {initials(doctor.name.replace(/^Dr\.?\s*/i, ""))}
            </span>
          )}
        </span>
      </div>

      <div className="flex flex-1 flex-col px-5 pt-14 pb-5">
        <div className="min-w-0">
          <div className="flex items-center justify-center gap-1.5 text-center">
            <h3 className="truncate font-semibold text-foreground group-hover:text-primary">{doctor.name}</h3>
            <BadgeCheck className="size-4 shrink-0 text-primary" aria-label="Verified" />
          </div>
          <p className="mt-0.5 truncate text-center text-sm text-muted-foreground">{doctor.title}</p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
            <Rating value={doctor.rating} count={doctor.reviewCount} />
            <AvailabilityLabel value={doctor.availability} />
          </div>
          {messaging.free && (
            <div className="mt-2 flex justify-center">
              <Badge tone="success">
                <MessageCircle /> Free messages
              </Badge>
            </div>
          )}
        </div>
        {!compact && (
          <div className="mt-4 flex min-h-7 flex-wrap justify-center gap-1.5">
            {doctor.focusAreas.slice(0, 3).map((area) => (
              <Badge key={area}>{area}</Badge>
            ))}
          </div>
        )}
        <div className="mt-auto flex items-center justify-between border-t border-border pt-4 text-sm">
          <span className="inline-flex items-center gap-1.5 text-muted-foreground">
            <Briefcase className="size-4" /> {doctor.experienceYears} yrs exp.
          </span>
          {messaging.consultation ? (
            <span className="text-muted-foreground">
              <ConsultationFee baseFeeGBP={doctor.feeGBP} className="font-semibold text-foreground" />
              {doctor.feeGBP > 0 && " / consultation"}
            </span>
          ) : (
            <span className="font-semibold text-success">Free messages only</span>
          )}
        </div>
      </div>
    </Link>
  );
}
