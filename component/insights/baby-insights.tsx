"use client";

import { format, parseISO } from "date-fns";
import { Baby, Plus, Ruler, Trash2, Weight } from "lucide-react";
import { useState } from "react";
import { EmptyState } from "@/component/shared/empty-state";
import { Button } from "@/component/ui/button";
import { Card, CardBody, CardHeader } from "@/component/ui/card";
import { Field, Input } from "@/component/ui/field";
import { useToday } from "@/lib/hooks";
import { useTracker } from "@/lib/store/tracker";
import { TrendLineChart } from "./charts";
import { StatTile } from "./cycle-insights";

export function BabyInsights() {
  const today = useToday();
  const todayStr = format(today, "yyyy-MM-dd");
  const { babyGrowth, addBabyGrowth, deleteBabyGrowth } = useTracker();
  const [form, setForm] = useState({ date: todayStr, week: "", weightG: "", lengthCm: "" });

  const sorted = [...babyGrowth].sort((a, b) => a.week - b.week);
  const latest = sorted.at(-1);
  const week = Number(form.week);
  const weightG = Number(form.weightG);
  const lengthCm = Number(form.lengthCm);
  const valid = week >= 4 && week <= 42 && weightG > 0 && lengthCm > 0 && !!form.date && form.date <= todayStr;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <StatTile icon={Baby} label="Latest scan" value={latest ? `Week ${latest.week}` : "—"} />
        <StatTile icon={Weight} label="Estimated weight" value={latest ? `${latest.weightG.toLocaleString("en-GB")} g` : "—"} />
        <StatTile icon={Ruler} label="Length" value={latest ? `${latest.lengthCm} cm` : "—"} />
      </div>

      {sorted.length > 1 ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader title="Estimated weight" description="Grams, by week of pregnancy" />
            <CardBody>
              <TrendLineChart
                color="var(--secondary)"
                unit="g"
                xLabelPrefix="Week "
                domainPadding={50}
                data={sorted.map((b) => ({ label: String(b.week), value: b.weightG }))}
              />
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="Length" description="Centimetres, by week of pregnancy" />
            <CardBody>
              <TrendLineChart
                color="var(--accent)"
                unit="cm"
                xLabelPrefix="Week "
                domainPadding={2}
                data={sorted.map((b) => ({ label: String(b.week), value: b.lengthCm }))}
              />
            </CardBody>
          </Card>
        </div>
      ) : (
        <EmptyState icon={Baby} title="Add your scan results" description="Enter measurements from at least two scan reports to see growth charts." />
      )}

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <Card>
          <CardHeader title="Add scan measurement" description="Copy the values from your scan report." />
          <CardBody>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                if (!valid) return;
                addBabyGrowth({ date: form.date, week, weightG, lengthCm });
                setForm({ date: todayStr, week: "", weightG: "", lengthCm: "" });
              }}
            >
              <div className="grid grid-cols-2 gap-3">
                <Field label="Scan date" htmlFor="b-date">
                  <Input id="b-date" type="date" max={todayStr} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                </Field>
                <Field label="Week" htmlFor="b-week">
                  <Input id="b-week" type="number" min={4} max={42} value={form.week} onChange={(e) => setForm({ ...form, week: e.target.value })} placeholder="28" />
                </Field>
                <Field label="Weight (g)" htmlFor="b-weight">
                  <Input id="b-weight" type="number" min={1} value={form.weightG} onChange={(e) => setForm({ ...form, weightG: e.target.value })} placeholder="1150" />
                </Field>
                <Field label="Length (cm)" htmlFor="b-length">
                  <Input id="b-length" type="number" step="0.1" min={1} value={form.lengthCm} onChange={(e) => setForm({ ...form, lengthCm: e.target.value })} placeholder="37.6" />
                </Field>
              </div>
              <Button type="submit" variant="secondary" className="w-full" disabled={!valid}>
                <Plus /> Add measurement
              </Button>
            </form>
          </CardBody>
        </Card>

        {sorted.length > 0 && (
          <Card>
            <CardHeader title="Scan history" />
            <CardBody className="overflow-x-auto">
              <table className="w-full min-w-[420px] text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground">
                    <th className="pb-2 font-medium">Week</th>
                    <th className="pb-2 font-medium">Scan date</th>
                    <th className="pb-2 text-right font-medium">Weight</th>
                    <th className="pb-2 text-right font-medium">Length</th>
                    <th className="pb-2" />
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((b) => (
                    <tr key={b.id} className="border-b border-border/60 last:border-0">
                      <td className="py-2 font-medium text-foreground">{b.week}</td>
                      <td className="py-2 text-muted-foreground">{format(parseISO(b.date), "d MMM yyyy")}</td>
                      <td className="py-2 text-right text-foreground tabular-nums">{b.weightG.toLocaleString("en-GB")} g</td>
                      <td className="py-2 text-right text-foreground tabular-nums">{b.lengthCm} cm</td>
                      <td className="py-2 text-right">
                        <Button variant="ghost" size="icon" aria-label="Delete measurement" onClick={() => deleteBabyGrowth(b.id)} className="size-8">
                          <Trash2 />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
}
