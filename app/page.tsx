import {
  ArrowRight,
  CalendarCheck,
  Globe2,
  LockKeyhole,
  Mail,
  MessagesSquare,
  Search,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";
import Link from "next/link";
import { AppBadges } from "@/component/landing/app-badges";
import { AppQr } from "@/component/landing/app-qr";
import { FeaturesBento } from "@/component/landing/features-bento";
import { HeroVisual } from "@/component/landing/hero-visual";
import { Container, Section, SectionHeading } from "@/component/landing/layout";
import { SiteFooter } from "@/component/landing/site-footer";
import { TypingTitle } from "@/component/landing/typing-title";
import { LandingNav, TopBar } from "@/component/layout/landing-nav";
import { NavAccount } from "@/component/layout/nav-account";
import { Faq } from "@/component/shared/faq";
import { ButtonLink } from "@/component/ui/button";
import { APP_NAME, SUPPORT_EMAIL } from "@/lib/brand";

const steps = [
  { icon: Search, title: "Find a specialist", body: "Browse verified gynaecologists by focus area, experience and rating." },
  { icon: CalendarCheck, title: "Book and pay", body: "Chat now or pick a time. A fair price for your region, confirmed instantly." },
  { icon: MessagesSquare, title: "Chat privately", body: "24 hours of private chat, then 7 days of free follow-up on the same concern." },
];

const trust = [
  { icon: ShieldCheck, title: "Verified specialists", body: "Every doctor's registration is checked before they can chat." },
  { icon: LockKeyhole, title: "Private by design", body: "Your data is only used with your consent, and contact details are never shared in chat." },
  { icon: Globe2, title: "Fair regional pricing", body: "Consultation fees adjust to the region you open the app from." },
];

export default function Landing() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <TopBar />
      <LandingNav account={<NavAccount />} />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          {/* Background: a cool, airy wash with just enough colour to frame the product preview. */}
          <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-primary-soft/85 via-surface to-background" />
          <div
            aria-hidden
            className="absolute inset-0 [background-image:radial-gradient(var(--border)_1.2px,transparent_1.2px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]"
          />
          <div aria-hidden className="absolute -top-24 right-[8%] hidden size-[480px] rounded-full bg-secondary/10 blur-[120px] lg:block" />
          <div aria-hidden className="absolute top-24 -left-48 hidden size-[360px] rounded-full bg-primary/10 blur-[110px] lg:block" />

          <Container className="relative grid items-center gap-10 pt-12 pb-8 lg:grid-cols-[1.05fr_0.95fr] lg:pt-16 lg:pb-4">
            <div className="animate-fade-up mx-auto max-w-xl text-center lg:mx-0 lg:text-left">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-surface/80 px-3.5 py-1.5 text-xs font-semibold text-primary shadow-(--shadow-soft) backdrop-blur">
                <span className="relative flex size-2">
                  <span className="animate-ping-soft absolute inline-flex size-full rounded-full bg-primary" />
                  <span className="relative inline-flex size-2 rounded-full bg-primary" />
                </span>
                Women&apos;s health, made simple
              </span>
              <TypingTitle
                // Always two lines: each line stays whole and the size follows the screen width.
                className="mt-6 text-[clamp(1.5rem,6.4vw,2.6rem)] leading-[1.15] font-semibold tracking-tight text-foreground lg:text-[clamp(2.1rem,2.75vw,2.75rem)]"
                lines={[
                  { text: "Empowering and Redefining", className: "whitespace-nowrap" },
                  {
                    text: "Women’s Health Care.",
                    className: "whitespace-nowrap bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent",
                  },
                ]}
              />
              <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
                Track your periods, understand your health, and chat privately with verified gynaecologists — all in one app.
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                <ButtonLink href="/login" className="group px-6 shadow-(--shadow-soft)">
                  Create free account
                  <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
                </ButtonLink>
                <ButtonLink
                  href="/login"
                  variant="outline"
                  className="border-primary/40 bg-surface/70 px-6 text-foreground backdrop-blur hover:border-primary hover:bg-primary-soft hover:text-primary"
                >
                  <Stethoscope /> I&apos;m a doctor
                </ButtonLink>
              </div>

              {/* Trust row */}
              <div className="mt-8 flex items-center justify-center gap-3 lg:justify-start">
                <div className="flex -space-x-2">
                  {[
                    ["AH", "from-[#804898] to-[#207898]"],
                    ["NR", "from-[#207898] to-[#a67fb7]"],
                    ["SC", "from-[#6c3c80] to-[#804898]"],
                    ["PM", "from-[#a67fb7] to-[#af8d53]"],
                  ].map(([initials, gradient]) => (
                    <span
                      key={initials}
                      className={`inline-flex size-9 items-center justify-center rounded-full bg-gradient-to-br text-[11px] font-semibold text-white ring-2 ring-background ${gradient}`}
                    >
                      {initials}
                    </span>
                  ))}
                </div>
                <div className="text-left text-sm leading-tight">
                  <p className="font-semibold text-foreground">Verified gynaecologists</p>
                  <p className="flex items-center gap-1.5 text-muted-foreground">
                    <span className="size-1.5 rounded-full bg-success" /> Online now · private chat
                  </p>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-center gap-5 border-t border-border/70 pt-6 lg:justify-start">
                {/* QR is for desktop visitors — on a phone, tapping a badge is enough */}
                <div className="hidden shrink-0 rounded-2xl border border-border bg-white p-2 shadow-(--shadow-soft) sm:block">
                  <AppQr size={80} color="#24142b" />
                </div>
                <div className="text-center lg:text-left">
                  <p className="mb-2.5 text-xs font-medium text-muted-foreground">
                    <span className="hidden sm:inline">Scan to download for iPhone or Android, or tap below</span>
                    <span className="sm:hidden">Get the app</span>
                  </p>
                  <AppBadges className="justify-center lg:justify-start [&_a]:h-11 [&_a]:rounded-xl [&_a]:px-3.5 [&_svg]:size-5 [&_a_span_span:last-child]:text-sm" />
                </div>
              </div>
            </div>

            <div className="hidden lg:block">
              <HeroVisual />
            </div>
          </Container>
        </section>

        {/* Features */}
        <Section id="features" tone="white">
          <SectionHeading
            eyebrow="Features"
            title="Care that fits around your life"
            description="Everything you need to understand your body, in one private place."
          />
          <div className="mt-14">
            <FeaturesBento />
          </div>
        </Section>

        {/* How it works */}
        <Section
          id="how-it-works"
          tone="primary"
          className="[&_h2]:text-primary-foreground [&_h3]:text-primary-foreground [&_p]:text-primary-foreground/80"
        >
          <SectionHeading
            eyebrow="How it works"
            title="Expert advice in three simple steps"
            description="From finding the right specialist to a private conversation — in minutes."
          />
          <ol className="relative mt-14 grid gap-10 md:grid-cols-3 md:gap-6">
            {/* Dotted connector between the steps on desktop */}
            <span
              aria-hidden
              className="absolute top-8 right-[16.6%] left-[16.6%] hidden border-t-2 border-dotted border-white/35 md:block"
            />
            {steps.map(({ icon: Icon, title, body }, i) => (
              <li key={title} className="relative flex flex-col items-center text-center">
                <span className="relative inline-flex size-16 items-center justify-center rounded-full bg-white/15 text-white shadow-(--shadow-lift) ring-8 ring-white/10 backdrop-blur-sm">
                  <Icon className="size-6" />
                  <span className="absolute -top-1 -right-1 inline-flex size-6 items-center justify-center rounded-full bg-accent text-[11px] font-semibold text-accent-foreground ring-2 ring-primary">
                    {i + 1}
                  </span>
                </span>
                <h3 className="mt-6 text-lg font-semibold text-foreground">{title}</h3>
                <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">{body}</p>
              </li>
            ))}
          </ol>
          <div className="mt-12 flex justify-center">
            <ButtonLink href="/login" variant="outline" className="group border-white/50 bg-white/5 px-6 text-white hover:border-white hover:bg-white hover:text-primary">
              Find a specialist
              <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
            </ButtonLink>
          </div>
        </Section>

        {/* Safety */}
        <Section id="safety" tone="white">
          <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            <div>
              <p className="text-sm font-semibold tracking-wide text-primary uppercase">Safety</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                Safe, private and professional
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                Your health is personal. {APP_NAME} is built to keep it that way — with verified doctors, consent-first
                data and clear, honest pricing.
              </p>
              <div className="mt-8 flex items-start gap-3 rounded-2xl border border-gold/25 bg-gold-soft p-4">
                <ShieldCheck className="mt-0.5 size-5 shrink-0 text-gold" />
                <p className="text-sm leading-relaxed text-foreground/80">
                  Information, not diagnosis. {APP_NAME} never replaces an in-person examination, and we&apos;ll always
                  point you to the right care.
                </p>
              </div>
            </div>

            <ul className="space-y-4">
              {trust.map(({ icon: Icon, title, body }) => (
                <li
                  key={title}
                  className="flex items-start gap-4 rounded-2xl border border-border/70 bg-surface p-5 shadow-(--shadow-soft) transition-shadow hover:shadow-(--shadow-lift) sm:p-6"
                >
                  <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                    <Icon className="size-6" />
                  </span>
                  <div>
                    <h3 className="font-semibold text-foreground">{title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </Section>

        {/* FAQ */}
        <Section id="faq" tone="tint">
          <SectionHeading
            eyebrow="FAQ"
            title="Frequently asked questions"
            description="Everything you need to know about tracking, privacy and talking to a specialist."
          />
          <div className="mx-auto mt-14 max-w-3xl">
            <Faq />
            <p className="mt-8 text-center text-sm text-muted-foreground">
              Still have questions?{" "}
              <a href={`mailto:${SUPPORT_EMAIL}`} className="inline-flex items-center gap-1 font-medium text-primary hover:underline">
                <Mail className="size-4" /> Contact support
              </a>
            </p>
          </div>
        </Section>

        {/* Call to action */}
        <section className="bg-surface py-14 lg:py-20">
          <Container>
            <div className="relative overflow-hidden rounded-4xl bg-gradient-to-br from-nav via-[#6c3c80] to-[#207898] px-6 py-14 text-center text-white shadow-[0_28px_64px_-32px_rgb(54_30_64/0.7)] sm:px-12 lg:py-16">
              <div aria-hidden className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-white/10 blur-2xl" />
              <div aria-hidden className="pointer-events-none absolute -bottom-24 -left-24 size-72 rounded-full bg-accent/25 blur-3xl" />
              <h2 className="relative text-3xl font-semibold tracking-tight sm:text-4xl">Start understanding your cycle today</h2>
              <p className="relative mx-auto mt-4 max-w-xl text-white/80">
                Free to track. Talk to a verified specialist whenever you need guidance.
              </p>
              <div className="relative mt-8 flex flex-wrap justify-center gap-3">
                <Link
                  href="/login"
                  className="inline-flex h-14 items-center rounded-2xl bg-white px-7 text-base font-semibold text-nav transition-colors hover:bg-white/90"
                >
                  Create free account
                </Link>
              </div>
            </div>
          </Container>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
