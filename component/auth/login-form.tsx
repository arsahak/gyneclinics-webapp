"use client";

import { ArrowRight, Smartphone } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/component/ui/button";
import { Field, Input } from "@/component/ui/field";
import { APP_NAME } from "@/lib/brand";
import { findDialCode } from "@/lib/locale/dial-codes";
import { useSession } from "@/lib/store/session";
import { CountryCodePicker } from "./country-code-picker";
import { DemoButtons } from "./demo-buttons";
import { StepHeader } from "./step-header";

export function LoginForm() {
  const router = useRouter();
  const setPhone = useSession((s) => s.setPhone);
  // UK by default; the user can pick any country.
  const [iso, setCountry] = useState("GB");
  const dial = findDialCode(iso)?.[2] ?? "+44";
  const [number, setNumber] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    // Drop a leading trunk "0" (e.g. 07700… → 7700…); E.164 allows up to 15 digits including the country code.
    const digits = number.replace(/\D/g, "").replace(/^0+/, "");
    if (digits.length < 6 || digits.length > 14) {
      setError("Please enter a valid mobile number.");
      return;
    }
    setPhone(`${dial} ${digits}`);
    router.push("/verify-otp");
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
        <Button type="submit" size="lg" className="w-full">
          Send code <ArrowRight />
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          One account per mobile number. By continuing you agree to our Terms and Privacy Policy.
        </p>
      </form>
      <div className="mt-10 border-t border-border pt-6">
        <DemoButtons />
      </div>
    </>
  );
}
