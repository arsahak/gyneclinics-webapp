import type { Metadata } from "next";
import { ConsentForm } from "@/component/auth/consent-form";
import { Hydrated } from "@/component/shared/hydrated";
import { Skeleton } from "@/component/ui/skeleton";

export const metadata: Metadata = { title: "Consent & disclaimer" };

export default function ConsentPage() {
  return (
    <Hydrated fallback={<Skeleton className="h-96" />}>
      <ConsentForm />
    </Hydrated>
  );
}
