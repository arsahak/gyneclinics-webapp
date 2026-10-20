import { patientThreads } from "@/lib/mock/engagement";
import type { PatientThread } from "@/lib/types";

// Mock-backed for now. Realtime chat will replace this with a socket/API client.

export async function getPatientThreads(): Promise<PatientThread[]> {
  return patientThreads;
}

export async function getPatientThread(id: string): Promise<PatientThread | undefined> {
  return patientThreads.find((thread) => thread.id === id);
}

export function listThreadIds() {
  return patientThreads.map((thread) => thread.id);
}
