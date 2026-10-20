"use client";

import { format, isToday, parseISO } from "date-fns";
import { MessagesSquare } from "lucide-react";
import Link from "next/link";
import type { ComponentProps } from "react";
import { EmptyState } from "@/component/shared/empty-state";
import { Avatar } from "@/component/ui/avatar";
import { Badge } from "@/component/ui/badge";
import { ButtonLink } from "@/component/ui/button";
import { useChat } from "@/lib/store/chat";
import type { Role } from "@/lib/types";
import { cn } from "@/lib/utils";

export interface ConversationSummary {
  id: string;
  name: string;
  hue: number;
  subtitle: string;
  badge?: { label: string; tone: ComponentProps<typeof Badge>["tone"] };
}

/** Conversation list for either side. Only conversations with messages are shown. */
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
  const conversations = useChat((s) => s.conversations);
  const rows = people
    .map((person) => {
      const messages = conversations[person.id] ?? [];
      const last = messages.at(-1);
      const awaitingReply = last && last.from !== me;
      return { person, last, awaitingReply };
    })
    .filter((row) => row.last)
    .sort((a, b) => b.last!.at.localeCompare(a.last!.at));

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
      {rows.map(({ person, last, awaitingReply }) => {
        const at = parseISO(last!.at);
        return (
          <li key={person.id}>
            <Link href={`${basePath}/${person.id}`} className="flex items-center gap-4 p-4 transition-colors hover:bg-surface-2 sm:px-6">
              <Avatar name={person.name} hue={person.hue} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <p className={cn("truncate text-foreground", awaitingReply ? "font-semibold" : "font-medium")}>{person.name}</p>
                  <span className="shrink-0 text-xs text-muted-foreground">{isToday(at) ? format(at, "HH:mm") : format(at, "d MMM")}</span>
                </div>
                <p className="truncate text-xs text-muted-foreground">{person.subtitle}</p>
                <div className="mt-1 flex items-center gap-2">
                  <p className={cn("min-w-0 flex-1 truncate text-sm", awaitingReply ? "text-foreground" : "text-muted-foreground")}>
                    {last!.from === me && "You: "}
                    {last!.text}
                  </p>
                  {person.badge && <Badge tone={person.badge.tone}>{person.badge.label}</Badge>}
                  {awaitingReply && <span className="size-2.5 shrink-0 rounded-full bg-accent" aria-label="Unread" />}
                </div>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
