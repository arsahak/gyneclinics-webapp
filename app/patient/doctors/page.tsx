import type { Metadata } from "next";
import { DoctorBrowser } from "@/component/doctors/doctor-browser";
import { PageHeader } from "@/component/shared/page-header";
import { FeeRegionChip } from "@/component/shared/region";
import { getDoctors } from "@/lib/services/doctors";

export const metadata: Metadata = { title: "Find a specialist" };

// The layout checks the session on the server, so this page is rendered per request.
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
