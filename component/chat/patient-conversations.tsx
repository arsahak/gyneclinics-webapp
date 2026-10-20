"use client";

import { STATE_LABEL, timeline } from "@/lib/consultation";
import { useNow } from "@/lib/hooks";
import { useConsultations } from "@/lib/store/consultations";
import type { Doctor } from "@/lib/types";
import { ConversationList } from "./conversation-list";

/** Patient inbox: one thread per doctor, badged with the latest consultation's state. */
export function PatientConversations({ doctors }: { doctors: Doctor[] }) {
  const now = useNow();
  const consultations = useConsultations((s) => s.consultations);

  const people = doctors.map((d) => {
    const latest = consultations
      .filter((c) => c.doctorId === d.id)
      .sort((a, b) => b.startsAt.localeCompare(a.startsAt))[0];
    const state = latest ? timeline(latest, now).state : null;
    return {
      id: d.id,
      name: d.name,
      hue: d.hue,
      subtitle: d.title,
      badge: state ? STATE_LABEL[state] : undefined,
    };
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
