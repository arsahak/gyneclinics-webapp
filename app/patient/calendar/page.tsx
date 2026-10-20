import type { Metadata } from "next";
import { CycleCalendarView } from "@/component/home/cycle-calendar";
import { PageHeader } from "@/component/shared/page-header";

export const metadata: Metadata = { title: "Cycle calendar" };

// Rendered after the client-side session check in AppShell, so it can't be validated on the server.
export const instant = false;

export default function CalendarPage() {
  return (
    <>
      <PageHeader
        eyebrow="Period tracker"
        title="Your cycle calendar"
        description="Tap a day to see details or log a period. Everything updates as soon as you save."
      />
      <CycleCalendarView />
    </>
  );
}
