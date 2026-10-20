import type { Metadata } from "next";
import { LoginForm } from "@/component/auth/login-form";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return <LoginForm />;
}
