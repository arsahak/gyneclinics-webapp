"use server";

import { api } from "@/lib/api";

/** Unread count, for the bell (checked every minute). null on failure. */
export async function unreadCountAction(): Promise<number | null> {
  const result = await api<{ unread: number }>("/notifications/mine?limit=1");
  return result.ok && result.data ? result.data.unread : null;
}

export async function markReadAction(id: string): Promise<boolean> {
  const result = await api(`/notifications/${id}/read`, { method: "PATCH" });
  return result.ok;
}

export async function markAllReadAction(): Promise<boolean> {
  const result = await api("/notifications/read-all", { method: "PATCH" });
  return result.ok;
}

/** A 15-minute ticket to connect to live notifications (the login token never reaches the browser). */
export async function notificationTicketAction(): Promise<string | null> {
  const result = await api<{ ticket: string }>("/notifications/ticket", { method: "POST" });
  return result.ok && result.data ? result.data.ticket : null;
}
