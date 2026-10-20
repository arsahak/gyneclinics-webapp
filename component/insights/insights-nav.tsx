"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/patient/insights", label: "Cycle" },
  { href: "/patient/insights/weight", label: "Weight" },
  { href: "/patient/insights/baby", label: "Baby growth" },
];

export function InsightsNav() {
  const pathname = usePathname();
  return (
    <nav className="no-scrollbar mb-6 flex gap-2 overflow-x-auto">
      {LINKS.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex h-9 shrink-0 items-center rounded-full border px-4 text-sm font-medium transition-colors",
              active
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-surface text-muted-foreground hover:text-foreground",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
