"use client";

import { addDays, differenceInCalendarDays, format, parseISO } from "date-fns";
import { Activity, CalendarRange, ChartColumn, Droplet, Timer } from "lucide-react";
import { EmptyState } from "@/component/shared/empty-state";
import { Badge } from "@/component/ui/badge";
import { ButtonLink } from "@/component/ui/button";
import { Card, CardBody, CardHeader } from "@/component/ui/card";
import { cycleHistory } from "@/lib/cycle";
import { useCycle } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import { CycleLengthChart } from "./charts";

export function CycleInsights() {
  const { today, periods, stats, prediction } = useCycle();
  const history = cycleHistory(periods).slice(-8);

  if (!prediction) {
    return (
      <EmptyState
        icon={ChartColumn}
        title="Not enough data yet"
        description="Log at least two periods to see your cycle trends."
        action={<ButtonLink href="/patient/calendar">Log a period</ButtonLink>}
      />
    );
  }

  const regularity =
    stats.regular === null
      ? { label: "Need more cycles", tone: "neutral" as const }
      : stats.regular
        ? { label: "Regular", tone: "success" as const }
        : { label: "Irregular", tone: "warning" as const };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile icon={Timer} label="Average cycle" value={`${stats.averageCycle} days`} />
        <StatTile icon={Droplet} label="Average period" value={`${stats.averagePeriod} days`} />
        <StatTile
          icon={CalendarRange}
          label="Shortest – longest"
          value={stats.shortest !== null ? `${stats.shortest}–${stats.longest} days` : "—"}
        />
        <StatTile
          icon={Activity}
          label="Variation"
          value={stats.variation !== null ? `${stats.variation} days` : "—"}
          badge={<Badge tone={regularity.tone}>{regularity.label}</Badge>}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader
            title="Cycle length"
            description={`Your last ${history.length} completed cycles. A variation of 7 days or less is usually considered regular.`}
          />
          <CardBody>
            {history.length ? (
              <CycleLengthChart
                average={stats.averageCycle}
                data={history.map((c) => ({ label: format(parseISO(c.start), "MMM"), length: c.length }))}
              />
            ) : (
              <p className="py-12 text-center text-sm text-muted-foreground">Log one more period to see this chart.</p>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Fertile window" description="Estimated from your average cycle length." />
          <CardBody className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-primary-soft p-4">
                <p className="text-xs text-muted-foreground">Fertile window</p>
                <p className="mt-1 font-semibold text-foreground">
                  {format(prediction.fertileStart, "d MMM")} – {format(prediction.fertileEnd, "d MMM")}
                </p>
              </div>
              <div className="rounded-2xl bg-secondary-soft p-4">
                <p className="text-xs text-muted-foreground">Ovulation (est.)</p>
                <p className="mt-1 font-semibold text-foreground">{format(prediction.ovulation, "EEE d MMM")}</p>
              </div>
            </div>
            <CycleStrip
              cycleLength={stats.averageCycle}
              periodLength={stats.averagePeriod}
              ovulationDay={differenceInCalendarDays(prediction.ovulation, prediction.lastStart) + 1}
              today={prediction.cycleDay}
            />
            <p className="text-xs leading-relaxed text-muted-foreground">
              Calendar estimates can&apos;t confirm ovulation and must not be used as contraception. Your next period
              is estimated for {format(prediction.nextStart, "d MMMM")}
              {prediction.daysLate > 0 ? ` (${prediction.daysLate} days ago)` : ""}.
            </p>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader title="Cycle history" description="The data behind the chart." />
        <CardBody className="overflow-x-auto">
          <table className="w-full min-w-[420px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="pb-2 font-medium">Cycle started</th>
                <th className="pb-2 font-medium">Next period</th>
                <th className="pb-2 text-right font-medium">Length</th>
                <th className="pb-2 text-right font-medium">vs average</th>
              </tr>
            </thead>
            <tbody>
              {[...history].reverse().map((c) => {
                const diff = c.length - stats.averageCycle;
                return (
                  <tr key={c.start} className="border-b border-border/60 last:border-0">
                    <td className="py-2.5 text-foreground">{format(parseISO(c.start), "d MMM yyyy")}</td>
                    <td className="py-2.5 text-muted-foreground">{format(addDays(parseISO(c.start), c.length), "d MMM yyyy")}</td>
                    <td className="py-2.5 text-right font-medium text-foreground tabular-nums">{c.length} days</td>
                    <td className="py-2.5 text-right text-muted-foreground tabular-nums">
                      {diff === 0 ? "—" : `${diff > 0 ? "+" : ""}${diff}`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="mt-3 text-xs text-muted-foreground">Today is day {prediction.cycleDay} of your current cycle ({format(today, "d MMM")}).</p>
        </CardBody>
      </Card>
    </div>
  );
}

export function StatTile({
  icon: Icon,
  label,
  value,
  badge,
}: {
  icon: typeof Timer;
  label: string;
  value: string;
  badge?: React.ReactNode;
}) {
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <Icon className="size-5 text-primary" />
        {badge}
      </div>
      <p className="mt-3 text-xs text-muted-foreground sm:text-sm">{label}</p>
      <p className="text-lg font-semibold text-foreground sm:text-xl">{value}</p>
    </Card>
  );
}

function CycleStrip({
  cycleLength,
  periodLength,
  ovulationDay,
  today,
}: {
  cycleLength: number;
  periodLength: number;
  ovulationDay: number;
  today: number;
}) {
  return (
    <div>
      <div className="flex gap-[2px]" role="img" aria-label={`Cycle of ${cycleLength} days, today is day ${today}`}>
        {Array.from({ length: cycleLength }, (_, i) => {
          const day = i + 1;
          const tone =
            day <= periodLength
              ? "bg-phase-period"
              : day === ovulationDay
                ? "bg-phase-ovulation"
                : day >= ovulationDay - 5 && day <= ovulationDay + 1
                  ? "bg-phase-fertile/60"
                  : "bg-surface-2";
          return (
            <span
              key={day}
              className={cn("h-8 flex-1 first:rounded-l-lg last:rounded-r-lg", tone, day === today && "ring-2 ring-foreground ring-offset-1 ring-offset-surface")}
            />
          );
        })}
      </div>
      <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
        <span>Day 1</span>
        <span>Day {ovulationDay}</span>
        <span>Day {cycleLength}</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-phase-period" /> Period</span>
        <span className="inline-flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-phase-fertile/60" /> Fertile</span>
        <span className="inline-flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-phase-ovulation" /> Ovulation</span>
        <span className="inline-flex items-center gap-1.5"><span className="size-2.5 rounded-sm ring-2 ring-foreground" /> Today</span>
      </div>
    </div>
  );
}
