import "server-only";
import { api } from "@/lib/api";
import { type BackendMessage, type ChatSummary, hueFor, toMessage } from "@/lib/chat";
import type { Message, Role } from "@/lib/types";

// Patient–doctor chat from the backend (/chats). Server only — runs with the
// signed-in user's token.

interface BackendChat {
  _id: string;
  patient?: { _id: string; fullName?: string; avatar?: string } | null;
  doctor?: { _id: string; title?: string; specialization?: string; user?: { fullName?: string; avatar?: string } | null } | null;
  lastMessageAt?: string;
  lastMessageText?: string;
  lastSenderRole?: Role;
  patientUnread: number;
  doctorUnread: number;
}

/** Your conversations, newest first. */
export async function getMyChats(me: Role): Promise<ChatSummary[]> {
  const result = await api<BackendChat[]>("/chats/mine");
  if (!result.ok || !result.data) return [];
  return result.data.map((c) => {
    if (me === "patient") {
      const doctorId = c.doctor?._id ?? c._id;
      return {
        id: doctorId,
        name: c.doctor?.user?.fullName ?? "Doctor",
        avatar: c.doctor?.user?.avatar,
        hue: hueFor(doctorId),
        subtitle: c.doctor?.specialization ?? c.doctor?.title ?? "",
        lastText: c.lastMessageText,
        lastAt: c.lastMessageAt,
        lastFrom: c.lastSenderRole,
        unread: c.patientUnread,
      };
    }
    return {
      id: c._id,
      name: c.patient?.fullName ?? "Patient",
      avatar: c.patient?.avatar,
      hue: hueFor(c.patient?._id ?? c._id),
      subtitle: "Patient",
      lastText: c.lastMessageText,
      lastAt: c.lastMessageAt,
      lastFrom: c.lastSenderRole,
      unread: c.doctorUnread,
    };
  });
}

export interface PatientChatData {
  messages: Message[];
  /** Whether the backend lets you write now (free messages, or a consultation running). */
  canSend: boolean;
  reason?: string;
}

/** Patient: your chat with a doctor. */
export async function getPatientChat(doctorId: string): Promise<PatientChatData> {
  const result = await api<{ messages: BackendMessage[]; canSend: boolean; reason?: string }>(`/chats/doctor/${doctorId}`);
  if (!result.ok || !result.data) return { messages: [], canSend: false, reason: result.message };
  return { messages: result.data.messages.map(toMessage), canSend: result.data.canSend, reason: result.data.reason };
}

export interface DoctorChatData {
  chatId: string;
  patient: { id: string; name: string; avatar?: string };
  messages: Message[];
}

/** Doctor: one of your chats, or undefined if it isn't yours. */
export async function getDoctorChat(chatId: string): Promise<DoctorChatData | undefined> {
  if (!/^[a-f\d]{24}$/i.test(chatId)) return undefined;
  const result = await api<{ chat: BackendChat; messages: BackendMessage[] }>(`/chats/${chatId}`);
  if (!result.ok || !result.data) return undefined;
  const p = result.data.chat.patient;
  return {
    chatId,
    patient: { id: p?._id ?? chatId, name: p?.fullName ?? "Patient", avatar: p?.avatar },
    messages: result.data.messages.map(toMessage),
  };
}
