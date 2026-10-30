import type { Metadata } from "next";
import { joinTestCallAction } from "@/app/actions/videoAction";
import { PageHeader } from "@/component/shared/page-header";
import { VideoCall } from "@/component/video/video-call";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Camera check",
  description: "Check your camera, microphone and connection before a video consultation.",
  path: "/doctor/test-call",
});

// The layout checks the session on the server, so this page is rendered per request.
export const instant = false;

export default function DoctorTestCallPage() {
  return (
    <>
      <PageHeader
        title="Camera and microphone check"
        description="A private check before your video consultations. Only you are in this call."
      />
      <VideoCall
        role="doctor"
        kind="check"
        join={joinTestCallAction}
        title="Check your camera and mic"
        intro="See yourself as your patients will, and speak to watch the microphone meter move. Nobody else can join."
        joinLabel="Start check"
      />
    </>
  );
}
