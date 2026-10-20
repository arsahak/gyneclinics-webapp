"use client";

import { format } from "date-fns";
import { CalendarCheck, CalendarClock, MessageCircle, ReceiptText, Zap } from "lucide-react";
import { useMemo, useState } from "react";
import { EmptyState } from "@/component/shared/empty-state";
import { Avatar } from "@/component/ui/avatar";
import { Badge } from "@/component/ui/badge";
import { Button, ButtonLink } from "@/component/ui/button";
import { Card } from "@/component/ui/card";
import { Tabs } from "@/component/ui/tabs";
import { STATE_LABEL, timeline } from "@/lib/consultation";
import { useNow } from "@/lib/hooks";
import { formatMoney } from "@/lib/locale/regions";
import { useConsultations } from "@/lib/store/consultations";
import type { Doctor } from "@/lib/types";
import { ReceiptDialog } from "./receipt-dialog";

export function ConsultationList({ doctors }: { doctors: Doctor[] }) {
  const now = useNow();
  const consultations = useConsultations((s) => s.consultations);
  const [tab, setTab] = useState<"current" | "past">("current");
  const [receiptId, setReceiptId] = useState<string | null>(null);

  const rows = useMemo(
    () =>
      consultations
        .map((c) => ({ c, t: timeline(c, now), doctor: doctors.find((d) => d.id === c.doctorId) }))
        .filter((r) => r.doctor)
        .sort((a, b) => b.c.startsAt.localeCompare(a.c.startsAt)),
    [consultations, doctors, now],
  );
  const current = rows.filter((r) => r.t.state === "upcoming" || r.t.state === "active" || r.t.state === "follow_up");
  const past = rows.filter((r) => r.t.state === "closed" || r.t.state === "refunded");
  const visible = tab === "current" ? current : past;
  const receipt = rows.find((r) => r.c.id === receiptId);

  return (
    <>
      <Tabs
        className="mb-6"
        value={tab}
        onChange={setTab}
        options={[
          { value: "current", label: `Current (${current.length})` },
          { value: "past", label: `Past (${past.length})` },
        ]}
      />
      {visible.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title={tab === "current" ? "No current consultations" : "No past consultations"}
          description="Book a consultation with a specialist to start a private chat."
          action={<ButtonLink href="/patient/doctors">Find a specialist</ButtonLink>}
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {visible.map(({ c, t, doctor }) => {
            const status = STATE_LABEL[t.state];
            const ModeIcon = c.mode === "instant" ? Zap : CalendarClock;
            return (
              <Card key={c.id} className="p-5">
                <div className="flex items-start gap-3">
                  <Avatar name={doctor!.name} hue={doctor!.hue} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate font-semibold text-foreground">{doctor!.name}</p>
                      <Badge tone={status.tone}>{status.label}</Badge>
                    </div>
                    <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                      <ModeIcon className="size-3.5" />
                      {c.mode === "instant" ? "Instant chat" : "Scheduled"} · {format(t.startsAt, "EEE d MMM, HH:mm")}
                    </p>
                  </div>
                </div>
                <p className="mt-4 line-clamp-2 rounded-2xl bg-surface-2 p-3 text-sm text-muted-foreground">“{c.concern}”</p>
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
                    <dt className="text-muted-foreground">{t.state === "follow_up" ? "Follow-up until" : t.state === "active" ? "Open until" : "Chat"}</dt>
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
                <div className="mt-4 flex gap-2 border-t border-border pt-4">
                  <ButtonLink href={`/patient/messages/${c.doctorId}`} size="sm" variant={t.state === "closed" ? "outline" : "primary"}>
                    <MessageCircle /> {t.state === "closed" || t.state === "refunded" ? "View chat" : "Open chat"}
                  </ButtonLink>
                  <Button size="sm" variant="ghost" onClick={() => setReceiptId(c.id)}>
                    <ReceiptText /> Receipt
                  </Button>
                  {(t.state === "closed" || t.state === "refunded") && (
                    <ButtonLink href={`/patient/doctors/${c.doctorId}/book`} size="sm" variant="outline">
                      Book again
                    </ButtonLink>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
      {receipt && (
        <ReceiptDialog consultation={receipt.c} doctor={receipt.doctor!} open onClose={() => setReceiptId(null)} />
      )}
    </>
  );
}
