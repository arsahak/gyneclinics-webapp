import type { DetectedLocation } from "@/lib/locale/detect";

// App-open tracking hook. Logs locally for now; post to the analytics API later.
export function trackAppOpen(location: DetectedLocation) {
  if (process.env.NODE_ENV !== "production") {
    console.info("[analytics] app_open", {
      region: location.regionId,
      country: location.countryCode,
      city: location.city,
      source: location.source,
    });
  }
}
