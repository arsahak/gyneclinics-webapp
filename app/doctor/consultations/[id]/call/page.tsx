import type { Metadata } from "next";
import { joinConsultationCallAction } from "@/app/actions/videoAction";
import { PageHeader } from "@/component/shared/page-header";
import { VideoCall } from "@/component/video/video-call";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/doctor/consultations/[id]/call">): Promise<Metadata> {
  const { id } = await params;
  return pageMetadata({
    title: "Video consultation",
    description: "Your private video call with your patient.",
    path: `/doctor/consultations/${id}/call`,
  });
}

// The layout checks the session on the server, so this page is rendered per request.
export const instant = false;

/** The video call of one consultation. The backend checks it's yours and open now. */
export default async function DoctorConsultationCallPage({ params }: PageProps<"/doctor/consultations/[id]/call">) {
  const { id } = await params;
  const reference = decodeURIComponent(id);
  return (
    <>
      <PageHeader
        title="Video consultation"
        description={`Booking ${reference} · only you and your patient can join this call.`}
        backHref="/doctor"
      />
      <VideoCall
        role="doctor"
        kind="consultation"
        join={joinConsultationCallAction.bind(null, reference)}
        title="Join the video consultation"
        intro="Your patient joins from the same consultation. Each call can last up to 60 minutes, and you can join again."
        joinLabel="Join video call"
      />
    </>
  );
}
