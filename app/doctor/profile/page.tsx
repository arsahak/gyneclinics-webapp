import type { Metadata } from "next";
import { getMyDoctorProfile } from "@/app/actions/doctorAction";
import { DoctorProfileView } from "@/component/doctor/doctor-profile";
import { PageHeader } from "@/component/shared/page-header";

export const metadata: Metadata = { title: "Profile & settings" };

// The layout checks the session on the server, so this page is rendered per request.
export const instant = false;

export default async function DoctorProfilePage() {
  const { profile, error } = await getMyDoctorProfile();

  // The view renders its own header, with the Edit button on the right.
  if (profile) return <DoctorProfileView profile={profile} />;

  return (
    <>
      <PageHeader title="Profile & settings" description="Your public profile, registration, fee and account." />
      <p role="alert" className="rounded-2xl bg-danger-soft p-4 text-sm text-danger">
        {error ?? "Couldn't load your profile. Please try again."}
      </p>
    </>
  );
}
