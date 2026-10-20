import type { Metadata } from "next";
import { ConversationList } from "@/component/chat/conversation-list";
import { PageHeader } from "@/component/shared/page-header";
import { getPatientThreads } from "@/lib/services/messaging";

export const metadata: Metadata = { title: "Messages" };

// Rendered after the client-side session check in AppShell, so it can't be validated on the server.
export const instant = false;

const STATUS_BADGE = {
  active: { label: "Active", tone: "success" as const },
  waiting: { label: "New", tone: "warning" as const },
  closed: { label: "Closed", tone: "neutral" as const },
};

export default async function DoctorMessagesPage() {
  const threads = await getPatientThreads();
  return (
    <>
      <PageHeader title="Messages" description="Patient conversations. Contact details are automatically blocked in chat." />
      <ConversationList
        me="doctor"
        basePath="/doctor/messages"
        people={threads.map((t) => ({
          id: t.id,
          name: t.patientName,
          hue: t.hue,
          subtitle: `${t.age} yrs · ${t.topic}`,
          badge: STATUS_BADGE[t.status],
        }))}
      />
    </>
  );
}
