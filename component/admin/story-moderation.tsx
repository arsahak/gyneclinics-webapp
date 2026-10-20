"use client";

import { format, parseISO } from "date-fns";
import Image from "next/image";
import { Check, CheckCircle2, Clock3, Eye, FileText, X } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/component/shared/logo";
import { Badge } from "@/component/ui/badge";
import { Button, ButtonLink } from "@/component/ui/button";
import { Card } from "@/component/ui/card";
import { useLibrary } from "@/lib/store/library";
import type { StoryStatus, SubmittedStory } from "@/lib/types";

const STATUS: Record<StoryStatus, { label: string; tone: "warning" | "success" | "danger" }> = {
  pending: { label: "Awaiting review", tone: "warning" },
  approved: { label: "Published", tone: "success" },
  rejected: { label: "Declined", tone: "danger" },
};

export function StoryModeration() {
  const { stories, reviewStory } = useLibrary();
  const pending = stories.filter((story) => story.status === "pending");
  const published = stories.filter((story) => story.status === "approved");
  const declined = stories.filter((story) => story.status === "rejected");

  return (
    <div className="min-h-full bg-background">
      <header className="border-b border-white/10 bg-gradient-to-r from-[#174f57] to-[#0a2342] text-white">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-10">
          <Logo tone="inverse" />
          <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white/80">Admin dashboard</span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-primary">Community moderation</p>
            <h1 className="mt-1 font-serif text-3xl font-semibold tracking-tight text-foreground">Review patient stories</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Only approved submissions are added to the patient Learn feed.
            </p>
          </div>
          <ButtonLink href="/patient/learn" variant="outline">
            <Eye /> View patient feed
          </ButtonLink>
        </div>

        <div className="mt-7 grid gap-3 sm:grid-cols-3">
          <Summary icon={Clock3} label="Awaiting review" value={pending.length} tone="bg-warning-soft text-warning" />
          <Summary icon={CheckCircle2} label="Published" value={published.length} tone="bg-success-soft text-success" />
          <Summary icon={FileText} label="Declined" value={declined.length} tone="bg-danger-soft text-danger" />
        </div>

        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="font-serif text-xl font-semibold text-foreground">Submission queue</h2>
              <p className="mt-1 text-sm text-muted-foreground">Check for safety, relevance and identifying information before publishing.</p>
            </div>
            <Badge tone="warning">{pending.length} pending</Badge>
          </div>

          {pending.length === 0 ? (
            <Card className="p-8 text-center">
              <CheckCircle2 className="mx-auto size-8 text-success" />
              <p className="mt-3 font-semibold text-foreground">The review queue is clear</p>
              <p className="mt-1 text-sm text-muted-foreground">New patient stories will appear here for approval.</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {pending.map((story) => (
                <StoryReviewCard key={story.id} story={story} onReview={reviewStory} />
              ))}
            </div>
          )}
        </section>

        {(published.length > 0 || declined.length > 0) && (
          <section className="mt-10">
            <h2 className="font-serif text-xl font-semibold text-foreground">Recently reviewed</h2>
            <div className="mt-4 grid gap-3 lg:grid-cols-2">
              {[...published, ...declined]
                .sort((a, b) => (b.reviewedAt ?? "").localeCompare(a.reviewedAt ?? ""))
                .map((story) => (
                  <ReviewedStory key={story.id} story={story} />
                ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function Summary({ icon: Icon, label, value, tone }: { icon: typeof Clock3; label: string; value: number; tone: string }) {
  return (
    <Card className="flex items-center gap-3 p-4">
      <span className={`inline-flex size-10 items-center justify-center rounded-2xl ${tone}`}><Icon className="size-5" /></span>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-semibold text-foreground">{value}</p>
      </div>
    </Card>
  );
}

function StoryReviewCard({
  story,
  onReview,
}: {
  story: SubmittedStory;
  onReview: (id: string, status: "approved" | "rejected") => void;
}) {
  return (
    <Card className="p-5 sm:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="secondary">{story.category}</Badge>
            <Badge tone="warning">Awaiting review</Badge>
            <span className="text-xs text-muted-foreground">Submitted {format(parseISO(story.submittedAt), "d MMM yyyy")}</span>
          </div>
          <h3 className="mt-3 text-lg font-semibold text-foreground">{story.title}</h3>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{story.body}</p>
          {story.imageDataUrl && (
            <Image src={story.imageDataUrl} alt="Photo attached to this story" width={960} height={640} unoptimized className="mt-4 max-h-72 w-full rounded-2xl object-cover" />
          )}
          <p className="mt-4 text-xs text-muted-foreground">
            By {story.anonymous ? "Anonymous (name hidden in publication)" : story.authorName || "Community member"}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button size="sm" variant="danger" onClick={() => onReview(story.id, "rejected")}>
            <X /> Decline
          </Button>
          <Button size="sm" onClick={() => onReview(story.id, "approved")}>
            <Check /> Approve
          </Button>
        </div>
      </div>
    </Card>
  );
}

function ReviewedStory({ story }: { story: SubmittedStory }) {
  const status = STATUS[story.status];
  return (
    <Link href={story.status === "approved" ? "/patient/learn" : "/admin/stories"} className="rounded-3xl border border-border bg-surface p-4 shadow-[var(--shadow-soft)] transition-shadow hover:shadow-[var(--shadow-lift)]">
      <div className="flex items-center justify-between gap-3">
        <Badge tone={status.tone}>{status.label}</Badge>
        {story.reviewedAt && <span className="text-xs text-muted-foreground">{format(parseISO(story.reviewedAt), "d MMM")}</span>}
      </div>
      <p className="mt-3 line-clamp-1 font-semibold text-foreground">{story.title}</p>
      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{story.body}</p>
    </Link>
  );
}
