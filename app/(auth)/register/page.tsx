import type { Metadata } from "next";
import { RoleSelect } from "@/component/auth/role-select";

export const metadata: Metadata = { title: "Choose your account type" };

export default function RegisterPage() {
  return <RoleSelect />;
}
