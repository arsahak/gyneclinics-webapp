import { Suspense } from "react";
import { AccountProvider } from "@/component/shared/account-provider";
import { AppShell, AppShellSkeleton } from "@/component/layout/app-shell";
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
  return (
    <AccountProvider account={account}>
      <AppShell role="patient">{children}</AppShell>
    </AccountProvider>
  );
}
