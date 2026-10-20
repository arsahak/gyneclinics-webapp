import { AppShell } from "@/component/layout/app-shell";

export default function PatientLayout({ children }: LayoutProps<"/patient">) {
  return <AppShell role="patient">{children}</AppShell>;
}
