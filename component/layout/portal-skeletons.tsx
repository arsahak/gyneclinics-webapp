"use client";

import { usePathname } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { Skeleton } from "@/component/ui/skeleton";
import type { Role } from "@/lib/types";
import { cn } from "@/lib/utils";

/*
 * Loading screens for the patient and doctor areas. Each one follows the layout
 * of the real page, so content drops into place instead of jumping around.
 */

/**
 * The skeleton for the current page. The pathname of a page with an id in its URL
 * is only known at request time, so the generic skeleton covers that moment.
 */
export function PortalPageSkeleton({ role }: { role: Role }) {
  return (
    <Suspense fallback={<LoadingRegion><GenericSkeleton /></LoadingRegion>}>
      <RouteSkeleton role={role} />
    </Suspense>
  );
}

function RouteSkeleton({ role }: { role: Role }) {
  const pathname = usePathname();
  return <LoadingRegion>{role === "patient" ? patientSkeleton(pathname) : doctorSkeleton(pathname)}</LoadingRegion>;
}

function patientSkeleton(path: string): ReactNode {
  if (path === "/patient") return <PatientHomeSkeleton />;
  if (path === "/patient/calendar") return <CalendarSkeleton />;
  if (path === "/patient/learn/share-story/new") return <FormSkeleton backLink />;
  if (path === "/patient/learn/share-story") return <><HeaderSkeleton eyebrow action /><ArticleGridSkeleton /></>;
  if (path === "/patient/learn/saved") return <><HeaderSkeleton backLink /><ArticleGridSkeleton count={3} /></>;
  if (path === "/patient/learn") return <><HeaderSkeleton eyebrow /><ChipsSkeleton /><ArticleGridSkeleton /></>;
  if (path.startsWith("/patient/learn/")) return <ArticleSkeleton />;
  if (path.startsWith("/patient/insights")) return <InsightsSkeleton />;
  if (path === "/patient/doctors") return <><HeaderSkeleton eyebrow action /><ChipsSkeleton search /><DoctorGridSkeleton /></>;
  if (/^\/patient\/doctors\/[^/]+\/book$/.test(path)) return <FormSkeleton backLink />;
  if (path.startsWith("/patient/doctors/")) return <DoctorProfileSkeleton />;
  if (path === "/patient/consultations") return <><HeaderSkeleton eyebrow action /><ConsultationsSkeleton /></>;
  if (path === "/patient/messages") return <><HeaderSkeleton /><ListSkeleton /></>;
  if (path.startsWith("/patient/messages/")) return <ChatSkeleton />;
  if (path === "/patient/notifications") return <><HeaderSkeleton /><ListSkeleton avatar={false} /></>;
  if (path === "/patient/profile") return <><HeaderSkeleton /><ProfileSkeleton /></>;
  if (path === "/patient/test-call") return <><HeaderSkeleton /><VideoSkeleton /></>;
  return <GenericSkeleton />;
}

function doctorSkeleton(path: string): ReactNode {
  if (path === "/doctor") return <DoctorDashboardSkeleton />;
  if (path === "/doctor/pending") return <PendingSkeleton />;
  if (path === "/doctor/availability") return <AvailabilitySkeleton />;
  if (path === "/doctor/messages") return <><HeaderSkeleton /><ListSkeleton /></>;
  if (path.startsWith("/doctor/messages/")) return <ChatSkeleton />;
  if (path === "/doctor/notifications") return <><HeaderSkeleton /><ListSkeleton avatar={false} /></>;
  if (path === "/doctor/earnings") return <><HeaderSkeleton /><EarningsSkeleton /></>;
  if (path === "/doctor/reviews") return <><HeaderSkeleton /><ReviewsSkeleton /></>;
  if (path === "/doctor/profile") return <><HeaderSkeleton action /><ProfileSkeleton /></>;
  if (path === "/doctor/test-call") return <><HeaderSkeleton /><VideoSkeleton /></>;
  return <GenericSkeleton />;
}

/* ───────── Building blocks ───────── */

function LoadingRegion({ children }: { children: ReactNode }) {
  return (
    <div role="status" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading…</span>
      {children}
    </div>
  );
}

/** A line of text. */
function Line({ className }: { className?: string }) {
  return <Skeleton round className={cn("h-3", className)} />;
}

/** Same frame as the real `Card`. */
function Panel({ className, children }: { className?: string; children?: ReactNode }) {
  return <div className={cn("rounded-3xl border border-border bg-surface shadow-[var(--shadow-soft)]", className)}>{children}</div>;
}

/** Card title and description, as in `CardHeader`. */
function PanelHeader({ action = false }: { action?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 p-5 pb-0 sm:p-6 sm:pb-0">
      <div className="min-w-0 flex-1 space-y-2">
        <Line className="h-4 w-40" />
        <Line className="w-56 max-w-full" />
      </div>
      {action && <Line className="h-4 w-12" />}
    </div>
  );
}

/** Matches `PageHeader`. */
function HeaderSkeleton({ eyebrow = false, action = false, backLink = false }: { eyebrow?: boolean; action?: boolean; backLink?: boolean }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0 flex-1">
        {backLink && <Line className="mb-4 h-3.5 w-14" />}
        {eyebrow && <Line className="mb-2.5 h-3.5 w-24" />}
        <Skeleton className="h-8 w-64 max-w-full rounded-xl sm:h-9 sm:w-80" />
        <Line className="mt-3 h-3.5 w-full max-w-md" />
      </div>
      {action && <Skeleton round className="h-10 w-44" />}
    </div>
  );
}

/** An icon tile, as used on stat and quick-link cards. */
function IconTile({ className }: { className?: string }) {
  return <Skeleton className={cn("size-10 rounded-2xl", className)} />;
}

function StatCard() {
  return (
    <Panel className="p-4 sm:p-5">
      <IconTile />
      <Line className="mt-4 w-24" />
      <Skeleton className="mt-2.5 h-6 w-16 rounded-lg sm:h-7" />
    </Panel>
  );
}

/** Filter chips (and optionally a search box) above a grid. */
function ChipsSkeleton({ search = false }: { search?: boolean }) {
  return (
    <div className="mb-6 space-y-4">
      {search && <Skeleton round className="h-11 w-full max-w-xl" />}
      <div className="flex gap-2 overflow-hidden">
        {["w-16", "w-24", "w-20", "w-28", "w-20", "w-24"].map((w, i) => (
          <Skeleton key={i} round className={cn("h-9 shrink-0", w)} />
        ))}
      </div>
    </div>
  );
}

function ArticleCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-3xl border border-border bg-surface">
      <Skeleton className="h-36 rounded-none" />
      <div className="flex flex-1 flex-col p-4">
        <Skeleton round className="mb-3 h-5 w-20" />
        <Line className="h-4 w-11/12" />
        <Line className="mt-2 h-4 w-2/3" />
        <Line className="mt-3 w-full" />
        <Line className="mt-2 w-4/5" />
        <Line className="mt-5 w-36" />
      </div>
    </div>
  );
}

function ArticleGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }, (_, i) => (
        <ArticleCardSkeleton key={i} />
      ))}
    </div>
  );
}

/** Matches `DoctorCard`: cover, round photo over its edge, then details. */
function DoctorCardSkeleton({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-3xl border border-border bg-surface">
      <div className="relative h-28 bg-gradient-to-br from-primary-soft to-secondary-soft">
        <span className="absolute bottom-0 left-1/2 size-[5.5rem] -translate-x-1/2 translate-y-1/2 rounded-full bg-surface ring-4 ring-surface">
          <Skeleton round className="size-full" />
        </span>
      </div>
      <div className="flex flex-1 flex-col items-center px-5 pt-14 pb-5">
        <Line className="h-4 w-40" />
        <Line className="mt-2.5 w-32" />
        <Line className="mt-3 w-44" />
        {!compact && (
          <div className="mt-4 flex gap-1.5">
            <Skeleton round className="h-6 w-20" />
            <Skeleton round className="h-6 w-16" />
            <Skeleton round className="h-6 w-24" />
          </div>
        )}
        <div className="mt-5 flex w-full items-center justify-between border-t border-border pt-4">
          <Line className="w-24" />
          <Line className="w-28" />
        </div>
      </div>
    </div>
  );
}

function DoctorGridSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }, (_, i) => (
        <DoctorCardSkeleton key={i} />
      ))}
    </div>
  );
}

/** Conversation or notification rows, as in `ConversationList` / `NotificationInbox`. */
function ListSkeleton({ rows = 6, avatar = true }: { rows?: number; avatar?: boolean }) {
  return (
    <div className="divide-y divide-border overflow-hidden rounded-3xl border border-border bg-surface">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-3 p-4">
          {avatar ? <Skeleton round className="size-11 shrink-0" /> : <IconTile className="shrink-0" />}
          <div className="min-w-0 flex-1 space-y-2">
            <Line className={cn("h-3.5", i % 2 ? "w-32" : "w-44")} />
            <Line className={i % 3 === 0 ? "w-3/4" : "w-1/2"} />
          </div>
          <Line className="w-10 shrink-0" />
        </div>
      ))}
    </div>
  );
}

/** Label-and-input rows inside a card. */
function FieldRows({ rows }: { rows: number }) {
  return (
    <div className="space-y-5">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="space-y-2">
          <Line className="h-3.5 w-28" />
          <Skeleton className="h-11 w-full rounded-2xl" />
        </div>
      ))}
    </div>
  );
}

/* ───────── Patient pages ───────── */

/** Matches the patient home: greeting, cycle card, quick links, side cards, reading and doctors. */
function PatientHomeSkeleton() {
  return (
    <>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <Line className="h-3.5 w-36" />
          <Skeleton className="mt-3 h-9 w-64 rounded-xl sm:w-80" />
        </div>
        <Skeleton round className="mt-1 size-10 shrink-0" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <div className="min-w-0 space-y-6">
          <Panel className="overflow-hidden">
            <div className="grid gap-6 p-5 sm:p-8 md:grid-cols-[auto_1fr] md:items-center md:gap-10">
              {/* Cycle ring */}
              <div className="relative mx-auto size-52 sm:size-56">
                <Skeleton round className="size-full" />
                <div className="absolute inset-4 flex flex-col items-center justify-center gap-2.5 rounded-full bg-surface">
                  <Line className="w-16" />
                  <Skeleton className="h-12 w-14 rounded-xl" />
                  <Skeleton round className="h-5 w-24" />
                </div>
              </div>
              <div>
                <Skeleton className="h-8 w-56 rounded-xl sm:h-9" />
                <Line className="mt-3 h-3.5 w-64 max-w-full" />
                <Line className="mt-5 w-full" />
                <Line className="mt-2 w-4/5" />
                <div className="mt-6 grid grid-cols-3 gap-3">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="rounded-2xl bg-surface-2/60 p-3">
                      <Skeleton round className="size-4" />
                      <Line className="mt-3 w-14" />
                      <Line className="mt-2 h-3.5 w-16" />
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Skeleton round className="h-10 w-32" />
                  <Skeleton round className="h-10 w-36" />
                </div>
              </div>
            </div>
            <div className="border-t border-border bg-surface-2/50 px-5 py-3.5 sm:px-8">
              <Line className="w-full max-w-lg" />
            </div>
          </Panel>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="rounded-3xl border border-border bg-surface p-4">
                <IconTile />
                <Line className="mt-4 h-3.5 w-20" />
                <Line className="mt-2 w-full" />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {[0, 1].map((i) => (
            <Panel key={i} className="p-5">
              <div className="flex items-start gap-3">
                <IconTile className="shrink-0" />
                <div className="min-w-0 flex-1 space-y-2.5">
                  <Line className="h-3.5 w-28" />
                  <Line className="w-full" />
                  <Line className="w-2/3" />
                </div>
              </div>
            </Panel>
          ))}
          <Skeleton className="h-40 rounded-3xl" />
        </div>
      </div>

      <SectionSkeleton>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <ArticleCardSkeleton key={i} />
          ))}
        </div>
      </SectionSkeleton>

      <SectionSkeleton>
        <div className="grid gap-4 md:grid-cols-2">
          <DoctorCardSkeleton compact />
          <DoctorCardSkeleton compact />
        </div>
      </SectionSkeleton>
    </>
  );
}

function SectionSkeleton({ children }: { children: ReactNode }) {
  return (
    <section className="mt-10">
      <div className="mb-4 flex items-center justify-between">
        <Skeleton className="h-6 w-48 rounded-lg" />
        <Line className="h-3.5 w-16" />
      </div>
      {children}
    </section>
  );
}

function CalendarSkeleton() {
  return (
    <>
      <HeaderSkeleton eyebrow />
      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <Panel className="p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between">
            <Skeleton round className="size-9" />
            <Skeleton className="h-6 w-36 rounded-lg" />
            <Skeleton round className="size-9" />
          </div>
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {Array.from({ length: 7 }, (_, i) => (
              <Line key={`d${i}`} className="mx-auto mb-1 w-6" />
            ))}
            {Array.from({ length: 35 }, (_, i) => (
              <Skeleton key={i} className="aspect-square rounded-xl sm:rounded-2xl" />
            ))}
          </div>
        </Panel>
        <div className="space-y-6">
          <Panel className="space-y-3 p-5">
            <Line className="h-4 w-32" />
            <Line className="w-full" />
            <Line className="w-3/4" />
            <Skeleton round className="mt-2 h-10 w-full" />
          </Panel>
          <Panel className="space-y-3 p-5">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton round className="size-3" />
                <Line className="w-32" />
              </div>
            ))}
          </Panel>
        </div>
      </div>
    </>
  );
}

function InsightsSkeleton() {
  return (
    <>
      <HeaderSkeleton eyebrow />
      <div className="mb-6 flex gap-2 overflow-hidden">
        {["w-24", "w-20", "w-28"].map((w, i) => (
          <Skeleton key={i} round className={cn("h-10 shrink-0", w)} />
        ))}
      </div>
      <Skeleton className="mb-6 h-12 rounded-2xl" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <StatCard key={i} />
        ))}
      </div>
      <Panel className="mt-6 p-5 sm:p-6">
        <Line className="h-4 w-40" />
        <Line className="mt-2 w-56" />
        <div className="mt-6 flex h-56 items-end gap-2 sm:gap-3">
          {[45, 70, 55, 85, 60, 75, 50, 90, 65, 80, 58, 72].map((h, i) => (
            <Skeleton key={i} className="flex-1 rounded-t-xl rounded-b-md" style={{ height: `${h}%` }} />
          ))}
        </div>
      </Panel>
    </>
  );
}

function ArticleSkeleton() {
  return (
    <div className="mx-auto max-w-3xl">
      <Line className="mb-5 h-3.5 w-14" />
      <Skeleton className="h-56 rounded-3xl sm:h-72" />
      <Skeleton round className="mt-6 h-6 w-24" />
      <Skeleton className="mt-4 h-9 w-full rounded-xl" />
      <Skeleton className="mt-2 h-9 w-2/3 rounded-xl" />
      <div className="mt-5 flex items-center gap-3">
        <Skeleton round className="size-10" />
        <div className="space-y-2">
          <Line className="h-3.5 w-32" />
          <Line className="w-24" />
        </div>
      </div>
      <div className="mt-8 space-y-3">
        {["w-full", "w-full", "w-11/12", "w-full", "w-4/5", "w-full", "w-full", "w-2/3"].map((w, i) => (
          <Line key={i} className={cn("h-3.5", w)} />
        ))}
      </div>
    </div>
  );
}

function DoctorProfileSkeleton() {
  return (
    <>
      <Line className="mb-5 h-3.5 w-14" />
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0 space-y-6">
          <Panel className="overflow-hidden">
            <div className="h-32 bg-gradient-to-br from-primary-soft to-secondary-soft sm:h-40" />
            <div className="px-5 pb-6 sm:px-8">
              <div className="-mt-12 size-24 rounded-full bg-surface ring-4 ring-surface">
                <Skeleton round className="size-full" />
              </div>
              <Skeleton className="mt-4 h-8 w-60 rounded-xl" />
              <Line className="mt-3 h-3.5 w-48" />
              <div className="mt-4 flex flex-wrap gap-2">
                <Skeleton round className="h-6 w-24" />
                <Skeleton round className="h-6 w-28" />
                <Skeleton round className="h-6 w-20" />
              </div>
            </div>
          </Panel>
          <Panel className="space-y-3 p-5 sm:p-6">
            <Line className="h-4 w-32" />
            <Line className="w-full" />
            <Line className="w-full" />
            <Line className="w-3/4" />
          </Panel>
          <Panel className="p-5 sm:p-6">
            <Line className="h-4 w-28" />
            <div className="mt-4 space-y-4">
              {[0, 1].map((i) => (
                <div key={i} className="space-y-2">
                  <Line className="w-24" />
                  <Line className="w-full" />
                  <Line className="w-2/3" />
                </div>
              ))}
            </div>
          </Panel>
        </div>
        <Panel className="self-start p-5 sm:p-6">
          <Line className="h-4 w-36" />
          <Skeleton className="mt-4 h-8 w-28 rounded-lg" />
          <div className="mt-5 space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex justify-between">
                <Line className="w-24" />
                <Line className="w-16" />
              </div>
            ))}
          </div>
          <Skeleton round className="mt-6 h-11 w-full" />
        </Panel>
      </div>
    </>
  );
}

function ConsultationsSkeleton() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {[0, 1, 2, 3].map((i) => (
        <Panel key={i} className="p-5">
          <div className="flex items-center gap-3">
            <Skeleton round className="size-11 shrink-0" />
            <div className="min-w-0 flex-1 space-y-2">
              <Line className="h-3.5 w-36" />
              <Line className="w-24" />
            </div>
            <Skeleton round className="h-6 w-20" />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[0, 1, 2].map((j) => (
              <Skeleton key={j} className="h-14 rounded-2xl" />
            ))}
          </div>
        </Panel>
      ))}
    </div>
  );
}

/** Matches `ChatThread`: header, messages from both sides and the composer. */
function ChatSkeleton() {
  const bubbles = [
    { mine: false, w: "w-56" },
    { mine: false, w: "w-40" },
    { mine: true, w: "w-64" },
    { mine: false, w: "w-72" },
    { mine: true, w: "w-44" },
    { mine: true, w: "w-52" },
  ];
  return (
    <div className="-mx-4 -mt-6 flex h-[calc(100dvh-7.5rem)] flex-col bg-surface sm:mx-0 sm:mt-0 sm:h-[calc(100dvh-10rem)] sm:overflow-hidden sm:rounded-3xl sm:border sm:border-border lg:h-[calc(100dvh-5rem)]">
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <Skeleton round className="size-10 shrink-0" />
        <div className="flex-1 space-y-2">
          <Line className="h-3.5 w-36" />
          <Line className="w-24" />
        </div>
        <Skeleton round className="size-9" />
      </div>
      <div className="flex-1 space-y-3 overflow-hidden bg-background/60 px-4 py-5">
        <Line className="mx-auto mb-2 w-24" />
        {bubbles.map(({ mine, w }, i) => (
          <div key={i} className={cn("flex", mine && "justify-end")}>
            <Skeleton className={cn("h-11 max-w-[75%]", w, mine ? "rounded-3xl rounded-br-lg" : "rounded-3xl rounded-bl-lg")} />
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 border-t border-border p-3">
        <Skeleton round className="h-11 flex-1" />
        <Skeleton round className="size-11 shrink-0" />
      </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
      <Panel className="self-start p-6">
        <div className="flex flex-col items-center">
          <Skeleton round className="size-24" />
          <Line className="mt-4 h-4 w-36" />
          <Line className="mt-2.5 w-28" />
          <Skeleton round className="mt-5 h-9 w-32" />
        </div>
      </Panel>
      <div className="min-w-0 space-y-6">
        <Panel>
          <PanelHeader />
          <div className="p-5 sm:p-6">
            <FieldRows rows={3} />
          </div>
        </Panel>
        <Panel>
          <PanelHeader />
          <div className="space-y-4 p-5 sm:p-6">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <Line className="h-3.5 w-40" />
                  <Line className="w-56 max-w-full" />
                </div>
                <Skeleton round className="h-6 w-11" />
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

function FormSkeleton({ backLink = false }: { backLink?: boolean }) {
  return (
    <>
      <HeaderSkeleton backLink={backLink} />
      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <Panel className="p-5 sm:p-6">
          <FieldRows rows={3} />
          <Skeleton className="mt-5 h-32 rounded-2xl" />
          <Skeleton round className="mt-6 h-11 w-40" />
        </Panel>
        <Panel className="self-start space-y-3 p-5 sm:p-6">
          <Line className="h-4 w-32" />
          <Line className="w-full" />
          <Line className="w-2/3" />
        </Panel>
      </div>
    </>
  );
}

function VideoSkeleton() {
  return (
    <Panel className="overflow-hidden">
      <Skeleton className="aspect-video max-h-[60vh] w-full rounded-none" />
      <div className="flex items-center justify-center gap-3 p-4">
        <Skeleton round className="size-12" />
        <Skeleton round className="size-12" />
        <Skeleton round className="h-12 w-32" />
      </div>
    </Panel>
  );
}

/* ───────── Doctor pages ───────── */

/** Matches the doctor dashboard: welcome banner, stats, waiting chats and side cards. */
function DoctorDashboardSkeleton() {
  return (
    <>
      <section className="relative mb-6 overflow-hidden rounded-[2rem] border border-primary/15 bg-gradient-to-br from-primary-soft via-surface to-secondary-soft/70 p-5 shadow-[var(--shadow-soft)] sm:p-7">
        <div aria-hidden className="absolute -top-20 -right-12 size-48 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Line className="h-3.5 w-36" />
            <Skeleton className="mt-3 h-9 w-64 rounded-xl sm:h-10 sm:w-80" />
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Skeleton round className="h-6 w-36" />
              <Line className="h-3.5 w-48" />
            </div>
          </div>
          <div className="flex w-full items-center gap-3 lg:w-auto">
            <Skeleton className="size-11 shrink-0 rounded-2xl" />
            <div className="flex w-full items-center justify-between gap-4 rounded-2xl border border-white/80 bg-surface/80 p-4 shadow-[var(--shadow-soft)] sm:w-80 dark:border-border">
              <div className="flex-1 space-y-2">
                <Line className="h-3.5 w-28" />
                <Line className="w-40" />
              </div>
              <Skeleton round className="h-6 w-11 shrink-0" />
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <StatCard key={i} />
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(21rem,0.85fr)]">
        <Panel className="self-start">
          <PanelHeader action />
          <ul className="space-y-2 p-5 sm:p-6">
            {[0, 1, 2, 3].map((i) => (
              <li key={i} className="flex items-center gap-3 p-3">
                <Skeleton round className="size-9 shrink-0" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Line className="h-3.5 w-32" />
                  <Line className={i % 2 ? "w-1/2" : "w-3/4"} />
                </div>
                <Line className="w-10 shrink-0" />
              </li>
            ))}
          </ul>
        </Panel>

        <div className="space-y-6">
          <Panel>
            <PanelHeader />
            <ul className="space-y-3 p-5 sm:p-6">
              {[0, 1, 2].map((i) => (
                <li key={i} className="flex items-center gap-3">
                  <Skeleton className="size-10 shrink-0 rounded-xl" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <Line className="h-3.5 w-36" />
                    <Line className="w-24" />
                  </div>
                  <Skeleton round className="h-6 w-16" />
                </li>
              ))}
            </ul>
          </Panel>
          <Panel>
            <PanelHeader />
            <div className="space-y-3 p-5 sm:p-6">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex justify-between">
                  <Line className="w-24" />
                  <Line className="w-14" />
                </div>
              ))}
            </div>
          </Panel>
          <Panel>
            <PanelHeader action />
            <div className="space-y-2.5 p-5 sm:p-6">
              <Line className="h-3.5 w-24" />
              <Line className="w-full" />
              <Line className="w-3/4" />
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}

function AvailabilitySkeleton() {
  return (
    <>
      <HeaderSkeleton action />
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="min-w-0 space-y-6">
          <Panel>
            <PanelHeader />
            <div className="p-5 sm:p-6">
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
                {Array.from({ length: 7 }, (_, i) => (
                  <Skeleton key={i} className="h-12 rounded-2xl" />
                ))}
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <Skeleton className="h-11 rounded-2xl" />
                <Skeleton className="h-11 rounded-2xl" />
              </div>
            </div>
          </Panel>
          <Panel>
            <PanelHeader />
            <div className="p-5 sm:p-6">
              <FieldRows rows={2} />
            </div>
          </Panel>
        </div>
        <Panel className="self-start space-y-3 p-5 sm:p-6">
          <Line className="h-4 w-32" />
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="flex justify-between">
              <Line className="w-20" />
              <Line className="w-24" />
            </div>
          ))}
        </Panel>
      </div>
    </>
  );
}

function EarningsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <StatCard key={i} />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        {[0, 1].map((i) => (
          <Panel key={i}>
            <PanelHeader />
            <div className="space-y-4 p-5 sm:p-6">
              {[0, 1, 2, 3].map((j) => (
                <div key={j} className="flex items-center justify-between gap-4">
                  <div className="space-y-2">
                    <Line className="h-3.5 w-36" />
                    <Line className="w-20" />
                  </div>
                  <Line className="h-3.5 w-16" />
                </div>
              ))}
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}

function ReviewsSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <Panel className="self-start p-5 sm:p-6">
        <Skeleton className="h-12 w-20 rounded-xl" />
        <Line className="mt-3 h-4 w-28" />
        <Line className="mt-2 w-24" />
        <div className="mt-5 space-y-2.5">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <Line className="w-6" />
              <Skeleton round className="h-2 flex-1" />
            </div>
          ))}
        </div>
      </Panel>
      <div className="space-y-4">
        {[0, 1, 2, 3].map((i) => (
          <Panel key={i} className="space-y-2.5 p-5">
            <div className="flex items-center justify-between">
              <Line className="h-3.5 w-24" />
              <Line className="w-16" />
            </div>
            <Line className="w-full" />
            <Line className={i % 2 ? "w-1/2" : "w-4/5"} />
          </Panel>
        ))}
      </div>
    </div>
  );
}

function PendingSkeleton() {
  return (
    <Panel className="mx-auto mt-6 max-w-xl p-6 text-center sm:p-10">
      <Skeleton className="mx-auto size-16 rounded-3xl" />
      <Skeleton className="mx-auto mt-6 h-8 w-64 rounded-xl" />
      <Line className="mx-auto mt-4 w-full max-w-sm" />
      <Line className="mx-auto mt-2 w-3/4 max-w-xs" />
      <Skeleton round className="mx-auto mt-8 h-11 w-40" />
    </Panel>
  );
}

/* ───────── Fallback ───────── */

function GenericSkeleton() {
  return (
    <>
      <HeaderSkeleton />
      <Panel className="space-y-3 p-5 sm:p-6">
        <Line className="h-4 w-40" />
        <Line className="w-full" />
        <Line className="w-5/6" />
        <Line className="w-2/3" />
      </Panel>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {[0, 1].map((i) => (
          <Panel key={i} className="p-5">
            <IconTile />
            <Line className="mt-4 h-3.5 w-32" />
            <Line className="mt-2 w-full" />
          </Panel>
        ))}
      </div>
    </>
  );
}
