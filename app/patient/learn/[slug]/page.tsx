import { format, parseISO } from "date-fns";
import { ArrowLeft, Clock, Stethoscope } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/component/learn/article-card";
import { ArticleCover } from "@/component/learn/article-cover";
import { BookmarkButton } from "@/component/learn/bookmark-button";
import { CommunityStoryArticle } from "@/component/learn/community-story-article";
import { AdBanner } from "@/component/shared/ad-banner";
import { Disclaimer } from "@/component/shared/disclaimer";
import { Badge } from "@/component/ui/badge";
import { ButtonLink } from "@/component/ui/button";
import { getArticle, getArticles, listArticleSlugs } from "@/lib/services/content";

export function generateStaticParams() {
  return listArticleSlugs().map((slug) => ({ slug }));
}

export const metadata: Metadata = { title: "Article" };

// Rendered after the client-side session check in AppShell, so it can't be validated on the server.
export const instant = false;

export default async function ArticlePage({ params }: PageProps<"/patient/learn/[slug]">) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) {
    // Community stories are stored in the browser until a real content API is connected.
    if (slug.startsWith("community-")) return <CommunityStoryArticle slug={slug} />;
    notFound();
  }

  const others = (await getArticles()).filter((a) => a.slug !== slug);
  const related = [
    ...others.filter((a) => a.category === article.category),
    ...others.filter((a) => a.category !== article.category),
  ].slice(0, 2);

  return (
    <article className="mx-auto max-w-3xl">
      <Link href="/patient/learn" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Back to Learn
      </Link>
      <ArticleCover article={article} className="h-48 rounded-3xl sm:h-64" iconSize="size-16" />

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <Badge tone={article.format === "story" ? "secondary" : "primary"}>{article.category}</Badge>
        {article.sponsor && <Badge tone="gold">Sponsored by {article.sponsor}</Badge>}
        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="size-3.5" /> {article.readMinutes} min read
        </span>
      </div>
      <h1 className="mt-3 font-serif text-3xl leading-tight font-semibold tracking-tight text-foreground sm:text-4xl">
        {article.title}
      </h1>
      <div className="mt-4 flex items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <p className="text-sm font-medium text-foreground">{article.author}</p>
          <p className="text-xs text-muted-foreground">
            {article.authorRole} · {format(parseISO(article.publishedAt), "d MMMM yyyy")}
          </p>
        </div>
        <BookmarkButton slug={article.slug} withLabel />
      </div>

      <div className="mt-8 space-y-6 text-[17px] leading-relaxed text-foreground/90">
        <p className="text-lg text-muted-foreground">{article.excerpt}</p>
        {article.sections.map((section, i) => (
          <section key={i}>
            {section.heading && <h2 className="mb-2 font-serif text-2xl font-semibold text-foreground">{section.heading}</h2>}
            <p>{section.body}</p>
          </section>
        ))}
      </div>

      <Disclaimer className="mt-10">
        This content is for general information only and isn&apos;t a substitute for professional medical advice.
      </Disclaimer>

      <div className="mt-6 flex flex-col items-start gap-4 rounded-3xl bg-primary-soft p-6 sm:flex-row sm:items-center">
        <Stethoscope className="size-8 shrink-0 text-primary" />
        <div className="flex-1">
          <p className="font-semibold text-foreground">Have questions about this?</p>
          <p className="text-sm text-muted-foreground">Chat privately with a verified specialist.</p>
        </div>
        <ButtonLink href="/patient/doctors">Find a specialist</ButtonLink>
      </div>

      <AdBanner slot="article-end" className="mt-6" />

      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 font-serif text-xl font-semibold text-foreground">Keep reading</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {related.map((a) => (
              <ArticleCard key={a.slug} article={a} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
