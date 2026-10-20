"use client";

import { format, parseISO } from "date-fns";
import Image from "next/image";
import { ArrowLeft, Clock, SearchX, Stethoscope } from "lucide-react";
import Link from "next/link";
import { ArticleCover } from "@/component/learn/article-cover";
import { BookmarkButton } from "@/component/learn/bookmark-button";
import { Disclaimer } from "@/component/shared/disclaimer";
import { ButtonLink } from "@/component/ui/button";
import { Badge } from "@/component/ui/badge";
import { storyToArticle } from "@/lib/stories";
import { useAppStatus } from "@/lib/store/app-status";
import { useLibrary } from "@/lib/store/library";

export function CommunityStoryArticle({ slug }: { slug: string }) {
  const hydrated = useAppStatus((state) => state.hydrated);
  const story = useLibrary((state) => state.stories.find((item) => storyToArticle(item).slug === slug));

  if (!hydrated) return <div className="h-96 animate-pulse rounded-3xl bg-surface-2" />;

  if (!story || story.status !== "approved") {
    return (
      <div className="flex flex-col items-center rounded-3xl border border-dashed border-border px-6 py-16 text-center">
        <SearchX className="size-8 text-primary" />
        <h1 className="mt-4 font-serif text-2xl font-semibold text-foreground">This story is not available</h1>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">It may still be under review or is no longer published.</p>
        <ButtonLink href="/patient/learn" variant="outline" className="mt-6">Back to Learn</ButtonLink>
      </div>
    );
  }

  const article = storyToArticle(story);
  return (
    <article className="mx-auto max-w-3xl">
      <Link href="/patient/learn" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Back to Learn
      </Link>
      <ArticleCover article={article} className="h-48 rounded-3xl sm:h-64" iconSize="size-16" />
      {story.imageDataUrl && (
        <Image
          src={story.imageDataUrl}
          alt="Photo shared with this community story"
          width={1200}
          height={800}
          unoptimized
          className="mt-5 max-h-[32rem] w-full rounded-3xl object-cover"
        />
      )}

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <Badge tone="secondary">Community story</Badge>
        <Badge tone="primary">{story.category}</Badge>
        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="size-3.5" /> {article.readMinutes} min read
        </span>
      </div>
      <h1 className="mt-3 font-serif text-3xl leading-tight font-semibold tracking-tight text-foreground sm:text-4xl">{article.title}</h1>
      <div className="mt-4 flex items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <p className="text-sm font-medium text-foreground">{article.author}</p>
          <p className="text-xs text-muted-foreground">Community story · Approved by GyneClinics · {format(parseISO(article.publishedAt), "d MMMM yyyy")}</p>
        </div>
        <BookmarkButton slug={article.slug} withLabel />
      </div>

      <div className="mt-8 text-[17px] leading-relaxed whitespace-pre-wrap text-foreground/90">{story.body}</div>

      <Disclaimer className="mt-10">This community story is a personal experience, not medical advice.</Disclaimer>
      <div className="mt-6 flex flex-col items-start gap-4 rounded-3xl bg-primary-soft p-6 sm:flex-row sm:items-center">
        <Stethoscope className="size-8 shrink-0 text-primary" />
        <div className="flex-1">
          <p className="font-semibold text-foreground">Have questions about this?</p>
          <p className="text-sm text-muted-foreground">Chat privately with a verified specialist.</p>
        </div>
        <ButtonLink href="/patient/doctors">Find a specialist</ButtonLink>
      </div>
    </article>
  );
}
