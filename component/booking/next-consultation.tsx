"use client";

import { format } from "date-fns";
import { CalendarCheck, MessageCircle } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/component/ui/badge";
import { Card } from "@/component/ui/card";
import { STATE_LABEL, timeline } from "@/lib/consultation";
import { useNow } from "@/lib/hooks";
import { useConsultations } from "@/lib/store/consultations";
import type { Doctor } from "@/lib/types";

/** Home card for the next upcoming or in-progress consultation. */
export function NextConsultation({ doctors }: { doctors: Doctor[] }) {
  const now = useNow();
  const consultations = useConsultations((s) => s.consultations);
  const next = consultations
    .map((c) => ({ c, t: timeline(c, now) }))
    .filter(({ t }) => t.state === "upcoming" || t.state === "active")
    .sort((a, b) => a.c.startsAt.localeCompare(b.c.startsAt))[0];
  if (!next) return null;
  const doctor = doctors.find((d) => d.id === next.c.doctorId);
  if (!doctor) return null;
  const status = STATE_LABEL[next.t.state];

  return (
    <Link href={`/patient/messages/${doctor.id}`} className="block">
      <Card className="p-5 transition-shadow hover:shadow-[var(--shadow-lift)]">
        <div className="flex items-start gap-3">
          <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary">
            {next.t.state === "active" ? <MessageCircle className="size-5" /> : <CalendarCheck className="size-5" />}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="font-semibold text-foreground">Consultation</p>
              <Badge tone={status.tone}>{status.label}</Badge>
            </div>
            <p className="mt-1 truncate text-sm text-foreground">{doctor.name}</p>
            <p className="text-sm text-muted-foreground">
              {next.t.state === "active"
                ? `Chat open until ${format(next.t.sessionEndsAt, "d MMM, HH:mm")}`
                : format(next.t.startsAt, "EEEE d MMM 'at' HH:mm")}
            </p>
          </div>
        </div>
      </Card>
    </Link>
  );
}
