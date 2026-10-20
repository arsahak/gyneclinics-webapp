import type { Metadata } from "next";
import { PendingVerification } from "@/component/doctor/pending";

export const metadata: Metadata = { title: "Verification pending" };

// Rendered after the client-side session check in AppShell, so it can't be validated on the server.
export const instant = false;

export default function PendingPage() {
  return <PendingVerification />;
}
