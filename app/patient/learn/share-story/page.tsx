import type { Metadata } from "next";
import { StoryFeed } from "@/component/learn/story-feed";
import { PageHeader } from "@/component/shared/page-header";
import { getMyStories, getStoryFeed } from "@/lib/services/stories";

export const metadata: Metadata = { title: "Community stories" };

// The layout checks the session on the server, so this page is rendered per request.
export const instant = false;

/** Community stories as a feed, with a share box that opens the form. */
export default async function ShareStoryPage() {
  const [stories, myStories] = await Promise.all([getStoryFeed(), getMyStories()]);
  return (
    <>
      <PageHeader
        eyebrow="Learn"
        title="Community stories"
        description="Real experiences shared by women in our community, reviewed by our team."
      />
      <StoryFeed stories={stories} myStories={myStories} />
    </>
  );
}
