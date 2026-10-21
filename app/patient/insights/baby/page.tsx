import type { Metadata } from "next";
import { BabyInsights } from "@/component/insights/baby-insights";

export const metadata: Metadata = { title: "Baby growth" };

// The layout checks the session on the server, so this page is rendered per request.
export const instant = false;

export default function BabyGrowthPage() {
  return <BabyInsights />;
}
