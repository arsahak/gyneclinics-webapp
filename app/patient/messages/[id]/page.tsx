import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PatientChat } from "@/component/chat/patient-chat";
import { getDoctor } from "@/lib/services/doctors";

export const metadata: Metadata = { title: "Chat" };

// The layout checks the session on the server, so this page is rendered per request.
export const instant = false;

export default async function PatientChatPage({ params }: PageProps<"/patient/messages/[id]">) {
  const doctor = await getDoctor((await params).id);
  if (!doctor) notFound();
  return <PatientChat doctor={doctor} />;
}
