"use client";

import { QRCodeSVG } from "qrcode.react";
import { APP_DOWNLOAD_URL, APP_NAME } from "@/lib/brand";

/**
 * One QR for both platforms: it opens APP_DOWNLOAD_URL, which should redirect to the
 * App Store on iPhone and Google Play on Android. (qrcode.react uses hooks, so this is a client component.)
 */
export function AppQr({ size = 84, color = "#0c0612" }: { size?: number; color?: string }) {
  return <QRCodeSVG value={APP_DOWNLOAD_URL} size={size} level="M" fgColor={color} title={`Download ${APP_NAME}`} />;
}
