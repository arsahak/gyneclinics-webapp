"use client";

import { Bookmark } from "lucide-react";
import { EmptyState } from "@/component/shared/empty-state";
import { ButtonLink } from "@/component/ui/button";
import { useLibrary } from "@/lib/store/library";
import type { Article } from "@/lib/types";
import { ArticleCard } from "./article-card";

export function SavedList({ articles }: { articles: Article[] }) {
  const bookmarks = useLibrary((s) => s.bookmarks);
  const saved = bookmarks.map((slug) => articles.find((a) => a.slug === slug)).filter((a): a is Article => !!a);

  if (!saved.length) {
    return (
      <EmptyState
        icon={Bookmark}
        title="No saved articles yet"
        description="Tap the bookmark icon on any article to save it here for later."
        action={<ButtonLink href="/patient/learn">Browse articles</ButtonLink>}
      />
    );
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {saved.map((article) => (
        <ArticleCard key={article.slug} article={article} layout="horizontal" />
      ))}
    </div>
  );
}
