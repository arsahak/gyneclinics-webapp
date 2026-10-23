import { BarChart3, BellRing, BookOpenText, CalendarHeart, Droplet, MessageCircleHeart, Moon, Sparkles, Star } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

// Features as a bento grid: each card pairs the copy with a small preview of that part of the app.

function FeatureCard({
  icon: Icon,
  tone,
  tint,
  title,
  body,
  className,
  children,
}: {
  icon: LucideIcon;
  /** Solid icon chip colours */
  tone: string;
  /** Soft background for the preview panel, matching the icon colour */
  tint: string;
  title: string;
  body: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "group flex flex-col overflow-hidden rounded-3xl border border-border/80 bg-surface p-6 shadow-(--shadow-soft) transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-(--shadow-lift) sm:p-7",
        className,
      )}
    >
      <span className={cn("inline-flex size-11 items-center justify-center rounded-2xl shadow-(--shadow-soft)", tone)}>
        <Icon className="size-5" />
      </span>
      <h3 className="mt-5 text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">{body}</p>
      <div className={cn("mt-6 flex-1 rounded-2xl p-4 sm:p-5", tint)}>{children}</div>
    </div>
  );
}

const STRIP = Array.from({ length: 14 }, (_, i) => i + 8);

function TrackerPreview() {
  const style = (d: number) =>
    d <= 12 ? "bg-phase-period text-white" : d === 22 ? "bg-phase-ovulation text-white" : d >= 17 ? "bg-phase-fertile/15 text-phase-fertile" : "bg-surface text-muted-foreground";
  return (
    <div className="space-y-4">
      <div className="flex justify-between gap-1">
        {STRIP.map((d) => (
          <span
            key={d}
            className={cn(
              "flex aspect-square w-full max-w-9 items-center justify-center rounded-full text-[11px] font-medium",
              style(d),
              d === 20 && "border-2 border-dotted border-foreground",
            )}
          >
            {d}
          </span>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 text-xs">
        <span className="rounded-full bg-surface px-3 py-1.5 font-medium text-accent">Next period in 16 days</span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-muted-foreground">
          <BellRing className="size-3.5 text-gold" /> Reminder on
        </span>
      </div>
    </div>
  );
}

function InsightsPreview() {
  const bars = [27, 29, 28, 30, 27, 29];
  return (
    <div>
      <div className="flex items-baseline justify-between text-xs">
        <span className="text-muted-foreground">Avg. cycle</span>
        <span className="font-semibold text-foreground">28 days</span>
      </div>
      <div className="mt-3 flex h-20 items-end gap-2">
        {bars.map((v, i) => (
          <span
            key={i}
            className="flex-1 origin-bottom rounded-t-[5px] bg-primary transition-transform duration-500 group-hover:scale-y-110"
            style={{ height: `${((v - 20) / 12) * 100}%`, opacity: i === bars.length - 1 ? 1 : 0.45 }}
          />
        ))}
      </div>
    </div>
  );
}

function LearnPreview() {
  const items = [
    { title: "What is a normal cycle?", tag: "Periods", icon: Droplet, color: "bg-accent-soft text-accent" },
    { title: "Your fertile window", tag: "Fertility", icon: Sparkles, color: "bg-primary-soft text-primary" },
    { title: "Perimenopause signs", tag: "Menopause", icon: Moon, color: "bg-secondary-soft text-secondary" },
  ];
  return (
    <ul className="space-y-2.5">
      {items.map((item) => (
        <li key={item.title} className="flex items-center gap-3 rounded-xl bg-surface p-2">
          <span className={cn("inline-flex size-9 shrink-0 items-center justify-center rounded-lg", item.color)}>
            <item.icon className="size-4" />
          </span>
          <div className="min-w-0 text-xs">
            <p className="truncate font-medium text-foreground">{item.title}</p>
            <p className="text-muted-foreground">{item.tag}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

function HelpPreview() {
  const doctors = [
    { initials: "AH", name: "Dr. Amelia Hart", role: "Consultant Gynaecologist", rating: "4.9", gradient: "from-[#207898] to-[#804898]" },
    { initials: "NR", name: "Dr. Nadia Rahman", role: "Fertility Specialist", rating: "4.8", gradient: "from-[#804898] to-[#a67fb7]" },
  ];
  return (
    <div className="grid gap-4 md:grid-cols-[1fr_0.9fr]">
      <ul className="space-y-2.5">
        {doctors.map((d) => (
          <li key={d.name} className="flex items-center gap-3 rounded-xl bg-surface p-2.5">
            <span className={cn("relative inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-[11px] font-semibold text-white", d.gradient)}>
              {d.initials}
              <span className="absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full bg-success ring-2 ring-surface" />
            </span>
            <div className="min-w-0 flex-1 text-xs">
              <p className="truncate font-semibold text-foreground">{d.name}</p>
              <p className="truncate text-muted-foreground">{d.role}</p>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-foreground">
              <Star className="size-3.5 fill-gold text-gold" /> {d.rating}
            </span>
          </li>
        ))}
      </ul>
      <div className="flex flex-col justify-end gap-2 rounded-xl bg-surface p-3 text-xs">
        <p className="self-end rounded-2xl rounded-br-sm bg-primary px-3 py-2 text-primary-foreground">
          My last two cycles were 38 and 41 days.
        </p>
        <p className="self-start rounded-2xl rounded-bl-sm bg-primary-soft px-3 py-2 text-foreground">
          Thanks for sharing — let&apos;s look at your history.
        </p>
      </div>
    </div>
  );
}

export function FeaturesBento() {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <FeatureCard
        className="lg:col-span-2"
        icon={CalendarHeart}
        tone="bg-accent text-accent-foreground"
        tint="bg-accent-soft/70"
        title="Period tracker"
        body="Log your period dates and see your cycle on a clear calendar, with gentle reminders before your next one."
      >
        <TrackerPreview />
      </FeatureCard>
      <FeatureCard
        icon={BarChart3}
        tone="bg-primary text-primary-foreground"
        tint="bg-primary-soft/70"
        title="Health insights"
        body="Cycle trends, your fertile window, weight and baby growth — all from your own entries."
      >
        <InsightsPreview />
      </FeatureCard>
      <FeatureCard
        icon={BookOpenText}
        tone="bg-secondary text-secondary-foreground"
        tint="bg-secondary-soft/80"
        title="Learn"
        body="Trusted articles from specialists and real stories from women."
      >
        <LearnPreview />
      </FeatureCard>
      <FeatureCard
        className="lg:col-span-2"
        icon={MessageCircleHeart}
        tone="bg-primary text-primary-foreground"
        tint="bg-primary-soft/70"
        title="Get help"
        body="Find a verified gynaecologist and chat privately and securely — your contact details are never shared."
      >
        <HelpPreview />
      </FeatureCard>
    </div>
  );
}
