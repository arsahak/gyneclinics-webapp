import type { Metadata } from "next";
import { CycleInsights } from "@/component/insights/cycle-insights";

export const metadata: Metadata = { title: "Cycle insights" };

// Rendered after the client-side session check in AppShell, so it can't be validated on the server.
export const instant = false;

export default function InsightsPage() {
  return <CycleInsights />;
}
