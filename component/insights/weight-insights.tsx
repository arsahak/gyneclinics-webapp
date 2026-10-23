"use client";

import { format, parseISO } from "date-fns";
import { Loader2, Plus, Scale, Trash2, TrendingDown, TrendingUp } from "lucide-react";
import { useState, useTransition } from "react";
import { EmptyState } from "@/component/shared/empty-state";
import { Button } from "@/component/ui/button";
import { Card, CardBody, CardHeader } from "@/component/ui/card";
import { Field, Input } from "@/component/ui/field";
import { useToday } from "@/lib/hooks";
import { useTracker } from "@/lib/store/tracker";
import { TrendLineChart } from "./charts";
import { StatTile } from "./cycle-insights";

export function WeightInsights() {
  const today = useToday();
  const todayStr = format(today, "yyyy-MM-dd");
  const { weights, addWeight, deleteWeight } = useTracker();
  const [date, setDate] = useState(todayStr);
  const [kg, setKg] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, startSaving] = useTransition();

  const sorted = [...weights].sort((a, b) => a.date.localeCompare(b.date));
  const latest = sorted.at(-1);
  const first = sorted[0];
  const change = latest && first ? +(latest.kg - first.kg).toFixed(1) : 0;
  const value = Number(kg);
  const valid = value >= 25 && value <= 250 && !!date && date <= todayStr;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="min-w-0 space-y-6">
        <div className="grid grid-cols-2 gap-3">
          <StatTile icon={Scale} label="Latest" value={latest ? `${latest.kg} kg` : "—"} />
          <StatTile
            icon={change <= 0 ? TrendingDown : TrendingUp}
            label={first ? `Change since ${format(parseISO(first.date), "MMM yyyy")}` : "Change"}
            value={sorted.length > 1 ? `${change > 0 ? "+" : ""}${change} kg` : "—"}
          />
        </div>
        <Card>
          <CardHeader title="Weight over time" description="Plotted from the values you enter." />
          <CardBody>
            {sorted.length > 1 ? (
              <TrendLineChart
                color="var(--gold)"
                unit="kg"
                data={sorted.map((w) => ({ label: format(parseISO(w.date), "d MMM"), value: w.kg }))}
              />
            ) : (
              <EmptyState icon={Scale} title="Add two or more entries" description="Your chart appears once you have at least two weights." />
            )}
          </CardBody>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader title="Add weight" />
          <CardBody>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                if (!valid) return;
                setError(null);
                startSaving(async () => {
                  const failed = await addWeight({ date, kg: Math.round(value * 10) / 10 });
                  if (failed) setError(failed);
                  else setKg("");
                });
              }}
            >
              <Field label="Date" htmlFor="w-date">
                <Input id="w-date" type="date" max={todayStr} value={date} onChange={(e) => setDate(e.target.value)} />
              </Field>
              <Field label="Weight (kg)" htmlFor="w-kg">
                <Input id="w-kg" type="number" inputMode="decimal" step="0.1" value={kg} onChange={(e) => setKg(e.target.value)} placeholder="61.5" />
              </Field>
              {error && (
                <p role="alert" className="text-sm text-danger">
                  {error}
                </p>
              )}
              <Button type="submit" className="w-full" disabled={!valid || saving}>
                {saving ? <Loader2 className="animate-spin" /> : <Plus />} Add entry
              </Button>
            </form>
          </CardBody>
        </Card>
        {sorted.length > 0 && (
          <Card>
            <CardHeader title="Entries" />
            <ul className="divide-y divide-border px-2 pb-2">
              {[...sorted].reverse().map((w) => (
                <li key={w.id} className="flex items-center justify-between px-3 py-2.5 text-sm">
                  <span className="text-muted-foreground">{format(parseISO(w.date), "d MMM yyyy")}</span>
                  <span className="flex items-center gap-2">
                    <span className="font-medium text-foreground tabular-nums">{w.kg} kg</span>
                    <Button variant="ghost" size="icon" aria-label="Delete entry" onClick={() => {
                        setError(null);
                        void deleteWeight(w.id).then(setError);
                      }} className="size-8">
                      <Trash2 />
                    </Button>
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </div>
  );
}
