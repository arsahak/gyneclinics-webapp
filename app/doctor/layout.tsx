import { Suspense } from "react";
import { AccountProvider } from "@/component/shared/account-provider";
import { PortalData } from "@/component/shared/portal-data";
import { AppShell, AppShellSkeleton } from "@/component/layout/app-shell";
import { getMyConsultations } from "@/lib/services/consultations";
import { requireAppAccess } from "@/lib/session";
import type { Metadata } from "next";
import { PRIVATE_ROBOTS } from "@/lib/seo";

// Signed-in pages stay out of search results.
export const metadata: Metadata = { robots: PRIVATE_ROBOTS };

// Reads the session, so it can't be part of the static shell.
export const instant = false;

export default function DoctorLayout({ children }: LayoutProps<"/doctor">) {
  return (
    <Suspense fallback={<AppShellSkeleton role="doctor" />}>
      <DoctorArea>{children}</DoctorArea>
    </Suspense>
  );
}

/** Checks the session on the server (unverified doctors only see /doctor/pending), then loads their bookings. */
async function DoctorArea({ children }: { children: React.ReactNode }) {
  const account = await requireAppAccess("doctor");
  const consultations = account.nextStep === "home" ? await getMyConsultations() : [];
  return (
    <AccountProvider account={account}>
      <PortalData consultations={consultations}>
        <AppShell role="doctor">{children}</AppShell>
      </PortalData>
    </AccountProvider>
  );
}
