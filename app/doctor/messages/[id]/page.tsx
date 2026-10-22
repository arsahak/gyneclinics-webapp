import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChatThread } from "@/component/chat/chat-thread";
import { hueFor } from "@/lib/chat";
import { getDoctorChat } from "@/lib/services/chats";

export const metadata: Metadata = { title: "Chat" };

// The layout checks the session on the server, so this page is rendered per request.
export const instant = false;

export default async function DoctorChatPage({ params }: PageProps<"/doctor/messages/[id]">) {
  const chat = await getDoctorChat((await params).id);
  if (!chat) notFound();
  return (
    <ChatThread
      to={{ chatId: chat.chatId }}
      initialMessages={chat.messages}
      me="doctor"
      backHref="/doctor/messages"
      counterpart={{ name: chat.patient.name, avatar: chat.patient.avatar, hue: hueFor(chat.patient.id), subtitle: "Patient" }}
    />
  );
}
