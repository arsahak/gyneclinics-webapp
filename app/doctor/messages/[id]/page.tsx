import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChatThread } from "@/component/chat/chat-thread";
import { getPatientThread, listThreadIds } from "@/lib/services/messaging";

export function generateStaticParams() {
  return listThreadIds().map((id) => ({ id }));
}

export const metadata: Metadata = { title: "Chat" };

// The layout checks the session on the server, so this page is rendered per request.
export const instant = false;

export default async function DoctorChatPage({ params }: PageProps<"/doctor/messages/[id]">) {
  const thread = await getPatientThread((await params).id);
  if (!thread) notFound();
  return (
    <ChatThread
      conversationId={thread.id}
      me="doctor"
      backHref="/doctor/messages"
      readOnly={thread.status === "closed"}
      counterpart={{ name: thread.patientName, hue: thread.hue, subtitle: `${thread.age} yrs · ${thread.topic}` }}
    />
  );
}
