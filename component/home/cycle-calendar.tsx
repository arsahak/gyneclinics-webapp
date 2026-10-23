"use client";

import {
  addMonths,
  differenceInCalendarDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight, Droplet, Pencil, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Disclaimer } from "@/component/shared/disclaimer";
import { EmptyState } from "@/component/shared/empty-state";
import { Badge } from "@/component/ui/badge";
import { Button } from "@/component/ui/button";
import { Card } from "@/component/ui/card";
import { Tabs } from "@/component/ui/tabs";
import { periodLength, phaseForDay, sortByStart, toDay, type DayPhase } from "@/lib/cycle";
import { useCycle } from "@/lib/hooks";
import { useTracker } from "@/lib/store/tracker";
import type { PeriodEntry } from "@/lib/types";
import { cn } from "@/lib/utils";
import { PeriodDialog } from "./period-dialog";

const PHASE_STYLES: Record<Exclude<DayPhase, null>, string> = {
  period: "bg-phase-period text-white",
  predicted: "border-2 border-dashed border-phase-period text-phase-period",
  fertile: "bg-phase-fertile/15 text-phase-fertile",
  ovulation: "bg-phase-ovulation text-white",
};

const LEGEND = [
  { label: "Period", className: "bg-phase-period" },
  { label: "Predicted period", className: "border-2 border-dashed border-phase-period" },
  { label: "Fertile window", className: "bg-phase-fertile/30" },
  { label: "Ovulation (est.)", className: "bg-phase-ovulation" },
];

const PHASE_LABEL: Record<Exclude<DayPhase, null>, string> = {
  period: "Logged period",
  predicted: "Predicted period",
  fertile: "Estimated fertile window",
  ovulation: "Estimated ovulation",
};

type Dialog = { entry?: PeriodEntry; defaultStart?: string } | null;

export function CycleCalendarView() {
  const [tab, setTab] = useState<"calendar" | "history">("calendar");
  const [dialog, setDialog] = useState<Dialog>(null);

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Tabs
          value={tab}
          onChange={setTab}
          options={[
            { value: "calendar", label: "Calendar" },
            { value: "history", label: "History" },
          ]}
        />
        <Button variant="accent" onClick={() => setDialog({})}>
          <Plus /> Log period
        </Button>
      </div>
      {tab === "calendar" ? <MonthView onLog={setDialog} /> : <History onEdit={setDialog} />}
      <PeriodDialog
        open={dialog !== null}
        onClose={() => setDialog(null)}
        entry={dialog?.entry}
        defaultStart={dialog?.defaultStart}
      />
    </>
  );
}

function MonthView({ onLog }: { onLog: (d: Dialog) => void }) {
  const { today, periods, stats, prediction } = useCycle();
  const [month, setMonth] = useState(() => startOfMonth(today));
  const [selected, setSelected] = useState<Date>(today);

  const days = useMemo(
    () =>
      eachDayOfInterval({
        start: startOfWeek(startOfMonth(month), { weekStartsOn: 1 }),
        end: endOfWeek(endOfMonth(month), { weekStartsOn: 1 }),
      }),
    [month],
  );

  const selectedPhase = phaseForDay(selected, periods, prediction, stats);
  const selectedEntry = periods.find((p) => {
    const end = p.end ?? p.start;
    return toDay(selected) >= p.start && toDay(selected) <= end;
  });
  const isFuture = selected > today;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      <Card className="p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-xl font-semibold text-foreground">{format(month, "MMMM yyyy")}</h2>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" aria-label="Previous month" onClick={() => setMonth(subMonths(month, 1))}>
              <ChevronLeft />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setMonth(startOfMonth(today))}>
              Today
            </Button>
            <Button variant="ghost" size="icon" aria-label="Next month" onClick={() => setMonth(addMonths(month, 1))}>
              <ChevronRight />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
            <div key={d} className="py-2">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => {
            const phase = phaseForDay(day, periods, prediction, stats);
            const inMonth = isSameMonth(day, month);
            const active = toDay(day) === toDay(selected);
            return (
              <button
                key={day.toISOString()}
                type="button"
                onClick={() => setSelected(day)}
                aria-label={`${format(day, "d MMMM")}${phase ? `, ${PHASE_LABEL[phase]}` : ""}`}
                aria-pressed={active}
                className={cn(
                  "relative mx-auto flex aspect-square w-full max-w-14 items-center justify-center rounded-full text-sm font-medium transition-all",
                  phase ? PHASE_STYLES[phase] : "text-foreground hover:bg-surface-2",
                  !inMonth && "opacity-35",
                  active && "ring-2 ring-foreground ring-offset-2 ring-offset-surface",
                )}
              >
                {format(day, "d")}
                {isToday(day) && <span className="absolute bottom-1 size-1 rounded-full bg-current" />}
              </button>
            );
          })}
        </div>

        <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 border-t border-border pt-4">
          {LEGEND.map((item) => (
            <span key={item.label} className="inline-flex items-center gap-2 text-xs text-muted-foreground">
              <span className={cn("size-3.5 rounded-full", item.className)} />
              {item.label}
            </span>
          ))}
        </div>
      </Card>

      <div className="space-y-4">
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">{format(selected, "EEEE")}</p>
          <p className="font-serif text-2xl font-semibold text-foreground">{format(selected, "d MMMM yyyy")}</p>
          <div className="mt-3">
            {selectedPhase ? (
              <Badge tone={selectedPhase === "period" || selectedPhase === "predicted" ? "accent" : selectedPhase === "fertile" ? "primary" : "secondary"}>
                {PHASE_LABEL[selectedPhase]}
              </Badge>
            ) : (
              <Badge>No events</Badge>
            )}
          </div>
          {selectedEntry?.symptoms?.length ? (
            <p className="mt-3 text-sm text-muted-foreground">Symptoms: {selectedEntry.symptoms.join(", ")}</p>
          ) : null}
          <div className="mt-5">
            {selectedEntry ? (
              <Button variant="outline" className="w-full" onClick={() => onLog({ entry: selectedEntry })}>
                <Pencil /> Edit this period
              </Button>
            ) : (
              <Button variant="accent" className="w-full" disabled={isFuture} onClick={() => onLog({ defaultStart: toDay(selected) })}>
                <Droplet /> Period started this day
              </Button>
            )}
          </div>
        </Card>
        <Disclaimer>Predicted dates and fertile windows are estimates from your logged history and may not be accurate.</Disclaimer>
      </div>
    </div>
  );
}

function History({ onEdit }: { onEdit: (d: Dialog) => void }) {
  const periods = useTracker((s) => s.periods);
  const deletePeriod = useTracker((s) => s.deletePeriod);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const sorted = sortByStart(periods).reverse();
  const remove = (id: string) => {
    setDeleteError(null);
    void deletePeriod(id).then(setDeleteError);
  };

  if (!sorted.length) {
    return <EmptyState icon={Droplet} title="No periods logged yet" description="Logged periods will appear here so you can edit or remove them." />;
  }

  return (
    <Card className="divide-y divide-border">
      {deleteError && (
        <p role="alert" className="p-4 text-sm text-danger sm:px-6">
          {deleteError}
        </p>
      )}
      {sorted.map((entry, i) => {
        const previous = sorted[i + 1];
        const cycle = previous
          ? differenceInCalendarDays(parseISO(entry.start), parseISO(previous.start))
          : null;
        const length = periodLength(entry);
        return (
          <div key={entry.id} className="flex items-center gap-4 p-4 sm:px-6">
            <span className="inline-flex size-11 shrink-0 flex-col items-center justify-center rounded-2xl bg-accent-soft text-accent">
              <span className="text-[10px] leading-none font-semibold uppercase">{format(parseISO(entry.start), "MMM")}</span>
              <span className="text-base leading-tight font-bold">{format(parseISO(entry.start), "d")}</span>
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-foreground">
                {format(parseISO(entry.start), "d MMM yyyy")}
                {entry.end ? ` – ${format(parseISO(entry.end), "d MMM")}` : " – ongoing"}
              </p>
              <p className="text-sm text-muted-foreground">
                {length ? `${length}-day period` : "In progress"}
                {cycle ? ` · ${cycle}-day cycle` : ""}
                {entry.flow ? ` · ${entry.flow} flow` : ""}
              </p>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" aria-label="Edit" onClick={() => onEdit({ entry })}>
                <Pencil />
              </Button>
              <Button variant="ghost" size="icon" aria-label="Delete" onClick={() => remove(entry.id)}>
                <Trash2 />
              </Button>
            </div>
          </div>
        );
      })}
    </Card>
  );
}
