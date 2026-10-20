import {
  DEFAULT_REGION,
  regionForCountry,
  regionForTimezone,
  type RegionId,
} from "./regions";

export type LocationSource = "gps" | "ip" | "timezone" | "default";

export interface DetectedLocation {
  regionId: RegionId;
  countryCode?: string;
  countryName?: string;
  city?: string;
  source: LocationSource;
  detectedAt: string;
}

function withTimeout(ms: number) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return { signal: controller.signal, done: () => clearTimeout(timer) };
}

function fromCountry(
  countryCode: string,
  source: LocationSource,
  extra: Pick<DetectedLocation, "countryName" | "city"> = {},
): DetectedLocation {
  return {
    regionId: regionForCountry(countryCode),
    countryCode: countryCode.toUpperCase(),
    ...extra,
    source,
    detectedAt: new Date().toISOString(),
  };
}

// Approximate location from the visitor's IP address (no permission prompt).
async function fromIp(): Promise<DetectedLocation | null> {
  const providers = [
    async () => {
      const t = withTimeout(4000);
      try {
        const res = await fetch("https://ipwho.is/?fields=success,country,country_code,city", {
          signal: t.signal,
        });
        const data = await res.json();
        if (!data?.success || !data.country_code) return null;
        return fromCountry(data.country_code, "ip", { countryName: data.country, city: data.city });
      } finally {
        t.done();
      }
    },
    async () => {
      const t = withTimeout(4000);
      try {
        const res = await fetch("https://ipapi.co/json/", { signal: t.signal });
        const data = await res.json();
        if (!data?.country_code) return null;
        return fromCountry(data.country_code, "ip", {
          countryName: data.country_name,
          city: data.city,
        });
      } finally {
        t.done();
      }
    },
  ];

  for (const provider of providers) {
    try {
      const result = await provider();
      if (result) return result;
    } catch {
      // try the next provider
    }
  }
  return null;
}

function fromTimezone(): DetectedLocation | null {
  try {
    const regionId = regionForTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    return regionId ? { regionId, source: "timezone", detectedAt: new Date().toISOString() } : null;
  } catch {
    return null;
  }
}

export function defaultLocation(): DetectedLocation {
  return { regionId: DEFAULT_REGION, source: "default", detectedAt: "" };
}

/** IP lookup first, then the device time zone, then the default region. */
export async function detectLocation(): Promise<DetectedLocation> {
  return (
    (await fromIp()) ??
    fromTimezone() ?? { ...defaultLocation(), detectedAt: new Date().toISOString() }
  );
}

/** Precise location — asks the browser for permission, then reverse-geocodes to a country. */
export function detectPreciseLocation(): Promise<DetectedLocation> {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new Error("Location services are not available in this browser."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const t = withTimeout(6000);
        try {
          const res = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${coords.latitude}&longitude=${coords.longitude}&localityLanguage=en`,
            { signal: t.signal },
          );
          const data = await res.json();
          if (!data?.countryCode) throw new Error("Could not resolve your location.");
          resolve(
            fromCountry(data.countryCode, "gps", {
              countryName: data.countryName,
              city: data.city || data.locality,
            }),
          );
        } catch (error) {
          reject(error instanceof Error ? error : new Error("Could not resolve your location."));
        } finally {
          t.done();
        }
      },
      (error) =>
        reject(
          new Error(
            error.code === error.PERMISSION_DENIED
              ? "Location permission was denied."
              : "We couldn't get your location. Please try again.",
          ),
        ),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 10 * 60 * 1000 },
    );
  });
}
