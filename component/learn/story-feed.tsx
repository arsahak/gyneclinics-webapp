"use client";

import { formatDistanceToNowStrict, parseISO } from "date-fns";
import { CheckCircle2, Clock, EyeOff, MessageCircleHeart, PenLine, UserRound, XCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useAccount } from "@/component/shared/account-provider";
import { Disclaimer } from "@/component/shared/disclaimer";
import { Avatar } from "@/component/ui/avatar";
import { Badge } from "@/component/ui/badge";
import { Button, ButtonLink } from "@/component/ui/button";
import { Card } from "@/component/ui/card";
import { communityStorySlug } from "@/lib/stories";
import type { StoryStatus, SubmittedStory } from "@/lib/types";
import { BookmarkButton } from "./bookmark-button";

// Community stories as a feed of posts, with a "Share story" button on top
// that opens the form (/patient/learn/share-story/new).

const PAGE = 8;

const STATUS: Record<StoryStatus, { label: string; tone: "warning" | "success" | "danger"; icon: typeof Clock }> = {
  pending: { label: "Awaiting review", tone: "warning", icon: Clock },
  approved: { label: "Published", tone: "success", icon: CheckCircle2 },
  rejected: { label: "Not approved", tone: "danger", icon: XCircle },
  hidden: { label: "Taken down", tone: "warning", icon: EyeOff },
};

const ago = (iso?: string) => (iso ? `${formatDistanceToNowStrict(parseISO(iso))} ago` : "");

/** A stable avatar colour per post. */
const hueFor = (id: string) => [...id].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 0) % 360;

function StoryPost({ story }: { story: SubmittedStory }) {
  const [open, setOpen] = useState(false);
  const body = story.body ?? "";
  const long = body.length > 320 || body.split(/\n\s*\n/).length > 2;
  const name = story.anonymous ? "Anonymous" : story.authorName || "Community member";
  const slug = communityStorySlug(story);

  return (
    <Card className="overflow-hidden">
      {/* Who and when */}
      <div className="flex items-center gap-3 px-5 pt-5">
        {story.anonymous ? (
          <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-secondary-soft text-secondary">
            <UserRound className="size-5" />
          </span>
        ) : (
          <Avatar name={name} hue={hueFor(story._id)} />
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-foreground">{name}</p>
          <p className="text-xs text-muted-foreground">
            {ago(story.publishedAt ?? story.createdAt)} · {story.topic}
          </p>
        </div>
        <BookmarkButton slug={slug} />
      </div>

      {/* The story */}
      <div className="px-5 pt-3 pb-4">
        <Link href={`/patient/learn/${slug}`} className="font-serif text-lg font-semibold text-foreground hover:text-primary">
          {story.title}
        </Link>
        <div className={`mt-1.5 space-y-3 text-[15px] leading-relaxed text-foreground/90 ${open ? "" : "line-clamp-4"}`}>
          {body
            .split(/\n\s*\n/)
            .filter((p) => p.trim())
            .map((p, i) => (
              <p key={i} className="whitespace-pre-line">
                {p.trim()}
              </p>
            ))}
        </div>
        {long && (
          <button type="button" onClick={() => setOpen(!open)} className="mt-1 text-sm font-medium text-muted-foreground hover:text-foreground">
            {open ? "See less" : "See more"}
          </button>
        )}
      </div>

      {story.imageUrl && (
        <Link href={`/patient/learn/${slug}`} className="block bg-surface-2">
          {/* Patient uploads come from our storage; any host is allowed, so not next/image. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={story.imageUrl} alt="" className="max-h-[28rem] w-full object-cover" loading="lazy" />
        </Link>
      )}

      <div className="flex items-center justify-between gap-3 border-t border-border px-5 py-3 text-sm">
        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
          <MessageCircleHeart className="size-4 text-secondary" /> Community story
        </span>
        <Link href={`/patient/learn/${slug}`} className="font-medium text-primary hover:underline">
          Read full story
        </Link>
      </div>
    </Card>
  );
}

export function StoryFeed({ stories, myStories }: { stories: SubmittedStory[]; myStories: SubmittedStory[] }) {
  const account = useAccount();
  const [shown, setShown] = useState(PAGE);
  const firstName = account.fullName?.split(" ")[0];

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="min-w-0 space-y-4">
        {/* Share box */}
        <Card className="flex items-center gap-3 p-4 sm:p-5">
          <Avatar name={account.fullName || "You"} src={account.avatar || undefined} />
          <p className="min-w-0 flex-1 text-sm text-muted-foreground">
            Have something to share{firstName ? `, ${firstName}` : ""}? Your story could help another woman.
          </p>
          <ButtonLink href="/patient/learn/share-story/new" variant="secondary" className="shrink-0">
            <PenLine /> Share story
          </ButtonLink>
        </Card>

        {/* Posts */}
        {stories.length === 0 ? (
          <Card className="p-10 text-center">
            <MessageCircleHeart className="mx-auto size-10 text-secondary" />
            <p className="mt-3 font-semibold text-foreground">No stories yet</p>
            <p className="mt-1 text-sm text-muted-foreground">Be the first to share your experience.</p>
          </Card>
        ) : (
          <>
            {stories.slice(0, shown).map((story) => (
              <StoryPost key={story._id} story={story} />
            ))}
            {shown < stories.length && (
              <Button variant="outline" className="w-full" onClick={() => setShown(shown + PAGE)}>
                Show more stories
              </Button>
            )}
          </>
        )}
      </div>

      <aside className="space-y-4 lg:sticky lg:top-10 lg:self-start">
        <Card className="p-5">
          <h2 className="font-semibold text-foreground">Your stories</h2>
          {myStories.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">You haven&apos;t shared a story yet.</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {myStories.map((story) => {
                const s = STATUS[story.status ?? "pending"];
                return (
                  <li key={story._id} className="rounded-2xl bg-surface-2 p-3">
                    {story.status === "approved" ? (
                      <Link href={`/patient/learn/${communityStorySlug(story)}`} className="line-clamp-1 text-sm font-medium text-foreground hover:text-primary">
                        {story.title}
                      </Link>
                    ) : (
                      <p className="line-clamp-1 text-sm font-medium text-foreground">{story.title}</p>
                    )}
                    <div className="mt-1.5 flex items-center justify-between gap-2">
                      <Badge tone={s.tone}>
                        <s.icon /> {s.label}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{ago(story.createdAt)}</span>
                    </div>
                    {story.status === "rejected" && story.rejectionReason && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">Why:</span> {story.rejectionReason}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
        <Disclaimer>
          Stories are reviewed by our team before they&apos;re published. They share personal experience, not medical advice.
        </Disclaimer>
      </aside>
    </div>
  );
}
