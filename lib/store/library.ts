import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

// Saved articles, kept in the browser. (Community stories live on the backend.)

interface LibraryState {
  bookmarks: string[];
  toggleBookmark: (slug: string) => void;
}

export const useLibrary = create<LibraryState>()(
  persist(
    (set) => ({
      bookmarks: ["understanding-your-fertile-window"],
      toggleBookmark: (slug) =>
        set((s) => ({
          bookmarks: s.bookmarks.includes(slug) ? s.bookmarks.filter((b) => b !== slug) : [slug, ...s.bookmarks],
        })),
    }),
    {
      name: "gc-library",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    },
  ),
);
