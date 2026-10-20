import { CalendarDays, FileText } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Container } from "./layout";

export interface LegalSection {
  id: string;
  title: string;
  body: ReactNode;
}

const OTHER_PAGES = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms & Conditions" },
  { href: "/cookies", label: "Cookie Policy" },
];

/** Shared layout for legal pages: hero header, sticky table of contents and readable prose. */
export function LegalDoc({
  title,
  intro,
  updated,
  current,
  sections,
}: {
  title: string;
  intro: ReactNode;
  updated: string;
  current: string;
  sections: LegalSection[];
}) {
  return (
    <>
      <section className="relative overflow-hidden border-b border-border/60">
        <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-primary-soft/80 to-surface" />
        <Container className="relative py-14 lg:py-20">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-surface/80 px-3.5 py-1.5 text-xs font-semibold text-primary">
            <FileText className="size-3.5" /> Legal
          </span>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">{title}</h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">{intro}</p>
          <p className="mt-6 inline-flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="size-4" /> Last updated {updated}
          </p>
        </Container>
      </section>

      <Container className="grid gap-12 py-14 lg:grid-cols-[240px_1fr] lg:gap-16 lg:py-20">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">On this page</p>
          <ol className="mt-4 space-y-2.5 border-l border-border text-sm">
            {sections.map((section, i) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="-ml-px block border-l-2 border-transparent pl-4 text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
                >
                  {i + 1}. {section.title}
                </a>
              </li>
            ))}
          </ol>
          <div className="mt-8 hidden space-y-2 text-sm lg:block">
            <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Related</p>
            {OTHER_PAGES.filter((page) => page.href !== current).map((page) => (
              <Link key={page.href} href={page.href} className="block text-primary hover:underline">
                {page.label}
              </Link>
            ))}
          </div>
        </aside>

        <article className="max-w-3xl">
          {sections.map((section, i) => (
            <section key={section.id} id={section.id} className="scroll-mt-28 border-b border-border/60 py-8 first:pt-0 last:border-0">
              <h2 className="text-xl font-semibold text-foreground sm:text-2xl">
                <span className="mr-2 text-primary">{i + 1}.</span>
                {section.title}
              </h2>
              <div className="mt-4 space-y-4 leading-relaxed text-muted-foreground [&_a]:font-medium [&_a]:text-primary [&_a:hover]:underline [&_li]:pl-1 [&_strong]:font-semibold [&_strong]:text-foreground [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
                {section.body}
              </div>
            </section>
          ))}
        </article>
      </Container>
    </>
  );
}
