"use client";

import { format, parseISO } from "date-fns";
import { Crosshair, Globe2, History, Loader2, RefreshCw } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/component/ui/badge";
import { Button } from "@/component/ui/button";
import { Card, CardBody, CardHeader } from "@/component/ui/card";
import { detectLocation, detectPreciseLocation, type LocationSource } from "@/lib/locale/detect";
import { flagEmoji, REGIONS } from "@/lib/locale/regions";
import { usePricing } from "@/lib/store/pricing";
import { trackAppOpen } from "@/lib/services/analytics";
import { useLocaleStore, useRegion } from "@/lib/store/locale";

const SOURCE_LABEL: Record<LocationSource, string> = {
  gps: "Precise location",
  ip: "Network location",
  timezone: "Device time zone",
  default: "Default",
};

/** Where the app was opened from, which sets the pricing region. */
export function LocationCard({ sampleFeeGBP = 45 }: { sampleFeeGBP?: number }) {
  const { regions, fee } = usePricing();
  const { location, region } = useRegion();
  const status = useLocaleStore((s) => s.status);
  const openLog = useLocaleStore((s) => s.openLog);
  const recordOpen = useLocaleStore((s) => s.recordOpen);
  const setStatus = useLocaleStore((s) => s.setStatus);
  const [busy, setBusy] = useState<"ip" | "gps" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async (kind: "ip" | "gps") => {
    setBusy(kind);
    setError(null);
    setStatus("detecting");
    try {
      const result = kind === "gps" ? await detectPreciseLocation() : await detectLocation();
      recordOpen(result);
      trackAppOpen(result);
    } catch (e) {
      setStatus("ready");
      setError(e instanceof Error ? e.message : "Could not detect your location.");
    } finally {
      setBusy(null);
    }
  };

  const place = [location.city, location.countryName].filter(Boolean).join(", ");

  return (
    <Card id="location">
      <CardHeader
        title="Location & pricing region"
        description="Detected each time you open the app. Consultation fees follow your region."
      />
      <CardBody className="space-y-5">
        <div className="flex items-center gap-4 rounded-2xl bg-primary-soft p-4">
          <span className="text-3xl" aria-hidden>
            {location.countryCode ? flagEmoji(location.countryCode) : <Globe2 className="size-8 text-primary" />}
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-foreground">{region.name}</p>
            <p className="truncate text-sm text-muted-foreground">
              {status === "detecting" ? "Detecting…" : place || "Location unknown"}
            </p>
          </div>
          <Badge tone="primary">{SOURCE_LABEL[location.source]}</Badge>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" disabled={!!busy} onClick={() => run("ip")}>
            {busy === "ip" ? <Loader2 className="animate-spin" /> : <RefreshCw />} Re-check location
          </Button>
          <Button variant="outline" size="sm" disabled={!!busy} onClick={() => run("gps")}>
            {busy === "gps" ? <Loader2 className="animate-spin" /> : <Crosshair />} Use precise location
          </Button>
        </div>
        {error && <p className="text-sm text-danger">{error}</p>}

        <div>
          <p className="mb-2 text-sm font-medium text-foreground">Regional consultation fees</p>
          <p className="mb-3 text-xs text-muted-foreground">Example for a specialist with a {fee(sampleFeeGBP, "europe").label} base fee.</p>
          <ul className="grid gap-1.5 sm:grid-cols-2">
            {regions.map((r) => (
              <li
                key={r.id}
                className={`flex items-center justify-between rounded-xl px-3 py-2 text-sm ${r.id === region.id ? "bg-surface-2 font-medium text-foreground" : "text-muted-foreground"}`}
              >
                <span>
                  {r.name}
                  {r.id === region.id && <span className="ml-1.5 text-xs text-primary">(you)</span>}
                </span>
                <span className="tabular-nums">{fee(sampleFeeGBP, r.id).label}</span>
              </li>
            ))}
          </ul>
        </div>

        {openLog.length > 0 && (
          <div>
            <p className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
              <History className="size-4 text-muted-foreground" /> Recent app opens
            </p>
            <ul className="divide-y divide-border rounded-2xl border border-border">
              {openLog.slice(0, 5).map((entry, i) => (
                <li key={`${entry.detectedAt}-${i}`} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                  <span className="min-w-0 truncate text-foreground">
                    {entry.countryCode && <span aria-hidden>{flagEmoji(entry.countryCode)} </span>}
                    {[entry.city, entry.countryName].filter(Boolean).join(", ") || REGIONS[entry.regionId].name}
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {entry.detectedAt ? format(parseISO(entry.detectedAt), "d MMM, HH:mm") : "—"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
