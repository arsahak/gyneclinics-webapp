import { addDays, addMinutes, format, getDay, isBefore, setHours, setMinutes, startOfDay } from "date-fns";
import type { Availability } from "@/lib/types";

// Doctor-managed consultation hours. Each doctor sets weekly time ranges, slot length,
// how far ahead patients can book, minimum notice and days off. Patient booking slots
// are generated from this schedule.
//
// Times are treated as the viewer's local time in this UI-only build; the backend should
// store the doctor's time zone and convert slots for each patient.

export interface TimeRange {
  start: string; // "HH:mm"
  end: string; // "HH:mm"
}

export interface DoctorSchedule {
  /** Index 0 = Monday … 6 = Sunday. An empty list means the doctor is off that day. */
  weekly: TimeRange[][];
  slotMinutes: number;
  bookingWindowDays: number;
  minNoticeHours: number;
  /** Accept "Chat now" requests while online, outside of booked slots. */
  instantChat: boolean;
  /** Days off, as yyyy-MM-dd. */
  timeOff: string[];
  timezone: string;
}

export const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
export const WEEKDAYS_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
export const SLOT_LENGTHS = [15, 20, 30, 45, 60];
export const BOOKING_WINDOWS = [7, 14, 30];
export const MIN_NOTICE = [1, 2, 4, 12, 24];

/** Selectable times in 30-minute steps from 06:00 to 23:00. */
export const TIME_OPTIONS = Array.from({ length: 35 }, (_, i) => {
  const minutes = 6 * 60 + i * 30;
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
});

export const toMinutes = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

const range = (start: string, end: string): TimeRange => ({ start, end });

function hash(text: string) {
  let h = 0;
  for (const char of text) h = (h * 31 + char.charCodeAt(0)) >>> 0;
  return h;
}

/** Sensible starting schedule for a doctor, varied a little per doctor for the mock data. */
export function defaultScheduleFor(doctorId: string, availability: Availability): DoctorSchedule {
  const variant = hash(doctorId) % 3;
  const weekday = [
    [range("09:00", "13:00"), range("14:00", "17:30")],
    [range("10:00", "14:00"), range("16:00", "19:00")],
    [range("08:30", "12:30"), range("13:30", "16:30")],
  ][variant];
  const weekly: TimeRange[][] = [0, 1, 2, 3, 4].map(() => weekday.map((r) => ({ ...r })));
  weekly.push(variant === 1 ? [range("10:00", "13:00")] : []); // Saturday
  weekly.push([]); // Sunday
  if (availability === "this_week") weekly[0] = [];
  return {
    weekly,
    slotMinutes: 30,
    bookingWindowDays: availability === "away" ? 14 : 7,
    minNoticeHours: 1,
    instantChat: availability !== "away",
    timeOff: [],
    timezone: "Europe/London",
  };
}

/** Returns an error message for a day's ranges, or null if they're valid. */
export function validateDay(ranges: TimeRange[]): string | null {
  const sorted = [...ranges].sort((a, b) => toMinutes(a.start) - toMinutes(b.start));
  for (let i = 0; i < sorted.length; i++) {
    if (toMinutes(sorted[i].end) <= toMinutes(sorted[i].start)) return "End time must be after start time.";
    if (i > 0 && toMinutes(sorted[i].start) < toMinutes(sorted[i - 1].end)) return "Time ranges overlap.";
  }
  return null;
}

export function weeklyHours(schedule: DoctorSchedule) {
  const minutes = schedule.weekly.flat().reduce((sum, r) => sum + Math.max(0, toMinutes(r.end) - toMinutes(r.start)), 0);
  return Math.round((minutes / 60) * 10) / 10;
}

/** Monday-first weekday index for a date. */
export const weekdayIndex = (date: Date) => (getDay(date) + 6) % 7;

export interface Slot {
  start: Date;
  available: boolean;
}

export interface ScheduleDay {
  date: Date;
  slots: Slot[];
  /** Why there are no slots: the doctor doesn't work that day, or took it off. */
  closed?: "off" | "time-off";
}

// Deterministic "booked by someone else" pattern so mock slots look realistic.
function takenByOthers(doctorId: string, key: string) {
  return hash(doctorId + key) % 4 === 0;
}

/** Bookable slots generated from a doctor's schedule. */
export function slotsFor(doctorId: string, schedule: DoctorSchedule, now: Date, bookedStarts: string[] = []): ScheduleDay[] {
  const earliest = addMinutes(now, schedule.minNoticeHours * 60);
  const booked = new Set(bookedStarts.map((s) => format(new Date(s), "yyyy-MM-dd'T'HH:mm")));
  const days: ScheduleDay[] = [];

  for (let d = 0; d < schedule.bookingWindowDays; d++) {
    const date = addDays(startOfDay(now), d);
    if (schedule.timeOff.includes(format(date, "yyyy-MM-dd"))) {
      days.push({ date, slots: [], closed: "time-off" });
      continue;
    }
    const ranges = schedule.weekly[weekdayIndex(date)] ?? [];
    if (!ranges.length) {
      days.push({ date, slots: [], closed: "off" });
      continue;
    }
    const slots: Slot[] = [];
    for (const r of [...ranges].sort((a, b) => toMinutes(a.start) - toMinutes(b.start))) {
      const [sh, sm] = r.start.split(":").map(Number);
      let t = setMinutes(setHours(date, sh), sm);
      const end = addMinutes(date, toMinutes(r.end));
      while (!isBefore(end, addMinutes(t, schedule.slotMinutes))) {
        const key = format(t, "yyyy-MM-dd'T'HH:mm");
        slots.push({ start: t, available: !isBefore(t, earliest) && !booked.has(key) && !takenByOthers(doctorId, key) });
        t = addMinutes(t, schedule.slotMinutes);
      }
    }
    days.push({ date, slots });
  }
  return days;
}

/** Short human summary like "Mon–Fri 09:00–17:30 · Sat 10:00–13:00". */
export function summarizeWeek(schedule: DoctorSchedule) {
  const label = (ranges: TimeRange[]) => ranges.map((r) => `${r.start}–${r.end}`).join(", ");
  const groups: Array<{ from: number; to: number; hours: string }> = [];
  schedule.weekly.forEach((ranges, i) => {
    if (!ranges.length) return;
    const hours = label(ranges);
    const last = groups.at(-1);
    if (last && last.hours === hours && last.to === i - 1) last.to = i;
    else groups.push({ from: i, to: i, hours });
  });
  return groups.map((g) => ({
    days: g.from === g.to ? WEEKDAYS_SHORT[g.from] : `${WEEKDAYS_SHORT[g.from]}–${WEEKDAYS_SHORT[g.to]}`,
    hours: g.hours,
  }));
}
