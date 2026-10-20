import type { Article, SubmittedStory } from "@/lib/types";

export function communityStorySlug(story: SubmittedStory) {
  return `community-${story.id}`;
}

/** Turns an approved community submission into the same display shape used by the Learn feed. */
export function storyToArticle(story: SubmittedStory): Article {
  const excerpt = story.body.length > 155 ? `${story.body.slice(0, 152).trimEnd()}…` : story.body;
  const words = story.body.trim().split(/\s+/).filter(Boolean).length;

  return {
    slug: communityStorySlug(story),
    title: story.title,
    excerpt,
    category: "Stories",
    format: "story",
    readMinutes: Math.max(1, Math.ceil(words / 200)),
    author: story.anonymous ? "Anonymous" : story.authorName || "Community member",
    authorRole: `Community story · ${story.category} · Approved by GyneClinics`,
    publishedAt: story.reviewedAt ?? story.submittedAt,
    cover: { from: "#765885", to: "#cc619d", icon: "MessageCircleHeart" },
    sections: [{ body: story.body }],
  };
}
