import { ArrowRight, Bell } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { NextConsultation } from "@/component/booking/next-consultation";
import { CycleOverview, Greeting, ReminderCard } from "@/component/home/cycle-overview";
import { QuickLinks } from "@/component/home/quick-links";
import { DoctorCard } from "@/component/doctors/doctor-card";
import { ArticleCard } from "@/component/learn/article-card";
import { AdBanner } from "@/component/shared/ad-banner";
import { getArticles } from "@/lib/services/content";
import { getDoctors } from "@/lib/services/doctors";

export const metadata: Metadata = { title: "Home" };

// Rendered after the client-side session check in AppShell, so it can't be validated on the server.
export const instant = false;

export default async function PatientHome() {
  const [articles, doctors] = await Promise.all([getArticles(), getDoctors()]);
  const featured = articles.filter((a) => a.format !== "story").slice(0, 3);
  const recommended = doctors.filter((d) => d.recommended).slice(0, 2);

  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <Greeting />
        <Link
          href="/patient/profile#reminders"
          aria-label="Notifications and reminders"
          title="Notifications and reminders"
          className="relative mt-1 inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-muted-foreground shadow-(--shadow-soft) transition-colors hover:border-primary/30 hover:bg-primary-soft hover:text-primary"
        >
          <Bell className="size-5" />
          <span aria-hidden className="absolute top-2.5 right-2.5 size-1.5 rounded-full bg-accent ring-2 ring-surface" />
        </Link>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <div className="min-w-0 space-y-6">
          <CycleOverview />
          <QuickLinks />
        </div>
        <div className="space-y-6">
          <NextConsultation doctors={doctors} />
          <ReminderCard />
          <AdBanner slot="home" />
        </div>
      </div>

      <Section title="For you to read" href="/patient/learn">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>
      </Section>

      <Section title="Recommended specialists" href="/patient/doctors">
        <div className="grid gap-4 md:grid-cols-2">
          {recommended.map((doctor) => (
            <DoctorCard key={doctor.id} doctor={doctor} compact />
          ))}
        </div>
      </Section>
    </>
  );
}

function Section({ title, href, children }: { title: string; href: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-serif text-xl font-semibold text-foreground">{title}</h2>
        <Link href={href} className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
          See all <ArrowRight className="size-4" />
        </Link>
      </div>
      {children}
    </section>
  );
}
