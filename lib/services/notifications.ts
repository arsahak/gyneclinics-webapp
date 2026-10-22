import "server-only";
import { api } from "@/lib/api";
import { type BackendNotification, type InboxItem, toInboxItem } from "@/lib/notifications";

/** Your notifications (GET /notifications/mine), newest first. */
export async function getMyNotifications(limit = 50): Promise<{ items: InboxItem[]; unread: number } | null> {
  const result = await api<{ notifications: BackendNotification[]; unread: number }>(`/notifications/mine?limit=${limit}`);
  if (!result.ok || !result.data) return null;
  return { items: result.data.notifications.map(toInboxItem), unread: result.data.unread };
}
