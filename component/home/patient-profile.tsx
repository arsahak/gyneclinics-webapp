"use client";

import { differenceInYears, parseISO } from "date-fns";
import { Bell, BellOff, Loader2, Pencil } from "lucide-react";
import { useState, useSyncExternalStore, useTransition } from "react";
import { useAccount } from "@/component/shared/account-provider";
import { AppearanceCard, PrivacyCard } from "@/component/shared/account-settings";
import { LocationCard } from "@/component/shared/location-card";
import { Avatar } from "@/component/ui/avatar";
import { Badge } from "@/component/ui/badge";
import { Button } from "@/component/ui/button";
import { Card, CardBody, CardHeader } from "@/component/ui/card";
import { Dialog } from "@/component/ui/dialog";
import { Field, Input, Select, Switch } from "@/component/ui/field";
import { updatePatientProfile } from "@/app/actions/profileAction";
import { useToday } from "@/lib/hooks";
import { useTracker } from "@/lib/store/tracker";
import type { PatientProfile, PregnancyStatus } from "@/lib/types";

const PREGNANCY_LABEL: Record<PregnancyStatus, string> = {
  not_pregnant: "Not pregnant",
  trying: "Trying to conceive",
  pregnant: "Pregnant",
  postpartum: "Recently gave birth",
};

export function PatientProfileView() {
  const today = useToday();
  const { patient, phone } = useAccount();
  const seedDemo = useTracker((s) => s.seedDemo);
  const [editing, setEditing] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, startSaving] = useTransition();
  if (!patient) return null;

  const age = patient.dateOfBirth ? differenceInYears(today, parseISO(patient.dateOfBirth)) : null;
  const details = [
    { label: "Age", value: age !== null ? `${age} years` : "—" },
    { label: "Height", value: `${patient.heightCm} cm` },
    { label: "Weight", value: `${patient.weightKg} kg` },
    { label: "Usual cycle", value: `${patient.typicalCycleLength} days` },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-6">
        <Card>
          <CardBody>
            <div className="flex items-center gap-4">
              <Avatar name={patient.fullName} hue={330} size="lg" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-serif text-xl font-semibold text-foreground">{patient.fullName}</p>
                <p className="text-sm text-muted-foreground">{phone}</p>
                <Badge tone="secondary" className="mt-1">{PREGNANCY_LABEL[patient.pregnancyStatus]}</Badge>
              </div>
              <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                <Pencil /> Edit
              </Button>
            </div>
            <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {details.map((d) => (
                <div key={d.label} className="rounded-2xl bg-surface-2 p-3">
                  <dt className="text-xs text-muted-foreground">{d.label}</dt>
                  <dd className="font-semibold text-foreground">{d.value}</dd>
                </div>
              ))}
            </dl>
          </CardBody>
        </Card>
        <RemindersCard />
        <AppearanceCard />
      </div>
      <div className="space-y-6">
        <LocationCard />
        <PrivacyCard onResetDemo={seedDemo} />
      </div>
      <EditProfileDialog
        key={String(editing)}
        open={editing}
        onClose={() => {
          setEditing(false);
          setSaveError(null);
        }}
        profile={patient}
        saving={saving}
        error={saveError}
        onSave={(p) => {
          setSaveError(null);
          startSaving(async () => {
            const result = await updatePatientProfile(p);
            if (result?.error) setSaveError(result.error);
            else setEditing(false);
          });
        }}
      />
    </div>
  );
}

function subscribeNoop() {
  return () => {};
}

function RemindersCard() {
  const reminders = useTracker((s) => s.reminders);
  const setReminders = useTracker((s) => s.setReminders);
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

function EditProfileDialog({
  open,
  onClose,
  profile,
  onSave,
  saving,
  error,
}: {
  open: boolean;
  onClose: () => void;
  profile: PatientProfile;
  onSave: (profile: PatientProfile) => void;
  saving: boolean;
  error: string | null;
}) {
  const [form, setForm] = useState(profile);
  return (
    <Dialog open={open} onClose={onClose} title="Edit profile">
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          onSave(form);
        }}
      >
        <Field label="Full name" htmlFor="p-name">
          <Input id="p-name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Height (cm)" htmlFor="p-height">
            <Input id="p-height" type="number" value={form.heightCm} onChange={(e) => setForm({ ...form, heightCm: Number(e.target.value) })} />
          </Field>
          <Field label="Weight (kg)" htmlFor="p-weight">
            <Input id="p-weight" type="number" step="0.1" value={form.weightKg} onChange={(e) => setForm({ ...form, weightKg: Number(e.target.value) })} />
          </Field>
          <Field label="Usual cycle (days)" htmlFor="p-cycle">
            <Input id="p-cycle" type="number" value={form.typicalCycleLength} onChange={(e) => setForm({ ...form, typicalCycleLength: Number(e.target.value) })} />
          </Field>
          <Field label="Usual period (days)" htmlFor="p-period">
            <Input id="p-period" type="number" value={form.typicalPeriodLength} onChange={(e) => setForm({ ...form, typicalPeriodLength: Number(e.target.value) })} />
          </Field>
        </div>
        <Field label="Pregnancy status" htmlFor="p-preg">
          <Select id="p-preg" value={form.pregnancyStatus} onChange={(e) => setForm({ ...form, pregnancyStatus: e.target.value as PregnancyStatus })}>
            {Object.entries(PREGNANCY_LABEL).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </Select>
        </Field>
        {form.pregnancyStatus === "pregnant" && (
          <Field label="Estimated due date" htmlFor="p-due">
            <Input id="p-due" type="date" value={form.dueDate ?? ""} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
          </Field>
        )}
        {error && (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        )}
        <Button type="submit" className="w-full" disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="animate-spin" /> Saving…
            </>
          ) : (
            "Save changes"
          )}
        </Button>
      </form>
    </Dialog>
  );
}
