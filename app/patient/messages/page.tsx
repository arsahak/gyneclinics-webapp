import type { Metadata } from "next";
import { PatientConversations } from "@/component/chat/patient-conversations";
import { PageHeader } from "@/component/shared/page-header";
import { getDoctors } from "@/lib/services/doctors";

export const metadata: Metadata = { title: "Messages" };

// The layout checks the session on the server, so this page is rendered per request.
export const instant = false;

export default async function PatientMessagesPage() {
  const doctors = await getDoctors();
  return (
    <>
      <PageHeader title="Messages" description="Your private conversations with specialists. Chats open when a consultation starts." />
      <PatientConversations doctors={doctors} />
    </>
  );
}
