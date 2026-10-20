import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { seedMessages } from "@/lib/mock/engagement";
import type { Message, Review, Role } from "@/lib/types";
import { uid } from "@/lib/utils";

interface ChatState {
  conversations: Record<string, Message[]>;
  myReviews: Review[];
  send: (conversationId: string, from: Role, text: string) => void;
  addReview: (review: Omit<Review, "id" | "date" | "author">) => void;
}

export const useChat = create<ChatState>()(
  persist(
    (set) => ({
      conversations: seedMessages,
      myReviews: [],
      send: (conversationId, from, text) =>
        set((s) => ({
          conversations: {
            ...s.conversations,
            [conversationId]: [
              ...(s.conversations[conversationId] ?? []),
              { id: uid("m"), from, text, at: new Date().toISOString() },
            ],
          },
        })),
      addReview: (review) =>
        set((s) => ({
          myReviews: [
            {
              ...review,
              id: uid("r"),
              author: "You",
              date: new Date().toISOString().slice(0, 10),
            },
            ...s.myReviews,
          ],
        })),
    }),
    {
      name: "gc-chat",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    },
  ),
);
