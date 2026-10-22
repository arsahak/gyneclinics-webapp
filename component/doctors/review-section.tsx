"use client";

import { format, parseISO } from "date-fns";
import { CheckCircle2, Clock, MessageSquareText, Star } from "lucide-react";
import { useState, useTransition } from "react";
import { submitReviewAction } from "@/app/actions/reviewAction";
import { Button } from "@/component/ui/button";
import { Dialog } from "@/component/ui/dialog";
import { Field, Textarea } from "@/component/ui/field";
import { describeBlocked, scanForContactDetails } from "@/lib/chat-guard";
import type { MyReview } from "@/lib/services/doctors";
import type { Review } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Stars } from "./rating";

const MY_STATUS: Record<MyReview["status"], { label: string; hint: string }> = {
  published: { label: "Published", hint: "Other patients can see it." },
  held: { label: "Waiting for a check", hint: "We check 1 and 2 star reviews before they appear, usually within a day." },
  hidden: { label: "Not shown", hint: "Our team took it down because it didn't follow the review rules." },
};

export function ReviewSection({ doctorId, doctorName, reviews, mine }: { doctorId: string; doctorName: string; reviews: Review[]; mine: MyReview | null }) {
  const [open, setOpen] = useState(false);
  const [thanks, setThanks] = useState("");
  // Your own published review is already in the list; show it once, in "Your review".
  const others = mine ? reviews.filter((r) => r.id !== mine.id) : reviews;

  return (
    <section>
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="font-serif text-xl font-semibold text-foreground">Patient reviews</h2>
        {!mine && (
          <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
            <MessageSquareText /> Write a review
          </Button>
        )}
      </div>

      {thanks && (
        <p className="mb-3 flex items-start gap-2 rounded-2xl border border-success/30 bg-success/10 p-3 text-sm text-foreground" role="status">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" /> {thanks}
        </p>
      )}

      {mine && (
        <div className="mb-3 rounded-2xl border border-primary/30 bg-primary/5 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-primary">Your review</span>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              {mine.status === "published" ? <CheckCircle2 className="size-3.5 text-success" /> : <Clock className="size-3.5" />}
              {MY_STATUS[mine.status].label}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between gap-2">
            <Stars value={mine.rating} />
            <span className="text-xs text-muted-foreground">{format(parseISO(mine.date), "d MMM yyyy")}</span>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-foreground">{mine.text}</p>
          {mine.status !== "published" && <p className="mt-2 text-xs text-muted-foreground">{MY_STATUS[mine.status].hint}</p>}
        </div>
      )}

      {others.length === 0 && !mine ? (
        <p className="text-sm text-muted-foreground">No reviews yet.</p>
      ) : (
        <ul className="space-y-3">
          {others.map((review) => (
            <li key={review.id} className="rounded-2xl border border-border bg-surface p-4">
              <div className="flex items-center justify-between gap-2">
                <Stars value={review.rating} />
                <span className="text-xs text-muted-foreground">{format(parseISO(review.date), "d MMM yyyy")}</span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-foreground">{review.text}</p>
              <p className="mt-2 text-xs text-muted-foreground">{review.author}</p>
            </li>
          ))}
        </ul>
      )}
      <ReviewDialog
        open={open}
        onClose={() => setOpen(false)}
        doctorId={doctorId}
        doctorName={doctorName}
        onSent={(message) => {
          setOpen(false);
          setThanks(message);
        }}
      />
    </section>
  );
}

function ReviewDialog({
  open,
  onClose,
  doctorId,
  doctorName,
  onSent,
}: {
  open: boolean;
  onClose: () => void;
  doctorId: string;
  doctorName: string;
  onSent: (message: string) => void;
}) {
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const blocked = scanForContactDetails(text);
  const valid = rating > 0 && text.trim().length >= 10 && blocked.length === 0;

  const submit = () =>
    startTransition(async () => {
      setError("");
      const result = await submitReviewAction({ doctorId, rating, text });
      if (result.error) {
        setError(result.error);
        return;
      }
      setRating(0);
      setText("");
      onSent(result.message ?? "Thank you for your review.");
    });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={`Review ${doctorName}`}
      description="Reviews are anonymous: others see “Verified patient”. Please don't include personal details."
    >
      <div className="space-y-5">
        <div className="flex justify-center gap-2" role="radiogroup" aria-label="Rating">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" role="radio" aria-checked={rating === n} aria-label={`${n} star${n > 1 ? "s" : ""}`} onClick={() => setRating(n)}>
              <Star className={cn("size-9 transition-colors", n <= rating ? "fill-gold text-gold" : "text-border hover:text-gold/50")} />
            </button>
          ))}
        </div>
        <Field label="Your review" htmlFor="review" error={blocked.length ? describeBlocked(blocked) : undefined}>
          <Textarea id="review" value={text} maxLength={1000} onChange={(e) => setText(e.target.value)} placeholder="How was your experience? (at least 10 characters)" />
        </Field>
        {error && (
          <p className="rounded-xl border border-danger/30 bg-danger/10 p-3 text-sm text-danger" role="alert">
            {error}
          </p>
        )}
        <Button className="w-full" disabled={!valid || pending} onClick={submit}>
          {pending ? "Sending…" : "Submit review"}
        </Button>
      </div>
    </Dialog>
  );
}
