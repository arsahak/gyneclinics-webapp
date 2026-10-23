import type { Metadata } from "next";
import { LoginForm } from "@/component/auth/login-form";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Sign in",
  description: "Sign in to GyneX with your mobile number. We'll text you a one-time code, so there's no password to remember.",
  path: "/login",
});

export default function LoginPage() {
  return <LoginForm />;
}
