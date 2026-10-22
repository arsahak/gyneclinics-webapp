import { create } from "zustand";
import { unreadCountAction } from "@/app/actions/notificationAction";
import type { InboxItem } from "@/lib/notifications";

// Notifications shared by everything on the page: the unread count (bells and
// badges), items that arrived live (the inbox adds them), and the pop-ups.
interface NotificationState {
  unread: number;
  /** New items received live, newest first. The inbox page merges them in. */
  incoming: InboxItem[];
  /** Pop-ups on screen. */
  toasts: InboxItem[];
  setUnread: (n: number) => void;
  refresh: () => Promise<void>;
  receive: (item: InboxItem, unread: number) => void;
  dismiss: (id: string) => void;
}

export const useNotifications = create<NotificationState>((set) => ({
  unread: 0,
  incoming: [],
  toasts: [],
  setUnread: (n) => set({ unread: Math.max(0, n) }),
  refresh: async () => {
    const n = await unreadCountAction().catch(() => null);
    if (n !== null) set({ unread: n });
  },
  receive: (item, unread) =>
    set((s) =>
      s.incoming.some((x) => x.id === item.id)
        ? { unread: Math.max(0, unread) }
        : { unread: Math.max(0, unread), incoming: [item, ...s.incoming].slice(0, 50), toasts: [item, ...s.toasts].slice(0, 3) },
    ),
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
