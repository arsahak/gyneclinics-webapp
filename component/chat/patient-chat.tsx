"use client";

import { format, formatDistanceStrict } from "date-fns";
import { CalendarCheck, Clock, RotateCcw } from "lucide-react";
import { AvailabilityLabel } from "@/component/doctors/availability";
import { ConsultationFee } from "@/component/shared/region";
import { ButtonLink } from "@/component/ui/button";
import { CONSULTATION_POLICY } from "@/lib/consultation";
import { useDoctorConsultation } from "@/lib/hooks";
import type { Doctor } from "@/lib/types";
import { ChatThread } from "./chat-thread";

export function PatientChat({ doctor }: { doctor: Doctor }) {
  const { now, current } = useDoctorConsultation(doctor.id);
  const state = current?.state ?? null;
  const bookHref = `/patient/doctors/${doctor.id}/book`;

  let statusBar: React.ReactNode = null;
  let lockedComposer: React.ReactNode = null;

  if (current && state === "active") {
    statusBar = (
      <StatusBar tone="bg-success-soft text-success" icon={Clock}>
        Consultation in progress · open for {formatDistanceStrict(current.sessionEndsAt, now)} more
      </StatusBar>
    );
  } else if (current && state === "follow_up") {
    statusBar = (
      <StatusBar tone="bg-gold-soft text-gold" icon={RotateCcw}>
        Free follow-up on the same concern until {format(current.followUpEndsAt, "d MMM")}
      </StatusBar>
    );
  } else if (current && state === "upcoming") {
    lockedComposer = (
      <Locked
        title={`Chat opens ${format(current.startsAt, "EEEE d MMM 'at' HH:mm")}`}
        body={`${doctor.name} will reply during your consultation. Your concern has already been shared.`}
      />
    );
  } else {
    lockedComposer = (
      <Locked
        title={state ? "This consultation has ended" : `Book a consultation to chat with ${doctor.name}`}
        body={
          state
            ? "Book again to continue the conversation. Your previous messages stay here."
            : `Includes ${CONSULTATION_POLICY.sessionHours} hours of chat and ${CONSULTATION_POLICY.followUpDays} days of free follow-up.`
        }
        action={
          <ButtonLink href={bookHref}>
            <CalendarCheck /> {state ? "Book again" : "Book"} · <ConsultationFee baseFeeGBP={doctor.feeGBP} />
          </ButtonLink>
        }
      />
    );
  }

  return (
    <ChatThread
      conversationId={doctor.id}
      me="patient"
      backHref="/patient/messages"
      counterpart={{
        name: doctor.name,
        hue: doctor.hue,
        subtitle: <AvailabilityLabel value={doctor.availability} />,
      }}
      statusBar={statusBar}
      lockedComposer={lockedComposer}
    />
  );
}

function StatusBar({ tone, icon: Icon, children }: { tone: string; icon: typeof Clock; children: React.ReactNode }) {
  return (
    <div className={`flex items-center gap-2 px-4 py-2 text-xs font-medium ${tone}`}>
      <Icon className="size-3.5 shrink-0" />
      {children}
    </div>
  );
}

function Locked({ title, body, action }: { title: string; body: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:text-left">
      <div className="flex-1">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{body}</p>
      </div>
      {action}
    </div>
  );
}
