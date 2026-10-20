import { ArrowUpRight, Facebook, Instagram, Linkedin, Youtube } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/component/shared/logo";
import { APP_NAME, COMPANY_NAME, COMPANY_URL, SOCIAL_LINKS } from "@/lib/brand";
import { AppBadges } from "./app-badges";
import { AppQr } from "./app-qr";
import { Container } from "./layout";

// Always dark, in both themes: a cool navy base with restrained rose and plum glows.

const COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/#features" },
      { label: "How it works", href: "/#how-it-works" },
      { label: "Safety", href: "/#safety" },
      { label: "FAQ", href: "/#faq" },
    ],
  },
  {
    title: "Services",
    links: [
      { label: "Period tracker", href: "/login" },
      { label: "Health insights", href: "/login" },
      { label: "Learn & stories", href: "/login" },
      { label: "Find a specialist", href: "/login" },
      { label: "Join as a doctor", href: "/login" },
      { label: "In-person care at GyneClinics", href: COMPANY_URL, external: true },
    ],
  },
];

const SOCIALS = [
  { label: "Instagram", href: SOCIAL_LINKS.instagram, icon: Instagram },
  { label: "Facebook", href: SOCIAL_LINKS.facebook, icon: Facebook },
  { label: "YouTube", href: SOCIAL_LINKS.youtube, icon: Youtube },
  { label: "LinkedIn", href: SOCIAL_LINKS.linkedin, icon: Linkedin },
];

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden bg-[#0d2838] text-white">
      {/* Brand glows */}
      <div aria-hidden className="pointer-events-none absolute -top-40 left-1/4 size-[520px] rounded-full bg-accent/16 blur-[140px]" />
      <div aria-hidden className="pointer-events-none absolute -right-32 bottom-0 size-[460px] rounded-full bg-secondary/20 blur-[140px]" />
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

      <Container className="relative pt-20 pb-16 text-center sm:text-left">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.2fr_0.8fr_0.9fr_1.4fr] lg:gap-x-10 xl:gap-x-16">
          {/* Brand */}
          <div>
            <Logo tone="inverse" />
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-white/60">
              Your private companion for women&apos;s health. Track your cycle, understand your body and talk to
              verified gynaecologists — anytime, anywhere.
            </p>
            <div className="mt-8 flex justify-center gap-2.5 sm:justify-start">
              {SOCIALS.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="inline-flex size-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-white/70 transition-all hover:-translate-y-0.5 hover:border-transparent hover:bg-accent hover:text-white"
                >
                  <Icon className="size-[17px]" strokeWidth={1.75} />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {COLUMNS.map((column) => (
            <div key={column.title}>
              <h3 className="text-xs font-semibold tracking-[0.18em] text-white/40 uppercase">{column.title}</h3>
              <ul className="mt-6 space-y-3.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      {...("external" in link && link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      className="group inline-flex items-center gap-1 text-sm text-white/70 transition-colors hover:text-white"
                    >
                      {link.label}
                      <ArrowUpRight
                        className={
                          "external" in link && link.external
                            ? "size-3.5 text-primary"
                            : "size-3.5 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100"
                        }
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* App download */}
          <div>
            <p className="text-lg font-semibold">Get the {APP_NAME} app</p>
            <div className="mt-5 flex flex-col items-center justify-center gap-4 text-center sm:flex-row sm:justify-start sm:text-left">
              <div className="shrink-0 rounded-xl bg-white p-2">
                <AppQr />
              </div>
              <p className="max-w-[18rem] text-sm leading-relaxed text-white/60">
                Scan with your phone camera to download on iPhone or Android.
              </p>
            </div>
            <AppBadges className="mt-5 flex-nowrap justify-center gap-2 sm:justify-start [&_a]:h-11 [&_a]:gap-2 [&_a]:rounded-xl [&_a]:bg-white [&_a]:px-3 [&_a]:text-[#0c0612] [&_a]:ring-0 dark:[&_a]:bg-white dark:[&_a]:text-[#0c0612] [&_svg]:size-[18px] [&_a_span_span:first-child]:text-[9px] [&_a_span_span:last-child]:text-sm" />
          </div>
        </div>
      </Container>

      {/* Bottom bar */}
      <div className="relative border-t border-white/10 bg-black/30">
        <Container className="flex flex-col items-center gap-3 py-6 text-center text-sm text-white/60 sm:flex-row sm:justify-between sm:text-left">
          <p>
            © 2026 {APP_NAME} · A{" "}
            <a href={COMPANY_URL} target="_blank" rel="noopener noreferrer" className="font-medium text-white/80 underline-offset-4 hover:text-white hover:underline">
              {COMPANY_NAME}
            </a>{" "}
            service
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className="transition-colors hover:text-white">
              Privacy Policy
            </Link>
            <Link href="/terms" className="transition-colors hover:text-white">
              Terms &amp; Conditions
            </Link>
            <Link href="/cookies" className="transition-colors hover:text-white">
              Cookies
            </Link>
          </div>
        </Container>
      </div>
    </footer>
  );
}
