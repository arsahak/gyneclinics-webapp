import type { Metadata } from "next";
import { CycleInsights } from "@/component/insights/cycle-insights";

export const metadata: Metadata = { title: "Cycle insights" };

// The layout checks the session on the server, so this page is rendered per request.
export const instant = false;

export default function InsightsPage() {
  return <CycleInsights />;
}
