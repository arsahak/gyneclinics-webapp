import "server-only";
import { api } from "@/lib/api";
import { ARTICLE_CATEGORIES, coverFor, isArticleCategory } from "@/lib/learn";
import { getStoryArticle, getStoryArticles } from "@/lib/services/stories";
import type { Article, ArticleCategory } from "@/lib/types";

// Learn articles from the backend (GET /content/feed): published content
// written in the admin dashboard. Server only, with the signed-in user's token.

interface BackendArticle {
  _id: string;
  slug: string;
  title: string;
  excerpt?: string;
  body?: string;
  format: "guide" | "blog" | "story" | "image";
  imageUrl?: string;
  category: string;
  readTimeMinutes?: number;
  sponsored?: boolean;
  sponsorName?: string;
  publishedAt?: string;
  authorName?: string;
  authorRole?: string;
}

function toArticle(item: BackendArticle): Article {
  const category: ArticleCategory = isArticleCategory(item.category) ? item.category : "Wellness";
  return {
    slug: item.slug,
    title: item.title,
    excerpt: item.excerpt ?? "",
    category,
    format: item.format,
    readMinutes: item.readTimeMinutes ?? 1,
    author: item.authorName || "GyneClinics Editorial Team",
    authorRole: item.authorRole ?? "",
    publishedAt: item.publishedAt ?? new Date().toISOString(),
    cover: coverFor(category, item.slug),
    image: item.imageUrl || undefined,
    sponsor: item.sponsored ? item.sponsorName || "a partner" : undefined,
    sections: [],
    html: item.body,
  };
}

/** Published articles and approved community stories, newest first. */
export async function getArticles(): Promise<Article[]> {
  const [articles, stories] = await Promise.all([getContentArticles(), getStoryArticles()]);
  return [...articles, ...stories].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

/** Published content. The feed comes 100 at a time, so this reads every page. */
async function getContentArticles(): Promise<Article[]> {
  const items: BackendArticle[] = [];
  for (let page = 1; page <= 20; page += 1) {
    const result = await api<{ contents: BackendArticle[]; pagination: { pages: number } }>(
      `/content/feed?limit=100&page=${page}`,
    );
    if (!result.ok || !result.data) {
      console.error("Could not load Learn articles:", result.message);
      break;
    }
    items.push(...result.data.contents);
    if (page >= result.data.pagination.pages) break;
  }
  // Items without a slug can't be linked to; skip them rather than break the page.
  return items.filter((item) => item.slug).map(toArticle);
}

/** One published article (or approved story, "community-<id>") with its full text, or undefined. */
export async function getArticle(slug: string): Promise<Article | undefined> {
  if (!/^[a-z0-9-]{1,100}$/i.test(slug)) return undefined;
  if (slug.startsWith("community-")) return getStoryArticle(slug);
  const result = await api<BackendArticle>(`/content/feed/${slug}`);
  return result.ok && result.data ? toArticle(result.data) : undefined;
}

export async function getCategories(): Promise<ArticleCategory[]> {
  return ARTICLE_CATEGORIES;
}
