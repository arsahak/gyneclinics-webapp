"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/** Page numbers to show: always the first and last, the current one and its neighbours, "…" between gaps. */
function pageList(page: number, pages: number): Array<number | "gap"> {
  const wanted = new Set([1, pages, page - 1, page, page + 1].filter((p) => p >= 1 && p <= pages));
  const sorted = [...wanted].sort((a, b) => a - b);
  const list: Array<number | "gap"> = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) list.push("gap");
    list.push(p);
  });
  return list;
}

/** "Showing 1–9 of 23" with Previous / page numbers / Next. Hidden when everything fits on one page. */
export function Pagination({
  page,
  pageSize,
  total,
  itemLabel = "items",
  onChange,
  className,
}: {
  page: number;
  pageSize: number;
  total: number;
  itemLabel?: string;
  onChange: (page: number) => void;
  className?: string;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (total <= pageSize) return null;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  const arrow =
    "inline-flex h-10 items-center gap-1 rounded-full px-3 text-sm font-medium text-foreground transition-colors hover:bg-surface-2 disabled:pointer-events-none disabled:opacity-40";

  return (
    <nav aria-label="Pages" className={cn("flex flex-col items-center gap-3 sm:flex-row sm:justify-between", className)}>
      <p className="text-sm text-muted-foreground">
        Showing <span className="font-medium text-foreground">{from}–{to}</span> of{" "}
        <span className="font-medium text-foreground">{total}</span> {itemLabel}
      </p>
      <div className="flex items-center gap-1">
        <button type="button" className={arrow} onClick={() => onChange(page - 1)} disabled={page <= 1} aria-label="Previous page">
          <ChevronLeft className="size-4" />
          <span className="hidden sm:inline">Previous</span>
        </button>
        {pageList(page, pages).map((item, i) =>
          item === "gap" ? (
            <span key={`gap-${i}`} className="px-1 text-sm text-muted-foreground">
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onChange(item)}
              aria-current={item === page ? "page" : undefined}
              className={cn(
                "inline-flex size-10 items-center justify-center rounded-full text-sm font-medium tabular-nums transition-colors",
                item === page ? "bg-primary text-primary-foreground shadow-sm" : "text-foreground hover:bg-surface-2",
              )}
            >
              {item}
            </button>
          ),
        )}
        <button type="button" className={arrow} onClick={() => onChange(page + 1)} disabled={page >= pages} aria-label="Next page">
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="size-4" />
        </button>
      </div>
    </nav>
  );
}
