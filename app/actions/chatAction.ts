"use server";

import { api } from "@/lib/api";
import { type BackendMessage, toMessage } from "@/lib/chat";
import type { Message } from "@/lib/types";

/**
 * Sends a chat message (POST /chats/messages). Patients pass doctorId, doctors
 * pass chatId. The backend refuses contact details and says why.
 */
export async function sendChatMessageAction(input: { doctorId?: string; chatId?: string; text: string }): Promise<{ message?: Message; error?: string }> {
  const result = await api<BackendMessage>("/chats/messages", {
    method: "POST",
    body: { text: input.text.trim(), ...(input.doctorId && { doctorId: input.doctorId }), ...(input.chatId && { chatId: input.chatId }) },
  });
  if (!result.ok || !result.data) return { error: result.errors[0] ?? result.message ?? "Couldn't send. Please try again." };
  return { message: toMessage(result.data) };
}

/** Latest messages, for checking for new ones while a chat is open. null on failure. */
export async function pollChatAction(input: { doctorId?: string; chatId?: string }): Promise<Message[] | null> {
  const path = input.doctorId ? `/chats/doctor/${input.doctorId}` : input.chatId ? `/chats/${input.chatId}` : null;
  if (!path) return null;
  const result = await api<{ messages: BackendMessage[] }>(path);
  return result.ok && result.data ? result.data.messages.map(toMessage) : null;
}
