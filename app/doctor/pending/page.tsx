import type { Metadata } from "next";
import { PendingVerification } from "@/component/doctor/pending";

export const metadata: Metadata = { title: "Verification pending" };

// The layout checks the session on the server, so this page is rendered per request.
export const instant = false;

export default function PendingPage() {
  return <PendingVerification />;
}
