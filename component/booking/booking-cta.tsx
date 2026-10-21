"use client";

import { format } from "date-fns";
import { CalendarCheck, MessageCircle } from "lucide-react";
import { ConsultationFee, RegionPricingNote } from "@/component/shared/region";
import { Badge } from "@/component/ui/badge";
import { ButtonLink } from "@/component/ui/button";
import { Card } from "@/component/ui/card";
import { messagingFor, STATE_LABEL } from "@/lib/consultation";
import { useDoctorConsultation } from "@/lib/hooks";
import type { Doctor } from "@/lib/types";
import { IncludedList } from "./booking-flow";

/**
 * Contact card on the doctor profile: free messages and/or a paid chat
 * consultation, as the doctor chose. With an open consultation it links to the chat.
 */
export function BookingCta({ doctor }: { doctor: Doctor }) {
  const { current } = useDoctorConsultation(doctor.id);
  const open = current && current.state !== "closed" && current.state !== "refunded" ? current : null;
  const messaging = messagingFor(doctor);

  const freeMessages = messaging.free && (
    <ButtonLink
      href={`/patient/messages/${doctor.id}`}
      size="lg"
      variant={messaging.consultation ? "outline" : undefined}
      className="w-full"
    >
      <MessageCircle /> Message for free
    </ButtonLink>
  );

  if (!messaging.consultation && !open) {
    return (
      <Card className="p-5 sm:p-6">
        <p className="text-sm text-muted-foreground">Messages</p>
        <p className="mt-1 text-3xl font-semibold tracking-tight text-foreground">Free</p>
        <p className="mt-3 text-sm text-muted-foreground">
          {doctor.name} answers messages for free. Replies come when they&apos;re available, so this isn&apos;t for
          emergencies.
        </p>
        <div className="mt-6">{freeMessages}</div>
      </Card>
    );
  }

  return (
    <Card className="p-5 sm:p-6">
      <p className="text-sm text-muted-foreground">Chat consultation</p>
      <p className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
        <ConsultationFee baseFeeGBP={doctor.feeGBP} />
      </p>
      <RegionPricingNote />
      {current && !open && (
        <p className="mt-3 flex items-center gap-2 rounded-2xl bg-surface-2 px-3 py-2.5 text-sm text-muted-foreground">
          <CalendarCheck className="size-4 shrink-0 text-primary" />
          You consulted {doctor.name} on {format(current.startsAt, "d MMM yyyy")}.
        </p>
      )}
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
        <div className="mt-6 space-y-3">
          <ButtonLink href={`/patient/doctors/${doctor.id}/book`} size="lg" className="w-full">
            <CalendarCheck /> {doctor.feeGBP > 0 ? "Book consultation" : "Book free consultation"}
          </ButtonLink>
          {freeMessages && (
            <>
              <p className="text-center text-xs text-muted-foreground">or send a quick question for free</p>
              {freeMessages}
            </>
          )}
        </div>
      )}
    </Card>
  );
}
