import type { Metadata } from "next";
import { SavedList } from "@/component/learn/saved-list";
import { PageHeader } from "@/component/shared/page-header";
import { getArticles } from "@/lib/services/content";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Saved articles",
  description: "Articles you've bookmarked to read later.",
  path: "/patient/learn/saved",
});

// The layout checks the session on the server, so this page is rendered per request.
export const instant = false;

export default async function SavedPage() {
  const articles = await getArticles();
  return (
    <>
      <PageHeader backHref="/patient/learn" title="Saved for later" description="Articles and stories you've bookmarked." />
      <SavedList articles={articles} />
    </>
  );
}
