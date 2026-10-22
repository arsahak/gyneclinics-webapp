import "server-only";
import { api } from "@/lib/api";
import { AD_SLOTS, type AdSlot, type ServedAds } from "@/lib/ads";

/** The live ad for each slot, from the backend. Ads are optional: on any error, no ads. */
export async function getServedAds(slots: AdSlot[] = AD_SLOTS): Promise<ServedAds> {
  const result = await api<ServedAds>(`/advertisements/serve?slots=${slots.join(",")}`);
  if (!result.ok || !result.data) {
    console.error("Could not load ads:", result.message);
    return {};
  }
  return result.data;
}
