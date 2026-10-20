import { doctors, reviews } from "@/lib/mock/doctors";
import type { Doctor, Review } from "@/lib/types";

// Mock-backed for now. Replace the bodies with API calls when the backend is ready.

export async function getDoctors(): Promise<Doctor[]> {
  return doctors;
}

export async function getDoctor(id: string): Promise<Doctor | undefined> {
  return doctors.find((doctor) => doctor.id === id);
}

export async function getDoctorReviews(id: string): Promise<Review[]> {
  return reviews.filter((review) => review.doctorId === id);
}

export function listDoctorIds() {
  return doctors.map((doctor) => doctor.id);
}
