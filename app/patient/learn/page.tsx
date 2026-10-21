import type { Metadata } from "next";
import { LearnBrowser } from "@/component/learn/learn-browser";
import { PageHeader } from "@/component/shared/page-header";
import { getArticles, getCategories } from "@/lib/services/content";

export const metadata: Metadata = { title: "Learn" };

// The layout checks the session on the server, so this page is rendered per request.
export const instant = false;

export default async function LearnPage() {
  const [articles, categories] = await Promise.all([getArticles(), getCategories()]);
  return (
    <>
      <PageHeader
        eyebrow="Learn"
        title="Trusted reading, real stories"
        description="Articles reviewed by specialists, and stories shared by women in our community."
      />
      <LearnBrowser articles={articles} categories={categories} />
    </>
  );
}
