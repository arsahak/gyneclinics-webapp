"use client";

import { format, isToday, isTomorrow } from "date-fns";
import { sendChatMessageAction } from "@/app/actions/chatAction";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CalendarClock,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  LockKeyhole,
  MessageCircle,
  MessageSquareText,
  RotateCcw,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { useMemo, useState } from "react";
import { type ConfirmationSms, confirmBookingAction } from "@/app/actions/consultationAction";
import { AvailabilityLabel } from "@/component/doctors/availability";
import { Disclaimer } from "@/component/shared/disclaimer";
import { Avatar } from "@/component/ui/avatar";
import { Badge } from "@/component/ui/badge";
import { Button, ButtonLink } from "@/component/ui/button";
import { Card, CardBody } from "@/component/ui/card";
import { Checkbox, Field, Textarea } from "@/component/ui/field";
import { describeBlocked, scanForContactDetails } from "@/lib/chat-guard";
import { formatMoney } from "@/lib/locale/regions";
import { scheduleOf, slotsFor, type Slot } from "@/lib/availability";
import { canStartInstantly, CONSULTATION_POLICY, timeline } from "@/lib/consultation";
import { useDoctorConsultation, useNow } from "@/lib/hooks";
import { useConsultations } from "@/lib/store/consultations";
import { useRegion, useRegionalFee } from "@/lib/store/locale";
import type { Consultation, ConsultationMode, Doctor } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Checkout } from "./checkout";

const STEPS = ["Time", "Concern", "Payment"] as const;

const DAY_PARTS: Array<{ label: string; test: (hour: number) => boolean }> = [
  { label: "Morning", test: (h) => h < 12 },
  { label: "Afternoon", test: (h) => h >= 12 && h < 17 },
  { label: "Evening", test: (h) => h >= 17 },
];

function groupByDayPart(slots: Slot[]) {
  return DAY_PARTS.map((part) => ({ label: part.label, slots: slots.filter((s) => part.test(s.start.getHours())) })).filter(
    (group) => group.slots.length > 0,
  );
}

function dayName(date: Date) {
  if (isToday(date)) return "Today";
  if (isTomorrow(date)) return "Tomorrow";
  return format(date, "EEE");
}

/** `bookedStarts`: times the backend says are already taken for this doctor. */
export function BookingFlow({ doctor, bookedStarts }: { doctor: Doctor; bookedStarts: string[] }) {
  const now = useNow();
  const { region } = useRegion();
  const fee = useRegionalFee(doctor.feeGBP);
  const free = fee.amount === 0;
  const { current } = useDoctorConsultation(doctor.id);
  const consultations = useConsultations((s) => s.consultations);
  const book = useConsultations((s) => s.book);

  const schedule = useMemo(() => scheduleOf(doctor.schedule), [doctor.schedule]);
  const instantAllowed = canStartInstantly(doctor.availability, schedule);
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState<ConsultationMode>(instantAllowed ? "instant" : "scheduled");
  const [dayChoice, setDayIndex] = useState<number | null>(null);
  const [slot, setSlot] = useState<Date | null>(null);
  const [concern, setConcern] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [booked, setBooked] = useState<Consultation | null>(null);
  // The confirmation text: null while the booking is being saved.
  const [sms, setSms] = useState<ConfirmationSms | null>(null);
  // Why a free booking couldn't be saved.
  const [saveError, setSaveError] = useState<string | null>(null);

  const days = useMemo(
    () =>
      slotsFor(schedule, now, [
        ...bookedStarts,
        // Your own bookings made since the page opened.
        ...consultations.filter((c) => c.doctorId === doctor.id && c.mode === "scheduled").map((c) => c.startsAt),
      ]),
    [doctor.id, schedule, now, consultations, bookedStarts],
  );
  // Start on the first day that still has an open slot.
  const dayIndex = dayChoice ?? Math.max(0, days.findIndex((d) => d.slots.some((s) => s.available)));
  const blocked = scanForContactDetails(concern);
  const openConsultation = current && (current.state === "active" || current.state === "upcoming") ? current : null;

  if (booked) return <Confirmation consultation={booked} doctor={doctor} sms={sms} />;

  if (saveError) {
    return (
      <Card className="mx-auto max-w-xl p-6 text-center sm:p-8">
        <span className="mx-auto inline-flex size-14 items-center justify-center rounded-full bg-danger-soft text-danger">
          <AlertTriangle className="size-7" />
        </span>
        <h2 className="mt-4 font-serif text-2xl font-semibold text-foreground">Your consultation wasn&apos;t booked</h2>
        <p role="alert" className="mt-2 text-sm text-muted-foreground">
          {saveError}
        </p>
        <Button className="mt-6" onClick={() => setSaveError(null)}>
          Try again
        </Button>
      </Card>
    );
  }

  if (checkingOut) {
    return (
      <Checkout
        doctor={doctor}
        mode={mode}
        slot={mode === "scheduled" ? slot : null}
        concern={concern.trim()}
        regionId={region.id}
        feeLabel={fee.label}
        free={free}
        onCancel={(reason) => {
          setCheckingOut(false);
          if (reason === "slot") {
            setSlot(null);
            setStep(0);
          }
        }}
        onSuccess={(result) => {
          const base = {
            doctorId: doctor.id,
            doctor: { name: doctor.name, title: doctor.title, hue: doctor.hue, avatar: doctor.avatar },
            mode,
            concern: concern.trim(),
          };
          // An instant chat opens now: start it with the concern. (A scheduled one opens later.)
          if (mode === "instant") void sendChatMessageAction({ doctorId: doctor.id, text: concern.trim() }).catch(() => undefined);
          if (result.kind === "paid") {
            // Stripe confirmed it and the backend already saved the booking (and sent the text).
            const { booked: b } = result;
            setBooked(book({ ...base, startsAt: b.startsAt, payment: b.payment }, { id: b.reference, bookedAt: b.bookedAt }));
            setSms(b.sms ?? { status: "skipped", to: "" });
            return;
          }
          const consultation = book({
            ...base,
            startsAt: mode === "instant" ? new Date().toISOString() : slot!.toISOString(),
            payment: { amount: 0, currency: fee.currency, regionId: region.id, method: "free", reference: "FREE", paidAt: new Date().toISOString() },
          });
          setBooked(consultation);
          // Save it on the backend, which texts the patient a confirmation.
          // If it wasn't saved, it comes off your list again and you can try again.
          const notSaved = (error: string) => {
            useConsultations.getState().remove(consultation.id);
            setBooked(null);
            setCheckingOut(false);
            setSaveError(error);
          };
          confirmBookingAction(consultation, Intl.DateTimeFormat().resolvedOptions().timeZone).then(
            (r) => (r.sms ? setSms(r.sms) : notSaved(r.error ?? "Couldn't save your booking.")),
            () => notSaved("Can't reach the server."),
          );
        }}
      />
    );
  }

  if (openConsultation && step === 0) {
    return (
      <Card className="mx-auto max-w-xl p-6 text-center sm:p-8">
        <span className="mx-auto inline-flex size-14 items-center justify-center rounded-full bg-primary-soft text-primary">
          <MessageCircle className="size-7" />
        </span>
        <h2 className="mt-4 font-serif text-2xl font-semibold text-foreground">You already have a consultation</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {openConsultation.state === "upcoming"
            ? `Your consultation with ${doctor.name} starts ${format(openConsultation.startsAt, "EEE d MMM 'at' HH:mm")}.`
            : `Your consultation with ${doctor.name} is in progress until ${format(openConsultation.sessionEndsAt, "EEE d MMM, HH:mm")}.`}
        </p>
        <ButtonLink href={`/patient/messages/${doctor.id}`} className="mt-6">
          <MessageCircle /> Open chat
        </ButtonLink>
      </Card>
    );
  }

  const stepValid = [
    mode === "instant" ? instantAllowed : !!slot,
    concern.trim().length >= 20 && blocked.length === 0,
    agreed,
  ][step];

  const selectedDay = days[dayIndex];

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="min-w-0">
        <ol className="mb-6 flex items-center gap-2 text-sm">
          {STEPS.map((label, i) => (
            <li key={label} className="flex items-center gap-2">
              <span
                className={cn(
                  "inline-flex size-7 items-center justify-center rounded-full text-xs font-semibold",
                  i < step ? "bg-primary text-primary-foreground" : i === step ? "bg-foreground text-background" : "bg-surface-2 text-muted-foreground",
                )}
              >
                {i < step ? <CheckCircle2 className="size-4" /> : i + 1}
              </span>
              <span className={cn("hidden sm:inline", i === step ? "font-medium text-foreground" : "text-muted-foreground")}>
                {label === "Payment" && free ? "Confirm" : label}
              </span>
              {i < STEPS.length - 1 && <span className="mx-1 h-px w-6 bg-border sm:w-10" />}
            </li>
          ))}
        </ol>

        <Card>
          <CardBody className="space-y-6">
            {step === 0 && (
              <>
                <div>
                  <h2 className="font-serif text-xl font-semibold text-foreground">When would you like to chat?</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Your booking is confirmed automatically — no waiting for approval.</p>
                </div>
                <div role="radiogroup" className="grid gap-3 sm:grid-cols-2">
                  <ModeOption
                    selected={mode === "instant"}
                    disabled={!instantAllowed}
                    onSelect={() => setMode("instant")}
                    icon={Zap}
                    title="Chat now"
                    body={instantAllowed ? `Starts right away · usually replies in ${doctor.responseTime.replace("~", "about ")}` : "Available when the doctor is online"}
                  />
                  <ModeOption
                    selected={mode === "scheduled"}
                    onSelect={() => setMode("scheduled")}
                    icon={CalendarClock}
                    title="Schedule a time"
                    body="Pick a slot — the doctor will be ready for you"
                  />
                </div>

                {mode === "scheduled" && (
                  <div className="space-y-4">
                    <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1">
                      {days.map((day, i) => {
                        const open = day.slots.filter((s) => s.available).length;
                        return (
                          <button
                            key={day.date.toISOString()}
                            type="button"
                            onClick={() => {
                              setDayIndex(i);
                              setSlot(null);
                            }}
                            aria-pressed={dayIndex === i}
                            disabled={open === 0}
                            className={cn(
                              "flex w-[72px] shrink-0 flex-col items-center rounded-2xl border py-2.5 text-sm transition-colors disabled:opacity-40",
                              dayIndex === i ? "border-primary bg-primary-soft text-primary" : "border-border text-muted-foreground hover:text-foreground",
                            )}
                          >
                            <span className="text-xs">{dayName(day.date)}</span>
                            <span className="text-lg font-semibold">{format(day.date, "d")}</span>
                            <span className="text-[10px]">
                              {open ? `${open} slots` : day.closed === "off" ? "Off" : day.closed === "time-off" ? "Away" : "Full"}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    {selectedDay && selectedDay.slots.some((s) => s.available) ? (
                      <div className="space-y-4">
                        {groupByDayPart(selectedDay.slots).map((group) => (
                          <div key={group.label}>
                            <p className="mb-2 text-xs font-medium text-muted-foreground">{group.label}</p>
                            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                              {group.slots.map((s) => {
                                const active = slot?.getTime() === s.start.getTime();
                                return (
                                  <button
                                    key={s.start.toISOString()}
                                    type="button"
                                    disabled={!s.available}
                                    onClick={() => setSlot(s.start)}
                                    aria-pressed={active}
                                    className={cn(
                                      "h-10 rounded-xl border text-sm font-medium tabular-nums transition-colors disabled:cursor-not-allowed disabled:border-transparent disabled:bg-surface-2 disabled:text-muted-foreground/50 disabled:line-through",
                                      active ? "border-primary bg-primary text-primary-foreground" : "border-border text-foreground hover:border-primary/50",
                                    )}
                                  >
                                    {format(s.start, "HH:mm")}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="rounded-2xl bg-surface-2 px-4 py-6 text-center text-sm text-muted-foreground">
                        {doctor.name} has no open times in the next {schedule.bookingWindowDays} days.
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {schedule.slotMinutes}-minute slots · shown in your local time zone.
                    </p>
                  </div>
                )}
              </>
            )}

            {step === 1 && (
              <>
                <div>
                  <h2 className="font-serif text-xl font-semibold text-foreground">What would you like help with?</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    This is sent to {doctor.name} as your first message, so they can prepare.
                  </p>
                </div>
                <Field
                  label="Describe your concern"
                  htmlFor="concern"
                  hint={`${concern.trim().length}/20 characters minimum. Include how long it has been happening and anything you've tracked.`}
                  error={blocked.length ? describeBlocked(blocked) : undefined}
                >
                  <Textarea
                    id="concern"
                    value={concern}
                    onChange={(e) => setConcern(e.target.value)}
                    className="min-h-40"
                    placeholder="e.g. My last two cycles were 38 and 41 days and I've had more cramps than usual…"
                  />
                </Field>
              </>
            )}

            {step === 2 && (
              <>
                <div>
                  <h2 className="font-serif text-xl font-semibold text-foreground">{free ? "Confirm your booking" : "Review & pay"}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {free ? "This consultation is free — no payment needed." : "Next, we'll check the schedule and take you to secure payment."}
                  </p>
                </div>

                <dl className="divide-y divide-border rounded-2xl border border-border text-sm">
                  <Row label="Specialist" value={doctor.name} />
                  <Row
                    label="When"
                    value={mode === "instant" ? "Now — chat opens straight away" : slot ? format(slot, "EEEE d MMMM 'at' HH:mm") : "—"}
                  />
                  <Row label="Consultation fee" value={<span className="font-semibold">{fee.label}</span>} />
                  <Row label="Pricing region" value={region.name} />
                </dl>

                {!free && (
                  <p className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    Pay with:
                    {["Card", "Apple Pay", "Google Pay"].map((m) => (
                      <Badge key={m}>{m}</Badge>
                    ))}
                    <span className="text-xs">· secured by Stripe</span>
                  </p>
                )}

                <Checkbox
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  label="I understand this chat gives guidance, not a diagnosis"
                  description={`Full refund if ${doctor.name.split(" ").slice(0, 2).join(" ")} doesn't reply within ${CONSULTATION_POLICY.replyGuaranteeHours} hours.`}
                />
              </>
            )}

            <div className="flex gap-3 border-t border-border pt-5">
              {step > 0 && (
                <Button variant="outline" onClick={() => setStep(step - 1)}>
                  <ArrowLeft /> Back
                </Button>
              )}
              {step < 2 ? (
                <Button className="flex-1" disabled={!stepValid} onClick={() => setStep(step + 1)}>
                  Continue <ArrowRight />
                </Button>
              ) : (
                <Button className="flex-1" size="lg" disabled={!stepValid} onClick={() => setCheckingOut(true)}>
                  {free ? (
                    "Confirm free booking"
                  ) : (
                    <>
                      <LockKeyhole /> Continue to payment · {fee.label}
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardBody>
        </Card>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-10 lg:self-start">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <Avatar name={doctor.name} src={doctor.avatar} hue={doctor.hue} />
            <div className="min-w-0">
              <p className="flex items-center gap-1 truncate font-semibold text-foreground">
                {doctor.name} <BadgeCheck className="size-4 shrink-0 text-primary" />
              </p>
              <AvailabilityLabel value={doctor.availability} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between border-t border-border pt-4">
            <span className="text-sm text-muted-foreground">Consultation</span>
            <span className="text-2xl font-semibold text-foreground">{fee.label}</span>
          </div>
          <IncludedList />
        </Card>
        <Disclaimer>Chat consultations are for guidance only. In an emergency, call your local emergency number.</Disclaimer>
      </aside>
    </div>
  );
}

export function IncludedList({ className }: { className?: string }) {
  const { sessionHours, followUpDays, replyGuaranteeHours } = CONSULTATION_POLICY;
  const items = [
    { icon: MessageCircle, text: `Private chat, open for ${sessionHours} hours` },
    { icon: RotateCcw, text: `${followUpDays} days of free follow-up messages` },
    { icon: ShieldCheck, text: `Full refund if no reply within ${replyGuaranteeHours} hours` },
    { icon: CalendarDays, text: "Booking confirmed instantly" },
  ];
  return (
    <ul className={cn("mt-4 space-y-2.5 text-sm text-muted-foreground", className)}>
      {items.map(({ icon: Icon, text }) => (
        <li key={text} className="flex gap-2.5">
          <Icon className="mt-0.5 size-4 shrink-0 text-primary" />
          {text}
        </li>
      ))}
    </ul>
  );
}

function ModeOption({
  selected,
  disabled,
  onSelect,
  icon: Icon,
  title,
  body,
}: {
  selected: boolean;
  disabled?: boolean;
  onSelect: () => void;
  icon: typeof Zap;
  title: string;
  body: string;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      disabled={disabled}
      onClick={onSelect}
      className={cn(
        "flex items-start gap-3 rounded-2xl border-2 p-4 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        selected ? "border-primary bg-primary-soft" : "border-border hover:border-primary/40",
      )}
    >
      <Icon className={cn("mt-0.5 size-5 shrink-0", selected ? "text-primary" : "text-muted-foreground")} />
      <span>
        <span className="block font-semibold text-foreground">{title}</span>
        <span className="mt-0.5 block text-xs text-muted-foreground">{body}</span>
      </span>
    </button>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right text-foreground">{value}</dd>
    </div>
  );
}

function SmsNote({ sms }: { sms: ConfirmationSms | null }) {
  const text =
    sms === null
      ? "Saving your booking…"
      : sms.status === "sent"
        ? `Confirmation text sent to ${sms.to}`
        : "We couldn't text you a confirmation. Your booking is confirmed.";
  return (
    <p
      role="status"
      className={cn(
        "mt-6 flex items-center justify-center gap-2 rounded-2xl px-3 py-2.5 text-sm",
        sms?.status === "sent" ? "bg-success-soft text-success" : sms === null ? "bg-surface-2 text-muted-foreground" : "bg-warning-soft text-warning",
      )}
    >
      <MessageSquareText className="size-4 shrink-0" /> {text}
    </p>
  );
}

function Confirmation({
  consultation,
  doctor,
  sms,
}: {
  consultation: Consultation;
  doctor: Doctor;
  sms: ConfirmationSms | null;
}) {
  const t = timeline(consultation, new Date(consultation.bookedAt));
  const instant = consultation.mode === "instant";
  const free = consultation.payment.method === "free";
  const steps = [
    { label: instant ? "Doctor availability checked" : "Schedule checked", at: consultation.bookedAt },
    { label: free ? "Free consultation applied" : `Payment received · ${consultation.payment.details ?? ""}`, at: consultation.payment.paidAt ?? consultation.bookedAt },
    { label: "Consultation confirmed", at: consultation.bookedAt },
    { label: instant ? "Chat open now" : `Chat opens ${format(t.startsAt, "EEE d MMM, HH:mm")}`, at: null },
  ];

  return (
    <Card className="animate-fade-up mx-auto max-w-xl p-6 sm:p-10">
      <div className="text-center">
        <span className="mx-auto inline-flex size-16 items-center justify-center rounded-full bg-success-soft text-success">
          <CheckCircle2 className="size-8" />
        </span>
        <h2 className="mt-5 font-serif text-3xl font-semibold text-foreground">Consultation confirmed</h2>
        <p className="mt-2 text-muted-foreground">
          {instant
            ? `Your chat with ${doctor.name} is open now. They've been notified.`
            : `${doctor.name} will be ready for you on ${format(t.startsAt, "EEEE d MMMM 'at' HH:mm")}.`}
        </p>
      </div>

      <SmsNote sms={sms} />

      <ol className="mt-8 space-y-0">
        {steps.map((step, i) => (
          <li key={step.label} className="relative flex gap-3 pb-4 last:pb-0">
            {i < steps.length - 1 && <span className="absolute top-6 left-[11px] h-full w-px bg-success/30" />}
            <span className={cn("relative inline-flex size-6 shrink-0 items-center justify-center rounded-full", step.at ? "bg-success text-white" : "bg-primary-soft text-primary")}>
              {step.at ? <Check className="size-3.5" /> : <Clock3 className="size-3.5" />}
            </span>
            <div className="flex flex-1 items-center justify-between gap-3 text-sm">
              <span className="text-foreground">{step.label}</span>
              {step.at && <span className="shrink-0 text-xs text-muted-foreground">{format(new Date(step.at), "HH:mm")}</span>}
            </div>
          </li>
        ))}
      </ol>

      <dl className="mt-6 divide-y divide-border rounded-2xl border border-border text-left text-sm">
        <Row label="Booking ID" value={<span className="font-mono">{consultation.id}</span>} />
        <Row label={free ? "Price" : "Amount paid"} value={consultation.payment.amount ? formatMoney(consultation.payment.amount, consultation.payment.currency) : "Free"} />
        {!free && <Row label="Payment reference" value={<span className="font-mono">{consultation.payment.reference}</span>} />}
        <Row label="Chat open until" value={format(t.sessionEndsAt, "d MMM, HH:mm")} />
        <Row label="Free follow-up until" value={format(t.followUpEndsAt, "d MMM yyyy")} />
      </dl>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <ButtonLink href={`/patient/messages/${doctor.id}`}>
          <MessageCircle /> {instant ? "Open chat" : "View chat"}
        </ButtonLink>
        <ButtonLink href="/patient/consultations" variant="outline">
          My consultations
        </ButtonLink>
      </div>
    </Card>
  );
}
