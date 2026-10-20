"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const CHAR_MS = 45;
const START_DELAY_MS = 350;

/**
 * Headline that types itself out on first load.
 * The full text sits underneath (invisible) so the layout never shifts, and screen readers
 * get the complete heading straight away. Respects reduced-motion.
 */
export function TypingTitle({
  lines,
  className,
}: {
  lines: Array<{ text: string; className?: string }>;
  className?: string;
}) {
  const total = lines.reduce((sum, line) => sum + line.text.length, 0);
  const [typed, setTyped] = useState(0);
  const done = typed >= total;

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let interval: ReturnType<typeof setInterval> | undefined;
    const start = setTimeout(
      () => {
        if (reduce) {
          setTyped(total);
          return;
        }
        interval = setInterval(() => {
          setTyped((n) => {
            if (n + 1 >= total) clearInterval(interval);
            return Math.min(n + 1, total);
          });
        }, CHAR_MS);
      },
      reduce ? 0 : START_DELAY_MS,
    );
    return () => {
      clearTimeout(start);
      if (interval) clearInterval(interval);
    };
  }, [total]);

  let remaining = typed;
  const visible = lines.map((line) => {
    const shown = line.text.slice(0, Math.max(0, remaining));
    remaining -= line.text.length;
    return shown;
  });
  // The caret sits at the end of whichever line is currently being typed.
  const caretLine = Math.max(0, visible.findLastIndex((text) => text.length > 0));

  return (
    <h1 className={cn("relative", className)}>
      <span className="sr-only">{lines.map((line) => line.text).join(" ")}</span>

      {/* Reserves the final size so nothing below jumps while typing */}
      <span aria-hidden className="invisible block">
        {lines.map((line, i) => (
          <span key={i} className="block text-balance">
            <span className={line.className}>{line.text}</span>
          </span>
        ))}
      </span>

      <span aria-hidden className="absolute inset-0 block">
        {lines.map((line, i) => (
          <span key={i} className="block text-balance">
            <span className={line.className}>{visible[i]}</span>
            {/* Caret shows only while typing */}
            {!done && i === caretLine && (
              <span className="ml-1 inline-block h-[0.85em] w-[3px] translate-y-[0.08em] rounded-full bg-primary align-baseline" />
            )}
          </span>
        ))}
      </span>
    </h1>
  );
}
