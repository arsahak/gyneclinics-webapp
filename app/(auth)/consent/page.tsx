import type { Metadata } from "next";
import { Suspense } from "react";
import { ConsentForm } from "@/component/auth/consent-form";
import { Skeleton } from "@/component/ui/skeleton";
import { requireConsentStep } from "@/lib/session";
import { PRIVATE_ROBOTS, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  ...pageMetadata({ title: "Consent & disclaimer", description: "Review and accept GyneX's health data consent and medical disclaimer to continue.", path: "/consent" }),
  robots: PRIVATE_ROBOTS,
};

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
