"use client";

import { ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/component/ui/button";
import { Checkbox } from "@/component/ui/field";
import { nextStepFor, useSession } from "@/lib/store/session";
import { StepHeader } from "./step-header";

const PATIENT_TERMS = [
  "GyneClinics provides general health information and guidance. It does not diagnose, treat or prevent any medical condition.",
  "Cycle predictions, fertile windows and other insights are estimates based only on the data you enter. They are not a form of contraception.",
  "Doctors on GyneClinics give advice through chat, which does not replace an in-person examination.",
  "In an emergency, call your local emergency number or go to the nearest hospital.",
];

const DOCTOR_TERMS = [
  "Advice given through GyneClinics is informational and does not replace an in-person consultation or examination.",
  "You will not request or share personal contact details, or move conversations outside the platform.",
  "Your registration and documents will be verified by our team before your profile is visible to patients.",
  "Chat metadata may be monitored for safety and compliance. Message content stays private.",
];

export function ConsentForm() {
  const router = useRouter();
  const role = useSession((s) => s.role);
  const acceptConsent = useSession((s) => s.acceptConsent);
  const [disclaimer, setDisclaimer] = useState(false);
  const [data, setData] = useState(false);

  const terms = role === "doctor" ? DOCTOR_TERMS : PATIENT_TERMS;

  return (
    <>
      <StepHeader
        step={3}
        total={3}
        title="Before you begin"
        description="Please read and accept the following. You can review this any time in Settings."
      />

      <div className="rounded-3xl border border-border bg-surface p-5">
        <div className="mb-4 flex items-center gap-2 font-semibold text-foreground">
          <ShieldCheck className="size-5 text-primary" /> Medical disclaimer
        </div>
        <ul className="space-y-3 text-sm leading-relaxed text-muted-foreground">
          {terms.map((term) => (
            <li key={term} className="flex gap-3">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
              {term}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 space-y-4">
        <Checkbox
          checked={disclaimer}
          onChange={(e) => setDisclaimer(e.target.checked)}
          label="I understand and accept the medical disclaimer"
        />
        <Checkbox
          checked={data}
          onChange={(e) => setData(e.target.checked)}
          label="I consent to GyneClinics processing my health data"
          description="Your data is encrypted, used only to provide the service, and never sold. You can export or delete it at any time."
        />
      </div>

      <Button
        size="lg"
        className="mt-8 w-full"
        disabled={!disclaimer || !data}
        onClick={() => {
          acceptConsent();
          router.push(nextStepFor(useSession.getState()));
        }}
      >
        Accept and continue
      </Button>
    </>
  );
}
