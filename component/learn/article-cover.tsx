import {
  Baby,
  BookOpenText,
  CalendarHeart,
  Flower2,
  HeartPulse,
  Leaf,
  MessageCircleHeart,
  Moon,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import type { Article } from "@/lib/types";
import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = {
  Baby,
  CalendarHeart,
  Flower2,
  HeartPulse,
  Leaf,
  MessageCircleHeart,
  Moon,
  Sparkles,
};

export function ArticleCover({ article, className, iconSize = "size-10" }: { article: Article; className?: string; iconSize?: string }) {
  const Icon = ICONS[article.cover.icon] ?? BookOpenText;
  return (
    <div
      className={cn("relative flex items-center justify-center overflow-hidden", className)}
      style={{ background: `linear-gradient(135deg, ${article.cover.from}, ${article.cover.to})` }}
    >
      <div aria-hidden className="absolute -right-8 -bottom-10 size-32 rounded-full bg-white/10" />
      <div aria-hidden className="absolute -top-6 -left-6 size-20 rounded-full bg-white/10" />
      <Icon className={cn("relative text-white/90", iconSize)} strokeWidth={1.5} />
    </div>
  );
}
