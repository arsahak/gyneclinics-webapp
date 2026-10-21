"use client";

import { Loader2, ShieldCheck } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";
import { Button } from "@/component/ui/button";
import { sendOtpAction, verifyOtpAction } from "@/app/actions/authAction";
import { cn } from "@/lib/utils";
import { StepHeader } from "./step-header";

const CODE_LENGTH = 6;
// Match the backend (utils/phoneOtp.ts): codes last 10 minutes, resend after 30 seconds.
const EXPIRY_SECONDS = 10 * 60;
const RESEND_SECONDS = 30;

function mmss(seconds: number) {
  const s = Math.max(0, seconds);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/**
 * The SMS code step. The backend checks the code and limits attempts; on
 * success the server action signs in with Auth.js and redirects.
 */
export function OtpForm({ phone, onChangeNumber }: { phone: string; onChangeNumber: () => void }) {
  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [sentAt, setSentAt] = useState(() => Date.now());
  const [now, setNow] = useState(() => Date.now());
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [verifying, startVerifying] = useTransition();
  const [resending, startResending] = useTransition();
  const inputs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    inputs.current[0]?.focus();
  }, []);

  const elapsed = Math.floor((now - sentAt) / 1000);
  const expiresIn = EXPIRY_SECONDS - elapsed;
  const resendIn = RESEND_SECONDS - elapsed;
  const code = digits.join("");

  const clear = () => {
    setDigits(Array(CODE_LENGTH).fill(""));
    inputs.current[0]?.focus();
  };

  const setDigit = (index: number, value: string) => {
    const clean = value.replace(/\D/g, "");
    setError(null);
    if (clean.length > 1) {
      // Pasted or autofilled the whole code.
      const next = clean.slice(0, CODE_LENGTH).split("");
      setDigits([...next, ...Array(CODE_LENGTH - next.length).fill("")]);
      inputs.current[Math.min(next.length, CODE_LENGTH - 1)]?.focus();
      return;
    }
    const next = [...digits];
    next[index] = clean;
    setDigits(next);
    if (clean && index < CODE_LENGTH - 1) inputs.current[index + 1]?.focus();
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (verifying || code.length < CODE_LENGTH) return;
    if (expiresIn <= 0) {
      setError("This code has expired. Please request a new one.");
      return;
    }
    setNotice(null);
    startVerifying(async () => {
      // Redirects on success; only returns when something went wrong.
      const result = await verifyOtpAction(phone, code);
      if (result?.error) {
        setError(result.error);
        clear();
      }
    });
  };

  const resend = () => {
    setError(null);
    startResending(async () => {
      const result = await sendOtpAction(phone);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      setSentAt(Date.now());
      setNow(Date.now());
      setNotice("A new code is on its way.");
      clear();
    });
  };

  return (
    <>
      <StepHeader
        title="Enter your code"
        description={
          <>
            We sent a 6-digit code to <span className="font-medium text-foreground">{phone}</span>.{" "}
            <button type="button" onClick={onChangeNumber} className="text-primary hover:underline">
              Change
            </button>
          </>
        }
      />
      <form onSubmit={submit} className="space-y-6">
        <div
          className="flex justify-between gap-2"
          onPaste={(e) => {
            e.preventDefault();
            setDigit(0, e.clipboardData.getData("text"));
          }}
        >
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => {
                inputs.current[i] = el;
              }}
              value={digit}
              disabled={verifying}
              inputMode="numeric"
              autoComplete={i === 0 ? "one-time-code" : "off"}
              aria-label={`Digit ${i + 1}`}
              aria-invalid={!!error}
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

        {error && (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        )}
        {notice && !error && <p className="text-sm text-success">{notice}</p>}

        <Button type="submit" size="lg" className="w-full" disabled={verifying || code.length < CODE_LENGTH}>
          {verifying ? (
            <>
              <Loader2 className="animate-spin" /> Verifying…
            </>
          ) : (
            <>
              <ShieldCheck /> Verify
            </>
          )}
        </Button>

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {expiresIn > 0 ? <>Code expires in {mmss(expiresIn)}</> : "Code expired"}
          </span>
          <button
            type="button"
            onClick={resend}
            disabled={resendIn > 0 || resending || verifying}
            className="font-medium text-primary disabled:text-muted-foreground"
          >
            {resending ? "Sending…" : resendIn > 0 ? `Resend in ${resendIn}s` : "Resend code"}
          </button>
        </div>
      </form>
    </>
  );
}
