"use server";

import { api } from "@/lib/api";
import type { RegionId } from "@/lib/locale/regions";

/** Each region's price as a share of the UK fee, from Fees & Commission (public). */
export async function getPricingAction(): Promise<Partial<Record<RegionId, number>> | null> {
  const result = await api<{ regions: { id: RegionId; multiplier: number }[] }>("/settings/pricing", { token: null });
  if (!result.ok || !result.data) return null;
  return Object.fromEntries(result.data.regions.map((r) => [r.id, r.multiplier]));
}
