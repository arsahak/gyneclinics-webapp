import { ArrowRight } from "lucide-react";
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
import { NotificationBell } from "@/component/shared/notification-bell";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Home",
  description: "Your cycle at a glance, upcoming consultations and articles picked for you.",
  path: "/patient",
});

// The layout checks the session on the server, so this page is rendered per request.
export const instant = false;

export default async function PatientHome() {
  const [articles, doctors] = await Promise.all([getArticles(), getDoctors()]);
  const featured = articles.filter((a) => a.format !== "story").slice(0, 3);
  const recommended = doctors.filter((d) => d.recommended).slice(0, 2);

  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <Greeting />
        <NotificationBell
          href="/patient/notifications"
          className="mt-1 border border-border bg-surface shadow-(--shadow-soft) hover:border-primary/30 hover:bg-primary-soft hover:text-primary"
        />
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
