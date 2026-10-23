"use client";

import { differenceInYears, format, parseISO } from "date-fns";
import { Bell, BellOff, CheckCircle2, Loader2, Pencil, Phone } from "lucide-react";
import { useState, useSyncExternalStore, useTransition } from "react";
import { removeAvatarAction, updatePatientProfile, uploadAvatarAction } from "@/app/actions/profileAction";
import { useAccount } from "@/component/shared/account-provider";
import { AppearanceCard, PrivacyCard } from "@/component/shared/account-settings";
import { AvatarUploader, NO_PHOTO_CHANGE, type PhotoChange } from "@/component/shared/avatar-uploader";
import { LocationCard } from "@/component/shared/location-card";
import { PageHeader } from "@/component/shared/page-header";
import { Badge } from "@/component/ui/badge";
import { Button } from "@/component/ui/button";
import { Card, CardBody, CardHeader } from "@/component/ui/card";
import { Field, Input, Select, Switch } from "@/component/ui/field";
import { useToday } from "@/lib/hooks";
import { useTracker } from "@/lib/store/tracker";
import type { PatientProfile, PregnancyStatus } from "@/lib/types";

const PREGNANCY_LABEL: Record<PregnancyStatus, string> = {
  not_pregnant: "Not pregnant",
  trying: "Trying to conceive",
  pregnant: "Pregnant",
  postpartum: "Recently gave birth",
};

const sameProfile = (a: PatientProfile, b: PatientProfile) => JSON.stringify(a) === JSON.stringify(b);

/** The first problem with the form, or null. Same limits as onboarding and the backend. */
function validate(f: PatientProfile, today: string): string | null {
  if (f.fullName.trim().length < 2) return "Please enter your full name.";
  if (!f.dateOfBirth) return "Please enter your date of birth.";
  if (f.dateOfBirth > today) return "Date of birth can't be in the future.";
  if (!(f.heightCm >= 100 && f.heightCm <= 230)) return "Height must be 100–230 cm.";
  if (!(f.weightKg >= 25 && f.weightKg <= 250)) return "Weight must be 25–250 kg.";
  if (!(f.typicalCycleLength >= 15 && f.typicalCycleLength <= 60)) return "Usual cycle must be 15–60 days.";
  if (!(f.typicalPeriodLength >= 1 && f.typicalPeriodLength <= 14)) return "Usual period must be 1–14 days.";
  if (f.lastPeriodStart && f.lastPeriodStart > today) return "Last period start can't be in the future.";
  if (f.pregnancyStatus === "pregnant" && !f.dueDate) return "Please enter your estimated due date.";
  return null;
}

/** Profile & settings. "Edit" turns the details into a form on the page, with the photo. */
export function PatientProfileView() {
  const today = useToday();
  const todayStr = format(today, "yyyy-MM-dd");
  const { patient, phone, avatar } = useAccount();
  const clearTracker = useTracker((s) => s.clear);
  // The newest logged weight, else the one from the profile.
  const latestWeight = useTracker((s) => [...s.weights].sort((a, b) => b.date.localeCompare(a.date))[0]?.kg);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<PatientProfile | null>(patient);
  // A picked or removed photo, saved together with the form.
  const [photo, setPhoto] = useState<PhotoChange>(NO_PHOTO_CHANGE);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [saving, startSaving] = useTransition();
  if (!patient || !form) return null;

  const set = <K extends keyof PatientProfile>(key: K, value: PatientProfile[K]) => {
    setForm((f) => (f ? { ...f, [key]: value } : f));
    setError(null);
  };

  const photoChanged = Boolean(photo.file) || photo.remove;
  const detailsChanged = !sameProfile(form, patient);
  const dirty = detailsChanged || photoChanged;

  const startEditing = () => {
    setForm(patient);
    setPhoto(NO_PHOTO_CHANGE);
    setError(null);
    setNotice(null);
    setEditing(true);
  };

  const cancelEditing = () => {
    setForm(patient);
    setPhoto(NO_PHOTO_CHANGE);
    setError(null);
    setEditing(false);
  };

  const save = () => {
    const problem = validate(form, todayStr);
    if (problem) return setError(problem);
    startSaving(async () => {
      // Photo first, so a failed upload keeps the form open with nothing half-saved.
      if (photo.file) {
        const data = new FormData();
        data.append("avatar", photo.file);
        const uploaded = await uploadAvatarAction(data);
        if ("error" in uploaded) return setError(uploaded.error);
      } else if (photo.remove) {
        const removed = await removeAvatarAction();
        if (removed?.error) return setError(removed.error);
      }
      setPhoto(NO_PHOTO_CHANGE);
      if (detailsChanged) {
        const result = await updatePatientProfile({ ...form, fullName: form.fullName.trim() });
        if (result?.error) return setError(result.error);
      }
      setNotice("Profile saved");
      setEditing(false);
    });
  };

  const shown = editing ? form : patient;
  const age = patient.dateOfBirth ? differenceInYears(today, parseISO(patient.dateOfBirth)) : null;
  const day = (value?: string) => (value ? format(parseISO(value), "d MMM yyyy") : "");
  const details = [
    { label: "Age", value: age !== null ? `${age} years` : "" },
    { label: "Date of birth", value: day(patient.dateOfBirth) },
    { label: "Height", value: `${patient.heightCm} cm` },
    { label: "Weight", value: `${latestWeight ?? patient.weightKg} kg` },
    { label: "Usual cycle", value: `${patient.typicalCycleLength} days` },
    { label: "Usual period", value: `${patient.typicalPeriodLength} days` },
    { label: "Last period started", value: day(patient.lastPeriodStart) },
    { label: "Pregnancy", value: PREGNANCY_LABEL[patient.pregnancyStatus] },
    ...(patient.pregnancyStatus === "pregnant" ? [{ label: "Due date", value: day(patient.dueDate) }] : []),
  ];

  return (
    <>
      <PageHeader
        title="Profile & settings"
        description="Manage your details, reminders, location and privacy."
        action={
          !editing && (
            <Button size="sm" variant="outline" onClick={startEditing} className="self-start">
              <Pencil /> Edit
            </Button>
          )
        }
      />
      <div className={editing ? "grid gap-6 pb-24 lg:grid-cols-2" : "grid gap-6 lg:grid-cols-2"}>
        <div className="space-y-6">
          {/* Identity */}
          <Card>
            <CardBody className="flex flex-wrap items-center gap-4">
              <AvatarUploader
                name={shown.fullName || "You"}
                avatar={avatar}
                hue={330}
                editable={editing}
                change={photo}
                onChange={(next) => {
                  setPhoto(next);
                  setError(null);
                }}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-serif text-xl font-semibold text-foreground">{shown.fullName || "Your name"}</p>
                <Badge tone="secondary" className="mt-1">
                  {PREGNANCY_LABEL[shown.pregnancyStatus]}
                </Badge>
              </div>
              <div className="flex items-center gap-2 rounded-2xl bg-surface-2 px-3 py-2 text-sm">
                <Phone className="size-4 text-primary" />
                <div>
                  <p className="font-medium text-foreground">{phone}</p>
                  <p className="text-xs text-muted-foreground">Sign-in number</p>
                </div>
              </div>
            </CardBody>
          </Card>

          {notice && !editing && (
            <p role="status" className="flex items-center gap-2 rounded-2xl bg-success-soft p-3 text-sm text-success">
              <CheckCircle2 className="size-4 shrink-0" /> {notice}
            </p>
          )}

          {editing ? (
            <>
              <Card>
                <CardHeader title="About you" description="Your name is only shown to doctors you chat with." />
                <CardBody className="grid gap-4 sm:grid-cols-2">
                  <Field label="Full name" htmlFor="p-name">
                    <Input id="p-name" value={form.fullName} onChange={(e) => set("fullName", e.target.value)} />
                  </Field>
                  <Field label="Date of birth" htmlFor="p-dob">
                    <Input id="p-dob" type="date" max={todayStr} value={form.dateOfBirth} onChange={(e) => set("dateOfBirth", e.target.value)} />
                  </Field>
                </CardBody>
              </Card>
              <Card>
                <CardHeader title="Body basics" description="A new weight is added to your weight chart too." />
                <CardBody className="grid grid-cols-2 gap-4">
                  <Field label="Height (cm)" htmlFor="p-height">
                    <Input id="p-height" type="number" inputMode="numeric" value={form.heightCm || ""} onChange={(e) => set("heightCm", Number(e.target.value))} />
                  </Field>
                  <Field label="Weight (kg)" htmlFor="p-weight">
                    <Input id="p-weight" type="number" inputMode="decimal" step="0.1" value={form.weightKg || ""} onChange={(e) => set("weightKg", Number(e.target.value))} />
                  </Field>
                </CardBody>
              </Card>
              <Card>
                <CardHeader title="Menstrual history" description="Used to estimate your cycle until you've logged a few periods." />
                <CardBody className="grid grid-cols-2 gap-4">
                  <Field label="Usual cycle (days)" htmlFor="p-cycle">
                    <Input id="p-cycle" type="number" inputMode="numeric" value={form.typicalCycleLength || ""} onChange={(e) => set("typicalCycleLength", Number(e.target.value))} />
                  </Field>
                  <Field label="Usual period (days)" htmlFor="p-period">
                    <Input id="p-period" type="number" inputMode="numeric" value={form.typicalPeriodLength || ""} onChange={(e) => set("typicalPeriodLength", Number(e.target.value))} />
                  </Field>
                  <Field label="Last period started" hint="Optional" htmlFor="p-last" className="col-span-2">
                    <Input id="p-last" type="date" max={todayStr} value={form.lastPeriodStart} onChange={(e) => set("lastPeriodStart", e.target.value)} />
                  </Field>
                </CardBody>
              </Card>
              <Card>
                <CardHeader title="Pregnancy status" />
                <CardBody className="grid gap-4 sm:grid-cols-2">
                  <Field label="Status" htmlFor="p-preg">
                    <Select id="p-preg" value={form.pregnancyStatus} onChange={(e) => set("pregnancyStatus", e.target.value as PregnancyStatus)}>
                      {Object.entries(PREGNANCY_LABEL).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  {form.pregnancyStatus === "pregnant" && (
                    <Field label="Estimated due date" htmlFor="p-due">
                      <Input id="p-due" type="date" min={todayStr} value={form.dueDate ?? ""} onChange={(e) => set("dueDate", e.target.value)} />
                    </Field>
                  )}
                </CardBody>
              </Card>
            </>
          ) : (
            <Card>
              <CardHeader title="Your details" description="Used for your cycle estimates and charts." />
              <CardBody>
                <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {details.map((d) => (
                    <div key={d.label} className="rounded-2xl bg-surface-2 p-3">
                      <dt className="text-xs text-muted-foreground">{d.label}</dt>
                      <dd className="mt-0.5 font-semibold text-foreground">{d.value || <span className="font-normal text-muted-foreground">—</span>}</dd>
                    </div>
                  ))}
                </dl>
              </CardBody>
            </Card>
          )}

          {!editing && <RemindersCard />}
          {!editing && <AppearanceCard />}
        </div>
        <div className="space-y-6">
          <LocationCard />
          <PrivacyCard onClearTracker={clearTracker} />
        </div>
      </div>

      {/* Save bar */}
      {editing && (
        <div className="fixed inset-x-0 bottom-20 z-20 px-4 lg:bottom-6 lg:left-64">
          <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-3 rounded-2xl border border-border bg-surface p-3 shadow-[var(--shadow-lift)]">
            <div className="min-w-0 flex-1 text-sm">
              {error ? (
                <p role="alert" className="text-danger">
                  {error}
                </p>
              ) : dirty ? (
                <p className="text-muted-foreground">You have unsaved changes.</p>
              ) : (
                <p className="text-muted-foreground">Make your changes, then save.</p>
              )}
            </div>
            <Button variant="outline" disabled={saving} onClick={cancelEditing}>
              Cancel
            </Button>
            <Button disabled={saving || !dirty} onClick={save}>
              {saving ? (
                <>
                  <Loader2 className="animate-spin" /> Saving…
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

function subscribeNoop() {
  return () => {};
}

function RemindersCard() {
  const reminders = useTracker((s) => s.reminders);
  const saveReminders = useTracker((s) => s.setReminders);
  const [error, setError] = useState<string | null>(null);
  const setReminders = (changes: Parameters<typeof saveReminders>[0]) => {
    setError(null);
    void saveReminders(changes).then(setError);
  };
  const initialPermission = useSyncExternalStore(
    subscribeNoop,
    () => ("Notification" in window ? Notification.permission : "unsupported"),
    () => "default",
  );
  const [permission, setPermission] = useState<string | null>(null);
  const current = permission ?? initialPermission;

  return (
    <Card id="reminders">
      <CardHeader title="Reminders" description="Based on your logged cycle history." />
      <CardBody className="space-y-5">
        <Switch
          checked={reminders.periodReminder}
          onChange={(v) => setReminders({ periodReminder: v })}
          label="Upcoming period"
          description={`Remind me ${reminders.daysBefore} day${reminders.daysBefore === 1 ? "" : "s"} before`}
        />
        {reminders.periodReminder && (
          <Field label="Days before" htmlFor="days-before">
            <Select id="days-before" value={reminders.daysBefore} onChange={(e) => setReminders({ daysBefore: Number(e.target.value) })}>
              {[1, 2, 3, 5, 7].map((n) => (
                <option key={n} value={n}>{n} day{n === 1 ? "" : "s"} before</option>
              ))}
            </Select>
          </Field>
        )}
        <Switch checked={reminders.fertileReminder} onChange={(v) => setReminders({ fertileReminder: v })} label="Fertile window" description="When your estimated fertile window begins" />
        <Switch checked={reminders.dailyLogReminder} onChange={(v) => setReminders({ dailyLogReminder: v })} label="Daily check-in" description="A gentle nudge to log symptoms" />
        {error && (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        )}
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-surface-2 p-3 text-sm">
          <span className="flex items-center gap-2 text-muted-foreground">
            {current === "granted" ? <Bell className="size-4 text-success" /> : <BellOff className="size-4" />}
            {current === "granted"
              ? "Browser notifications are on"
              : current === "denied"
                ? "Notifications are blocked in your browser"
                : current === "unsupported"
                  ? "Notifications aren't supported here"
                  : "Browser notifications are off"}
          </span>
          {current === "default" && (
            <Button size="sm" variant="outline" onClick={() => Notification.requestPermission().then(setPermission)}>
              Turn on
            </Button>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
