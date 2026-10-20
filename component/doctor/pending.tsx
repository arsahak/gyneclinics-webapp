"use client";

import { CheckCircle2, Circle, FileCheck2, Hourglass, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/component/ui/button";
import { Card, CardBody } from "@/component/ui/card";
import { useSession } from "@/lib/store/session";
import { cn } from "@/lib/utils";

export function PendingVerification() {
  const router = useRouter();
  const doctor = useSession((s) => s.doctor);
  const setDoctorStatus = useSession((s) => s.setDoctorStatus);

  const steps = [
    { label: "Profile submitted", body: "We've received your details and documents.", done: true },
    { label: "Document review", body: "Our team is checking your registration with the issuing body.", done: false, current: true },
    { label: "Profile goes live", body: "Patients can find you and start chats.", done: false },
  ];

  return (
    <div className="mx-auto max-w-2xl">
      <div className="text-center">
        <span className="mx-auto inline-flex size-16 items-center justify-center rounded-full bg-gold-soft text-gold">
          <Hourglass className="size-8" />
        </span>
        <h1 className="mt-5 font-serif text-3xl font-semibold tracking-tight text-foreground">Your profile is under review</h1>
        <p className="mx-auto mt-2 max-w-md text-muted-foreground">
          Thanks{doctor ? `, ${doctor.fullName}` : ""}. Verification usually takes 1–2 working days. Your profile stays hidden until it&apos;s approved.
        </p>
      </div>

      <Card className="mt-8">
        <CardBody>
          <ol className="space-y-6">
            {steps.map((step) => (
              <li key={step.label} className="flex gap-4">
                {step.done ? (
                  <CheckCircle2 className="size-6 shrink-0 text-success" />
                ) : (
                  <Circle className={cn("size-6 shrink-0", step.current ? "text-gold" : "text-border")} />
                )}
                <div>
                  <p className={cn("font-semibold", step.done || step.current ? "text-foreground" : "text-muted-foreground")}>{step.label}</p>
                  <p className="text-sm text-muted-foreground">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </CardBody>
      </Card>

      {doctor && doctor.documents.length > 0 && (
        <Card className="mt-4">
          <CardBody>
            <p className="mb-3 text-sm font-semibold text-foreground">Submitted documents</p>
            <ul className="space-y-2">
              {doctor.documents.map((doc) => (
                <li key={doc} className="flex items-center gap-3 rounded-xl bg-surface-2 px-3 py-2 text-sm">
                  <FileCheck2 className="size-4 text-primary" /> <span className="truncate">{doc}</span>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      )}

      <p className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <Mail className="size-4" /> We&apos;ll notify you by SMS when your profile is approved.
      </p>

      <div className="mt-8 rounded-2xl border border-dashed border-border p-4 text-center">
        <p className="mb-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">Demo only</p>
        <Button
          variant="outline"
          onClick={() => {
            setDoctorStatus("approved");
            router.push("/doctor");
          }}
        >
          Simulate admin approval
        </Button>
      </div>
    </div>
  );
}
