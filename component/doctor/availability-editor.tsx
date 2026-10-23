"use client";

import { format, isToday, isTomorrow, parseISO } from "date-fns";
import { CalendarOff, CheckCircle2, Copy, Eye, Loader2, Plus, Trash2, X, Zap } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { Badge } from "@/component/ui/badge";
import { Button } from "@/component/ui/button";
import { Card, CardBody, CardHeader } from "@/component/ui/card";
import { Field, Input, Select, Switch } from "@/component/ui/field";
import {
  BOOKING_WINDOWS,
  MIN_NOTICE,
  scheduleOf,
  SLOT_LENGTHS,
  slotsFor,
  TIME_OPTIONS,
  toMinutes,
  validateDay,
  WEEKDAYS,
  weeklyHours,
  type DoctorSchedule,
  type TimeRange,
} from "@/lib/availability";
import { useNow } from "@/lib/hooks";
import { saveScheduleAction } from "@/app/actions/doctorAction";
import type { Doctor } from "@/lib/types";
import { cn } from "@/lib/utils";

function TimeSelect({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  return (
    <Select aria-label={label} value={value} onChange={(e) => onChange(e.target.value)} className="w-[6.5rem] [&_select]:h-10 [&_select]:px-3 [&_select]:pr-8">
      {TIME_OPTIONS.map((t) => (
        <option key={t} value={t}>
          {t}
        </option>
      ))}
    </Select>
  );
}

/** Suggest the next free range after the last one in a day. */
function nextRange(ranges: TimeRange[]): TimeRange {
  const lastEnd = ranges.length ? toMinutes(ranges.at(-1)!.end) : 9 * 60;
  const start = Math.min(lastEnd + 60, 21 * 60);
  const fmt = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
  return { start: fmt(start), end: fmt(Math.min(start + 180, 23 * 60)) };
}

export function AvailabilityEditor({ doctor }: { doctor: Doctor }) {
  const now = useNow();
  // What's saved on the backend; updated here after each save.
  const [saved, setSaved] = useState<DoctorSchedule>(() => scheduleOf(doctor.schedule));
  const [draft, setDraft] = useState<DoctorSchedule>(saved);
  const [justSaved, setJustSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, startSaving] = useTransition();
  const [offDate, setOffDate] = useState("");

  const update = (next: Partial<DoctorSchedule>) => {
    setDraft((d) => ({ ...d, ...next }));
    setJustSaved(false);
    setSaveError(null);
  };

  const save = () => {
    const next = { ...draft, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || draft.timezone };
    setSaveError(null);
    startSaving(async () => {
      const result = await saveScheduleAction(next);
      if (result.error) {
        setSaveError(result.error);
        return;
      }
      setSaved(next);
      setDraft(next);
      setJustSaved(true);
    });
  };
  const setDay = (day: number, ranges: TimeRange[]) => update({ weekly: draft.weekly.map((r, i) => (i === day ? ranges : r)) });

  const errors = draft.weekly.map(validateDay);
  const hasErrors = errors.some(Boolean);
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);
  const today = format(now, "yyyy-MM-dd");
  const upcomingOff = draft.timeOff.filter((d) => d >= today).sort();

  const preview = useMemo(() => (hasErrors ? [] : slotsFor(draft, now).slice(0, 7)), [draft, now, hasErrors]);

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Availability</h1>
          <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
            Set when patients can book a consultation with you. Changes apply to new bookings — existing ones stay as they are.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {justSaved && !dirty && (
            <span className="inline-flex items-center gap-1.5 text-sm text-success">
              <CheckCircle2 className="size-4" /> Saved
            </span>
          )}
          {dirty && (
            <Button variant="ghost" onClick={() => setDraft(saved)}>
              Discard
            </Button>
          )}
          <Button disabled={!dirty || hasErrors || saving} onClick={save}>
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
      {saveError && (
        <p role="alert" className="mb-6 rounded-2xl bg-danger-soft p-4 text-sm text-danger">
          {saveError}
        </p>
      )}

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="min-w-0 space-y-6">
          {/* Weekly hours */}
          <Card>
            <CardHeader
              title="Weekly hours"
              description={`${weeklyHours(draft)} hours a week · ${draft.slotMinutes}-minute consultations`}
              action={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => update({ weekly: draft.weekly.map((r, i) => (i < 5 ? draft.weekly[0].map((x) => ({ ...x })) : r)) })}
                >
                  <Copy /> Copy Monday to weekdays
                </Button>
              }
            />
            <CardBody className="divide-y divide-border p-0 sm:p-0">
              {WEEKDAYS.map((name, day) => {
                const ranges = draft.weekly[day];
                const on = ranges.length > 0;
                return (
                  <div key={name} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-start sm:px-6">
                    <div className="flex w-40 shrink-0 items-center gap-3 pt-2">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={on}
                        aria-label={`${name} available`}
                        onClick={() => setDay(day, on ? [] : [{ start: "09:00", end: "17:00" }])}
                        className={cn("relative h-6 w-11 shrink-0 rounded-full transition-colors", on ? "bg-primary" : "bg-border")}
                      >
                        <span className={cn("absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform", on && "translate-x-5")} />
                      </button>
                      <span className={cn("text-sm font-medium", on ? "text-foreground" : "text-muted-foreground")}>{name}</span>
                    </div>

                    <div className="min-w-0 flex-1">
                      {on ? (
                        <div className="space-y-2">
                          {ranges.map((r, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <TimeSelect
                                label={`${name} start ${i + 1}`}
                                value={r.start}
                                onChange={(v) => setDay(day, ranges.map((x, j) => (j === i ? { ...x, start: v } : x)))}
                              />
                              <span className="text-muted-foreground">–</span>
                              <TimeSelect
                                label={`${name} end ${i + 1}`}
                                value={r.end}
                                onChange={(v) => setDay(day, ranges.map((x, j) => (j === i ? { ...x, end: v } : x)))}
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label="Remove time range"
                                className="size-9"
                                onClick={() => setDay(day, ranges.filter((_, j) => j !== i))}
                              >
                                <Trash2 />
                              </Button>
                            </div>
                          ))}
                          {errors[day] && <p className="text-xs text-danger">{errors[day]}</p>}
                        </div>
                      ) : (
                        <p className="pt-2 text-sm text-muted-foreground">Unavailable</p>
                      )}
                    </div>

                    {on && (
                      <Button variant="ghost" size="sm" className="self-start" onClick={() => setDay(day, [...ranges, nextRange(ranges)])}>
                        <Plus /> Add hours
                      </Button>
                    )}
                  </div>
                );
              })}
            </CardBody>
          </Card>

          {/* Time off */}
          <Card>
            <CardHeader title="Time off" description="Block whole days — holidays, conferences or leave." />
            <CardBody className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Input type="date" min={today} value={offDate} onChange={(e) => setOffDate(e.target.value)} className="w-auto" aria-label="Day off" />
                <Button
                  variant="outline"
                  disabled={!offDate || draft.timeOff.includes(offDate)}
                  onClick={() => {
                    update({ timeOff: [...draft.timeOff, offDate] });
                    setOffDate("");
                  }}
                >
                  <CalendarOff /> Add day off
                </Button>
              </div>
              {upcomingOff.length ? (
                <div className="flex flex-wrap gap-2">
                  {upcomingOff.map((d) => (
                    <Badge key={d} tone="warning" className="py-1 pr-1.5 text-sm">
                      {format(parseISO(d), "EEE d MMM")}
                      <button type="button" aria-label="Remove day off" onClick={() => update({ timeOff: draft.timeOff.filter((x) => x !== d) })}>
                        <X />
                      </button>
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No days off planned.</p>
              )}
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Booking settings */}
          <Card>
            <CardHeader title="Booking settings" />
            <CardBody className="space-y-5">
              <Field label="Consultation length" htmlFor="slot-length">
                <Select id="slot-length" value={draft.slotMinutes} onChange={(e) => update({ slotMinutes: Number(e.target.value) })}>
                  {SLOT_LENGTHS.map((m) => (
                    <option key={m} value={m}>
                      {m} minutes
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Patients can book up to" htmlFor="window">
                <Select id="window" value={draft.bookingWindowDays} onChange={(e) => update({ bookingWindowDays: Number(e.target.value) })}>
                  {BOOKING_WINDOWS.map((d) => (
                    <option key={d} value={d}>
                      {d} days ahead
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Minimum notice" htmlFor="notice" hint="How soon before a slot it can still be booked.">
                <Select id="notice" value={draft.minNoticeHours} onChange={(e) => update({ minNoticeHours: Number(e.target.value) })}>
                  {MIN_NOTICE.map((h) => (
                    <option key={h} value={h}>
                      {h} hour{h === 1 ? "" : "s"}
                    </option>
                  ))}
                </Select>
              </Field>
              <Switch
                checked={draft.instantChat}
                onChange={(v) => update({ instantChat: v })}
                label={
                  <span className="inline-flex items-center gap-1.5">
                    <Zap className="size-4 text-primary" /> Allow &quot;Chat now&quot;
                  </span>
                }
                description="Patients can start a chat straight away while you're online."
              />
              <p className="rounded-xl bg-surface-2 px-3 py-2 text-xs text-muted-foreground">Time zone: {draft.timezone}</p>
            </CardBody>
          </Card>

          {/* Preview */}
          <Card>
            <CardHeader
              title={
                <span className="inline-flex items-center gap-2">
                  <Eye className="size-4 text-primary" /> What patients see
                </span>
              }
              description="Your next 7 days, as shown when booking."
            />
            <CardBody>
              {hasErrors ? (
                <p className="text-sm text-danger">Fix the highlighted hours to see the preview.</p>
              ) : (
                <ul className="space-y-3">
                  {preview.map((day) => {
                    const open = day.slots.filter((s) => s.available);
                    const label = isToday(day.date) ? "Today" : isTomorrow(day.date) ? "Tomorrow" : format(day.date, "EEE d MMM");
                    return (
                      <li key={day.date.toISOString()} className="flex items-start gap-3">
                        <span className="w-24 shrink-0 pt-0.5 text-sm font-medium text-foreground">{label}</span>
                        {open.length ? (
                          <div className="flex flex-wrap gap-1.5">
                            {open.slice(0, 4).map((s) => (
                              <span key={s.start.toISOString()} className="rounded-lg bg-primary-soft px-2 py-1 text-xs font-medium text-primary tabular-nums">
                                {format(s.start, "HH:mm")}
                              </span>
                            ))}
                            {open.length > 4 && <span className="px-1 py-1 text-xs text-muted-foreground">+{open.length - 4} more</span>}
                          </div>
                        ) : (
                          <span className="pt-0.5 text-sm text-muted-foreground">
                            {day.closed === "time-off" ? "Day off" : day.closed === "off" ? "Not working" : "Fully booked"}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  );
}
