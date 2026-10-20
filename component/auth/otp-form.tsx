"use client";

import { LockKeyhole, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/component/ui/button";
import { nextStepFor, useSession } from "@/lib/store/session";
import { cn } from "@/lib/utils";
import { StepHeader } from "./step-header";

const CODE_LENGTH = 6;
const DEMO_CODE = "123456";
const EXPIRY_SECONDS = 5 * 60;
const RESEND_SECONDS = 30;
const MAX_ATTEMPTS = 3;
const LOCKOUT_SECONDS = 60;

function mmss(seconds: number) {
  const s = Math.max(0, seconds);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export function OtpForm() {
  const router = useRouter();
  const phone = useSession((s) => s.phone);
  const verify = useSession((s) => s.verify);

  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [sentAt, setSentAt] = useState(() => Date.now());
  const [now, setNow] = useState(() => Date.now());
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (!phone) router.replace("/login");
  }, [phone, router]);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const elapsed = Math.floor((now - sentAt) / 1000);
  const expiresIn = EXPIRY_SECONDS - elapsed;
  const resendIn = RESEND_SECONDS - elapsed;
  const lockRemaining = lockedUntil ? Math.ceil((lockedUntil - now) / 1000) : 0;
  const locked = lockRemaining > 0;
  const code = digits.join("");

  const setDigit = (index: number, value: string) => {
    const clean = value.replace(/\D/g, "");
    if (clean.length > 1) {
      // Pasted the whole code
      const next = clean.slice(0, CODE_LENGTH).split("");
      setDigits([...next, ...Array(CODE_LENGTH - next.length).fill("")]);
      inputs.current[Math.min(next.length, CODE_LENGTH - 1)]?.focus();
      return;
    }
    const next = [...digits];
    next[index] = clean;
    setDigits(next);
    setError(null);
    if (clean && index < CODE_LENGTH - 1) inputs.current[index + 1]?.focus();
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (locked || code.length < CODE_LENGTH) return;
    if (expiresIn <= 0) {
      setError("This code has expired. Please request a new one.");
      return;
    }
    if (code !== DEMO_CODE) {
      const used = attempts + 1;
      setAttempts(used);
      setDigits(Array(CODE_LENGTH).fill(""));
      inputs.current[0]?.focus();
      if (used >= MAX_ATTEMPTS) {
        setLockedUntil(Date.now() + LOCKOUT_SECONDS * 1000);
        setAttempts(0);
        setError("Too many incorrect attempts. Please wait before trying again.");
      } else {
        setError(`Incorrect code. ${MAX_ATTEMPTS - used} attempt${MAX_ATTEMPTS - used === 1 ? "" : "s"} left.`);
      }
      return;
    }
    verify();
    router.push(nextStepFor({ ...useSession.getState(), verified: true }));
  };

  const resend = () => {
    setSentAt(Date.now());
    setNow(Date.now());
    setDigits(Array(CODE_LENGTH).fill(""));
    setError(null);
  };

  return (
    <>
      <StepHeader
        title="Enter your code"
        description={
          <>
            We sent a 6-digit code to <span className="font-medium text-foreground">{phone}</span>.{" "}
            <Link href="/login" className="text-primary hover:underline">
              Change
            </Link>
          </>
        }
      />
      <form onSubmit={submit} className="space-y-6">
        <div className="flex justify-between gap-2" onPaste={(e) => {
          e.preventDefault();
          setDigit(0, e.clipboardData.getData("text"));
        }}>
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => {
                inputs.current[i] = el;
              }}
              value={digit}
              disabled={locked}
              inputMode="numeric"
              autoComplete={i === 0 ? "one-time-code" : "off"}
              aria-label={`Digit ${i + 1}`}
              maxLength={CODE_LENGTH}
              onChange={(e) => setDigit(i, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Backspace" && !digit && i > 0) inputs.current[i - 1]?.focus();
              }}
              className={cn(
                "h-14 w-full min-w-0 rounded-2xl border bg-surface text-center text-xl font-semibold text-foreground transition-colors focus:border-primary focus:outline-none disabled:opacity-50",
                error ? "border-danger" : "border-border",
              )}
            />
          ))}
        </div>

        {locked ? (
          <div className="flex items-center gap-3 rounded-2xl bg-danger-soft p-4 text-sm text-danger">
            <LockKeyhole className="size-5 shrink-0" />
            Temporarily locked for security. Try again in {mmss(lockRemaining)}.
          </div>
        ) : (
          error && <p className="text-sm text-danger">{error}</p>
        )}

        <Button type="submit" size="lg" className="w-full" disabled={locked || code.length < CODE_LENGTH}>
          <ShieldCheck /> Verify
        </Button>

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {expiresIn > 0 ? <>Code expires in {mmss(expiresIn)}</> : "Code expired"}
          </span>
          <button
            type="button"
            onClick={resend}
            disabled={resendIn > 0 || locked}
            className="font-medium text-primary disabled:text-muted-foreground"
          >
            {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend code"}
          </button>
        </div>

        <p className="rounded-2xl bg-surface-2 p-3 text-center text-xs text-muted-foreground">
          Demo: use code <span className="font-mono font-semibold text-foreground">{DEMO_CODE}</span>
        </p>
      </form>
    </>
  );
}
