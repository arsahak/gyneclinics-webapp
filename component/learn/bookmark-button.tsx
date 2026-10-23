"use client";

import { Bookmark } from "lucide-react";
import { useState } from "react";
import { useLibrary } from "@/lib/store/library";
import { cn } from "@/lib/utils";

export function BookmarkButton({ slug, className, withLabel = false }: { slug: string; className?: string; withLabel?: boolean }) {
  const saved = useLibrary((s) => s.bookmarks.includes(slug));
  const toggle = useLibrary((s) => s.toggleBookmark);
  // Shown as the tooltip when saving didn't work (the button goes back as it was).
  const [error, setError] = useState<string | null>(null);
  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? "Remove bookmark" : "Save for later"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setError(null);
        void toggle(slug).then(setError);
      }}
      title={error ?? undefined}
      className={cn(
        "inline-flex items-center gap-2 rounded-full transition-colors",
        withLabel ? "h-10 border border-border px-4 text-sm font-medium" : "size-9 justify-center bg-surface/90 backdrop-blur",
        saved ? "text-accent" : "text-muted-foreground hover:text-foreground",
        className,
      )}
    >
      <Bookmark className={cn("size-4", saved && "fill-current")} />
      {withLabel && (saved ? "Saved" : "Save")}
    </button>
  );
}
