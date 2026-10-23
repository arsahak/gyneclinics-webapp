import type { Metadata } from "next";
import { WeightInsights } from "@/component/insights/weight-insights";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Weight",
  description: "Log your weight and see how it changes over time.",
  path: "/patient/insights/weight",
});

// The layout checks the session on the server, so this page is rendered per request.
export const instant = false;

export default function WeightPage() {
  return <WeightInsights />;
}
