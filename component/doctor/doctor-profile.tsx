"use client";

import { AlertTriangle, BadgeCheck, CheckCircle2, Clock, Hourglass, Loader2, Pencil, Phone, ShieldCheck, Star, XCircle } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { type MyDoctorChanges, type MyDoctorProfile, updateMyDoctorProfile } from "@/app/actions/doctorAction";
import { removeAvatarAction, uploadAvatarAction } from "@/app/actions/profileAction";
import { ChipInput, SPECIALIZATIONS } from "@/component/auth/doctor-onboarding";
import { AppearanceCard, PrivacyCard } from "@/component/shared/account-settings";
import { AvatarUploader, NO_PHOTO_CHANGE, type PhotoChange } from "@/component/shared/avatar-uploader";
import { PageHeader } from "@/component/shared/page-header";
import { Badge } from "@/component/ui/badge";
import { Button } from "@/component/ui/button";
import { Card, CardBody, CardHeader } from "@/component/ui/card";
import { Field, Input, Select, Switch, Textarea } from "@/component/ui/field";
import { usePricing } from "@/lib/store/pricing";

// The doctor edits their whole profile here. Only changed fields are sent.
// For an approved doctor, changes wait for an admin: the doctor sees their
// new version marked "In review", patients keep seeing the approved one.
// (The backend decides what's reviewed.)

type Form = Required<MyDoctorChanges>;

/** The profile as the doctor last saved it: live values with changes in review on top. */
function withPendingChanges(profile: MyDoctorProfile): MyDoctorProfile {
  const pending = profile.pendingUpdate;
  if (!pending) return profile;
  return { ...profile, ...pending.fields, avatar: pending.avatar ?? profile.avatar };
}

/** Saved straight away, without admin review. */
const DIRECT_FIELDS: string[] = ["email", "messaging"];

const REVIEW_FIELDS: Array<keyof Form> = ["registrationNumber", "registrationBody", "qualifications"];

/** Form values from the profile, with changes still in review on top. */
const toForm = (profile: MyDoctorProfile): Form => {
  const p = withPendingChanges(profile);
  return {
  fullName: p.fullName,
  email: p.email,
  title: p.title,
  specialization: p.specialization || SPECIALIZATIONS[0],
  qualifications: p.qualifications,
  experienceYears: p.experienceYears,
  focusAreas: p.focusAreas,
  registrationNumber: p.registrationNumber,
  registrationBody: p.registrationBody,
  clinic: p.clinic,
  city: p.city,
  country: p.country,
  languages: p.languages,
  about: p.about,
  feeGBP: p.feeGBP,
  messaging: p.messaging,
  };
};

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

function validate(f: Form): string | null {
  if (f.fullName.trim().length < 2) return "Please enter your full name.";
  if (f.title.trim().length < 2) return "Please enter your job title.";
  if (!f.qualifications.length) return "Add at least one qualification.";
  if (!Number.isInteger(f.experienceYears) || f.experienceYears < 0 || f.experienceYears > 70) return "Experience must be 0–70 years.";
  if (f.registrationNumber.trim().length < 3) return "Please enter your registration number.";
  if (f.registrationBody.trim().length < 2) return "Please enter your registration body.";
  if (f.city.trim().length < 2) return "Please enter your city.";
  if (f.country.trim() && !/^[A-Za-z]{2}$/.test(f.country.trim())) return "Country must be a 2-letter code, e.g. GB.";
  if (!f.languages.length) return "Add at least one language.";
  if (!(f.feeGBP >= 0)) return "The fee can't be negative.";
  if (!f.messaging.free && !f.messaging.consultation) return "Turn on free messages or consultations, so patients can reach you.";
  if (f.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) return "Please enter a valid email address.";
  return null;
}

const STATUS_BADGE = {
  approved: { tone: "primary" as const, icon: BadgeCheck, label: "Verified" },
  pending: { tone: "warning" as const, icon: Clock, label: "Under review" },
  rejected: { tone: "danger" as const, icon: AlertTriangle, label: "Not verified" },
};

export function DoctorProfileView({ profile }: { profile: MyDoctorProfile }) {
  const { regions, fee } = usePricing();
  const [saved, setSaved] = useState<Form>(() => toForm(profile));
  const [form, setForm] = useState<Form>(() => toForm(profile));
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [saving, startSaving] = useTransition();
  const [editing, setEditing] = useState(false);
  // A picked or removed photo, saved together with the form.
  const [photo, setPhoto] = useState<PhotoChange>(NO_PHOTO_CHANGE);

  const set = <K extends keyof Form>(key: K, value: Form[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setError(null);
    setNotice(null);
  };

  const changes = useMemo(() => {
    const diff: MyDoctorChanges = {};
    for (const key of Object.keys(form) as Array<keyof Form>) {
      if (!same(form[key], saved[key])) (diff as Record<string, unknown>)[key] = form[key];
    }
    return diff;
  }, [form, saved]);
  const photoChanged = Boolean(photo.file) || photo.remove;
  const dirty = Object.keys(changes).length > 0 || photoChanged;
  // What the save bar warns about before saving.
  const approved = profile.verificationStatus === "approved";
  const reviewNote = !approved
    ? profile.verificationStatus === "rejected" && REVIEW_FIELDS.some((key) => key in changes)
      ? "Saving sends your profile back for review."
      : null
    : !profile.autoApproveUpdates && (photoChanged || Object.keys(changes).some((key) => !DIRECT_FIELDS.includes(key)))
      ? "Patients will see these changes after an admin approves them."
      : REVIEW_FIELDS.some((key) => key in changes)
        ? "An admin checks registration changes before patients see them."
        : null;
  const pending = profile.pendingUpdate;

  const save = () => {
    const problem = validate(form);
    if (problem) return setError(problem);
    startSaving(async () => {
      // Photo first, so a failed upload keeps the form open with nothing half-saved.
      let inReview = false;
      if (photo.file) {
        const data = new FormData();
        data.append("avatar", photo.file);
        const uploaded = await uploadAvatarAction(data);
        if ("error" in uploaded) return setError(uploaded.error);
        inReview = uploaded.inReview;
      } else if (photo.remove) {
        const removed = await removeAvatarAction();
        if (removed?.error) return setError(removed.error);
        inReview = approved && !profile.autoApproveUpdates;
      }
      setPhoto(NO_PHOTO_CHANGE);

      let message = inReview ? "Saved. Patients will see your changes once an admin approves them." : "Profile saved";
      if (Object.keys(changes).length > 0) {
        const result = await updateMyDoctorProfile(changes);
        if (result.error) return setError(result.error);
        if (result.profile) {
          setSaved(toForm(result.profile));
          setForm(toForm(result.profile));
        }
        if (result.inReview || !inReview) message = result.message ?? message;
      }
      setNotice(message);
      setEditing(false);
    });
  };

  const startEditing = () => {
    setForm(saved);
    setPhoto(NO_PHOTO_CHANGE);
    setError(null);
    setNotice(null);
    setEditing(true);
  };

  const cancelEditing = () => {
    setForm(saved);
    setPhoto(NO_PHOTO_CHANGE);
    setError(null);
    setEditing(false);
  };

  const status = STATUS_BADGE[profile.verificationStatus];

  return (
    <>
    <PageHeader
      title="Profile & settings"
      description="Your public profile, registration, fee and account."
      action={
        !editing && (
          <Button size="sm" variant="outline" onClick={startEditing} className="self-start">
            <Pencil /> Edit
          </Button>
        )
      }
    />
    <div className="grid gap-6 pb-24 lg:grid-cols-[1fr_340px]">
      <div className="space-y-6">
        {/* Identity */}
        <Card>
          <CardBody className="flex flex-wrap items-center gap-4">
            <AvatarUploader
              name={form.fullName || "Doctor"}
              avatar={withPendingChanges(profile).avatar}
              hue={186}
              editable={editing}
              change={photo}
              onChange={(next) => {
                setPhoto(next);
                setError(null);
                setNotice(null);
              }}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate font-serif text-xl font-semibold text-foreground">{form.fullName || "Your name"}</p>
              <p className="text-sm text-muted-foreground">{[form.title, form.specialization].filter(Boolean).join(" · ")}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge tone={status.tone}>
                  <status.icon /> {status.label}
                </Badge>
                {pending && (
                  <Badge tone="warning">
                    <Hourglass /> Update in review
                  </Badge>
                )}
                {profile.reviewCount > 0 && (
                  <Badge tone="gold">
                    <Star /> {profile.rating.toFixed(1)} ({profile.reviewCount})
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-2xl bg-surface-2 px-3 py-2 text-sm">
              <Phone className="size-4 text-primary" />
              <div>
                <p className="font-medium text-foreground">{profile.phone}</p>
                <p className="text-xs text-muted-foreground">Sign-in number</p>
              </div>
            </div>
          </CardBody>
        </Card>

        {pending ? (
          <div className="flex gap-3 rounded-2xl border border-warning/30 bg-warning-soft p-4 text-sm">
            <Hourglass className="mt-0.5 size-4 shrink-0 text-warning" />
            <div>
              <p className="font-medium text-foreground">Your changes are waiting for approval</p>
              <p className="text-muted-foreground">
                You see your updated profile here. Patients keep seeing your previous profile until an admin approves the
                changes (sent {new Date(pending.submittedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}).
              </p>
            </div>
          </div>
        ) : (
          profile.updateRejection && (
            <div className="flex gap-3 rounded-2xl border border-danger/30 bg-danger-soft p-4 text-sm">
              <XCircle className="mt-0.5 size-4 shrink-0 text-danger" />
              <div>
                <p className="font-medium text-foreground">Your last profile update wasn&apos;t approved</p>
                <p className="text-muted-foreground">
                  {profile.updateRejection.reason || "Patients still see your previous profile."} You can edit and send it again.
                </p>
              </div>
            </div>
          )
        )}

        {notice && !editing && (
          <p className="flex items-center gap-2 rounded-2xl bg-success-soft p-3 text-sm text-success">
            <CheckCircle2 className="size-4 shrink-0" /> {notice}
          </p>
        )}

        {!editing && <ProfileDetails form={saved} />}

        {editing && (
          <>
        {/* About */}
        <Card>
          <CardHeader title="About you" description="Shown to patients on your profile." />
          <CardBody className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" htmlFor="p-name">
                <Input id="p-name" value={form.fullName} maxLength={100} onChange={(e) => set("fullName", e.target.value)} />
              </Field>
              <Field label="Job title" htmlFor="p-title">
                <Input id="p-title" value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Consultant Gynaecologist" />
              </Field>
              <Field label="Specialisation" htmlFor="p-spec">
                <Select id="p-spec" value={form.specialization} onChange={(e) => set("specialization", e.target.value)}>
                  {SPECIALIZATIONS.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Years of experience" htmlFor="p-exp">
                <Input
                  id="p-exp"
                  type="number"
                  min={0}
                  max={70}
                  value={Number.isNaN(form.experienceYears) ? "" : form.experienceYears}
                  onChange={(e) => set("experienceYears", Number(e.target.value))}
                />
              </Field>
            </div>
            <Field label="Areas of focus" hint="Press Enter to add each one.">
              <ChipInput values={form.focusAreas} onChange={(v) => set("focusAreas", v)} placeholder="e.g. PCOS" />
            </Field>
            <Field label="About" htmlFor="p-about" hint={`${form.about.length}/2000`}>
              <Textarea id="p-about" maxLength={2000} value={form.about} onChange={(e) => set("about", e.target.value)} placeholder="A short, friendly introduction." />
            </Field>
          </CardBody>
        </Card>

        {/* Qualifications & registration */}
        <Card>
          <CardHeader title="Qualifications & registration" description="Checked by our team before your profile is shown to patients." />
          <CardBody className="space-y-4">
            <Field label="Qualifications" hint="Press Enter to add each one.">
              <ChipInput values={form.qualifications} onChange={(v) => set("qualifications", v)} placeholder="e.g. MRCOG" />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Registration body" htmlFor="p-body">
                <Input id="p-body" value={form.registrationBody} onChange={(e) => set("registrationBody", e.target.value)} />
              </Field>
              <Field label="Registration number" htmlFor="p-reg">
                <Input id="p-reg" value={form.registrationNumber} onChange={(e) => set("registrationNumber", e.target.value)} />
              </Field>
            </div>
            <p className="flex items-start gap-2 rounded-2xl bg-surface-2 p-3 text-xs text-muted-foreground">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
              Changing your qualifications or registration sends your profile back for review. It&apos;s hidden from patients until it&apos;s approved again.
            </p>
          </CardBody>
        </Card>

        {/* Practice & contact */}
        <Card>
          <CardHeader title="Practice & contact" />
          <CardBody className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-[1fr_1fr_110px]">
              <Field label="Clinic or hospital" htmlFor="p-clinic">
                <Input id="p-clinic" value={form.clinic} onChange={(e) => set("clinic", e.target.value)} />
              </Field>
              <Field label="City" htmlFor="p-city">
                <Input id="p-city" value={form.city} onChange={(e) => set("city", e.target.value)} />
              </Field>
              <Field label="Country" htmlFor="p-country">
                <Input id="p-country" maxLength={2} value={form.country} onChange={(e) => set("country", e.target.value.toUpperCase())} placeholder="GB" />
              </Field>
            </div>
            <Field label="Languages you consult in">
              <ChipInput values={form.languages} onChange={(v) => set("languages", v)} placeholder="e.g. Bangla" />
            </Field>
            <Field label="Email (optional)" htmlFor="p-email" hint="For account notices. Never shown to patients.">
              <Input id="p-email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="you@example.com" />
            </Field>
          </CardBody>
        </Card>

        {/* Messaging */}
        <Card>
          <CardHeader
            title="How patients reach you"
            description="Turn on one or both. These changes go live when you save, without admin review."
          />
          <CardBody className="space-y-4">
            <Switch
              checked={form.messaging.free}
              onChange={(free) => set("messaging", { ...form.messaging, free })}
              label="Free messages"
              description="Patients can message you without booking or paying."
            />
            <Switch
              checked={form.messaging.consultation}
              onChange={(consultation) => set("messaging", { ...form.messaging, consultation })}
              label="Message consultation"
              description="Patients book and pay your fee for a chat consultation, with free follow-up."
            />
            {!form.messaging.free && !form.messaging.consultation && (
              <p role="alert" className="text-sm text-danger">
                Turn on at least one, so patients can reach you.
              </p>
            )}
          </CardBody>
        </Card>

        {/* Fee */}
        <Card>
          <CardHeader title="Consultation fee" description="Europe & UK price. Other regions adjust automatically." />
          <CardBody className="space-y-4">
            {!form.messaging.consultation && (
              <p className="rounded-2xl bg-surface-2 p-3 text-sm text-muted-foreground">
                Consultations are off, so patients don&apos;t see this fee.
              </p>
            )}
            <Field label="Base fee (GBP)" htmlFor="p-fee" hint="0 makes your consultations free.">
              <Input
                id="p-fee"
                type="number"
                min={0}
                value={Number.isNaN(form.feeGBP) ? "" : form.feeGBP}
                onChange={(e) => set("feeGBP", Number(e.target.value))}
                className="sm:max-w-48"
              />
            </Field>
            {form.feeGBP > 0 && (
              <dl className="grid grid-cols-2 gap-x-6 gap-y-1.5 rounded-2xl bg-surface-2 p-4 text-sm">
                {regions.map((r) => (
                  <div key={r.id} className="flex justify-between gap-2">
                    <dt className="text-muted-foreground">{r.name}</dt>
                    <dd className="font-medium text-foreground tabular-nums">{fee(form.feeGBP, r.id).label}</dd>
                  </div>
                ))}
              </dl>
            )}
          </CardBody>
        </Card>
          </>
        )}
      </div>

      <div className="space-y-6">
        <AppearanceCard />
        <PrivacyCard />
      </div>

      {/* Save bar */}
      {editing && (
        <div className="fixed inset-x-0 bottom-20 z-20 px-4 lg:bottom-6 lg:left-64">
          <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-3 rounded-2xl border border-border bg-surface p-3 shadow-[var(--shadow-lift)]">
            <div className="min-w-0 flex-1 text-sm">
              {error ? (
                <p role="alert" className="text-danger">{error}</p>
              ) : reviewNote ? (
                <p className="flex items-center gap-2 text-warning">
                  <AlertTriangle className="size-4 shrink-0" /> {reviewNote}
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
    </div>
    </>
  );
}

/** The profile as patients and the doctor read it (not editing). */
function ProfileDetails({ form }: { form: Form }) {
  const { regions, fee } = usePricing();
  const tags = (values: string[]) =>
    values.length ? (
      <div className="flex flex-wrap gap-1.5">
        {values.map((value) => (
          <Badge key={value} tone="primary">
            {value}
          </Badge>
        ))}
      </div>
    ) : (
      <span className="text-muted-foreground">—</span>
    );

  const rows = (items: Array<{ label: string; value: React.ReactNode }>) => (
    <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
      {items.map((row) => (
        <div key={row.label}>
          <dt className="text-xs text-muted-foreground">{row.label}</dt>
          <dd className="mt-1 text-sm font-medium text-foreground">{row.value || <span className="text-muted-foreground">—</span>}</dd>
        </div>
      ))}
    </dl>
  );

  return (
    <>
      <Card>
        <CardHeader title="About you" description="Shown to patients on your profile." />
        <CardBody className="space-y-5">
          {rows([
            { label: "Job title", value: form.title },
            { label: "Specialisation", value: form.specialization },
            { label: "Experience", value: `${form.experienceYears} ${form.experienceYears === 1 ? "year" : "years"}` },
            { label: "Areas of focus", value: tags(form.focusAreas) },
          ])}
          <div>
            <p className="text-xs text-muted-foreground">About</p>
            <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-foreground">
              {form.about || <span className="text-muted-foreground">No introduction yet.</span>}
            </p>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Qualifications & registration" />
        <CardBody>
          {rows([
            { label: "Qualifications", value: tags(form.qualifications) },
            { label: "Registration body", value: form.registrationBody },
            { label: "Registration number", value: <span className="font-mono">{form.registrationNumber}</span> },
          ])}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Practice & contact" />
        <CardBody>
          {rows([
            { label: "Clinic or hospital", value: form.clinic },
            { label: "Location", value: [form.city, form.country].filter(Boolean).join(", ") },
            { label: "Languages", value: tags(form.languages) },
            { label: "Email", value: form.email },
          ])}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="How patients reach you" />
        <CardBody>
          {rows([
            { label: "Free messages", value: form.messaging.free ? "On" : "Off" },
            { label: "Message consultation", value: form.messaging.consultation ? "On" : "Off" },
          ])}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Consultation fee" description="Europe & UK price. Other regions adjust automatically." />
        <CardBody className="space-y-4">
          <p className="text-2xl font-semibold text-foreground">{form.feeGBP > 0 ? `£${form.feeGBP}` : "Free"}</p>
          {form.feeGBP > 0 && (
            <dl className="grid grid-cols-2 gap-x-6 gap-y-1.5 rounded-2xl bg-surface-2 p-4 text-sm">
              {regions.map((r) => (
                <div key={r.id} className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">{r.name}</dt>
                  <dd className="font-medium text-foreground tabular-nums">{fee(form.feeGBP, r.id).label}</dd>
                </div>
              ))}
            </dl>
          )}
        </CardBody>
      </Card>
    </>
  );
}
