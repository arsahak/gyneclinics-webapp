import type { Metadata } from "next";
import { WeightInsights } from "@/component/insights/weight-insights";

export const metadata: Metadata = { title: "Weight" };

// The layout checks the session on the server, so this page is rendered per request.
export const instant = false;

export default function WeightPage() {
  return <WeightInsights />;
}
