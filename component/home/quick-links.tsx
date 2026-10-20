import { Baby, CalendarDays, ChartSpline, Scale } from "lucide-react";
import Link from "next/link";

const links = [
  { href: "/patient/calendar", label: "Calendar", body: "See your cycle month by month", icon: CalendarDays, tone: "bg-accent-soft text-accent" },
  { href: "/patient/insights", label: "Cycle insights", body: "Trends and fertile window", icon: ChartSpline, tone: "bg-primary-soft text-primary" },
  { href: "/patient/insights/weight", label: "Weight", body: "Track changes over time", icon: Scale, tone: "bg-gold-soft text-gold" },
  { href: "/patient/insights/baby", label: "Baby growth", body: "From your scan reports", icon: Baby, tone: "bg-secondary-soft text-secondary" },
];

export function QuickLinks() {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {links.map(({ href, label, body, icon: Icon, tone }) => (
        <Link
          key={href}
          href={href}
          className="rounded-3xl border border-border bg-surface p-4 transition-shadow hover:shadow-[var(--shadow-soft)]"
        >
          <span className={`inline-flex size-10 items-center justify-center rounded-2xl ${tone}`}>
            <Icon className="size-5" />
          </span>
          <p className="mt-3 text-sm font-semibold text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground">{body}</p>
        </Link>
      ))}
    </div>
  );
}
