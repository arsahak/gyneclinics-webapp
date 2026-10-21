import type { Metadata } from "next";
import { CycleCalendarView } from "@/component/home/cycle-calendar";
import { PageHeader } from "@/component/shared/page-header";

export const metadata: Metadata = { title: "Cycle calendar" };

// The layout checks the session on the server, so this page is rendered per request.
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
