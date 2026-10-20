import Link from "next/link";
import { APP_NAME } from "@/lib/brand";
import { cn } from "@/lib/utils";

type Tone = "default" | "inverse";

/** Ring with a dot — a cycle and today's marker. */
export function LogoMark({ tone = "default", className }: { tone?: Tone; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex size-9 shrink-0 items-center justify-center rounded-xl",
        tone === "inverse" ? "bg-white text-nav" : "bg-primary text-primary-foreground",
        className,
      )}
    >
      <svg viewBox="0 0 24 24" className="size-5" fill="none">
        <circle cx="12" cy="13" r="6.5" stroke="currentColor" strokeWidth="2.25" />
        <circle cx="12" cy="6.5" r="2.75" fill="var(--accent)" stroke={tone === "inverse" ? "#fff" : "currentColor"} strokeWidth="1.5" />
      </svg>
    </span>
  );
}

export function Logo({ href = "/", tone = "default", className }: { href?: string; tone?: Tone; className?: string }) {
  const [first, second] = [APP_NAME.slice(0, 3), APP_NAME.slice(3)];
  return (
    <Link href={href} aria-label={`${APP_NAME} home`} className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark tone={tone} />
      <span
        className={cn(
          "font-serif text-[22px] leading-none font-semibold tracking-tight",
          tone === "inverse" ? "text-white" : "text-foreground",
        )}
      >
        {first}
        <span className={tone === "inverse" ? "text-white/75" : "text-primary"}>{second}</span>
      </span>
    </Link>
  );
}
