"use client";

import { format, isToday, parseISO } from "date-fns";
import { MessagesSquare } from "lucide-react";
import Link from "next/link";
import type { ComponentProps } from "react";
import { EmptyState } from "@/component/shared/empty-state";
import { Avatar } from "@/component/ui/avatar";
import { Badge } from "@/component/ui/badge";
import { ButtonLink } from "@/component/ui/button";
import type { ChatSummary } from "@/lib/chat";
import type { Role } from "@/lib/types";
import { cn } from "@/lib/utils";

export interface ConversationSummary extends ChatSummary {
  badge?: { label: string; tone: ComponentProps<typeof Badge>["tone"] };
}

/** Conversation list for either side, from the backend. Only chats with messages are listed. */
export function ConversationList({
  me,
  people,
  basePath,
  emptyAction,
}: {
  me: Role;
  people: ConversationSummary[];
  basePath: string;
  emptyAction?: { href: string; label: string };
}) {
  const rows = people
    .filter((person) => person.lastAt)
    .map((person) => ({ person, awaitingReply: person.lastFrom !== me && person.unread > 0 }))
    .sort((a, b) => b.person.lastAt!.localeCompare(a.person.lastAt!));

  if (!rows.length) {
    return (
      <EmptyState
        icon={MessagesSquare}
        title="No conversations yet"
        description="When you start a chat, it will appear here."
        action={emptyAction && <ButtonLink href={emptyAction.href}>{emptyAction.label}</ButtonLink>}
      />
    );
  }

  return (
    <ul className="divide-y divide-border overflow-hidden rounded-3xl border border-border bg-surface">
      {rows.map(({ person, awaitingReply }) => {
        const at = parseISO(person.lastAt!);
        return (
          <li key={person.id}>
            <Link href={`${basePath}/${person.id}`} className="flex items-center gap-4 p-4 transition-colors hover:bg-surface-2 sm:px-6">
              <Avatar name={person.name} src={person.avatar} hue={person.hue} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <p className={cn("truncate text-foreground", awaitingReply ? "font-semibold" : "font-medium")}>{person.name}</p>
                  <span className="shrink-0 text-xs text-muted-foreground">{isToday(at) ? format(at, "HH:mm") : format(at, "d MMM")}</span>
                </div>
                <p className="truncate text-xs text-muted-foreground">{person.subtitle}</p>
                <div className="mt-1 flex items-center gap-2">
                  <p className={cn("min-w-0 flex-1 truncate text-sm", awaitingReply ? "text-foreground" : "text-muted-foreground")}>
                    {person.lastFrom === me && "You: "}
                    {person.lastText}
                  </p>
                  {person.badge && <Badge tone={person.badge.tone}>{person.badge.label}</Badge>}
                  {awaitingReply && (
                    <span className="inline-flex min-w-5 shrink-0 items-center justify-center rounded-full bg-accent px-1.5 text-[11px] font-semibold text-white" aria-label={`${person.unread} unread`}>
                      {person.unread}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
