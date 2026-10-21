"use client";

import { format, isSameDay, isToday, isYesterday, parseISO } from "date-fns";
import { ArrowLeft, LockKeyhole, SendHorizontal, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Avatar } from "@/component/ui/avatar";
import { Button } from "@/component/ui/button";
import { describeBlocked, scanForContactDetails } from "@/lib/chat-guard";
import { useChat } from "@/lib/store/chat";
import type { Message, Role } from "@/lib/types";
import { cn } from "@/lib/utils";

const EMPTY: Message[] = [];

function dayLabel(date: Date) {
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "EEEE, d MMMM");
}

export function ChatThread({
  conversationId,
  me,
  counterpart,
  backHref,
  banner,
  statusBar,
  lockedComposer,
  readOnly = false,
}: {
  conversationId: string;
  me: Role;
  counterpart: { name: string; hue: number; avatar?: string; subtitle: React.ReactNode };
  backHref: string;
  banner?: React.ReactNode;
  /** Shown under the header, e.g. consultation status. */
  statusBar?: React.ReactNode;
  /** Replaces the message box when the user isn't allowed to send. */
  lockedComposer?: React.ReactNode;
  readOnly?: boolean;
}) {
  const messages = useChat((s) => s.conversations[conversationId] ?? EMPTY);
  const send = useChat((s) => s.send);
  const [text, setText] = useState("");
  const [attempted, setAttempted] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const blocked = scanForContactDetails(text);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!text.trim()) return;
    if (blocked.length) {
      setAttempted(true);
      return;
    }
    send(conversationId, me, text.trim());
    setText("");
    setAttempted(false);
  };

  return (
    <div className="-mx-4 -mt-6 flex h-[calc(100dvh-7.5rem)] flex-col bg-surface sm:mx-0 sm:mt-0 sm:h-[calc(100dvh-10rem)] sm:overflow-hidden sm:rounded-3xl sm:border sm:border-border lg:h-[calc(100dvh-5rem)]">
      <header className="flex items-center gap-3 border-b border-border px-4 py-3">
        <Link href={backHref} aria-label="Back to messages" className="rounded-full p-2 text-muted-foreground hover:bg-surface-2 hover:text-foreground">
          <ArrowLeft className="size-5" />
        </Link>
        <Avatar name={counterpart.name} src={counterpart.avatar} hue={counterpart.hue} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-foreground">{counterpart.name}</p>
          <div className="truncate text-xs text-muted-foreground">{counterpart.subtitle}</div>
        </div>
      </header>
      {statusBar}

      <div className="flex-1 space-y-3 overflow-y-auto bg-background/60 px-4 py-5">
        <div className="mx-auto flex max-w-md items-start gap-2 rounded-2xl bg-surface-2 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
          <LockKeyhole className="mt-0.5 size-3.5 shrink-0 text-primary" />
          Messages are private and encrypted. For everyone&apos;s safety, phone numbers, emails, links and social handles can&apos;t be shared.
        </div>
        {banner}
        {messages.map((message, i) => {
          const at = parseISO(message.at);
          const prev = messages[i - 1];
          const newDay = !prev || !isSameDay(parseISO(prev.at), at);
          const mine = message.from === me;
          return (
            <div key={message.id}>
              {newDay && (
                <p className="my-4 text-center text-xs font-medium text-muted-foreground">{dayLabel(at)}</p>
              )}
              <div className={cn("flex", mine ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[80%] rounded-3xl px-4 py-2.5 text-sm leading-relaxed sm:max-w-[65%]",
                    mine
                      ? "rounded-br-lg bg-primary text-primary-foreground"
                      : "rounded-bl-lg border border-border bg-surface text-foreground",
                  )}
                >
                  <p className="whitespace-pre-wrap">{message.text}</p>
                  <p className={cn("mt-1 text-right text-[10px]", mine ? "text-primary-foreground/70" : "text-muted-foreground")}>
                    {format(at, "HH:mm")}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      {lockedComposer ? (
        <div className="border-t border-border p-4">{lockedComposer}</div>
      ) : readOnly ? (
        <p className="border-t border-border px-4 py-4 text-center text-sm text-muted-foreground">This conversation has been closed.</p>
      ) : (
        <form onSubmit={submit} className="border-t border-border p-3">
          {blocked.length > 0 && (
            <div
              role="alert"
              className={cn(
                "mb-2 flex items-start gap-2 rounded-2xl px-3 py-2 text-xs",
                attempted ? "bg-danger-soft text-danger" : "bg-warning-soft text-warning",
              )}
            >
              <ShieldAlert className="mt-0.5 size-4 shrink-0" />
              {describeBlocked(blocked)}
            </div>
          )}
          <div className="flex items-end gap-2">
            <textarea
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setAttempted(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  e.currentTarget.form?.requestSubmit();
                }
              }}
              rows={1}
              placeholder="Write a message…"
              aria-label="Message"
              className="max-h-32 min-h-11 flex-1 resize-none rounded-3xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
            <Button type="submit" size="icon" className="size-11" aria-label="Send" disabled={!text.trim() || blocked.length > 0}>
              <SendHorizontal />
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
