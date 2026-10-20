import { Clock } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/component/ui/badge";
import type { Article } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ArticleCover } from "./article-cover";
import { BookmarkButton } from "./bookmark-button";

export function ArticleCard({ article, layout = "vertical" }: { article: Article; layout?: "vertical" | "horizontal" }) {
  const horizontal = layout === "horizontal";
  return (
    <Link
      href={`/patient/learn/${article.slug}`}
      className={cn(
        "group relative flex overflow-hidden rounded-3xl border border-border bg-surface transition-shadow hover:shadow-[var(--shadow-lift)]",
        horizontal ? "flex-row" : "flex-col",
      )}
    >
      <ArticleCover article={article} className={horizontal ? "w-28 shrink-0 sm:w-36" : "h-36"} iconSize={horizontal ? "size-8" : "size-10"} />
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <Badge tone={article.format === "story" ? "secondary" : "primary"}>{article.category}</Badge>
          {article.sponsor && <Badge tone="gold">Sponsored</Badge>}
        </div>
        <h3 className="line-clamp-2 font-semibold text-foreground group-hover:text-primary">{article.title}</h3>
        {!horizontal && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{article.excerpt}</p>}
        <p className="mt-auto flex items-center gap-1.5 pt-3 text-xs text-muted-foreground">
          <Clock className="size-3.5" /> {article.readMinutes} min read · {article.author}
        </p>
      </div>
      <BookmarkButton slug={article.slug} className="absolute top-3 right-3" />
    </Link>
  );
}
