"use client";

import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipProps,
} from "recharts";

// Single-series charts in brand colours. Marks follow the dataviz spec:
// bars <= 24px with 4px rounded tops, 2px lines, >= 8px dots with a surface ring, hairline grid.

const axis = {
  tick: { fill: "var(--muted-foreground)", fontSize: 12 },
  tickLine: false,
  axisLine: false,
} as const;

function ChartTooltip({
  active,
  payload,
  label,
  unit,
  color,
  labelPrefix = "",
}: TooltipProps<number, string> & { unit: string; color: string; labelPrefix?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-surface px-3 py-2 text-xs shadow-[var(--shadow-lift)]">
      <p className="text-sm font-semibold text-foreground">
        {payload[0].value} {unit}
      </p>
      <p className="mt-0.5 flex items-center gap-1.5 text-muted-foreground">
        <span className="h-0.5 w-3 rounded-full" style={{ background: color }} />
        {labelPrefix}
        {label}
      </p>
    </div>
  );
}

export function CycleLengthChart({ data, average }: { data: Array<{ label: string; length: number }>; average: number }) {
  const max = Math.max(40, ...data.map((d) => d.length + 4));
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 16, right: 56, left: -16, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis dataKey="label" {...axis} />
          <YAxis domain={[0, max]} {...axis} allowDecimals={false} />
          <Tooltip
            cursor={{ fill: "var(--surface-2)" }}
            content={<ChartTooltip unit="days" color="var(--primary)" labelPrefix="Cycle starting " />}
          />
          <ReferenceLine
            y={average}
            stroke="var(--muted-foreground)"
            strokeWidth={1}
            label={{ value: `Avg ${average}d`, position: "right", fill: "var(--muted-foreground)", fontSize: 11 }}
          />
          <Bar dataKey="length" fill="var(--primary)" radius={[4, 4, 0, 0]} maxBarSize={24} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TrendLineChart({
  data,
  unit,
  color,
  xLabelPrefix = "",
  domainPadding = 1,
}: {
  data: Array<{ label: string; value: number }>;
  unit: string;
  color: string;
  xLabelPrefix?: string;
  domainPadding?: number;
}) {
  const values = data.map((d) => d.value);
  const min = Math.floor(Math.min(...values) - domainPadding);
  const max = Math.ceil(Math.max(...values) + domainPadding);
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <ComposedChart data={data} margin={{ top: 16, right: 12, left: -12, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis dataKey="label" {...axis} />
          <YAxis domain={[Math.max(0, min), max]} {...axis} />
          <Tooltip
            cursor={{ stroke: "var(--muted-foreground)", strokeWidth: 1 }}
            content={<ChartTooltip unit={unit} color={color} labelPrefix={xLabelPrefix} />}
          />
          <Area type="monotone" dataKey="value" stroke="none" fill={color} fillOpacity={0.1} />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            dot={{ r: 4, fill: color, stroke: "var(--surface)", strokeWidth: 2 }}
            activeDot={{ r: 6, fill: color, stroke: "var(--surface)", strokeWidth: 2 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
