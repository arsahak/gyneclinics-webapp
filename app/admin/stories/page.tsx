import type { Metadata } from "next";
import { StoryModeration } from "@/component/admin/story-moderation";

export const metadata: Metadata = { title: "Story moderation" };

export default function AdminStoriesPage() {
  return <StoryModeration />;
}
