"use client";

import { Bookmark, PenLine, Search } from "lucide-react";
import { Fragment, useMemo, useRef, useState } from "react";
import { AdBanner } from "@/component/shared/ad-banner";
import { EmptyState } from "@/component/shared/empty-state";
import { ButtonLink } from "@/component/ui/button";
import { Input, Select } from "@/component/ui/field";
import { Pagination } from "@/component/ui/pagination";
import { Tabs } from "@/component/ui/tabs";
import { FEED_AD_FREQUENCY } from "@/lib/ads";
import type { Article, ArticleCategory } from "@/lib/types";
import { ArticleCard } from "./article-card";

type Sort = "latest" | "quick";

const PAGE_SIZE = 9;

export function LearnBrowser({ articles, categories }: { articles: Article[]; categories: ArticleCategory[] }) {
  const [category, setCategory] = useState<ArticleCategory | "All">("All");
  const [sort, setSort] = useState<Sort>("latest");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const listTop = useRef<HTMLDivElement>(null);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return articles
      .filter((a) => category === "All" || a.category === category)
      .filter((a) => !q || `${a.title} ${a.excerpt} ${a.category}`.toLowerCase().includes(q))
      .sort((a, b) => (sort === "latest" ? b.publishedAt.localeCompare(a.publishedAt) : a.readMinutes - b.readMinutes));
  }, [articles, category, sort, query]);

  // A filter change can leave fewer pages than the one we were on.
  const pages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const pageItems = visible.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const goTo = (next: number) => {
    setPage(next);
    listTop.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  // Any new search, sort or category starts from the first page.
  const filterBy = <T,>(setter: (value: T) => void) => (value: T) => {
    setter(value);
    setPage(1);
  };

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search articles and stories" value={query} onChange={(e) => filterBy(setQuery)(e.target.value)} className="pl-10" />
        </div>
        <Select aria-label="Sort" value={sort} onChange={(e) => filterBy(setSort)(e.target.value as Sort)} className="sm:w-44">
          <option value="latest">Most recent</option>
          <option value="quick">Quick reads first</option>
        </Select>
        <div className="flex gap-2">
          <ButtonLink href="/patient/learn/saved" variant="outline" className="flex-1 sm:flex-none">
            <Bookmark /> Saved
          </ButtonLink>
          <ButtonLink href="/patient/learn/share-story" variant="secondary" className="flex-1 sm:flex-none">
            <PenLine /> Share story
          </ButtonLink>
        </div>
      </div>

      <div ref={listTop} className="scroll-mt-24" />
      <Tabs
        className="mb-6"
        value={category}
        onChange={filterBy(setCategory)}
        options={[{ value: "All" as const, label: "All" }, ...categories.map((c) => ({ value: c, label: c }))]}
      />

      {visible.length === 0 ? (
        <EmptyState icon={Search} title="Nothing found" description="Try a different search or category." />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pageItems.map((article, i) => (
              <Fragment key={article.slug}>
                <ArticleCard article={article} />
                {(i + 1) % FEED_AD_FREQUENCY === 0 && i < pageItems.length - 1 && (
                  <AdBanner slot="learn-feed" className="sm:col-span-2 lg:col-span-3" />
                )}
              </Fragment>
            ))}
          </div>
          <Pagination
            className="mt-8 border-t border-border pt-6"
            page={current}
            pageSize={PAGE_SIZE}
            total={visible.length}
            itemLabel={visible.length === 1 ? "article" : "articles"}
            onChange={goTo}
          />
        </>
      )}
    </>
  );
}
