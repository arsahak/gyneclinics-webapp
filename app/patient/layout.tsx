import { Suspense } from "react";
import { AccountProvider } from "@/component/shared/account-provider";
import { AdsProvider } from "@/component/shared/ads-provider";
import { PortalData } from "@/component/shared/portal-data";
import { AppShell, AppShellSkeleton } from "@/component/layout/app-shell";
import { getServedAds } from "@/lib/services/ads";
import { getMyConsultations } from "@/lib/services/consultations";
import { getMyTracker } from "@/lib/services/tracker";
import { requireAppAccess } from "@/lib/session";
import { EMPTY_TRACKER } from "@/lib/tracker";

// Reads the session, so it can't be part of the static shell.
export const instant = false;

export default function PatientLayout({ children }: LayoutProps<"/patient">) {
  return (
    <Suspense fallback={<AppShellSkeleton role="patient" />}>
      <PatientArea>{children}</PatientArea>
    </Suspense>
  );
}

/** Checks the session on the server, then loads what every patient page uses. */
async function PatientArea({ children }: { children: React.ReactNode }) {
  const account = await requireAppAccess("patient");
  const [ads, consultations, tracker] = await Promise.all([
    // The ad for each slot, once for the whole area (set in the admin dashboard).
    getServedAds(["home", "learn-feed", "article-end", "doctors-feed"]),
    getMyConsultations(),
    getMyTracker(),
  ]);
  return (
    <AccountProvider account={account}>
      <AdsProvider ads={ads}>
        <PortalData consultations={consultations} tracker={tracker ?? EMPTY_TRACKER} bookmarks={account.bookmarks}>
          <AppShell role="patient">{children}</AppShell>
        </PortalData>
      </AdsProvider>
    </AccountProvider>
  );
}
