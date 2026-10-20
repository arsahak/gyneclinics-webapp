"use client";

import { Check, Stethoscope, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/component/ui/button";
import { useSession } from "@/lib/store/session";
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

export function RoleSelect() {
  const router = useRouter();
  const chooseRole = useSession((s) => s.chooseRole);
  const [role, setRole] = useState<Role | null>(null);

  return (
    <>
      <StepHeader step={1} total={3} title="How will you use GyneClinics?" description="Choose one to continue. This can't be changed later." />
      <div role="radiogroup" className="space-y-3">
        {roles.map(({ value, title, body, icon: Icon }) => {
          const selected = role === value;
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => setRole(value)}
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
      <Button
        size="lg"
        className="mt-8 w-full"
        disabled={!role}
        onClick={() => {
          if (!role) return;
          chooseRole(role);
          router.push(role === "patient" ? "/onboarding/patient" : "/onboarding/doctor");
        }}
      >
        Continue
      </Button>
    </>
  );
}
