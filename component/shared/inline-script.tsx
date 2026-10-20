"use client";

/**
 * A script that runs during HTML parsing (before first paint) but is inert when React
 * renders on the client, which avoids React's "script tag" warning.
 */
export function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
