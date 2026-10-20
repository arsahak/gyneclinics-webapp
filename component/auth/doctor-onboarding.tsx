"use client";

import { ArrowLeft, ArrowRight, FileCheck2, Plus, Upload, X, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/component/ui/badge";
import { Button } from "@/component/ui/button";
import { Field, Input, Select, Switch, Textarea } from "@/component/ui/field";
import { SLOT_LENGTHS, TIME_OPTIONS, toMinutes, WEEKDAYS_SHORT } from "@/lib/availability";
import { REGION_LIST, regionalFee } from "@/lib/locale/regions";
import { DEMO_DOCTOR_ID } from "@/lib/mock/doctors";
import { useAvailability } from "@/lib/store/availability";
import { useSession } from "@/lib/store/session";
import type { DoctorProfileDraft } from "@/lib/types";
import { cn } from "@/lib/utils";
import { StepHeader } from "./step-header";

const SPECIALIZATIONS = [
  "General Gynaecology",
  "Reproductive Medicine",
  "Urogynaecology & Pelvic Health",
  "Menopause & HRT",
  "Pregnancy Care",
  "Adolescent Gynaecology",
  "Intimate Wellness",
];

const STEPS = 5;

function ChipInput({ values, onChange, placeholder }: { values: string[]; onChange: (v: string[]) => void; placeholder: string }) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const value = draft.trim();
    if (value && !values.includes(value)) onChange([...values, value]);
    setDraft("");
  };
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input value={draft} placeholder={placeholder} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            add();
          }
        }} />
        <Button variant="outline" size="icon" onClick={add} aria-label="Add">
          <Plus />
        </Button>
      </div>
      {values.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {values.map((value) => (
            <Badge key={value} tone="primary" className="py-1 text-sm">
              {value}
              <button type="button" aria-label={`Remove ${value}`} onClick={() => onChange(values.filter((v) => v !== value))}>
                <X />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

export function DoctorOnboarding() {
  const router = useRouter();
  const saveDoctor = useSession((s) => s.saveDoctor);
  const saveSchedule = useAvailability((s) => s.saveSchedule);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<DoctorProfileDraft>({
    fullName: "",
    title: "",
    specialization: SPECIALIZATIONS[0],
    qualifications: [],
    experienceYears: 0,
    registrationNumber: "",
    registrationBody: "General Medical Council (UK)",
    clinic: "",
    city: "",
    languages: ["English"],
    feeGBP: 40,
    consultationAvailability: {
      weekdays: [0, 1, 2, 3, 4],
      startTime: "09:00",
      endTime: "17:00",
      slotMinutes: 30,
      instantChat: true,
    },
    about: "",
    documents: [],
  });

  const update = <K extends keyof DoctorProfileDraft>(key: K, value: DoctorProfileDraft[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const valid = [
    form.fullName.trim().length > 3 && form.title.trim().length > 2,
    form.qualifications.length > 0 && form.experienceYears > 0,
    form.registrationNumber.trim().length > 3 && form.documents.length > 0,
    form.city.trim().length > 1 && form.languages.length > 0,
    form.feeGBP > 0 &&
      form.consultationAvailability.weekdays.length > 0 &&
      toMinutes(form.consultationAvailability.endTime) > toMinutes(form.consultationAvailability.startTime),
  ][step - 1];

  const titles = [
    ["Your professional profile", "This is what patients will see when they find you."],
    ["Qualifications & experience", "List the degrees and memberships patients should know about."],
    ["Registration & documents", "Our team checks these before your profile goes live."],
    ["Your practice", "Add where you practise and the languages you consult in."],
    ["Availability & consultation fee", "Choose when patients can book you and set your base fee."],
  ];

  return (
    <>
      <StepHeader step={step} total={STEPS} title={titles[step - 1][0]} description={titles[step - 1][1]} />

      <div className="space-y-5">
        {step === 1 && (
          <>
            <Field label="Full name" htmlFor="name">
              <Input id="name" value={form.fullName} onChange={(e) => update("fullName", e.target.value)} placeholder="Dr. Jane Smith" />
            </Field>
            <Field label="Job title" htmlFor="title">
              <Input id="title" value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="Consultant Gynaecologist" />
            </Field>
            <Field label="Specialisation" htmlFor="spec">
              <Select id="spec" value={form.specialization} onChange={(e) => update("specialization", e.target.value)}>
                {SPECIALIZATIONS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </Select>
            </Field>
            <Field label="About you" hint="A short, friendly introduction." htmlFor="about">
              <Textarea id="about" value={form.about} onChange={(e) => update("about", e.target.value)} placeholder="My special interests include…" />
            </Field>
          </>
        )}

        {step === 2 && (
          <>
            <Field label="Qualifications" hint="Press Enter to add each one, e.g. MBBS, MRCOG.">
              <ChipInput values={form.qualifications} onChange={(v) => update("qualifications", v)} placeholder="Add a qualification" />
            </Field>
            <Field label="Years of experience" htmlFor="exp">
              <Input id="exp" type="number" min={0} max={60} value={form.experienceYears || ""} onChange={(e) => update("experienceYears", Number(e.target.value))} />
            </Field>
          </>
        )}

        {step === 3 && (
          <>
            <Field label="Registration body" htmlFor="body">
              <Input id="body" value={form.registrationBody} onChange={(e) => update("registrationBody", e.target.value)} />
            </Field>
            <Field label="Registration number" htmlFor="reg">
              <Input id="reg" value={form.registrationNumber} onChange={(e) => update("registrationNumber", e.target.value)} placeholder="GMC 1234567" />
            </Field>
            <Field label="Supporting documents" hint="Registration certificate, degree certificates and photo ID (PDF or image).">
              <label className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-border bg-surface p-6 text-center hover:border-primary/50">
                <Upload className="size-6 text-primary" />
                <span className="text-sm font-medium text-foreground">Choose files to upload</span>
                <span className="text-xs text-muted-foreground">Max 10 MB each</span>
                <input
                  type="file"
                  multiple
                  accept=".pdf,image/*"
                  className="sr-only"
                  onChange={(e) => {
                    const names = Array.from(e.target.files ?? []).map((f) => f.name);
                    update("documents", [...new Set([...form.documents, ...names])]);
                  }}
                />
              </label>
              {form.documents.length > 0 && (
                <ul className="mt-3 space-y-2">
                  {form.documents.map((doc) => (
                    <li key={doc} className="flex items-center gap-3 rounded-xl bg-surface-2 px-3 py-2 text-sm">
                      <FileCheck2 className="size-4 text-success" />
                      <span className="flex-1 truncate">{doc}</span>
                      <button type="button" aria-label={`Remove ${doc}`} onClick={() => update("documents", form.documents.filter((d) => d !== doc))}>
                        <X className="size-4 text-muted-foreground" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </Field>
          </>
        )}

        {step === 4 && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Clinic / hospital" htmlFor="clinic">
                <Input id="clinic" value={form.clinic} onChange={(e) => update("clinic", e.target.value)} />
              </Field>
              <Field label="City" htmlFor="city">
                <Input id="city" value={form.city} onChange={(e) => update("city", e.target.value)} />
              </Field>
            </div>
            <Field label="Languages">
              <ChipInput values={form.languages} onChange={(v) => update("languages", v)} placeholder="Add a language" />
            </Field>
          </>
        )}

        {step === 5 && (
          <>
            <Field label="Days you're available" hint="Patients can request a consultation on the days you select.">
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
                {WEEKDAYS_SHORT.map((day, index) => {
                  const selected = form.consultationAvailability.weekdays.includes(index);
                  return (
                    <button
                      key={day}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => {
                        const weekdays = selected
                          ? form.consultationAvailability.weekdays.filter((value) => value !== index)
                          : [...form.consultationAvailability.weekdays, index].sort((a, b) => a - b);
                        update("consultationAvailability", { ...form.consultationAvailability, weekdays });
                      }}
                      className={cn(
                        "h-11 rounded-xl border text-sm font-medium transition-colors",
                        selected ? "border-primary bg-primary text-primary-foreground" : "border-border bg-surface text-muted-foreground hover:border-primary/40",
                      )}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="From" htmlFor="availability-start">
                <Select
                  id="availability-start"
                  value={form.consultationAvailability.startTime}
                  onChange={(e) => update("consultationAvailability", { ...form.consultationAvailability, startTime: e.target.value })}
                >
                  {TIME_OPTIONS.map((time) => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Until" htmlFor="availability-end">
                <Select
                  id="availability-end"
                  value={form.consultationAvailability.endTime}
                  onChange={(e) => update("consultationAvailability", { ...form.consultationAvailability, endTime: e.target.value })}
                >
                  {TIME_OPTIONS.map((time) => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </Select>
              </Field>
            </div>

            <Field label="Consultation length" htmlFor="slot-length">
              <Select
                id="slot-length"
                value={form.consultationAvailability.slotMinutes}
                onChange={(e) => update("consultationAvailability", { ...form.consultationAvailability, slotMinutes: Number(e.target.value) })}
              >
                {SLOT_LENGTHS.map((minutes) => (
                  <option key={minutes} value={minutes}>{minutes} minutes</option>
                ))}
              </Select>
            </Field>

            <Switch
              checked={form.consultationAvailability.instantChat}
              onChange={(instantChat) => update("consultationAvailability", { ...form.consultationAvailability, instantChat })}
              label={<span className="inline-flex items-center gap-1.5"><Zap className="size-4 text-primary" /> Allow &quot;Chat now&quot;</span>}
              description="Let patients start an instant chat while you're online."
            />

            <Field label="Base consultation fee (GBP)" hint="This is the Europe & UK price. Other regions are adjusted automatically." htmlFor="fee">
              <Input id="fee" type="number" min={1} value={form.feeGBP || ""} onChange={(e) => update("feeGBP", Number(e.target.value))} />
            </Field>
            {form.feeGBP > 0 && (
              <div className="rounded-2xl border border-border bg-surface p-4">
                <p className="mb-3 text-sm font-medium text-foreground">What patients will pay</p>
                <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  {REGION_LIST.map((region) => (
                    <div key={region.id} className="flex justify-between gap-2">
                      <dt className="text-muted-foreground">{region.name}</dt>
                      <dd className="font-medium text-foreground">{regionalFee(form.feeGBP, region.id).label}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </>
        )}
      </div>

      <div className="mt-8 flex gap-3">
        {step > 1 && (
          <Button variant="outline" size="lg" onClick={() => setStep(step - 1)}>
            <ArrowLeft /> Back
          </Button>
        )}
        <Button
          size="lg"
          className="flex-1"
          disabled={!valid}
          onClick={() => {
            if (step < STEPS) return setStep(step + 1);
            saveDoctor(form);
            const availability = form.consultationAvailability;
            saveSchedule(DEMO_DOCTOR_ID, {
              weekly: Array.from({ length: 7 }, (_, day) =>
                availability.weekdays.includes(day) ? [{ start: availability.startTime, end: availability.endTime }] : [],
              ),
              slotMinutes: availability.slotMinutes,
              bookingWindowDays: 7,
              minNoticeHours: 1,
              instantChat: availability.instantChat,
              timeOff: [],
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Europe/London",
            });
            router.push("/consent");
          }}
        >
          {step < STEPS ? "Continue" : "Submit for verification"} <ArrowRight />
        </Button>
      </div>
    </>
  );
}
