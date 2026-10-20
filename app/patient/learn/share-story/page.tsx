import type { Metadata } from "next";
import { StoryForm } from "@/component/learn/story-form";
import { PageHeader } from "@/component/shared/page-header";
import { getCategories } from "@/lib/services/content";

export const metadata: Metadata = { title: "Share your story" };

// Rendered after the client-side session check in AppShell, so it can't be validated on the server.
export const instant = false;

export default async function ShareStoryPage() {
  const categories = await getCategories();
  return (
    <>
      <PageHeader
        backHref="/patient/learn"
        title="Share your story"
        description="Your experience could help another woman feel less alone."
      />
      <StoryForm categories={categories} />
    </>
  );
}
