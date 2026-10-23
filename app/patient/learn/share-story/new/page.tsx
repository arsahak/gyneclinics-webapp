import type { Metadata } from "next";
import { StoryForm } from "@/component/learn/story-form";
import { PageHeader } from "@/component/shared/page-header";
import { getCategories } from "@/lib/services/content";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Share your story",
  description: "Share your experience to help other women. Every story is reviewed before it's published.",
  path: "/patient/learn/share-story/new",
});

// The layout checks the session on the server, so this page is rendered per request.
export const instant = false;

export default async function NewStoryPage() {
  const categories = await getCategories();
  return (
    <>
      <PageHeader
        backHref="/patient/learn/share-story"
        title="Share your story"
        description="Your experience could help another woman feel less alone."
      />
      <StoryForm categories={categories} />
    </>
  );
}
