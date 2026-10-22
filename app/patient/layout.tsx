import { Suspense } from "react";
import { AccountProvider } from "@/component/shared/account-provider";
import { AdsProvider } from "@/component/shared/ads-provider";
import { AppShell, AppShellSkeleton } from "@/component/layout/app-shell";
import { getServedAds } from "@/lib/services/ads";
import { requireAppAccess } from "@/lib/session";

// Reads the session, so it can't be part of the static shell.
export const instant = false;

export default function PatientLayout({ children }: LayoutProps<"/patient">) {
  return (
    <Suspense fallback={<AppShellSkeleton />}>
      <PatientArea>{children}</PatientArea>
    </Suspense>
  );
}

/** Checks the session on the server before anything in /patient renders. */
async function PatientArea({ children }: { children: React.ReactNode }) {
  const account = await requireAppAccess("patient");
  // The ad for each slot, once for the whole area (set in the admin dashboard).
  const ads = await getServedAds(["home", "learn-feed", "article-end", "doctors-feed"]);
  return (
    <AccountProvider account={account}>
      <AdsProvider ads={ads}>
        <AppShell role="patient">{children}</AppShell>
      </AdsProvider>
    </AccountProvider>
  );
}
