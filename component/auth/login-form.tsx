"use client";

import { ArrowRight, CheckCircle2, Loader2, Smartphone, X } from "lucide-react";
import { useMemo, useState, useSyncExternalStore, useTransition } from "react";
import { Button } from "@/component/ui/button";
import { Field, Input } from "@/component/ui/field";
import { sendOtpAction } from "@/app/actions/authAction";
import { APP_NAME } from "@/lib/brand";
import { findDialCode } from "@/lib/locale/dial-codes";
import { checkMobile, defaultPhoneCountry, formatPhoneInput, phonePlaceholder } from "@/lib/phone";
import { cn } from "@/lib/utils";
import { CountryCodePicker } from "./country-code-picker";
import { OtpForm } from "./otp-form";
import { StepHeader } from "./step-header";

/** The browser's country never changes while the page is open. */
const noSubscribe = () => () => {};

/** Sign in or sign up: phone number, then the SMS code. */
export function LoginForm() {
  // The country picked by the user, else the one guessed from the browser's
  // time zone (the server renders the UK, then the browser fills in its own).
  const [picked, setPicked] = useState<string | null>(null);
  const detected = useSyncExternalStore(noSubscribe, defaultPhoneCountry, () => "GB");
  const iso = picked ?? detected;
  const [number, setNumber] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const [focused, setFocused] = useState(false);
  // Set once the code is sent; switches the form to the code step.
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [sending, startSending] = useTransition();

  const placeholder = useMemo(() => phonePlaceholder(iso), [iso]);
  const check = useMemo(() => checkMobile(number, iso), [number, iso]);
  const invalidMessage = `Enter a valid ${findDialCode(iso)?.[1] ?? ""} mobile number.`.replace("  ", " ");
  const shownError = error ?? (touched && !focused && number && !check.valid ? invalidMessage : null);

  if (sentTo) return <OtpForm phone={sentTo} onChangeNumber={() => setSentTo(null)} />;

  const onType = (value: string) => {
    const next = formatPhoneInput(value, number, iso);
    if (next.iso) setPicked(next.iso);
    setNumber(next.text);
    setError(null);
  };

  const onCountry = (code: string) => {
    setPicked(code);
    // Reformat what's typed for the new country.
    setNumber((current) => formatPhoneInput(current, "", code).text);
    setError(null);
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setTouched(true);
    if (!check.e164) {
      setError(number ? invalidMessage : "Enter your mobile number.");
      return;
    }
    const phone = check.e164;
    startSending(async () => {
      const result = await sendOtpAction(phone);
      if ("error" in result) setError(result.error);
      else setSentTo(result.phone);
    });
  };

  return (
    <>
      <StepHeader
        title={`Welcome to ${APP_NAME}`}
        description="Sign in or create an account with your mobile number. We'll send you a one-time code."
      />
      <form onSubmit={submit} noValidate className="space-y-5">
        <Field
          label="Mobile number"
          htmlFor="phone"
          error={shownError}
          hint="We'll text you a 6-digit code. Standard SMS rates may apply."
        >
          <div className="flex gap-2">
            <CountryCodePicker value={iso} onChange={onCountry} />
            <div className="relative flex-1">
              <Smartphone className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="phone"
                name="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                maxLength={20}
                placeholder={placeholder}
                value={number}
                aria-invalid={Boolean(shownError)}
                onChange={(e) => onType(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => {
                  setFocused(false);
                  setTouched(true);
                }}
                className={cn("pr-10 pl-10 tracking-wide tabular-nums", shownError && "border-danger focus:border-danger")}
              />
              {check.valid ? (
                <CheckCircle2
                  aria-label="Valid number"
                  className="absolute top-1/2 right-3.5 size-5 -translate-y-1/2 text-success"
                />
              ) : (
                number && (
                  <button
                    type="button"
                    aria-label="Clear number"
                    onClick={() => {
                      setNumber("");
                      setError(null);
                      setTouched(false);
                    }}
                    className="absolute top-1/2 right-2.5 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-surface-2 hover:text-foreground"
                  >
                    <X className="size-4" />
                  </button>
                )
              )}
            </div>
          </div>
        </Field>
        <Button type="submit" size="lg" className="w-full" disabled={sending}>
          {sending ? (
            <>
              <Loader2 className="animate-spin" /> Sending code…
            </>
          ) : (
            <>
              Send code <ArrowRight />
            </>
          )}
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          One account per mobile number. By continuing you agree to our Terms and Privacy Policy.
        </p>
      </form>
    </>
  );
}
