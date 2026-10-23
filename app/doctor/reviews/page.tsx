import { format, parseISO } from "date-fns";
import { Star } from "lucide-react";
import type { Metadata } from "next";
import { Stars } from "@/component/doctors/rating";
import { EmptyState } from "@/component/shared/empty-state";
import { PageHeader } from "@/component/shared/page-header";
import { Card, CardBody } from "@/component/ui/card";
import { getDoctorReviews, getMyDoctor } from "@/lib/services/doctors";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Reviews",
  description: "What patients say about their consultations with you.",
  path: "/doctor/reviews",
});

// The layout checks the session on the server, so this page is rendered per request.
export const instant = false;

export default async function DoctorReviewsPage() {
  const doctor = await getMyDoctor();
  const { reviews } = doctor ? await getDoctorReviews(doctor.id) : { reviews: [] };
  const header = <PageHeader title="Reviews" description="What patients say about their consultations. Reviews are anonymous." />;

  if (!doctor) {
    return (
      <>
        {header}
        <p role="alert" className="rounded-2xl border border-border bg-surface p-6 text-sm text-muted-foreground">
          We couldn&apos;t load your reviews. Please try again in a moment.
        </p>
      </>
    );
  }

  // Stars from the published reviews loaded here (the latest 50).
  const byStars = [5, 4, 3, 2, 1].map((stars) => ({ stars, count: reviews.filter((r) => Math.round(r.rating) === stars).length }));
  const total = doctor.reviewCount || reviews.length;

  return (
    <>
      {header}
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <Card className="self-start">
          <CardBody>
            <p className="text-5xl font-semibold tracking-tight text-foreground">{total ? doctor.rating.toFixed(1) : "—"}</p>
            <Stars value={doctor.rating} size="size-5" />
            <p className="mt-1 text-sm text-muted-foreground">
              {total} review{total === 1 ? "" : "s"}
            </p>
            <ul className="mt-5 space-y-2">
              {byStars.map(({ stars, count }) => (
                <li key={stars} className="flex items-center gap-3 text-sm">
                  <span className="flex w-8 items-center gap-1 text-muted-foreground">
                    {stars} <Star className="size-3 fill-gold text-gold" />
                  </span>
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2">
                    <span className="block h-full rounded-full bg-gold" style={{ width: `${reviews.length ? (count / reviews.length) * 100 : 0}%` }} />
                  </span>
                  <span className="w-8 text-right text-muted-foreground tabular-nums">{count}</span>
                </li>
              ))}
            </ul>
            {total > reviews.length && <p className="mt-3 text-xs text-muted-foreground">From your latest {reviews.length} reviews.</p>}
          </CardBody>
        </Card>
        {reviews.length ? (
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
        ) : (
          <EmptyState icon={Star} title="No reviews yet" description="Patients can review you after a consultation. Their reviews will appear here." />
        )}
      </div>
    </>
  );
}
