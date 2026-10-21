import { format, parseISO } from "date-fns";
import { Star } from "lucide-react";
import type { Metadata } from "next";
import { Stars } from "@/component/doctors/rating";
import { PageHeader } from "@/component/shared/page-header";
import { Card, CardBody } from "@/component/ui/card";
import { getDemoDoctor, getDemoDoctorReviews } from "@/lib/services/doctors";

export const metadata: Metadata = { title: "Reviews" };

// The layout checks the session on the server, so this page is rendered per request.
export const instant = false;


export default async function DoctorReviewsPage() {
  const [doctor, reviews] = await Promise.all([getDemoDoctor(), getDemoDoctorReviews()]);
  // Distribution scaled to the doctor's total review count for the demo.
  const shares = [0.86, 0.1, 0.03, 0.01, 0];
  const total = doctor?.reviewCount ?? reviews.length;

  return (
    <>
      <PageHeader title="Reviews" description="What patients say about their consultations. Reviews are anonymous." />
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <Card className="self-start">
          <CardBody>
            <p className="text-5xl font-semibold tracking-tight text-foreground">{doctor?.rating.toFixed(1)}</p>
            <Stars value={doctor?.rating ?? 0} size="size-5" />
            <p className="mt-1 text-sm text-muted-foreground">{total} reviews</p>
            <ul className="mt-5 space-y-2">
              {shares.map((share, i) => {
                const stars = 5 - i;
                const count = Math.round(total * share);
                return (
                  <li key={stars} className="flex items-center gap-3 text-sm">
                    <span className="flex w-8 items-center gap-1 text-muted-foreground">
                      {stars} <Star className="size-3 fill-gold text-gold" />
                    </span>
                    <span className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2">
                      <span className="block h-full rounded-full bg-gold" style={{ width: `${share * 100}%` }} />
                    </span>
                    <span className="w-8 text-right text-muted-foreground tabular-nums">{count}</span>
                  </li>
                );
              })}
            </ul>
          </CardBody>
        </Card>
        <ul className="space-y-3">
          {reviews.map((review) => (
            <li key={review.id}>
              <Card className="p-5">
                <div className="flex items-center justify-between gap-2">
                  <Stars value={review.rating} />
                  <span className="text-xs text-muted-foreground">{format(parseISO(review.date), "d MMM yyyy")}</span>
                </div>
                <p className="mt-2 leading-relaxed text-foreground">{review.text}</p>
                <p className="mt-2 text-xs text-muted-foreground">{review.author}</p>
              </Card>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
