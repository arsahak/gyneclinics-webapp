"use client";

import { format, parseISO } from "date-fns";
import { MessageSquareText, Star } from "lucide-react";
import { useState } from "react";
import { Button } from "@/component/ui/button";
import { Dialog } from "@/component/ui/dialog";
import { Field, Textarea } from "@/component/ui/field";
import { describeBlocked, scanForContactDetails } from "@/lib/chat-guard";
import { useChat } from "@/lib/store/chat";
import type { Review } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Stars } from "./rating";

export function ReviewSection({ doctorId, doctorName, reviews }: { doctorId: string; doctorName: string; reviews: Review[] }) {
  const myReviews = useChat((s) => s.myReviews);
  const [open, setOpen] = useState(false);
  const all = [...myReviews.filter((r) => r.doctorId === doctorId), ...reviews];

  return (
    <section>
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="font-serif text-xl font-semibold text-foreground">Patient reviews</h2>
        <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
          <MessageSquareText /> Write a review
        </Button>
      </div>
      {all.length === 0 ? (
        <p className="text-sm text-muted-foreground">No reviews yet.</p>
      ) : (
        <ul className="space-y-3">
          {all.map((review) => (
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
      <ReviewDialog open={open} onClose={() => setOpen(false)} doctorId={doctorId} doctorName={doctorName} />
    </section>
  );
}

function ReviewDialog({ open, onClose, doctorId, doctorName }: { open: boolean; onClose: () => void; doctorId: string; doctorName: string }) {
  const addReview = useChat((s) => s.addReview);
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const blocked = scanForContactDetails(text);
  const valid = rating > 0 && text.trim().length >= 10 && blocked.length === 0;

  return (
    <Dialog open={open} onClose={onClose} title={`Review ${doctorName}`} description="Reviews are anonymous. Please don't include personal details.">
      <div className="space-y-5">
        <div className="flex justify-center gap-2" role="radiogroup" aria-label="Rating">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" role="radio" aria-checked={rating === n} aria-label={`${n} star${n > 1 ? "s" : ""}`} onClick={() => setRating(n)}>
              <Star className={cn("size-9 transition-colors", n <= rating ? "fill-gold text-gold" : "text-border hover:text-gold/50")} />
            </button>
          ))}
        </div>
        <Field label="Your review" htmlFor="review" error={blocked.length ? describeBlocked(blocked) : undefined}>
          <Textarea id="review" value={text} onChange={(e) => setText(e.target.value)} placeholder="How was your experience?" />
        </Field>
        <Button
          className="w-full"
          disabled={!valid}
          onClick={() => {
            addReview({ doctorId, rating, text: text.trim() });
            setRating(0);
            setText("");
            onClose();
          }}
        >
          Submit review
        </Button>
      </div>
    </Dialog>
  );
}
