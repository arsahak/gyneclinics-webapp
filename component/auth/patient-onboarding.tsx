"use client";

import { addDays, format, parseISO } from "date-fns";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import { Button } from "@/component/ui/button";
import { Field, Input } from "@/component/ui/field";
import { completePatientOnboarding } from "@/app/actions/profileAction";
import { useTracker } from "@/lib/store/tracker";
import type { PatientProfile, PregnancyStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { StepHeader } from "./step-header";

const pregnancyOptions: Array<{ value: PregnancyStatus; label: string; body: string }> = [
  { value: "not_pregnant", label: "Not pregnant", body: "Tracking my cycle and general health" },
  { value: "trying", label: "Trying to conceive", body: "I'd like to understand my fertile window" },
  { value: "pregnant", label: "Pregnant", body: "Track baby growth from my scan reports" },
  { value: "postpartum", label: "Recently gave birth", body: "Recovering after pregnancy" },
];

const STEPS = 4;

export function PatientOnboarding({ fullName }: { fullName: string }) {
  const [today] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [saving, startSaving] = useTransition();
  const [form, setForm] = useState<PatientProfile>({
    fullName,
    dateOfBirth: "",
    heightCm: 0,
    weightKg: 0,
    typicalCycleLength: 28,
    typicalPeriodLength: 5,
    lastPeriodStart: "",
    pregnancyStatus: "not_pregnant",
  });

  const update = <K extends keyof PatientProfile>(key: K, value: PatientProfile[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const valid = [
    form.fullName.trim().length > 1 && !!form.dateOfBirth,
    form.heightCm >= 100 && form.heightCm <= 230 && form.weightKg >= 25 && form.weightKg <= 250,
    form.typicalCycleLength >= 15 && form.typicalCycleLength <= 60 && form.typicalPeriodLength >= 1 && form.typicalPeriodLength <= 14,
    form.pregnancyStatus !== "pregnant" || !!form.dueDate,
  ][step - 1];

  const finish = () => {
    setError(null);
    // The cycle log still lives in this browser; start it from the onboarding answers.
    const tracker = useTracker.getState();
    tracker.reset();
    if (form.lastPeriodStart) {
      tracker.addPeriod({
        start: form.lastPeriodStart,
        end: format(addDays(parseISO(form.lastPeriodStart), form.typicalPeriodLength - 1), "yyyy-MM-dd"),
      });
    }
    tracker.addWeight({ date: today, kg: form.weightKg });
    startSaving(async () => {
      // Redirects to the consent step on success.
      const result = await completePatientOnboarding(form);
      if (result?.error) setError(result.error);
    });
  };

  const titles = [
    ["Tell us about you", "Your name is only shown to doctors you choose to chat with."],
    ["Your body basics", "Used for your weight chart. You can update these any time."],
    ["Your menstrual history", "This helps estimate your next period until you've logged a few cycles."],
    ["Pregnancy status", "We'll tailor your insights to what matters to you right now."],
  ];

  return (
    <>
      <StepHeader step={step} total={STEPS} title={titles[step - 1][0]} description={titles[step - 1][1]} />

      <div className="space-y-5">
        {step === 1 && (
          <>
            <Field label="Full name" htmlFor="name">
              <Input id="name" autoComplete="name" value={form.fullName} onChange={(e) => update("fullName", e.target.value)} placeholder="e.g. Ayesha Khan" />
            </Field>
            <Field label="Date of birth" htmlFor="dob">
              <Input id="dob" type="date" max={today} value={form.dateOfBirth} onChange={(e) => update("dateOfBirth", e.target.value)} />
            </Field>
          </>
        )}

        {step === 2 && (
          <div className="grid grid-cols-2 gap-4">
            <Field label="Height (cm)" htmlFor="height">
              <Input id="height" type="number" inputMode="decimal" min={100} max={230} value={form.heightCm || ""} onChange={(e) => update("heightCm", Number(e.target.value))} placeholder="163" />
            </Field>
            <Field label="Weight (kg)" htmlFor="weight">
              <Input id="weight" type="number" inputMode="decimal" step="0.1" min={25} max={250} value={form.weightKg || ""} onChange={(e) => update("weightKg", Number(e.target.value))} placeholder="61.5" />
            </Field>
          </div>
        )}

        {step === 3 && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Usual cycle length" hint="Days, start to start" htmlFor="cycle">
                <Input id="cycle" type="number" min={15} max={60} value={form.typicalCycleLength} onChange={(e) => update("typicalCycleLength", Number(e.target.value))} />
              </Field>
              <Field label="Usual period length" hint="Days of bleeding" htmlFor="period">
                <Input id="period" type="number" min={1} max={14} value={form.typicalPeriodLength} onChange={(e) => update("typicalPeriodLength", Number(e.target.value))} />
              </Field>
            </div>
            <Field label="When did your last period start?" hint="Optional — leave blank if you're not sure." htmlFor="last">
              <Input id="last" type="date" max={today} value={form.lastPeriodStart} onChange={(e) => update("lastPeriodStart", e.target.value)} />
            </Field>
          </>
        )}

        {step === 4 && (
          <>
            <div role="radiogroup" className="grid gap-3">
              {pregnancyOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={form.pregnancyStatus === option.value}
                  onClick={() => update("pregnancyStatus", option.value)}
                  className={cn(
                    "rounded-2xl border-2 bg-surface p-4 text-left transition-colors",
                    form.pregnancyStatus === option.value ? "border-primary" : "border-border hover:border-primary/40",
                  )}
                >
                  <span className="block font-medium text-foreground">{option.label}</span>
                  <span className="block text-sm text-muted-foreground">{option.body}</span>
                </button>
              ))}
            </div>
            {form.pregnancyStatus === "pregnant" && (
              <Field label="Estimated due date" htmlFor="due">
                <Input id="due" type="date" min={today} value={form.dueDate ?? ""} onChange={(e) => update("dueDate", e.target.value)} />
              </Field>
            )}
          </>
        )}
      </div>

      {error && (
        <p role="alert" className="mt-6 text-sm text-danger">
          {error}
        </p>
      )}
      <div className="mt-8 flex gap-3">
        {step > 1 && (
          <Button variant="outline" size="lg" disabled={saving} onClick={() => setStep(step - 1)}>
            <ArrowLeft /> Back
          </Button>
        )}
        <Button
          size="lg"
          className="flex-1"
          disabled={!valid || saving}
          onClick={() => (step < STEPS ? setStep(step + 1) : finish())}
        >
          {saving ? (
            <>
              <Loader2 className="animate-spin" /> Saving…
            </>
          ) : (
            <>
              {step < STEPS ? "Continue" : "Save profile"} <ArrowRight />
            </>
          )}
        </Button>
      </div>
    </>
  );
}
