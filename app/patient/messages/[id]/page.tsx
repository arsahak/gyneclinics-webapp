import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PatientChat } from "@/component/chat/patient-chat";
import { getDoctor, listDoctorIds } from "@/lib/services/doctors";

export function generateStaticParams() {
  return listDoctorIds().map((id) => ({ id }));
}

export const metadata: Metadata = { title: "Chat" };

// Rendered after the client-side session check in AppShell, so it can't be validated on the server.
export const instant = false;

export default async function PatientChatPage({ params }: PageProps<"/patient/messages/[id]">) {
  const doctor = await getDoctor((await params).id);
  if (!doctor) notFound();
  return <PatientChat doctor={doctor} />;
}
