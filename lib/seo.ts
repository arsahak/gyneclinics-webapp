import type { Metadata } from "next";
import { APP_NAME, COMPANY_NAME } from "@/lib/brand";

// SEO helpers: one place for the site URL, the default description and the
// per-page title, description, canonical link and social card text.
// The share image is app/opengraph-image.png.

/** The public web address (share image, canonical links, sitemap). NEXT_PUBLIC_SITE_URL can override it. */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://app.gyneclinics.com";

/** The company's main title, used for the home page and as the default title. */
export const SITE_TITLE = `${APP_NAME} — Empowering and Redefining Women’s Health Care`;

export const SITE_DESCRIPTION =
  "Track your periods and fertile window, read trusted women's health guidance and chat privately with verified gynaecologists — on web, iPhone and Android.";

/**
 * The share image (app/opengraph-image.png). Listed on every page because a
 * page's own openGraph replaces the layout's, image included.
 */
export const OG_IMAGE = {
  url: "/opengraph-image.png",
  width: 2769,
  height: 1454,
  alt: `${APP_NAME} — women's health app for cycle tracking and private chats with verified gynaecologists`,
};

export const SITE_KEYWORDS = [
  "women's health app",
  "period tracker",
  "cycle tracker",
  "fertility window",
  "ovulation calculator",
  "online gynaecologist",
  "gynaecologist chat",
  "menopause support",
  "pregnancy care",
  APP_NAME,
  COMPANY_NAME,
];

/** Shortens text for a meta description (about 155 characters, on a word). */
export function clip(text: string, max = 155) {
  const clean = text.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).replace(/\s+\S*$/, "")}…`;
}

/**
 * Metadata for one page: title (the layout adds " · GyneX"), description,
 * canonical URL and matching Open Graph / X card text.
 */
export function pageMetadata({
  title,
  description,
  path,
  absoluteTitle = false,
  type = "website",
}: {
  title: string;
  description: string;
  /** Route path, e.g. "/privacy". */
  path: string;
  /** Use the title as is, without " · GyneX". */
  absoluteTitle?: boolean;
  type?: "website" | "article" | "profile";
}): Metadata {
  const fullTitle = absoluteTitle ? title : `${title} · ${APP_NAME}`;
  const text = clip(description);
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description: text,
    alternates: { canonical: path },
    openGraph: {
      type,
      url: path,
      siteName: APP_NAME,
      locale: "en_GB",
      title: fullTitle,
      description: text,
      images: [OG_IMAGE],
    },
    twitter: { card: "summary_large_image", title: fullTitle, description: text, images: [OG_IMAGE] },
  };
}

/** For signed-in and onboarding pages: keep them out of search results. */
export const PRIVATE_ROBOTS: Metadata["robots"] = { index: false, follow: false };
