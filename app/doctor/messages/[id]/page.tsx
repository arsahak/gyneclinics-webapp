import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChatThread } from "@/component/chat/chat-thread";
import { hueFor } from "@/lib/chat";
import { getDoctorChat } from "@/lib/services/chats";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/doctor/messages/[id]">): Promise<Metadata> {
  const { id } = await params;
  const chat = await getDoctorChat(id);
  if (!chat) return { title: "Chat" };
  return pageMetadata({
    title: `Chat with ${chat.patient.name}`,
    description: `Your private conversation with ${chat.patient.name}.`,
    path: `/doctor/messages/${id}`,
  });
}

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
