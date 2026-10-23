"use client";

import { Bell, BookOpenText, CalendarCheck, CalendarClock, CalendarDays, ChartSpline, House, LayoutDashboard, LogOut, MessagesSquare, PenLine, Star, Stethoscope, UserRound, Video, Wallet, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useAccount } from "@/component/shared/account-provider";
import { Logo } from "@/component/shared/logo";
import { NotificationBell, NotificationPoller, NotificationToasts, UnreadBadge } from "@/component/shared/notification-bell";
import { RegionChip } from "@/component/shared/region";
import { ThemeToggle } from "@/component/shared/theme-toggle";
import { Avatar } from "@/component/ui/avatar";
import { Skeleton } from "@/component/ui/skeleton";
import { PortalPageSkeleton } from "@/component/layout/portal-skeletons";
import { signOutAction } from "@/app/actions/authAction";
import { useHydrated } from "@/lib/store/app-status";
import type { Role } from "@/lib/types";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Child paths that should not keep this item highlighted. */
  excludeActiveWhen?: string[];
  /** Shown in the mobile bottom bar (max five). */
  mobile?: boolean;
}

const NAV: Record<Role, NavItem[]> = {
  patient: [
    { href: "/patient", label: "Home", icon: House, mobile: true },
    { href: "/patient/calendar", label: "Calendar", icon: CalendarDays },
    { href: "/patient/learn", label: "Learn", icon: BookOpenText, excludeActiveWhen: ["/patient/learn/share-story"], mobile: true },
    { href: "/patient/learn/share-story", label: "Share story", icon: PenLine },
    { href: "/patient/insights", label: "Insights", icon: ChartSpline, mobile: true },
    { href: "/patient/doctors", label: "Get help", icon: Stethoscope, mobile: true },
    { href: "/patient/consultations", label: "Consultations", icon: CalendarCheck },
    { href: "/patient/messages", label: "Messages", icon: MessagesSquare },
    { href: "/patient/notifications", label: "Notifications", icon: Bell },
    { href: "/patient/test-call", label: "Test call", icon: Video },
    { href: "/patient/profile", label: "Profile", icon: UserRound, mobile: true },
  ],
  doctor: [
    { href: "/doctor", label: "Dashboard", icon: LayoutDashboard, mobile: true },
    { href: "/doctor/availability", label: "Availability", icon: CalendarClock, mobile: true },
    { href: "/doctor/messages", label: "Messages", icon: MessagesSquare, mobile: true },
    { href: "/doctor/notifications", label: "Notifications", icon: Bell },
    { href: "/doctor/earnings", label: "Earnings", icon: Wallet },
    { href: "/doctor/test-call", label: "Test call", icon: Video },
    { href: "/doctor/reviews", label: "Reviews", icon: Star, mobile: true },
    { href: "/doctor/profile", label: "Profile", icon: UserRound, mobile: true },
  ],
};

const HOME: Record<Role, string> = { patient: "/patient", doctor: "/doctor" };

function isActive(pathname: string, href: string, home: string) {
  return href === home ? pathname === home : pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Signed-in layout. Access is already checked on the server (proxy.ts and
 * lib/session.ts) before this renders. Page content waits for the browser's
 * local data (cycle log, chats) to load.
 */
export function AppShell({ role, children }: { role: Role; children: ReactNode }) {
  const pathname = usePathname();
  const ready = useHydrated();
  const { fullName: name, avatar } = useAccount();
  const pending = role === "doctor" && pathname === "/doctor/pending";
  const nav = pending ? [] : NAV[role];
  const home = HOME[role];

  return (
    <div className="flex min-h-full flex-1">
      {!pending && (
        <>
          <NotificationPoller />
          <NotificationToasts />
        </>
      )}
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-white/10 bg-gradient-to-b from-[#174f57] via-[#123b52] to-[#0a2342] lg:flex">
        <div className="flex h-16 items-center px-6">
          <Logo href={home} tone="inverse" />
        </div>
        <SidebarNav nav={nav} pathname={pathname} home={home} />
        <div className="space-y-3 border-t border-white/10 p-4">
          <div className="flex items-center justify-between">
            <RegionChip tone="inverse" />
            <ThemeToggle tone="inverse" />
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 p-2.5">
              <Link href={`${home}/profile`} className="flex min-w-0 flex-1 items-center gap-3 rounded-xl transition-opacity hover:opacity-75">
                <Avatar name={name || "You"} src={avatar || undefined} size="sm" hue={role === "patient" ? 330 : 186} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">{name}</p>
                  <p className="text-xs text-white/60 capitalize">{role} profile</p>
                </div>
              </Link>
              <form action={signOutAction}>
                <button
                  type="submit"
                  aria-label="Sign out"
                  title="Sign out"
                  className="rounded-full p-2 text-white/65 hover:bg-white/10 hover:text-white"
                >
                  <LogOut className="size-4" />
                </button>
              </form>
            </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-2 border-b border-border bg-background/85 px-4 backdrop-blur-md lg:hidden">
          <Logo href={home} />
          <div className="flex items-center gap-1">
            <RegionChip className="hidden sm:inline-flex" />
            <ThemeToggle />
            {!pending && <NotificationBell href={`${home}/notifications`} />}
            {!pending && (
              <Link
                href={`${home}/messages`}
                aria-label="Messages"
                className="inline-flex size-10 items-center justify-center rounded-full text-muted-foreground hover:bg-surface-2 hover:text-foreground"
              >
                <MessagesSquare className="size-5" />
              </Link>
            )}
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-6 pb-28 sm:px-6 lg:px-10 lg:pt-10 lg:pb-12">
          {ready ? children : <PortalPageSkeleton role={role} />}
        </main>

        {/* Mobile bottom nav */}
        {nav.length > 0 && <BottomNav nav={nav} pathname={pathname} home={home} />}
      </div>
    </div>
  );
}

/** Desktop sidebar links. Nothing is highlighted while `pathname` is empty. */
function SidebarNav({ nav, pathname, home }: { nav: NavItem[]; pathname: string; home: string }) {
  return (
    <nav className="flex-1 space-y-1 px-3 py-4">
      {nav.map(({ href, label, icon: Icon, excludeActiveWhen }) => {
        const active = isActive(pathname, href, home) && !excludeActiveWhen?.some((path) => pathname.startsWith(path));
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-white/15 text-white shadow-[0_6px_18px_rgb(0_0_0/0.12)]"
                : "text-white/65 hover:bg-white/10 hover:text-white",
            )}
          >
            <Icon className="size-5" />
            {label}
            {pathname && href.endsWith("/notifications") && <UnreadBadge className="ml-auto" />}
          </Link>
        );
      })}
    </nav>
  );
}

/** Mobile bottom bar (items marked `mobile`). */
function BottomNav({ nav, pathname, home }: { nav: NavItem[]; pathname: string; home: string }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden">
      <div className="mx-auto flex max-w-lg justify-around px-2">
        {nav
          .filter((item) => item.mobile)
          .map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href, home);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <span className={cn("rounded-full px-4 py-1 transition-colors", active && "bg-primary-soft")}>
                  <Icon className="size-5" />
                </span>
                {label}
              </Link>
            );
          })}
      </div>
    </nav>
  );
}

/**
 * Shown while the server checks the session. The logo and menu are already in
 * place, so only the profile and page content fill in afterwards.
 */
export function AppShellSkeleton({ role }: { role: Role }) {
  const nav = NAV[role];
  const home = HOME[role];
  return (
    <div className="flex min-h-full flex-1">
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-white/10 bg-gradient-to-b from-[#174f57] via-[#123b52] to-[#0a2342] lg:flex">
        <div className="flex h-16 items-center px-6">
          <Logo href={home} tone="inverse" />
        </div>
        <SidebarNav nav={nav} pathname="" home={home} />
        <div className="space-y-3 border-t border-white/10 p-4">
          <div className="flex items-center justify-between">
            <Skeleton inverse round className="h-7 w-24" />
            <Skeleton inverse round className="size-9" />
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 p-2.5">
            <Skeleton inverse round className="size-9 shrink-0" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton inverse round className="h-3 w-28" />
              <Skeleton inverse round className="h-2.5 w-20" />
            </div>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-2 border-b border-border bg-background/85 px-4 backdrop-blur-md lg:hidden">
          <Logo href={home} />
          <div className="flex items-center gap-2">
            <Skeleton round className="size-9" />
            <Skeleton round className="size-9" />
            <Skeleton round className="size-9" />
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-6 pb-28 sm:px-6 lg:px-10 lg:pt-10 lg:pb-12">
          <PortalPageSkeleton role={role} />
        </main>
        <BottomNav nav={nav} pathname="" home={home} />
      </div>
    </div>
  );
}
