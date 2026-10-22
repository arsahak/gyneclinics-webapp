"use client";

import { Bell, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { io, type Socket } from "socket.io-client";
import { markReadAction, notificationTicketAction } from "@/app/actions/notificationAction";
import { type BackendNotification, toInboxItem } from "@/lib/notifications";
import { useNotifications } from "@/lib/store/notifications";
import { cn } from "@/lib/utils";

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");

/**
 * Live notifications: anything the team sends from the dashboard, and automatic
 * messages (booking confirmed…), arrive the moment they're sent over socket.io.
 * If the socket can't connect, the unread count is checked every minute instead.
 * Mount once (in the app shell).
 */
export function NotificationPoller() {
  const refresh = useNotifications((s) => s.refresh);
  const receive = useNotifications((s) => s.receive);
  const setUnread = useNotifications((s) => s.setUnread);

  useEffect(() => {
    const first = setTimeout(() => void refresh(), 0);
    let socket: Socket | null = null;
    if (API_URL) {
      socket = io(API_URL, {
        path: "/socket.io",
        transports: ["websocket", "polling"],
        reconnectionDelayMax: 30_000,
        // A fresh ticket every time it (re)connects.
        auth: (cb) => {
          notificationTicketAction().then((ticket) => cb({ ticket: ticket ?? "" }), () => cb({ ticket: "" }));
        },
      });
      socket.on("notification:new", (payload: { notification: BackendNotification; unread: number }) => receive(toInboxItem(payload.notification), payload.unread));
      socket.on("notification:unread", (payload: { unread: number }) => setUnread(payload.unread));
      // Catch up on anything missed while disconnected.
      socket.on("connect", () => void refresh());
    }
    const timer = setInterval(() => {
      if (document.visibilityState === "visible" && !socket?.connected) void refresh();
    }, 60_000);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
      socket?.disconnect();
    };
  }, [refresh, receive, setUnread]);
  return null;
}

/** New notifications pop up at the top for a few seconds. Tap to open. */
export function NotificationToasts() {
  const router = useRouter();
  const toasts = useNotifications((s) => s.toasts);
  const dismiss = useNotifications((s) => s.dismiss);
  const setUnread = useNotifications((s) => s.setUnread);
  const unread = useNotifications((s) => s.unread);

  useEffect(() => {
    if (!toasts.length) return;
    const timers = toasts.map((t) => setTimeout(() => dismiss(t.id), 7000));
    return () => timers.forEach(clearTimeout);
  }, [toasts, dismiss]);

  if (!toasts.length) return null;
  return (
    <div className="pointer-events-none fixed inset-x-3 top-3 z-[60] flex flex-col items-end gap-2 sm:inset-x-auto sm:right-4 sm:top-4" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} role="status" className="pointer-events-auto flex w-full max-w-sm animate-fade-up items-start gap-3 rounded-2xl border border-border bg-surface p-3 pr-2 shadow-lg">
          <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
            <Bell className="size-4" />
          </span>
          <button
            type="button"
            className="min-w-0 flex-1 text-left"
            onClick={() => {
              dismiss(t.id);
              void markReadAction(t.id);
              setUnread(unread - 1);
              if (t.link) router.push(t.link);
            }}
          >
            <span className="block text-sm font-semibold text-foreground">{t.title}</span>
            <span className="line-clamp-2 block text-xs text-muted-foreground">{t.body}</span>
          </button>
          <button type="button" onClick={() => dismiss(t.id)} aria-label="Dismiss" className="rounded-lg p-1 text-muted-foreground hover:bg-surface-2 hover:text-foreground">
            <X className="size-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

/** Unread count as a small badge. */
export function UnreadBadge({ className }: { className?: string }) {
  const unread = useNotifications((s) => s.unread);
  if (!unread) return null;
  return (
    <span className={cn("inline-flex min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-[10px] font-bold text-accent-foreground", className)}>
      {unread > 9 ? "9+" : unread}
    </span>
  );
}

/** Round bell that opens the notifications page, with the unread count. */
export function NotificationBell({ href, className }: { href: string; className?: string }) {
  const unread = useNotifications((s) => s.unread);
  return (
    <Link
      href={href}
      aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
      title="Notifications"
      className={cn("relative inline-flex size-10 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground", className)}
    >
      <Bell className="size-5" />
      <UnreadBadge className="absolute -top-0.5 -right-0.5 ring-2 ring-background" />
    </Link>
  );
}
