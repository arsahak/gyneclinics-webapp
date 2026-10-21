import Image from "next/image";
import { cn, initials } from "@/lib/utils";

export function Avatar({
  name,
  hue = 186,
  size = "md",
  className,
  src,
}: {
  name: string;
  hue?: number;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  /** Photo URL; falls back to initials. */
  src?: string;
}) {
  const sizes = {
    sm: "size-9 text-xs",
    md: "size-11 text-sm",
    lg: "size-14 text-base",
    xl: "size-20 text-xl",
  };
  if (src) {
    const pixels = { sm: 36, md: 44, lg: 56, xl: 80 }[size];
    return (
      <Image
        src={src}
        alt=""
        width={pixels}
        height={pixels}
        className={cn("shrink-0 rounded-full object-cover", sizes[size], className)}
      />
    );
  }
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white",
        sizes[size],
        className,
      )}
      style={{
        background: `linear-gradient(135deg, hsl(${hue} 55% 45%), hsl(${(hue + 40) % 360} 50% 38%))`,
      }}
    >
      {initials(name)}
    </span>
  );
}
