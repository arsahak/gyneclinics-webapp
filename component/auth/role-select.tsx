"use client";

import { Check, Loader2, Stethoscope, UserRound } from "lucide-react";
import { useState, useTransition } from "react";
import { Button } from "@/component/ui/button";
import { registerAction } from "@/app/actions/authAction";
import type { Role } from "@/lib/types";
import { cn } from "@/lib/utils";
import { StepHeader } from "./step-header";

const roles: Array<{ value: Role; title: string; body: string; icon: typeof UserRound }> = [
  {
    value: "patient",
    title: "I'm a patient",
    body: "Track my cycle, read trusted content and chat with specialists.",
    icon: UserRound,
  },
  {
    value: "doctor",
    title: "I'm a gynaecology specialist",
    body: "Offer guidance to patients. Your profile is verified before going live.",
    icon: Stethoscope,
  },
];

/** Creates the account for the phone that was just verified. */
export function RoleSelect({ phone }: { phone: string }) {
  const [role, setRole] = useState<Role | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [creating, startCreating] = useTransition();

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!role) return;
    setError(null);
    startCreating(async () => {
      // Redirects to onboarding (where the name is asked) on success.
      const result = await registerAction(role);
      if (result?.error) setError(result.error);
    });
  };

  return (
    <>
      <StepHeader
        step={1}
        total={3}
        title="How will you use GyneClinics?"
        description={
          <>
            <span className="font-medium text-foreground">{phone}</span> is verified. Choose one to continue. This
            can&apos;t be changed later.
          </>
        }
      />
      <form onSubmit={submit}>
      <div role="radiogroup" aria-label="Account type" className="space-y-3">
        {roles.map(({ value, title, body, icon: Icon }) => {
          const selected = role === value;
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => {
                setRole(value);
                setError(null);
              }}
              className={cn(
                "flex w-full items-start gap-4 rounded-3xl border-2 bg-surface p-5 text-left transition-all",
                selected ? "border-primary shadow-[var(--shadow-soft)]" : "border-border hover:border-primary/40",
              )}
            >
              <span
                className={cn(
                  "inline-flex size-12 shrink-0 items-center justify-center rounded-2xl",
                  value === "patient" ? "bg-accent-soft text-accent" : "bg-primary-soft text-primary",
                )}
              >
                <Icon className="size-6" />
              </span>
              <span className="flex-1">
                <span className="block font-semibold text-foreground">{title}</span>
                <span className="mt-1 block text-sm text-muted-foreground">{body}</span>
              </span>
              <span
                className={cn(
                  "mt-1 inline-flex size-6 shrink-0 items-center justify-center rounded-full border-2",
                  selected ? "border-primary bg-primary text-primary-foreground" : "border-border",
                )}
              >
                {selected && <Check className="size-3.5" />}
              </span>
            </button>
          );
        })}
      </div>
      {error && (
        <p role="alert" className="mt-4 text-sm text-danger">
          {error}
        </p>
      )}
      <Button type="submit" size="lg" className="mt-8 w-full" disabled={!role || creating}>
        {creating ? (
          <>
            <Loader2 className="animate-spin" /> Creating your account…
          </>
        ) : (
          "Continue"
        )}
      </Button>
      </form>
    </>
  );
}
