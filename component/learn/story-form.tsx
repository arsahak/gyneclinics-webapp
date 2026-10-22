"use client";

import Image from "next/image";
import { CheckCircle2, ImagePlus, Loader2, PenLine, X } from "lucide-react";
import { useEffect, useMemo, useState, useTransition } from "react";
import { submitStoryAction } from "@/app/actions/storyAction";
import { Disclaimer } from "@/component/shared/disclaimer";
import { Button, ButtonLink } from "@/component/ui/button";
import { Card } from "@/component/ui/card";
import { Checkbox, Field, Input, Select, Textarea } from "@/component/ui/field";
import { describeBlocked, scanForContactDetails } from "@/lib/chat-guard";
import type { ArticleCategory } from "@/lib/types";


const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

/** Share a story (sent to our team for review) and see your earlier ones. */
export function StoryForm({ categories }: { categories: ArticleCategory[] }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState<ArticleCategory>(categories[0]);
  const [anonymous, setAnonymous] = useState(true);
  const [image, setImage] = useState<File | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [sending, startSending] = useTransition();

  // Local preview of the chosen photo, freed when it changes.
  const imagePreview = useMemo(() => (image ? URL.createObjectURL(image) : null), [image]);
  useEffect(() => () => void (imagePreview && URL.revokeObjectURL(imagePreview)), [imagePreview]);

  const blocked = scanForContactDetails(`${title} ${body}`);
  const valid = title.trim().length >= 5 && body.trim().length > 0 && blocked.length === 0 && !imageError && !sending;

  function chooseImage(file: File | undefined) {
    setImageError(null);
    if (!file) return setImage(null);
    if (!file.type.match(/^image\/(jpeg|png|webp)$/)) {
      setImage(null);
      return setImageError("Choose a JPG, PNG or WebP image.");
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setImage(null);
      return setImageError("Choose an image smaller than 5 MB.");
    }
    setImage(file);
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
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <ButtonLink href="/patient/learn/share-story">See community stories</ButtonLink>
              <Button variant="outline" onClick={() => setDone(false)}>
                Write another
              </Button>
            </div>
          </div>
        ) : (
          <form
            className="space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              if (!valid) return;
              setError(null);
              const data = new FormData();
              data.append("title", title.trim());
              data.append("body", body.trim());
              data.append("topic", category);
              data.append("anonymous", String(anonymous));
              if (image) data.append("image", image);
              startSending(async () => {
                const result = await submitStoryAction(data);
                if (result.error) return setError(result.error);
                setTitle("");
                setBody("");
                setImage(null);
                setDone(true);
              });
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
              error={blocked.length ? describeBlocked(blocked) : undefined}
            >
              <Textarea id="body" value={body} onChange={(e) => setBody(e.target.value)} className="min-h-56" placeholder="Share your experience in your own words…" />
            </Field>
            <Field
              label={<span className="inline-flex items-center gap-1.5"><ImagePlus className="size-4 text-primary" /> Add a photo (optional)</span>}
              htmlFor="story-image"
              hint="JPG, PNG or WebP · maximum 5 MB"
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
            {imagePreview && (
              <div className="relative overflow-hidden rounded-2xl border border-border bg-surface-2">
                <Image src={imagePreview} alt="Selected story image" width={960} height={640} unoptimized className="max-h-64 w-full object-cover" />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setImage(null)}
                  className="absolute top-3 right-3 bg-surface/90"
                >
                  <X /> Remove
                </Button>
              </div>
            )}
            <Checkbox checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} label="Publish anonymously" description="Your name won't be shown with your story." />
            {error && (
              <p role="alert" className="rounded-2xl bg-danger-soft p-3 text-sm text-danger">
                {error}
              </p>
            )}
            <Button type="submit" variant="secondary" size="lg" className="w-full" disabled={!valid}>
              {sending ? (
                <>
                  <Loader2 className="animate-spin" /> Sending…
                </>
              ) : (
                <>
                  <PenLine /> Submit for review
                </>
              )}
            </Button>
          </form>
        )}
      </Card>

      <div className="space-y-4">
        <Disclaimer>
          Stories and photos are reviewed by our team before publishing. Please don&apos;t include names, contact details or anything that could identify you or others.
        </Disclaimer>
        <Card className="p-5 text-sm">
          <h2 className="font-semibold text-foreground">Tips for a helpful story</h2>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-muted-foreground">
            <li>Share what happened and how you felt.</li>
            <li>Say what helped you, or what you wish you&apos;d known.</li>
            <li>Leave out names, places and contact details.</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
