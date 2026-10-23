"use client";

import { ArrowUpRight, HelpCircle, Mail, Menu, ShieldCheck, X } from "lucide-react";
import Link from "next/link";
import { type ReactNode, useEffect, useState } from "react";
import { Container } from "@/component/landing/layout";
import { Logo } from "@/component/shared/logo";
import { ThemeToggle } from "@/component/shared/theme-toggle";
import { COMPANY_NAME, COMPANY_URL, SUPPORT_EMAIL } from "@/lib/brand";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/#features", label: "Features" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#safety", label: "Safety" },
  { href: "/#faq", label: "FAQ" },
];

/** Thin info bar above the navbar. It scrolls away; the navbar below stays sticky. */
export function TopBar() {
  return (
    <div className="bg-black text-xs text-white/80 shadow-[inset_0_-1px_rgb(255_255_255/0.08)]">
      <Container className="flex h-9 items-center justify-between gap-4">
        <p className="flex min-w-0 items-center gap-2">
          <ShieldCheck className="size-3.5 shrink-0 text-primary" />
          <span className="truncate">
            <span className="hidden sm:inline">Talk to a verified gynaecologist — book in minutes</span>
            <span className="sm:hidden">Verified gynaecologists, online</span>
          </span>
        </p>
        <div className="flex shrink-0 items-center gap-4">
          <a href={`mailto:${SUPPORT_EMAIL}`} className="hidden items-center gap-1.5 transition-colors hover:text-white md:inline-flex">
            <Mail className="size-3.5" /> {SUPPORT_EMAIL}
          </a>
          <span className="hidden h-3 w-px bg-white/20 md:block" />
          <Link href="/#faq" className="inline-flex items-center gap-1.5 transition-colors hover:text-white">
            <HelpCircle className="size-3.5" /> Help
          </Link>
          <span className="h-3 w-px bg-white/20" />
          <a
            href={COMPANY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-medium text-white transition-colors hover:text-primary"
          >
            <span className="hidden sm:inline">Visit {COMPANY_NAME}</span>
            <span className="sm:hidden">{COMPANY_NAME}</span>
            <ArrowUpRight className="size-3.5" />
          </a>
        </div>
      </Container>
    </div>
  );
}

const SECTION_IDS = NAV_ITEMS.map((item) => item.href.split("#")[1]);

/** Which landing section is under the navbar right now (null in the hero or on other pages). */
function useActiveSection() {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      let current: string | null = null;
      for (const id of SECTION_IDS) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 140) current = id;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);
  return active;
}

/**
 * Landing page navbar on the brand colour, with a collapsible menu on small screens.
 * `account` is the log-in / portal button (`NavAccount`), rendered on the server.
 */
export function LandingNav({ account }: { account: ReactNode }) {
  const [open, setOpen] = useState(false);
  const active = useActiveSection();

  return (
    <header className="sticky top-0 z-30 bg-primary text-white shadow-[0_8px_24px_-12px_rgb(18_51_75/0.3)]">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Logo tone="inverse" />

        <nav className="hidden items-center gap-2 text-sm font-medium md:flex">
          {NAV_ITEMS.map((item) => {
            const isActive = active === item.href.split("#")[1];
            return (
              <Link
                key={item.label}
                href={item.href}
                aria-current={isActive ? "true" : undefined}
                className={cn(
                  "relative px-4 py-2 transition-colors after:absolute after:inset-x-4 after:bottom-0.5 after:h-0.5 after:origin-left after:rounded-full after:bg-white after:transition-transform after:duration-300 hover:text-white hover:after:scale-x-100",
                  isActive ? "text-white after:scale-x-100" : "text-white/80 after:scale-x-0",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <ThemeToggle className="text-white/80 hover:bg-white/10 hover:text-white" />
          {account}
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-navigation"
            onClick={() => setOpen((wasOpen) => !wasOpen)}
            className="inline-flex size-10 items-center justify-center rounded-full text-white/90 transition-colors hover:bg-white/10 md:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </Container>

      <div
        className={cn(
          "grid border-t transition-[grid-template-rows,opacity,border-color] duration-300 ease-out md:hidden",
          open ? "grid-rows-[1fr] border-white/10 opacity-100" : "pointer-events-none grid-rows-[0fr] border-transparent opacity-0",
        )}
      >
        <nav id="mobile-navigation" aria-hidden={!open} className="overflow-hidden">
          <ul className={cn("space-y-1 px-4 py-3 transition-all duration-300 ease-out", open ? "translate-y-0" : "-translate-y-2")}>
            {NAV_ITEMS.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  tabIndex={open ? 0 : -1}
                  onClick={(event) => {
                    setOpen(false);
                    // On the landing page: close first, then scroll, so the taller open menu doesn't
                    // throw off the scroll position. On other pages, let the link navigate to "/#section".
                    const target = document.getElementById(item.href.split("#")[1] ?? "");
                    if (!target) return;
                    event.preventDefault();
                    requestAnimationFrame(() => {
                      target.scrollIntoView({ behavior: "smooth" });
                      history.replaceState(null, "", item.href);
                    });
                  }}
                  className={cn(
                    "block rounded-xl px-4 py-3 text-sm font-medium hover:bg-white/10 hover:text-white",
                    active === item.href.split("#")[1] ? "bg-white/10 text-white" : "text-white/85",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
