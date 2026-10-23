import { LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { auth } from "@/auth";
import { HOME } from "@/lib/account";

const buttonClass =
  "inline-flex h-9 items-center gap-1.5 rounded-full bg-white px-4 text-sm font-medium whitespace-nowrap text-primary transition-colors hover:bg-white/90 sm:px-5";

const PORTAL_LABEL = { patient: "Patient portal", doctor: "Doctor portal" } as const;

/**
 * Navbar button: "Log in", or a link to the user's own portal when they're
 * already signed in. Only this button reads the session cookie, so the rest
 * of the page stays static.
 */
export function NavAccount() {
  return (
    <Suspense fallback={<LoginLink />}>
      <AccountLink />
    </Suspense>
  );
}

async function AccountLink() {
  const role = (await auth())?.user?.role;
  if (role !== "patient" && role !== "doctor") return <LoginLink />;
  return (
    <Link href={HOME[role]} className={buttonClass}>
      <LayoutDashboard className="size-4 shrink-0" />
      <span className="sm:hidden">Portal</span>
      <span className="hidden sm:inline">{PORTAL_LABEL[role]}</span>
    </Link>
  );
}

function LoginLink() {
  return (
    <Link href="/login" className={buttonClass}>
      Log in
    </Link>
  );
}
