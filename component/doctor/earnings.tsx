"use client";

import { format, parseISO } from "date-fns";
import { AlertTriangle, Banknote, CheckCircle2, Clock, ExternalLink, Hourglass, Landmark, Loader2, Send, ShieldCheck, Wallet } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { requestWithdrawalAction, stripeLinkAction } from "@/app/actions/payoutAction";
import { Badge } from "@/component/ui/badge";
import { Button } from "@/component/ui/button";
import { Card, CardBody, CardHeader } from "@/component/ui/card";
import { Field, Input } from "@/component/ui/field";
import type { Earnings, StripeStatus } from "@/lib/services/payouts";

const gbp = (n: number) => `£${n.toLocaleString("en-GB", { minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 })}`;

const STATUS = {
  requested: { label: "Requested", tone: "warning" as const },
  processing: { label: "On its way", tone: "primary" as const },
  paid: { label: "Paid", tone: "success" as const },
  rejected: { label: "Not paid", tone: "danger" as const },
};

/** The doctor's money: what's clearing, what they can withdraw, their Stripe payout account, and past withdrawals. */
export function DoctorEarnings({ earnings, backFromStripe }: { earnings: Earnings; backFromStripe?: "return" | "refresh" }) {
  const { balance, minWithdrawalGBP, stripe, withdrawals, payoutSchedule } = earnings;
  const whenPaid =
    payoutSchedule === "weekly"
      ? `Every Friday we send your available balance (at least ${gbp(minWithdrawalGBP)}) to Stripe automatically — no need to ask. Stripe then pays it into your bank or card.`
      : "Sent with Stripe, usually within 3 working days. Stripe then pays it into your bank or card.";
  const openRequest = withdrawals.find((w) => w.status === "requested" || w.status === "processing");

  const cards = [
    { icon: Hourglass, label: "Clearing", value: gbp(balance.clearingGBP), hint: "Clears when each 7-day follow-up ends", tone: "bg-gold-soft text-gold" },
    { icon: Wallet, label: "Available", value: gbp(balance.availableGBP), hint: "You can withdraw this now", tone: "bg-success-soft text-success" },
    { icon: Send, label: "On its way", value: gbp(balance.requestedGBP), hint: "Asked for, not paid yet", tone: "bg-primary-soft text-primary" },
    { icon: Landmark, label: "Paid to you", value: gbp(balance.paidOutGBP), hint: `${gbp(balance.lifetimeGBP)} earned in total`, tone: "bg-secondary-soft text-secondary" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ icon: Icon, label, value, hint, tone }) => (
          <Card key={label}>
            <CardBody className="flex items-start gap-3">
              <span className={`inline-flex size-10 shrink-0 items-center justify-center rounded-2xl ${tone}`}>
                <Icon className="size-5" />
              </span>
              <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="text-2xl font-semibold tracking-tight text-foreground">{value}</p>
                <p className="text-xs text-muted-foreground">{hint}</p>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Withdraw available={balance.availableGBP} min={minWithdrawalGBP} stripe={stripe} open={openRequest} />
        <StripePayouts stripe={stripe} backFromStripe={backFromStripe} />
      </div>

      <Card>
        <CardHeader title="Withdrawals" description={whenPaid} />
        <CardBody>
          {withdrawals.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No withdrawals yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {withdrawals.map((w) => (
                <li key={w._id} className="flex flex-wrap items-center gap-3 py-3">
                  <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-muted-foreground">
                    <Banknote className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground">{gbp(w.amountGBP)}</p>
                    <p className="text-xs text-muted-foreground">
                      Asked {format(parseISO(w.createdAt), "d MMM yyyy")} · to {w.destination}
                      {w.status === "paid" && w.paidAt && ` · sent ${format(parseISO(w.paidAt), "d MMM")}`}
                    </p>
                    {w.status === "rejected" && w.rejectionReason && <p className="mt-1 text-xs text-danger">{w.rejectionReason.trim().replace(/([^.!?])$/, "$1.")} The amount is back in your balance.</p>}
                  </div>
                  <Badge tone={STATUS[w.status].tone}>{STATUS[w.status].label}</Badge>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

function Withdraw({ available, min, stripe, open }: { available: number; min: number; stripe: StripeStatus; open?: Earnings["withdrawals"][number] }) {
  const [amount, setAmount] = useState(available >= min ? String(available) : "");
  const [error, setError] = useState("");
  const [done, setDone] = useState("");
  const [pending, start] = useTransition();
  const value = Number(amount);

  const blocker =
    stripe.status === "not_connected"
      ? "Set up Stripe first, so we know where to pay you."
      : stripe.status !== "ready"
        ? "Finish setting up Stripe first. Stripe still needs a few details from you."
        : open
          ? `Your withdrawal of ${gbp(open.amountGBP)} is on its way. You can ask again once it's paid.`
          : available < min
            ? `You can withdraw once you have at least ${gbp(min)} available.`
            : "";

  const submit = () =>
    start(async () => {
      setError("");
      const result = await requestWithdrawalAction(value);
      if (result.error) setError(result.error);
      else setDone(result.message ?? "Withdrawal requested.");
    });

  return (
    <Card>
      <CardHeader title="Withdraw" description={`Cleared money only. At least ${gbp(min)}.`} />
      <CardBody className="space-y-4">
        {done ? (
          <p className="flex items-start gap-2 text-sm text-foreground" role="status">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" /> {done}
          </p>
        ) : blocker ? (
          <p className="flex items-start gap-2 rounded-2xl bg-surface-2 p-3 text-sm text-muted-foreground">
            <Clock className="mt-0.5 size-4 shrink-0" /> {blocker}
          </p>
        ) : (
          <>
            <Field label="Amount (£)" htmlFor="withdraw-amount" hint={`Up to ${gbp(available)}`} error={error || undefined}>
              <Input id="withdraw-amount" type="number" inputMode="decimal" min={min} max={available} step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </Field>
            <Button className="w-full" disabled={pending || !(value >= min && value <= available)} onClick={submit}>
              <Send /> {pending ? "Sending…" : `Withdraw ${value > 0 ? gbp(value) : ""}`}
            </Button>
          </>
        )}
      </CardBody>
    </Card>
  );
}

const STRIPE_STATE: Record<StripeStatus["status"], { label: string; tone: "success" | "warning" | "primary" | "neutral" }> = {
  ready: { label: "Ready", tone: "success" },
  review: { label: "Needs details", tone: "warning" },
  incomplete: { label: "Not finished", tone: "warning" },
  not_connected: { label: "Not set up", tone: "neutral" },
};

/** Where withdrawals go: the doctor's Stripe account. Stripe keeps the bank or card details. */
function StripePayouts({ stripe, backFromStripe }: { stripe: StripeStatus; backFromStripe?: "return" | "refresh" }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  const notice =
    backFromStripe === "return"
      ? stripe.status === "ready"
        ? "Stripe is set up. Your withdrawals will be paid there."
        : "Thanks. Stripe is checking your details; this page shows when it's done."
      : "";

  const open = () =>
    start(async () => {
      setError("");
      const result = await stripeLinkAction();
      if (!result.url) {
        setError(result.error ?? "We couldn't open Stripe. Please try again.");
        return;
      }
      // The dashboard opens in a new tab; the sign-up form replaces this page and comes back here.
      if (result.kind === "dashboard") window.open(result.url, "_blank", "noopener");
      else window.location.assign(result.url);
    });

  // Back from Stripe: tidy the address, and get a fresh link if the old one expired.
  useEffect(() => {
    if (!backFromStripe) return;
    window.history.replaceState(null, "", window.location.pathname);
    if (backFromStripe === "refresh") open();
    // Runs once, when the page opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const state = STRIPE_STATE[stripe.status];
  const action =
    stripe.status === "not_connected" ? "Set up payouts" : stripe.status === "ready" ? "Change bank or card in Stripe" : "Continue with Stripe";

  return (
    <Card>
      <CardHeader
        title="Payout account"
        description="We pay you through Stripe. Stripe keeps your bank account or debit card; we never see the numbers."
        action={<Badge tone={state.tone}>{state.label}</Badge>}
      />
      <CardBody className="space-y-4">
        {notice && (
          <p className="flex items-start gap-2 rounded-2xl bg-success-soft p-3 text-sm text-success" role="status">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0" /> {notice}
          </p>
        )}
        {stripe.status === "ready" ? (
          <div className="flex items-center gap-3 rounded-2xl border border-border p-4">
            <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-2xl bg-success-soft text-success">
              <Landmark className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">{stripe.destination ?? "Your Stripe account"}</p>
              <p className="text-xs text-muted-foreground">Withdrawals go here. Stripe pays out in a few working days.</p>
            </div>
          </div>
        ) : stripe.status === "not_connected" ? (
          <ul className="space-y-2 text-sm text-muted-foreground">
            {["Takes about 5 minutes on Stripe's secure form", "Add a bank account or a debit card to be paid into", "Stripe checks your identity once, as the law requires"].map((t) => (
              <li key={t} className="flex items-start gap-2">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" /> {t}
              </li>
            ))}
          </ul>
        ) : (
          <p className="flex items-start gap-2 rounded-2xl bg-warning-soft p-3 text-sm text-foreground">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />
            {stripe.status === "incomplete"
              ? "You started setting up Stripe but didn't finish. Continue where you left off."
              : stripe.requirementsDue > 0
                ? `Stripe needs ${stripe.requirementsDue === 1 ? "one more detail" : `${stripe.requirementsDue} more details`} before it can pay you.`
                : "Stripe is checking your details. This usually takes a few minutes."}
          </p>
        )}
        {error && (
          <p className="rounded-xl border border-danger/30 bg-danger/10 p-3 text-sm text-danger" role="alert">
            {error}
          </p>
        )}
        <Button className="w-full" variant={stripe.status === "ready" ? "outline" : "primary"} disabled={pending} onClick={open}>
          {pending ? <Loader2 className="animate-spin" /> : <ExternalLink />} {pending ? "Opening Stripe…" : action}
        </Button>
      </CardBody>
    </Card>
  );
}
