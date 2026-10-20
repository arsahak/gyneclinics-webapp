"use client";

import { Award, BadgeCheck, Building2, Languages, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { AppearanceCard, PrivacyCard } from "@/component/shared/account-settings";
import { Avatar } from "@/component/ui/avatar";
import { Badge } from "@/component/ui/badge";
import { Button } from "@/component/ui/button";
import { Card, CardBody, CardHeader } from "@/component/ui/card";
import { Field, Input, Textarea } from "@/component/ui/field";
import { REGION_LIST, regionalFee } from "@/lib/locale/regions";
import { useSession } from "@/lib/store/session";

export function DoctorProfileView() {
  const doctor = useSession((s) => s.doctor);
  const saveDoctor = useSession((s) => s.saveDoctor);
  const setDoctorStatus = useSession((s) => s.setDoctorStatus);
  const [fee, setFee] = useState(doctor?.feeGBP ?? 0);
  const [about, setAbout] = useState(doctor?.about ?? "");
  const [saved, setSaved] = useState(false);
  if (!doctor) return null;

  const dirty = fee !== doctor.feeGBP || about !== doctor.about;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-6">
        <Card>
          <CardBody>
            <div className="flex items-center gap-4">
              <Avatar name={doctor.fullName} hue={186} size="lg" />
              <div className="min-w-0">
                <p className="truncate font-serif text-xl font-semibold text-foreground">{doctor.fullName}</p>
                <p className="text-sm text-muted-foreground">{doctor.title}</p>
                <Badge tone="primary" className="mt-1">
                  <BadgeCheck /> Verified
                </Badge>
              </div>
            </div>
            <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2"><Award className="size-4 shrink-0 text-gold" /> {doctor.qualifications.join(" · ")} · {doctor.experienceYears} years</li>
              <li className="flex gap-2"><ShieldCheck className="size-4 shrink-0 text-primary" /> {doctor.registrationNumber} · {doctor.registrationBody}</li>
              <li className="flex gap-2"><Building2 className="size-4 shrink-0 text-primary" /> {doctor.clinic}, {doctor.city}</li>
              <li className="flex gap-2"><Languages className="size-4 shrink-0 text-primary" /> {doctor.languages.join(", ")}</li>
            </ul>
            <p className="mt-4 rounded-2xl bg-surface-2 p-3 text-xs text-muted-foreground">
              Changes to your qualifications or registration need to be re-verified by our team.
            </p>
          </CardBody>
        </Card>
        <AppearanceCard />
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader title="Public profile" description="Shown to patients on your profile page." />
          <CardBody>
            <form
              className="space-y-5"
              onSubmit={(e) => {
                e.preventDefault();
                saveDoctor({ ...doctor, feeGBP: fee, about });
                // Fee and bio edits don't need re-verification.
                setDoctorStatus("approved");
                setSaved(true);
              }}
            >
              <Field label="About you" htmlFor="d-about">
                <Textarea id="d-about" value={about} onChange={(e) => { setAbout(e.target.value); setSaved(false); }} />
              </Field>
              <Field label="Base consultation fee (GBP)" hint="Europe & UK price. Other regions adjust automatically." htmlFor="d-fee">
                <Input id="d-fee" type="number" min={1} value={fee || ""} onChange={(e) => { setFee(Number(e.target.value)); setSaved(false); }} />
              </Field>
              {fee > 0 && (
                <dl className="grid grid-cols-2 gap-x-6 gap-y-1.5 rounded-2xl bg-surface-2 p-4 text-sm">
                  {REGION_LIST.map((r) => (
                    <div key={r.id} className="flex justify-between gap-2">
                      <dt className="text-muted-foreground">{r.name}</dt>
                      <dd className="font-medium text-foreground tabular-nums">{regionalFee(fee, r.id).label}</dd>
                    </div>
                  ))}
                </dl>
              )}
              <div className="flex items-center gap-3">
                <Button type="submit" disabled={!dirty || fee <= 0}>Save changes</Button>
                {saved && <span className="text-sm text-success">Saved</span>}
              </div>
            </form>
          </CardBody>
        </Card>
        <PrivacyCard />
      </div>
    </div>
  );
}
