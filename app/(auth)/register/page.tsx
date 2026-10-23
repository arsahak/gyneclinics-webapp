import type { Metadata } from "next";
import { Suspense } from "react";
import { RoleSelect } from "@/component/auth/role-select";
import { Skeleton } from "@/component/ui/skeleton";
import { requirePendingSignup } from "@/lib/session";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Create your account",
  description: "Join GyneX free with your mobile number to track your cycle and talk privately with verified gynaecologists.",
  path: "/register",
});

// Reads the session, so it can't be part of the static shell.
export const instant = false;

export default function RegisterPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96" />}>
      <Register />
    </Suspense>
  );
}

async function Register() {
  const { phone } = await requirePendingSignup();
  return <RoleSelect phone={phone} />;
}
