"use client";

import { ArrowRight, Loader2, Smartphone } from "lucide-react";
import { useState, useTransition } from "react";
import { Button } from "@/component/ui/button";
import { Field, Input } from "@/component/ui/field";
import { sendOtpAction } from "@/app/actions/authAction";
import { APP_NAME } from "@/lib/brand";
import { findDialCode } from "@/lib/locale/dial-codes";
import { CountryCodePicker } from "./country-code-picker";
import { OtpForm } from "./otp-form";
import { StepHeader } from "./step-header";

/** Sign in or sign up: phone number, then the SMS code. */
export function LoginForm() {
  // UK by default; the user can pick any country.
  const [iso, setCountry] = useState("GB");
  const dial = findDialCode(iso)?.[2] ?? "+44";
  const [number, setNumber] = useState("");
  const [error, setError] = useState<string | null>(null);
  // Set once the code is sent; switches the form to the code step.
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [sending, startSending] = useTransition();

  if (sentTo) return <OtpForm phone={sentTo} onChangeNumber={() => setSentTo(null)} />;

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    // Drop a leading trunk "0" (e.g. 07700… → 7700…); E.164 allows up to 15 digits including the country code.
    const digits = number.replace(/\D/g, "").replace(/^0+/, "");
    if (digits.length < 6 || digits.length > 14) {
      setError("Please enter a valid mobile number.");
      return;
    }
    startSending(async () => {
      const result = await sendOtpAction(`${dial}${digits}`);
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
      <form onSubmit={submit} className="space-y-5">
        <Field label="Mobile number" htmlFor="phone" error={error}>
          <div className="flex gap-2">
            <CountryCodePicker value={iso} onChange={setCountry} />
            <div className="relative flex-1">
              <Smartphone className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="phone"
                inputMode="tel"
                autoComplete="tel-national"
                placeholder="Mobile number"
                value={number}
                onChange={(e) => {
                  setNumber(e.target.value);
                  setError(null);
                }}
                className="pl-10"
              />
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
