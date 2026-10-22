import "server-only";
import { api } from "@/lib/api";
import { storyIdFromSlug, storyToArticle } from "@/lib/stories";
import type { Article, SubmittedStory } from "@/lib/types";

// Community stories from the backend. Server only, with the signed-in user's token.

/** Approved stories as Learn articles, newest first. */
export async function getStoryArticles(): Promise<Article[]> {
  const result = await api<{ stories: SubmittedStory[] }>("/stories/feed?limit=100");
  if (!result.ok || !result.data) {
    console.error("Could not load stories:", result.message);
    return [];
  }
  return result.data.stories.map(storyToArticle);
}

/** Approved stories as posts, newest first (for the Share story feed). */
export async function getStoryFeed(): Promise<SubmittedStory[]> {
  const result = await api<{ stories: SubmittedStory[] }>("/stories/feed?limit=100");
  return result.ok && result.data ? result.data.stories : [];
}

/** One approved story by its "community-<id>" slug. */
export async function getStoryArticle(slug: string): Promise<Article | undefined> {
  const id = storyIdFromSlug(slug);
  if (!id) return undefined;
  const result = await api<SubmittedStory>(`/stories/feed/${id}`);
  return result.ok && result.data ? storyToArticle(result.data) : undefined;
}

/** The signed-in patient's stories, with their review status. */
export async function getMyStories(): Promise<SubmittedStory[]> {
  const result = await api<SubmittedStory[]>("/stories/mine");
  return result.ok && result.data ? result.data : [];
}
