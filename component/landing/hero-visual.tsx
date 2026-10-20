import { BarChart3, BellRing, CalendarCheck, Check } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

// Decorative hero: an app-style cycle calendar card, with the other services
// (insights, reminders, specialist chat, consultations) floating around it. Pure CSS animation.

// Sample month for the preview: October 2026 (starts on a Thursday), 28-day cycle.
const MONTH_LABEL = "October 2026";
const FIRST_WEEKDAY = 3; // Mon = 0
const DAYS_IN_MONTH = 31;
const TODAY = 20;
const PERIOD = { from: 8, to: 12 };
const FERTILE = { from: 17, to: 23 };
const OVULATION = 22;

function dayStyle(day: number) {
  if (day === TODAY) return "border-2 border-dotted border-foreground bg-phase-fertile/10 text-foreground font-semibold";
  if (day >= PERIOD.from && day <= PERIOD.to) return "bg-phase-period text-white font-semibold";
  if (day === OVULATION) return "bg-phase-ovulation text-white font-semibold";
  if (day >= FERTILE.from && day <= FERTILE.to)
    return "border-2 border-dotted border-phase-fertile bg-phase-fertile/10 text-phase-fertile font-medium";
  return "border border-dotted border-muted-foreground/40 text-foreground/80";
}

function CalendarCard() {
  const cells = [...Array(FIRST_WEEKDAY).fill(null), ...Array.from({ length: DAYS_IN_MONTH }, (_, i) => i + 1)];
  return (
    <div className="animate-pop-in w-[320px] rounded-[2rem] border border-border/90 bg-surface/95 p-5 shadow-[0_30px_70px_-25px_rgb(25_66_84/0.3)] backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] text-muted-foreground">My cycle</p>
          <p className="text-base font-semibold text-foreground">{MONTH_LABEL}</p>
        </div>
        <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">Cycle day 13</span>
      </div>

      <div className="mt-4 grid grid-cols-7 text-center text-[10px] font-medium text-muted-foreground">
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <span key={i} className="py-1">
            {d}
          </span>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-y-1.5 text-center text-xs">
        {cells.map((day, i) =>
          day === null ? (
            <span key={`e${i}`} />
          ) : (
            <span key={day} className="flex justify-center">
              <span
                className={cn(
                  "animate-pop-in flex size-8 items-center justify-center rounded-full",
                  dayStyle(day),
                )}
                style={{ animationDelay: `${0.3 + i * 0.02}s` }}
              >
                {day}
              </span>
            </span>
          ),
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-phase-period" /> Period</span>
        <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-phase-fertile/50" /> Fertile</span>
        <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-phase-ovulation" /> Ovulation</span>
        <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full border-2 border-dotted border-foreground" /> Today</span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 border-t border-border pt-4 text-[11px]">
        <div className="rounded-2xl bg-accent-soft px-3 py-2.5">
          <p className="text-muted-foreground">Next period</p>
          <p className="text-sm font-semibold text-accent">in 16 days</p>
        </div>
        <div className="rounded-2xl bg-primary-soft px-3 py-2.5">
          <p className="text-muted-foreground">Fertile window</p>
          <p className="text-sm font-semibold text-primary">Now</p>
        </div>
      </div>
    </div>
  );
}

function Floating({ className, delay, floatDelay, children }: { className: string; delay: string; floatDelay: string; children: ReactNode }) {
  return (
    <div className={cn("absolute z-10", className)}>
      <div className="animate-pop-in" style={{ animationDelay: delay }}>
        <div className="animate-float" style={{ animationDelay: floatDelay }}>
          <div className="rounded-2xl border border-border/80 bg-surface/95 p-3 shadow-[var(--shadow-lift)] backdrop-blur">{children}</div>
        </div>
      </div>
    </div>
  );
}

const bars = [27, 29, 28, 30, 27, 29];

export function HeroVisual() {
  return (
    <div aria-hidden className="relative mx-auto flex h-[600px] w-full max-w-[540px] items-center justify-center select-none">
      {/* Backdrop */}
      <div className="absolute size-[440px] rounded-full bg-gradient-to-br from-primary/24 via-secondary/12 to-accent/15 blur-3xl" />
      <div className="absolute size-[372px] rounded-full border border-primary/15 bg-gradient-to-b from-surface/80 to-primary-soft/45 shadow-[inset_0_1px_rgb(255_255_255/0.6)]" />

      <div className="relative max-sm:scale-[0.92]">
        <CalendarCard />
      </div>

      {/* Insights */}
      <Floating className="top-[34%] -left-[4%] hidden sm:block xl:-left-[12%]" delay="0.7s" floatDelay="0s">
        <div className="w-[128px]">
          <div className="flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1.5 font-semibold text-foreground">
              <BarChart3 className="size-3.5 text-primary" /> Insights
            </span>
            <span className="text-success">Regular</span>
          </div>
          <div className="mt-2.5 flex h-12 items-end gap-1.5">
            {bars.map((length, i) => (
              <span
                key={i}
                className="animate-grow-up flex-1 rounded-t-[4px] bg-primary"
                style={{ height: `${((length - 20) / 12) * 100}%`, animationDelay: `${1 + i * 0.1}s`, opacity: i === bars.length - 1 ? 1 : 0.5 }}
              />
            ))}
          </div>
          <p className="mt-1.5 text-[10px] text-muted-foreground">Cycle length · last 6</p>
        </div>
      </Floating>

      {/* Reminder */}
      <Floating className="top-[3%] right-0 xl:-right-[6%]" delay="0.9s" floatDelay="1.4s">
        <div className="flex items-center gap-2.5">
          <span className="relative inline-flex size-8 items-center justify-center rounded-xl bg-gold-soft text-gold">
            <BellRing className="size-4" />
            <span className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-accent ring-2 ring-surface" />
          </span>
          <div className="text-[11px] leading-tight">
            <p className="font-semibold text-foreground">Reminder</p>
            <p className="text-muted-foreground">Period due in 2 days</p>
          </div>
        </div>
      </Floating>

      {/* Specialist chat */}
      <Floating className="bottom-[1%] left-0 xl:-left-[15%]" delay="1.1s" floatDelay="0.7s">
        <div className="w-[158px]">
          <div className="flex items-center gap-2">
            <span className="relative inline-flex size-7 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-[9px] font-semibold text-white">
              AH
              <span className="absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full bg-success ring-2 ring-surface" />
            </span>
            <p className="text-[11px] leading-tight font-semibold text-foreground">Dr. Amelia Hart</p>
          </div>
          <p className="mt-2 rounded-xl rounded-tl-sm bg-surface-2 px-2.5 py-2 text-[11px] leading-snug text-foreground">
            Your cycles look regular — keep tracking.
          </p>
          <div className="mt-1.5 inline-flex items-center gap-1 rounded-xl rounded-tl-sm bg-surface-2 px-2.5 py-2">
            {[0, 0.15, 0.3].map((d) => (
              <span key={d} className="animate-typing size-1.5 rounded-full bg-muted-foreground" style={{ animationDelay: `${d}s` }} />
            ))}
          </div>
        </div>
      </Floating>

      {/* Consultation confirmed */}
      <Floating className="right-0 bottom-[3%] hidden sm:block xl:-right-[6%]" delay="1.3s" floatDelay="2s">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex size-8 items-center justify-center rounded-full bg-success-soft text-success">
            <Check className="size-4" strokeWidth={3} />
          </span>
          <div className="text-[11px] leading-tight">
            <p className="font-semibold text-foreground">Booking confirmed</p>
            <p className="flex items-center gap-1 text-muted-foreground">
              <CalendarCheck className="size-3" /> Today · 15:30
            </p>
          </div>
        </div>
      </Floating>
    </div>
  );
}
