import type { Metadata } from "next";
import { PendingVerification } from "@/component/doctor/pending";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Verification pending",
  description: "Your doctor profile is being checked by the GyneX team.",
  path: "/doctor/pending",
});

// The layout checks the session on the server, so this page is rendered per request.
export const instant = false;

export default function PendingPage() {
  return <PendingVerification />;
}
