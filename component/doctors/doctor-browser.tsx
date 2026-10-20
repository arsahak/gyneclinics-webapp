"use client";

import { Search, SlidersHorizontal, Stethoscope } from "lucide-react";
import { Fragment, useMemo, useState } from "react";
import { AdBanner } from "@/component/shared/ad-banner";
import { EmptyState } from "@/component/shared/empty-state";
import { Button } from "@/component/ui/button";
import { Input, Select } from "@/component/ui/field";
import { FEED_AD_FREQUENCY } from "@/lib/ads";
import type { Availability, Doctor } from "@/lib/types";
import { DoctorCard } from "./doctor-card";

type Sort = "recommended" | "rating" | "experience" | "fee";
const AVAILABILITY_RANK: Record<Availability, number> = { online: 0, today: 1, this_week: 2, away: 3 };

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

      {visible.length === 0 ? (
        <EmptyState icon={Stethoscope} title="No specialists match" description="Try removing a filter to see more doctors." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((doctor, i) => (
            <Fragment key={doctor.id}>
              <DoctorCard doctor={doctor} />
              {(i + 1) % FEED_AD_FREQUENCY === 0 && i < visible.length - 1 && (
                <AdBanner slot="doctors-feed" className="md:col-span-2 xl:col-span-3" />
              )}
            </Fragment>
          ))}
        </div>
      )}
    </>
  );
}
