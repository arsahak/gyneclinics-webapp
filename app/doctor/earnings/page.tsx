import type { Metadata } from "next";
import { DoctorEarnings } from "@/component/doctor/earnings";
import { PageHeader } from "@/component/shared/page-header";
import { getMyEarnings } from "@/lib/services/payouts";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Earnings",
  description: "Your share of each consultation and your withdrawals through Stripe.",
  path: "/doctor/earnings",
});

// The layout checks the session on the server, so this page is rendered per request.
export const instant = false;

export default async function DoctorEarningsPage({ searchParams }: { searchParams: Promise<{ stripe?: string | string[] }> }) {
  const [earnings, { stripe }] = await Promise.all([getMyEarnings(), searchParams]);
  // Stripe sends the doctor back with ?stripe=return (done) or ?stripe=refresh (link expired).
  const back = stripe === "return" || stripe === "refresh" ? stripe : undefined;
  return (
    <>
      <PageHeader title="Earnings" description="Your share of each consultation, paid out through Stripe." />
      {earnings ? (
        <DoctorEarnings earnings={earnings} backFromStripe={back} />
      ) : (
        <p className="rounded-2xl border border-border bg-surface p-6 text-sm text-muted-foreground">We couldn&apos;t load your earnings. Please try again in a moment.</p>
      )}
    </>
  );
}
