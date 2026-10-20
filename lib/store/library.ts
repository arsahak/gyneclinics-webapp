import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { StoryStatus, SubmittedStory } from "@/lib/types";
import { uid } from "@/lib/utils";

interface LibraryState {
  bookmarks: string[];
  stories: SubmittedStory[];
  toggleBookmark: (slug: string) => void;
  submitStory: (story: Omit<SubmittedStory, "id" | "submittedAt" | "status">) => void;
  reviewStory: (id: string, status: Extract<StoryStatus, "approved" | "rejected">) => void;
}

export const useLibrary = create<LibraryState>()(
  persist(
    (set) => ({
      bookmarks: ["understanding-your-fertile-window"],
      stories: [],
      toggleBookmark: (slug) =>
        set((s) => ({
          bookmarks: s.bookmarks.includes(slug)
            ? s.bookmarks.filter((b) => b !== slug)
            : [slug, ...s.bookmarks],
        })),
      submitStory: (story) =>
        set((s) => ({
          stories: [
            { ...story, id: uid("s"), submittedAt: new Date().toISOString(), status: "pending" },
            ...s.stories,
          ],
        })),
      reviewStory: (id, status) =>
        set((s) => ({
          stories: s.stories.map((story) =>
            story.id === id ? { ...story, status, reviewedAt: new Date().toISOString() } : story,
          ),
        })),
    }),
    {
      name: "gc-library",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    },
  ),
);
