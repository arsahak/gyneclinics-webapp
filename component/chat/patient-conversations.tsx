"use client";

import { STATE_LABEL, timeline } from "@/lib/consultation";
import type { ChatSummary } from "@/lib/chat";
import { useNow } from "@/lib/hooks";
import { useConsultations } from "@/lib/store/consultations";
import { ConversationList } from "./conversation-list";

/** Patient inbox: one thread per doctor, badged with the latest consultation's state. */
export function PatientConversations({ chats }: { chats: ChatSummary[] }) {
  const now = useNow();
  const consultations = useConsultations((s) => s.consultations);

  const people = chats.map((chat) => {
    const latest = consultations
      .filter((c) => c.doctorId === chat.id)
      .sort((a, b) => b.startsAt.localeCompare(a.startsAt))[0];
    const state = latest ? timeline(latest, now).state : null;
    return { ...chat, badge: state ? STATE_LABEL[state] : undefined };
  });

  return (
    <ConversationList
      me="patient"
      basePath="/patient/messages"
      emptyAction={{ href: "/patient/doctors", label: "Find a specialist" }}
      people={people}
    />
  );
}
