import type { Metadata } from "next";
import { PageHeader } from "@/component/shared/page-header";
import { TestVideoCall } from "@/component/video/test-video-call";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Test call",
  description: "Check your camera, microphone and connection before a video consultation.",
  path: "/patient/test-call",
});

// The layout checks the session on the server, so this page is rendered per request.
export const instant = false;

export default function PatientTestCallPage() {
  return (
    <>
      <PageHeader
        title="Test video call"
        description="Try a video call between a doctor and a patient. Up to 30 minutes."
      />
      <TestVideoCall role="patient" />
    </>
  );
}
