"use client";

import { format, parseISO } from "date-fns";
import { ArrowRight, BadgeCheck, Bell, CalendarClock, Clock, MessagesSquare, Star, TrendingUp, Wallet } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Stars } from "@/component/doctors/rating";
import { useAccount } from "@/component/shared/account-provider";
import { Avatar } from "@/component/ui/avatar";
import { Badge } from "@/component/ui/badge";
import { Card, CardBody, CardHeader } from "@/component/ui/card";
import { Switch } from "@/component/ui/field";
import { formatMoney, REGION_LIST, regionalFee } from "@/lib/locale/regions";
import { STATE_LABEL, timeline } from "@/lib/consultation";
import { useChat } from "@/lib/store/chat";
import { useConsultations } from "@/lib/store/consultations";
import type { PatientThread, Review } from "@/lib/types";

export function DoctorDashboard({ doctorId, threads, reviews }: { doctorId: string; threads: PatientThread[]; reviews: Review[] }) {
  const { doctor } = useAccount();
  // Not saved to the backend yet; resets on reload.
  const [online, setOnline] = useState(true);
  const conversations = useChat((s) => s.conversations);
  const [now] = useState(() => new Date());
  const allBookings = useConsultations((s) => s.consultations);
  if (!doctor) return null;

  // Bookings arrive confirmed (auto-booking) — the doctor just sees what's coming up.
  const bookings = allBookings
    .filter((c) => c.doctorId === doctorId)
    .map((c) => ({ c, t: timeline(c, now) }))
    .filter(({ t }) => t.state === "upcoming" || t.state === "active")
    .sort((a, b) => a.c.startsAt.localeCompare(b.c.startsAt));

  const awaiting = threads.filter((t) => t.status !== "closed" && conversations[t.id]?.at(-1)?.from === "patient");
  const active = threads.filter((t) => t.status !== "closed");
  const avgRating = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  const consultations = 38;
  // Existing browser sessions created before availability moved into onboarding may not have this field yet.
  const availability = doctor.consultationAvailability ?? {
    weekdays: [0, 1, 2, 3, 4],
    startTime: "09:00",
    endTime: "17:00",
    slotMinutes: 30,
    instantChat: true,
  };
  const todayIndex = (now.getDay() + 6) % 7;
  const availableToday = availability.weekdays.includes(todayIndex);

  const stats = [
    { icon: MessagesSquare, label: "Active chats", value: String(active.length), tone: "bg-primary-soft text-primary" },
    { icon: Clock, label: "Awaiting your reply", value: String(awaiting.length), tone: "bg-accent-soft text-accent" },
    { icon: Star, label: "Average rating", value: avgRating ? avgRating.toFixed(1) : "—", tone: "bg-gold-soft text-gold" },
    { icon: Wallet, label: "Earnings this month", value: formatMoney(consultations * doctor.feeGBP * 0.8, "GBP"), tone: "bg-secondary-soft text-secondary" },
  ];

  return (
    <>
      <section className="relative mb-6 overflow-hidden rounded-[2rem] border border-primary/15 bg-gradient-to-br from-primary-soft via-surface to-secondary-soft/70 p-5 shadow-[var(--shadow-soft)] sm:p-7">
        <div aria-hidden className="absolute -top-20 -right-12 size-48 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">{format(now, "EEEE, d MMMM")}</p>
            <h1 className="mt-1 font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Good to see you, {doctor.fullName.replace(/^Dr\.\s*/i, "").split(" ")[0]}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge tone="primary"><BadgeCheck /> Verified specialist</Badge>
              <Link href="/doctor/availability" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
                <CalendarClock className="size-4" />
                {availableToday ? `Available today · ${availability.startTime}–${availability.endTime}` : "Not available today"}
              </Link>
            </div>
          </div>
          <div className="flex w-full items-center gap-3 lg:w-auto">
            <Link
              href="/doctor/messages"
              aria-label={awaiting.length ? `${awaiting.length} conversations need your attention` : "Notifications"}
              title="Notifications"
              className="relative inline-flex size-11 shrink-0 items-center justify-center rounded-2xl border border-white/80 bg-surface/80 text-muted-foreground shadow-[var(--shadow-soft)] backdrop-blur transition-colors hover:border-primary/30 hover:bg-primary-soft hover:text-primary"
            >
              <Bell className="size-5" />
              {awaiting.length > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex size-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground ring-2 ring-primary-soft">
                  {awaiting.length > 9 ? "9+" : awaiting.length}
                </span>
              )}
            </Link>
            <div className="w-full rounded-2xl border border-white/80 bg-surface/80 p-4 shadow-[var(--shadow-soft)] backdrop-blur sm:w-80">
              <Switch
                checked={online}
                onChange={setOnline}
                label={online ? "You're online" : "You're offline"}
                description={online ? "Patients can start new chats" : "New chats are paused"}
              />
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map(({ icon: Icon, label, value, tone }) => (
          <Card key={label} className="border-border/80 p-4 transition-shadow hover:shadow-[var(--shadow-lift)] sm:p-5">
            <span className={`inline-flex size-10 items-center justify-center rounded-2xl ${tone}`}>
              <Icon className="size-5" />
            </span>
            <p className="mt-3 text-xs text-muted-foreground sm:text-sm">{label}</p>
            <p className="text-xl font-semibold text-foreground sm:text-2xl">{value}</p>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(21rem,0.85fr)]">
        <Card>
          <CardHeader
            title="Needs your attention"
            description="Patient conversations that are waiting for your reply."
            action={
              <Link href="/doctor/messages" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                All <ArrowRight className="size-4" />
              </Link>
            }
          />
          <CardBody>
            {awaiting.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">You&apos;re all caught up.</p>
            ) : (
              <ul className="space-y-2">
                {awaiting.map((t) => {
                  const last = conversations[t.id]?.at(-1);
                  return (
                    <li key={t.id}>
                      <Link href={`/doctor/messages/${t.id}`} className="flex items-center gap-3 rounded-2xl p-3 transition-colors hover:bg-surface-2">
                        <Avatar name={t.patientName} hue={t.hue} size="sm" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-foreground">
                            {t.patientName} <span className="font-normal text-muted-foreground">· {t.age} · {t.topic}</span>
                          </p>
                          <p className="truncate text-sm text-muted-foreground">{last?.text}</p>
                        </div>
                        {last && <span className="shrink-0 text-xs text-muted-foreground">{format(parseISO(last.at), "HH:mm")}</span>}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardBody>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Booked consultations" description="Confirmed automatically when the patient pays." />
            <CardBody>
              {bookings.length === 0 ? (
                <p className="text-sm text-muted-foreground">No upcoming bookings.</p>
              ) : (
                <ul className="space-y-3">
                  {bookings.map(({ c, t }) => (
                    <li key={c.id} className="flex items-center gap-3">
                      <span className="inline-flex size-10 shrink-0 flex-col items-center justify-center rounded-xl bg-primary-soft text-primary">
                        <span className="text-[10px] leading-none font-semibold uppercase">{format(t.startsAt, "MMM")}</span>
                        <span className="text-sm leading-tight font-bold">{format(t.startsAt, "d")}</span>
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{c.concern}</p>
                        <p className="text-xs text-muted-foreground">
                          {c.mode === "instant" ? "Instant chat" : format(t.startsAt, "HH:mm")} · {c.id}
                        </p>
                      </div>
                      <Badge tone={STATE_LABEL[t.state].tone}>{STATE_LABEL[t.state].label}</Badge>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="Your fee by region" description={`Base fee ${formatMoney(doctor.feeGBP, "GBP")} · set in Profile`} />
            <CardBody>
              <ul className="space-y-1.5 text-sm">
                {REGION_LIST.map((r) => (
                  <li key={r.id} className="flex justify-between">
                    <span className="text-muted-foreground">{r.name}</span>
                    <span className="font-medium text-foreground tabular-nums">{regionalFee(doctor.feeGBP, r.id).label}</span>
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>
          <Card>
            <CardHeader
              title="Latest review"
              action={
                <Link href="/doctor/reviews" className="text-sm font-medium text-primary hover:underline">
                  View all
                </Link>
              }
            />
            <CardBody>
              {reviews[0] ? (
                <>
                  <Stars value={reviews[0].rating} />
                  <p className="mt-2 text-sm text-foreground">“{reviews[0].text}”</p>
                  <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                    <TrendingUp className="size-3.5 text-success" /> {consultations} consultations this month
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No reviews yet.</p>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  );
}
