"use client";

import { format, isSameDay, isToday, isYesterday, parseISO } from "date-fns";
import { ArrowLeft, LockKeyhole, SendHorizontal, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { pollChatAction, sendChatMessageAction } from "@/app/actions/chatAction";
import { Avatar } from "@/component/ui/avatar";
import { Button } from "@/component/ui/button";
import { describeBlocked, scanForContactDetails } from "@/lib/chat-guard";
import type { Message, Role } from "@/lib/types";
import { cn } from "@/lib/utils";

/** How often an open chat checks for new messages. */
const POLL_MS = 5000;

function dayLabel(date: Date) {
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "EEEE, d MMMM");
}

export function ChatThread({
  to,
  initialMessages,
  me,
  counterpart,
  backHref,
  banner,
  statusBar,
  lockedComposer,
  readOnly = false,
}: {
  /** Who the messages go to: patients pass the doctor, doctors pass the chat. */
  to: { doctorId: string } | { chatId: string };
  initialMessages: Message[];
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
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [text, setText] = useState("");
  const [attempted, setAttempted] = useState(false);
  const [serverError, setServerError] = useState("");
  const [sending, startSending] = useTransition();
  const endRef = useRef<HTMLDivElement>(null);
  const blocked = scanForContactDetails(text);
  const toKey = "doctorId" in to ? to.doctorId : to.chatId;

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  // New messages from the other side: check every few seconds while the tab is visible.
  useEffect(() => {
    let stopped = false;
    const timer = setInterval(async () => {
      if (document.visibilityState !== "visible") return;
      const latest = await pollChatAction(to);
      if (!stopped && latest) setMessages((current) => (latest.length !== current.length || latest.at(-1)?.id !== current.at(-1)?.id ? latest : current));
    }, POLL_MS);
    return () => {
      stopped = true;
      clearInterval(timer);
    };
    // `to` is a fresh object each render; its id is what matters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toKey]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!text.trim() || sending) return;
    if (blocked.length) {
      // The app blocks it here too; the server would refuse it anyway.
      setAttempted(true);
      return;
    }
    const body = text.trim();
    startSending(async () => {
      setServerError("");
      const result = await sendChatMessageAction({ ...to, text: body });
      if (result.error || !result.message) {
        setServerError(result.error ?? "Couldn't send. Please try again.");
        return;
      }
      setMessages((current) => [...current, result.message!]);
      setText("");
      setAttempted(false);
    });
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
          {serverError && (
            <div role="alert" className="mb-2 flex items-start gap-2 rounded-2xl bg-danger-soft px-3 py-2 text-xs text-danger">
              <ShieldAlert className="mt-0.5 size-4 shrink-0" />
              {serverError}
            </div>
          )}
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
                setServerError("");
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
            <Button type="submit" size="icon" className="size-11" aria-label="Send" disabled={!text.trim() || blocked.length > 0 || sending}>
              <SendHorizontal />
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
