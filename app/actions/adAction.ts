"use server";

import { getAccessToken } from "@/auth";
import { api } from "@/lib/api";

/** Counts a view or a click on an ad. Best effort: never throws. */
export async function trackAdAction(id: string, event: "impression" | "click"): Promise<void> {
  if (!/^[a-f\d]{24}$/i.test(id) || !(await getAccessToken())) return;
  await api(`/advertisements/${id}/track`, { method: "POST", body: { event } });
}
