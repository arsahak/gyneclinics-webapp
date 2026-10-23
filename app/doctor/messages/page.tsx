import type { Metadata } from "next";
import { ConversationList } from "@/component/chat/conversation-list";
import { PageHeader } from "@/component/shared/page-header";
import { getMyChats } from "@/lib/services/chats";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Messages",
  description: "Your private conversations with patients.",
  path: "/doctor/messages",
});

// The layout checks the session on the server, so this page is rendered per request.
export const instant = false;

export default async function DoctorMessagesPage() {
  const chats = await getMyChats("doctor");
  return (
    <>
      <PageHeader title="Messages" description="Patient conversations. Contact details are automatically blocked in chat." />
      <ConversationList
        me="doctor"
        basePath="/doctor/messages"
        people={chats.map((c) => ({ ...c, badge: c.lastFrom === "patient" ? { label: "Waiting for you", tone: "warning" as const } : undefined }))}
      />
    </>
  );
}
