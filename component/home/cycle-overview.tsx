"use client";

import { differenceInCalendarDays, format } from "date-fns";
import { BellRing, CalendarDays, CalendarPlus, Droplet, Sparkles, Timer } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Disclaimer } from "@/component/shared/disclaimer";
import { EmptyState } from "@/component/shared/empty-state";
import { Badge } from "@/component/ui/badge";
import { Button, ButtonLink } from "@/component/ui/button";
import { Card } from "@/component/ui/card";
import { useCycle } from "@/lib/hooks";
import { useSession } from "@/lib/store/session";
import { useTracker } from "@/lib/store/tracker";
import { CycleRing } from "./cycle-ring";
import { PeriodDialog } from "./period-dialog";

const phaseCopy = {
  Menstrual: { tone: "accent" as const, text: "Rest and stay hydrated. Gentle movement can ease cramps." },
  Follicular: { tone: "primary" as const, text: "Energy often rises in this phase — a good time for new routines." },
  Ovulation: { tone: "secondary" as const, text: "You're around your estimated ovulation day." },
  Luteal: { tone: "gold" as const, text: "Some people notice bloating or mood changes before their period." },
};

function greeting(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function Greeting() {
  const name = useSession((s) => s.patient?.fullName.split(" ")[0]);
  const [now] = useState(() => new Date());
  return (
    <div className="mb-6">
      <p className="text-sm text-muted-foreground">{format(now, "EEEE, d MMMM")}</p>
      <h1 className="font-serif text-3xl font-semibold tracking-tight text-foreground">
        {greeting(now.getHours())}
        {name ? `, ${name}` : ""}
      </h1>
    </div>
  );
}

export function CycleOverview() {
  const { today, periods, stats, prediction } = useCycle();
  const [logOpen, setLogOpen] = useState(false);

  if (!prediction) {
    return (
      <>
        <EmptyState
          icon={CalendarPlus}
          title="Log your first period"
          description="Add the start date of your last period and we'll estimate your next one."
          action={<Button onClick={() => setLogOpen(true)}>Log period</Button>}
        />
        <PeriodDialog open={logOpen} onClose={() => setLogOpen(false)} />
      </>
    );
  }

  const ovulationDay = differenceInCalendarDays(prediction.ovulation, prediction.lastStart) + 1;
  const fertileIn = differenceInCalendarDays(prediction.fertileStart, today);
  const inFertile = today >= prediction.fertileStart && today <= prediction.fertileEnd;
  const phase = phaseCopy[prediction.phase];
  const lastEntry = periods.find((p) => p.start === format(prediction.lastStart, "yyyy-MM-dd"));
  const ongoing = lastEntry && !lastEntry.end && prediction.phase === "Menstrual";

  let headline: string;
  if (prediction.daysLate > 0) headline = `Period ${prediction.daysLate} day${prediction.daysLate === 1 ? "" : "s"} late`;
  else if (prediction.daysUntilNext === 0) headline = "Period expected today";
  else headline = `Period in ${prediction.daysUntilNext} day${prediction.daysUntilNext === 1 ? "" : "s"}`;

  return (
    <>
      <Card className="overflow-hidden">
        <div className="grid gap-6 p-5 sm:p-8 md:grid-cols-[auto_1fr] md:items-center md:gap-10">
          <CycleRing
            className="mx-auto"
            cycleLength={stats.averageCycle}
            periodLength={stats.averagePeriod}
            ovulationDay={ovulationDay}
            cycleDay={prediction.cycleDay}
          >
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Cycle day</p>
            <p className="text-6xl font-semibold tracking-tight text-foreground">{prediction.cycleDay}</p>
            <Badge tone={phase.tone} className="mt-1">
              {prediction.phase} phase
            </Badge>
          </CycleRing>

          <div>
            <h2 className="font-serif text-3xl font-semibold tracking-tight text-foreground">{headline}</h2>
            <p className="mt-1 text-muted-foreground">
              Next period estimated for{" "}
              <span className="font-medium text-foreground">{format(prediction.nextStart, "EEE, d MMM")}</span>
            </p>
            <p className="mt-4 text-sm text-muted-foreground">{phase.text}</p>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <Stat icon={Timer} label="Avg. cycle" value={`${stats.averageCycle} days`} tone="text-primary" />
              <Stat icon={Droplet} label="Avg. period" value={`${stats.averagePeriod} days`} tone="text-accent" />
              <Stat
                icon={Sparkles}
                label="Fertile window"
                value={inFertile ? "Now" : fertileIn > 0 ? `In ${fertileIn}d` : format(prediction.fertileStart, "d MMM")}
                tone="text-secondary"
              />
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              {ongoing ? (
                <Button variant="accent" onClick={() => setLogOpen(true)}>
                  <Droplet /> Log period end
                </Button>
              ) : (
                <Button variant="accent" onClick={() => setLogOpen(true)}>
                  <CalendarPlus /> Log period
                </Button>
              )}
              <ButtonLink href="/patient/calendar" variant="outline">
                <CalendarDays /> View calendar
              </ButtonLink>
            </div>
          </div>
        </div>
        <div className="border-t border-border bg-surface-2/50 px-5 py-3 sm:px-8">
          <Disclaimer className="border-0 bg-transparent p-0">
            Predictions are estimates based on your logged dates, not medical advice or contraception.
          </Disclaimer>
        </div>
      </Card>
      <PeriodDialog open={logOpen} onClose={() => setLogOpen(false)} entry={ongoing ? lastEntry : undefined} />
    </>
  );
}

function Stat({ icon: Icon, label, value, tone }: { icon: typeof Timer; label: string; value: string; tone: string }) {
  return (
    <div className="rounded-2xl bg-surface-2 p-3">
      <Icon className={`size-4 ${tone}`} />
      <p className="mt-2 text-[11px] text-muted-foreground sm:text-xs">{label}</p>
      <p className="text-sm font-semibold text-foreground sm:text-base">{value}</p>
    </div>
  );
}

/** Next reminder based on settings and prediction (BRD B4). */
export function ReminderCard() {
  const { today, prediction } = useCycle();
  const reminders = useTracker((s) => s.reminders);
  if (!prediction) return null;

  const items: Array<{ label: string; date: Date }> = [];
  if (reminders.periodReminder) {
    const date = new Date(prediction.nextStart);
    date.setDate(date.getDate() - reminders.daysBefore);
    items.push({ label: `Period expected in ${reminders.daysBefore} days`, date });
  }
  if (reminders.fertileReminder) items.push({ label: "Fertile window begins", date: prediction.fertileStart });
  const upcoming = items.filter((i) => i.date >= today).sort((a, b) => a.date.getTime() - b.date.getTime());

  return (
    <Card className="p-5">
      <div className="flex items-start gap-3">
        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-2xl bg-gold-soft text-gold">
          <BellRing className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-foreground">Reminders</p>
          {upcoming.length ? (
            <ul className="mt-1 space-y-1 text-sm text-muted-foreground">
              {upcoming.map((item) => (
                <li key={item.label}>
                  {format(item.date, "EEE d MMM")} · {item.label}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 text-sm text-muted-foreground">No upcoming reminders.</p>
          )}
          <Link href="/patient/profile#reminders" className="mt-2 inline-block text-sm font-medium text-primary hover:underline">
            Manage reminders
          </Link>
        </div>
      </div>
    </Card>
  );
}
