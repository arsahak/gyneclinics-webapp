import type { Metadata } from "next";
import { WeightInsights } from "@/component/insights/weight-insights";

export const metadata: Metadata = { title: "Weight" };

// Rendered after the client-side session check in AppShell, so it can't be validated on the server.
export const instant = false;

export default function WeightPage() {
  return <WeightInsights />;
}
