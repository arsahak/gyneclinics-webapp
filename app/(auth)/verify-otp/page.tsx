import type { Metadata } from "next";
import { OtpForm } from "@/component/auth/otp-form";
import { Hydrated } from "@/component/shared/hydrated";
import { Skeleton } from "@/component/ui/skeleton";

export const metadata: Metadata = { title: "Verify your number" };

export default function VerifyOtpPage() {
  return (
    <Hydrated fallback={<Skeleton className="h-96" />}>
      <OtpForm />
    </Hydrated>
  );
}
