"use client";

import { CheckCircle2, Flag } from "lucide-react";
import { useState, useTransition } from "react";
import { reportDoctorAction } from "@/app/actions/reportAction";
import { Button } from "@/component/ui/button";
import { Dialog } from "@/component/ui/dialog";
import { Field, Select, Textarea } from "@/component/ui/field";

const REASONS = [
  { value: "medical_concern", label: "Unsafe or wrong medical advice" },
  { value: "off_platform", label: "Asked me to talk or pay outside GyneClinics" },
  { value: "no_reply", label: "Didn't reply to me" },
  { value: "behaviour", label: "Rude or inappropriate" },
  { value: "payment", label: "Problem with a payment" },
  { value: "fake_profile", label: "Their details look wrong or fake" },
  { value: "other", label: "Something else" },
];

/** "Report a problem" link and dialog on a doctor's profile. Goes to the GyneClinics team. */
export function ReportDoctor({ doctorId, doctorName }: { doctorId: string; doctorName: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState("");
  const [pending, startTransition] = useTransition();
  const valid = reason && details.trim().length >= 10;

  const submit = () =>
    startTransition(async () => {
      setError("");
      const result = await reportDoctorAction({ doctorId, reason, details });
      if (result.error) {
        setError(result.error);
        return;
      }
      setSent(result.message ?? "Thank you. Our team will look into it.");
      setReason("");
      setDetails("");
    });

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setSent("");
          setOpen(true);
        }}
        className="flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
      >
        <Flag className="size-4" /> Report a problem with this doctor
      </button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={sent ? "Report sent" : `Report ${doctorName}`}
        description={sent ? undefined : "Only the GyneClinics team sees this. The doctor isn't told who reported them."}
      >
        {sent ? (
          <div className="space-y-5">
            <p className="flex items-start gap-2 text-sm leading-relaxed text-foreground" role="status">
              <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success" /> {sent}
            </p>
            <Button className="w-full" onClick={() => setOpen(false)}>
              Done
            </Button>
          </div>
        ) : (
          <div className="space-y-5">
            <Field label="What happened?" htmlFor="report-reason">
              <Select id="report-reason" value={reason} onChange={(e) => setReason(e.target.value)}>
                <option value="">Choose one</option>
                {REASONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Tell us more" htmlFor="report-details">
              <Textarea
                id="report-details"
                value={details}
                maxLength={1000}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="What happened, and when? (at least 10 characters)"
              />
            </Field>
            {reason === "medical_concern" && (
              <p className="rounded-xl border border-danger/30 bg-danger/10 p-3 text-sm text-foreground">
                If you feel unwell now, call 999 (or your local emergency number) or go to A&amp;E. Don&apos;t wait for our reply.
              </p>
            )}
            {error && (
              <p className="rounded-xl border border-danger/30 bg-danger/10 p-3 text-sm text-danger" role="alert">
                {error}
              </p>
            )}
            <Button className="w-full" disabled={!valid || pending} onClick={submit}>
              {pending ? "Sending…" : "Send report"}
            </Button>
          </div>
        )}
      </Dialog>
    </>
  );
}
