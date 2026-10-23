import Image from "next/image";
import Link from "next/link";
import { APP_NAME } from "@/lib/brand";
import { cn } from "@/lib/utils";

type Tone = "default" | "inverse";

/** The GyneX logo. "inverse" shows it in white, for dark backgrounds. */
export function Logo({ href = "/", tone = "default", className }: { href?: string; tone?: Tone; className?: string }) {
  return (
    <Link href={href} aria-label={`${APP_NAME} home`} className={cn("inline-flex items-center", className)}>
      <Image
        src="/assets/logo/gynexapp-logo-sm.png"
        alt={APP_NAME}
        width={900}
        height={467}
        // Shown about 70px wide; this keeps the download small.
        sizes="160px"
        priority
        className={cn("h-9 w-auto", tone === "inverse" && "brightness-0 invert")}
      />
    </Link>
  );
}
