import { Suspense } from "react";
import { AccountProvider } from "@/component/shared/account-provider";
import { AppShell, AppShellSkeleton } from "@/component/layout/app-shell";
import { requireAppAccess } from "@/lib/session";

// Reads the session, so it can't be part of the static shell.
export const instant = false;

export default function DoctorLayout({ children }: LayoutProps<"/doctor">) {
  return (
    <Suspense fallback={<AppShellSkeleton />}>
      <DoctorArea>{children}</DoctorArea>
    </Suspense>
  );
}

/** Checks the session on the server; unverified doctors only see /doctor/pending. */
async function DoctorArea({ children }: { children: React.ReactNode }) {
  const account = await requireAppAccess("doctor");
  return (
    <AccountProvider account={account}>
      <AppShell role="doctor">{children}</AppShell>
    </AccountProvider>
  );
}
