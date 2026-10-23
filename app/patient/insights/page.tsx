import type { Metadata } from "next";
import { CycleInsights } from "@/component/insights/cycle-insights";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Cycle insights",
  description: "Trends in your cycle length, period length and fertile window over time.",
  path: "/patient/insights",
});

// The layout checks the session on the server, so this page is rendered per request.
export const instant = false;

export default function InsightsPage() {
  return <CycleInsights />;
}
