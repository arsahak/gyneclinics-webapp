import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

// Shared layout primitives so every landing section lines up on the same grid and rhythm.

/** One content width for the whole site: top bar, navbar, sections and footer. */
export function Container({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", className)}>{children}</div>;
}

/**
 * Standard section: same vertical rhythm everywhere, and a background tone that alternates
 * white / soft teal down the page so sections separate without border lines.
 */
export function Section({
  id,
  tone = "white",
  className,
  children,
}: {
  id?: string;
  tone?: "white" | "tint" | "primary";
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className={cn(
        "scroll-mt-20 py-14 lg:py-20",
        tone === "white" ? "bg-surface" : tone === "tint" ? "bg-primary-soft/40" : "bg-primary text-primary-foreground",
        className,
      )}
    >
      <Container>{children}</Container>
    </section>
  );
}

/** Centred eyebrow + title + description used at the top of every section. */
export function SectionHeading({
  eyebrow,
  title,
  description,
  className,
}: {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto max-w-2xl text-center", className)}>
      <p className="text-sm font-semibold tracking-wide text-primary uppercase">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{title}</h2>
      {description && <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{description}</p>}
    </div>
  );
}
