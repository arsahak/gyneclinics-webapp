"use client";

import { differenceInCalendarDays, format, formatDistanceStrict } from "date-fns";
import { CalendarCheck, CalendarClock, Clock, MessageCircle, ReceiptText, Zap } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { EmptyState } from "@/component/shared/empty-state";
import { Avatar } from "@/component/ui/avatar";
import { Badge } from "@/component/ui/badge";
import { Button, ButtonLink } from "@/component/ui/button";
import { Card } from "@/component/ui/card";
import { Tabs } from "@/component/ui/tabs";
import { consultationDoctor, type ConsultationDoctor, type ConsultationTimeline, STATE_LABEL, timeline } from "@/lib/consultation";
import { useNow } from "@/lib/hooks";
import { formatMoney } from "@/lib/locale/regions";
import { useConsultations } from "@/lib/store/consultations";
import type { Consultation, Doctor } from "@/lib/types";
import { ReceiptDialog } from "./receipt-dialog";

type Tab = "upcoming" | "ongoing" | "past";

interface Row {
  c: Consultation;
  t: ConsultationTimeline;
  doctor: ConsultationDoctor;
}

const EMPTY: Record<Tab, { title: string; description: string }> = {
  upcoming: { title: "No upcoming consultations", description: "Book a time with a specialist and it will show here." },
  ongoing: { title: "No open chats", description: "Consultations you're chatting in, or in free follow-up, show here." },
  past: { title: "No past consultations", description: "Finished consultations and their receipts show here." },
};

/** "Today at 19:30", "Tomorrow at 09:00" or "Thu 24 Oct at 14:00". */
function startLabel(startsAt: Date, now: Date) {
  const days = differenceInCalendarDays(startsAt, now);
  const time = format(startsAt, "HH:mm");
  if (days === 0) return `Today at ${time}`;
  if (days === 1) return `Tomorrow at ${time}`;
  return format(startsAt, "EEE d MMM 'at' HH:mm");
}

export function ConsultationList({ doctors }: { doctors: Doctor[] }) {
  const now = useNow();
  const consultations = useConsultations((s) => s.consultations);
  const [chosenTab, setTab] = useState<Tab | null>(null);
  const [receiptId, setReceiptId] = useState<string | null>(null);

  const rows = useMemo<Row[]>(
    () => consultations.map((c) => ({ c, t: timeline(c, now), doctor: consultationDoctor(c, doctors) })),
    [consultations, doctors, now],
  );
  const groups: Record<Tab, Row[]> = {
    // Soonest first.
    upcoming: rows.filter((r) => r.t.state === "upcoming").sort((a, b) => a.c.startsAt.localeCompare(b.c.startsAt)),
    ongoing: rows
      .filter((r) => r.t.state === "active" || r.t.state === "follow_up")
      .sort((a, b) => b.c.startsAt.localeCompare(a.c.startsAt)),
    past: rows
      .filter((r) => r.t.state === "closed" || r.t.state === "refunded")
      .sort((a, b) => b.c.startsAt.localeCompare(a.c.startsAt)),
  };
  // Open on upcoming, unless there's nothing there and something is ongoing.
  const tab = chosenTab ?? (groups.upcoming.length || !groups.ongoing.length ? "upcoming" : "ongoing");
  const visible = groups[tab];
  const receipt = rows.find((r) => r.c.id === receiptId);

  return (
    <>
      <Tabs
        className="mb-6"
        value={tab}
        onChange={setTab}
        options={[
          { value: "upcoming", label: `Upcoming (${groups.upcoming.length})` },
          { value: "ongoing", label: `Ongoing (${groups.ongoing.length})` },
          { value: "past", label: `Past (${groups.past.length})` },
        ]}
      />
      {visible.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title={EMPTY[tab].title}
          description={EMPTY[tab].description}
          action={<ButtonLink href="/patient/doctors">Find a specialist</ButtonLink>}
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {visible.map((row) => (
            <ConsultationCard key={row.c.id} row={row} now={now} onReceipt={() => setReceiptId(row.c.id)} />
          ))}
        </div>
      )}
      {receipt && (
        <ReceiptDialog
          consultation={receipt.c}
          doctor={receipt.doctor}
          open
          onClose={() => setReceiptId(null)}
        />
      )}
    </>
  );
}

function ConsultationCard({ row, now, onReceipt }: { row: Row; now: Date; onReceipt: () => void }) {
  const { c, t, doctor } = row;
  const status = STATE_LABEL[t.state];
  const ModeIcon = c.mode === "instant" ? Zap : CalendarClock;
  const ended = t.state === "closed" || t.state === "refunded";

  const name = doctor.listed ? (
    <Link href={`/patient/doctors/${doctor.id}`} className="truncate font-semibold text-foreground hover:text-primary">
      {doctor.name}
    </Link>
  ) : (
    <p className="truncate font-semibold text-foreground">{doctor.name}</p>
  );

  return (
    <Card className="p-5">
      <div className="flex items-start gap-3">
        <Avatar name={doctor.name} src={doctor.avatar} hue={doctor.hue} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            {name}
            <Badge tone={status.tone}>{status.label}</Badge>
          </div>
          <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
            <ModeIcon className="size-3.5" />
            {c.mode === "instant" ? "Instant chat" : "Scheduled"}
            {doctor.title && ` · ${doctor.title}`}
          </p>
        </div>
      </div>

      {t.state === "upcoming" ? (
        // When it starts, front and centre.
        <div className="mt-4 flex items-center gap-3 rounded-2xl bg-primary-soft p-4">
          <span className="inline-flex size-11 shrink-0 flex-col items-center justify-center rounded-xl bg-surface text-primary shadow-sm">
            <span className="text-[10px] leading-none font-semibold uppercase">{format(t.startsAt, "MMM")}</span>
            <span className="text-lg leading-tight font-bold">{format(t.startsAt, "d")}</span>
          </span>
          <div className="min-w-0">
            <p className="font-semibold text-foreground">{startLabel(t.startsAt, now)}</p>
            <p className="flex items-center gap-1.5 text-sm text-primary">
              <Clock className="size-3.5" /> Starts in {formatDistanceStrict(t.startsAt, now)}
            </p>
          </div>
        </div>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">{format(t.startsAt, "EEE d MMM yyyy, HH:mm")}</p>
      )}

      <p className="mt-3 line-clamp-2 rounded-2xl bg-surface-2 p-3 text-sm text-muted-foreground">“{c.concern}”</p>

      <dl className="mt-4 grid grid-cols-3 gap-2 text-xs">
        <div>
          <dt className="text-muted-foreground">Booking</dt>
          <dd className="font-mono text-foreground">{c.id}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Paid</dt>
          <dd className="text-foreground">{c.payment.amount ? formatMoney(c.payment.amount, c.payment.currency) : "Free"}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">
            {t.state === "follow_up" ? "Follow-up until" : t.state === "active" ? "Open until" : "Chat"}
          </dt>
          <dd className="text-foreground">
            {t.state === "follow_up"
              ? format(t.followUpEndsAt, "d MMM")
              : t.state === "active"
                ? format(t.sessionEndsAt, "d MMM, HH:mm")
                : t.state === "upcoming"
                  ? "Opens at start"
                  : "Closed"}
          </dd>
        </div>
      </dl>

      <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
        {doctor.listed ? (
          <ButtonLink href={`/patient/messages/${c.doctorId}`} size="sm" variant={ended || t.state === "upcoming" ? "outline" : "primary"}>
            <MessageCircle /> {ended ? "View chat" : t.state === "upcoming" ? "Chat details" : "Open chat"}
          </ButtonLink>
        ) : (
          <span className="inline-flex items-center text-xs text-muted-foreground">This doctor is no longer listed.</span>
        )}
        <Button size="sm" variant="ghost" onClick={onReceipt}>
          <ReceiptText /> Receipt
        </Button>
        {ended && doctor.listed && (
          <ButtonLink href={`/patient/doctors/${c.doctorId}/book`} size="sm" variant="outline">
            Book again
          </ButtonLink>
        )}
      </div>
    </Card>
  );
}
