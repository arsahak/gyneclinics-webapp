import { BadgeCheck, Briefcase } from "lucide-react";
import Link from "next/link";
import { ConsultationFee } from "@/component/shared/region";
import { Badge } from "@/component/ui/badge";
import type { Doctor } from "@/lib/types";
import { AvailabilityLabel } from "./availability";
import { Rating } from "./rating";

const PORTRAIT_POSITIONS: Record<string, string> = {
  "amelia-hart": "0% 11%",
  "nadia-rahman": "33.333% 11%",
  "sophie-clarke": "66.667% 11%",
  "priya-menon": "100% 11%",
  "grace-okafor": "0% 89%",
  "laila-haddad": "33.333% 89%",
  "emma-lindqvist": "66.667% 89%",
  "farah-siddiqui": "100% 89%",
};

export function DoctorCard({ doctor, compact = false }: { doctor: Doctor; compact?: boolean }) {
  const coverEnd = (doctor.hue + 38) % 360;
  const portraitPosition = PORTRAIT_POSITIONS[doctor.id] ?? "0% 0%";

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
        <span
          aria-hidden
          className="absolute bottom-0 left-1/2 size-[5.5rem] -translate-x-1/2 translate-y-1/2 rounded-full bg-surface ring-4 ring-surface shadow-[0_10px_26px_rgb(0_0_0/0.2)]"
          style={{
            backgroundImage: "url('/brand/doctor-portraits.png')",
            backgroundPosition: portraitPosition,
            backgroundSize: "400% auto",
          }}
        />
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
          <span className="text-muted-foreground">
            <ConsultationFee baseFeeGBP={doctor.feeGBP} className="font-semibold text-foreground" />
            {doctor.feeGBP > 0 && " / consultation"}
          </span>
        </div>
      </div>
    </Link>
  );
}
