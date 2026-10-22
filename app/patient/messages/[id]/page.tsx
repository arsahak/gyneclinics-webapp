import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PatientChat } from "@/component/chat/patient-chat";
import { getPatientChat } from "@/lib/services/chats";
import { getDoctor } from "@/lib/services/doctors";

export const metadata: Metadata = { title: "Chat" };

// The layout checks the session on the server, so this page is rendered per request.
export const instant = false;

export default async function PatientChatPage({ params }: PageProps<"/patient/messages/[id]">) {
  const { id } = await params;
  const [doctor, chat] = await Promise.all([getDoctor(id), getPatientChat(id)]);
  if (!doctor) notFound();
  return <PatientChat doctor={doctor} chat={chat} />;
}
