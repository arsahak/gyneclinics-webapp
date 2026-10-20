"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";

export type ThemePreference = "light" | "dark" | "system";

const STORAGE_KEY = "theme";
const listeners = new Set<() => void>();

function readPreference(): ThemePreference {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === "dark" || value === "system" ? value : "light";
  } catch {
    return "light";
  }
}

function apply(preference: ThemePreference) {
  const dark =
    preference === "dark" ||
    (preference === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
}

export function setThemePreference(preference: ThemePreference) {
  try {
    localStorage.setItem(STORAGE_KEY, preference);
  } catch {
    // storage unavailable — theme still applies for this page view
  }
  apply(preference);
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useThemePreference() {
  return useSyncExternalStore(subscribe, readPreference, () => "light" as ThemePreference);
}

/** Runs before first paint so the saved theme never flashes. Light is the default. */
export const themeScript = `(function(){try{var t=localStorage.getItem("${STORAGE_KEY}");var d=t==="dark"||(t==="system"&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.setAttribute("data-theme",d?"dark":"light")}catch(e){}})()`;

/** Compact light/dark switch for headers. */
export function ThemeToggle({ className, tone = "default" }: { className?: string; tone?: "default" | "inverse" }) {
  const preference = useThemePreference();
  const isDark = preference === "dark";
  return (
    <button
      type="button"
      onClick={() => setThemePreference(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "inline-flex size-10 items-center justify-center rounded-full transition-colors",
        tone === "inverse" ? "text-white/75 hover:bg-white/10 hover:text-white" : "text-muted-foreground hover:bg-surface-2 hover:text-foreground",
        className,
      )}
    >
      {isDark ? <Sun className="size-5" /> : <Moon className="size-5" />}
    </button>
  );
}

/** Three-way picker for settings pages. */
export function ThemePicker() {
  const preference = useThemePreference();
  const options = [
    { value: "light" as const, label: "Light", icon: Sun },
    { value: "dark" as const, label: "Dark", icon: Moon },
    { value: "system" as const, label: "System", icon: Monitor },
  ];
  return (
    <div className="grid grid-cols-3 gap-2">
      {options.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          type="button"
          onClick={() => setThemePreference(value)}
          aria-pressed={preference === value}
          className={cn(
            "flex flex-col items-center gap-2 rounded-2xl border p-4 text-sm font-medium transition-colors",
            preference === value
              ? "border-primary bg-primary-soft text-primary"
              : "border-border text-muted-foreground hover:text-foreground",
          )}
        >
          <Icon className="size-5" />
          {label}
        </button>
      ))}
    </div>
  );
}
