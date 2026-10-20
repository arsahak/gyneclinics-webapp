import type { Metadata } from "next";
import { BabyInsights } from "@/component/insights/baby-insights";

export const metadata: Metadata = { title: "Baby growth" };

// Rendered after the client-side session check in AppShell, so it can't be validated on the server.
export const instant = false;

export default function BabyGrowthPage() {
  return <BabyInsights />;
}
