import type { Metadata } from "next";
import { SavedList } from "@/component/learn/saved-list";
import { PageHeader } from "@/component/shared/page-header";
import { getArticles } from "@/lib/services/content";

export const metadata: Metadata = { title: "Saved articles" };

// Rendered after the client-side session check in AppShell, so it can't be validated on the server.
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
