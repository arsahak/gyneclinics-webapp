"use client";

import { format, parseISO } from "date-fns";
import Image from "next/image";
import { CheckCircle2, Clock, ImagePlus, PenLine, X, XCircle } from "lucide-react";
import { useState } from "react";
import { Disclaimer } from "@/component/shared/disclaimer";
import { Badge } from "@/component/ui/badge";
import { Button } from "@/component/ui/button";
import { Card } from "@/component/ui/card";
import { Checkbox, Field, Input, Select, Textarea } from "@/component/ui/field";
import { describeBlocked, scanForContactDetails } from "@/lib/chat-guard";
import { useLibrary } from "@/lib/store/library";
import { useSession } from "@/lib/store/session";
import type { ArticleCategory, StoryStatus } from "@/lib/types";

const STATUS: Record<StoryStatus, { label: string; tone: "warning" | "success" | "danger"; icon: typeof Clock }> = {
  pending: { label: "Awaiting review", tone: "warning", icon: Clock },
  approved: { label: "Published", tone: "success", icon: CheckCircle2 },
  rejected: { label: "Not approved", tone: "danger", icon: XCircle },
};

const MAX_IMAGE_BYTES = 1_000_000;

export function StoryForm({ categories }: { categories: ArticleCategory[] }) {
  const { stories, submitStory } = useLibrary();
  const authorName = useSession((s) => s.patient?.fullName ?? "Community member");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState<ArticleCategory>(categories[0]);
  const [anonymous, setAnonymous] = useState(true);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const blocked = scanForContactDetails(`${title} ${body}`);
  const valid = title.trim().length >= 5 && body.trim().length >= 80 && blocked.length === 0 && !imageError;

  function chooseImage(file: File | undefined) {
    setImageError(null);
    if (!file) {
      setImageDataUrl(null);
      return;
    }
    if (!file.type.match(/^image\/(jpeg|png|webp)$/)) {
      setImageDataUrl(null);
      setImageError("Choose a JPG, PNG or WebP image.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setImageDataUrl(null);
      setImageError("Choose an image smaller than 1 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setImageDataUrl(typeof reader.result === "string" ? reader.result : null);
    reader.onerror = () => setImageError("We couldn't read that image. Please try another one.");
    reader.readAsDataURL(file);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <Card className="p-5 sm:p-6">
        {done ? (
          <div className="py-8 text-center">
            <span className="mx-auto inline-flex size-14 items-center justify-center rounded-full bg-success-soft text-success">
              <CheckCircle2 className="size-7" />
            </span>
            <h2 className="mt-4 font-serif text-2xl font-semibold text-foreground">Thank you for sharing</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
              Our team will review your story before it&apos;s published. We&apos;ll let you know once it&apos;s live.
            </p>
            <Button variant="outline" className="mt-6" onClick={() => setDone(false)}>
              Write another
            </Button>
          </div>
        ) : (
          <form
            className="space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              if (!valid) return;
              submitStory({ title: title.trim(), body: body.trim(), category, anonymous, authorName, imageDataUrl: imageDataUrl ?? undefined });
              setTitle("");
              setBody("");
              setImageDataUrl(null);
              setDone(true);
            }}
          >
            <Field label="Title" htmlFor="title">
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. What tracking taught me about my body" />
            </Field>
            <Field label="Topic" htmlFor="topic">
              <Select id="topic" value={category} onChange={(e) => setCategory(e.target.value as ArticleCategory)}>
                {categories.filter((c) => c !== "Stories").map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </Select>
            </Field>
            <Field
              label="Your story"
              htmlFor="body"
              hint={`${body.trim().length}/80 characters minimum`}
              error={blocked.length ? describeBlocked(blocked) : undefined}
            >
              <Textarea id="body" value={body} onChange={(e) => setBody(e.target.value)} className="min-h-56" placeholder="Share your experience in your own words…" />
            </Field>
            <Field
              label={<span className="inline-flex items-center gap-1.5"><ImagePlus className="size-4 text-primary" /> Add a photo (optional)</span>}
              htmlFor="story-image"
              hint="JPG, PNG or WebP · maximum 1 MB"
              error={imageError ?? undefined}
            >
              <Input
                id="story-image"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => chooseImage(e.target.files?.[0])}
                className="cursor-pointer py-2 file:mr-3 file:rounded-full file:border-0 file:bg-primary-soft file:px-3 file:py-1 file:text-xs file:font-medium file:text-primary"
              />
            </Field>
            {imageDataUrl && (
              <div className="relative overflow-hidden rounded-2xl border border-border bg-surface-2">
                <Image src={imageDataUrl} alt="Selected story image" width={960} height={640} unoptimized className="max-h-64 w-full object-cover" />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setImageDataUrl(null)}
                  className="absolute top-3 right-3 bg-surface/90"
                >
                  <X /> Remove
                </Button>
              </div>
            )}
            <Checkbox checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} label="Publish anonymously" description="Your name won't be shown with your story." />
            <Button type="submit" variant="secondary" size="lg" className="w-full" disabled={!valid}>
              <PenLine /> Submit for review
            </Button>
          </form>
        )}
      </Card>

      <div className="space-y-4">
        <Disclaimer>
          Stories and photos are reviewed by our team before publishing. Please don&apos;t include names, contact details or anything that could identify you or others.
        </Disclaimer>
        <Card className="p-5">
          <h2 className="font-semibold text-foreground">Your submissions</h2>
          {stories.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">You haven&apos;t shared a story yet.</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {stories.map((story) => {
                const s = STATUS[story.status];
                return (
                  <li key={story.id} className="rounded-2xl bg-surface-2 p-3">
                    <p className="line-clamp-1 text-sm font-medium text-foreground">{story.title}</p>
                    <div className="mt-1.5 flex items-center justify-between gap-2">
                      <Badge tone={s.tone}>
                        <s.icon /> {s.label}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{format(parseISO(story.submittedAt), "d MMM")}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
