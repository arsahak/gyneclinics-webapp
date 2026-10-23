"use client";

import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe, type Appearance, type Stripe } from "@stripe/stripe-js";
import { format } from "date-fns";
import { AlertTriangle, CalendarSearch, Check, Clock, Loader2, LockKeyhole, ShieldCheck, Timer, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { type BookedResult, bookedSlotsAction, type CheckoutStart, confirmCheckoutAction, startCheckoutAction } from "@/app/actions/consultationAction";
import { Badge } from "@/component/ui/badge";
import { Button } from "@/component/ui/button";
import { Card } from "@/component/ui/card";
import { CONSULTATION_POLICY, isSlotStillAvailable } from "@/lib/consultation";
import { formatMoney, type RegionId } from "@/lib/locale/regions";
import { scheduleOf } from "@/lib/availability";
import type { ConsultationMode, Doctor } from "@/lib/types";
import { cn } from "@/lib/utils";

// Checkout: re-check the schedule, then pay with Stripe (card, Apple Pay,
// Google Pay, Link). The backend sets the price and saves the booking only once
// Stripe confirms the payment. Free consultations skip the payment step.

type Stage = "checking" | "slot_unavailable" | "starting" | "payment" | "confirming" | "waiting" | "expired" | "error";

export type CheckoutResult = { kind: "free" } | { kind: "paid"; booked: BookedResult };

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** One Stripe.js per publishable key, loaded once. */
const stripeLoaders = new Map<string, Promise<Stripe | null>>();
const stripeFor = (key: string) => {
  if (!stripeLoaders.has(key)) stripeLoaders.set(key, loadStripe(key));
  return stripeLoaders.get(key)!;
};

/** Stripe's form in the site's colours (read from the theme, light or dark). */
function stripeAppearance(): Appearance {
  const css = getComputedStyle(document.documentElement);
  const v = (name: string, fallback: string) => css.getPropertyValue(name).trim() || fallback;
  const dark = document.documentElement.dataset.theme === "dark";
  return {
    theme: dark ? "night" : "stripe",
    variables: {
      colorPrimary: v("--primary", "#804898"),
      colorBackground: v("--surface", dark ? "#1e1e1e" : "#ffffff"),
      colorText: v("--foreground", dark ? "#fafafa" : "#18181b"),
      colorDanger: v("--danger", "#c2263b"),
      fontFamily: "Poppins, system-ui, sans-serif",
      borderRadius: "12px",
      spacingUnit: "4px",
    },
  };
}

function mmss(ms: number) {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export function Checkout({
  doctor,
  mode,
  slot,
  concern,
  regionId,
  feeLabel,
  free,
  onSuccess,
  onCancel,
}: {
  doctor: Doctor;
  mode: ConsultationMode;
  slot: Date | null;
  concern: string;
  regionId: RegionId;
  feeLabel: string;
  free: boolean;
  onSuccess: (result: CheckoutResult) => void;
  onCancel: (reason?: "slot") => void;
}) {
  const schedule = useMemo(() => scheduleOf(doctor.schedule), [doctor.schedule]);
  const [stage, setStage] = useState<Stage>("checking");
  const [checkStep, setCheckStep] = useState(0);
  const [confirmStep, setConfirmStep] = useState(0);
  const [checkout, setCheckout] = useState<CheckoutStart | null>(null);
  const [appearance, setAppearance] = useState<Appearance | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [holdUntil] = useState(() => Date.now() + CONSULTATION_POLICY.slotHoldMinutes * 60_000);
  const [now, setNow] = useState(() => Date.now());
  const result = useRef<CheckoutResult | null>(null);
  const onSuccessRef = useRef(onSuccess);
  useEffect(() => {
    onSuccessRef.current = onSuccess;
  }, [onSuccess]);
  const firstName = doctor.name.split(" ").slice(0, 2).join(" ");

  // 1. Schedule check, then (for a paid consultation) open the Stripe payment.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      for (let i = 1; i <= 3; i++) {
        await wait(500);
        if (cancelled) return;
        setCheckStep(i);
      }
      // Fresh from the backend: someone may have taken the slot meanwhile.
      const booked = mode === "scheduled" ? await bookedSlotsAction(doctor.id) : [];
      if (cancelled) return;
      const ok =
        mode === "instant"
          ? doctor.availability === "online"
          : !!slot && isSlotStillAvailable(schedule, slot, new Date(), booked);
      await wait(300);
      if (cancelled) return;
      if (!ok) {
        setStage("slot_unavailable");
        return;
      }
      if (free) {
        result.current = { kind: "free" };
        setStage("confirming");
        return;
      }
      setStage("starting");
      const started = await startCheckoutAction({
        doctorId: doctor.id,
        mode,
        concern,
        startsAt: (mode === "instant" ? new Date() : slot!).toISOString(),
        regionId,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
      if (cancelled) return;
      if (!started.data) {
        setError(started.error ?? "We couldn't start the payment. Please try again.");
        setStage("error");
        return;
      }
      setAppearance(stripeAppearance());
      setCheckout(started.data);
      setStage("payment");
    })();
    return () => {
      cancelled = true;
    };
    // Runs once per checkout: re-running would open a second payment.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Slot hold countdown while the patient is paying
  useEffect(() => {
    if (stage !== "payment" || mode !== "scheduled") return;
    const timer = setInterval(() => {
      const t = Date.now();
      setNow(t);
      if (t >= holdUntil) setStage("expired");
    }, 1000);
    return () => clearInterval(timer);
  }, [stage, holdUntil, mode]);

  // 3. Confirmation checklist, then hand the booking to the page.
  useEffect(() => {
    if (stage !== "confirming") return;
    let cancelled = false;
    (async () => {
      for (let i = 1; i <= 4; i++) {
        await wait(450);
        if (cancelled) return;
        setConfirmStep(i);
      }
      await wait(300);
      if (!cancelled && result.current) onSuccessRef.current(result.current);
    })();
    return () => {
      cancelled = true;
    };
  }, [stage]);

  /** Stripe took the payment: the backend checks it and saves the booking. */
  const onPaid = async (paymentIntentId: string) => {
    setStage("waiting");
    for (let attempt = 0; attempt < 20; attempt++) {
      const confirmed = await confirmCheckoutAction(paymentIntentId);
      if (confirmed.booked) {
        result.current = { kind: "paid", booked: confirmed.booked };
        setStage("confirming");
        return;
      }
      if (!confirmed.processing) {
        setError(confirmed.error ?? null);
        break;
      }
      await wait(3000);
    }
    setError(
      (e) =>
        e ??
        "Your payment went through, but we couldn't confirm the booking yet. It will appear in your consultations shortly — you don't need to pay again.",
    );
    setStage("error");
  };

  const when = mode === "instant" ? "Now" : slot ? format(slot, "EEE d MMM, HH:mm") : "—";
  // Once the payment is open, show what Stripe will charge (the backend sets the price).
  const priceLabel = checkout ? formatMoney(checkout.amount, checkout.currency) : feeLabel;
  const holdLeft = holdUntil - now;

  const checkItems = [
    `Checking ${firstName}'s calendar`,
    mode === "instant" ? `${firstName} is online` : `${when} is still free`,
    mode === "instant" ? "Reserving your chat" : `Holding your slot for ${CONSULTATION_POLICY.slotHoldMinutes} minutes`,
  ];
  const confirmItems = [
    free ? "Free consultation applied" : "Payment received",
    mode === "instant" ? "Chat opened" : "Slot reserved in the doctor's calendar",
    `${firstName} notified`,
    "Receipt sent",
  ];

  return (
    <Card className="mx-auto max-w-xl overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-border bg-surface-2/60 px-5 py-4">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <LockKeyhole className="size-4 text-primary" /> Secure checkout
          {checkout?.mode === "test" && <Badge tone="gold">Test mode</Badge>}
        </div>
        {stage === "payment" && mode === "scheduled" && (
          <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium tabular-nums", holdLeft < 60_000 ? "text-danger" : "text-muted-foreground")}>
            <Timer className="size-3.5" /> Slot held {mmss(holdLeft)}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4 text-sm">
        <div className="min-w-0">
          <p className="truncate font-medium text-foreground">{doctor.name}</p>
          <p className="text-muted-foreground">{mode === "instant" ? "Instant chat" : when}</p>
        </div>
        <p className="text-xl font-semibold text-foreground">{priceLabel}</p>
      </div>

      <div className="p-5 sm:p-6">
        {stage === "checking" && (
          <StageBlock icon={CalendarSearch} title="Checking the schedule" body="Making sure your time is still available.">
            <Checklist items={checkItems} done={checkStep} />
          </StageBlock>
        )}

        {stage === "starting" && <StageBlock icon={Loader2} spin title="Opening secure payment" body="Connecting to Stripe…" />}

        {stage === "slot_unavailable" && (
          <StageBlock
            icon={AlertTriangle}
            tone="danger"
            title={mode === "instant" ? `${firstName} just went offline` : "This slot was just taken"}
            body={mode === "instant" ? "Please schedule a time instead." : "Someone booked it moments ago. Please choose another time — you haven't been charged."}
          >
            <Button className="w-full" onClick={() => onCancel("slot")}>Choose another time</Button>
          </StageBlock>
        )}

        {stage === "expired" && (
          <StageBlock icon={Timer} tone="danger" title="Your slot hold expired" body="We released the slot so others can book it. You haven't been charged.">
            <Button className="w-full" onClick={() => onCancel("slot")}>Pick a time again</Button>
          </StageBlock>
        )}

        {stage === "payment" && checkout && appearance && (
          <Elements stripe={stripeFor(checkout.publishableKey)} options={{ clientSecret: checkout.clientSecret, appearance, fonts: [{ cssSrc: "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap" }] }}>
            <StripePayForm feeLabel={priceLabel} testMode={checkout.mode === "test"} onPaid={onPaid} onCancel={() => onCancel()} />
          </Elements>
        )}

        {stage === "waiting" && <StageBlock icon={Loader2} spin title="Confirming your payment" body="Please don't close this page." />}

        {stage === "confirming" && (
          <StageBlock icon={ShieldCheck} tone="success" title="Confirming your consultation" body="Almost done…">
            <Checklist items={confirmItems} done={confirmStep} />
          </StageBlock>
        )}

        {stage === "error" && (
          <StageBlock icon={Clock} tone="danger" title="Something went wrong" body={error ?? "Please try again."}>
            <Button className="w-full" variant="outline" onClick={() => onCancel()}>
              Back to booking
            </Button>
          </StageBlock>
        )}
      </div>
    </Card>
  );
}

/** Stripe's payment form. A declined card shows the reason and lets the patient try again. */
function StripePayForm({ feeLabel, testMode, onPaid, onCancel }: { feeLabel: string; testMode: boolean; onPaid: (paymentIntentId: string) => void; onCancel: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [ready, setReady] = useState(false);
  const [paying, setPaying] = useState(false);
  const [declined, setDeclined] = useState<string | null>(null);

  const pay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setPaying(true);
    setDeclined(null);
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
      confirmParams: { return_url: window.location.href },
    });
    if (error) {
      setPaying(false);
      // Form mistakes are shown inside Stripe's form; card problems here.
      if (error.type !== "validation_error") setDeclined(error.message ?? "Your payment didn't go through.");
      return;
    }
    if (paymentIntent && (paymentIntent.status === "succeeded" || paymentIntent.status === "processing")) onPaid(paymentIntent.id);
    else {
      setPaying(false);
      setDeclined("Your payment didn't go through. Please try again.");
    }
  };

  return (
    <form onSubmit={pay} className="space-y-5">
      {declined && (
        <div role="alert" className="flex items-start gap-3 rounded-2xl bg-danger-soft p-4 text-sm text-danger">
          <X className="mt-0.5 size-4 shrink-0" />
          <div>
            <p className="font-semibold">Payment declined</p>
            <p>{declined} Try again or use another card.</p>
          </div>
        </div>
      )}
      {testMode && (
        <p className="rounded-2xl border border-dashed border-gold/40 bg-gold-soft p-3 text-xs text-foreground/80">
          Test mode — use card <span className="font-mono font-semibold">4242 4242 4242 4242</span>, any future date and any CVC. A declined test card:{" "}
          <span className="font-mono font-semibold">4000 0000 0000 0002</span>. No real money is taken.
        </p>
      )}
      {/* Stripe measures its container, so the form stays laid out while it loads (just invisible). */}
      <div className="relative min-h-55">
        {!ready && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="size-6 animate-spin text-muted-foreground" aria-label="Loading payment form" />
          </div>
        )}
        <div className={cn("transition-opacity", ready ? "opacity-100" : "opacity-0")}>
          <PaymentElement onReady={() => setReady(true)} options={{ layout: "tabs" }} />
        </div>
      </div>
      <Button type="submit" size="lg" className="w-full" disabled={!stripe || !ready || paying}>
        {paying ? <Loader2 className="animate-spin" /> : <LockKeyhole />} {paying ? "Processing…" : `Pay ${feeLabel}`}
      </Button>
      <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <ShieldCheck className="size-3.5" /> Payments are processed by Stripe. We never see your card number.
      </p>
      <button type="button" onClick={onCancel} disabled={paying} className="w-full text-center text-sm text-muted-foreground hover:text-foreground disabled:opacity-50">
        Cancel and go back
      </button>
    </form>
  );
}

function StageBlock({
  icon: Icon,
  title,
  body,
  tone = "primary",
  spin,
  children,
}: {
  icon: typeof Check;
  title: string;
  body: string;
  tone?: "primary" | "danger" | "success";
  spin?: boolean;
  children?: React.ReactNode;
}) {
  const tones = { primary: "bg-primary-soft text-primary", danger: "bg-danger-soft text-danger", success: "bg-success-soft text-success" };
  return (
    <div className="animate-fade-up space-y-5 py-2">
      <div className="text-center">
        <span className={cn("mx-auto inline-flex size-14 items-center justify-center rounded-full", tones[tone])}>
          <Icon className={cn("size-7", spin && "animate-spin")} />
        </span>
        <h3 className="mt-4 font-serif text-xl font-semibold text-foreground">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{body}</p>
      </div>
      {children}
    </div>
  );
}

function Checklist({ items, done }: { items: string[]; done: number }) {
  return (
    <ul className="space-y-3">
      {items.map((item, i) => {
        const complete = i < done;
        const active = i === done;
        return (
          <li key={item} className="flex items-center gap-3 text-sm">
            <span
              className={cn(
                "inline-flex size-6 shrink-0 items-center justify-center rounded-full transition-colors",
                complete ? "bg-success text-white" : active ? "bg-primary-soft text-primary" : "bg-surface-2 text-muted-foreground",
              )}
            >
              {complete ? <Check className="size-3.5" /> : active ? <Loader2 className="size-3.5 animate-spin" /> : <span className="size-1.5 rounded-full bg-current" />}
            </span>
            <span className={complete ? "text-foreground" : "text-muted-foreground"}>{item}</span>
          </li>
        );
      })}
    </ul>
  );
}
