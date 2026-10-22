import "server-only";
import { api } from "@/lib/api";

// A doctor's earnings and withdrawals from the backend (GET /payouts/me).

/**
 * not_connected: hasn't started; incomplete: Stripe's form isn't finished;
 * review: submitted, Stripe is checking or needs more; ready: can be paid.
 */
export interface StripeStatus {
  status: "not_connected" | "incomplete" | "review" | "ready";
  /** "Barclays •••• 6789" or "Visa debit •••• 4242". */
  destination: string | null;
  requirementsDue: number;
  disabledReason?: string | null;
}

export interface Earnings {
  balance: {
    clearingGBP: number;
    clearedGBP: number;
    requestedGBP: number;
    paidOutGBP: number;
    availableGBP: number;
    lifetimeGBP: number;
    consultations: number;
  };
  minWithdrawalGBP: number;
  /** on_request: sent within 3 working days of asking; weekly: every Friday. */
  payoutSchedule: "on_request" | "weekly";
  /** The doctor's Stripe payout account. */
  stripe: StripeStatus;
  withdrawals: {
    _id: string;
    amountGBP: number;
    status: "requested" | "processing" | "paid" | "rejected";
    createdAt: string;
    paidAt?: string;
    transferRef?: string;
    rejectionReason?: string;
    /** Where it was sent, e.g. "Barclays •••• 6789". */
    destination: string;
  }[];
}

export async function getMyEarnings(): Promise<Earnings | null> {
  const result = await api<Earnings>("/payouts/me");
  return result.ok ? result.data : null;
}
