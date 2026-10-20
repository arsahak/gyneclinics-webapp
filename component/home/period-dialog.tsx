"use client";

import { addDays, format, parseISO } from "date-fns";
import { useState } from "react";
import { Button } from "@/component/ui/button";
import { Dialog } from "@/component/ui/dialog";
import { Field, Input, Textarea } from "@/component/ui/field";
import { useToday } from "@/lib/hooks";
import { useTracker } from "@/lib/store/tracker";
import type { Flow, PeriodEntry } from "@/lib/types";
import { cn } from "@/lib/utils";

const SYMPTOMS = ["Cramps", "Bloating", "Headache", "Fatigue", "Back pain", "Mood changes", "Acne", "Tender breasts"];
const FLOWS: Flow[] = ["light", "medium", "heavy"];

/** Add or edit a period entry (BRD B1, B5). Saving recalculates everything instantly. */
export function PeriodDialog({
  open,
  onClose,
  entry,
  defaultStart,
}: {
  open: boolean;
  onClose: () => void;
  entry?: PeriodEntry;
  defaultStart?: string;
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={entry ? "Edit period" : "Log a period"}
      description="Only the dates you enter are used to calculate your cycle."
    >
      {/* Remount the form for each entry so its fields start fresh. */}
      <PeriodForm key={entry?.id ?? defaultStart ?? "new"} entry={entry} defaultStart={defaultStart} onDone={onClose} />
    </Dialog>
  );
}

function PeriodForm({ entry, defaultStart, onDone }: { entry?: PeriodEntry; defaultStart?: string; onDone: () => void }) {
  const today = useToday();
  const todayStr = format(today, "yyyy-MM-dd");
  const { periods, addPeriod, updatePeriod, deletePeriod } = useTracker();
  const [start, setStart] = useState(entry?.start ?? defaultStart ?? todayStr);
  const [end, setEnd] = useState(entry?.end ?? "");
  const [flow, setFlow] = useState<Flow | undefined>(entry?.flow ?? "medium");
  const [symptoms, setSymptoms] = useState<string[]>(entry?.symptoms ?? []);
  const [note, setNote] = useState(entry?.note ?? "");

  const overlaps = periods.some((p) => {
    if (p.id === entry?.id) return false;
    const pEnd = p.end ?? format(addDays(parseISO(p.start), 4), "yyyy-MM-dd");
    const myEnd = end || start;
    return start <= pEnd && myEnd >= p.start;
  });

  let error: string | null = null;
  if (!start) error = "Please choose a start date.";
  else if (start > todayStr) error = "Start date can't be in the future.";
  else if (end && end < start) error = "End date must be on or after the start date.";
  else if (end && end > todayStr) error = "End date can't be in the future.";
  else if (overlaps) error = "These dates overlap with another logged period.";

  const save = () => {
    if (error) return;
    const data = { start, end: end || undefined, flow, symptoms, note: note.trim() || undefined };
    if (entry) updatePeriod(entry.id, data);
    else addPeriod(data);
    onDone();
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Start date" htmlFor="start">
          <Input id="start" type="date" max={todayStr} value={start} onChange={(e) => setStart(e.target.value)} />
        </Field>
        <Field label="End date" hint="Leave blank if ongoing" htmlFor="end">
          <Input id="end" type="date" min={start} max={todayStr} value={end} onChange={(e) => setEnd(e.target.value)} />
        </Field>
      </div>

      <Field label="Flow">
        <div className="grid grid-cols-3 gap-2">
          {FLOWS.map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={flow === f}
              onClick={() => setFlow(f)}
              className={cn(
                "flex h-11 items-center justify-center gap-1.5 rounded-2xl border text-sm font-medium capitalize transition-colors",
                flow === f ? "border-accent bg-accent-soft text-accent" : "border-border text-muted-foreground",
              )}
            >
              <span className="flex gap-0.5">
                {Array.from({ length: FLOWS.indexOf(f) + 1 }, (_, i) => (
                  <span key={i} className="size-1.5 rounded-full bg-current" />
                ))}
              </span>
              {f}
            </button>
          ))}
        </div>
      </Field>

      <Field label="Symptoms (optional)">
        <div className="flex flex-wrap gap-2">
          {SYMPTOMS.map((s) => {
            const on = symptoms.includes(s);
            return (
              <button
                key={s}
                type="button"
                aria-pressed={on}
                onClick={() => setSymptoms(on ? symptoms.filter((x) => x !== s) : [...symptoms, s])}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-sm transition-colors",
                  on ? "border-secondary bg-secondary-soft text-secondary" : "border-border text-muted-foreground hover:text-foreground",
                )}
              >
                {s}
              </button>
            );
          })}
        </div>
      </Field>

      <Field label="Note (optional)" htmlFor="note">
        <Textarea id="note" value={note} onChange={(e) => setNote(e.target.value)} className="min-h-20" placeholder="Anything you'd like to remember" />
      </Field>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex gap-3">
        {entry && (
          <Button
            variant="danger"
            onClick={() => {
              deletePeriod(entry.id);
              onDone();
            }}
          >
            Delete
          </Button>
        )}
        <Button className="flex-1" disabled={!!error} onClick={save}>
          {entry ? "Save changes" : "Save period"}
        </Button>
      </div>
    </div>
  );
}
