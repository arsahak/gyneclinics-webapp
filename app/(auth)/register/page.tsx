import type { Metadata } from "next";
import { Suspense } from "react";
import { RoleSelect } from "@/component/auth/role-select";
import { Skeleton } from "@/component/ui/skeleton";
import { requirePendingSignup } from "@/lib/session";

export const metadata: Metadata = { title: "Create your account" };

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
