"use client";

import { format } from "date-fns";
import {
  AlertTriangle,
  CalendarSearch,
  Check,
  CreditCard,
  Loader2,
  LockKeyhole,
  ShieldCheck,
  Smartphone,
  Timer,
  Wallet,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Badge } from "@/component/ui/badge";
import { Button } from "@/component/ui/button";
import { Card } from "@/component/ui/card";
import { Field, Input } from "@/component/ui/field";
import { CONSULTATION_POLICY, isSlotStillAvailable, LOCAL_PROVIDERS, type PaymentMethod } from "@/lib/consultation";
import { useDoctorSchedule } from "@/lib/store/availability";
import type { RegionId } from "@/lib/locale/regions";
import { useConsultations } from "@/lib/store/consultations";
import type { ConsultationMode, Doctor, PaymentMethodId } from "@/lib/types";
import { cn } from "@/lib/utils";

// Dummy checkout. Every step is simulated in the browser — nothing is charged or sent anywhere.
// When the backend exists: the schedule check becomes an API "hold slot" call, the payment step
// redirects to the gateway's hosted checkout, and confirmation waits for the gateway webhook.

type Stage = "checking" | "slot_unavailable" | "payment" | "processing" | "declined" | "confirming" | "expired";

export interface PaymentResult {
  method: PaymentMethodId | "free";
  details?: string;
  reference: string;
  paidAt?: string;
}

const TEST_CARD_OK = "4242 4242 4242 4242";
const TEST_CARD_DECLINE = "4000 0000 0000 0002";
const DEMO_OTP = "123456";
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function cardBrand(digits: string) {
  if (/^4/.test(digits)) return "Visa";
  if (/^(5[1-5]|2[2-7])/.test(digits)) return "Mastercard";
  if (/^3[47]/.test(digits)) return "Amex";
  return null;
}

function luhn(digits: string) {
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    let d = Number(digits[digits.length - 1 - i]);
    if (i % 2 === 1) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  return digits.length >= 13 && sum % 10 === 0;
}

function mmss(ms: number) {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

function reference() {
  return `PAY-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export function Checkout({
  doctor,
  mode,
  slot,
  feeLabel,
  free,
  regionId,
  methods,
  initialMethod,
  onSuccess,
  onCancel,
}: {
  doctor: Doctor;
  mode: ConsultationMode;
  slot: Date | null;
  feeLabel: string;
  free: boolean;
  regionId: RegionId;
  methods: PaymentMethod[];
  initialMethod: PaymentMethodId;
  onSuccess: (result: PaymentResult) => void;
  onCancel: (reason?: "slot") => void;
}) {
  const schedule = useDoctorSchedule(doctor.id, doctor.availability, doctor.schedule);
  const [stage, setStage] = useState<Stage>("checking");
  const [checkStep, setCheckStep] = useState(0);
  const [confirmStep, setConfirmStep] = useState(0);
  const [method, setMethod] = useState<PaymentMethodId>(initialMethod);
  const [declineReason, setDeclineReason] = useState<string | null>(null);
  const [holdUntil] = useState(() => Date.now() + CONSULTATION_POLICY.slotHoldMinutes * 60_000);
  const [now, setNow] = useState(() => Date.now());
  const result = useRef<PaymentResult | null>(null);
  const onSuccessRef = useRef(onSuccess);
  useEffect(() => {
    onSuccessRef.current = onSuccess;
  }, [onSuccess]);
  const firstName = doctor.name.split(" ").slice(0, 2).join(" ");

  // 1. Schedule check
  useEffect(() => {
    let cancelled = false;
    (async () => {
      for (let i = 1; i <= 3; i++) {
        await wait(650);
        if (cancelled) return;
        setCheckStep(i);
      }
      const booked = useConsultations.getState().consultations.filter((c) => c.doctorId === doctor.id).map((c) => c.startsAt);
      const ok =
        mode === "instant"
          ? doctor.availability === "online"
          : !!slot && isSlotStillAvailable(doctor.id, schedule, slot, new Date(), booked);
      await wait(350);
      if (cancelled) return;
      if (!ok) setStage("slot_unavailable");
      else if (free) {
        result.current = { method: "free", reference: "FREE" };
        setStage("confirming");
      } else setStage("payment");
    })();
    return () => {
      cancelled = true;
    };
  }, [doctor.id, doctor.availability, schedule, mode, slot, free]);

  // Slot hold countdown while the patient is paying
  useEffect(() => {
    if (stage !== "payment" && stage !== "declined") return;
    const timer = setInterval(() => {
      const t = Date.now();
      setNow(t);
      if (t >= holdUntil) setStage("expired");
    }, 1000);
    return () => clearInterval(timer);
  }, [stage, holdUntil]);

  // 3. Consultation confirmation
  useEffect(() => {
    if (stage !== "confirming") return;
    let cancelled = false;
    (async () => {
      for (let i = 1; i <= 4; i++) {
        await wait(600);
        if (cancelled) return;
        setConfirmStep(i);
      }
      await wait(400);
      if (!cancelled && result.current) onSuccessRef.current(result.current);
    })();
    return () => {
      cancelled = true;
    };
  }, [stage]);

  const pay = async (outcome: { ok: true; result: PaymentResult } | { ok: false; reason: string }) => {
    setStage("processing");
    await wait(1800);
    if (!outcome.ok) {
      setDeclineReason(outcome.reason);
      setStage("declined");
      return;
    }
    result.current = { ...outcome.result, paidAt: new Date().toISOString() };
    setStage("confirming");
  };

  const when = mode === "instant" ? "Now" : slot ? format(slot, "EEE d MMM, HH:mm") : "—";
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
    "Receipt sent to your phone",
  ];

  return (
    <Card className="mx-auto max-w-xl overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-border bg-surface-2/60 px-5 py-4">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <LockKeyhole className="size-4 text-primary" /> Secure checkout
          <Badge tone="gold">Test mode</Badge>
        </div>
        {(stage === "payment" || stage === "declined") && mode === "scheduled" && (
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
        <p className="text-xl font-semibold text-foreground">{feeLabel}</p>
      </div>

      <div className="p-5 sm:p-6">
        {stage === "checking" && (
          <StageBlock icon={CalendarSearch} title="Checking the schedule" body="Making sure your time is still available.">
            <Checklist items={checkItems} done={checkStep} />
          </StageBlock>
        )}

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

        {/* The form stays mounted while processing so a decline keeps what the patient typed. */}
        {(stage === "payment" || stage === "declined" || stage === "processing") && (
          <div className="relative space-y-5">
            {stage === "processing" && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-surface/95 backdrop-blur-sm">
                <StageBlock icon={Loader2} spin title="Processing payment" body="Please don't close this page.">
                  <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
                    <div className="h-full w-full animate-pulse rounded-full bg-primary/60" />
                  </div>
                </StageBlock>
              </div>
            )}
            {stage === "declined" && (
              <div role="alert" className="flex items-start gap-3 rounded-2xl bg-danger-soft p-4 text-sm text-danger">
                <X className="mt-0.5 size-4 shrink-0" />
                <div>
                  <p className="font-semibold">Payment declined</p>
                  <p>{declineReason} Try again or use another method.</p>
                </div>
              </div>
            )}
            <div className="grid grid-cols-3 gap-2" role="tablist" aria-label="Payment method">
              {methods.map((m) => {
                const Icon = m.id === "card" ? CreditCard : m.id === "local" ? Smartphone : Wallet;
                return (
                  <button
                    key={m.id}
                    type="button"
                    role="tab"
                    aria-selected={method === m.id}
                    onClick={() => setMethod(m.id)}
                    className={cn(
                      "flex flex-col items-center gap-1.5 rounded-2xl border px-2 py-3 text-xs font-medium transition-colors",
                      method === m.id ? "border-primary bg-primary-soft text-primary" : "border-border text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <Icon className="size-5" />
                    {m.id === "card" ? "Card" : m.id === "local" ? "Mobile wallet" : "Apple / Google Pay"}
                  </button>
                );
              })}
            </div>

            {method === "card" && <CardForm feeLabel={feeLabel} onPay={pay} />}
            {method === "local" && <LocalWalletForm feeLabel={feeLabel} providers={LOCAL_PROVIDERS[regionId] ?? ["Mobile wallet"]} onPay={pay} />}
            {method === "wallet" && (
              <Button
                size="lg"
                className="w-full bg-foreground text-background hover:bg-foreground/90"
                onClick={() => pay({ ok: true, result: { method: "wallet", details: "Apple Pay / Google Pay", reference: reference() } })}
              >
                <Wallet /> Pay {feeLabel} with Apple / Google Pay
              </Button>
            )}

            <button type="button" onClick={() => onCancel()} className="w-full text-center text-sm text-muted-foreground hover:text-foreground">
              Cancel and go back
            </button>
          </div>
        )}

        {stage === "confirming" && (
          <StageBlock icon={ShieldCheck} tone="success" title="Confirming your consultation" body="Almost done…">
            <Checklist items={confirmItems} done={confirmStep} />
          </StageBlock>
        )}
      </div>
    </Card>
  );
}

function CardForm({ feeLabel, onPay }: { feeLabel: string; onPay: (o: { ok: true; result: PaymentResult } | { ok: false; reason: string }) => void }) {
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [touched, setTouched] = useState(false);

  const digits = number.replace(/\D/g, "");
  const brand = cardBrand(digits);
  const [mm, yy] = expiry.split("/");
  const expiryValid = (() => {
    const m = Number(mm);
    const y = Number(yy);
    if (!m || m > 12 || !yy || yy.length !== 2) return false;
    const end = new Date(2000 + y, m, 1);
    return end > new Date();
  })();
  const errors = {
    name: name.trim().length < 2 ? "Enter the name on your card" : null,
    number: !luhn(digits) ? "Enter a valid card number" : null,
    expiry: !expiryValid ? "Enter a valid expiry date" : null,
    cvc: !/^\d{3,4}$/.test(cvc) ? "Enter the 3 or 4 digit code" : null,
  };
  const valid = Object.values(errors).every((e) => !e);

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        setTouched(true);
        if (!valid) return;
        if (digits === TEST_CARD_DECLINE.replace(/\s/g, "")) {
          onPay({ ok: false, reason: "Your bank declined this card." });
          return;
        }
        onPay({ ok: true, result: { method: "card", details: `${brand ?? "Card"} •••• ${digits.slice(-4)}`, reference: reference() } });
      }}
    >
      <div className="rounded-2xl border border-dashed border-gold/40 bg-gold-soft p-3 text-xs text-foreground/80">
        Test cards — success: <button type="button" className="font-mono font-semibold underline" onClick={() => setNumber(TEST_CARD_OK)}>{TEST_CARD_OK}</button> · decline:{" "}
        <button type="button" className="font-mono font-semibold underline" onClick={() => setNumber(TEST_CARD_DECLINE)}>{TEST_CARD_DECLINE}</button>. Any future date and CVC. Don&apos;t enter real card details.
      </div>
      <Field label="Name on card" htmlFor="cc-name" error={touched ? errors.name : undefined}>
        <Input id="cc-name" autoComplete="cc-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ayesha Khan" />
      </Field>
      <Field label="Card number" htmlFor="cc-number" error={touched ? errors.number : undefined}>
        <div className="relative">
          <Input
            id="cc-number"
            inputMode="numeric"
            autoComplete="cc-number"
            value={number}
            onChange={(e) => setNumber(e.target.value.replace(/\D/g, "").slice(0, 19).replace(/(\d{4})(?=\d)/g, "$1 "))}
            placeholder="1234 5678 9012 3456"
            className="pr-24 font-mono"
          />
          {brand && <Badge tone="primary" className="absolute top-1/2 right-3 -translate-y-1/2">{brand}</Badge>}
        </div>
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Expiry" htmlFor="cc-exp" error={touched ? errors.expiry : undefined}>
          <Input
            id="cc-exp"
            inputMode="numeric"
            autoComplete="cc-exp"
            value={expiry}
            onChange={(e) => {
              const d = e.target.value.replace(/\D/g, "").slice(0, 4);
              setExpiry(d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d);
            }}
            placeholder="MM/YY"
            className="font-mono"
          />
        </Field>
        <Field label="CVC" htmlFor="cc-cvc" error={touched ? errors.cvc : undefined}>
          <Input id="cc-cvc" inputMode="numeric" autoComplete="cc-csc" value={cvc} onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="123" className="font-mono" />
        </Field>
      </div>
      <Button type="submit" size="lg" className="w-full">
        <LockKeyhole /> Pay {feeLabel}
      </Button>
    </form>
  );
}

function LocalWalletForm({
  feeLabel,
  providers,
  onPay,
}: {
  feeLabel: string;
  providers: string[];
  onPay: (o: { ok: true; result: PaymentResult } | { ok: false; reason: string }) => void;
}) {
  const [provider, setProvider] = useState(providers[0]);
  const [phone, setPhone] = useState("");
  const [sending, setSending] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const digits = phone.replace(/\D/g, "");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {providers.map((p) => (
          <button
            key={p}
            type="button"
            aria-pressed={provider === p}
            onClick={() => {
              setProvider(p);
              setCodeSent(false);
              setOtp("");
            }}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
              provider === p ? "border-primary bg-primary-soft text-primary" : "border-border text-muted-foreground hover:text-foreground",
            )}
          >
            {p}
          </button>
        ))}
      </div>

      {!codeSent ? (
        <>
          <Field label={`${provider} account number`} htmlFor="wallet-phone" hint="The mobile number linked to your wallet.">
            <Input id="wallet-phone" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01XXXXXXXXX" />
          </Field>
          <Button
            size="lg"
            className="w-full"
            disabled={digits.length < 8 || sending}
            onClick={async () => {
              setSending(true);
              await wait(900);
              setSending(false);
              setCodeSent(true);
            }}
          >
            {sending ? <Loader2 className="animate-spin" /> : <Smartphone />} Send verification code
          </Button>
        </>
      ) : (
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (otp !== DEMO_OTP) {
              setError("Incorrect code. Demo code is 123456.");
              return;
            }
            onPay({ ok: true, result: { method: "local", details: `${provider} •••• ${digits.slice(-4)}`, reference: reference() } });
          }}
        >
          <p className="text-sm text-muted-foreground">
            We sent a code to <span className="font-medium text-foreground">{phone}</span> from {provider}.{" "}
            <button type="button" className="text-primary hover:underline" onClick={() => setCodeSent(false)}>Change</button>
          </p>
          <Field label="Verification code" htmlFor="wallet-otp" error={error} hint={`Demo code: ${DEMO_OTP}`}>
            <Input
              id="wallet-otp"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={otp}
              onChange={(e) => {
                setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                setError(null);
              }}
              className="font-mono tracking-[0.4em]"
              placeholder="••••••"
            />
          </Field>
          <Button type="submit" size="lg" className="w-full" disabled={otp.length !== 6}>
            <LockKeyhole /> Confirm and pay {feeLabel}
          </Button>
        </form>
      )}
    </div>
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
