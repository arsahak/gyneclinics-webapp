import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PatientChat } from "@/component/chat/patient-chat";
import { getPatientChat } from "@/lib/services/chats";
import { getDoctor } from "@/lib/services/doctors";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/patient/messages/[id]">): Promise<Metadata> {
  const doctor = await getDoctor((await params).id);
  if (!doctor) return { title: "Chat" };
  return pageMetadata({
    title: `Chat with ${doctor.name}`,
    description: `Your private conversation with ${doctor.name}, ${doctor.title}.`,
    path: `/patient/messages/${doctor.id}`,
  });
}

// The layout checks the session on the server, so this page is rendered per request.
export const instant = false;

export default async function PatientChatPage({ params }: PageProps<"/patient/messages/[id]">) {
  const { id } = await params;
  const [doctor, chat] = await Promise.all([getDoctor(id), getPatientChat(id)]);
  if (!doctor) notFound();
  return <PatientChat doctor={doctor} chat={chat} />;
}
