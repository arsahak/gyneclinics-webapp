"use client";

import { formatDistanceToNowStrict, parseISO } from "date-fns";
import { Bell, CheckCheck, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { markAllReadAction, markReadAction } from "@/app/actions/notificationAction";
import { EmptyState } from "@/component/shared/empty-state";
import { Button } from "@/component/ui/button";
import type { InboxItem } from "@/lib/notifications";
import { useNotifications } from "@/lib/store/notifications";
import { cn } from "@/lib/utils";

/** The full inbox: tap to read (and open its page), or mark everything read. */
export function NotificationInbox({ initialItems, initialUnread }: { initialItems: InboxItem[]; initialUnread: number }) {
  const router = useRouter();
  const setUnread = useNotifications((s) => s.setUnread);
  const incoming = useNotifications((s) => s.incoming);
  const [stored, setItems] = useState(initialItems);
  // Items that arrived live while this page is open go on top.
  const items = [...incoming.filter((n) => !stored.some((x) => x.id === n.id) && n.at > (initialItems[0]?.at ?? "")), ...stored];
  const unread = items.filter((n) => !n.read).length;

  // The page has the freshest count; share it with the bells.
  useEffect(() => setUnread(initialUnread), [initialUnread, setUnread]);

  const open = async (n: InboxItem) => {
    if (!n.read) {
      setItems((list) => (list.some((x) => x.id === n.id) ? list.map((x) => (x.id === n.id ? { ...x, read: true } : x)) : [{ ...n, read: true }, ...list]));
      setUnread(unread - 1);
      void markReadAction(n.id);
    }
    if (n.link) router.push(n.link);
  };

  const readAll = async () => {
    setItems(items.map((x) => ({ ...x, read: true })));
    setUnread(0);
    await markAllReadAction();
  };

  if (items.length === 0) {
    return <EmptyState icon={Bell} title="No notifications yet" description="Booking updates, replies from the team and news from GyneClinics show up here." />;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{unread ? `${unread} unread` : "All caught up"}</p>
        {unread > 0 && (
          <Button variant="outline" size="sm" onClick={readAll}>
            <CheckCheck /> Mark all as read
          </Button>
        )}
      </div>
      <ul className="divide-y divide-border overflow-hidden rounded-3xl border border-border bg-surface">
        {items.map((n) => (
          <li key={n.id}>
            <button
              type="button"
              onClick={() => open(n)}
              className={cn("flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-surface-2 sm:px-6", !n.read && "bg-primary-soft/40")}
            >
              <span className={cn("mt-1.5 size-2.5 shrink-0 rounded-full", n.read ? "bg-transparent" : "bg-accent")} aria-hidden />
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline justify-between gap-3">
                  <span className={cn("text-sm text-foreground", !n.read && "font-semibold")}>{n.title}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">{formatDistanceToNowStrict(parseISO(n.at), { addSuffix: true })}</span>
                </span>
                <span className="mt-0.5 block text-sm leading-relaxed text-muted-foreground">{n.body}</span>
              </span>
              {n.link && <ChevronRight className="mt-1 size-4 shrink-0 text-muted-foreground" />}
              {!n.read && <span className="sr-only">Unread</span>}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
