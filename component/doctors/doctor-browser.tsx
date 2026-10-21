"use client";

import { Search, SlidersHorizontal, Stethoscope } from "lucide-react";
import { Fragment, useMemo, useState } from "react";
import { AdBanner } from "@/component/shared/ad-banner";
import { EmptyState } from "@/component/shared/empty-state";
import { Button } from "@/component/ui/button";
import { Input, Select } from "@/component/ui/field";
import { FEED_AD_FREQUENCY } from "@/lib/ads";
import { type DoctorConsultation, useMyDoctorConsultations } from "@/lib/hooks";
import type { Availability, Doctor } from "@/lib/types";
import { DoctorCard } from "./doctor-card";

type Sort = "recommended" | "rating" | "experience" | "fee";
const AVAILABILITY_RANK: Record<Availability, number> = { online: 0, today: 1, this_week: 2, away: 3 };
/** "Your doctors" order: open consultations first, then the most recent. */
const STATE_RANK: Record<DoctorConsultation["state"], number> = { active: 0, upcoming: 1, follow_up: 2, closed: 3, refunded: 4 };

const initialFilters = {
  query: "",
  specialization: "all",
  availability: "any" as "any" | Availability,
  experience: 0,
  rating: 0,
  sort: "recommended" as Sort,
};

export function DoctorBrowser({ doctors }: { doctors: Doctor[] }) {
  const [filters, setFilters] = useState(initialFilters);
  const [showFilters, setShowFilters] = useState(false);
  const set = <K extends keyof typeof filters>(key: K, value: (typeof filters)[K]) => setFilters((f) => ({ ...f, [key]: value }));

  const specializations = useMemo(() => [...new Set(doctors.map((d) => d.specialization))].sort(), [doctors]);

  const visible = useMemo(() => {
    const q = filters.query.trim().toLowerCase();
    return doctors
      .filter((d) => !q || `${d.name} ${d.specialization} ${d.focusAreas.join(" ")}`.toLowerCase().includes(q))
      .filter((d) => filters.specialization === "all" || d.specialization === filters.specialization)
      .filter((d) => filters.availability === "any" || AVAILABILITY_RANK[d.availability] <= AVAILABILITY_RANK[filters.availability])
      .filter((d) => d.experienceYears >= filters.experience)
      .filter((d) => d.rating >= filters.rating)
      .sort((a, b) => {
        switch (filters.sort) {
          case "rating":
            return b.rating - a.rating || b.reviewCount - a.reviewCount;
          case "experience":
            return b.experienceYears - a.experienceYears;
          case "fee":
            return a.feeGBP - b.feeGBP;
          default:
            return Number(!!b.recommended) - Number(!!a.recommended) || AVAILABILITY_RANK[a.availability] - AVAILABILITY_RANK[b.availability] || b.rating - a.rating;
        }
      });
  }, [doctors, filters]);

  const active = JSON.stringify(filters) !== JSON.stringify(initialFilters);

  // Doctors the patient has booked, shown first ("Your doctors") unless a filter is on.
  const mine = useMyDoctorConsultations();
  const yourDoctors = active
    ? []
    : visible
        .filter((d) => mine.has(d.id))
        .sort((a, b) => {
          const x = mine.get(a.id)!;
          const y = mine.get(b.id)!;
          return STATE_RANK[x.state] - STATE_RANK[y.state] || y.startsAt.getTime() - x.startsAt.getTime();
        });
  const others = yourDoctors.length ? visible.filter((d) => !mine.has(d.id)) : visible;

  return (
    <>
      <div className="mb-4 flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by name or concern, e.g. PCOS" value={filters.query} onChange={(e) => set("query", e.target.value)} className="pl-10" />
        </div>
        <Button variant="outline" onClick={() => setShowFilters(!showFilters)} aria-expanded={showFilters} className="md:hidden">
          <SlidersHorizontal /> Filters
        </Button>
      </div>

      <div className={`${showFilters ? "grid" : "hidden"} mb-6 gap-3 sm:grid-cols-2 md:grid md:grid-cols-5`}>
        <Select aria-label="Specialisation" value={filters.specialization} onChange={(e) => set("specialization", e.target.value)}>
          <option value="all">All specialisations</option>
          {specializations.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </Select>
        <Select aria-label="Availability" value={filters.availability} onChange={(e) => set("availability", e.target.value as typeof filters.availability)}>
          <option value="any">Any availability</option>
          <option value="online">Online now</option>
          <option value="today">Available today</option>
          <option value="this_week">This week</option>
        </Select>
        <Select aria-label="Experience" value={filters.experience} onChange={(e) => set("experience", Number(e.target.value))}>
          <option value={0}>Any experience</option>
          <option value={5}>5+ years</option>
          <option value={10}>10+ years</option>
          <option value={15}>15+ years</option>
        </Select>
        <Select aria-label="Rating" value={filters.rating} onChange={(e) => set("rating", Number(e.target.value))}>
          <option value={0}>Any rating</option>
          <option value={4.5}>4.5 ★ and up</option>
          <option value={4.8}>4.8 ★ and up</option>
        </Select>
        <Select aria-label="Sort by" value={filters.sort} onChange={(e) => set("sort", e.target.value as Sort)}>
          <option value="recommended">Recommended</option>
          <option value="rating">Highest rated</option>
          <option value="experience">Most experienced</option>
          <option value="fee">Lowest fee</option>
        </Select>
      </div>

      <div className="mb-4 flex items-center justify-between text-sm text-muted-foreground">
        <span>{visible.length} specialist{visible.length === 1 ? "" : "s"}</span>
        {active && (
          <button type="button" className="font-medium text-primary hover:underline" onClick={() => setFilters(initialFilters)}>
            Clear filters
          </button>
        )}
      </div>

      {yourDoctors.length > 0 && (
        <section className="mb-8">
          <h2 className="font-serif text-xl font-semibold text-foreground">Your doctors</h2>
          <p className="mb-4 text-sm text-muted-foreground">Specialists you&apos;ve booked a consultation with.</p>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {yourDoctors.map((doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} consultation={mine.get(doctor.id)} />
            ))}
          </div>
          {others.length > 0 && <h2 className="mt-8 font-serif text-xl font-semibold text-foreground">All specialists</h2>}
        </section>
      )}

      {visible.length === 0 ? (
        <EmptyState icon={Stethoscope} title="No specialists match" description="Try removing a filter to see more doctors." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {others.map((doctor, i) => (
            <Fragment key={doctor.id}>
              <DoctorCard doctor={doctor} consultation={mine.get(doctor.id)} />
              {(i + 1) % FEED_AD_FREQUENCY === 0 && i < others.length - 1 && (
                <AdBanner slot="doctors-feed" className="md:col-span-2 xl:col-span-3" />
              )}
            </Fragment>
          ))}
        </div>
      )}
    </>
  );
}
