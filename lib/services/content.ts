import { articles, categories } from "@/lib/mock/articles";
import type { Article, ArticleCategory } from "@/lib/types";

// Mock-backed for now. Replace the bodies with API calls when the backend is ready.

export async function getArticles(): Promise<Article[]> {
  return [...articles].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export async function getArticle(slug: string): Promise<Article | undefined> {
  return articles.find((article) => article.slug === slug);
}

export async function getCategories(): Promise<ArticleCategory[]> {
  return categories;
}

export function listArticleSlugs() {
  return articles.map((article) => article.slug);
}
