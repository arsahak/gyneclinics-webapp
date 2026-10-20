"use client";

import { Check, ChevronDown, Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { DIAL_CODES, findDialCode } from "@/lib/locale/dial-codes";
import { flagEmoji } from "@/lib/locale/regions";
import { cn } from "@/lib/utils";

/** Searchable country calling-code picker covering every country. */
export function CountryCodePicker({ value, onChange }: { value: string; onChange: (iso: string) => void }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const selected = findDialCode(value) ?? DIAL_CODES[0];

  const results = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/^\+/, "");
    if (!q) return DIAL_CODES;
    return DIAL_CODES.filter(
      ([iso, name, dial]) => name.toLowerCase().includes(q) || dial.slice(1).startsWith(q) || iso.toLowerCase() === q,
    );
  }, [query]);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const choose = (iso: string) => {
    onChange(iso);
    setOpen(false);
    setQuery("");
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Country code: ${selected[1]} ${selected[2]}`}
        onClick={() => setOpen(!open)}
        className="flex h-11 w-[7.5rem] items-center gap-2 rounded-2xl border border-border bg-surface px-3 text-sm text-foreground transition-colors focus:border-primary focus:outline-none"
      >
        <span className="text-lg leading-none" aria-hidden>
          {flagEmoji(selected[0])}
        </span>
        <span className="font-medium tabular-nums">{selected[2]}</span>
        <ChevronDown className={cn("ml-auto size-4 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="animate-fade-up absolute top-full left-0 z-30 mt-2 w-72 overflow-hidden rounded-2xl border border-border bg-surface shadow-(--shadow-lift)">
          <div className="relative border-b border-border p-2">
            <Search className="pointer-events-none absolute top-1/2 left-5 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && results[0]) {
                  e.preventDefault();
                  choose(results[0][0]);
                }
              }}
              placeholder="Search country or code"
              aria-label="Search country or code"
              className="h-10 w-full rounded-xl bg-surface-2 pr-3 pl-9 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>
          <ul role="listbox" className="max-h-72 overflow-y-auto p-1.5">
            {results.length === 0 && <li className="px-3 py-6 text-center text-sm text-muted-foreground">No country found</li>}
            {results.map(([iso, name, dial]) => (
              <li key={iso} role="option" aria-selected={iso === selected[0]}>
                <button
                  type="button"
                  onClick={() => choose(iso)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition-colors hover:bg-surface-2",
                    iso === selected[0] && "bg-primary-soft text-primary",
                  )}
                >
                  <span className="text-lg leading-none" aria-hidden>
                    {flagEmoji(iso)}
                  </span>
                  <span className="min-w-0 flex-1 truncate">{name}</span>
                  <span className="text-muted-foreground tabular-nums">{dial}</span>
                  {iso === selected[0] && <Check className="size-4" />}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
