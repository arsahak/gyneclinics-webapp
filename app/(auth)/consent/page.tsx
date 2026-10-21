import type { Metadata } from "next";
import { Suspense } from "react";
import { ConsentForm } from "@/component/auth/consent-form";
import { Skeleton } from "@/component/ui/skeleton";
import { requireConsentStep } from "@/lib/session";

export const metadata: Metadata = { title: "Consent & disclaimer" };

// Reads the session, so it can't be part of the static shell.
export const instant = false;

export default function ConsentPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96" />}>
      <Consent />
    </Suspense>
  );
}

async function Consent() {
  const account = await requireConsentStep();
  return <ConsentForm role={account.role} />;
}
