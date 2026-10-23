import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

/** Search engines may crawl the public pages; signed-in areas stay out. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/patient", "/doctor", "/onboarding", "/consent", "/api"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
