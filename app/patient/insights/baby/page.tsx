import type { Metadata } from "next";
import { BabyInsights } from "@/component/insights/baby-insights";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Baby growth",
  description: "Track your baby's growth from your scan reports, week by week.",
  path: "/patient/insights/baby",
});

// The layout checks the session on the server, so this page is rendered per request.
export const instant = false;

export default function BabyGrowthPage() {
  return <BabyInsights />;
}
