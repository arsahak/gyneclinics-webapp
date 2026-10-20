import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

// Shown on every insight screen (BRD D5) and anywhere estimates appear.
export function Disclaimer({
  children = "These insights are calculated only from the information you have entered. They are for general information and are not a medical diagnosis. Always speak to a qualified doctor about your health.",
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      role="note"
      className={cn(
        "flex gap-3 rounded-2xl border border-gold/25 bg-gold-soft px-4 py-3 text-xs leading-relaxed text-foreground/80",
        className,
      )}
    >
      <Info className="mt-0.5 size-4 shrink-0 text-gold" />
      <p>{children}</p>
    </div>
  );
}
