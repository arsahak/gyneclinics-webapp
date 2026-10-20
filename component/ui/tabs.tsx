"use client";

import { cn } from "@/lib/utils";

export function Tabs<T extends string>({
  value,
  onChange,
  options,
  className,
}: {
  value: T;
  onChange: (value: T) => void;
  options: Array<{ value: T; label: string }>;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      className={cn("no-scrollbar flex gap-2 overflow-x-auto", className)}
    >
      {options.map((option) => (
        <button
          key={option.value}
          role="tab"
          type="button"
          aria-selected={value === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "h-9 shrink-0 rounded-full border px-4 text-sm font-medium transition-colors",
            value === option.value
              ? "border-foreground bg-foreground text-background"
              : "border-border bg-surface text-muted-foreground hover:text-foreground",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
