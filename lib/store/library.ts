import { create } from "zustand";
import { setBookmarkAction } from "@/app/actions/trackerAction";

// Saved Learn articles, kept on the backend with the patient's profile.
// Loaded with the patient area (see PortalData).

interface LibraryState {
  bookmarks: string[];
  load: (bookmarks: string[]) => void;
  /** Saves or un-saves an article. Resolves to an error message, or null when saved. */
  toggleBookmark: (slug: string) => Promise<string | null>;
}

export const useLibrary = create<LibraryState>()((set, get) => ({
  bookmarks: [],
  load: (bookmarks) => set({ bookmarks }),
  toggleBookmark: async (slug) => {
    const before = get().bookmarks;
    const save = !before.includes(slug);
    set({ bookmarks: save ? [slug, ...before] : before.filter((b) => b !== slug) });
    const result = await setBookmarkAction(slug, save);
    set({ bookmarks: result.data ?? before });
    return result.error ?? null;
  },
}));
