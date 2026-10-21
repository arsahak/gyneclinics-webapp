"use client";

import { CalendarClock } from "lucide-react";
import { summarizeWeek } from "@/lib/availability";
import { useDoctorSchedule } from "@/lib/store/availability";
import type { Doctor } from "@/lib/types";

/** The doctor's weekly consultation hours, as they've set them in the doctor portal. */
export function ConsultationHours({ doctor }: { doctor: Doctor }) {
  const schedule = useDoctorSchedule(doctor.id, doctor.availability, doctor.schedule);
  const rows = summarizeWeek(schedule);
  return (
    <section>
      <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <CalendarClock className="size-4 text-primary" /> Consultation hours
      </h3>
      {rows.length ? (
        <dl className="mt-3 space-y-1.5 text-sm">
          {rows.map((row) => (
            <div key={row.days} className="flex gap-4">
              <dt className="w-20 shrink-0 font-medium text-foreground">{row.days}</dt>
              <dd className="text-muted-foreground tabular-nums">{row.hours}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="mt-2 text-sm text-muted-foreground">No regular hours set right now.</p>
      )}
      <p className="mt-2 text-xs text-muted-foreground">
        {schedule.slotMinutes}-minute consultations{schedule.instantChat ? " · instant chat when online" : ""}
      </p>
    </section>
  );
}
