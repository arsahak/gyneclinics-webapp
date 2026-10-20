import { cn } from "@/lib/utils";

/** Circular view of the current cycle: period, fertile window, ovulation and today. */
export function CycleRing({
  cycleLength,
  periodLength,
  ovulationDay,
  cycleDay,
  className,
  children,
}: {
  cycleLength: number;
  periodLength: number;
  ovulationDay: number;
  cycleDay: number;
  className?: string;
  children?: React.ReactNode;
}) {
  const size = 240;
  const stroke = 18;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const gap = 2.5;
  const seg = (fromDay: number, toDay: number) => {
    const start = ((fromDay - 1) / cycleLength) * c;
    const length = Math.max(0, ((toDay - fromDay + 1) / cycleLength) * c - gap);
    return { strokeDasharray: `${length} ${c}`, strokeDashoffset: -start };
  };
  const angle = ((Math.min(cycleDay, cycleLength) - 0.5) / cycleLength) * 2 * Math.PI - Math.PI / 2;
  const marker = { x: size / 2 + r * Math.cos(angle), y: size / 2 + r * Math.sin(angle) };
  const ovAngle = ((ovulationDay - 0.5) / cycleLength) * 2 * Math.PI - Math.PI / 2;

  return (
    <div className={cn("relative aspect-square w-full max-w-[240px]", className)}>
      <svg viewBox={`0 0 ${size} ${size}`} className="size-full" role="img" aria-label={`Cycle day ${cycleDay} of ${cycleLength}`}>
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`} fill="none" strokeWidth={stroke} strokeLinecap="round">
          <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--surface-2)" strokeLinecap="butt" />
          <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--phase-period)" {...seg(1, periodLength)} />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke="var(--phase-fertile)"
            opacity={0.55}
            {...seg(Math.max(periodLength + 1, ovulationDay - 5), Math.min(cycleLength, ovulationDay + 1))}
          />
        </g>
        <circle
          cx={size / 2 + r * Math.cos(ovAngle)}
          cy={size / 2 + r * Math.sin(ovAngle)}
          r={stroke / 2 - 1}
          fill="var(--phase-ovulation)"
        />
        <circle cx={marker.x} cy={marker.y} r={stroke / 2 + 4} fill="var(--surface)" stroke="var(--foreground)" strokeWidth={3} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">{children}</div>
    </div>
  );
}
