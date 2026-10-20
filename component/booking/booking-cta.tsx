"use client";

import { format } from "date-fns";
import { CalendarCheck, MessageCircle } from "lucide-react";
import { ConsultationFee, RegionPricingNote } from "@/component/shared/region";
import { Badge } from "@/component/ui/badge";
import { ButtonLink } from "@/component/ui/button";
import { Card } from "@/component/ui/card";
import { STATE_LABEL } from "@/lib/consultation";
import { useDoctorConsultation } from "@/lib/hooks";
import type { Doctor } from "@/lib/types";
import { IncludedList } from "./booking-flow";

/** Price card on the doctor profile. The action depends on the patient's consultation state. */
export function BookingCta({ doctor }: { doctor: Doctor }) {
  const { current } = useDoctorConsultation(doctor.id);
  const open = current && current.state !== "closed" && current.state !== "refunded" ? current : null;

  return (
    <Card className="p-5 sm:p-6">
      <p className="text-sm text-muted-foreground">Chat consultation</p>
      <p className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
        <ConsultationFee baseFeeGBP={doctor.feeGBP} />
      </p>
      <RegionPricingNote />
      <IncludedList />

      {open ? (
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between gap-2 rounded-2xl bg-surface-2 px-3 py-2.5 text-sm">
            <Badge tone={STATE_LABEL[open.state].tone}>{STATE_LABEL[open.state].label}</Badge>
            <span className="text-muted-foreground">
              {open.state === "upcoming"
                ? `Starts ${format(open.startsAt, "EEE d MMM, HH:mm")}`
                : open.state === "active"
                  ? `Open until ${format(open.sessionEndsAt, "d MMM, HH:mm")}`
                  : `Follow-up until ${format(open.followUpEndsAt, "d MMM")}`}
            </span>
          </div>
          <ButtonLink href={`/patient/messages/${doctor.id}`} size="lg" className="w-full">
            <MessageCircle /> Open chat
          </ButtonLink>
        </div>
      ) : (
        <ButtonLink href={`/patient/doctors/${doctor.id}/book`} size="lg" className="mt-6 w-full">
          <CalendarCheck /> {doctor.feeGBP > 0 ? "Book consultation" : "Book free consultation"}
        </ButtonLink>
      )}
    </Card>
  );
}
