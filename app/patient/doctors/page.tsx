import type { Metadata } from "next";
import { DoctorBrowser } from "@/component/doctors/doctor-browser";
import { PageHeader } from "@/component/shared/page-header";
import { FeeRegionChip } from "@/component/shared/region";
import { getDoctors } from "@/lib/services/doctors";

export const metadata: Metadata = { title: "Find a specialist" };

// Rendered after the client-side session check in AppShell, so it can't be validated on the server.
export const instant = false;

export default async function DoctorsPage() {
  const doctors = await getDoctors();
  return (
    <>
      <PageHeader
        eyebrow="Get help"
        title="Find a specialist"
        description="Every doctor is a verified gynaecology specialist. Chat privately inside GyneClinics."
        action={<FeeRegionChip />}
      />
      <DoctorBrowser doctors={doctors} />
    </>
  );
}
