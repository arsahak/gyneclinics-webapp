import type { Metadata } from "next";
import { LearnBrowser } from "@/component/learn/learn-browser";
import { PageHeader } from "@/component/shared/page-header";
import { getArticles, getCategories } from "@/lib/services/content";

export const metadata: Metadata = { title: "Learn" };

// Rendered after the client-side session check in AppShell, so it can't be validated on the server.
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
